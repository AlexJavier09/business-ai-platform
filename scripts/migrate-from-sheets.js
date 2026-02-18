/**
 * Script de Migración: Google Sheets → Supabase
 * 
 * Este script toma tus datos del Excel de Google Sheets
 * y los migra a la tabla 'items' en Supabase.
 * 
 * USO:
 * 1. Configura tus credenciales en .env
 * 2. Descarga tu Google Sheet como CSV
 * 3. Ejecuta: node scripts/migrate-from-sheets.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const TENANT_ID = 'roar-pulseras';

/**
 * Datos de ejemplo basados en tu Excel
 * REEMPLAZA ESTO con la lectura real de tu CSV o conecta con Google Sheets API
 */
const datosExcel = [
  {
    codigo: 'H001',
    piedra: 'Cuarzo Rosa',
    formato: 'Bolitas',
    cuerda: 'Cuerda',
    stock: 10,
    stock_minimo: 3,
    precio: 45000
  },
  {
    codigo: 'H002',
    piedra: 'Cuarzo Rosa',
    formato: 'Bolitas',
    cuerda: 'elástico',
    stock: 7,
    stock_minimo: 3,
    precio: 45000
  },
  {
    codigo: 'H003',
    piedra: 'Cuarzo Rosa',
    formato: 'chips',
    cuerda: 'elástico',
    stock: 7,
    stock_minimo: 3,
    precio: 42000
  },
  {
    codigo: 'H004',
    piedra: 'Turmalina',
    formato: 'Bolitas',
    cuerda: 'Cuerda',
    stock: 4,
    stock_minimo: 3,
    precio: 55000
  },
  {
    codigo: 'H005',
    piedra: 'Turmalina',
    formato: 'Bolitas',
    cuerda: 'elástico',
    stock: 8,
    stock_minimo: 3,
    precio: 55000
  },
  {
    codigo: 'H006',
    piedra: 'Turmalina',
    formato: 'chips',
    cuerda: 'elástico',
    stock: 8,
    stock_minimo: 3,
    precio: 50000
  },
  {
    codigo: 'H007',
    piedra: 'Fluorita',
    formato: 'Bolitas',
    cuerda: 'Cuerda',
    stock: 3,
    stock_minimo: 3,
    precio: 48000
  }
];

async function migrarDatos() {
  console.log('🚀 Iniciando migración de datos...\n');

  try {
    // 1. Obtener ID del tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('tenant_id', TENANT_ID)
      .single();

    if (tenantError || !tenant) {
      console.error('❌ Error: Tenant no encontrado. Ejecuta primero el schema SQL.');
      return;
    }

    console.log(`✅ Tenant encontrado: ${tenant.id}\n`);

    // 2. Transformar datos al formato de Supabase
    const itemsParaInsertar = datosExcel.map(item => ({
      tenant_id: tenant.id,
      code: item.codigo,
      data: {
        piedra: item.piedra,
        formato: item.formato,
        cuerda: item.cuerda,
        stock_minimo: item.stock_minimo,
        precio: item.precio
      },
      stock: item.stock,
      active: true
    }));

    console.log(`📦 Preparando ${itemsParaInsertar.length} items para migrar...\n`);

    // 3. Insertar items (upsert por si ya existen)
    let insertados = 0;
    let actualizados = 0;

    for (const item of itemsParaInsertar) {
      const { data, error } = await supabase
        .from('items')
        .upsert(item, {
          onConflict: 'tenant_id,code',
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        console.error(`❌ Error insertando ${item.code}:`, error.message);
      } else {
        if (data && data.length > 0) {
          console.log(`✅ ${item.code}: ${item.data.piedra} ${item.data.formato} (Stock: ${item.stock})`);
          insertados++;
        } else {
          console.log(`🔄 ${item.code}: Actualizado`);
          actualizados++;
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Migración completada!`);
    console.log(`   Insertados: ${insertados}`);
    console.log(`   Actualizados: ${actualizados}`);
    console.log('='.repeat(50) + '\n');

    // 4. Verificar datos migrados
    const { data: items, error: selectError } = await supabase
      .from('items')
      .select('code, data, stock')
      .eq('tenant_id', tenant.id);

    if (!selectError && items) {
      console.log(`📊 Total de productos en base de datos: ${items.length}\n`);
    }

  } catch (error) {
    console.error('❌ Error fatal:', error);
  }
}

// Ejecutar migración
if (require.main === module) {
  migrarDatos();
}

module.exports = { migrarDatos };

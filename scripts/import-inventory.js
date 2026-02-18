/**
 * Script para importar inventario inicial a Supabase
 * Uso: node scripts/import-inventory.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_SERVICE_KEY son requeridos en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Datos del inventario desde el Excel
const inventoryData = [
  // Cuarzo Rosa
  { code: 'H001', piedra: 'Cuarzo Rosa', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 10, javier: 11 },
  { code: 'H002', piedra: 'Cuarzo Rosa', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 7, javier: 4 },
  { code: 'H003', piedra: 'Cuarzo Rosa', formato: 'chips', cuerda: 'elástico', cantidad_D: 7, javier: 4 },
  
  // Turmalina
  { code: 'H004', piedra: 'Turmalina', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 4, javier: 1 },
  { code: 'H005', piedra: 'Turmalina', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 8, javier: 6 },
  { code: 'H006', piedra: 'Turmalina', formato: 'chips', cuerda: 'elástico', cantidad_D: 8, javier: 6 },
  
  // Fluorita
  { code: 'H007', piedra: 'Fluorita', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 3 },
  
  // Amatista
  { code: 'H008', piedra: 'Amatista', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 13, javier: 11 },
  { code: 'H009', piedra: 'Amatista', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 11, javier: 1 },
  { code: 'H010', piedra: 'Amatista', formato: 'chips', cuerda: 'elástico', cantidad_D: 10, javier: 1 },
  
  // Ojo de Tigre
  { code: 'H011', piedra: 'Ojo de Tigre', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 25, javier: 11 },
  { code: 'H012', piedra: 'Ojo de Tigre', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 4, javier: 4 },
  { code: 'H013', piedra: 'Ojo de Tigre', formato: 'chips', cuerda: 'elástico', cantidad_D: 6, javier: 4 },
  
  // Aventurina Verde
  { code: 'H014', piedra: 'Aventurina Verde', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 19, javier: 11 },
  { code: 'H015', piedra: 'Aventurina Verde', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 7, javier: 4 },
  { code: 'H016', piedra: 'Aventurina Verde', formato: 'chips', cuerda: 'elástico', cantidad_D: 7, javier: 4 },
  
  // Cuarzo fresa
  { code: 'H017', piedra: 'Cuarzo fresa', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 2 },
  { code: 'H018', piedra: 'Cuarzo fresa', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 8, javier: 6 },
  { code: 'H019', piedra: 'Cuarzo fresa', formato: 'chips', cuerda: 'elástico', cantidad_D: 8, javier: 6 },
  
  // Lapis Lazuli
  { code: 'H020', piedra: 'Lapis Lazuli', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 2 },
  { code: 'H021', piedra: 'Lapis Lazuli', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 3, javier: 4 },
  { code: 'H022', piedra: 'Lapis Lazuli', formato: 'chips', cuerda: 'elástico', cantidad_D: 2, javier: 1 },
  
  // hematita
  { code: 'H023', piedra: 'hematita', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 1 },
  
  // Turquesa Blanca
  { code: 'H024', piedra: 'Turquesa Blanca', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 5 },
  { code: 'H025', piedra: 'Turquesa Blanca', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 7, javier: 6 },
  { code: 'H026', piedra: 'Turquesa Blanca', formato: 'chips', cuerda: 'elástico', cantidad_D: 9, javier: 6 },
  
  // Piedra Solar
  { code: 'H027', piedra: 'Piedra Solar', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 4 },
  { code: 'H028', piedra: 'Piedra Solar', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 9, javier: 4 },
  { code: 'H029', piedra: 'Piedra Solar', formato: 'chips', cuerda: 'elástico', cantidad_D: 9, javier: 4 },
  
  // Obsidiana
  { code: 'H030', piedra: 'Obsidiana', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 31, javier: 11 },
  { code: 'H031', piedra: 'Obsidiana', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 5, javier: 4 },
  { code: 'H032', piedra: 'Obsidiana', formato: 'chips', cuerda: 'elástico', cantidad_D: 4, javier: 4 },
  
  // Labradorita
  { code: 'H033', piedra: 'Labradorita', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 3, javier: 1 },
  { code: 'H034', piedra: 'Labradorita', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 8, javier: 5 },
  { code: 'H035', piedra: 'Labradorita', formato: 'chips', cuerda: 'elástico', cantidad_D: 7, javier: 5 },
  
  // Amazonita
  { code: 'H036', piedra: 'Amazonita', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 3 },
  { code: 'H037', piedra: 'Amazonita', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 9, javier: 5 },
  { code: 'H038', piedra: 'Amazonita', formato: 'chips', cuerda: 'elástico', cantidad_D: 9, javier: 5 },
  
  // Soladita
  { code: 'H039', piedra: 'Soladita', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 2 },
  
  // Roca Lava
  { code: 'H040', piedra: 'Roca Lava', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 2 },
  
  // Carnelina
  { code: 'H041', piedra: 'Carnelina', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 1 },
  
  // Prehnite
  { code: 'H042', piedra: 'Prehnite', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 1 },
  
  // Garnete
  { code: 'H043', piedra: 'Garnete', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 1 },
  
  // Apatite
  { code: 'H044', piedra: 'Apatite', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 4 },
  
  // Citrine
  { code: 'H045', piedra: 'Citrine', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 22, javier: 11 },
  
  // Cuarzo Aumado
  { code: 'H046', piedra: 'Cuarzo Aumado', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 1 },
  
  // Cuarzo claro
  { code: 'H047', piedra: 'Cuarzo claro', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 1 }
];

async function importInventory() {
  try {
    console.log('🔍 Buscando tenant roar-pulseras...');
    
    // Obtener el UUID del tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('tenant_id', 'roar-pulseras')
      .single();
    
    if (tenantError || !tenant) {
      console.error('❌ Tenant roar-pulseras no encontrado:', tenantError);
      console.log('💡 Asegúrate de haber ejecutado primero el schema principal (00-core-schema.sql)');
      process.exit(1);
    }
    
    console.log(`✅ Tenant encontrado: ${tenant.id}`);
    console.log(`\n📦 Importando ${inventoryData.length} productos...`);
    
    let imported = 0;
    let updated = 0;
    let errors = 0;
    
    for (const item of inventoryData) {
      const { code, piedra, formato, cuerda, cantidad_D, javier } = item;
      
      // Verificar si el producto ya existe
      const { data: existing } = await supabase
        .from('items')
        .select('id')
        .eq('tenant_id', tenant.id)
        .eq('code', code)
        .single();
      
      const itemData = {
        tenant_id: tenant.id,
        code: code,
        data: {
          piedra,
          formato,
          cuerda,
          cantidad_D,
          javier: javier || null,
          merma: null
        },
        stock: cantidad_D,
        active: true
      };
      
      if (existing) {
        // Actualizar
        const { error } = await supabase
          .from('items')
          .update(itemData)
          .eq('id', existing.id);
        
        if (error) {
          console.error(`❌ Error actualizando ${code}:`, error.message);
          errors++;
        } else {
          updated++;
          process.stdout.write('.');
        }
      } else {
        // Insertar
        const { error } = await supabase
          .from('items')
          .insert(itemData);
        
        if (error) {
          console.error(`❌ Error insertando ${code}:`, error.message);
          errors++;
        } else {
          imported++;
          process.stdout.write('+');
        }
      }
    }
    
    console.log('\n\n✅ Importación completada:');
    console.log(`   • ${imported} productos nuevos`);
    console.log(`   • ${updated} productos actualizados`);
    if (errors > 0) {
      console.log(`   • ${errors} errores`);
    }
    
    // Mostrar resumen de stock
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('code, data, stock')
      .eq('tenant_id', tenant.id)
      .order('code');
    
    if (!itemsError && items) {
      console.log(`\n📊 Total de productos en inventario: ${items.length}`);
      const totalStock = items.reduce((sum, item) => sum + item.stock, 0);
      console.log(`📦 Stock total: ${totalStock} unidades`);
      
      // Productos con stock bajo (< 3)
      const lowStock = items.filter(item => item.stock < 3);
      if (lowStock.length > 0) {
        console.log(`\n⚠️  Productos con stock bajo (< 3):`);
        lowStock.forEach(item => {
          console.log(`   • ${item.code}: ${item.data.piedra} ${item.data.formato} - ${item.stock} unidades`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error en la importación:', error);
    process.exit(1);
  }
}

// Ejecutar importación
importInventory();

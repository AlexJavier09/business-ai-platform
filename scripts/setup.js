/**
 * Script de Setup Completo - Business AI Platform
 * Ejecuta el schema de base de datos e importa el inventario
 * 
 * Uso: node scripts/setup.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: SUPABASE_URL y SUPABASE_SERVICE_KEY son requeridos en .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Iniciando setup de Business AI Platform...\n');
console.log(`📡 Conectando a: ${supabaseUrl}\n`);

async function executeSQL(filePath) {
    console.log(`📄 Leyendo ${path.basename(filePath)}...`);
    const sql = fs.readFileSync(filePath, 'utf8');

    // Nota: Supabase JS no permite ejecutar SQL directo por seguridad
    // Necesitamos usar la REST API o conexión PostgreSQL directa
    console.log('⚠️  Por favor ejecuta manualmente el SQL en Supabase Studio:');
    console.log(`   ${filePath}`);
    console.log('   O usa: psql -h [host] -U postgres < ${filePath}\n');
}

// Datos del inventario
const inventoryData = [
    { code: 'H001', piedra: 'Cuarzo Rosa', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 10, javier: 11 },
    { code: 'H002', piedra: 'Cuarzo Rosa', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 7, javier: 4 },
    { code: 'H003', piedra: 'Cuarzo Rosa', formato: 'chips', cuerda: 'elástico', cantidad_D: 7, javier: 4 },
    { code: 'H004', piedra: 'Turmalina', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 4, javier: 1 },
    { code: 'H005', piedra: 'Turmalina', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 8, javier: 6 },
    { code: 'H006', piedra: 'Turmalina', formato: 'chips', cuerda: 'elástico', cantidad_D: 8, javier: 6 },
    { code: 'H007', piedra: 'Fluorita', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 3 },
    { code: 'H008', piedra: 'Amatista', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 13, javier: 11 },
    { code: 'H009', piedra: 'Amatista', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 11, javier: 1 },
    { code: 'H010', piedra: 'Amatista', formato: 'chips', cuerda: 'elástico', cantidad_D: 10, javier: 1 },
    { code: 'H011', piedra: 'Ojo de Tigre', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 25, javier: 11 },
    { code: 'H012', piedra: 'Ojo de Tigre', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 4, javier: 4 },
    { code: 'H013', piedra: 'Ojo de Tigre', formato: 'chips', cuerda: 'elástico', cantidad_D: 6, javier: 4 },
    { code: 'H014', piedra: 'Aventurina Verde', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 19, javier: 11 },
    { code: 'H015', piedra: 'Aventurina Verde', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 7, javier: 4 },
    { code: 'H016', piedra: 'Aventurina Verde', formato: 'chips', cuerda: 'elástico', cantidad_D: 7, javier: 4 },
    { code: 'H017', piedra: 'Cuarzo fresa', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 2 },
    { code: 'H018', piedra: 'Cuarzo fresa', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 8, javier: 6 },
    { code: 'H019', piedra: 'Cuarzo fresa', formato: 'chips', cuerda: 'elástico', cantidad_D: 8, javier: 6 },
    { code: 'H020', piedra: 'Lapis Lazuli', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 2 },
    { code: 'H021', piedra: 'Lapis Lazuli', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 3, javier: 4 },
    { code: 'H022', piedra: 'Lapis Lazuli', formato: 'chips', cuerda: 'elástico', cantidad_D: 2, javier: 1 },
    { code: 'H023', piedra: 'hematita', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 1 },
    { code: 'H024', piedra: 'Turquesa Blanca', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 5 },
    { code: 'H025', piedra: 'Turquesa Blanca', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 7, javier: 6 },
    { code: 'H026', piedra: 'Turquesa Blanca', formato: 'chips', cuerda: 'elástico', cantidad_D: 9, javier: 6 },
    { code: 'H027', piedra: 'Piedra Solar', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 4 },
    { code: 'H028', piedra: 'Piedra Solar', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 9, javier: 4 },
    { code: 'H029', piedra: 'Piedra Solar', formato: 'chips', cuerda: 'elástico', cantidad_D: 9, javier: 4 },
    { code: 'H030', piedra: 'Obsidiana', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 31, javier: 11 },
    { code: 'H031', piedra: 'Obsidiana', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 5, javier: 4 },
    { code: 'H032', piedra: 'Obsidiana', formato: 'chips', cuerda: 'elástico', cantidad_D: 4, javier: 4 },
    { code: 'H033', piedra: 'Labradorita', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 3, javier: 1 },
    { code: 'H034', piedra: 'Labradorita', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 8, javier: 5 },
    { code: 'H035', piedra: 'Labradorita', formato: 'chips', cuerda: 'elástico', cantidad_D: 7, javier: 5 },
    { code: 'H036', piedra: 'Amazonita', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 3 },
    { code: 'H037', piedra: 'Amazonita', formato: 'Bolitas', cuerda: 'elástico', cantidad_D: 9, javier: 5 },
    { code: 'H038', piedra: 'Amazonita', formato: 'chips', cuerda: 'elástico', cantidad_D: 9, javier: 5 },
    { code: 'H039', piedra: 'Soladita', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 2 },
    { code: 'H040', piedra: 'Roca Lava', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 2 },
    { code: 'H041', piedra: 'Carnelina', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 1 },
    { code: 'H042', piedra: 'Prehnite', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 1 },
    { code: 'H043', piedra: 'Garnete', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 1 },
    { code: 'H044', piedra: 'Apatite', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 4 },
    { code: 'H045', piedra: 'Citrine', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 22, javier: 11 },
    { code: 'H046', piedra: 'Cuarzo Aumado', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 1 },
    { code: 'H047', piedra: 'Cuarzo claro', formato: 'Bolitas', cuerda: 'Cuerda', cantidad_D: 1 }
];

async function checkTables() {
    console.log('🔍 Verificando tablas...');

    // Intentar consultar la tabla tenants
    const { data, error } = await supabase
        .from('tenants')
        .select('count')
        .limit(1);

    if (error) {
        if (error.code === '42P01') { // Table doesn't exist
            console.log('❌ La tabla "tenants" no existe.');
            console.log('\n📋 PASOS A SEGUIR:');
            console.log('1. Abre Supabase Studio en tu navegador');
            console.log('2. Ve a SQL Editor');
            console.log('3. Copia y pega el contenido de: core/database/00-core-schema.sql');
            console.log('4. Ejecuta el SQL');
            console.log('5. Vuelve a ejecutar este script\n');
            return false;
        }
        console.log('❌ Error al verificar tablas:', error.message);
        return false;
    }

    console.log('✅ Tablas encontradas\n');
    return true;
}

async function importInventory() {
    console.log('🔍 Buscando tenant roar-pulseras...');

    const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id')
        .eq('tenant_id', 'roar-pulseras')
        .single();

    if (tenantError || !tenant) {
        console.error('❌ Tenant roar-pulseras no encontrado');
        console.log('💡 El schema SQL debería haberlo creado automáticamente');
        return false;
    }

    console.log(`✅ Tenant encontrado: ${tenant.id}`);
    console.log(`\n📦 Importando ${inventoryData.length} productos...`);

    let imported = 0;
    let updated = 0;
    let errors = 0;

    for (const item of inventoryData) {
        const { code, piedra, formato, cuerda, cantidad_D, javier } = item;

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
            const { error } = await supabase
                .from('items')
                .update(itemData)
                .eq('id', existing.id);

            if (error) {
                console.error(`❌ ${code}:`, error.message);
                errors++;
            } else {
                updated++;
                process.stdout.write('u');
            }
        } else {
            const { error } = await supabase
                .from('items')
                .insert(itemData);

            if (error) {
                console.error(`❌ ${code}:`, error.message);
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

    // Mostrar resumen
    const { data: items } = await supabase
        .from('items')
        .select('code, data, stock')
        .eq('tenant_id', tenant.id)
        .order('code');

    if (items) {
        console.log(`\n📊 Total de productos: ${items.length}`);
        const totalStock = items.reduce((sum, item) => sum + item.stock, 0);
        console.log(`📦 Stock total: ${totalStock} unidades`);

        const lowStock = items.filter(item => item.stock < 3);
        if (lowStock.length > 0) {
            console.log(`\n⚠️  Productos con stock bajo (< 3): ${lowStock.length}`);
            lowStock.forEach(item => {
                console.log(`   • ${item.code}: ${item.data.piedra} ${item.data.formato} - ${item.stock} unidades`);
            });
        }
    }

    return true;
}

async function main() {
    const tablesExist = await checkTables();

    if (!tablesExist) {
        console.log('\n❌ Setup incompleto. Sigue los pasos arriba.');
        process.exit(1);
    }

    const success = await importInventory();

    if (success) {
        console.log('\n🎉 Setup completado exitosamente!');
        console.log('\n📝 Próximos pasos:');
        console.log('   1. Verifica los datos en Supabase Studio');
        console.log('   2. Configura N8N workflows');
        console.log('   3. Despliega en EasyPanel\n');
    }
}

main();

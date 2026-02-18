-- ============================================
-- DATOS DE PRUEBA PARA EL DASHBOARD
-- ============================================

-- Verificar que existe el tenant
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM tenants WHERE tenant_id = 'roar-pulseras') THEN
    RAISE EXCEPTION 'Tenant roar-pulseras no existe. Ejecuta primero el schema completo (00-core-schema.sql)';
  END IF;
END $$;

-- Desactivar RLS temporalmente para insertar datos
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;

-- Limpiar datos existentes (opcional)
DELETE FROM movements;
DELETE FROM alerts;
DELETE FROM orders;
DELETE FROM items;

-- Insertar productos de prueba
INSERT INTO items (tenant_id, code, data, stock, active) VALUES
-- Cuarzo Rosa
((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 'H001',
 '{"piedra": "Cuarzo Rosa", "formato": "Bolitas", "cuerda": "Cuerda", "stock_minimo": 3, "precio": 45000}'::jsonb,
 10,
 true),
 
((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 'H002',
 '{"piedra": "Cuarzo Rosa", "formato": "Bolitas", "cuerda": "elástico", "stock_minimo": 3, "precio": 45000}'::jsonb,
 7,
 true),

((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 'H003',
 '{"piedra": "Cuarzo Rosa", "formato": "chips", "cuerda": "elástico", "stock_minimo": 3, "precio": 42000}'::jsonb,
 7,
 true),

-- Turmalina
((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 'H004',
 '{"piedra": "Turmalina", "formato": "Bolitas", "cuerda": "Cuerda", "stock_minimo": 3, "precio": 55000}'::jsonb,
 4,
 true),

((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 'H005',
 '{"piedra": "Turmalina", "formato": "Bolitas", "cuerda": "elástico", "stock_minimo": 3, "precio": 55000}'::jsonb,
 8,
 true),

((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 'H006',
 '{"piedra": "Turmalina", "formato": "chips", "cuerda": "elástico", "stock_minimo": 3, "precio": 50000}'::jsonb,
 2,  -- Stock bajo, generará alerta
 true),

-- Fluorita
((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 'H007',
 '{"piedra": "Fluorita", "formato": "Bolitas", "cuerda": "Cuerda", "stock_minimo": 3, "precio": 48000}'::jsonb,
 2,  -- Stock bajo, generará alerta
 true),

-- Amatista
((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 'H008',
 '{"piedra": "Amatista", "formato": "Bolitas", "cuerda": "elástico", "stock_minimo": 3, "precio": 50000}'::jsonb,
 12,
 true),

-- Ojo de Tigre
((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 'H009',
 '{"piedra": "Ojo de Tigre", "formato": "chips", "cuerda": "Cuerda", "stock_minimo": 3, "precio": 52000}'::jsonb,
 5,
 true),

-- Jaspe
((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 'H010',
 '{"piedra": "Jaspe Rojo", "formato": "Bolitas", "cuerda": "elástico", "stock_minimo": 3, "precio": 48000}'::jsonb,
 6,
 true);

-- Insertar pedidos de prueba
INSERT INTO orders (tenant_id, item_id, order_number, customer_data, status, total_amount) VALUES
((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 (SELECT id FROM items WHERE code = 'H001' LIMIT 1),
 'ORD-2026-001',
 '{"nombre": "María García", "email": "maria@example.com", "celular": "+57 300 123 4567"}'::jsonb,
 'completed',
 45000),

((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 (SELECT id FROM items WHERE code = 'H004' LIMIT 1),
 'ORD-2026-002',
 '{"nombre": "Carlos López", "email": "carlos@example.com", "celular": "+57 310 987 6543"}'::jsonb,
 'pending',
 55000),

((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 (SELECT id FROM items WHERE code = 'H008' LIMIT 1),
 'ORD-2026-003',
 '{"nombre": "Ana Martínez", "email": "ana@example.com", "celular": "+57 320 456 7890"}'::jsonb,
 'completed',
 50000),

((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 (SELECT id FROM items WHERE code = 'H002' LIMIT 1),
 'ORD-2026-004',
 '{"nombre": "Luis Hernández", "celular": "+57 311 222 3333"}'::jsonb,
 'pending',
 45000);

-- Insertar movimientos (ventas)
INSERT INTO movements (tenant_id, item_id, order_id, type, quantity, previous_stock, new_stock, notes) VALUES
((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 (SELECT id FROM items WHERE code = 'H001' LIMIT 1),
 (SELECT id FROM orders WHERE order_number = 'ORD-2026-001' LIMIT 1),
 'sale',
 -1,
 11,
 10,
 'Venta completada'),

((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 (SELECT id FROM items WHERE code = 'H008' LIMIT 1),
 (SELECT id FROM orders WHERE order_number = 'ORD-2026-003' LIMIT 1),
 'sale',
 -1,
 13,
 12,
 'Venta completada');

-- Generar alertas automáticas para productos con stock bajo
INSERT INTO alerts (tenant_id, item_id, type, severity, message)
SELECT 
  i.tenant_id,
  i.id,
  'stock_low',
  'warning',
  CONCAT('Stock bajo: ', i.data->>'piedra', ' ', i.data->>'formato', ' - Quedan ', i.stock, ' unidades (mínimo: ', (i.data->>'stock_minimo')::int, ')')
FROM items i
WHERE i.stock < COALESCE((i.data->>'stock_minimo')::int, 3)
  AND i.active = true
  AND i.tenant_id = (SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras');

-- Permitir lectura pública (para el dashboard)
CREATE POLICY IF NOT EXISTS "Allow public read on items" ON items
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read on orders" ON orders
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read on movements" ON movements
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read on alerts" ON alerts
  FOR SELECT USING (true);

-- Reactivar RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Verificar datos insertados
SELECT 'Items insertados:' as mensaje, COUNT(*) as total FROM items;
SELECT 'Pedidos insertados:' as mensaje, COUNT(*) as total FROM orders;
SELECT 'Alertas generadas:' as mensaje, COUNT(*) as total FROM alerts WHERE resolved = false;

-- Listo!
SELECT '✅ Datos de prueba insertados correctamente' as status;

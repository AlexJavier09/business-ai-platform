-- ============================================
-- PEDIDOS DE PRUEBA CON DIFERENTES ESTADOS
-- ============================================

-- Insertar pedidos con estados: pending, completed, cancelled
INSERT INTO orders (tenant_id, item_id, order_number, customer_data, status, total_amount, notes) VALUES

-- PEDIDOS PENDIENTES (5)
((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 (SELECT id FROM items WHERE code = 'H001' LIMIT 1),
 'ORD-2026-101',
 '{"nombre": "María González", "email": "maria.g@example.com", "celular": "+57 300 123 4567", "direccion": "Calle 45 #12-34, Bogotá"}'::jsonb,
 'pending',
 45000,
 'Cliente solicitó envío urgente'),

((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 (SELECT id FROM items WHERE code = 'H004' LIMIT 1),
 'ORD-2026-102',
 '{"nombre": "Carlos Martínez", "email": "carlos.m@example.com", "celular": "+57 310 987 6543"}'::jsonb,
 'pending',
 55000,
 NULL),

((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 (SELECT id FROM items WHERE code = 'H008' LIMIT 1),
 'ORD-2026-103',
 '{"nombre": "Ana López", "celular": "+57 320 456 7890", "instagram": "@analopez"}'::jsonb,
 'pending',
 50000,
 'Contactar por Instagram para confirmar dirección'),

((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 (SELECT id FROM items WHERE code = 'H005' LIMIT 1),
 'ORD-2026-104',
 '{"nombre": "Luis Hernández", "email": "luis.h@gmail.com", "celular": "+57 311 222 3333"}'::jsonb,
 'pending',
 55000,
 NULL),

((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 (SELECT id FROM items WHERE code = 'H002' LIMIT 1),
 'ORD-2026-105',
 '{"nombre": "Sofía Rodríguez", "email": "sofia.r@example.com", "celular": "+57 315 888 9999", "direccion": "Cr 7 #85-12, Bogotá"}'::jsonb,
 'pending',
 45000,
 'Pago pendiente de confirmar'),

-- PEDIDOS COMPLETADOS (6)
((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 (SELECT id FROM items WHERE code = 'H003' LIMIT 1),
 'ORD-2026-201',
 '{"nombre": "Patricia Gómez", "email": "patricia@example.com", "celular": "+57 301 111 2222"}'::jsonb,
 'completed',
 42000,
 'Entregado el 15 de febrero'),

((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 (SELECT id FROM items WHERE code = 'H006' LIMIT 1),
 'ORD-2026-202',
 '{"nombre": "Roberto Silva", "email": "roberto.s@example.com", "celular": "+57 312 333 4444"}'::jsonb,
 'completed',
 50000,
 'Cliente muy satisfecho'),

((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 (SELECT id FROM items WHERE code = 'H007' LIMIT 1),
 'ORD-2026-203',
 '{"nombre": "Diana Torres", "celular": "+57 313 555 6666"}'::jsonb,
 'completed',
 48000,
 'Entregado en persona'),

((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 (SELECT id FROM items WHERE code = 'H009' LIMIT 1),
 'ORD-2026-204',
 '{"nombre": "Javier Mora", "email": "javier@example.com", "celular": "+57 314 777 8888"}'::jsonb,
 'completed',
 52000,
 NULL),

((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 (SELECT id FROM items WHERE code = 'H010' LIMIT 1),
 'ORD-2026-205',
 '{"nombre": "Camila Ruiz", "email": "camila.r@example.com", "celular": "+57 316 999 0000"}'::jsonb,
 'completed',
 48000,
 'Pago recibido por Nequi'),

((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 (SELECT id FROM items WHERE code = 'H001' LIMIT 1),
 'ORD-2026-206',
 '{"nombre": "Andrés Castro", "celular": "+57 317 123 4567", "direccion": "Av. 19 #100-50"}'::jsonb,
 'completed',
 45000,
 'Entrega programada completada'),

-- PEDIDOS CANCELADOS (3)
((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 (SELECT id FROM items WHERE code = 'H004' LIMIT 1),
 'ORD-2026-301',
 '{"nombre": "Laura Jiménez", "email": "laura@example.com", "celular": "+57 318 234 5678"}'::jsonb,
 'cancelled',
 55000,
 'Cliente canceló - no contestó llamadas'),

((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 (SELECT id FROM items WHERE code = 'H008' LIMIT 1),
 'ORD-2026-302',
 '{"nombre": "Miguel Vargas", "celular": "+57 319 345 6789"}'::jsonb,
 'cancelled',
 50000,
 'Pedido duplicado'),

((SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras'),
 (SELECT id FROM items WHERE code = 'H002' LIMIT 1),
 'ORD-2026-303',
 '{"nombre": "Valentina Pérez", "email": "vale@example.com", "celular": "+57 320 456 7890"}'::jsonb,
 'cancelled',
 45000,
 'Cliente no tenía dinero suficiente');

-- Verificar pedidos insertados
SELECT 
  status,
  COUNT(*) as total
FROM orders
GROUP BY status
ORDER BY status;

SELECT '✅ Pedidos de prueba insertados correctamente' as mensaje,
       '5 Pendientes, 6 Completados, 3 Cancelados' as detalle;

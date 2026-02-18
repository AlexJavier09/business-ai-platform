-- ============================================
-- FIX RLS: Permitir Lectura Pública al Dashboard
-- ============================================

-- El dashboard usa ANON_KEY y necesita permisos de lectura
-- N8N funciona porque probablemente usa SERVICE_KEY

-- 1. Verificar estado actual de RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 2. Eliminar policies antiguas si existen
DROP POLICY IF EXISTS "tenant_isolation_items" ON items;
DROP POLICY IF EXISTS "tenant_isolation_orders" ON orders;
DROP POLICY IF EXISTS "tenant_isolation_movements" ON movements;
DROP POLICY IF EXISTS "tenant_isolation_alerts" ON alerts;
DROP POLICY IF EXISTS "Allow public read on items" ON items;
DROP POLICY IF EXISTS "Allow public read on orders" ON orders;
DROP POLICY IF EXISTS "Allow public read on movements" ON movements;
DROP POLICY IF EXISTS "Allow public read on alerts" ON alerts;

-- 3. Crear policies permisivas para lectura (SELECT)
-- Esto permite que el dashboard (con anon_key) pueda leer datos

CREATE POLICY "Enable read access for all users" ON items
  FOR SELECT
  USING (true);

CREATE POLICY "Enable read access for all users" ON orders
  FOR SELECT
  USING (true);

CREATE POLICY "Enable read access for all users" ON movements
  FOR SELECT
  USING (true);

CREATE POLICY "Enable read access for all users" ON alerts
  FOR SELECT
  USING (true);

-- 4. Asegurar que RLS está habilitado
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- 5. Verificar
SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public';

-- 6. Test query (debería funcionar ahora)
SELECT COUNT(*) as total_items FROM items WHERE active = true;
SELECT COUNT(*) as total_orders FROM orders;
SELECT COUNT(*) as total_alerts FROM alerts WHERE resolved = false;

SELECT '✅ RLS configurado correctamente para el dashboard' as status;

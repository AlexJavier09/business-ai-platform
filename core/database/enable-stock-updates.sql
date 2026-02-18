-- Permitir UPDATE de stock en la tabla items
-- Esto permite que el dashboard pueda actualizar stock con anon_key

CREATE POLICY "Enable stock updates for all users" ON items
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Verificar policies
SELECT tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'items';

SELECT '✅ Políticas de UPDATE configuradas para items' as status;

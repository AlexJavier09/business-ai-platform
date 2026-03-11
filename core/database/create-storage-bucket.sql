-- ============================================================
-- Crear bucket item-images en Supabase Storage
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Crear el bucket (si no existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política: lectura pública (para mostrar imágenes)
CREATE POLICY "Public read item-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'item-images');

-- 3. Política: escritura para usuarios autenticados
CREATE POLICY "Auth upload item-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'item-images' AND auth.role() = 'authenticated');

-- 4. Política: actualización para usuarios autenticados (upsert)
CREATE POLICY "Auth update item-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'item-images' AND auth.role() = 'authenticated');

-- Verificar
SELECT * FROM storage.buckets WHERE id = 'item-images';

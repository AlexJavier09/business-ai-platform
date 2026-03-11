-- ============================================
-- FIX SUPABASE SECURITY ADVISOR ERRORS
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- ── 1. RLS en tabla tenants ─────────────────
-- La tabla tenants NO necesita ser accesible desde el cliente
-- Solo el service_role debe poder leerla
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Política: solo service_role puede leer (el dashboard usa service_role key)
CREATE POLICY "tenants_service_only" ON public.tenants
  FOR ALL USING (false);  -- bloquea acceso anon/authenticated por defecto

-- ── 2. RLS en n8n_chat_histories ────────────
ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "n8n_chat_no_public_access" ON public.n8n_chat_histories
  FOR ALL USING (false);

-- ── 3. RLS en detector_lenguaje ─────────────
ALTER TABLE public.detector_lenguaje ENABLE ROW LEVEL SECURITY;

CREATE POLICY "detector_lenguaje_no_public_access" ON public.detector_lenguaje
  FOR ALL USING (false);

-- ── 4. Security Definer Views ───────────────
-- Las vistas items_stock_bajo y productos_mas_vendidos usan SECURITY DEFINER
-- Para arreglar: recrearlas sin SECURITY DEFINER (o forzar SECURITY INVOKER)
-- Ejecuta esto SOLO si las vistas existen:

-- ALTER VIEW public.items_stock_bajo SET (security_invoker = true);
-- ALTER VIEW public.productos_mas_vendidos SET (security_invoker = true);

-- NOTA: Si las vistas no te dejan con ALTER VIEW, 
-- recréalas añadiendo: WITH (security_invoker = true)
-- Ejemplo:
--   CREATE OR REPLACE VIEW items_stock_bajo
--   WITH (security_invoker = true) AS
--   SELECT ... FROM items WHERE stock <= 3;

-- ── Verificar que todo quedó bien ────────────
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

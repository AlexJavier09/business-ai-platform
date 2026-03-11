-- ============================================================
-- ACCOUNTING: tabla de entradas contables + trigger de ventas
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Tabla principal de contabilidad
CREATE TABLE IF NOT EXISTS public.accounting_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL DEFAULT 'otro',
    -- Para ingresos: 'venta'
    -- Para gastos: 'proveedor', 'envio', 'operativo', 'otro'
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    description TEXT,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_accounting_tenant ON public.accounting_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_accounting_type ON public.accounting_entries(type);
CREATE INDEX IF NOT EXISTS idx_accounting_date ON public.accounting_entries(date);
CREATE INDEX IF NOT EXISTS idx_accounting_order ON public.accounting_entries(order_id);

-- RLS
ALTER TABLE public.accounting_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "accounting_tenant_access" ON public.accounting_entries
    FOR ALL USING (true);

-- 2. Trigger: auto-registrar ingreso cuando se crea un pedido
CREATE OR REPLACE FUNCTION public.auto_register_sale_income()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo registrar si hay monto y no está cancelado
    IF NEW.total_amount > 0 AND NEW.status != 'cancelled' THEN
        INSERT INTO public.accounting_entries (
            tenant_id,
            type,
            category,
            amount,
            description,
            order_id,
            date
        ) VALUES (
            NEW.tenant_id,
            'income',
            'venta',
            NEW.total_amount,
            'Venta: ' || NEW.order_number || ' — ' || COALESCE(NEW.customer_data->>'nombre', 'Cliente'),
            NEW.id,
            CURRENT_DATE
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_sale_income ON public.orders;
CREATE TRIGGER trg_auto_sale_income
    AFTER INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_register_sale_income();

-- 3. Registrar ventas existentes que no tengan entrada contable aún
INSERT INTO public.accounting_entries (tenant_id, type, category, amount, description, order_id, date)
SELECT 
    o.tenant_id,
    'income',
    'venta',
    o.total_amount,
    'Venta: ' || o.order_number || ' — ' || COALESCE(o.customer_data->>'nombre', 'Cliente'),
    o.id,
    o.created_at::DATE
FROM public.orders o
WHERE o.total_amount > 0
  AND o.status != 'cancelled'
  AND NOT EXISTS (
    SELECT 1 FROM public.accounting_entries ae 
    WHERE ae.order_id = o.id
  );

-- 4. Vista resumen de contabilidad por tenant
CREATE OR REPLACE VIEW public.accounting_summary AS
SELECT
    tenant_id,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_ingresos,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_gastos,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS ganancia_neta,
    COUNT(CASE WHEN type = 'income' THEN 1 END) AS total_ventas,
    COUNT(CASE WHEN type = 'expense' THEN 1 END) AS total_gastos_count
FROM public.accounting_entries
GROUP BY tenant_id;

-- ============================================================
-- Verificar
SELECT * FROM public.accounting_entries LIMIT 5;
SELECT * FROM public.accounting_summary;

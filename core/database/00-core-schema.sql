-- ============================================
-- SCHEMA MULTI-TENANT PARA BUSINESS AI PLATFORM
-- Compatible con Supabase Self-Hosted
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLA: tenants (configuración de negocios)
-- ============================================

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL,
  config JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tenants_tenant_id ON tenants(tenant_id);
CREATE INDEX idx_tenants_type ON tenants(type);

-- ============================================
-- TABLA: items (productos/propiedades/etc genérico)
-- ============================================

CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, code)
);

CREATE INDEX idx_items_tenant ON items(tenant_id);
CREATE INDEX idx_items_code ON items(code);
CREATE INDEX idx_items_data ON items USING gin(data);
CREATE INDEX idx_items_stock ON items(stock);

-- ============================================
-- TABLA: orders (pedidos)
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  order_number VARCHAR(50) UNIQUE,
  customer_data JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_tenant ON orders(tenant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- ============================================
-- TABLA: movements (movimientos de inventario)
-- ============================================

CREATE TABLE IF NOT EXISTS movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- 'sale', 'restock', 'adjustment'
  quantity INTEGER NOT NULL,
  previous_stock INTEGER,
  new_stock INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_movements_tenant ON movements(tenant_id);
CREATE INDEX idx_movements_item ON movements(item_id);
CREATE INDEX idx_movements_type ON movements(type);
CREATE INDEX idx_movements_created ON movements(created_at DESC);

-- ============================================
-- TABLA: alerts (alertas del sistema)
-- ============================================

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'stock_low', 'out_of_stock', etc
  message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'warning', -- 'info', 'warning', 'critical'
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_alerts_tenant ON alerts(tenant_id);
CREATE INDEX idx_alerts_resolved ON alerts(resolved);
CREATE INDEX idx_alerts_severity ON alerts(severity);

-- ============================================
-- FUNCIÓN: Descontar stock automáticamente
-- ============================================

CREATE OR REPLACE FUNCTION descontar_stock(
  p_tenant_id UUID,
  p_code VARCHAR,
  p_cantidad INTEGER DEFAULT 1
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_item items%ROWTYPE;
  v_movement_id UUID;
BEGIN
  -- Buscar item y bloquear para actualización
  SELECT * INTO v_item
  FROM items
  WHERE tenant_id = p_tenant_id 
    AND code = p_code 
    AND active = true
  FOR UPDATE;
  
  -- Validar existencia
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Item no encontrado',
      'code', p_code
    );
  END IF;
  
  -- Validar stock disponible
  IF v_item.stock < p_cantidad THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Stock insuficiente',
      'available', v_item.stock,
      'requested', p_cantidad
    );
  END IF;
  
  -- Descontar stock
  UPDATE items 
  SET 
    stock = stock - p_cantidad,
    updated_at = NOW()
  WHERE id = v_item.id;
  
  -- Registrar movimiento
  INSERT INTO movements (tenant_id, item_id, type, quantity, previous_stock, new_stock)
  VALUES (
    p_tenant_id,
    v_item.id,
    'sale',
    -p_cantidad,
    v_item.stock,
    v_item.stock - p_cantidad
  )
  RETURNING id INTO v_movement_id;
  
  -- Verificar si stock quedó bajo
  PERFORM check_stock_alerts(v_item.id);
  
  RETURN json_build_object(
    'success', true,
    'previous_stock', v_item.stock,
    'new_stock', v_item.stock - p_cantidad,
    'movement_id', v_movement_id
  );
END;
$$;

-- ============================================
-- FUNCIÓN: Verificar alertas de stock
-- ============================================

CREATE OR REPLACE FUNCTION check_stock_alerts(p_item_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_item items%ROWTYPE;
  v_stock_min INTEGER;
  v_existing_alert UUID;
BEGIN
  -- Obtener item
  SELECT * INTO v_item
  FROM items
  WHERE id = p_item_id;
  
  -- Obtener stock mínimo desde config o data
  v_stock_min := COALESCE(
    (v_item.data->>'stock_minimo')::INTEGER,
    3
  );
  
  -- Verificar si hay alerta existente no resuelta
  SELECT id INTO v_existing_alert
  FROM alerts
  WHERE item_id = p_item_id
    AND type = 'stock_low'
    AND resolved = false;
  
  -- Si stock está bajo y no hay alerta
  IF v_item.stock < v_stock_min AND v_existing_alert IS NULL THEN
    INSERT INTO alerts (tenant_id, item_id, type, severity, message)
    VALUES (
      v_item.tenant_id,
      p_item_id,
      'stock_low',
      'warning',
      format(
        'Stock bajo: %s - Quedan %s unidades (mínimo: %s)',
        v_item.data->>'piedra',
        v_item.stock,
        v_stock_min
      )
    );
  END IF;
  
  -- Si stock está agotado
  IF v_item.stock = 0 THEN
    INSERT INTO alerts (tenant_id, item_id, type, severity, message)
    VALUES (
      v_item.tenant_id,
      p_item_id,
      'out_of_stock',
      'critical',
      format('Sin stock: %s', v_item.data->>'piedra')
    );
  END IF;
  
  -- Si stock volvió a estar OK, resolver alertas
  IF v_item.stock >= v_stock_min AND v_existing_alert IS NOT NULL THEN
    UPDATE alerts
    SET resolved = true, resolved_at = NOW()
    WHERE id = v_existing_alert;
  END IF;
END;
$$;

-- ============================================
-- TRIGGER: Actualizar updated_at automáticamente
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FUNCIÓN: Búsqueda genérica de items
-- ============================================

CREATE OR REPLACE FUNCTION search_items(
  p_tenant_id UUID,
  p_search_params JSONB DEFAULT '{}'
)
RETURNS TABLE (
  id UUID,
  code VARCHAR,
  data JSONB,
  stock INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.code,
    i.data,
    i.stock,
    i.created_at
  FROM items i
  WHERE i.tenant_id = p_tenant_id
    AND i.active = true
    -- Filtros dinámicos desde JSONB
    AND (
      p_search_params = '{}'::jsonb
      OR i.data @> p_search_params
    )
  ORDER BY i.created_at DESC;
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY (opcional pero recomendado)
-- ============================================

-- Habilitar RLS en tablas principales
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Política: Solo acceder a datos del tenant actual
CREATE POLICY tenant_isolation_items ON items
  USING (tenant_id::text = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation_orders ON orders
  USING (tenant_id::text = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation_movements ON movements
  USING (tenant_id::text = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation_alerts ON alerts
  USING (tenant_id::text = current_setting('app.current_tenant', true));

-- ============================================
-- DATOS INICIALES: Tenant de Roar
-- ============================================

INSERT INTO tenants (tenant_id, name, type, config)
VALUES (
  'roar-pulseras',
  'Roar of the Sun',
  'ecommerce-jewelry',
  '{"language": "es", "currency": "COP", "timezone": "America/Bogota"}'::jsonb
)
ON CONFLICT (tenant_id) DO NOTHING;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Items con stock bajo
CREATE OR REPLACE VIEW items_stock_bajo AS
SELECT 
  i.id,
  i.code,
  i.data->>'piedra' as piedra,
  i.data->>'formato' as formato,
  i.stock,
  (i.data->>'stock_minimo')::int as stock_minimo,
  t.name as tenant_name
FROM items i
JOIN tenants t ON i.tenant_id = t.id
WHERE i.stock < COALESCE((i.data->>'stock_minimo')::int, 3)
  AND i.active = true;

-- Vista: Productos más vendidos (últimos 30 días)
CREATE OR REPLACE VIEW productos_mas_vendidos AS
SELECT 
  i.code,
  i.data->>'piedra' as piedra,
  i.data->>'formato' as formato,
  COUNT(m.id) as total_ventas,
  ABS(SUM(m.quantity)) as unidades_vendidas,
  t.name as tenant_name
FROM items i
JOIN movements m ON i.id = m.item_id
JOIN tenants t ON i.tenant_id = t.id
WHERE m.type = 'sale'
  AND m.created_at >= NOW() - INTERVAL '30 days'
GROUP BY i.code, i.data, t.name
ORDER BY unidades_vendidas DESC;

-- ============================================
-- FIN DEL SCHEMA
-- ============================================

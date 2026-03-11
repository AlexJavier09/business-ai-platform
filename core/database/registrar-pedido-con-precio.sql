-- ============================================
-- QUERY PARA n8n: registrar_pedido
-- ============================================
-- Este query:
--   1. Descuenta el stock
--   2. Registra el pedido con total_amount tomado del precio del item
-- ============================================
-- Pega esto en el campo "Query" del nodo registrar_pedido en n8n

SELECT registrar_pedido_con_precio(
  (SELECT tenant_id FROM items WHERE code = $1 LIMIT 1),
  $1,
  1
);

-- ============================================
-- FUNCIÓN EN SUPABASE (ejecutar una sola vez)
-- ============================================

CREATE OR REPLACE FUNCTION registrar_pedido_con_precio(
  p_tenant_id uuid,
  p_codigo_producto text,
  p_cantidad integer DEFAULT 1
) RETURNS jsonb AS $$
DECLARE
  v_item_id uuid;
  v_precio numeric;
  v_stock_result jsonb;
  v_order_id uuid;
  v_order_number text;
BEGIN
  -- 1. Obtener item y precio
  SELECT id, (data->>'precio')::numeric
  INTO v_item_id, v_precio
  FROM items
  WHERE tenant_id = p_tenant_id AND code = p_codigo_producto;

  IF v_item_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Producto no encontrado: ' || p_codigo_producto);
  END IF;

  -- 2. Descontar stock
  v_stock_result := descontar_stock(p_tenant_id, p_codigo_producto, p_cantidad);

  IF (v_stock_result->>'success')::boolean = false THEN
    RETURN v_stock_result;
  END IF;

  -- 3. Generar número de orden único
  v_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                    LPAD(FLOOR(RANDOM() * 9000 + 1000)::text, 4, '0');

  -- 4. Registrar pedido con precio real
  INSERT INTO orders (tenant_id, item_id, order_number, status, total_amount)
  VALUES (p_tenant_id, v_item_id, v_order_number, 'pending', COALESCE(v_precio, 0) * p_cantidad)
  RETURNING id INTO v_order_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'codigo_producto', p_codigo_producto,
    'precio_unitario', v_precio,
    'total_amount', COALESCE(v_precio, 0) * p_cantidad,
    'stock_result', v_stock_result
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

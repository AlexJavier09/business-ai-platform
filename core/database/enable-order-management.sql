-- ============================================
-- GESTIÓN DE PEDIDOS: Permisos y Triggers
-- ============================================

-- 1. Permitir UPDATE de pedidos desde el dashboard
DROP POLICY IF EXISTS "Enable order updates for all users" ON orders;

CREATE POLICY "Enable order updates for all users" ON orders
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 2. Función para manejar cambios de estado en pedidos
CREATE OR REPLACE FUNCTION handle_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- CASO 1: Pedido pasa a CANCELADO → liberar reserva (+1 stock disponible)
  IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
    UPDATE items SET stock = stock + 1 WHERE id = NEW.item_id;
    
    INSERT INTO movements (tenant_id, item_id, order_id, type, quantity, previous_stock, new_stock, notes)
    VALUES (
      NEW.tenant_id, NEW.item_id, NEW.id,
      'restock', 1,
      (SELECT stock - 1 FROM items WHERE id = NEW.item_id),
      (SELECT stock FROM items WHERE id = NEW.item_id),
      CONCAT('Pedido cancelado: ', NEW.order_number, ' - Stock liberado')
    );

  -- CASO 2: Pedido pasa de CANCELADO a pendiente/completado → reservar de nuevo (-1 stock)
  ELSIF OLD.status = 'cancelled' AND NEW.status != 'cancelled' THEN
    UPDATE items SET stock = stock - 1 WHERE id = NEW.item_id;
    
    INSERT INTO movements (tenant_id, item_id, order_id, type, quantity, previous_stock, new_stock, notes)
    VALUES (
      NEW.tenant_id, NEW.item_id, NEW.id,
      'adjustment', -1,
      (SELECT stock + 1 FROM items WHERE id = NEW.item_id),
      (SELECT stock FROM items WHERE id = NEW.item_id),
      CONCAT('Pedido reactivado: ', NEW.order_number, ' - Stock reservado')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Recrear trigger
DROP TRIGGER IF EXISTS order_status_handler ON orders;

CREATE TRIGGER order_status_handler
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_status_change();

-- Verificar
SELECT '✅ Sistema de gestión de pedidos configurado' as status,
       'Los pedidos cancelados devolverán stock automáticamente' as detalle;

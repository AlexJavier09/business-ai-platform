-- ============================================
-- TRIGGER: Registrar automáticamente cambios de stock
-- ============================================

-- Función que se ejecuta cuando cambia el stock
CREATE OR REPLACE FUNCTION log_stock_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo registrar si el stock cambió
  IF OLD.stock != NEW.stock THEN
    INSERT INTO movements (
      tenant_id,
      item_id,
      type,
      quantity,
      previous_stock,
      new_stock,
      notes
    ) VALUES (
      NEW.tenant_id,
      NEW.id,
      CASE 
        WHEN NEW.stock > OLD.stock THEN 'restock'
        ELSE 'adjustment'
      END,
      NEW.stock - OLD.stock,
      OLD.stock,
      NEW.stock,
      CONCAT('Ajuste manual de stock: ', OLD.stock, ' → ', NEW.stock)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS stock_change_logger ON items;

-- Crear trigger que se ejecuta DESPUÉS de actualizar
CREATE TRIGGER stock_change_logger
  AFTER UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION log_stock_change();

-- Permitir INSERT en movements (para el log automático)
CREATE POLICY "Enable insert for movements logging" ON movements
  FOR INSERT
  WITH CHECK (true);

-- Verificar
SELECT '✅ Trigger de log de stock configurado' as status;

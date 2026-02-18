-- Agregar columna notes a la tabla orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Verificar
SELECT '✅ Columna notes agregada a tabla orders' as status;

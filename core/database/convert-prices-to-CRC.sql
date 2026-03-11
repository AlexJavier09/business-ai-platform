-- ============================================
-- CONVERTIR PRECIOS USD → COLONES COSTARRICENSES
-- Tipo de cambio: 1 USD = 520 CRC (ajustar si es necesario)
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Redondear a miles de colones para precios más limpios
UPDATE items SET data = data || jsonb_build_object('precio', 
  ROUND(((data->>'precio')::decimal * 520) / 1000) * 1000
)
WHERE tenant_id = (SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras')
  AND data->>'precio' IS NOT NULL;

-- Verificar resultados:
SELECT code, 
       data->>'piedra' AS piedra,
       data->>'formato' AS formato,
       (data->>'precio')::numeric AS precio_CRC
FROM items
WHERE tenant_id = (SELECT id FROM tenants WHERE tenant_id = 'roar-pulseras')
ORDER BY code;

-- ============================================
-- REFERENCIA: precios originales USD → CRC
-- ============================================
-- $9  USD → ₡5.000
-- $10 USD → ₡5.000
-- $11 USD → ₡6.000
-- $12 USD → ₡6.000
-- $13 USD → ₡7.000
-- $14 USD → ₡7.000
-- $15 USD → ₡8.000
-- $16 USD → ₡8.000
-- $17 USD → ₡9.000
-- $18 USD → ₡9.000
-- $20 USD → ₡10.000
-- $22 USD → ₡11.000
-- $24 USD → ₡12.000
-- $25 USD → ₡13.000
-- $26 USD → ₡14.000
-- $28 USD → ₡15.000

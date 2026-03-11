-- ============================================
-- AGREGAR PRECIOS A ITEMS - ROAR OF THE SUN
-- Ejecutar en Supabase SQL Editor
-- ============================================
-- Precios en USD. Lógica:
--   Chips + Elástico  = $8–12  (más accesible)
--   Bolitas + Elástico = $12–18
--   Bolitas + Cuerda  = $15–25 (más elaborado)
--   Piedras especiales (Labradorita, Lapis, Garnete) = $20–28
-- ============================================

UPDATE items SET data = data || '{"precio": 18}' WHERE code = 'H001'; -- Cuarzo Rosa Bolitas Cuerda
UPDATE items SET data = data || '{"precio": 14}' WHERE code = 'H002'; -- Cuarzo Rosa Bolitas Elástico
UPDATE items SET data = data || '{"precio": 10}' WHERE code = 'H003'; -- Cuarzo Rosa Chips Elástico

UPDATE items SET data = data || '{"precio": 20}' WHERE code = 'H004'; -- Turmalina Bolitas Cuerda
UPDATE items SET data = data || '{"precio": 15}' WHERE code = 'H005'; -- Turmalina Bolitas Elástico
UPDATE items SET data = data || '{"precio": 11}' WHERE code = 'H006'; -- Turmalina Chips Elástico

UPDATE items SET data = data || '{"precio": 22}' WHERE code = 'H007'; -- Fluorita Bolitas Cuerda

UPDATE items SET data = data || '{"precio": 18}' WHERE code = 'H008'; -- Amatista Bolitas Cuerda
UPDATE items SET data = data || '{"precio": 14}' WHERE code = 'H009'; -- Amatista Bolitas Elástico
UPDATE items SET data = data || '{"precio": 10}' WHERE code = 'H010'; -- Amatista Chips Elástico

UPDATE items SET data = data || '{"precio": 20}' WHERE code = 'H011'; -- Ojo de Tigre Bolitas Cuerda
UPDATE items SET data = data || '{"precio": 15}' WHERE code = 'H012'; -- Ojo de Tigre Bolitas Elástico
UPDATE items SET data = data || '{"precio": 11}' WHERE code = 'H013'; -- Ojo de Tigre Chips Elástico

UPDATE items SET data = data || '{"precio": 18}' WHERE code = 'H014'; -- Aventurina Verde Bolitas Cuerda
UPDATE items SET data = data || '{"precio": 14}' WHERE code = 'H015'; -- Aventurina Verde Bolitas Elástico
UPDATE items SET data = data || '{"precio": 10}' WHERE code = 'H016'; -- Aventurina Verde Chips Elástico

UPDATE items SET data = data || '{"precio": 18}' WHERE code = 'H017'; -- Cuarzo Fresa Bolitas Cuerda
UPDATE items SET data = data || '{"precio": 14}' WHERE code = 'H018'; -- Cuarzo Fresa Bolitas Elástico
UPDATE items SET data = data || '{"precio": 10}' WHERE code = 'H019'; -- Cuarzo Fresa Chips Elástico

UPDATE items SET data = data || '{"precio": 26}' WHERE code = 'H020'; -- Lapis Lazuli Bolitas Cuerda
UPDATE items SET data = data || '{"precio": 22}' WHERE code = 'H021'; -- Lapis Lazuli Bolitas Elástico
UPDATE items SET data = data || '{"precio": 18}' WHERE code = 'H022'; -- Lapis Lazuli Chips Elástico

UPDATE items SET data = data || '{"precio": 16}' WHERE code = 'H023'; -- Hematita Bolitas Cuerda

UPDATE items SET data = data || '{"precio": 17}' WHERE code = 'H024'; -- Turquesa Blanca Bolitas Cuerda
UPDATE items SET data = data || '{"precio": 13}' WHERE code = 'H025'; -- Turquesa Blanca Bolitas Elástico
UPDATE items SET data = data || '{"precio": 9}'  WHERE code = 'H026'; -- Turquesa Blanca Chips Elástico

UPDATE items SET data = data || '{"precio": 20}' WHERE code = 'H027'; -- Piedra Solar Bolitas Cuerda
UPDATE items SET data = data || '{"precio": 16}' WHERE code = 'H028'; -- Piedra Solar Bolitas Elástico
UPDATE items SET data = data || '{"precio": 12}' WHERE code = 'H029'; -- Piedra Solar Chips Elástico

UPDATE items SET data = data || '{"precio": 18}' WHERE code = 'H030'; -- Obsidiana Bolitas Cuerda
UPDATE items SET data = data || '{"precio": 14}' WHERE code = 'H031'; -- Obsidiana Bolitas Elástico
UPDATE items SET data = data || '{"precio": 10}' WHERE code = 'H032'; -- Obsidiana Chips Elástico

UPDATE items SET data = data || '{"precio": 28}' WHERE code = 'H033'; -- Labradorita Bolitas Cuerda
UPDATE items SET data = data || '{"precio": 24}' WHERE code = 'H034'; -- Labradorita Bolitas Elástico
UPDATE items SET data = data || '{"precio": 20}' WHERE code = 'H035'; -- Labradorita Chips Elástico

UPDATE items SET data = data || '{"precio": 22}' WHERE code = 'H036'; -- Amazonita Bolitas Cuerda
UPDATE items SET data = data || '{"precio": 18}' WHERE code = 'H037'; -- Amazonita Bolitas Elástico
UPDATE items SET data = data || '{"precio": 14}' WHERE code = 'H038'; -- Amazonita Chips Elástico

UPDATE items SET data = data || '{"precio": 20}' WHERE code = 'H039'; -- Sodalita Bolitas Cuerda

UPDATE items SET data = data || '{"precio": 15}' WHERE code = 'H040'; -- Roca Lava Bolitas Cuerda

UPDATE items SET data = data || '{"precio": 22}' WHERE code = 'H041'; -- Carnelina Bolitas Cuerda

UPDATE items SET data = data || '{"precio": 25}' WHERE code = 'H042'; -- Prehnite Bolitas Cuerda

UPDATE items SET data = data || '{"precio": 28}' WHERE code = 'H043'; -- Garnete Bolitas Cuerda

UPDATE items SET data = data || '{"precio": 24}' WHERE code = 'H044'; -- Apatite Bolitas Cuerda

UPDATE items SET data = data || '{"precio": 22}' WHERE code = 'H045'; -- Citrine Bolitas Cuerda

UPDATE items SET data = data || '{"precio": 22}' WHERE code = 'H046'; -- Cuarzo Ahumado Bolitas Cuerda

UPDATE items SET data = data || '{"precio": 18}' WHERE code = 'H047'; -- Cuarzo Claro Bolitas Cuerda

-- Verificar:
SELECT code, data->>'piedra' AS piedra, data->>'formato' AS formato,
       data->>'cuerda' AS cuerda, (data->>'precio')::numeric AS precio_usd
FROM items
ORDER BY code;

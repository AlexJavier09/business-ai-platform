-- ============================================
-- IMPORTACIÓN DE INVENTARIO INICIAL - ROAR OF THE SUN
-- ============================================
-- Este script importa los productos desde el Excel al schema multi-tenant

-- Obtener el UUID del tenant
DO $$
DECLARE
  v_tenant_uuid UUID;
BEGIN
  -- Buscar el UUID del tenant roar-pulseras
  SELECT id INTO v_tenant_uuid
  FROM tenants
  WHERE tenant_id = 'roar-pulseras';
  
  IF v_tenant_uuid IS NULL THEN
    RAISE EXCEPTION 'Tenant roar-pulseras no encontrado. Ejecuta primero el schema principal.';
  END IF;
  
  -- Insertar todos los productos
  -- Cuarzo Rosa
  INSERT INTO items (tenant_id, code, data, stock) VALUES
  (v_tenant_uuid, 'H001', '{"piedra": "Cuarzo Rosa", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 10, "merma": null, "javier": 11}'::jsonb, 10),
  (v_tenant_uuid, 'H002', '{"piedra": "Cuarzo Rosa", "formato": "Bolitas", "cuerda": "elástico", "cantidad_D": 7, "merma": null, "javier": 4}'::jsonb, 7),
  (v_tenant_uuid, 'H003', '{"piedra": "Cuarzo Rosa", "formato": "chips", "cuerda": "elástico", "cantidad_D": 7, "merma": null, "javier": 4}'::jsonb, 7),
  
  -- Turmalina
  (v_tenant_uuid, 'H004', '{"piedra": "Turmalina", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 4, "merma": null, "javier": 1}'::jsonb, 4),
  (v_tenant_uuid, 'H005', '{"piedra": "Turmalina", "formato": "Bolitas", "cuerda": "elástico", "cantidad_D": 8, "merma": null, "javier": 6}'::jsonb, 8),
  (v_tenant_uuid, 'H006', '{"piedra": "Turmalina", "formato": "chips", "cuerda": "elástico", "cantidad_D": 8, "merma": null, "javier": 6}'::jsonb, 8),
  
  -- Fluorita
  (v_tenant_uuid, 'H007', '{"piedra": "Fluorita", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 3, "merma": null, "javier": null}'::jsonb, 3),
  
  -- Amatista
  (v_tenant_uuid, 'H008', '{"piedra": "Amatista", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 13, "merma": null, "javier": 11}'::jsonb, 13),
  (v_tenant_uuid, 'H009', '{"piedra": "Amatista", "formato": "Bolitas", "cuerda": "elástico", "cantidad_D": 11, "merma": null, "javier": 1}'::jsonb, 11),
  (v_tenant_uuid, 'H010', '{"piedra": "Amatista", "formato": "chips", "cuerda": "elástico", "cantidad_D": 10, "merma": null, "javier": 1}'::jsonb, 10),
  
  -- Ojo de Tigre
  (v_tenant_uuid, 'H011', '{"piedra": "Ojo de Tigre", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 25, "merma": null, "javier": 11}'::jsonb, 25),
  (v_tenant_uuid, 'H012', '{"piedra": "Ojo de Tigre", "formato": "Bolitas", "cuerda": "elástico", "cantidad_D": 4, "merma": null, "javier": 4}'::jsonb, 4),
  (v_tenant_uuid, 'H013', '{"piedra": "Ojo de Tigre", "formato": "chips", "cuerda": "elástico", "cantidad_D": 6, "merma": null, "javier": 4}'::jsonb, 6),
  
  -- Aventurina Verde
  (v_tenant_uuid, 'H014', '{"piedra": "Aventurina Verde", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 19, "merma": null, "javier": 11}'::jsonb, 19),
  (v_tenant_uuid, 'H015', '{"piedra": "Aventurina Verde", "formato": "Bolitas", "cuerda": "elástico", "cantidad_D": 7, "merma": null, "javier": 4}'::jsonb, 7),
  (v_tenant_uuid, 'H016', '{"piedra": "Aventurina Verde", "formato": "chips", "cuerda": "elástico", "cantidad_D": 7, "merma": null, "javier": 4}'::jsonb, 7),
  
  -- Cuarzo fresa
  (v_tenant_uuid, 'H017', '{"piedra": "Cuarzo fresa", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 2, "merma": null, "javier": null}'::jsonb, 2),
  (v_tenant_uuid, 'H018', '{"piedra": "Cuarzo fresa", "formato": "Bolitas", "cuerda": "elástico", "cantidad_D": 8, "merma": null, "javier": 6}'::jsonb, 8),
  (v_tenant_uuid, 'H019', '{"piedra": "Cuarzo fresa", "formato": "chips", "cuerda": "elástico", "cantidad_D": 8, "merma": null, "javier": 6}'::jsonb, 8),
  
  -- Lapis Lazuli
  (v_tenant_uuid, 'H020', '{"piedra": "Lapis Lazuli", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 2, "merma": null, "javier": null}'::jsonb, 2),
  (v_tenant_uuid, 'H021', '{"piedra": "Lapis Lazuli", "formato": "Bolitas", "cuerda": "elástico", "cantidad_D": 3, "merma": null, "javier": 4}'::jsonb, 3),
  (v_tenant_uuid, 'H022', '{"piedra": "Lapis Lazuli", "formato": "chips", "cuerda": "elástico", "cantidad_D": 2, "merma": null, "javier": 1}'::jsonb, 2),
  
  -- hematita
  (v_tenant_uuid, 'H023', '{"piedra": "hematita", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 1, "merma": null, "javier": null}'::jsonb, 1),
  
  -- Turquesa Blanca
  (v_tenant_uuid, 'H024', '{"piedra": "Turquesa Blanca", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 5, "merma": null, "javier": null}'::jsonb, 5),
  (v_tenant_uuid, 'H025', '{"piedra": "Turquesa Blanca", "formato": "Bolitas", "cuerda": "elástico", "cantidad_D": 7, "merma": null, "javier": 6}'::jsonb, 7),
  (v_tenant_uuid, 'H026', '{"piedra": "Turquesa Blanca", "formato": "chips", "cuerda": "elástico", "cantidad_D": 9, "merma": null, "javier": 6}'::jsonb, 9),
  
  -- Piedra Solar
  (v_tenant_uuid, 'H027', '{"piedra": "Piedra Solar", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 4, "merma": null, "javier": null}'::jsonb, 4),
  (v_tenant_uuid, 'H028', '{"piedra": "Piedra Solar", "formato": "Bolitas", "cuerda": "elástico", "cantidad_D": 9, "merma": null, "javier": 4}'::jsonb, 9),
  (v_tenant_uuid, 'H029', '{"piedra": "Piedra Solar", "formato": "chips", "cuerda": "elástico", "cantidad_D": 9, "merma": null, "javier": 4}'::jsonb, 9),
  
  -- Obsidiana
  (v_tenant_uuid, 'H030', '{"piedra": "Obsidiana", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 31, "merma": null, "javier": 11}'::jsonb, 31),
  (v_tenant_uuid, 'H031', '{"piedra": "Obsidiana", "formato": "Bolitas", "cuerda": "elástico", "cantidad_D": 5, "merma": null, "javier": 4}'::jsonb, 5),
  (v_tenant_uuid, 'H032', '{"piedra": "Obsidiana", "formato": "chips", "cuerda": "elástico", "cantidad_D": 4, "merma": null, "javier": 4}'::jsonb, 4),
  
  -- Labradorita
  (v_tenant_uuid, 'H033', '{"piedra": "Labradorita", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 3, "merma": null, "javier": 1}'::jsonb, 3),
  (v_tenant_uuid, 'H034', '{"piedra": "Labradorita", "formato": "Bolitas", "cuerda": "elástico", "cantidad_D": 8, "merma": null, "javier": 5}'::jsonb, 8),
  (v_tenant_uuid, 'H035', '{"piedra": "Labradorita", "formato": "chips", "cuerda": "elástico", "cantidad_D": 7, "merma": null, "javier": 5}'::jsonb, 7),
  
  -- Amazonita
  (v_tenant_uuid, 'H036', '{"piedra": "Amazonita", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 3, "merma": null, "javier": null}'::jsonb, 3),
  (v_tenant_uuid, 'H037', '{"piedra": "Amazonita", "formato": "Bolitas", "cuerda": "elástico", "cantidad_D": 9, "merma": null, "javier": 5}'::jsonb, 9),
  (v_tenant_uuid, 'H038', '{"piedra": "Amazonita", "formato": "chips", "cuerda": "elástico", "cantidad_D": 9, "merma": null, "javier": 5}'::jsonb, 9),
  
  -- Soladita
  (v_tenant_uuid, 'H039', '{"piedra": "Soladita", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 2, "merma": null, "javier": null}'::jsonb, 2),
  
  -- Roca Lava
  (v_tenant_uuid, 'H040', '{"piedra": "Roca Lava", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 2, "merma": null, "javier": null}'::jsonb, 2),
  
  -- Carnelina
  (v_tenant_uuid, 'H041', '{"piedra": "Carnelina", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 1, "merma": null, "javier": null}'::jsonb, 1),
  
  -- Prehnite
  (v_tenant_uuid, 'H042', '{"piedra": "Prehnite", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 1, "merma": null, "javier": null}'::jsonb, 1),
  
  -- Garnete
  (v_tenant_uuid, 'H043', '{"piedra": "Garnete", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 1, "merma": null, "javier": null}'::jsonb, 1),
  
  -- Apatite
  (v_tenant_uuid, 'H044', '{"piedra": "Apatite", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 4, "merma": null, "javier": null}'::jsonb, 4),
  
  -- Citrine
  (v_tenant_uuid, 'H045', '{"piedra": "Citrine", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 22, "merma": null, "javier": 11}'::jsonb, 22),
  
  -- Cuarzo Aumado
  (v_tenant_uuid, 'H046', '{"piedra": "Cuarzo Aumado", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 1, "merma": null, "javier": null}'::jsonb, 1),
  
  -- Cuarzo claro
  (v_tenant_uuid, 'H047', '{"piedra": "Cuarzo claro", "formato": "Bolitas", "cuerda": "Cuerda", "cantidad_D": 1, "merma": null, "javier": null}'::jsonb, 1)
  
  ON CONFLICT (tenant_id, code) DO UPDATE
  SET 
    data = EXCLUDED.data,
    stock = EXCLUDED.stock,
    updated_at = NOW();
  
  RAISE NOTICE 'Importación completada: 47 productos insertados/actualizados';
END $$;

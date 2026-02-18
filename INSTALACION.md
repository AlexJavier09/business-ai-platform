# 🚀 Guía de Instalación - Business AI Platform

## Estado Actual

✅ **Completado:**
- Estructura del proyecto creada
- Schema SQL generado (`core/database/00-core-schema.sql`)
- Script de importación de inventario creado
- Archivo .env configurado

⏸️ **Pendiente:**
- **Ejecutar el schema SQL en Supabase** (paso crítico)
- Importar los 47 productos del inventario
- Configurar N8N workflows

---

## 📋 Pasos de Instalación

### Paso 1: Ejecutar el Schema SQL en Supabase

Tienes 2 opciones:

#### Opción A: Usar Supabase Studio (Recomendado)

1. Abre tu navegador y ve a:
   ```
   https://n8n-restaurante-supabasetest.k6ptvf.easypanel.host:8000
   ```

2. Inicia sesión con:
   - Usuario: `supabase`
   - (usa tu contraseña de EasyPanel)

3. Ve a **SQL Editor** (icono en el sidebar izquierdo)

4. Haz clic en **+ New Query**

5. Abre el archivo `core/database/00-core-schema.sql` en un editor de texto

6. Copia **TODO** el contenido del archivo (389 líneas)

7. Pégalo en el SQL Editor de Supabase

8. Haz clic en **Run** (botón verde en la esquina inferior derecha)

9. Deberías ver:
   ✅ "Success. No rows returned"
   
   Esto significa que las tablas, funciones y triggers se crearon correctamente.

#### Opción B: Usar psql (si tienes acceso directo)

```bash
# Conectarte a PostgreSQL en tu servidor
psql -h n8n-restaurante-supabasetest.k6ptvf.easypanel.host -p 5432 -U postgres -d postgres < core/database/00-core-schema.sql
```

---

### Paso 2: Importar el Inventario

Una vez que el schema esté creado, ejecuta:

```bash
node scripts/setup.js
```

Este script:
- ✅ Verifica que las tablas existan
- ✅ Busca el tenant "roar-pulseras"
- ✅ Importa los 47 productos (H001 - H047)
- ✅ Muestra un reporte de stock
- ✅ Detecta productos con stock bajo

**Salida esperada:**
```
🚀 Iniciando setup de Business AI Platform...
📡 Conectando a: https://n8n-restaurante-supabasetest.k6ptvf.easypanel.host:8000
🔍 Verificando tablas...
✅ Tablas encontradas
🔍 Buscando tenant roar-pulseras...
✅ Tenant encontrado: [uuid]
📦 Importando 47 productos...
+++++++++++++++++++++++++++++++++++++++++++++++
✅ Importación completada:
   • 47 productos nuevos
   • 0 productos actualizados
📊 Total de productos: 47
📦 Stock total: 347 unidades
⚠️  Productos con stock bajo (< 3): 11
   • H007: Fluorita Bolitas - 3 unidades
   • H017: Cuarzo fresa Bolitas - 2 unidades
   ...
```

---

### Paso 3: Verificar los Datos

En Supabase Studio:

1. Ve a **Table Editor**
2. Selecciona la tabla **items**
3. Deberías ver los 47 productos importados

Campos a verificar:
- `code`: H001 - H047
- `stock`: Números del 1 al 31
- `data`: JSON con piedra, formato, cuerda, etc.

---

## 🗂️ Estructura de Datos

### Tabla: `tenants`
```sql
tenant_id: 'roar-pulseras'
name: 'Roar of the Sun'
type: 'ecommerce-jewelry'
```

### Tabla: `items`
Cada producto tiene:
```json
{
  "code": "H001",
  "stock": 10,
  "data": {
    "piedra": "Cuarzo Rosa",
    "formato": "Bolitas",
    "cuerda": "Cuerda",
    "cantidad_D": 10,
    "javier": 11,
    "merma": null
  }
}
```

---

## 📊 Resumen del Inventario

**Total de productos:** 47  
**Stock total:** ~347 unidades

**Tipos de piedras:** 21 variedades
- Cuarzo Rosa, Turmalina, Fluorita, Amatista
- Ojo de Tigre, Aventurina Verde, Cuarzo fresa
- Lapis Lazuli, hematita, Turquesa Blanca
- Piedra Solar, Obsidiana, Labradorita
- Amazonita, Soladita, Roca Lava
- Carnelina, Prehnite, Garnete, Apatite
- Citrine, Cuarzo Aumado, Cuarzo claro

**Formatos:**
- Bolitas (mayormente)
- chips (algunos)

**Tipos de cuerda:**
- Cuerda (tradicional)
- elástico

---

## 🆘 Resolución de Problemas

### Error: "Tenant roar-pulseras no encontrado"
**Solución:** El schema SQL no se ejecutó correctamente. Vuelve al Paso 1.

### Error: "PGRST102" o "relation does not exist"
**Solución:** Las tablas no existen. Ejecuta el schema SQL (Paso 1).

### Error: "Connection refused"
**Solución:** Verifica que tu Supabase esté corriendo en EasyPanel y que el SUPABASE_URL en `.env` sea correcto.

### Los productos se importan pero aparecen como "updated" en vez de "nuevos"
**Solución:** Ya estaban importados. Esto es normal si ejecutas el script varias veces.

---

## ✅ Próximos Pasos

Una vez completada la importación:

1. **Configurar N8N Workflows**
   - Webhook para ManyChat
   - Flujo de descuento de stock
   - Alertas de stock bajo

2. **Desplegar en EasyPanel**
   - Push a Git
   - Auto-deploy desde EasyPanel

3. **Conectar WhatsApp**
   - Configurar ManyChat
   - Webhook URL de N8N

---

## 📞 Soporte

Si algo no funciona:
1. Revisa los logs en la terminal
2. Verifica el .env tiene las credenciales correctas
3. Asegúrate de que Supabase esté corriendo en EasyPanel

---

**Última actualización:** 2026-02-17

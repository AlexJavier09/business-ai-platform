# 🚀 Guía: Crear Supabase en EasyPanel

## 📋 Pasos para Crear la Instancia

### 1. Acceder a EasyPanel

1. Ve a tu panel de EasyPanel
2. Selecciona tu proyecto o crea uno nuevo

### 2. Crear Servicio de Supabase

1. Click en **"+ Add Service"**
2. Busca **"Supabase"** en el catálogo de templates
3. Click en **"Deploy"**

### 3. Configurar Variables de Entorno

Copia y pega las variables del archivo `supabase-env-easypanel.env` en el campo de variables de entorno.

> [!IMPORTANT]
> **Variables Críticas Ya Configuradas:**
> - ✅ Dashboard Usuario: `supabase`
> - ✅ Dashboard Contraseña: `23Bw.V.y.TU4c1`
> - ✅ Contraseñas seguras generadas
> - ✅ Pooling optimizado para producción

### 4. Configurar Dominio

1. En EasyPanel, asigna un dominio a tu servicio Supabase
2. Ejemplo: `roar-supabase.tudominio.com`
3. EasyPanel automáticamente reemplazará `$(PRIMARY_DOMAIN)` con tu dominio

### 5. Desplegar

1. Click en **"Deploy"**
2. Espera 2-3 minutos mientras se levantan todos los servicios
3. Verifica que todos los contenedores estén en estado "Running"

---

## 🔐 Credenciales de Acceso

### Dashboard (Supabase Studio)

**URL:** `https://tu-dominio-supabase:3000` (o el puerto que asigne EasyPanel)

**Credenciales:**
- Usuario: `supabase`
- Contraseña: `23Bw.V.y.TU4c1`

### PostgreSQL Directo

Si necesitas conectarte directamente a PostgreSQL:
- Host: El host interno de EasyPanel (usualmente `db`)
- Puerto: `5432`
- Usuario: `postgres`
- Contraseña: `RoAr2026!PgSql#SecureDB$x9K2mNp7Q`
- Base de datos: `postgres`

---

## ⚙️ Configuraciones Importantes

### 🔑 Claves JWT

Las claves `ANON_KEY` y `SERVICE_ROLE_KEY` actualmente están usando las claves demo de Supabase.

**⚠️ IMPORTANTE: Regenerar las claves JWT**

Una vez que tu instancia esté corriendo:

1. Accede al dashboard de Supabase
2. Ve a **Settings** → **API**
3. Copia las nuevas claves:
   - `anon` public → Esta es tu `ANON_KEY`
   - `service_role` → Esta es tu `SERVICE_ROLE_KEY`
4. Actualiza las variables de entorno en EasyPanel con las nuevas claves
5. Redespliega el servicio

### 📧 Configurar SMTP (Opcional pero Recomendado)

Para que funcione el sistema de autenticación por email, configura SMTP real:

**Opción 1: Gmail**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
```

**Cómo obtener App Password de Gmail:**
1. Ve a tu cuenta de Google
2. Seguridad → Verificación en 2 pasos (debe estar activada)
3. Contraseñas de aplicaciones
4. Genera una nueva contraseña para "Correo"
5. Usa esa contraseña en `SMTP_PASS`

**Opción 2: SendGrid, Resend, etc.**
Similar pero con sus propias credenciales.

---

## 🔍 Verificación Post-Despliegue

### 1. Verificar que los servicios están corriendo

En EasyPanel, verifica que estén activos:
- ✅ `kong` (API Gateway)
- ✅ `auth` (GoTrue)
- ✅ `rest` (PostgREST)
- ✅ `db` (PostgreSQL)
- ✅ `studio` (Dashboard)
- ✅ `storage`
- ✅ `imgproxy`
- ✅ `meta`
- ✅ `functions`

### 2. Probar el Dashboard

1. Abre `https://tu-dominio-supabase:3000`
2. Inicia sesión con `supabase` / `23Bw.V.y.TU4c1`
3. Deberías ver el SQL Editor y Table Editor

### 3. Probar la API

```bash
curl https://tu-dominio-supabase:8000/rest/v1/
```

Debería devolver información de la API.

---

## 📝 Actualizar tu Proyecto Local

Una vez que tu Supabase esté corriendo, actualiza el `.env` de tu proyecto:

```env
# Supabase (Nueva instancia en EasyPanel)
SUPABASE_URL=https://tu-dominio-supabase:8000
SUPABASE_ANON_KEY=[copia la nueva ANON_KEY del dashboard]
SUPABASE_SERVICE_KEY=[copia la nueva SERVICE_ROLE_KEY del dashboard]
```

---

## 🎯 Próximos Pasos

1. **Ejecutar el Schema SQL**
   - Abre Supabase Studio
   - Ve a SQL Editor
   - Ejecuta `core/database/00-core-schema.sql`

2. **Importar Inventario**
   ```bash
   node scripts/setup.js
   ```

3. **Configurar N8N**
   - Conectar N8N a tu nueva instancia de Supabase
   - Usar las nuevas credenciales

---

## 🆘 Troubleshooting

### Error: "Cannot connect to database"
**Solución:** Espera 1-2 minutos más. PostgreSQL tarda en inicializarse la primera vez.

### Error: "Invalid credentials" en el dashboard
**Solución:** Verifica que copiaste bien las variables de entorno, especialmente `DASHBOARD_USERNAME` y `DASHBOARD_PASSWORD`.

### Las claves JWT no funcionan
**Solución:** Regenera las claves desde el dashboard una vez que esté corriendo (ver sección "Regenerar las claves JWT" arriba).

### SMTP no funciona
**Solución:** 
1. Verifica que los valores de SMTP sean correctos
2. Para Gmail, asegúrate de usar una App Password, no tu contraseña normal
3. Verifica que el puerto sea 587 para TLS o 465 para SSL

---

## 📊 Optimizaciones Incluidas

Las variables de entorno ya incluyen optimizaciones para producción:

✅ **Pool de conexiones aumentado:**
- `POOLER_DEFAULT_POOL_SIZE=50` (default: 20)
- `POOLER_MAX_CLIENT_CONN=200` (default: 100)

✅ **JWT Verification habilitado** en Edge Functions

✅ **Contraseñas seguras** con alta entropía

✅ **Nombres personalizados:**
- Organization: "Roar of the Sun"
- Project: "Business AI Platform"

---

**Última actualización:** 2026-02-17

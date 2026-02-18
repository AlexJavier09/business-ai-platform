# Business AI Platform

Sistema modular multi-tenant de gestión con agentes de IA para negocios.

## 🎯 Proyecto Actual: Roar of the Sun

Plataforma de gestión de inventario y ventas automatizadas para negocio de pulseras artesanales.

**Inventario:** 47 productos (códigos H001-H047)  
**Piedras:** 21 variedades diferentes  
**Stock total:** ~347 unidades

---

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de ambiente

El archivo `.env` ya está configurado con tu instancia de Supabase en EasyPanel.

### 3. Ejecutar el setup

**⚠️ IMPORTANTE:** Antes de ejecutar el setup, debes crear las tablas en Supabase.

Lee la **[Guía de Instalación Completa](./INSTALACION.md)** para instrucciones paso a paso.

**Resumen rápido:**
1. Abre Supabase Studio: https://n8n-restaurante-supabasetest.k6ptvf.easypanel.host:8000
2. Ve a SQL Editor
3. Copia y ejecuta: `core/database/00-core-schema.sql`
4. Luego ejecuta: `node scripts/setup.js`

---

## 📁 Estructura del Proyecto

```
business-ai-platform/
├── core/                      # Sistema base reutilizable
│   ├── database/              # Schemas SQL
│   │   └── 00-core-schema.sql # Schema principal con tablas y funciones
│   └── api/                   # API genérica (próximamente)
│
├── tenants/                   # Configuraciones por negocio
│   └── roar-pulseras/         # Configuración de Roar of the Sun
│       ├── tenant.config.json # Configuración del tenant
│       ├── inventario-inicial.sql # SQL de importación directa
│       └── README.md          # Documentación del inventario
│
├── scripts/                   # Scripts de utilidad
│   ├── setup.js               # Setup completo del sistema
│   └── import-inventory.js    # Importador de inventario
│
├── n8n-workflows/             # Workflows de N8N (próximamente)
│
├── .env                       # Variables de ambiente (configurado)
├── .env.example               # Ejemplo de variables
├── package.json               # Dependencias del proyecto
├── README.md                  # Este archivo
└── INSTALACION.md             # Guía de instalación detallada
```

---

## 🗄️ Base de Datos

El sistema usa un **schema multi-tenant** en PostgreSQL (Supabase).

### Tablas Principales

- **`tenants`**: Configuración de cada negocio
- **`items`**: Productos/inventario (genérico, usa JSONB para flexibilidad)
- **`orders`**: Pedidos de clientes
- **`movements`**: Movimientos de inventario (ventas, restock, ajustes)
- **`alerts`**: Alertas del sistema (stock bajo, etc.)

### Funciones SQL

- **`descontar_stock()`**: Descuenta stock automáticamente y registra movimiento
- **`check_stock_alerts()`**: Verifica y crea alertas de stock bajo
- **`search_items()`**: Búsqueda genérica con filtros JSONB

### Vistas

- **`items_stock_bajo`**: Productos con stock por debajo del mínimo
- **`productos_mas_vendidos`**: Top ventas (últimos 30 días)

---

## 🔧 Scripts Disponibles

### Desarrollo

```bash
# Setup inicial (importa todo)
node scripts/setup.js

# Solo importar inventario
node scripts/import-inventory.js
```

### Próximamente

- `npm run dev` - Servidor local
- `npm run migrate` - Migrar datos desde Google Sheets
- `npm run deploy` - Deploy a EasyPanel

---

## 🌐 Integraciones

- **Supabase**: Base de datos PostgreSQL + Auth + Storage
- **N8N**: Workflows y automatizaciones
- **ManyChat**: WhatsApp Bot
- **OpenAI**: Agentes de IA para atención al cliente

---

## 📚 Documentación

- **[Guía de Instalación](./INSTALACION.md)**: Setup paso a paso
- **[Configuración del Tenant](./tenants/roar-pulseras/README.md)**: Info del inventario
- **[Schema SQL](./core/database/00-core-schema.sql)**: Documentación de la base de datos

---

## 🎯 Roadmap

- [x] Schema SQL multi-tenant
- [x] Importación de inventario inicial
- [x] Funciones de descuento de stock
- [x] Sistema de alertas
- [ ] API REST genérica
- [ ] Workflows N8N
- [ ] Integración WhatsApp
- [ ] Dashboard web
- [ ] Deploy en EasyPanel

---

## 📞 Soporte

Revisa la [Guía de Instalación](./INSTALACION.md) para troubleshooting.

---

**Última actualización:** 2026-02-17

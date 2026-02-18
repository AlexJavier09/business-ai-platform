# Importación de Inventario - Roar of the Sun

## Inventario Importado

Este directorio contiene los archivos para importar el inventario inicial de pulseras desde Excel a la base de datos.

### Archivos

- **inventario-inicial.sql**: Script SQL directo para importar todos los 47 productos
- **README.md**: Este archivo (documentación)

### Datos Importados

Total de productos: **47** (códigos H001 - H047)

Tipos de piedras incluidas:
- Cuarzo Rosa, Turmalina, Fluorita, Amatista
- Ojo de Tigre, Aventurina Verde, Cuarzo fresa
- Lapis Lazuli, hematita, Turquesa Blanca
- Piedra Solar, Obsidiana, Labradorita
- Amazonita, Soladita, Roca Lava
- Carnelina, Prehnite, Garnete, Apatite
- Citrine, Cuarzo Aumado, Cuarzo claro

### Formatos
- **Bolitas**: Cuentas redondas
- **chips**: Fragmentos irregulares

### Tipos de cuerda
- **Cuerda**: Hilo tradicional
- **elástico**: Hilo elástico

### Cómo Importar

#### Opción 1: Usando el script Node.js (Recomendado)
```bash
cd scripts
node import-inventory.js
```

Este script:
- ✅ Valida la conexión a Supabase
- ✅ Verifica que exista el tenant
- ✅ Inserta o actualiza los productos
- ✅ Muestra un reporte detallado
- ✅ Detecta productos con stock bajo

#### Opción 2: Ejecutar SQL directamente
1. Conecta a tu instancia de Supabase
2. Ejecuta el archivo `inventario-inicial.sql`

### Estructura de Datos

Cada producto se guarda en la tabla `items` con:
- `code`: Código único (H001-H047)
- `stock`: Cantidad disponible (basado en cantidad_D del Excel)
- `data` (JSONB):
  ```json
  {
    "piedra": "Cuarzo Rosa",
    "formato": "Bolitas",
    "cuerda": "Cuerda",
    "cantidad_D": 10,
    "javier": 11,
    "merma": null
  }
  ```

### Notas
- Los productos ya existentes se actualizarán (no se duplican)
- El campo `stock` toma el valor de `cantidad_D`
- Los campos `merma` vacíos se guardan como `null`
- Los campos `javier` vacíos se guardan como `null`

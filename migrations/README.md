# Migraciones - Sistema Académico PWA

## 📋 Estado de Migraciones

| # | Archivo | Estado | Notas |
|---|---------|--------|-------|
| 001 | `001_create_tables.sql` | ⏳ Pendiente de verificar | Crea planificaciones, progresos_academicos, observaciones |
| 002 | `002_create_missing_tables.sql` | ⏳ Pendiente de verificar | Crea students, progresos, observaciones, campos adicionales |
| 003 | `003_auth_profiles.sql` | ⏳ Pendiente de verificar | Crea perfiles para autenticación |
| 004 | `004_rls_policies.sql` | 🔄 Por crear | Políticas de RLS por rol |

---

## 📦 Tablas Creadas por Migración

### Migration 001: `001_create_tables.sql`

| Tabla | Descripción | Relaciones |
|-------|-------------|------------|
| `planificaciones` | Planificación pedagógica de clases | → `clases`, `maestros` |
| `progresos_academicos` | Calificaciones y progreso académico | → `students`, `clases`, `maestros` |
| `observaciones` | Anotaciones y seguimiento | → `students`, `maestros` |

### Migration 002: `002_create_missing_tables.sql`

| Tabla | Descripción | Notas |
|-------|-------------|-------|
| `students` | Tabla principal de estudiantes | Reemplaza/actualiza schema existente |
| `progresos_academicos` | Versión actualizada | Incluye campos opcionales |
| `observaciones` | Versión actualizada | Campos adicionales |
| `planificaciones` | Planificación pedagógica | Tabla completa |

**Campos agregados a tablas existentes:**
- `salones`: `codigo_salon`, `ubicacion`, `piso`, `updated_at`
- `maestros`: `name`, `especialidad`, `bio`, `is_active`

### Migration 003: `003_auth_profiles.sql`

| Tabla | Descripción | Notas |
|-------|-------------|-------|
| `profiles` | Perfiles de usuario (linked a auth.users) | Auto-crea perfil en signup |

---

## 🔒 Row Level Security (RLS)

### Estado Actual (Migration 002 ya aplicada)

| Tabla | RLS Habilitado | Policy |
|-------|---------------|--------|
| `students` | ✅ Sí | `Allow public access` (permisiva) |
| `progresos_academicos` | ✅ Sí | `Allow public access` (permisiva) |
| `observaciones` | ✅ Sí | `Allow public access` (permisiva) |
| `planificaciones` | ✅ Sí | `Allow public access` (permisiva) |
| `profiles` | ❌ No | - |

### Notas Importantes

- **Las políticas actuales son permisivas** (`Allow public access`) - adecuado para desarrollo
- **Migration 004** implementará políticas granulares por rol:
  - `admin`: acceso total a todas las tablas
  - `teacher`: lectura/escritura en sus datos, lectura en students
  - `user` (estudiante): solo lectura de sus propios datos

---

## 🚀 Cómo Ejecutar

1. Abrir **Supabase Dashboard** → **SQL Editor**
2. Seleccionar archivo `001_create_tables.sql`
3. Ejecutar (Ctrl + Enter)
4. Repetir para cada migration en orden numérico
5. Verificar en **Table Editor** que las tablas fueron creadas

> ⚠️ **Nota**: Las políticas actuales permiten acceso público. Para producción, revisar y ajustar según necesidades de seguridad.

---

## 📝 Referencia de Relaciones

```
students (id) ← progresos_academicos (alumno_id)
students (id) ← observaciones (alumno_id)
clases (id) ← planificaciones (clase_id)
clases (id) ← progresos_academicos (clase_id)
maestros (id) ← planificaciones (maestro_id)
maestros (id) ← progresos_academicos (maestro_id)
maestros (id) ← observaciones (maestro_id)
ensembles (id) ← students (ensemble_id)
auth.users (id) ← profiles (id)
```

---

## 📋 Campos por Tabla

### students
```
id (UUID, PK), name, section, ensemble_id, atril, posicion_atril,
parent_email, parent_phone, acudiente, email, cedula,
fecha_nacimiento, genero, direccion, es_activo, final_score
```

### progresos_academicos
```
id (UUID, PK), alumno_id (FK → students), clase_id (FK → clases),
maestro_id (FK → maestros), fecha_evaluacion, tipo_evaluacion,
calificacion, observaciones, estado
```

### observaciones
```
id (UUID, PK), alumno_id (FK → students), maestro_id (FK → maestros),
tipo, titulo, descripcion, prioridad, estado,
fecha_observacion, seguimiento_fecha, seguimiento_observacion
```

### planificaciones
```
id (UUID, PK), clase_id (FK → clases), maestro_id (FK → maestros),
fecha_inicio, tema, objetivos, contenido, recursos,
evaluacion_metodo, observaciones, estado
```

### profiles
```
id (UUID, PK → auth.users), email, full_name, role,
department, avatar_url, is_active
```

---

## Troubleshooting

### Error: "relation already exists"
- Es normal si ejecutas las migraciones dos veces
- El SQL usa `IF NOT EXISTS` para evitar errores

### Error: "foreign key constraint fails"
- Verifica que las tablas referenciadas existen (clases, maestros, students)
- Ejecuta las migraciones en orden

### Error: "syntax error"
- Copia TODO el contenido del archivo (no solo partes)
- Verifica que no hay caracteres especiales en la copia/pegada

---

**Última actualización**: 2026-05-04  
**Estado**: Phase 2 completada - migration 004 por crear
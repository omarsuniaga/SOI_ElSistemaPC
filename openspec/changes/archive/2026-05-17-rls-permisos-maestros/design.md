# Diseño: RLS + Permisos Flexibles para Maestros

## Enfoque Técnico

Migración SQL aditiva (`20260518_rls_permisos_maestros.sql`) que: (1) crea `maestro_actual()` y `tiene_permiso()`, (2) migra permisos booleanos a `text[]`, (3) habilita RLS en ~20 tablas con políticas por pertenencia. Aprovecha helpers existentes (`user_profile()`, `is_admin()`, `profile_is_active()`) del SDD `auth-rls-rearchitecture`.

## Decisiones de Arquitectura

| Decisión | Opciones | Tradeoff | Decisión |
|----------|----------|----------|----------|
| `maestro_actual()` SECURITY DEFINER? | Sí / No | No necesita — query simple sobre `maestros.user_id = auth.uid()`, RLS aplica natural | **NO** — `STABLE`, `LANGUAGE SQL` |
| `tiene_permiso()` SECURITY DEFINER? | Sí / No | Lee `permisos_maestros` que tiene RLS admin; teacher ve su propia fila via `maestro_actual()` | **NO** — `STABLE`, `LANGUAGE SQL` |
| Columnas booleanas: eliminar o preservar? | Drop / Keep + deprecate | Drop rompe frontend existente; Keep da transición suave | **Preservar** — frontend migra después |
| Plan_niveles.clase_id apunta a `plan_clases.id`, no a `clases.id` | Asumir campo extra / No asumir | Schema de referencia no tiene `plan_clases.clase_id`; DB real puede diferir | **Asumir campo extra** `plan_clases.clase_id → clases.id` |
| Admin bypass en nuevas políticas? | Incluir / Omitir | Políticas admin ya existen en `004_rls_policies.sql` | **Omitir** — tablas nuevas solo teacher; admin via políticas previas |

## SQL Arquitectura

### Helpers

```sql
CREATE OR REPLACE FUNCTION public.maestro_actual()
RETURNS uuid AS $$
  SELECT id FROM public.maestros WHERE user_id = auth.uid();
$$ LANGUAGE SQL STABLE;
COMMENT ON FUNCTION public.maestro_actual()
  IS 'Retorna maestros.id del teacher autenticado, NULL si no existe';

CREATE OR REPLACE FUNCTION public.tiene_permiso(p_permiso text)
RETURNS boolean AS $$
  SELECT COALESCE(
    (SELECT p_permiso = ANY(permisos)
     FROM public.permisos_maestros
     WHERE maestro_id = public.maestro_actual()),
    false
  );
$$ LANGUAGE SQL STABLE;
COMMENT ON FUNCTION public.tiene_permiso(text)
  IS 'Verifica si el teacher autenticado tiene un permiso en su arreglo';
```

### Migración permisos → arreglo

```sql
ALTER TABLE public.permisos_maestros
  ADD COLUMN IF NOT EXISTS permisos text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS solicitudes text[] DEFAULT ARRAY[]::text[];

UPDATE public.permisos_maestros
SET permisos = ARRAY(
  SELECT key FROM (VALUES
    ('alumnos:create', puede_registrar_alumnos),
    ('clases:enroll', puede_inscribir_clases)
  ) AS p(key, flag) WHERE flag = true
)::text[];
```

### Índices

```sql
-- Ya existe: idx_permisos_maestros_maestro_id
CREATE INDEX IF NOT EXISTS idx_sesiones_clase_maestro ON public.sesiones_clase(maestro_id, id);
CREATE INDEX IF NOT EXISTS idx_asistencias_sesion ON public.asistencias(sesion_clase_id);
CREATE INDEX IF NOT EXISTS idx_clases_maestro_principal ON public.clases(maestro_principal_id, id);
CREATE INDEX IF NOT EXISTS idx_alumnos_clases_clase_alumno ON public.alumnos_clases(clase_id, alumno_id);
CREATE INDEX IF NOT EXISTS idx_plan_clases_clase ON public.plan_clases(clase_id);
CREATE INDEX IF NOT EXISTS idx_plan_niveles_clase ON public.plan_niveles(clase_id);
CREATE INDEX IF NOT EXISTS idx_plan_temas_nivel ON public.plan_temas(nivel_id);
CREATE INDEX IF NOT EXISTS idx_plan_objetivos_tema ON public.plan_objetivos(tema_id);
CREATE INDEX IF NOT EXISTS idx_plan_indicadores_objetivo ON public.plan_indicadores(objetivo_id);
CREATE INDEX IF NOT EXISTS idx_horarios_clase ON public.horarios(clase_id);
CREATE INDEX IF NOT EXISTS idx_planificaciones_maestro ON public.planificaciones(maestro_id);
CREATE INDEX IF NOT EXISTS idx_planificacion_nodos_maestro ON public.planificacion_nodos(maestro_id);
```

## RLS por Tabla

### P0 — Alta Prioridad

| Tabla | Chain de Pertenencia | Permiso INSERT/UPDATE |
|-------|----------------------|----------------------|
| `plan_indicadores` | `objetivo_id IN (SELECT id FROM plan_objetivos WHERE tema_id IN (SELECT id FROM plan_temas WHERE nivel_id IN (SELECT id FROM plan_niveles WHERE clase_id IN (SELECT id FROM plan_clases WHERE clase_id IN (SELECT id FROM clases WHERE maestro_principal_id = maestro_actual() OR maestro_suplente_id = maestro_actual())))))` | `planificacion:write` |
| `plan_objetivos` | `tema_id IN (SELECT id FROM plan_temas WHERE nivel_id IN (SELECT id FROM plan_niveles WHERE clase_id IN (SELECT id FROM plan_clases WHERE clase_id IN (...))))` | `planificacion:write` |
| `plan_niveles` | `clase_id IN (SELECT id FROM plan_clases WHERE clase_id IN (SELECT id FROM clases WHERE maestro_principal_id = maestro_actual() OR maestro_suplente_id = maestro_actual()))` | `planificacion:write` |
| `plan_temas` | `nivel_id IN (SELECT id FROM plan_niveles WHERE clase_id IN (SELECT id FROM plan_clases WHERE clase_id IN (...)))` | `planificacion:write` |
| `alumnos_clases` | `clase_id IN (SELECT id FROM clases WHERE maestro_principal_id = maestro_actual() OR maestro_suplente_id = maestro_actual())` | `clases:enroll` |
| `asistencias` | `sesion_clase_id IN (SELECT id FROM sesiones_clase WHERE maestro_id = maestro_actual())` | `asistencias:write` |
| `planificaciones` | `maestro_id = maestro_actual()` | `planificacion:write` |
| `plan_clases` | `clase_id IN (SELECT id FROM clases WHERE maestro_principal_id = maestro_actual() OR maestro_suplente_id = maestro_actual())` | (solo SELECT por ahora) |
| `planificacion_nodos` | `maestro_id = maestro_actual()` | `planificacion:write` |

### P1 — Core Diario

| Tabla | Chain de Pertenencia | Permiso |
|-------|----------------------|---------|
| `alumnos` | `id IN (SELECT alumno_id FROM alumnos_clases WHERE clase_id IN (SELECT id FROM clases WHERE maestro_principal_id = maestro_actual() OR maestro_suplente_id = maestro_actual()))` | — |
| `clases` | `maestro_principal_id = maestro_actual() OR maestro_suplente_id = maestro_actual()` | — |
| `sesiones_clase` | `maestro_id = maestro_actual()` | — |
| `horarios` | `clase_id IN (SELECT id FROM clases WHERE maestro_principal_id = maestro_actual() OR maestro_suplente_id = maestro_actual())` | — |
| `contenidos_sesion` | `sesion_clase_id IN (SELECT id FROM sesiones_clase WHERE maestro_id = maestro_actual())` | — |

> P1 solo SELECT por ahora. INSERT/UPDATE se habilitan en SDD futuro. La política `maestro_actual() IS NOT NULL` en USING protege que el teacher esté autenticado.

### P2 — Secundarias

| Tabla | Chain de Pertenencia | Permiso |
|-------|----------------------|---------|
| `ausencias` | `alumno_id IN (SELECT a.alumno_id FROM alumnos_clases a JOIN clases c ON a.clase_id = c.id WHERE c.maestro_principal_id = maestro_actual() OR c.maestro_suplente_id = maestro_actual())` | — |
| `justificaciones` | mismo chain que ausencias (via alumno_id) | — |
| `progresos` | mismo chain (via alumno_id) | — |
| `observaciones_sesion` | `sesion_id IN (SELECT id FROM sesiones_clase WHERE maestro_id = maestro_actual())` | — |
| `observaciones_alumnos` | `alumno_id IN (SELECT alumno_id FROM alumnos_clases WHERE ...)` | — |
| `planificacion` | ⚠️ Sin `maestro_id` en schema — requiere investigación. Posible: `programa_id` global | — |

> `planificacion` (singular) es un caso especial — no tiene FK a `maestros`. Propuesta: mantener sin RLS por ahora (solo admin), o agregar columna `maestro_id` en migración separada. **Decisión diferida a implementación.**

## Resumen de Políticas por Tabla (formato corto)

Para cada tabla P0+P1+P2 (excepto `planificacion`), se crean 3 políticas:

```
maestro_select → FOR SELECT TO authenticated USING (<chain>)
maestro_insert → FOR INSERT TO authenticated WITH CHECK (maestro_actual() IS NOT NULL AND tiene_permiso('<perm>'))
maestro_update → FOR UPDATE TO authenticated USING (<chain>) WITH CHECK (maestro_actual() IS NOT NULL AND tiene_permiso('<perm>'))
```

DELETE no se concede a `authenticated`. Admin mantiene acceso via políticas pre-existentes (`004_rls_policies.sql`, `20260517_auth_rls_fix.sql`).

## GRANTS

```sql
-- Los helpers son invocables por cualquier rol autenticado
GRANT EXECUTE ON FUNCTION public.maestro_actual() TO authenticated;
GRANT EXECUTE ON FUNCTION public.tiene_permiso(text) TO authenticated;
```

## Cambios de Archivos

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `supabase/migrations/20260518_rls_permisos_maestros.sql` | Crear | Migración completa: helpers + migración array + RLS ~20 tablas |
| `src/modules/permisos/api/permisosSupabase.js` | Modificar | `actualizarPermiso()` escribe en arreglo `permisos` además de booleanos |
| `src/modules/permisos/api/permisosMock.js` | Modificar | Agregar campo `permisos: string[]` al mock data |
| `src/modules/permisos/models/permiso.model.js` | Modificar | Agregar propiedad `permisos` al modelo (arreglo) |
| `src/assets/data/mocks/permisos.json` | Modificar | Agregar campo `permisos` a cada registro mock |
| `src/__tests__/permisoService.test.js` | Modificar | Tests para mapeo arreglo → booleano |

## Estrategia de Pruebas

| Capa | Qué probar | Cómo |
|------|-----------|------|
| SQL | `maestro_actual()` retorna NULL sin auth | Script SQL directo en migración (DO block) |
| SQL | `tiene_permiso()` match/no match | Script SQL con casos borde |
| SQL | Migración array desde booleanos | UPDATE + SELECT de verificación |
| Unit (Vitest) | `permisoService.getPermisos()` con arreglo → booleano | Mock de API con y sin permisos |
| Integration | RLS: teacher ve solo sus filas | Supabase local con auth context simulado |

## Migración / Rollout

**Fase 1 (esta migración)**: Crear helpers + migrar permisos + agregar índices. RLS se habilita en la misma migración. Las tablas P0 son las más críticas porque el frontend ya espera RLS.

**Riesgo conocido**: Queries existentes que SELECT sin contexto de usuario devolverán 0 filas post-RLS. Esto es **comportamiento esperado** y deseado — el bug es de las queries, no de RLS.

**Rollback**: `DISABLE ROW LEVEL SECURITY` en tablas problemáticas + `DROP FUNCTION maestro_actual(), tiene_permiso()`. La migración de columnas (ADD COLUMN) no requiere rollback — las columnas adicionales son inertes.

## Preguntas Abiertas

- [ ] `plan_clases` tiene `clase_id → clases.id` en la DB real? Schema de referencia no lo muestra.
- [ ] `planificacion` (singular) — sin FK a maestros. Mantener sin RLS o agregar columna?
- [ ] `clases.maestro_id` (columna adicional, no `maestro_principal_id`) — ¿debe incluirse en la policy SELECT?

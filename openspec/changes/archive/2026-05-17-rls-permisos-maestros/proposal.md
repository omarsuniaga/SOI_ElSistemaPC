# Propuesta: RLS + Permisos Flexibles para Maestros

## Problema

Hoy ~20 tablas que los maestros usan a diario no tienen RLS (alumnos_clases, asistencias, plan_indicadores, plan_objetivos, etc.) o tienen políticas role-based sin filtrar por pertenencia. Un teacher autenticado puede leer/escribir datos de otros maestros. El modelo de permisos actual (booleanos fijos) no escala a nuevos tipos de permiso.

## Intención

Proteger el acceso maestro a las ~20 tablas de su trabajo diario vía RLS con políticas basadas en pertenencia (maestro_id, clase_id → maestro), y migrar el modelo de permisos de booleanos a un arreglo flexible que permita agregar nuevos permisos sin cambiar schema.

## Scope

### In
- Helpers `maestro_actual()` y `tiene_permiso(permiso text)`
- Migrar `puede_registrar_alumnos`/`puede_inscribir_clases` a arreglo `permisos text[]` + columna `solicitudes text[]`
- ENABLE RLS en todas las tablas listadas (20)
- Políticas SELECT/INSERT/UPDATE/DELETE por tabla usando los helpers
- GRANT USAGE a `authenticated`

### Out
- UI de solicitud de permisos (futuro SDD)
- ~45 tablas admin-only sin interacción de maestro
- Roles de estudiante (`user`)

## Capacidades

### Nuevas
- `rls-permisos-maestros`: Políticas RLS por pertenencia + permisos flexibles para maestros

### Modificadas
- `teacher-permissions`: Modelo de permisos migra de columnas booleanas a arreglo text; helpers reemplazan lógica inline

## Enfoque

Dos fases, un solo SDD. Tablas priorizadas por impacto (P0 corregir RLS deshabilitado manualmente + bloqueos de frontend, P1 uso diario, P2 secundarias).

| Prioridad | Tablas | Criterio |
|-----------|--------|----------|
| P0 | plan_indicadores, plan_objetivos, plan_niveles, plan_temas | RLS deshabilitado manualmente |
| P0 | alumnos_clases, asistencias, planificaciones, plan_clases, planificacion_nodos | Bloquean frontend |
| P1 | alumnos, clases, sesiones_clase, horarios, contenidos_sesion | Core diario |
| P2 | ausencias, justificaciones, progresos, observaciones_sesion, observaciones_alumnos, planificacion | Secundarias |

## Áreas Afectadas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `supabase/migrations/` | Nueva migración | Helpers + migración permisos + políticas RLS (~20 tablas) |
| `src/lib/permisoService/` | Modificado | Adaptar a modelo de arreglo (mapeo permisos) |
| `openspec/specs/teacher-permissions/spec.md` | Modificado | Reflejar nuevo modelo de permisos |

## Riesgos

| Riesgo | Prob. | Mitigación |
|--------|-------|------------|
| Activar RLS rompe queries existentes sin contexto de usuario | Alta | Políticas SELECT permisivas (teacher ve lo suyo); fase 1 despliega helpers sin activar RLS |
| Migración de booleanos a arreglo pierde datos | Baja | Migración con COALESCE: `ARRAY['alumnos:create']` WHERE `puede_registrar_alumnos=true` |
| Políticas anidadas lentas (joins profundos) | Media | Usar subqueries con índices; `maestro_actual()` es STABLE, se cachea por transacción |

## Rollback

1. Deshabilitar RLS en tablas problemáticas: `ALTER TABLE ... DISABLE ROW LEVEL SECURITY`
2. Revertir migración de permisos: restaurar snapshot previo de `permisos_maestros`
3. Drop helpers: `DROP FUNCTION IF EXISTS maestro_actual(), tiene_permiso()`

## Dependencias

- Cambio `auth-rls-rearchitecture` completado (flujo auth + admin approval funcional)
- Tabla `maestros` debe tener `id UUID` vinculado a `auth.users`

## Criterios de Éxito

- [ ] `maestro_actual()` devuelve el registro del teacher autenticado
- [ ] `tiene_permiso('alumnos:create')` retorna true solo si el permiso está en el arreglo
- [ ] Todas las tablas listadas tienen RLS habilitado con políticas por pertenencia
- [ ] Admin puede seguir gestionando permisos (booleano → arreglo)
- [ ] Migración existente en `004_rls_policies.sql` y `007_academic_route_rls.sql` no se rompe

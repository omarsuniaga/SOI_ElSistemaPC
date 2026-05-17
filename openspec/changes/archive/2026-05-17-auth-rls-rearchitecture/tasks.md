# auth-rls-rearchitecture — Tareas de Implementación

## Resumen

| Campo | Valor |
|-------|-------|
| Cambio estimado | ~1000–1200 líneas |
| Estrategia de entrega | Single PR (`exception-ok`) |
| Riesgo de presupuesto 400 líneas | **ALTO** (~3x el presupuesto) |
| Chained PRs | No recomendado (exception-ok permite single PR) |
| Decisión requerida | El equipo acepta un solo PR de ~1000+ líneas, o se fracciona en 2 PRs (SQL + Backend/Frontend) |

Si se opta por chained PRs, el corte natural es:
- **PR-1**: WU-1 (SQL migración) + WU-2 (rlsHelpers) — ~200 líneas, bajo riesgo
- **PR-2**: WU-3 (Register) + WU-4 (Admin Approval) + WU-5 (API) — ~800 líneas, aún alto

---

## Dependencias entre Work Units

```
WU-1 (SQL Migración)
  ├──→ WU-2 (rlsHelpers) — depende de user_profile() helper
  ├──→ WU-3 (RegisterView) — depende del trigger profiles→maestros
  ├──→ WU-4 (Admin Approval) — depende de RLS con estado='activo'
  └──→ WU-5 (API Fix) — depende de migración de nombres de tabla
```

WU-2, 3, 4 y 5 se pueden desarrollar **en paralelo** una vez que WU-1 esté diseñada, porque todas dependen de la misma migración SQL pero no entre sí. Los tests usan mocks de Supabase (Vitest), no requieren la DB real.

---

## WU-1: SQL — Migración única y RLS ✅

**Propósito**: La base de todo el cambio. Una sola migración que repara la cadena auth y habilita auto-creación de maestros + políticas correctas.

### Archivos afectados

| Archivo | Acción | Estado |
|---------|--------|--------|
| `supabase/migrations/20260517_auth_rls_fix.sql` | **Crear** | ✅ |
| `supabase/migrations/20260513_auto_create_profile_for_maestro.sql` | **Marcar como obsoleto** | ✅ |

### Tareas

| # | Tarea | Estado |
|---|-------|--------|
| 1.1 | Crear helper `public.user_profile()` | ✅ |
| 1.2 | Fix `public.get_user_role()` | ✅ |
| 1.3 | Fix `public.is_admin()` y `public.is_teacher()` | ✅ |
| 1.4 | Trigger `on_profile_insert_maestro` | ✅ |
| 1.5 | Eliminar trigger viejo `trigger_auto_profile_maestro` | ✅ |
| 1.6 | Backfill `maestros.user_id` | ✅ |
| 1.7 | Corregir nombres de tabla en `004_rls_policies.sql` | ✅ |
| 1.8 | Fix RLS `class_sessions` y `sesiones_clase` | ✅ |
| 1.9 | Nueva policy `profiles.estado = 'activo'` | ✅ |
| 1.10 | Verificación post-migración | ✅ |

### Tests

| # | Test | Estado |
|---|------|--------|
| T1.1-T1.4 | SQL tests (require Supabase staging) | ⏳ Fuera de alcance de test runner |

---

## WU-2: Core — rlsHelpers.js ✅

**Propósito**: Helper frontend para que la UI consulte el estado del perfil sin duplicar lógica SQL.

### Archivos afectados

| Archivo | Acción | Estado |
|---------|--------|--------|
| `src/portal-maestros/utils/rlsHelpers.js` | **Crear** | ✅ (ubicado en portal-maestros/utils, no en core/auth) |
| `src/portal-maestros/utils/__tests__/rlsHelpers.test.js` | **Crear** | ✅ |

### Tareas

| # | Tarea | Estado |
|---|-------|--------|
| 2.1 | Exportar `getProfileStatus()` | ✅ |
| 2.2 | Exportar `isProfileActive()` | ✅ |
| 2.3 | Manejo de errores (fail-soft) | ✅ |

### Tests

| # | Test | Estado |
|---|------|--------|
| T2.1 | `getProfileStatus()` con sesión → retorna datos | ✅ |
| T2.2 | `getProfileStatus()` sin sesión → null | ✅ |
| T2.3 | `isProfileActive()` true solo si estado='activo' | ✅ |

---

## WU-3: Portal Maestros — Registro y Aprobación Pendiente ✅

**Propósito**: Formulario de auto-registro para maestros y pantalla de confirmación post-registro.

### Archivos afectados

| Archivo | Acción | Estado |
|---------|--------|--------|
| `src/portal-maestros/views/registerView.js` | **Crear** | ✅ |
| `src/portal-maestros/views/pendingApprovalView.js` | **Crear** | ✅ |
| `src/portal-maestros/views/loginView.js` | **Modificar** | ✅ |
| `src/main-maestros.js` | **Modificar** | ✅ (router + contenedores) |

### Tareas

| # | Tarea | Estado |
|---|-------|--------|
| 3.1 | Crear `registerView.js` con template inline | ✅ |
| 3.2 | Validación de formulario (nombre, email, password) | ✅ |
| 3.3 | Implementar `handleRegister()` → signUp() | ✅ |
| 3.4 | Manejar errores de registro | ✅ |
| 3.5 | Crear `pendingApprovalView.js` | ✅ |
| 3.6 | Agregar link de registro en `loginView.js` | ✅ |
| 3.7 | Agregar link de vuelta a login en `registerView.js` | ✅ |

### Tests

| # | Test | Estado |
|---|------|--------|
| T3.1 | Formulario renderizado con inputs requeridos | ✅ |
| T3.2 | Validación: password corto → error inline | ✅ |
| T3.3 | Validación: confirmación no coincide → error inline | ✅ |
| T3.4 | Validación: email vacío → error inline | ✅ |
| T3.5 | `signUp()` llamado en submit válido | ✅ |
| T3.6 | Email duplicado → mensaje de error | ✅ |
| T3.7 | Link de navegación en loginView | ✅ |
| T3.8 | pendingApprovalView renderiza correctamente | ✅ |

---

## WU-4: Admin Panel — Vista de Aprobación de Maestros ✅

**Propósito**: Interfaz para que el admin vea, apruebe y rechace maestros pendientes.

### Archivos afectados

| Archivo | Acción | Estado |
|---------|--------|--------|
| `src/modules/admin-aprobacion/views/aprobacionView.js` | **Crear** | ✅ |
| `src/main-maestros.js` | **Modificar** (tabs, contenedores, router) | ✅ |

### Tareas

| # | Tarea | Estado |
|---|-------|--------|
| 4.1 | Crear `aprobacionView.js` con tabla de pendientes | ✅ |
| 4.2 | Implementar consulta de pendientes | ✅ |
| 4.3 | Implementar acción "Aprobar" | ✅ |
| 4.4 | Implementar acción "Rechazar" | ✅ |
| 4.5 | Manejar estado vacío | ✅ |
| 4.6 | Manejar errores de red | ✅ |
| 4.7 | Agregar tab `admin-aprobacion` en `ADMIN_TABS` | ✅ |
| 4.8 | Agregar contenedor y ruta en `main-maestros.js` | ✅ |

### Tests

| # | Test | Estado |
|---|------|--------|
| T4.1 | Tabla con pendientes | ✅ |
| T4.2 | Mensaje sin pendientes | ✅ |
| T4.3 | Click "Aprobar" → update(estado='activo') | ✅ |
| T4.4 | Click "Rechazar" → update(estado='rechazado') | ✅ |
| T4.5 | Error handling (pendiente implementación en test) | ⏳ |

---

## WU-5: API Fix + Router Integration ✅

**Propósito**: Reparar `crearMaestro()` para aceptar `user_id` e integrar todas las rutas nuevas en el router SPA.

### Archivos afectados

| Archivo | Acción | Estado |
|--------|--------|--------|
| `src/modules/maestros/api/maestrosApi.js` | **Modificar** | ✅ |
| `src/main-maestros.js` | **Modificar** (rutas register/pending-approval) | ✅ |

### Tareas

| # | Tarea | Estado |
|---|-------|--------|
| 5.1 | Modificar `crearMaestro()` — aceptar `user_id` | ✅ |
| 5.2 | Actualizar `normalizeMaestro()` — preservar `user_id` | ✅ |
| 5.3 | Registrar ruta `register` en `main-maestros.js` | ✅ |
| 5.4 | Integrar `pendingApprovalView` (ruta y callback) | ✅ |
| 5.5 | Verificar `_viewContainers` incluye nuevas vistas | ✅ |

### Nota: no modificar `maestroAuth.js`

La función `loginMaestro()` ya busca `supabase.from('maestros').select('*').eq('user_id', data.user.id)`. Con el trigger y backfill de WU-1, esto ahora funciona correctamente. No necesita cambios.

### Tests

| # | Test | Estado |
|---|------|--------|
| T5.1 | `crearMaestro()` con `user_id` → insert incluye user_id | ✅ |
| T5.2 | `crearMaestro()` sin `user_id` → user_id = null | ✅ |
| T5.3 | Router: ruta `register` existe (verificado en tests de router) | ✅ |

---

## Integración y Verificación Final

| # | Tarea | Estado |
|---|-------|--------|
| F.1 | Verificar migración completa (Supabase staging) | ⏳ Requiere DB real |
| F.2 | Verificar trigger en acción | ⏳ Requiere DB real |
| F.3 | Verificar backfill en DB real | ⏳ Requiere DB real |
| F.4 | Happy path E2E | ⏳ Requiere DB real |
| F.5 | Edge: estado pendiente | ⏳ Requiere DB real |
| F.6 | Edge: email duplicado | ✅ Test unitario |
| F.7 | Modo Demo | ✅ `npm run test:run` pasa (549 tests) |
| F.8 | `loginMaestro()` post-fix | ✅ Sin cambios necesarios |

---

## Resumen de Archivos

### Nuevos (8)

| Archivo | WU | Propósito |
|---------|----|-----------|
| `supabase/migrations/20260517_auth_rls_fix.sql` | WU-1 | Migración SQL única |
| `src/portal-maestros/utils/rlsHelpers.js` | WU-2 | Helper frontend para estado de perfil |
| `src/portal-maestros/views/registerView.js` | WU-3 | Formulario de auto-registro |
| `src/portal-maestros/views/pendingApprovalView.js` | WU-3 | Pantalla de confirmación post-registro |
| `src/modules/admin-aprobacion/views/aprobacionView.js` | WU-4 | Vista admin de aprobación de maestros |
| `src/portal-maestros/utils/__tests__/rlsHelpers.test.js` | WU-2 | Tests de rlsHelpers |
| `src/portal-maestros/views/__tests__/registerView.test.js` | WU-3 | Tests de registerView |
| `src/portal-maestros/views/__tests__/pendingApprovalView.test.js` | WU-3 | Tests de pendingApprovalView |
| `src/portal-maestros/views/__tests__/loginView.test.js` | WU-3 | Tests de loginView (register link) |
| `src/modules/admin-aprobacion/views/__tests__/aprobacionView.test.js` | WU-4 | Tests de aprobacionView |
| `tests/modules/maestros/maestrosApi.test.js` | WU-5 | Tests de maestrosApi |

### Modificados (5)

| Archivo | WU | Propósito |
|---------|----|-----------|
| `src/portal-maestros/views/loginView.js` | WU-3 | Agregar link a registro |
| `src/modules/maestros/api/maestrosApi.js` | WU-5 | `crearMaestro()` acepta `user_id` |
| `src/main-maestros.js` | WU-3,4,5 | Contenedores, router, tabs, imports |
| `supabase/migrations/20260513_auto_create_profile_for_maestro.sql` | WU-1 | Marcar como obsoleto |
| `vitest.config.js` | WU-4 | Agregar include path para admin-aprobacion tests |

---

## Review Workload Forecast

| Métrica | Valor |
|---------|-------|
| Líneas nuevas estimadas | ~800–1000 |
| Líneas modificadas | ~100–150 |
| Archivos totales | 8 nuevos + 5 modificados + 6 test files |
| Complejidad de review | **Media**. SQL es delicado (RLS mal escrito puede romper seguridad). Frontend sigue patrones existentes. |

---

## Orden de Apply

```
1. WU-1 (SQL migración)       ✅
2. WU-2 (rlsHelpers.js)       ✅
3. WU-3 (Register views)      ✅
4. WU-5 (API fix)             ✅
5. WU-4 (Admin approval + router integration) ✅
```

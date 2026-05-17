# Design: auth-rls-rearchitecture

## Technical Approach

Reparar la cadena auth en 3 capas: SQL (trigger profiles→maestros + RLS fixes), Portal Maestros (registro con aprobación), Admin Panel (vista de aprobación). Fuente única de activación: `profiles.estado`.

---

## Architecture Decisions

### D1: Trigger direction

| Opción | Tradeoff | Decisión |
|--------|----------|----------|
| `profiles→maestros` AFTER INSERT | Flujo natural: signUp → handle_new_user → profiles → maestros | **Elegido** |
| Mantener trigger `maestros→profiles` (20260513) | Dependencia circular, era workaround | Se elimina |
| Trigger bidireccional | Complejidad innecesaria | Descartado |

### D2: RLS subquery pattern

`class_sessions` usa `maestro_id = auth.uid()` pero maestro_id apunta a `maestros.id`, no a `auth.users.id`. Se reemplaza por:

```sql
maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
```

### D3: Helper layers

| Capa | Función | Uso |
|------|---------|-----|
| SQL | `public.user_profile()` → RECORD | Políticas RLS verifican `estado` y `rol` |
| Frontend | `rlsHelpers.getProfileStatus()` | UI consulta estado sin duplicar lógica |

### D4: Register view sigue patrón loginView

Misma arquitectura: `renderRegisterView(container)` + template inline + `attachEvents()`. Sin framework extra.

---

## Data Flow

### Happy path

```
Teacher → signUp(email,pass,{rol:'maestro'})
  → handle_new_user INSERT profiles(estado='pendiente',rol='maestro')
  → NEW trigger INSERT maestros(user_id,correo,nombre_completo)
  → "Registro exitoso. Esperá aprobación."

Admin → GET profiles WHERE estado='pendiente'
  → UPDATE profiles SET estado='activo' WHERE id=X

Teacher → signInWithPassword → loginMaestro()
  → SELECT maestros WHERE user_id=auth.uid() → acceso concedido
```

### RLS deny (estado='pendiente')

```
Teacher autenticado → SELECT sesiones_clase → RLS:
  (SELECT user_profile().estado = 'activo') → false → 0 filas
```

---

## SQL Architecture

### Migración única: `20260517_auth_rls_fix.sql`

| Orden | Paso | Detalle |
|-------|------|---------|
| 1 | `user_profile()` helper | `SELECT * FROM profiles WHERE id = auth.uid()` |
| 2 | Fix `get_user_role()` | `role` → `rol` |
| 3 | Fix `is_admin()`/`is_teacher()` | Usan `get_user_role()` corregida |
| 4 | Trigger `on_profile_insert_maestro` | AFTER INSERT ON profiles, WHEN rol='maestro' |
| 5 | Backfill `maestros.user_id` | UPDATE via JOIN auth.users ON correo |
| 6 | DROP+CREATE RLS policies | Renombrar tablas: students→alumnos, progresos_academicos→progresos, observaciones→observaciones_sesion |
| 7 | Fix `class_sessions` RLS | Subquery via maestros.user_id |
| 8 | Policy `profiles.estado = 'activo'` | `(SELECT user_profile().estado = 'activo')` |

### Trigger code (no-obvious pattern)

```sql
CREATE OR REPLACE FUNCTION public.handle_profile_insert_maestro()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rol = 'maestro' THEN
    INSERT INTO public.maestros (user_id, correo, nombre_completo, activo)
    VALUES (NEW.id, NEW.email, NEW.nombre_completo, true)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_insert_maestro
  AFTER INSERT ON public.profiles
  FOR EACH ROW WHEN (NEW.rol = 'maestro')
  EXECUTE FUNCTION public.handle_profile_insert_maestro();
```

### Backfill

```sql
UPDATE public.maestros m SET user_id = au.id
FROM auth.users au WHERE m.correo = au.email AND m.user_id IS NULL;
```

---

## JS Architecture

### Component tree

```
registerView.js                  → Portal Maestros (nuevo)
├── renderRegisterView()
│   └── Form: nombre, email, password, confirmar, instrumento, resena
├── attachEvents()
│   ├── password validation (6+ chars)
│   ├── confirm match
│   └── submit → signUp()
└── handleRegister()
    ├── authManager.register(email, pass, {full_name, rol:'maestro'})
    ├── Éxito → pendingApprovalView "Esperá aprobación"
    └── Error → toast inline

aprobacionView.js                → Admin Panel (nuevo, ruta admin-aprobacion)
├── GET profiles WHERE rol='maestro' AND estado='pendiente'
├── Tabla: nombre, email, instrumento, fecha, botones Aprobar/Rechazar
├── Aprobar → UPDATE profiles SET estado='activo'
└── Rechazar → UPDATE profiles SET estado='rechazado'

maestrosApi.js (modificar)
└── crearMaestro() acepta user_id en payload

rlsHelpers.js                    → core/auth (nuevo)
└── getProfileStatus() → {estado, rol} via profiles WHERE id=auth.uid()
```

### Router integration (main-maestros.js)

- Agregar `register` y `admin-aprobacion` en `_initViewContainers()`
- `router.on('register', ...)`
- `router.on('admin-aprobacion', ...)` — protegido por is_admin
- Agregar tab en `ADMIN_TABS`

---

## File Change Inventory

| Archivo | Acción |
|---------|--------|
| `supabase/migrations/20260517_auth_rls_fix.sql` | Crear |
| `src/portal-maestros/views/registerView.js` | Crear |
| `src/portal-maestros/views/pendingApprovalView.js` | Crear |
| `src/modules/admin-aprobacion/views/aprobacionView.js` | Crear |
| `src/core/auth/rlsHelpers.js` | Crear |
| `src/main-maestros.js` | Modificar (rutas + tabs) |
| `src/portal-maestros/views/loginView.js` | Modificar (link registro) |
| `src/modules/maestros/api/maestrosApi.js` | Modificar (user_id) |

---

## Risk Mitigation

| Riesgo | Mitigación |
|--------|------------|
| Maestros sin user_id | Backfill por email. Sin match → quedan NULL, admin vincula manual |
| Trigger circular | Se elimina trigger viejo `trigger_auto_profile_maestro` |
| handle_new_user inserta sin rol='maestro' | Trigger chequea `WHEN (rol = 'maestro')` — no-op si no corresponde |
| Supabase offline en signUp | Error manejado con toast + datos preservados |
| RLS roto durante migración | DROP previo antes de CREATE — sin ventana sin política |

---

## Open Questions

- [ ] Notificar admin por email al registrarse teacher? → No (scope actual)
- [ ] Admin puede re-editar maestro rechazado? → No (manual en DB si necesario)

# Portal `fin` — Backlog

**Última actualización:** 2026-09-07
**Portal:** `src/portales/fin/` (React + TS + Tailwind, arquitectura hexagonal). Servido en `/fin`
(alias `/soi-finanzas`). Antes se llamó `soi-finanzas`; el portal de cobro vanilla-JS
(`src/modules/caja/`) se **eliminó** (queda en git). Ver `src/portales/fin/README.md`,
`docs/PORTAL_FIN_MENU_AUDITORIA.md` (auditoría del menú vanilla, histórica),
`docs/planning/BRIEF_REDISENO_CUOTASVIEW.md`.

---

## Módulo 1 — Cobro de Mensualidades ✅ (backend + frontend base)

### Backend — todo en prod (`zmhmdvmyeyswunurcyow`)
- [x] Vista `vw_alumno_estado_pago` (`security_invoker`) — modelo de lectura por alumno.
- [x] `fn_registrar_pago_transaccional(…, p_cuota_ids, p_fecha_pago DEFAULT)` — pago atómico,
      FIFO (cuotas seleccionadas + resto de la familia), mora contra fecha contable,
      **excedente → wallet** (D7).
- [x] `fn_generar_ciclo_cuotas(mes, anio, 60000)` — respeta exentos y becas · **cron día 1**
      (`finanzas_generar_ciclo_cuotas_mensual`).
- [x] `pagos.fecha_pago`, `alumnos.exento_mensualidad`.
- [x] Trigger `trg_beca_anula_cuotas_abiertas` — beca registrada tarde ⇒ cuotas de mensualidad
      abiertas del alumno pasan a `becada`, se perdona el saldo.

### Frontend — `src/portales/fin/`
- [x] Hook `useAlumnosCartera` (lee `vw_alumno_estado_pago`) · `lib/carteraHelpers.ts` (+tests).
- [x] `views/CuotasView.tsx` reescrito — una fila por alumno, pestañas
      Pendientes / Al día-Becados / **Deudas de retirados** / Todos, fila expandible.
- [x] `p_fecha_pago` cableado en `SupabasePaymentTransactionAdapter` (`RegistroPagoView` ya
      tenía el campo "Fecha de Valor").
- [x] `tsc --noEmit -p tsconfig.json` → **0 errores** (se limpiaron los 4 del baseline).

### Follow-ups del módulo (no bloquean)
- [ ] `useAlumnosCartera` degrada a error si falla el fetch — considerar fallback a
      `useFinance()` (alumnos+cuotas ya cargados) para modo cache-degradado.
- [ ] Ficha del alumno como modal completo (hoy es fila expandible) con último pago + historial.
- [ ] Regenerar `src/infrastructure/supabase/database.types.ts` cuando cambie el esquema.

---

## Operativo — antes de facturar (Omar / super admin)
- [ ] **Perfil de Katherine** con `rol='finanzas'` — se crea desde el **portal admin** (la RLS y
      la RPC ya aceptan ese rol; `profiles.rol` es `text`).
- [ ] **Cargar becas reales** en `public.becas` (0 filas hoy; hay becados de Operación Genoma).
      El trigger anula el cobro pendiente si se cargan tarde.
- [ ] **Generar septiembre 2026** — `SELECT fn_generar_ciclo_cuotas(9, 2026, 60000);` — NO
      ejecutado (sobre-facturaría a los becados hasta cargar `becas`). Octubre+ lo cubre el cron.
- [ ] Revisar los ~41 alumnos activos sin cuota de agosto (237 cuotas / 278 activos).

---

## Otras vistas del portal `fin` (React) — estado

El portal trae ~20 vistas heredadas de `soi-finanzas` (`src/portales/fin/src/views/`). La mayoría
opera sobre `FinanceContext` (estado en memoria / borrador) y **no están conectadas a Supabase**.
Cablear cada una a datos reales es su propio módulo:

| Vista | Nota |
|---|---|
| `CuotasView` | ✅ conectada (`vw_alumno_estado_pago` + RPC) |
| `RegistroPagoView` | ✅ conectada (`fn_registrar_pago_transaccional`) |
| `MoraCobranzaView`, `FamiliasView`, `Ficha360View` | leen de `useAuthoritativeReceivables` (familias/alumnos/cuotas/pagos reales) — parcialmente conectadas |
| `NominaView`, `GastosFijosView`, `PresupuestoView`, `BancosConciliacionView`, `ContabilidadLibroView`, `FacturasGastoView`, `CajaDiariaView`, `BecasView`, `TienditaView`, `LutheriaInventarioView` | **borrador** — `FinanceContext` / `initialData.ts`, sin persistencia real |
| `DashboardView`, `MyDayView`, `SupabaseSettingsView` | mixtas |

---

## Deuda técnica transversal
- [ ] **`tsc --noEmit` en CI del portal** — hoy el build de vite solo transpila; los tipos no se
      chequean en CI y acumulan deuda (se llegaron a juntar 4 errores).
- [ ] **Reconciliación esquema repo ↔ prod** — varias migraciones del repo nunca se aplicaron
      (`20260823192500_programa_becas_patrocinios` → `alumnos_beneficios` no existe en prod).
      El `database.types.ts` regenerado (20.945 líneas vs 11.855) sugiere drift grande.
      Hacer: `supabase db dump` de prod, diff contra `supabase/migrations/`, marcar/squash baseline.
- [ ] **`fn_decrementar_stock`** — la migración `20260905210000_fn_decrementar_stock.sql` está en
      el repo pero **sin aplicar a prod**. Solo importa si se conecta `TienditaView`.
- [ ] **`.github/workflows/db-migrate.yml`** — hoy las migraciones se aplican a mano (vía MCP
      `apply_migration`). Automatizar al merge.
- [ ] **`familias.activa`** = `true` en las 298 — bandera sin mantener; el módulo se apoya en
      `alumnos.activo`.
- [ ] **Supabase Pro** (~US$25/mes) — habilita branches de staging para validar migraciones
      antes de prod.

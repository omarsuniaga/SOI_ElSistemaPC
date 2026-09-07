# Portal FIN — Backlog (huella de pendientes)

**Última actualización:** 2026-09-06
**Decisión marco (Omar):** concentrarse en lo vital — **registrar el pago mensual de los
alumnos** — y reactivar el resto **módulo a módulo**. Nada se borra; todo queda registrado acá.

Detalle del estado del cableado de cada vista: [`PORTAL_FIN_MENU_AUDITORIA.md`](./PORTAL_FIN_MENU_AUDITORIA.md).
Contrato del backend y reparto de agentes: `~/docs/ARQUITECTURA_MODULO_COBRO_reparto_agentes.md`.

---

## En curso — Módulo 1: Cobro de Mensualidades

### Backend (`be/*`)
- [x] Fase 0 — 4 migraciones aplicadas a prod (2026-09-06): cron mensual de cuotas, `exento_mensualidad` + becas en `fn_generar_ciclo_cuotas`, `pagos.fecha_pago` + RPC reescrita, vista `vw_alumno_estado_pago` con `security_invoker`.
- [ ] `be/cuotas-alumno` — helpers `buscarAlumnos(q)`, `getCuotasByAlumno(id)`, `listarAlumnosPorEstado(estado)` en `cajaSupabase.js` + `cajaMock.js` + tests + export en `cajaApi.js`.
- [ ] `registroPagoView` / `registrarPago`: pasar `fecha_pago` editable a la RPC.

### Frontend (`fe/*`)
- [ ] `#/cobro` — búsqueda unificada alumno / representante / familia sobre `vw_alumno_estado_pago`. Oculta `estado_pago='inactivo'` por defecto (toggle "incluir retirados").
- [ ] `#/cobro/:alumnoId` — ficha de cobro: cuotas liquidables → método + fecha + referencia → RPC → recibo PDF.
- [ ] `#/registro` — pestañas «Al día» (`alumno_activo=true`), «Con mora», «Deudas de retirados» (`estado_pago='inactivo' AND saldo>0`). Export CSV.
- [ ] Agregar `#/cobro` y `#/registro` como items visibles en `NAV_CATALOGO` (`visible: true`).

### Decisiones abiertas
- [ ] **D7** — excedente de pago: hoy la RPC lo **rechaza**. Alternativa: acreditar a wallet. Confirmar.
- [ ] **D-infra** — construir `.github/workflows/db-migrate.yml` (CI aplica migraciones al merge) vs. aplicarlas a mano.
- [ ] **Rol `finanzas`** — asignar a Katherine: `UPDATE profiles SET rol='finanzas' WHERE id='<id>'`.

### Operativo — antes de facturar
- [ ] **Cargar becas reales** en la tabla `public.becas` (hoy: 0 filas; hay becados de Operación Genoma).
- [ ] **Generar septiembre 2026** — `SELECT fn_generar_ciclo_cuotas(9, 2026, 60000)` — NO ejecutado; sobre-facturaría a los becados hasta cargar `becas`. Octubre en adelante lo cubre el cron.
- [ ] Revisar los ~41 alumnos activos sin cuota de agosto (237 cuotas / 278 activos).

---

## Menú oculto — reactivar por módulo

Cada uno se saca de `visible: false` en `NAV_CATALOGO` (`src/modules/caja/index.js`) cuando su
módulo esté listo.

| Item | Bloqueo para reactivar | Prioridad |
|---|---|---|
| **Cuotas** `#/cuotas` | Reescribir filtros: hoy clasifica por heurística de `nivel` de score, no por estado real de cuota. O sustituirlo por `#/registro`. | media — lo cubre `#/registro` |
| **Dashboard** `#/dashboard` | Rehacer como panel de cobro (cobrado hoy, morosos, al día) — hoy 4 KPIs en 0. | media |
| **Reportes** `#/reportes` | Dejar solo «Cierre del día» + «Estado de cuenta familiar». «Impacto social» está sin hacer (`disabled`, "PR5"). | media |
| **Tiendita** `#/accesorios` | 🔴 **`fn_decrementar_stock` no existe en prod** (migración en `20260905210000_fn_decrementar_stock.sql`, PR #53 mergeado sin aplicar) + fallback en `cajaSupabase.js:asignarAccesorio` usa `supabase.raw()` (inexistente en supabase-js v2). Aplicar migración + arreglar fallback. Cargar catálogo de accesorios. | baja |
| **Notificaciones** `#/notificaciones` | Tabla `notificaciones_caja` vacía; definir quién escribe ahí (Hermes / edge functions). | baja |
| **Campañas** `#/campanas` | Tablas vacías. Útil cuando haya historial de cobros para segmentar. | baja |
| **Score Familias** `#/score` | Cambiar gate `session.user.user_metadata.role` → chequeo real de rol (mismo fix que PR #51). Poblar `score_compromiso`. | baja |
| **Mensajes** `#/mensajes` | Mensajería interna — probablemente se descarta (ya está Telegram/Hermes). | descartar |
| **Tareas del Director** `#/hermes` | Tablero institucional embebido, fuera del dominio de caja. Probablemente se descarta del portal FIN. | descartar |

---

## Rutas huérfanas (registradas en `caja.router.js`, sin item de menú)

| Ruta | Estado | Acción |
|---|---|---|
| `#/wallet/:familiaId` | `wallet_movimientos` vacío. La RPC de pago ya no acredita excedente al wallet (D7). Botón "Ver movimientos" sigue en el detalle de `familiasView`. | Al reactivar Familias, quitar el botón; o eliminar la ruta. |
| `#/minutas` | Vista existe, ruta registrada, **sin item de menú ni link** — inalcanzable para el usuario. | Eliminar del router o dejar documentada. |
| `#/tareas` (la de caja, ≠ `#/hermes`) | Huérfana — estuvo en el menú antes. `tareas_caja` vacío. | Eliminar del router o documentar. |

---

## Deuda técnica transversal

- [ ] **Reconciliación esquema repo ↔ prod.** Varias migraciones del repo nunca se aplicaron (`20260823192500_programa_becas_patrocinios` → `alumnos_beneficios` no existe en prod; `fn_generar_ciclo_cuotas` estaba en la versión vieja). Riesgo latente para todo trabajo de backend. Hacer: dump de prod, diff contra `supabase/migrations/`, marcar/squash baseline.
- [ ] **`familias.activa`** = `true` en las 298 — bandera sin mantener. El módulo nuevo se apoya en `alumnos.activo`; decidir si se retira `familias.activa` o se sincroniza.
- [ ] **Supabase Pro** (~US$25/mes) — habilita branches de staging para validar migraciones antes de prod. Hoy no hay validación previa.

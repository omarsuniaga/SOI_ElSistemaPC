# Portal FIN — Auditoría del menú y estado del cableado

**Fecha:** 2026-09-06
**Alcance:** los 12 items del menú lateral de `src/modules/caja/` + 3 rutas registradas sin
entrada en el menú.
**Verificado contra:** código en `feat/planificacion-clases-rediseño` + esquema y datos reales
de producción (`zmhmdvmyeyswunurcyow`, 2026-09-06).

**Objetivo inmediato (Omar):** concentrarse en **un solo módulo — fijar/registrar el pago
mensual de los alumnos** — y ocultar todo lo demás del menú hasta que se desarrolle módulo a módulo.

---

## Cómo leer el "cableado"

Para cada opción se revisó la cadena completa:

1. **Ruta** — el `hash` del menú tiene su `case` en `caja.router.js` → `matchRoute()`.
2. **Vista** — la función de render existe y está importada en el router.
3. **Datos** — las tablas / vistas / RPC que consume existen en prod y **tienen datos**.
4. **Bugs conocidos** — problemas de ejecución detectados.

Veredicto: **🟢 OK** (cableado y con datos) · **🟡 CABLEADO, SIN DATOS** (funciona pero las
tablas están vacías) · **🔴 ROTO** (falla en ejecución o le falta una pieza).

---

## Los 12 items del menú

### 1. Dashboard · `#/dashboard`
- **Vista:** `views/dashboardView.js` → `render()`
- **Qué hace:** panel de KPIs del día — total cobrado hoy, familias en mora, tareas pendientes, alertas de stock bajo; lista de últimos pagos.
- **Datos:** `getCierreCajaHoy()` (agrega de `pagos`), `getNotificaciones({prioridad:'critica'})` → `notificaciones_caja` **(0)**, `getTareas()` → `tareas_caja` **(0)**, `getAccesorios()` → `accesorios` **(0)**.
- **Cableado:** 🟡 **CABLEADO, SIN DATOS.** La cadena funciona pero **los 4 KPIs muestran 0** — solo `pagos` tiene 2 filas. El panel no refleja nada útil hoy.
- **Recomendación:** **OCULTAR.** Cuando arranque el módulo de cobro se rehace como panel de cobro (cobrado hoy, morosos, al día).

### 2. Familias · `#/familias`
- **Vista:** `views/familiasView.js` → `renderList()` / `renderDetail()`
- **Qué hace:** listado de familias con búsqueda por nombre de familia o representante; detalle con cuotas, pagos y wallet.
- **Datos:** `getFamilias()` → `vw_estado_familiar` **(298 filas reales)**.
- **Cableado:** 🟢 **OK.** Funciona con datos reales.
- **Recomendación:** **OCULTAR** cuando exista `#/cobro`. Es familia-céntrico; el módulo nuevo es alumno-céntrico (`vw_alumno_estado_pago`). El detalle de familia linkea a `#/wallet/:id` (módulo que se oculta) — hay que quitar ese botón.

### 3. Cuotas · `#/cuotas`
- **Vista:** `views/cuotasView.js` → `render()`
- **Qué hace:** tabla de familias con pestañas Todas / pendiente / en_mora / vencida / pagada.
- **Datos:** `getFamilias()` → `vw_estado_familiar` **(298)**.
- **Cableado:** 🟡 **CABLEADO, con reservas.** Los filtros de pestaña **no consultan el estado real de las cuotas** — son heurísticas sobre el `nivel` de score de la familia (`nivel === 'D' || 'E'` = "en_mora", `cuotas_pendientes === 0` = "pagada"). Puede mostrar clasificaciones engañosas.
- **Recomendación:** **OCULTAR** por ahora. Su función la cubre mejor el nuevo `#/registro` (al día / mora) sobre `vw_alumno_estado_pago`, que sí lee el estado real.

### 4. Registrar Pago · `#/pagos/nuevo`  ⬅ EL MÓDULO
- **Vista:** `views/registroPagoView.js` → `render()`
- **Qué hace:** asistente de 3 pasos — buscar familia → seleccionar cuotas a pagar → método/monto/referencia → confirma vía RPC → recibo.
- **Datos:** `getFamilias()`, `getCuotasByFamilia()`, `registrarPago()` → **`fn_registrar_pago_transaccional`** (RPC, ya con `p_fecha_pago` en prod desde hoy).
- **Cableado:** 🟢 **OK.** Es el corazón del módulo. La RPC quedó reescrita (Fase 0): imputa FIFO, calcula mora contra la fecha contable, rechaza excedentes. La vista **todavía no usa** `p_fecha_pago` ni la búsqueda por alumno — eso lo trae el módulo.
- **Recomendación:** **VISIBLE.** Es el foco. Se le agrega: búsqueda por alumno, fecha de pago editable, "alumnos al día / en mora".

### 5. Tiendita · `#/accesorios`
- **Vista:** `views/accesoriosView.js` → `render()`
- **Qué hace:** punto de venta de accesorios (cuerdas, resina…) + control de stock, asignación a alumnos.
- **Datos:** `accesorios` **(0)**, `accesorio_asignaciones` **(0)**, RPC **`fn_decrementar_stock`**.
- **Cableado:** 🔴 **ROTO.** `fn_decrementar_stock` **no existe en prod** (su migración, PR #53, está mergeada pero sin aplicar) y el fallback en `cajaSupabase.js` usa `supabase.raw()`, que **no existe en supabase-js v2**. Asignar un accesorio insertaría la asignación pero **nunca descontaría el stock**.
- **Recomendación:** **OCULTAR.** Módulo futuro; requiere aplicar su migración y arreglar el fallback.

### 6. Notificaciones · `#/notificaciones`
- **Vista:** `views/notificacionesView.js` → `render()`
- **Qué hace:** bandeja de notificaciones con actualización en tiempo real y "marcar leída".
- **Datos:** `notificaciones_caja` **(0)** + suscripción realtime.
- **Cableado:** 🟡 **CABLEADO, SIN DATOS.** La tabla está vacía; depende de que Hermes / edge functions escriban ahí.
- **Recomendación:** **OCULTAR.**

### 7. Tareas del Director · `#/hermes`
- **Vista:** `../hermes/views/tareasView.js` → `renderTareasView()` (64 KB, compartida con otros portales)
- **Qué hace:** tablero de tareas institucionales del departamento, con vista de calendario.
- **Datos:** `calendario_institucional` (tabla existe).
- **Cableado:** 🟡 fuera del dominio de caja. Es un tablero institucional embebido; no tiene que ver con cobros.
- **Recomendación:** **OCULTAR** del portal FIN.

### 8. Cierre de Caja · `#/cierre`
- **Vista:** `views/cierresCajaView.js` → `render()`
- **Qué hace:** resumen del día (total, desglose por método), botón "Cerrar Caja", descarga de PDF de arqueo.
- **Datos:** `getCierreCajaHoy()` (agrega de `pagos`), `registrarCierreCaja()` → `cierres_caja` **(0)**.
- **Cableado:** 🟢 **OK** (sin cierres hechos aún porque casi no hay pagos). Necesario para el **arqueo de efectivo** una vez que haya cobros diarios.
- **Recomendación:** **VISIBLE** junto al módulo de cobro — un cajero que recibe efectivo necesita cuadrar caja. (Si Omar prefiere el mínimo absoluto, se oculta hasta que haya volumen de pagos.)

### 9. Reportes · `#/reportes`
- **Vista:** `views/reportesView.js` → `render()`
- **Qué hace:** 4 tarjetas de descarga de PDF — Cierre del día · Estado de cuenta familiar · Reporte de mora · Impacto social.
- **Datos:** `getFamilias()`, `getCierreCajaHoy()`, `getFamiliaById()`; generadores PDF locales.
- **Cableado:** 🟡 parcial. Cierre del día y Estado de cuenta familiar **funcionan**. Reporte de mora se arma de las familias con saldo. **Impacto social está sin hacer** — la tarjeta dice "Datos en PR5" y el botón está `disabled`.
- **Recomendación:** **OCULTAR.** Más adelante se deja solo "Cierre del día" + "Estado de cuenta familiar".

### 10. Mensajes · `#/mensajes`
- **Vista:** `views/mensajesView.js` → `render()`
- **Qué hace:** mensajería interna por hilos entre departamentos.
- **Datos:** `hilos_mensajes` **(0)**, `mensajes_internos` **(0)**.
- **Cableado:** 🟡 **CABLEADO, SIN DATOS.** La mensajería interna ya la cubre Telegram / Hermes.
- **Recomendación:** **OCULTAR.**

### 11. Campañas · `#/campanas`
- **Vista:** `views/campanasView.js` → `render()`
- **Qué hace:** campañas de recuperación de mora — crear campaña, registrar participación de familias, ver montos recuperados.
- **Datos:** `campanas_pago` **(0)**, `campana_participaciones` **(0)**.
- **Cableado:** 🟡 **CABLEADO, SIN DATOS.**
- **Recomendación:** **OCULTAR.** Módulo futuro, útil cuando haya historial de cobros.

### 12. Score Familias · `#/score` *(adminOnly)*
- **Vista:** `views/scoreView.js` → `render()`
- **Qué hace:** dashboard de score/nivel (A–E) de las familias, ordenado por riesgo, con barra de distribución.
- **Datos:** `getFamilias()` → `vw_estado_familiar` (el `score`/`nivel` vienen de ahí; `score_compromiso` **(0)**).
- **Cableado:** 🟡 **CABLEADO, datos parciales.** El score/nivel existen en la vista; la tabla de detalle `score_compromiso` está vacía. El gate `adminOnly` usa `session.user.user_metadata.role` — **mismo anti-patrón que se quitó del Portal Maestros en PR #51** (el cliente puede influir en ese campo).
- **Recomendación:** **OCULTAR.**

---

## Rutas registradas SIN entrada en el menú

| Ruta | Vista | Datos | Estado | Nota |
|---|---|---|---|---|
| `#/wallet/:familiaId` | `views/walletView.js` | `wallet_movimientos` **(0)**, `wallet_config` **(0)** | 🟡 sin datos | Solo se llega desde el detalle de familia. Al ocultar el módulo hay que **quitar el botón "Ver movimientos"** en `familiasView`. La RPC de pago **ya no acredita excedente al wallet** (Fase 0, decisión D7). |
| `#/minutas` | `views/minutasView.js` | `minutas` **(0)** | 🟡 ruta muerta | No está en el menú ni linkeada desde ningún lado. Código presente pero inalcanzable por el usuario. |
| `#/tareas` | `views/tareasView.js` (la de caja, distinta de `#/hermes`) | `tareas_caja` **(0)** | 🟡 ruta huérfana | Estuvo en el menú antes; hoy no. Vista y ruta siguen registradas. |

---

## Resumen — qué queda visible

| Visible ahora | Oculto (código intacto, fuera del menú) |
|---|---|
| **Registrar Pago** `#/pagos/nuevo` | Dashboard, Familias, Cuotas, Tiendita, Notificaciones, Tareas del Director, Reportes, Mensajes, Campañas, Score Familias |
| **Cierre de Caja** `#/cierre` *(recomendado — arqueo de efectivo)* | + rutas huérfanas: Wallet, Minutas, Tareas (caja) |

Cuando el módulo esté armado se suman **`#/cobro`** (búsqueda unificada alumno/representante) y
**`#/registro`** (alumnos al día / en mora / deudas de retirados).

**Cómo se oculta:** editar `NAV_ITEMS` en `src/modules/caja/index.js` — dejar solo los items
elegidos. Las rutas siguen en `caja.router.js` (accesibles por URL directa, no se rompe nada),
solo desaparecen del menú lateral.

---

## Hallazgos técnicos transversales

1. **10 de las ~13 tablas del módulo están vacías** en prod. El portal se construyó completo de una vez; casi nada se usó.
2. **`fn_decrementar_stock` sin aplicar** (PR #53 mergeado, migración pendiente) + fallback roto con `supabase.raw()`. Bloquea la Tiendita apenas se use.
3. **`user_metadata.role`** como gate de UI en `caja/index.js` (`isAdmin`) y `scoreView.js` — anti-patrón ya corregido en el Portal Maestros; bajo impacto porque las tablas tienen RLS.
4. **`cuotasView`** clasifica por heurística de score, no por estado real de cuota.
5. **`familias.activa`** = `true` en las 298 familias — bandera sin mantener; el módulo nuevo se apoya en `alumnos.activo`.

# Brief de implementación — Rediseño de `CuotasView` (portal `fin`)

> ## ✅ EJECUTADO (2026-09-07) — PRs #66 y #67
> El rediseño lo hizo **Claude** (Omar eligió Opción A tras la confusión de portales). No es un
> pendiente. Este doc queda como **referencia del contrato** (la vista, la RPC, los filtros).
> - **PR #66:** `hooks/useAlumnosCartera.ts`, `lib/carteraHelpers.ts` (+tests), `views/CuotasView.tsx` reescrito.
> - **PR #67:** `p_fecha_pago` cableado en `SupabasePaymentTransactionAdapter` + 4 errores `tsc` del baseline a 0.
> - **No hecho a propósito** (§3): cooldown radial de WhatsApp + config días/horas.

**Fecha:** 2026-09-07 · **Sustituye la §2–§3 de** `SPEC_REDISENO_CUOTAS_ALUMNOS.md` (el modelo agregado ya existe en la BD).

---

## 1. Lo que ya está listo en la BD (prod `zmhmdvmyeyswunurcyow`)

### Vista `vw_alumno_estado_pago` — **una fila por alumno, ya agregada**

No re-agrupar cuotas crudas. La vista ya hace el `AlumnoCarteraRow` del spec.
Tipo en `src/portales/fin/src/infrastructure/supabase/database.types.ts` →
`Database['public']['Views']['vw_alumno_estado_pago']['Row']`:

| columna | tipo | notas |
|---|---|---|
| `alumno_id` | `string` | |
| `alumno_nombre` | `string` | |
| `instrumento_principal` | `string` | |
| `alumno_activo` | `boolean` | |
| `exento_mensualidad` | `boolean` | |
| `familia_id` | `string \| null` | |
| `nombre_familia` | `string` | `'Sin Familia'` si no hay |
| `contacto_nombre` / `contacto_cedula` / `contacto_telefono` / `contacto_email` | `string` | cascada: representantes → `alumnos.representante_*` → madre → padre |
| `cuotas_pendientes_count` | `number` | estados `pendiente/vencida/en_mora` |
| `cuotas_vencidas_count` | `number` | de esas, con `fecha_vencimiento < hoy` |
| `saldo_pendiente_centavos` | `number` | Σ (`monto_final − monto_pagado`) de las pendientes |
| `fecha_mas_antigua_vencida` | `string \| null` (date) | |
| `estado_pago` | `string` | **`'inactivo'` \| `'exento'` \| `'mora'` \| `'debe'` \| `'al_dia'`** — prioridad en ese orden |

`security_invoker = true` → solo `admin`/`finanzas` ven contacto y saldos. La UI igual debe gatear la vista por rol.

### RPC de cobro (sin cambios de firma para el frontend)

```
supabaseRpc('fn_registrar_pago_transaccional', {
  p_familia_id, p_monto_centavos, p_metodo_pago, p_referencia, p_notas,
  p_cuota_ids,                       // selección del cajero
  p_fecha_pago                       // opcional, YYYY-MM-DD, para pagos retroactivos
})  // RETURNS pagos (leer .id)
```
- Imputa FIFO: primero `p_cuota_ids`, luego el resto de cuotas abiertas de la familia.
- Mora calculada contra `p_fecha_pago`.
- **Excedente → wallet** de la familia (decisión D7). No rechaza el pago.

### Becas
- Ya se aplican en la generación mensual y hay un trigger que anula el cobro pendiente si la beca se registra tarde. **El frontend no toca becas** para el MVP.

---

## 2. Qué construir

### 2.1 Lectura — nuevo hook `useAlumnosCartera`

`src/portales/fin/src/hooks/useAlumnosCartera.ts`, mismo patrón que `useAuthoritativeReceivables`:

```ts
type CarteraRow = Database['public']['Views']['vw_alumno_estado_pago']['Row'];

// GET vw_alumno_estado_pago?select=*  (+ order=alumno_nombre.asc)
const rows = await supabaseRest<CarteraRow[]>('vw_alumno_estado_pago?select=*&order=alumno_nombre.asc');
```

Con el mismo cache degradado / estado online que el hook existente.

### 2.2 `CuotasView` — tabla alumno-céntrica

Una fila **por `CarteraRow`**. Columnas:

| Columna | Contenido |
|---|---|
| **Alumno** | `alumno_nombre` (negrita) · badge `[${cuotas_pendientes_count} pendientes]` si > 0 · subtexto `${contacto_nombre} · ${nombre_familia}` · clic → ficha |
| **Concepto(s)** | chips — **lazy**: `getCuotasByAlumno(alumno_id)` solo al expandir la fila / abrir la ficha. Para la lista, mostrar solo el count. Chip `[⭐ Beca]` si alguna cuota del alumno está `becada`. |
| **Saldo Pendiente** | `formatDOP(saldo_pendiente_centavos / 100)` · rojo si > 0, verde/"Al día" si 0 |
| **Vencimiento** | `fecha_mas_antigua_vencida` · si `cuotas_vencidas_count > 0` → badge `🔴 N días` (calcular contra hoy) · si no y hay pendientes → `🟠 próximo` |
| **Estado** | punto de semáforo **directo de `estado_pago`** — 🟢 `al_dia` · 🔵 `exento` · 🟠 `debe` · 🔴 `mora` · ⚪ `inactivo`. **No recalcular.** |
| **Acciones** | icono de cobro (tooltip "Registrar Pago") → abre `RegistroPagoView` con ese alumno/familia · (botón WhatsApp: dejar el que ya existe, **sin** el config de días/horas) |

### 2.3 Pestañas

| Pestaña | Filtro sobre `estado_pago` |
|---|---|
| **Pendientes de cobro** (default) | `['debe', 'mora']` |
| **Al día / Becados** | `['al_dia', 'exento']` |
| **Deudas de retirados** | `estado_pago === 'inactivo' && saldo_pendiente_centavos > 0` |
| **Todos** | sin filtro |

Buscador (debounce): filtra client-side sobre `alumno_nombre`, `contacto_nombre`, `nombre_familia`.

### 2.4 Ficha del alumno (modal/drawer)

Al clic en el alumno: `getCuotasByAlumno(alumno_id)` → lista de cuotas liquidables (concepto, período, monto, saldo, vencimiento) + último pago + botón "Registrar pago con estas cuotas".

`getCuotasByAlumno` en el portal = `supabaseRest<CuotaRow[]>('cuotas?alumno_id=eq.${id}&estado=in.(pendiente,vencida,en_mora)&select=*&order=fecha_vencimiento.asc')`.

### 2.5 `RegistroPagoView` — cablear `p_fecha_pago`

Agregar campo de fecha de pago (default hoy, editable) y pasarlo a `SupabasePaymentTransactionAdapter` → `p_fecha_pago`.

---

## 3. Fuera del MVP (diferir)

- Config de WhatsApp con selector Días/Horas + temporizador radial (`WhatsAppReminderConfigModal`, `WhatsAppCooldownButton`).
- Estética Bento/Tailwind pesada — seguir el estilo actual del portal.
- `AlumnoCarteraRow` con campos inventados (`saldo_centavos`, `descuento_beca_centavos`) — usar el contrato de la vista.

## 4. Deuda a arreglar de paso

- 4 errores de `tsc --noEmit -p tsconfig.json` en el baseline:
  - `activosInstrumentos` no existe en `FinanceContextType` (`AlumnoFichaModal.tsx:51`, `Ficha360View.tsx:35`)
  - tipo `Alumno` del portal sin `tiene_pasaporte` (`Ficha360View.tsx:407`) ni `direccion` (`:437`)
- Considerar agregar `tsc --noEmit` al CI del portal.

## 5. Estado

Ejecutado en `fe/cuotasview-rediseno` (#66) y `fe/fecha-pago-y-tsc` (#67), ambos mergeados.
Falta solo lo operativo: perfil de Katherine (`rol='finanzas'`, portal admin), cargar becas,
`SELECT fn_generar_ciclo_cuotas(9, 2026, 60000)` para septiembre. Ver `PORTAL_FIN_BACKLOG.md`.

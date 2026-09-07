# Portal de Finanzas SOI (`fin`)

**Portal de finanzas de la institución.** React + TypeScript + Tailwind, arquitectura hexagonal
(`domain/` · `application/` · `infrastructure/`).
Servido en **`/fin`** (`/soi-finanzas` queda como alias legacy). Entry: `fin.html` → `src/main.tsx`.

> **Historia.** Este árbol se llamó `soi-finanzas` hasta 2026-09-07. El portal de cobro
> vanilla-JS anterior (`src/modules/caja/`) se eliminó (queda en el historial de git). Ver
> `docs/PORTAL_FIN_MENU_AUDITORIA.md`.

## Backend (en producción — proyecto `zmhmdvmyeyswunurcyow`)

| Recurso | Para qué |
|---|---|
| `fn_registrar_pago_transaccional(p_familia_id, p_monto_centavos, p_metodo_pago, p_referencia, p_notas, p_cuota_ids, p_fecha_pago DEFAULT)` | Registro de pago atómico. `RETURNS pagos`. Imputa FIFO, mora contra fecha contable, el excedente se acredita al wallet de la familia. Rol `admin`/`finanzas`. |
| `fn_generar_ciclo_cuotas(p_mes, p_anio, p_monto_centavos DEFAULT 60000)` | Generación mensual de cuotas (RD$600). Respeta `exento_mensualidad` y `becas`. Cron el día 1. |
| Vista `vw_alumno_estado_pago` | Modelo de lectura por alumno: contacto en cascada, saldo, `estado_pago` (`inactivo`\|`exento`\|`mora`\|`debe`\|`al_dia`). Disponible para el rediseño de `CuotasView`. |
| `pagos.fecha_pago`, `alumnos.exento_mensualidad` | Columnas de soporte (Fase 0). |

**Pendiente:** regenerar `src/infrastructure/supabase/database.types.ts` y `CanonicalManifest.ts`
para reflejar la firma nueva de `fn_registrar_pago_transaccional` y las columnas nuevas.

## Correr local

```
npm install
npm run dev        # http://localhost:5173/fin
```

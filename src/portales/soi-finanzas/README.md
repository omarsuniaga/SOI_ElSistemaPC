# Portal de Finanzas SOI (`soi-finanzas`)

**Portal de finanzas de la institución.** React + TypeScript + Tailwind.
Servido en `/soi-finanzas` (y `/fin` como alias). Entry: `soi-finanzas.html` → `src/main.tsx`.

> **Decisión de arquitectura 2026-09-07 (Opción B).** Este es el portal de finanzas activo.
> El portal vanilla-JS anterior (`fin.html` / `src/modules/caja/`) **se eliminó** — su
> historia queda en git.

## Estado

Este árbol nació como prototipo de Google AI Studio con estado en memoria
(`src/data/initialData.ts`, `FinanceContext`). **Trabajo en curso: conectar el data-layer a
Supabase real.**

El **backend ya está listo en producción** (proyecto `zmhmdvmyeyswunurcyow`), construido en la
Fase 0 del módulo de cobro:

| Recurso | Para qué |
|---|---|
| Vista `vw_alumno_estado_pago` | Modelo de lectura por alumno: contacto en cascada, saldo, `estado_pago` (`inactivo`\|`exento`\|`mora`\|`debe`\|`al_dia`) |
| RPC `fn_registrar_pago_transaccional(...)` | Registro de pago atómico (imputa FIFO, mora contra fecha contable, rechaza excedente) |
| RPC `fn_generar_ciclo_cuotas(mes, anio, 60000)` | Generación mensual de cuotas (RD$600, respeta exentos y becas). Cron el día 1. |
| `pagos.fecha_pago`, `alumnos.exento_mensualidad` | Columnas de soporte |

Contexto: `docs/PORTAL_FIN_MENU_AUDITORIA.md`, `docs/PORTAL_FIN_BACKLOG.md`,
`docs/planning/SPEC_REDISENO_CUOTAS_ALUMNOS.md`.

## Correr local

```
npm install
npm run dev        # http://localhost:5173/soi-finanzas
```

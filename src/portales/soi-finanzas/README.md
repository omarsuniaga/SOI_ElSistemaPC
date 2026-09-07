# `soi-finanzas` — prototipo React, ARCHIVADO (no es el portal de finanzas en producción)

> **Decisión de arquitectura 2026-09-07 (Opción A).**
> Este árbol es un **prototipo generado con Google AI Studio**: React + TypeScript + Tailwind,
> con estado en memoria/borrador (`src/data/initialData.ts`, `FinanceContext`) y **sin conexión
> real a Supabase** en la mayoría de sus módulos.
>
> El **portal de finanzas en producción es `fin`** → [`src/modules/caja/`](../../modules/caja/),
> vanilla JS, servido en `/fin`, conectado a la base real (`cajaApi.js`, vista
> `vw_alumno_estado_pago`, RPC `fn_registrar_pago_transaccional`).
>
> **No se construye sobre este árbol.** Se conserva como referencia de diseño y posible base
> para un ERP financiero más completo (nómina, conciliación bancaria, presupuesto) en el futuro.
> La ruta `/soi-finanzas` sigue existiendo pero no se linkea desde ningún portal.

Contexto completo: `docs/PORTAL_FIN_MENU_AUDITORIA.md`, `docs/PORTAL_FIN_BACKLOG.md`.

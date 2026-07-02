---
doc_id: PORTAL-014
doc_type: spec
version: V9
status: vigente
department: SIS
owner: Arquitecto SOI
created_at: 2026-06-29
last_reviewed: 2026-06-29
next_review_due: 2026-12-26
review_cycle_days: 180
canonical_path: 09_SOI_WEB_PORTAL\sistema-academico-pwa\docs\hermes-enrutamiento-telegram.md
origin_path: null
destination_path: null
supersedes: null
superseded_by: null
change_reason: null
aliases:
  - PORTAL-014
tags:
  - portal
  - web
related_docs:
  - "[[00_HOME]]"
  - "[[00_MOCS/MOC_SIS]]"
  - "[[00_SISTEMA_MAESTRO/SOI_MASTER_BOOK_V9]]"
  - "[[00_SISTEMA_MAESTRO/SOI_HERMES_CORE_V9]]"
---

# Enrutamiento inteligente de solicitudes (Hermes / Telegram)

Hermes recibe una solicitud en texto libre por Telegram, identifica el **departamento**
responsable y crea una **tarea institucional**. La tarea aparece automáticamente en el
portal del departamento y, si es `alta`/`critica`, dispara un aviso de WhatsApp
(trigger `fn_trigger_hermes_task_wa_alert`).

La lógica de clasificación es la misma que usa la web (`src/modules/hermes/api/clasificadorApi.js`).

## 1. Instrucción de clasificación (prompt para Gemini/Hermes)

> Sos el clasificador de solicitudes de "El Sistema Punta Cana". Dada una solicitud en
> texto libre, identificá qué DEPARTAMENTO debe atenderla y resumí la tarea.
>
> - **DIR** Dirección — decisiones ejecutivas, protocolo, alianzas, invitaciones.
> - **ACM** Académica — clases, repertorio, ensayos, pedagogía, progresos.
> - **ADM** Administración — inscripciones, datos de alumnos/maestros, personal.
> - **FIN** Financiero — pagos, cobros, presupuesto, relaciones de pago, viáticos, aranceles.
> - **LOG** Logística — instrumentos, inventario, comodatos, transporte, montaje.
> - **COM** Comunicaciones — difusión, prensa, redes, correos, piezas gráficas.
> - **TECNICO** Técnico — sonido, escenario, soporte técnico, mantenimiento.
>
> Devolvé SOLO un JSON: `{"departamento","titulo","descripcion","prioridad","confianza"}`
> con `prioridad ∈ baja|media|alta|critica`.

Ejemplo: *"necesito que me manden la relación de pago del mes de febrero"* → `FIN`.

## 2.A Crear la tarea (RECOMENDADO — Edge Function `hermes-crear-tarea`)

Hermes solo manda el **texto crudo**; el servidor clasifica (GROQ) e inserta la tarea.
Aparece automáticamente en `tareasView.js` del departamento. Si es `alta`/`critica`,
dispara el aviso de WhatsApp.

```bash
curl -X POST 'https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/hermes-crear-tarea' \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "x-hermes-token: <HERMES_EMAIL_TOKEN>" \
  -H 'Content-Type: application/json' \
  -d '{"texto":"necesito la relacion de pago de febrero"}'
```

Respuesta: `{ ok, clasificacion:{departamento,titulo,descripcion,prioridad,confianza}, tarea:{id,...} }`.
Opcional: agregar `"departamento":"FIN"` al body para forzar el destino y saltar la
clasificación de departamento.

## 2.B Crear la tarea (alternativa manual — Supabase MCP)

Una vez clasificado, Hermes inserta la tarea. El INSERT dispara el aviso de WhatsApp
para `alta`/`critica`. NO hay que tocar nada más: el portal del departamento ya la muestra.

```sql
insert into public.tareas_institucionales
  (titulo, descripcion, departamento, estado, prioridad)
values
  ('Enviar relación de pago de febrero',
   'Solicitud recibida por Telegram: relación de pago del mes de febrero.',
   'FIN', 'pendiente', 'alta');
```

`departamento` ∈ `DIR|ACM|ADM|FIN|LOG|COM|TECNICO` (enum `soi_departamento`).
`prioridad` ∈ `baja|media|alta|critica`. `estado` arranca en `pendiente`.

## 3. Resultado

- La tarea aparece en el portal del departamento (`renderTareasView({ departamento })`).
- Si es `alta`/`critica`, se encola un aviso de WhatsApp al encargado.
- El responsable y el correo del departamento se gestionan en **Portal ADM → Correos Departamentos**.

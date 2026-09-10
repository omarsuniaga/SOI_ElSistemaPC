# _SHARED_FACTS.md — Baseline verificado por el coordinador (10 sep 2026)

> Este archivo es la **fuente de verdad compartida** para todos los sub-agentes que producen
> el SOI Current-State Context Pack. Fue construido consultando **Supabase en vivo**
> (proyecto real) + el repositorio en el commit `2803124f`. No re-derives lo que ya está aquí;
> cítalo y profundiza. Marca **UNKNOWN** lo que no puedas verificar.

## 0. Reglas de la auditoría (recordatorio)
- **NO** modificar producción, archivos, RLS, migraciones. Solo lectura.
- **NO** exponer secretos, API keys, passwords, ni datos personales de alumnos/representantes/personal.
- Diferenciar siempre: (a) lo que el **código** sugiere, (b) lo que la **BD** realmente contiene, (c) lo que se sabe que **funciona en producción**.
- Para cada componente, asignar una decisión: `PRESERVE` · `PRESERVE + REFACTOR` · `MIGRATE` · `REPLACE` · `DEPRECATE` · `DELETE CANDIDATE` · `UNKNOWN / HUMAN DECISION REQUIRED`.
- El objetivo NO es reconstruir; es dar a otro agente el contexto para diseñar SOI 2.0 sin destruir valor.

## 1. Identidad del proyecto
- Repo: `sistema-academico-pwa` (SOI — Sistema Operativo Institucional / "El Sistema Punta Cana" / FUNEYCA-PC).
- Stack: **Vite + Vanilla JS** (SPA modular con router propio) + **React 19** (parcial, `@vitejs/plugin-react`, `lucide-react`, `motion`) + Bootstrap 5 + Tailwind 4 (vite plugin) + Supabase JS. TypeScript solo para `tsc --noEmit` (typecheck); código mayormente `.js`.
- Node `>=20.19`. Build → `dist/`. Deploy → **Netlify** (`netlify.toml`, `publish=dist`, SPA redirect a `/index.html`). Docker también presente (`Dockerfile`, `nginx.conf`, `.github/workflows/docker.yml`).
- Gobernanza: `AGENTS.md` (fuente de verdad de reglas), `CONTEXT.md` (lenguaje ubicuo DDD), `docs/architecture/SOI_ARCHITECTURE.md`.
- Patrón arquitectónico declarado: **DataAdapter Pattern** (UI nunca llama Supabase directo) + **Deep Modules (Ousterhout)** + **Mock First** (Modo Demo con JSON en `src/assets/data/mocks/`). AGENTS.md admite: *"Actualmente algunos servicios llaman a Supabase directamente. La migración completa al patrón es work in progress."*

## 2. Supabase — proyecto real
- **Project ref:** `zmhmdvmyeyswunurcyow` · nombre `SOI_DDBB_EL_SISTEMAPC` · región us-east-2 · Postgres **17.6** · estado ACTIVE_HEALTHY.
- Segundo proyecto `wtpfsboebwdfrhvskhkg` (`ElSistemaPC-Project`, us-west-2) está **INACTIVE** — legado, no usar.
- `supabase/config.toml` → `project_id = "zmhmdvmyeyswunurcyow"`, API expone `public` + `graphql_public`, `extra_search_path=["public","extensions"]`, `max_rows=1000`.
- Extensiones instaladas: `pg_cron 1.6.4`, `pg_net 0.20.0`, `pg_stat_statements 1.11`, `pg_trgm 1.6`, `pgcrypto 1.3`, `plpgsql`, `supabase_vault 0.3.1`, `unaccent 1.1`, `uuid-ossp 1.1`.
- **Sub-agentes con acceso a `mcp__c014a43e-d076-4c5b-b0f9-3d63cebd2fd8__*`** (Supabase MCP): úsenlo para gaps. Si no está disponible, usen los archivos `_raw/*.json` + `bbdd.md` y marquen UNKNOWN lo que falte.

## 3. Snapshots crudos disponibles en `docs/context-baseline/_raw/`
| Archivo | Contenido |
|---|---|
| `columns.json` | `information_schema.columns` de todas las tablas BASE de `public` (envuelto en el wrapper del MCP; el JSON real está entre los marcadores `untrusted-data`). |
| `constraints_indexes.json` | Todos los constraints (PK/FK/UNIQUE/CHECK/EXCLUDE) con `pg_get_constraintdef`, y todos los índices con `indexdef`. |
| `functions_triggers.json` | Todas las funciones de `public` (`proname`, args, returns, lenguaje, `security_definer`, volatilidad, comentario) + todos los triggers (`information_schema.triggers`). |
| `policies.json` | Todas las RLS policies de `public` (`pg_policies`: tabla, policyname, cmd, roles, permissive, qual, with_check) + lista de tablas con RLS deshabilitada. |
| `views_cron_realtime_buckets_comments.json` | Views + matviews (con definición), tablas en `supabase_realtime`, `cron.job` (11 jobs), `storage.buckets` (3), comentarios de tabla. |
| `types_sequences_extensions.json` | 35 enums con labels, 4 sequences, 9 extensions. |
| `security_advisors.json` | `get_advisors(security)` completo. |
| `migrations_list.txt` | 304 archivos en `supabase/migrations/` (@ commit 2803124f). |

## 4. Git — ESTADO IMPORTANTE (hallazgo para la auditoría)
- La auditoría se hace sobre el commit **`2803124f`** — `fix(cda1): ... (#81)`, la punta con más PRs integrados (llega hasta #81). Es el tip original del worktree.
- **`origin/master` está a `73bdc6e7` (#46/#47)** — el tip local auditado tiene **1016 commits que `origin/master` no tiene**, y `origin/master` tiene 48 que este no. `origin/HEAD` apunta a **`origin/feat/planificacion-clases-rediseño`**, NO a master.
- `.github/workflows/ci.yml` dispara en ramas `[main, master, "feat/planificacion-clases-rediseño"]`.
- Hay **8 worktrees activos** y **~30 ramas locales** + muchas `origin/*` (finanzas, whatsapp-f1..f4, pk-slice-1..7, anti/cda1..4, AUS1a..d, ACM1, etc.) → desarrollo muy paralelo por "carriles".
- **HUMAN DECISION**: ¿cuál es la rama canónica de producción? Documentar en `21_HUMAN_DECISIONS_REQUIRED.md`. El pack asume `2803124f` = "estado actual" y lo declara explícitamente.
- Rama de trabajo del pack: `claude/soi-context-baseline` (creada desde `2803124f`).

## 5. Base de datos — cifras verificadas (Supabase en vivo, 10 sep 2026)
- **~186 tablas** en schema `public` (BASE TABLE). Además `auth.*` (23), `storage.*` (10), `cron.job`+`cron.job_run_details`, `net.http_request_queue`+`net._http_response`.
- **35 enums**, **4 sequences**, **11 cron jobs** (`cron.job`), **3 storage buckets**, **46.078 filas** en `cron.job_run_details`.
- `docs/database_schema.sql` (repo) = **desincronizado** (solo ~65 `CREATE TABLE`). `bbdd.md` (repo, 174 KB) documenta ~100 tablas + enums + RLS — más completo pero también parcial. **La verdad es Supabase en vivo / los `_raw/*.json`.**

### 5.1 Row counts (n_live_tup) — tablas con datos (las demás en 0)
```
indicators 4163 · asistencias 2812 · soi_eventos 2579 · nodes 1120 · cuotas 718 · objetivos 480
alumnos_clases 476 · inventario_historial 476 · alumnos_programas 456 · postulantes 404
notification_trigger_logs 326 · inventario_activos 324 · familias 298 · sesiones_clase 290
alumnos 282 · progresos 219 · tareas_institucionales 210 · notificaciones 179 · justificaciones 156
catalogos 131 · sim_log 125 · levels 101 · representantes 90 · observaciones_sesion 89
hermes_whatsapp_queue 75 · clase_horarios 68 · clases 41 · sim_calendario 39 · contactos_alianzas 36
profiles 34 · maestros 33 · comodatos_activos 30 · inventario_materiales 30 · permisos_maestros 29
system_config 23 · indicator_attempts 20 · historial_estado_alumno 16 · plan_indicadores 15 · sim_tareas 15
sections 15 · repertoire_items 14 · sim_outbox 12 · salones 11 · portal_catalog 11 · hermes_process_cases 11
document_templates 11 · registros_pendientes 10 · maestro_indicadores 10 · sim_actores 10 · plan_objetivos 10
route_versions 9 · push_subscriptions 9 · hermes_reactive_rules 8 · inventario_accesorios 8 · plantillas_planificacion 8
routes 8 · blocks 8 · departamentos 7 · programas 7 · plan_temas 7 · calendario_institucional 7 · hermes_protocolos 7
hermes_kanban_cards 6 · curriculo_objetivos 6 · soi_rule_effectiveness 6 · ausencias_maestros 6 · aplicaciones_pago 6
evaluacion_indicador 5 · seguimiento_reglas 5 · student_case_alerts 5 · student_case_events 4 · maestro_objetivos 4
periodos 4 · soi_process_contracts 4 · maestro_desempeno 4 · programas_prerrequisitos 4 · maestro_unidades 4
hermes_whatsapp_config 4 · plan_niveles 3 · signage_media 3 · instrumentos 3 · niveles 3 · pagos 3 · planificaciones 3
logros 3 · curriculo_pilares 3 · curriculos 2 · periodos_cierre_auditoria 2 · ejercicios 2 · student_cases 2
maestro_routes 2 · solicitudes_necesidades 2 · indicador_prerequisito 2 · sim_config 2 · user_portal_access 2
plan_clases 2 · comunicaciones_seguimiento 2 · pagos_alumnos 1 · fin_service_accounts 1 · solicitudes_permisos 1
app_users 1 · pulso_score_history 1 · hermes_gateway_health 1 · lut_ordenes_reparacion 1 · modulos 1
hermes_gateway_worker_lease 1 · hermes_inbox 1 · whatsapp_webhook_log 1 · sim_runs 1 · seguimiento_ausencias_reinicio 1
finanzas_politica_cobranza 1 · unidades 1 · configuracion_recordatorios 1 · fin_service_providers 1 · signage_pantallas 1
tarea_historial 1 · gastos_fijos 1 · solicitudes_ausencia 1 · soi_event_bus 1 · catalogo_objetivos_generales 1
soi_analisis_semanal 1 · becas 1 · tarea_comentarios 1 · configuracion_aranceles 1 · periodo_excepciones 1
conversaciones_whatsapp 1 · telegram_allowed_users 1 · catalogo_niveles 1
```
**~90 tablas están vacías (n_live_tup = 0).** Regla del usuario: **una tabla vacía NO es, por sí sola, candidata a borrar.** Muchas vacías tienen comentario `-- DEPRECATED ... 2026-09` en la BD (ver §5.2).

### 5.2 Tablas con comentario de estado EN LA BD (fuente autoritativa de intención)
Tablas con `-- DEPRECATED ... 2026-09 (Owner: ...)` u observaciones relevantes (extraer lista completa de `views_cron_realtime_buckets_comments.json` → `table_comments`). Ejemplos verificados:
- `rachas`, `schedule_runs`, `schedule_run_feedback` → DEPRECATED (gamificación / motor de horarios en pausa 2026-09, Owner ACM).
- `plan_clases/plan_niveles/plan_temas/plan_objetivos/plan_indicadores` → `DEPRECATED: usar routes/route_versions/blocks/levels/nodes/indicators`.
- `clase_mapa_objetivos`, `clase_mapa_indicadores`, `mapa_plantillas`, `catalogo_objetivos_especificos` → DEPRECATED (jerarquía/plantillas legacy en evaluación 2026-09, Owner ACM).
- `plantillas_planificacion` → `DEPRECATED: reemplazada por mapa_plantillas`.
- `alumno_escolaridad`, `document_batches`, `generated_documents` → DEPRECATED (diferido 2026-09, Owner DIR/ADM).
- `accesorios`, `minutas`, `protocolos` → DEPRECATED / en reserva.
- `supabase/backups/20260908_backup_pre_poda_33tablas.sql` → hubo una **poda de 33 tablas** el 8-sep-2026 con backup.
- `hermes_inbox` → "Bus de eventos para HERMES. Solo service_role."
- `soi_event_bus` → "Bus de eventos interno. Solo service_role."
- `sim_*` (10 tablas) → **sandbox del simulador, datos 100% FICTICIOS**, aislado de producción.
- `maestro_access_credentials` → "Encrypted vault for recoverable maestro portal passwords. Plaintext solo vía Edge Function admin-only."

## 6. Dominios de datos (agrupación provisional — refinar en `04_CURRENT_ERD.md`)
- **IAM / acceso:** `auth.users`, `profiles`, `app_users`, `departamentos`, `usuario_departamentos`, `permisos_maestros`, `portal_catalog`, `user_portal_access`, `maestro_access_credentials`, `service_accounts`.
- **Personas:** `alumnos`, `maestros`, `familias`, `representantes`, `postulantes`, `applicants`, `contactos_alianzas`, `historial_estado_alumno`, `alumno_escolaridad`, `alumnos_reinscripciones`, `alumno_suspensiones`.
- **Académico / clases:** `programas`, `niveles`, `salones`, `clases`, `clase_horarios`, `horarios`, `alumnos_clases`, `alumnos_programas`, `sesiones_clase`, `clases_emergentes`, `periodos`, `periodo_excepciones`, `periodos_cierre_auditoria`, `secciones`(`sections`), `programas_prerrequisitos`.
- **Asistencia:** `asistencias`, `ausencias`, `ausencias_maestros`, `asistencia_maestros`, `justificaciones`, `asistencias_emergentes`(?), `notificaciones_asistencia`, `notification_trigger_logs`, `seguimiento_ausencias_reinicio`, `retenciones_instrumento`.
- **Pedagogía / rutas:** `routes`, `route_versions`, `blocks`, `levels`, `nodes`, `indicators`, `objetivos`, `indicator_attempts`, `indicator_sessions`, `indicator_session_students`, `evaluacion_indicador`, `progresos`, `observaciones_alumnos`, `observaciones_sesion`, `curriculos`/`curriculo_pilares`/`curriculo_objetivos`, `cobertura_alumno_objetivo`, `maestro_routes`/`maestro_unidades`/`maestro_objetivos`/`maestro_indicadores`, `indicador_prerequisito`, `plantillas_planificacion`, `planificaciones`, `modulos`/`unidades`/`ejercicios`, `academic_plans`, `plan_*` (deprec.), `clase_mapa_*` (deprec.), `catalogo_*` (parcial deprec.), `rutas_contenido`/`ruta_contenido_objetivos`, `acm_*` (11 tablas, casi todas vacías), `teacher_class_sessions`/`teacher_session_indicators`/`student_indicator_progress`, `homework_assignments`, `planned_content`/`planning_documents`, `class_events`/`class_event_methodology`/`class_session_content_snapshots`, `node_resources`, `repertoire_items`, `evaluations`.
- **Gamificación (PAUSADA):** `rachas` (deprec), `logros`, `alumnos_logros`, `xp_log`(?), `pulso_score_history`.
- **Finanzas familiares:** `cuotas`, `pagos`, `pagos_alumnos`, `aplicaciones_pago`, `becas`, `wallet_movimientos`, `compromisos_pago`, `score_compromiso`, `patrocinantes`, `patrocinios`, `configuracion_aranceles`, `finanzas_politica_cobranza`, `gastos_fijos`/`gastos_fijos_pagos`, `notificaciones_caja`, `tareas_caja`, `minutas` (deprec), `fin_service_*` (5, integración CEPM medidores), `configuracion_recordatorios`.
- **Lutería / inventario:** `inventario_activos`, `comodatos_activos`, `inventario_accesorios`, `inventario_historial`, `inventario_materiales`, `inventario_reparaciones`, `facturas_reparacion`, `instrumentos`, `accesorios` (deprec), `lut_ordenes_reparacion`, `lut_diagnosticos`, `lut_presupuestos`, `lut_insumos`, `lut_movimientos_insumos`, `lut_solicitudes_compra`, `lut_evidencias`.
- **Comunicaciones / CRM:** `hermes_whatsapp_queue`, `hermes_whatsapp_config`, `whatsapp_webhook_log`, `conversaciones_whatsapp`, `whatsapp_optout`, `whatsapp_consentimientos`, `campanias_periodo`, `campania_envios`, `comunicaciones_seguimiento`, `contactos_alianzas`, `notificaciones`, `push_subscriptions`, `telegram_messages_raw`, `telegram_allowed_users`.
- **Tareas / eventos / Hermes:** `tareas_institucionales`, `tarea_comentarios`, `tarea_historial`, `tarea_logs`, `tareas_calendario`, `calendario`/`calendario_institucional`, `soi_eventos` (2579 filas!), `soi_event_bus`, `hermes_inbox`, `hermes_process_cases`, `soi_process_contracts`, `hermes_protocolos`, `hermes_reactive_rules`, `hermes_kanban_cards`, `hermes_gateway_health`, `hermes_gateway_worker_lease`, `seguimiento_reglas`, `soi_rule_effectiveness`, `soi_analisis_semanal`, `alertas_log`, `protocolos` (deprec), `student_cases`/`student_case_alerts`/`student_case_events`/`student_case_actions`, `maestro_tareas`, `maestro_desempeno`, `solicitudes_ausencia`/`solicitudes_permisos`/`solicitudes_necesidades`, `registros_pendientes`.
- **Simulador (sandbox):** `sim_runs`, `sim_calendario`, `sim_tareas`, `sim_log`, `sim_outbox`, `sim_config`, `sim_actores`.
- **Señalética:** `signage_pantallas`, `signage_media`.
- **Config:** `system_config` (23 filas — "API keys, settings globales" ⚠ revisar si guarda secretos), `catalogos` (131), `catalogo_niveles`, `catalogo_objetivos_generales`.

## 7. Repositorio — estructura verificada
- **1469 archivos** JS/TS/JSX en `src/`. **458 archivos** `*.test.*`/`*.spec.*` (Vitest + `node --test`).
- **`src/modules/` = 47 módulos:** academic-admin, academic-routes, admin-aprobacion, admin-dashboard, admin-notificaciones, admin-usuarios, alianzas, alumnos, asistencias, audiciones, auth, bitacora, calendario, campanias, clases, comunicaciones, config, departamentos, director-aprobacion, finanzas, gateway-config, guidance, help, hermes, horario-builder, horario-general, instrumentos, inventario, luteria, luteria-taller, maestros, metricas, observaciones, pedagogico, periodos, permisos, planificacion, planning, programas, progresos, salones, signage-admin, simulador, sistema, tool-gateway, transicion-semestre, __tests__.
- **`src/portales/` = 11:** _shared, acm, adm, audiciones, calendario, com, fin, inventario, luteria, simulador, tecnico.
- **`src/portal-maestros/`** = portal separado, propio router/shell/views/api/data/services/components/styles + muchos `.md` de spec dentro (SPEC_VANILLA.md, SPEC_Modulo_Ruta_Academica_PWA_Maestro.md, SDD/SPEC/TASKS-mejora-uxui-portal.md, SPEC_suplencias_auditoria.md).
- **`src/core/`**: auth, config, router, `moduleCatalog.js`, `portalCatalog.js`, `portalModuleMatrix.js` (+ view + tests), `catalogAudit.js`, `shadowCapability*.js` (aprobación de capacidades "shadow"), version.
- **`src/services/`**: aiDiagnosticService, analyticsService, auditService, bundleAnalyzer, dbOptimizer, errorReporter, gdprService, lazyLoader, swCaching, webVitals, workers.
- **`src/agents/agt-portal`**, `src/middleware/`, `src/data/`, `src/lib/`, `src/shared/`, `src/components/`.
- **HTML entrypoints (raíz, multi-page Vite):** index.html (maestros), admin.html, acm.html, adm.html, fin.html, com.html, tecnico.html, inventario.html, calendario.html, luteria.html, audiciones.html, simulador.html. `vite.config.js` `rollupOptions.input` los declara (incluye `maestros.html` que puede no existir en raíz — verificar).
- **304 migraciones** en `supabase/migrations/` (+ archivos sueltos: `schema_reference.sql`, `dump_schema.sql`, seeds).
- **`supabase/functions/` = 24 dirs** (ver §8).
- **`openspec/changes/`**: archive, cierre-periodo, panel-hermes-calendario, seguimiento-ausentes, soi-event-spine, teacher-portal-ai-grading, transicion-semestre.
- Reportes en raíz: `eslint-report.json` (2.8 MB — usar para `16_TECHNICAL_DEBT.md`), `bbdd.md`, `mojibake-*.csv` (limpieza de encoding), `Repair-Mojibake.ps1`.
- `signage-pi/` (SPA kiosk Raspberry), `scripts/`, `tools/unicode-reviewer/`, `docker/whatsapp-gateway/`.

## 8. Edge Functions — 23 DESPLEGADAS en Supabase (todas ACTIVE) vs 24 dirs en repo
Desplegadas (slug · verify_jwt · versión):
`push-reminders`(jwt,v20) · `escalate-asistencias-notifications`(no-jwt,v17) · `admin-escalation-alerts`(no-jwt,v17) · `permisos-solicitudes`(jwt,v17) · `send-push`(jwt,v18) · `groq-proxy`(jwt,v19) · `sync-postulantes`(jwt,v27) · `create-user`(jwt,v18) · `send-email`(jwt,v14) · `whatsapp-webhook`(jwt,v23) · `hermes-crear-tarea`(jwt,v13) · `recordar-citas`(jwt,v13) · `hermes-crear-cita`(jwt,v10) · `telegram-webhook`(no-jwt,v23) · `telegram-classifier-cron`(no-jwt,v12) · `simulador-tick`(jwt,v13) · `notification-actions`(jwt,v9) · `hermes-event-monitor`(no-jwt,v9) · `event-spine-logger`(jwt,v17) · `soi-pattern-analyzer`(jwt,v10) · `whatsapp-dispatcher`(jwt,v11) · `hermes-kanban-ingest`(no-jwt,v2).
**Drift:** repo tiene dirs `enrollment-scheduler`, `maestro-credentials`, `refresh-service-balances`, `tool-gateway`, `generate_pending_class_notifications.sql` que NO aparecen como funciones desplegadas con ese nombre; desplegadas `push-reminders` y `permisos-solicitudes` no tienen dir obvio con ese nombre. → verificar y documentar en `13`/`14`/`16`.
- `telegram-classifier-cron` tiene `entrypoint_path` apuntando a un path local de OneDrive de Omar (`/mnt/c/Users/omare/OneDrive/...`) — deploy hecho desde máquina local, no CI. Finding.

## 9. Cron jobs (pg_cron) — 11 en `cron.job` (detalle en `_raw/views_cron_realtime_buckets_comments.json`)
Conocidos de `supabase/cron-jobs.sql`: `generate-pending-notifs-9am` / `-3:15pm` / `-8:45pm` → `SELECT generate_pending_class_notifications()`. Los otros 8 salen del `_raw`. `cron.job_run_details` = 46.078 filas.

## 10. Infra / CI / deploy
- **Netlify**: `npm run build` → `dist/`; headers de seguridad (CSP, X-Frame-Options DENY, nosniff, Permissions-Policy). CSP `connect-src` permite `*.supabase.co`, `api.groq.com`, `openrouter.ai`, `docs.google.com`.
- **GitHub Actions**: `ci.yml` (lint `--quiet` + `tsc --noEmit` + `vite build` + `vitest run`, Node 20, ramas main/master/feat-planificacion), `deploy.yml`, `docker.yml`. Secrets referidos: `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
- **PWA / SW**: `public/sw.js` (Network-First v6 según SOI_ARCHITECTURE.md), `early-error-suppression.js`, `VITE_VAPID_PUBLIC_KEY` para push, `push_subscriptions` (9 filas), `send-push` edge fn.
- **Env var NAMES only** (nunca valores): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_VAPID_PUBLIC_KEY`, `VITE_GROQ_MODEL`, `VITE_WHISPER_MODEL`, `VITE_DEMO_MODE`. Server-side (edge/CI): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`(implícito), claves de Groq/OpenRouter/Telegram/WhatsApp gateway/email (verificar nombres en `supabase/functions/*/index.ts` y `system_config`).

## 11. Integraciones externas (verificar en código)
- **Supabase** (BD, Auth, Edge, Realtime, Storage 3 buckets).
- **Groq** (`groq-proxy` edge fn, `VITE_GROQ_MODEL=llama-3.1-8b-instant`, `VITE_WHISPER_MODEL=whisper-large-v3`) — IA pedagógica / transcripción.
- **OpenRouter** (aparece en CSP `connect-src`) — verificar uso.
- **WhatsApp**: Evolution API / **Baileys** gateway (`docker/whatsapp-gateway/`, `hermes_gateway_health`, `hermes_whatsapp_queue`, `whatsapp-dispatcher` + `whatsapp-webhook` edge fns, `hermes_whatsapp_config`). SDD WhatsApp F1–F4 en ramas.
- **Telegram**: `telegram-webhook` + `telegram-classifier-cron` edge fns, `telegram_messages_raw`, `telegram_allowed_users`, `docs/hermes-enrutamiento-telegram.md`.
- **Email**: `send-email` edge fn (proveedor a verificar — Resend?).
- **Google Apps Script**: `docs/runbooks/GOOGLE_APPS_SCRIPT_ENROLLMENT_SETUP.md`, `sync-postulantes` edge fn (enrollment desde Google Forms/Sheets), CSP permite `docs.google.com`.
- **CEPM** (proveedor eléctrico dominicano): `fin_service_*` tablas, `refresh-service-balances` fn, `cepm-service-account.seed.example.sql` — scraping de balance de medidores.
- **Hermes Kanban**: `hermes-kanban-ingest` lee `~/.hermes/kanban.db` (SQLite local) → `hermes_kanban_cards`.
- **Rive / GSAP** (animación portal maestros), **three.js** (`demo-sala3d.html`), **jsPDF/xlsx** (export).

## 12. Documentos del repo relevantes para el pack (leer, no re-derivar)
`AGENTS.md`, `CONTEXT.md`, `README.md`, `ROADMAP_DE_IMPLEMENTACION.md`, `PLAN_PLANIFICACION_ACADEMICA.md`, `docs/architecture/SOI_ARCHITECTURE.md` (+ `.html`), `docs/ARCHITECTURE.md`, `docs/API_REFERENCE.md`, `docs/DEVELOPER.md`, `docs/DEPLOYMENT.md`, `docs/SECURITY.md`, `docs/COMPLIANCE.md`, `docs/USER_GUIDE.md`, `docs/DIR_V9_PWA_MAP.md`, `docs/planning/SOIMAPPING.md` (mapa de amarres SOI-BACKBONE-MAPPING-V1), `docs/planning/MODULES_SPECIFICATION.md`, `docs/strict-tdd.md`, `docs/hermes/`, `docs/superpowers/plans/*` (planes históricos por feature), `docs/specs/*`, `bbdd.md`, `openspec/changes/*`.
También en Downloads del usuario: `SOI_MASTER_SPEC_v2.0_UNIFICADO.md` (spec OBJETIVO — NO es estado actual; el pack se comparará contra ella después).

## 13. Formato de salida de cada documento del pack
- Markdown en `docs/context-baseline/`. Nombres EXACTOS del brief del usuario.
- Cada afirmación etiquetada por fuente: `[código]`, `[BD-live]`, `[repo-doc]`, `[producción-conocido]`, `[UNKNOWN]`.
- Cada componente con su decisión (`PRESERVE` / `PRESERVE + REFACTOR` / `MIGRATE` / `REPLACE` / `DEPRECATE` / `DELETE CANDIDATE` / `UNKNOWN / HUMAN DECISION REQUIRED`).
- Diagramas: Mermaid.
- Sin secretos, sin PII de menores/familias/personal, sin API keys.

# SOI MASTER SPEC v2.0 — CONTEXTO MAESTRO UNIFICADO
### Documento único de referencia para reconstrucción asistida por IA

**Estado:** unificación de *SOI Master SPEC v1.1* + *v1.2* + *v1.3 (Rev. 2, decisiones D1–D19 de Omar)*, reconciliado contra el repositorio real (`SOI_ElSistemaPC`, rama `master`, esquema Supabase `SOI_DDBB_EL_SISTEMAPC`).
**Fecha:** 10 sep 2026
**Decisiones incorporadas:** D1–D14 resueltas (Parte IX) + D15–D19 abiertas nuevas.
**Autor funcional:** Omar Suniaga
**Institución:** Fundación Escuela de Orquestas y Coros Juveniles e Infantiles de Punta Cana (FUNEYCA-PC) — marca pública **"El Sistema Punta Cana"** / Sistema de Orquestas Infantil y Juvenil (SOI).

---

## PROPÓSITO DE ESTE DOCUMENTO

Este es el **contexto maestro completo** del Sistema Operativo Institucional (SOI). Reúne, en un solo lugar y sin perder ninguna característica de las versiones previas:

1. **La visión y los principios** (qué es el SOI y qué nunca debe hacer).
2. **El estado real medido** (qué existe hoy, qué está a medias, qué es solo diseño).
3. **El catálogo funcional completo** por portal / dominio.
4. **El modelo de datos** — kernel transversal + cada dominio — con nombre conceptual y nombre real cuando existe.
5. **Los procesos** (anatomía Master Book V8, los 5 recorridos cerrados, el bucle proactivo).
6. **La arquitectura** técnica real y objetivo.
7. **La auditoría** (auditoría de negocio + observabilidad técnica + auditoría de IA).
8. **La hoja de ruta** por fases y las decisiones abiertas.
9. **Anexos**: inventario real de la base de datos, equivalencias, glosario, instrucciones para el agente constructor.

**Cómo debe usarlo un agente de IA que reconstruye el sistema desde cero:**
- La **Parte I–IX** define *qué construir* (el objetivo). Es la especificación.
- El **Anexo A** describe *qué existe hoy* (el punto de partida real). Es el contraste.
- Donde el objetivo y lo real difieren, **el objetivo manda**, pero se migran los datos reales y se respetan los nombres canónicos ya establecidos en el lenguaje ubicuo (Anexo C).
- Toda afirmación marcada **🔍 VERIFICAR** debe confirmarse contra código/BD antes de construir encima.

---

## 0. CÓMO LEER ESTE DOCUMENTO

### 0.1 Leyenda de estado

| Etiqueta | Significado |
|---|---|
| ✅ EXISTE | Construido y en uso según lo reportado y verificado en repo/BD |
| 🟡 PARCIAL | Construido pero incompleto, sin cerrar el ciclo, o con defectos conocidos |
| 🔵 DISEÑADO | Especificado en documentos previos, sin construir (o construido fuera del SOI) |
| ⚪ NUEVO | Aparece por primera vez en v1.1/v1.2; aquí se define |
| 🔍 VERIFICAR | Afirmación basada en conversaciones/documentos; confirmar contra el repositorio y la base de datos antes de construir |

### 0.2 Fuentes reconciliadas

1. **SOI Master SPEC v1.1** — extensión funcional y arquitectura proactiva (113 secciones: inteligencia institucional, CRM, comunicaciones omnicanal, pedagogía estructurada, repertorio visual, postulaciones, lutería-finanzas, portal público, auditoría, mecanismos proactivos).
2. **SOI Master SPEC v1.2** — reconciliación con el sistema real, estado medido, feedback de mejora, 12 principios rectores, motor de escalamiento unificado, hoja de ruta por fases.
3. **SOI Master Book V7.0 / V8 ("Operación Genoma")** — 48 procesos, departamentos DIR, ACM, ADM, FIN, LOG, AGT/COM, TECNICO, LUT; anatomía de proceso *disparador → entrada → proceso → salida → destino*.
4. **Visión SOI-Digital** — 9 capacidades (alumno, académico, lutería, alianzas, finanzas, protección, reportes, Hermes, replicabilidad), regla de oro y contrato de evidencia de Hermes; propuesta de gobernanza/licencia.
5. **SOI — Ruta a Referencia** (auditoría forense de la BD, 7 sep 2026) — cifras de línea base, Fase 0, anti-objetivos.
6. **SDD WhatsApp Gateway multidepto** (F1–F9, aprobado en Judgment Day) + ampliación de inbound.
7. **Auditoría de lila** (hallazgos C1–C5, A1–A7).
8. **Teachers PWA spec** (2.957 líneas: modelos, contratos I/O, offline-first, event sourcing, 8 sprints) — parcialmente implementado sobre Supabase (no Firestore).
9. **Guía del Maestro v5.0** + programa de cátedra N0–N4 (escala 0–5, protocolos, reglas de promoción).
10. **ViolinPath** (160+ indicadores de violín).
11. **Sistema Financiero SOI v2.0** (cuotas, Payment Health Index, fondos, flujo de caja, nómina, analítica de dirección).
12. **Señalética digital del vestíbulo** (SPA kiosk, Raspberry Pi Zero 2 W, TV 32" 1280×720).
13. **Repositorio real**: `CONTEXT.md` (lenguaje ubicuo), `docs/architecture/SOI_ARCHITECTURE.md`, `docs/planning/SOIMAPPING.md` (mapa de amarres SOI-BACKBONE-MAPPING-V1), `bbdd.md` (dump del esquema real), `docs/database_schema.sql` (desincronizado).

### 0.3 Convención de nombres

La base de datos real usa mayoritariamente **español** (`alumnos`, `planificacion`, `maestro_tareas`) con algunos prefijos en inglés (`indicator_attempts`, `class_events`, `hermes_*`). v1.1 propone tablas en inglés (`students`, `opportunities`, `contacts`).

**Decisión D1 — RESUELTA (Omar, 10 sep 2026): español.** Toda tabla, columna, vista, función y política nueva se nombra en **español, `snake_case`, tablas en plural** (`solicitudes_departamento`, `resultados_accion`). Se permiten los sufijos técnicos ya usados en la base (`_id`, `_at`, `created_at`). **No se renombra nada en producción.** Los nombres en inglés de v1.1 quedan solo como referencia en el Anexo B. Cada entidad de este documento lleva su *nombre conceptual* y, cuando existe hoy, su *nombre real*. **Nunca** coexisten dos tablas para el mismo concepto en dos idiomas.

### 0.4 Lenguaje ubicuo (resumen — detalle en Anexo C)

`alumno` (no "estudiante/usuario/cliente" en código) · `maestro` (no "profesor/empleado") · `catedra` (no "materia/asignatura") · `clase` (unidad horaria/pedagógica; **no** "sesión/lección/turno") · `sesion_clase` (encuentro real de una clase) · `salon` (no "aula") · `familia_instrumental` con valores estrictos (`cuerdas`, `maderas`, `metales`, `percusion`, `coral_iniciacion`, `general`) · `representante` (tutor legal) · `nucleo` (sede) · `Hermes` (capa transversal, **no** chatbot).

---

# PARTE I — FUNDAMENTOS

## 1. DEFINICIÓN DEL SOI

> **Sistema Operativo Institucional activo, reactivo y proactivo, capaz de observar tanto el interior como el exterior de la institución, detectar situaciones relevantes, convertirlas en oportunidades, alertas, casos, relaciones, tareas y decisiones, y acompañar su seguimiento hasta obtener un resultado.**

Cláusula de la visión SOI-Digital (no negociable):

> **El producto real del SOI no es el software: es el método operativo documentado de la institución. El software es el vehículo. Una sede nueva debe poder operar el SOI leyendo sus manuales, sin depender de su autor.**

**El SOI evoluciona de** «sistema que registra y coordina operaciones» **hacia** «representación digital viva de la institución y de su relación con el mundo exterior».

La palabra decisiva de la definición es la última: **"hasta obtener un resultado"**. Hoy esa es la parte más débil del sistema real (§3). Todo este documento se ordena alrededor de **cerrar ciclos**, no de abrir más.

### 1.1 Modelo conceptual

```
                 MUNDO EXTERIOR
    convocatorias · empresas · fundaciones · embajadas
    festivales · alianzas · oportunidades · contactos
                      │
                      ▼
             RADAR INSTITUCIONAL
                      │
                      ▼
┌────────────────────────────────────────────┐
│                    SOI CORE                │
│ Personas · Academia · Finanzas · Activos   │
│ Comunicaciones · Relaciones · Eventos      │
│ Casos · Tareas · Repertorio · Reportes     │
│ Identidad · Reglas · Permisos · Auditoría  │
└───────────────────┬────────────────────────┘
                    │
                    ▼
                 HERMES
   observar · detectar · relacionar · recomendar
   investigar · preparar · seguir · verificar · aprender
                    │
                    ▼
              ACCIÓN HUMANA
```

### 1.2 Posicionamiento del producto

El SOI **no** es "software de gestión para una escuela de música". Es:

> **Una plataforma operacional inteligente para organizaciones educativas y culturales que integra gestión académica, relaciones institucionales, familias, activos, comunicaciones, oportunidades, eventos y procesos internos, y utiliza IA para detectar riesgos, coordinar acciones y descubrir oportunidades externas.**

Característica diferenciadora — no solo `registrar` sino:
`registrar + observar + relacionar + detectar + investigar + priorizar + coordinar + dar seguimiento + proponer`.

### 1.3 Las cuatro memorias

| Memoria | Pregunta | Sustento |
|---|---|---|
| **Operacional** | ¿Qué ocurre? | eventos, sesiones, asistencia, cola de mensajes |
| **Histórica** | ¿Qué ocurrió? | progresos, pagos, bajas, actas, `audit_log` |
| **Relacional** | ¿Con quién hemos trabajado? | CRM, contactos, hilos, acuerdos, grafo |
| **Estratégica** | ¿Qué oportunidades existen? | radar, watchlist, oportunidades, scoring |

Hermes trabaja sobre las cuatro para producir **conocimiento → decisiones → acciones → seguimiento**.

## 2. PRINCIPIOS RECTORES (NO NEGOCIABLES)

Cualquier requisito posterior que los contradiga queda subordinado.

| # | Principio | Consecuencia práctica |
|---|---|---|
| **P1** | **Consolidación antes que expansión** | Ningún módulo ⚪ entra a construcción mientras su dependencia 🟡 no cierre su ciclo |
| **P2** | **Lo particular se configura; lo común se estandariza** | Niveles, rúbricas, umbrales, textos, calendarios, tallas → tablas de configuración, nunca `if` en código |
| **P3** | **Multi-núcleo desde el dato** | Toda tabla operativa nace con `nucleo_id`. `departamento` y `nucleo_id` coexisten (ejes distintos) |
| **P4** | **Hermes recomienda; un humano decide** | Ninguna acción sensible (§28) se ejecuta sin aprobación registrada |
| **P5** | **SOI no responde solo** | El inbound se recibe, se vincula y se muestra; no hay autorespuesta ni LLM conversando con familias. **Excepción única declarada: §22.3 (bot de postulaciones de menú, sin LLM)** |
| **P6** | **Evidencia obligatoria** | Toda alerta/recomendación incluye: qué ocurrió → evidencia → por qué importa → acción sugerida → quién decide → cuándo revisar |
| **P7** | **Toda escritura se verifica** | Ninguna mutación se reporta como exitosa sin confirmar filas afectadas (`.select()` post-mutación). Hallazgo C1 |
| **P8** | **Ninguna tabla nueva sin dueño** | Cada tabla declara: dueño humano, recorrido al que sirve, criterio de "en uso", comentario SQL |
| **P9** | **La IA nunca escribe directo** | Toda extracción/clasificación de IA pasa por tabla de *staging* + preview + aprobación humana |
| **P10** | **Cada recorrido cerrado trae su manual** | Un recorrido no está "terminado" hasta que alguien que no es Omar lo opera con su manual |
| **P11** | **Datos de menores: mínimo necesario** | Consentimiento explícito, acceso restringido por campo, retención definida, auditoría. **No** se almacena diagnóstico médico, solo categorías |
| **P12** | **Señal, no veredicto** | Las inferencias sobre personas (maestro estancado, familia morosa, alumno en riesgo) se presentan como señales para revisión, **nunca** como etiquetas ni como puntuación oculta |

**Regla de oro (visión SOI-Digital):** el SOI muestra al humano **los hechos individuales**, no una caja negra. Información médica, situación económica, conducta financiera y rendimiento académico **no se mezclan** automáticamente para crear una puntuación de un niño o una familia.

## 3. ESTADO REAL MEDIDO (LÍNEA BASE 7 SEP 2026)

Fuente: auditoría forense de la BD Supabase + auditoría de código de lila. 🔍 Re-medir al cierre de cada fase.

| Métrica | Valor | Lectura |
|---|---|---|
| Tablas totales | 247 | — |
| Tablas sin una sola fila | 123 (50,2%) | La mitad de la superficie no opera |
| Indicadores curriculares cargados | 4.163 | Activo pedagógico enorme |
| Intentos de evaluación de indicadores | 20 | El activo está prácticamente sin usar |
| Eventos detectados por Hermes | 1.971 | Hermes observa |
| Acciones registradas sobre esos eventos | 0 | Nadie sabe si algo se hizo (**Brecha B**) |
| Tareas de seguimiento | 187 | Existen, sin resultado registrado |
| Disparos de notificación | 317 | Existen, sin cierre |
| Cuotas emitidas | 474 | — |
| Pagos registrados | 2 | El circuito financiero no cierra |
| Instrumentos inventariados | 324 | (informe 2025: 219 al cierre — 🔍 conciliar) |
| Órdenes de reparación | 1 | Lutería no deja rastro |
| Portales-cascarón (1–4 archivos) | 8 | Navegación que promete lo que no hay |
| Mutaciones `.update()/.delete()` sin verificar filas | ~51–74 de 133 | Escrituras que pueden fallar en silencio (**C1**) |

### 3.1 Hallazgos de auditoría (lila)

| Código | Descripción | Severidad |
|---|---|---|
| **C1** | Mutaciones sin verificación de filas afectadas ("éxito" sin escritura real). **Contamina todas las cifras de §3.** | 🔴 Prioridad cero |
| **A1** | `ARCHITECTURE.md` / `docs/database_schema.sql` describen un sistema que no existe (desincronizados del esquema real). Cada agente nuevo arranca con un mapa falso. | 🔴 Crítico |
| A6/A7 | Sin typecheck + lint en CI (barato; evita que C1 se repita) | 🟡 |
| C2–C5, A2–A5 | 🔍 Consultar informe completo de lila | — |

### 3.2 Feedback central sobre la visión v1.1

v1.1 es una visión excelente y coherente, pero **introduce al menos 12 contextos nuevos** (radar, watchlist, CRM, grafo de relaciones, propuestas, acuerdos, campañas, creative studio, bot, perfil de pago, recordatorios adaptativos, importador de planificaciones) sobre un sistema cuyos contextos actuales **todavía no cierran**.

Tres de sus conceptos más potentes ya **tienen esqueleto en la BD real** y no deben construirse aparte:

- `student_case` (v1.1 §55) ≈ tabla real `student_cases` + las 187 tareas de seguimiento.
- Follow-up engine (§15) + escalamiento de ausencias (§59) + escalamiento de cobranza (§26) ≈ **un solo motor** (§8 de esta versión).
- `department_requests` (§21) ≈ generalización de `solicitudes_ausencia` / `solicitudes_permisos` (ya con flujo de aprobación).

**Regla de esta versión:** *toda la visión v1.1 se construye completa, pero extendiendo lo existente, en el orden de la Parte VIII.*

## 4. TRES MODOS OPERATIVOS Y EL BUCLE PROACTIVO

| Modo | Ejemplo | Estado | Condición para considerarlo "cerrado" |
|---|---|---|---|
| **Reactivo** | Maestro registra asistencia → métricas | ✅ | Ya opera diariamente |
| **Activo** | 3 ausencias → caso → mensaje → coordinación | 🟡 | Vista de críticos existe; falta acción + resultado registrado |
| **Proactivo** | Radar detecta convocatoria → oportunidad → tareas → seguimiento | ⚪ | Requiere CRM y motor de seguimiento cerrados primero |

**Regla:** un modo superior no se habilita para un dominio mientras el modo inferior de ese dominio no cierre. Hermes no busca *grants* afuera si todavía no sabe si alguien llamó al representante del alumno con 3 faltas.

### 4.1 SOI Proactive Loop

```
OBSERVAR → DETECTAR → ENTENDER → PRIORIZAR → PLANEAR → ACTUAR → VERIFICAR → APRENDER ─┐
   ▲                                                                                  │
   └──────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Principio central

El SOI no debe esperar a que un humano descubra algo. Debe poder decir:
«Esto está ocurriendo» · «Esto debería estar ocurriendo y no está» · «Esto podría ocurrir y es una oportunidad» · «Esta persona necesita hacer algo» · «Esto quedó pendiente» · «Esta obra no llegará preparada a tiempo al ritmo actual» · «Este alumno requiere atención».

---

# PARTE II — ARQUITECTURA Y KERNEL

## 5. ARQUITECTURA TÉCNICA

### 5.1 Lo que existe (🔍 confirmar detalles)

- **Datos:** Supabase / PostgreSQL con RLS por departamento (`get_user_department()`), Edge Functions, Custom Types/Enums (ver Anexo A.2). `docs/database_schema.sql` **desincronizado** del esquema real — regenerar (A1).
- **Frontend:** PWA modular. Portales como "lentes" sobre los mismos datos: Portal Maestros (`index.html`), Administración (`adm.html`), Académico (`acm.html`), Finanzas (`fin.html`), Dirección (`dir.html` 🔍). Shell parametrizado `adminPortalShell.js`, router modular `src/core/router/`, Service Worker Network-First (v6).
- **Modularidad autocontenida:** cada funcionalidad en `src/modules/[nombre]/` con `api/` (Supabase/RPC), `components/`, `domain/` (lógica pura), `views/`.
- **DataAdapter Pattern:** capa obligatoria entre UI y persistencia. Modo Real (Supabase) / Modo Demo (JSON local en `src/assets/data/mocks/*.json`).
- **WhatsApp:** servicio `src/services/whatsapp-runner` con **Baileys** (decidido sobre whatsapp-web.js: sin Chromium headless, sesión estable, MIT), sesión persistente `useMultiFileAuthState`, reconexión con alerta de reescaneo (401/loggedOut), cola `hermes_whatsapp_queue`, `dispatchLoop` con jitter 8–20 s, tope diario con calentamiento `fn_whatsapp_cap_hoy`, horas de silencio, shell **Electron** por PC de departamento (F4).
- **Legado a retirar:** `supabase/functions/whatsapp-webhook/` atado a Evolution API / Meta Graph con autorespuesta + LLM (obsoleto por F9). Su lógica de *match teléfono → alumno* se reutiliza **sin** el LLM.
- **Hermes existente:** motor determinista `src/modules/hermes/api/soiPolicyApi.js` (`hermesConsultaView.js`), Kanban ingest/mirror (`hermes_kanban_cards`), cierre de casos en producción (`fn_hermes_close_process_case`, `fn_hermes_force_close_process_case`), enrutamiento Telegram (`docs/hermes-enrutamiento-telegram.md`).
- **Proceso de desarrollo:** SDD con `openspec/changes/*`, memoria técnica en engram, revisión "Judgment Day", Claude Code implementa, **lila** audita, **AI-Anti** remedia. `coordination/lanes` (candado por área) + tablero `#3536`.

### 5.2 Arquitectura objetivo (capas)

```
INTERNET → RADAR / RESEARCH → INTELIGENCIA EXTERNA
                                     │
┌────────────────────────────────────▼───────────────────────────────┐
│                              SOI CORE (kernel §5.3)                 │
│  Identidad · Personas · Núcleos · Eventos · Tareas · Casos          │
│  Reglas · Permisos · Notificaciones · Configuración · Auditoría     │
└───────────────┬───────────────────────────────────────────────────┘
     ┌──────────┼───────────────────────┐
     ▼          ▼                       ▼
ADMINISTRATIVO  ACADÉMICO ── MAESTROS   FINANZAS FAMILIARES
     │          │  └ REPERTORIO · PEDAGOGÍA │
     ├────── LUTERÍA · INVENTARIO · TIENDITA (LOG) ──────┤
     ▼
COMUNICACIONES / CRM ──▶ WhatsApp · Redes · Email · Pantallas
     ▼
EVENTOS / AGENDA ──▶ REPORTES ──▶ DIRECCIÓN
====================================================================
                    HERMES atraviesa todo horizontalmente
```

### 5.3 El KERNEL — entidades transversales (existen una sola vez)

Toda funcionalidad las reutiliza. Varias ya existen con otro nombre.

| Entidad conceptual | Propósito | Relación con lo real |
|---|---|---|
| `nucleos` | Tenencia multi-sede | Crear; hoy un solo registro (Punta Cana). `nucleo_id` en todo (P3) |
| `personas` | Identidad única (alumno, representante, maestro, contacto externo, monitor) | Hoy separadas: `alumnos`, `maestros`, `profiles`, `postulantes`, campos de representante embebidos en `alumnos`. **Unificar** |
| `familias` | Unidad económica (representante + alumnos) | Existe `familias` + `alumnos.familia_id` |
| `hermes_eventos` | Todo lo que Hermes detecta | ~1.971 eventos hoy (🔍 nombre real: `class_events` es otra cosa; ver `hermes_inbox`, `notification_trigger_logs`) |
| `tareas` | Trabajo asignado a un humano | `maestro_tareas`, `student_case_actions`, `tareas` institucionales (enum `tarea_institucional_estado`) |
| `resultados_accion` | **Cierre obligatorio** de tarea/evento | ⚪ **La pieza que falta (Brecha B)** |
| `casos` | Agrupación de eventos + tareas + escalamientos sobre un sujeto durante un periodo | Generaliza `student_cases` (+ `student_case_alerts`, `student_case_events`, `student_case_actions`) |
| `solicitudes_departamento` | Pedidos entre áreas | Generaliza `solicitudes_ausencia`, `solicitudes_permisos`, `solicitudes_necesidades` |
| `politicas_escalamiento` | Pasos, tonos, intervalos, canales | Una tabla para ausencias, cobranza, seguimiento externo, cumplimiento docente. Hoy: `seguimiento_reglas`, `configuracion_recordatorios` |
| `escalamientos` | Instancia viva de una política sobre un sujeto | ⚪ |
| `mensajes` | Todo envío/recepción omnicanal | Extiende `hermes_whatsapp_queue` / `notificaciones` / `hermes_inbox` |
| `configuracion` | Parámetros por núcleo/programa | `system_config`, `catalogos` |
| `audit_log` | Quién hizo qué, cuándo, desde dónde, con qué justificación | Parcial: `ausencias_auditoria`. Generalizar ⚪ |
| `consentimientos` | Autorizaciones de datos y canales | ⚪ (hoy flags sueltos en `alumnos`: `autoriza_fotos_redes`, `acepta_beca_4500`…) |

### 5.4 Reglas de implementación para cualquier agente

- **Toda tabla nueva:** `id uuid` (PK), `nucleo_id uuid NOT NULL`, `created_at`, `updated_at`, `created_by`, política RLS explícita, comentario SQL con **dueño humano** y **recorrido** al que sirve.
- **Toda mutación:** `.select()` + verificación de filas afectadas; si 0 filas → error visible al usuario (nunca "guardado" silencioso). (P7 / C1)
- **Toda regla de Hermes:** registrada en `hermes_reglas` con `version`, parámetros en `configuracion`, y prueba con datos de ejemplo.
- **Toda interpretación de IA:** tabla de *staging* + preview + aprobación (P9).
- **Todo texto dirigido a familias:** plantilla parametrizable versionada, nunca literal en código (P2).
- **No renombrar** entidades existentes sin migración; extender, no duplicar (P8).
- **`departamento` y `nucleo_id` son ejes ortogonales**: uno dice *quién responde*, el otro *qué sede*.

### 5.5 Event Substrate y Task Substrate

Casi todo se conecta por **eventos** que producen **tareas**:

```
Evento (StudentAbsent, ThirdAbsenceDetected, TeacherAttendanceMissing,
        RepairQuoteCreated, RepairApproved, FamilyPaymentOverdue,
        OpportunityDetected, ProposalSubmitted, PurchaseRequested,
        RepertoireProgressUpdated, ProspectAppointmentScheduled)
   → Regla → Tarea → Owner → Deadline → Follow-up → resultados_accion (Resolution)
```

El **Task Substrate** es uno de los componentes más importantes de SOI Core. Un evento no se considera atendido sin una fila en `resultados_accion`.

---

# PARTE III — HERMES

## 6. HERMES — CONTRATO COMPLETO

### 6.1 Qué es y qué no es

Hermes es la **capa transversal** de detección, relación, recomendación, preparación y seguimiento. **No es un chatbot** ni un agente con permisos de escritura libre. Es:

1. **Reglas deterministas** (configurables, versionadas) — la mayoría de los casos.
2. **Tareas de IA acotadas** (resumir, redactar borradores, extraer, clasificar, puntuar) — siempre con salida revisable.
3. **Un ciclo de vida obligatorio** para todo lo que detecta.

Cuatro capacidades: **OBSERVE · REASON · RESEARCH · ACT**.

- **OBSERVE:** SOI Events, deadlines, métricas, casos, pagos, asistencia, planificación, inventario, repertorio, relaciones.
- **RESEARCH:** el mundo exterior — web, convocatorias, organizaciones, fundaciones, empresas, festivales, programas.
- **REASON:** relaciona información externa + estado institucional + histórico + objetivos. Explica siempre su razonamiento.
- **ACT:** según nivel de riesgo (§6.4). Acciones externas sensibles (enviar propuesta, publicar, contactar patrocinador, aceptar acuerdo) **requieren autorización humana**.

### 6.2 Ciclo de vida de un evento Hermes

```
DETECTADO → VISTO → EN ACCIÓN → RESUELTO
                 ↘            ↘
               DESCARTADO    ESCALADO
               (con motivo)  (nuevo nivel)
```

- Un evento **no** pasa a `RESUELTO` sin un registro en `resultados_accion`.
- Un evento **no** pasa a `DESCARTADO` sin motivo de lista cerrada: `falso_positivo`, `ya_atendido_otra_via`, `fuera_de_alcance`, `dato_erroneo`, `otro` + texto.
- Eventos sin `VISTO` en N horas (configurable por severidad) generan **recordatorio** al responsable, **no** un evento nuevo (evita la inflación que llevó a 1.971 eventos sin acción).
- Cualquier respuesta entrante de una familia **pausa** el escalamiento hasta revisión humana.

### 6.3 Modelo de datos

```
hermes_reglas
  id, nucleo_id, codigo, nombre, dominio, descripcion,
  parametros jsonb, severidad_default, version, activa,
  proceso_master_book (código V7/V8), dueño_id

hermes_eventos
  id, nucleo_id, regla_id, regla_version,
  entidad_tipo, entidad_id,
  severidad (info | atencion | critico),
  evidencia jsonb,          -- datos concretos que dispararon la regla
  por_que_importa text,
  accion_sugerida text,
  decide_rol, asignado_a,
  revisar_en timestamptz,
  estado, motivo_descarte,
  clave_dedup,              -- evita duplicar el mismo evento abierto
  caso_id, tarea_id,
  created_at, visto_at, resuelto_at

resultados_accion
  id, evento_id, tarea_id,
  accion_realizada (lista cerrada + otro),
  canal, resultado (resuelto | parcial | sin_respuesta | no_aplica),
  nota, evidencia_url, registrado_por, registrado_at

hermes_reglas_efectividad  -- ya existe como soi_rule_effectiveness
  regla_id, periodo, disparos, falsos_positivos, tasa_resolucion
```

### 6.4 Niveles de autonomía

| Nivel | Hermes puede | Ejemplos permitidos |
|---|---|---|
| **L0 Observar** | Registrar métricas | Tendencias de asistencia |
| **L1 Notificar** | Avisar a un humano | Badge "4 maestros sin asistencia" |
| **L2 Preparar** | Redactar borrador, pre-llenar formulario | Mensaje 1/3 al representante |
| **L3 Ejecutar con aprobación** | Enviar tras clic humano | Envío del mensaje aprobado |
| **L4 Ejecutar automático** | Solo acciones internas, no sensibles, reversibles | Push recordatorio de asistencia al maestro |

Ninguna acción hacia familias/externos es L4, salvo **recordatorios transaccionales** previamente aprobados como plantilla (p. ej. recordatorio de cita T-1), siempre respetando opt-out.

### 6.5 Contrato de evidencia (P6)

Toda alerta/recomendación de Hermes incluye, en este orden:
**qué ocurrió → evidencia concreta → por qué importa → acción sugerida → quién decide → cuándo revisar.**

### 6.6 Métricas de salud de Hermes

- % de eventos con `resultado_accion` (meta Fase 1: ≥ 70% de eventos críticos).
- Tiempo mediano detección → visto, visto → resuelto.
- Tasa de descarte por "falso positivo" por regla (si > 30%, la regla se revisa).
- Eventos abiertos por responsable (carga).

**Feedback:** hoy Hermes es un buen sensor y un mal cerrador. No hacen falta reglas nuevas; hace falta que las existentes terminen en una fila de `resultados_accion`.

### 6.7 Auditoría de IA (v1.1 §97)

```
ai_runs
  id, nucleo_id, model, purpose, actor, input_reference, output_reference,
  tools_used, tokens, latency, result, correlation_id, created_at

ai_tool_calls
  id, ai_run_id, tool, arguments_hash, authorization_result, result, duration
```

Toda salida de IA que toque datos de personas registra **qué datos se enviaron al modelo y para qué**.

### 6.8 Hermes y el departamento AGT — perfiles por departamento (D2)

En el Master Book V8, **AGT** agrupaba a los **agentes departamentales**: cada departamento tenía el suyo. Esa idea se conserva: **Hermes es un solo motor con un perfil por departamento**.

| Perfil | Reglas que ejecuta (`hermes_reglas.dominio`) | Bandeja | Ejemplo |
|---|---|---|---|
| Hermes·DIR | Salud institucional, casos críticos, decisiones pendientes, fechas límite externas | Dirección | "3 decisiones sensibles esperan aprobación" |
| Hermes·ACM | Ausentismo, cumplimiento docente, deuda pedagógica, protocolos de la Guía | Académico | "Regla de freno N0 en Violín Iniciación B" |
| Hermes·ADM | Postulaciones, citas, datos incompletos, duplicados, bot de menú | Administración | "6 prospectos sin cita" |
| Hermes·FIN | Cuotas, pagos, convenios, cobranza, presupuesto mensual | Finanzas | "Recaudo del mes al 62% del presupuesto" |
| Hermes·LOG/LUT | Lutería, comodatos, stock de tiendita, inventario | Logística | "Resina bajo mínimo" |

Cada perfil tiene **dueño humano, bandeja propia** y sus reglas etiquetadas por `dominio`. Un evento que toca dos departamentos **se crea una sola vez** y se enruta con `solicitudes_departamento` (§9); no se duplica.

---

# PARTE IV — MOTORES TRANSVERSALES

## 7. MAPA DE PORTALES ↔ DEPARTAMENTOS

El portal es *dónde se trabaja*; el departamento es *quién responde*. Departamentos V8 (enum real `soi_departamento`): `DIR`, `ACM`, `ADM`, `FIN`, `LOG`, `COM`, `TECNICO`, `LUT`.

| Portal | Depto. | Estado | Nota |
|---|---|---|---|
| Dirección | DIR | 🟡 | Panel con visión global de asistencias 🔍 |
| Administrativo | ADM | ✅/🟡 | Registro de maestros, alumnos, clases, salones, postulados |
| Académico | ACM | 🟡 | Asistencias, alumnos críticos, cumplimiento docente, auditoría académica. Planificación incompleta |
| Maestros | ACM | ✅/🟡 | El módulo más usado (~80% del ciclo diario) |
| Finanzas Familiares | FIN | 🟡 | Cuotas emitidas; registro de pagos casi inexistente |
| Lutería | LUT/LOG | 🟡 | Inventario cargado; órdenes de trabajo sin uso; tablas + mocks creados (`src/modules/luteria-taller/`) |
| Inventario / Tiendita | LOG | ⚪ | **La tiendita no existe**; el spec React+Firebase de dic-2025 **no se construyó** (D6). Se construye directamente en el SOI (§18.5) |
| Comunicaciones y Relaciones | COM/ADM/DIR | 🟡 | Backbone WhatsApp F1–F3 construido; CRM ⚪ |
| Inteligencia Institucional | DIR | ⚪ | Nuevo |
| Eventos y Agenda | ADM (logística de eventos) | 🔵 | Módulo de Eventos y Conciertos del Master Book (D2: "AGT" era la capa de agentes, no eventos) |
| Postulaciones e Inscripciones | ADM | 🟡 | Recuperación de postulados; PWA de audiciones con Supabase |
| Reportes | DIR | 🟡 | Report Blueprint V8 🔍; reportes semanales manuales |
| Portal Público / Pantallas | ADM | 🟡 | Señalética del vestíbulo diseñada/construida |
| Hermes | **AGT** (Agentes) — transversal | 🟡 | Detecta; no cierra. **D2:** en V8, AGT era la capa de agentes (cada departamento tenía el suyo). Hermes es su evolución: **un solo motor con un perfil por departamento** (§6.8) |
| **Protección y Bienestar** | DIR | ⚪ **AÑADIDO** | Estaba en la visión SOI-Digital; v1.1 lo omitió (§25) |
| **Replicabilidad / Núcleos** | DIR | ⚪ **AÑADIDO** | Estaba en la visión; v1.1 lo omitió (§27) |

**Regla sobre los 8 portales-cascarón:** antes de sumar portales ⚪ al menú, cada cascarón recibe una de tres decisiones: **activar, fusionar o retirar** de la navegación (Fase 0.4). Un menú con 16 portales de los cuales la mitad está vacía destruye la confianza del usuario no técnico.

## 8. MOTOR DE ESCALAMIENTO UNIFICADO ⚪ (unifica v1.1 §15, §26, §59 + cumplimiento docente)

v1.1 describe tres escaleras parecidas (seguimiento de propuestas, cobranza, ausencias) más el cumplimiento docente. **Es un solo motor con distintas políticas.**

### 8.1 Política

```
politicas_escalamiento
  id, nucleo_id, codigo,
  dominio (ausencias | cobranza | seguimiento_externo | cumplimiento_docente),
  disparador (regla Hermes),
  pasos jsonb:
    [ { nivel:1, espera_dias:0, tono:"cordial",       canal:["whatsapp"], plantilla_id, requiere_aprobacion:true },
      { nivel:2, espera_dias:3, tono:"institucional", canal:["whatsapp"], plantilla_id, requiere_aprobacion:true },
      { nivel:3, espera_dias:3, tono:"formal",        canal:["whatsapp","llamada"], abre_caso:true },
      { nivel:4, espera_dias:3, tono:"cita",          accion:"solicitar reunión con Administración" } ],
  condicion_detencion (pagó | justificó | respondió | asistió),
  respeta_ventana_habitual boolean,   -- §21.7 (recordatorios adaptativos)
  horario_permitido, dias_permitidos
```

### 8.2 Ejecución (instancia)

```
escalamientos
  id, politica_id, sujeto_tipo (alumno | familia | organizacion | maestro), sujeto_id,
  nivel_actual, estado (activo | pausado | detenido | completado),
  motivo_detencion, proximo_paso_at, caso_id, responsable_id
```

### 8.3 Bandeja de estado (pedido explícito de Omar)

Vista única, filtrable por dominio:

```
ALUMNO/FAMILIA   DOMINIO     NIVEL  ÚLTIMO ENVÍO  RESPUESTA         PRÓXIMO
Ana Pérez        Ausencias   2/3    08 Sep        ✉ Respondió       Revisar respuesta
Familia Gómez    Cobranza    1/4    07 Sep        — Sin respuesta   10 Sep (nivel 2)
Luis Díaz        Ausencias   3/3    05 Sep        — Sin respuesta   Caso abierto
```

- "Respondió" depende del inbound de WhatsApp (T3, aprobado para v1).
- Un humano abre la respuesta, la lee y registra el resultado. **SOI no contesta.**
- Cualquier respuesta entrante **pausa** el escalamiento.

### 8.4 Criterios de aceptación

- [ ] Un mismo representante con dos alumnos en falta recibe **un** mensaje consolidado, no dos (depende de dedup y de `personas`/`familias`).
- [ ] Si el alumno asiste o se registra justificación, la escalera se detiene sola y queda el motivo.
- [ ] Ningún nivel se envía fuera del horario permitido ni sin la aprobación que su paso exige.
- [ ] Un usuario no técnico entiende en la bandeja, sin ayuda, qué está pendiente y qué le toca hacer.
- [ ] El eje financiero en rojo **nunca** por sí solo dispara "revisión de compromiso" (§19.3).

## 9. SOLICITUDES INTERDEPARTAMENTALES (v1.1 §21) 🟡→⚪

### 9.1 Estado

Existe el flujo de **solicitudes de ausencia docente** con aprobación/rechazo e historial (`solicitudes_ausencia`, `ausenciaAprobacionApi.js` — afectado por C1). Es el primer caso de un patrón general. También existen `solicitudes_permisos` y `solicitudes_necesidades`.

### 9.2 Definición ampliada

`solicitudes_departamento` (generaliza `department_requests`), con:

```
solicitudes_departamento
  id, nucleo_id, departamento_solicitante, departamento_destino,
  tipo, proceso_codigo,          -- vínculo con proceso Master Book (disparador→entrada→proceso→salida→destino)
  recurso_tipo, recurso_id, descripcion,
  prioridad, estado (solicitada | vista | en_proceso | esperando | resuelta | cancelada),
  asignado_a, sla_horas, vence_at, correlation_id,
  respuesta jsonb,               -- resultado estructurado, no solo texto: ej. solvencia {al_dia:true, saldo:0}
  adjuntos jsonb,
  created_at, resuelta_at
```

### 9.3 Catálogo inicial de tipos

| Tipo | Origen → Destino | SLA | Estado |
|---|---|---|---|
| Ausencia de maestro | Maestro → ACM | 24 h | ✅ (migrar al motor general) |
| Solvencia financiera de alumno | ACM → FIN | 48 h | ⚪ |
| Materiales / accesorios | Maestro → LOG | 72 h | ⚪ |
| Reparación de instrumento | Maestro → LUT | 48 h evaluación | 🔵 |
| Asignación de instrumento | ACM/ADM → LOG | 72 h | 🔵 |
| Cambio de horario / salón | Maestro → ACM | 48 h | ⚪ |
| Autorización de gasto | LOG/ACM → DIR según monto | 24–48 h | 🔵 (umbrales en `configuracion` por **rol**, D5) |
| Soporte técnico SOI | Cualquiera → ADM/TECNICO | 48 h | ⚪ |

### 9.4 Regla

Una solicitud vencida sin respuesta genera evento Hermes **al jefe del departamento destino**, no al solicitante.

---

# PARTE V — DOMINIOS Y PORTALES

## 10. PORTAL ACADÉMICO (ACM)

### 10.1 Lo que ya existe

| Capacidad | Estado | Feedback |
|---|---|---|
| Registro de programas, clases, maestros, alumnos, salones | ✅ | Base sólida; depende de clases depuradas |
| Asistencia diaria por clase registrada por maestros | ✅ | **El dato más valioso del SOI**; protegerlo con C1 |
| Vista de alumnos críticos e intermedios por ausencias | ✅ | Convertir en acción (motor §8), no solo en lista |
| Vista de maestros que no registran asistencia | ✅ | Convertir en seguimiento activo (§12) |
| Detección de alumnos duplicados (nombre/apellido, nacimiento, padres, instrumento, clase) | ✅ | Bien resuelto. Mejora: registrar decisiones de fusión y "no son duplicados" |
| Auditoría académica por criterios | 🟡 🔍 | Definir qué criterios y quién la usa |
| Análisis IA del contenido de clase (detectar estancamiento) | 🟡 | Mantener como **señal** (P12); calidad depende del detalle del registro |
| Planificación de contenidos secuenciales | 🟡 | Incompleto; conflicto `planificacion` vs familia `acm_*` / `plan_*` / `routes` (9+ tablas vacías) |
| Registro de alumnos por el maestro y asignación a clases | ✅ | Requiere reglas de permisos (§10.4) — fuente probable de duplicados |

### 10.2 Command Center "¿Qué ocurre hoy?" (v1.1 §53)

```
JUEVES 10 SEP                                   Núcleo: Punta Cana
14 sesiones programadas · 11 maestros · 143 alumnos previstos
2 maestros con ausencia aprobada → 3 sesiones sin cobertura ⚠
5 alumnos con justificación vigente

REQUIERE ATENCIÓN
🔴 3 sesiones sin maestro asignado
🟡 4 asistencias pendientes de ayer (sábado)
🟡 2 conflictos de salón (15:00 Salón 3)
🟡 6 alumnos activos sin clase asignada
🔵 Escalamientos: 3 respuestas por revisar

PROGRESO PEDAGÓGICO (semana)
Indicadores evaluados: 84 · Maestros con plan activo: 9/11
```

Cada línea es clicable → lista filtrada. Cada línea roja corresponde a un evento Hermes **con dueño**.

### 10.3 Clases y sesiones (v1.1 §44–47)

Separación `Clase` (definición permanente) / `SesionClase` (encuentro real). Reales: `clases`, `sesiones_clase`, `clase_horarios`, `clases_emergentes`, `alumnos_clases`.

```
clases
  id, nucleo_id, programa_id, nivel_id, nombre, tipo (individual | grupal | seccional | orquestal | teorica),
  maestro_titular_id, maestros_apoyo[] (monitores), salon_id,
  horario_recurrente (rrule), plan_id, cupo_max, vigente_desde, vigente_hasta, estado

clase_alumnos  (real: alumnos_clases + nomina_alumnos)
  clase_id, alumno_id, rol (regular | oyente | refuerzo), desde, hasta, motivo_salida

sesiones_clase
  id, clase_id, fecha, inicio, fin, salon_id, maestro_id,
  tipo (programada | emergente | recuperacion | extra | ensayo | masterclass | supervision),
  estado (programada | realizada | cancelada | sin_registro),
  motivo_cancelacion, asistencia_estado (pendiente | completa),
  contenido_registrado text, etiquetas[], indicadores_trabajados[]
```

**Clase emergente:** ya existe (`clases_emergentes`, marcada en señalética con punto de anillo). Debe ser el mismo `tipo = emergente` del SOI, no un dato aparte. `emergente_auto_justificacion` ya diseñado.

### 10.4 Permisos del maestro sobre clases (v1.1 §46)

`clase.create = false` por defecto. Permisos concedibles por persona, clase, periodo o programa (real: `permisos_maestros`, `clase_acceso_temporal`).

| Permiso | Por defecto | Uso |
|---|---|---|
| `clase.editar_alumnos` | ❌ | Depuración de su lista |
| `clase.crear_sesion_extra` | ❌ | Recuperaciones |
| `clase.ajustar_horario` | ❌ | Casos puntuales |
| `alumno.registrar` | ✅ 🔍 | Hoy los maestros registran alumnos |

**Recomendación:** el registro por maestro crea al alumno en estado `pre_registro`, y pasa por el detector de duplicados antes de quedar `activo`.

### 10.5 Depuración de clases (v1.1 §47) — Etapa 1 "SOI confiable"

| Regla (configurable) | Condición | Acción sugerida |
|---|---|---|
| Alumno inactivo en clase | ≥ N sesiones consecutivas ausente sin justificación ni escalamiento | Proponer retirar de la clase o abrir seguimiento |
| Alumno activo sin clase | `activo AND sin clase_alumnos vigente` | Asignar o dar de baja |
| Clase vacía | 0 alumnos vigentes | Cerrar o reasignar |
| Maestro sin alumnos | Titular sin clases vigentes con alumnos | Revisar carga |
| Horario inválido | Sesión fuera del calendario institucional o salón inexistente | Corregir |
| Duplicado | Detector existente | Comparar y decidir |

**Criterio de salida:** 100% de alumnos activos con al menos una clase vigente o un estado explícito ("en espera", "refuerzo técnico", "baja en trámite").

### 10.6 Bajas, egresos y deserción — RESUELTO (D8)

Sin una lista cerrada de razones, cada persona escribe el motivo a su manera y a fin de año nadie puede responder **¿por qué se van los alumnos y qué hacemos para que no se vayan?** La decisión tiene dos niveles: **tipo de salida** (quién la origina) y **motivo** (por qué).

**Tipo de salida:**

| Código | Tipo | Definición | ¿Deserción? |
|---|---|---|---|
| `VOL` | Retiro voluntario | La familia/alumno avisa que se retira | Sí |
| `ABA` | Abandono sin aviso | Deja de asistir sin comunicar; se cierra tras agotar el escalamiento (§8) sin respuesta | Sí |
| `INS` | Baja institucional | Decisión de la institución tras revisión de compromiso (§14.3), con aprobación humana (§14.4) | Sí |
| `TRA` | Traslado | Pasa a otro núcleo o a otra institución musical (conservatorio, escuela de arte) | No — puede ser un logro |
| `EGR` | Egreso | Completa su ciclo / alcanza edad o nivel terminal | No — es un logro |
| `PAU` | Pausa temporal | Suspensión con fecha de regreso prevista (máx. configurable — **D19**). **No es baja**; si vence sin regreso → `ABA` o `VOL` | No |

**Motivo** (obligatorio en `VOL`, `ABA`, `INS`; uno principal + hasta dos secundarios):

| Código | Motivo | ¿Institución puede influir? |
|---|---|---|
| `ECO` | Económico (cuota, transporte, materiales) | **Sí** — beca |
| `TRN` | Transporte / distancia | **Sí** — ruta compartida |
| `MUD` | Mudanza fuera de la zona | No |
| `HOR` | Conflicto de horario (escolar, trabajo, otra actividad) | Parcial |
| `ACA` | Carga escolar / exigencia de los padres | No |
| `INT` | Pérdida de interés | Parcial |
| `FAM` | Situación familiar | No |
| `SAL` | Salud (sin detalle clínico, P11) | No |
| `INSX` | Experiencia en la institución (conflicto con compañeros/maestro, clima, no se sintió acompañado) | **Sí** |
| `PED` | Pedagógico (frustración por no avanzar, no pasó audición, ubicación inadecuada) | **Sí** — acompañamiento |
| `INSTR` | Instrumento (no asignado, no le gustó, daño sin reparar) | **Sí** — préstamo |
| `DES` | Desconocido (solo válido en `ABA` sin ningún contacto) | — |
| `OTR` | Otro (exige texto) | — |

**Campos del registro:** `tipo_salida`, `motivo_principal`, `motivos_secundarios[]`, `detalle` (obligatorio en `OTR` e `INSX`), `fecha_efectiva`, `ultima_asistencia`, `hubo_seguimiento` (se calcula solo: ¿hubo escalamiento o caso en los 60 días previos?), `quien_informo` (representante | alumno | maestro | detectado_sistema), `decidido_por`, `readmisible` (sí | no | con_condiciones), `entrevista_salida_realizada`.

**Efectos automáticos:** cierre de `clase_alumnos` · detención de escalamientos · alerta a LOG si hay comodato · alerta a FIN si hay saldo (la deuda se conserva; deja de generar cuotas desde el mes siguiente) · alerta a DIR si el alumno era monitor u ocupaba asiento en la orquesta.

**Base legal de referencia:** el Código de protección de NNA (Ley 136-03, art. 44) obliga a los directores de centros educativos a dirigirse a los padres tras dos ausencias o deserción. El Sistema no es un centro del MINERD, pero el estándar aplica: **contactar a la familia antes de cerrar cualquier baja por abandono**.

Las listas viven en `configuracion` (P2): ACM puede **añadir** motivos, no **borrar** los que ya tienen registros.

**Reportes derivados:** "% de bajas por motivo en el trimestre" · **"% de bajas que tuvieron seguimiento previo"** (la cifra que mide si el SOI sirve) · "deserción por programa, nivel y maestro" (señal, P12) · "motivos que la institución puede influir vs los que no". Dashboard de retención: Ingresaron / Activos / Retirados / Desertaron → % retención.

### 10.7 Justificaciones (v1.1 §54; real: `justificaciones`)

```
justificaciones_asistencia
  id, alumno_id, fecha_inicio, fecha_fin, motivo_tipo (salud | escolar | familiar | transporte | otro),
  origen (representante | maestro | administracion), presentada_por, aprobada_por, estado
```

- Origen `representante` = vía WhatsApp inbound, **transcrita por un humano**.
- **No se almacena diagnóstico médico**, solo "salud" (P11).
- Una justificación vigente **detiene** escalamientos de ausencias del periodo.
- Al abrir la asistencia: `Ana Pérez → JUSTIFICADA · Carlos Gómez → PRESENTE · Luis Díaz → —`.

### 10.8 Ausentismo (v1.1 §29)

Tres reglas configurables por programa: (a) 3 ausencias consecutivas · (b) 3 injustificadas/mes · (c) 25% del periodo. Se añade el umbral de la Guía del Maestro: **asistencia < 70%** como alerta en el checklist de traspaso y en revisiones semestrales.

### 10.9 Horarios y conflictos (v1.1 §61) — Conflict Engine

| Tipo | Bloquea guardar | Advierte |
|---|---|---|
| Salón (dos sesiones mismo salón, mismo tiempo) — `solapamiento_salon` | ✅ | — |
| Maestro (dos sesiones simultáneas) — `solapamiento_maestro` | ✅ | — |
| Alumno (ver §10.10) | ❌ | ✅ |
| Instrumento institucional asignado a dos alumnos en sesiones simultáneas | ❌ | ✅ |
| Sobrecupo (nómina > capacidad del salón) — `sobrecupo` | ❌ | ✅ |

### 10.10 Alumno en dos programas (v1.1 §62 — completado)

No todo solapamiento es error. Un alumno puede estar en Orquesta y Coro, u Orquesta y Piano.

1. **Pertenencia múltiple permitida:** `clase_alumnos` admite varias clases de programas distintos (real: `alumnos_programas`).
2. **Solapamiento horario:** si dos sesiones se cruzan, el sistema pide una **prioridad** para ese bloque ("ensayo general prevalece sobre clase de piano"). Se guarda como regla por alumno o por programa (real: `schedule_agreements` / `split attendance agreement`).
3. **Asistencia coherente:** presente en la sesión prioritaria → ausencia en la otra se marca `ausencia_por_conflicto_autorizado` y **no** cuenta para escalamiento.
4. **Carga semanal:** Hermes advierte si supera N horas/semana (señal, no bloqueo).
5. **Finanzas — RESUELTO (D4):** un alumno genera **una sola cuota** aunque pertenezca a varios programas. **La cuota es del alumno, no de la clase.**

### 10.11 Monitores y tutores ⚪ (principio fundacional de El Sistema; no estaba en v1.1)

- Rol `monitor` sobre una `persona` que **también es alumno**.
- Clases con `maestro_titular_id` + `maestros_apoyo[]`.
- Supervisión: la Guía establece revisión quincenal del profesor base (15 min/grupo con rúbrica N0) + ficha del monitor por sesión. Se registran como `sesiones_clase` tipo `supervision`.
- Pregunta que SOI debe responder: **"¿quién puede ser monitor?"** → alumnos con indicadores de su nivel ≥ 4 y asistencia ≥ umbral.

## 11. PORTAL MAESTROS (v1.1 §31–33, §60)

### 11.1 Lo que ya existe

| Capacidad | Estado |
|---|---|
| Registro de asistencia diario, sencillo, por clase | ✅ |
| Edición/completado de asistencias pendientes | ✅ |
| Seguimiento individual de alumno o clase | ✅ |
| Solicitud de ausencia con historial de ausencias recurrentes | ✅ (afectado por C1) |
| Registro de planificación de contenidos secuenciales | 🟡 |
| Observaciones diarias con etiquetado inteligente | ✅ (`observaciones_alumnos`, `observaciones_sesion`) |
| Perfil de alumno con progreso histórico | 🟡 |
| Notificaciones y recordatorios de registro | ✅ 🔍 |
| Gamificación (XP, rachas, logros) | ✅ (`xp_log`, `rachas`, `logros`, `alumnos_logros`) |

### 11.2 Home del maestro (v1.1 §31)

```
HOY
14:00 Violín N1   ·   16:00 Violín N2
⚠ Asistencia pendiente: sábado
🎯 Planificación · Unidad 2 · Objetivo 3
🎼 Repertorio · Beethoven 5 · trabajar compases 24–40
📩 Solicitudes · 1 pendiente
```

Añadidos v2.0:
- **Evaluación rápida en la sesión** (§12.8): el botón principal durante la clase es "tomar asistencia **y evaluar**".
- **Deuda pedagógica del grupo:** los 3 indicadores más atrasados.
- **Mis escalamientos:** alumnos suyos con escalera activa (solo lectura del estado, **sin datos financieros**).

### 11.3 Biografía del maestro (v1.1 §32)

Separación explícita: `perfil_publico_maestro` (foto, bio, instrumentos, especialidad, formación, experiencia, programas — alimenta portal público y flyers) vs `datos_laborales` (contrato, pago — **nunca** visibles en portal público ni para otros maestros).

### 11.4 Solicitudes del maestro (v1.1 §33)

Tipos: permiso, ausencia, materiales, accesorios, cambio de horario, salón, instrumentos, soporte. Destino según categoría: ACM / ADM / LUT / LOG. Se enrutan por el motor de §9.

### 11.5 Cumplimiento docente → §12.

## 12. CUMPLIMIENTO DOCENTE (v1.1 §30, §60) 🟡

### 12.1 Estado y definición

La vista de "maestros que no llenan asistencia" existe (`get_maestros_compliance_status`, `check_teacher_attendance`, `asistencia_maestros`). Falta convertirla en seguimiento.

Regla: `sesión terminó AND asistencia_estado != completa AND tiempo transcurrido > umbral`.

Escalamiento (política `cumplimiento_docente`, motor §8, **todo interno**):

| Paso | Cuándo | Acción | Nivel Hermes |
|---|---|---|---|
| 1 | Umbral (p. ej. 2 h tras fin) | Push + badge al maestro | L4 |
| 2 | 24 h | Recordatorio + aparece en Command Center | L4 / L1 |
| 3 | 3 sesiones pendientes | Tarea a ACM con lista | L1 |
| 4 | Recurrente en el mes | Tema para reunión individual (no sanción automática) | L1 |

KPIs institucionales: asistencia del maestro ≥ 95%, cumplimiento de reportes 100%, 100% de maestros registrando en plataforma, ≥ 90% con ruta de contenidos activa.

**Feedback:** el reporte semanal del maestro (lunes 12 pm → coordinación, definido en el Master Book) debería **generarse solo** a partir de sesiones, asistencias y contenidos registrados. Si el maestro registra bien, no escribe un reporte adicional — incentivo real para registrar.

## 13. PEDAGOGÍA ESTRUCTURADA (v1.1 §34–43) — LA BRECHA MÁS IMPORTANTE

Mayor activo acumulado (4.163 indicadores, ViolinPath 160+, Guía del Maestro v5, programa N0–N4) y menor uso (20 evaluaciones).

### 13.1 Unificación de jerarquías

```
PROGRAMA (Orquesta · Coro · Piano · Iniciación)
 └── CÁTEDRA / INSTRUMENTO (Violín, Viola, …)
      └── NIVEL (N0 … N4)              ← estándar institucional (Guía del Maestro)
           └── PLAN (por periodo/semestre; se asigna a una Clase)
                └── UNIDAD (6 por defecto, configurable)
                     └── OBJETIVO
                          └── INDICADOR   ← catálogo reutilizable, NO se copia por plan
```

**Clave:** el indicador vive en un **catálogo** por cátedra y nivel; los planes lo *referencian*. Los 4.163 indicadores sugieren duplicación por copia entre planes 🔍 — deduplicar es parte de la Fase 0.3 (resolver `acm_*` vs `planificacion` vs `plan_*` vs `routes`/`route_versions`/`blocks`/`levels`/`nodes`/`indicators`).

**Propiedad intelectual (D16, bloquea Fase 0.3):** la propuesta de gobernanza (§26) clasifica **ViolinPath como herramienta personal de Omar**, fuera del acuerdo institucional. Si sus 160+ indicadores se cargan al catálogo institucional, deben entrar como contenido de la Guía del Maestro o bajo licencia explícita. Decidir antes de la Fase 0.3.

Reales relacionados: `indicators`, `indicator_attempts`, `indicator_sessions`, `indicator_session_students`, `nodes`, `blocks`, `levels`, `routes`, `route_versions`, `rutas_contenido`, `ruta_contenido_objetivos`, `planificacion_nodos`, `curriculos`, `curriculo_pilares`, `curriculo_objetivos`, `cobertura_alumno_objetivo`, `plan_niveles`, `plan_temas`, `plan_objetivos`, `plan_indicadores`, `academic_plans`, `alumno_plan_entradas`.

### 13.2 Indicador

```
indicadores
  id, nucleo_id, catedra_id, nivel_id, codigo, nombre, descripcion,
  criterio_logro (qué se observa, en qué condición: cuerda, posición, tempo),
  tipo (critico | obligatorio | complementario),          -- Guía del Maestro
  dimension_principal (afinación | pulso | técnica | sonido | agilidad | lectura | ritmo | musicalidad | repertorio),
  dimensiones_secundarias[],
  peso, orden, material_referencia (método/obra/escala),
  umbral_desbloqueo (default 3),
  activo, version
```

### 13.3 Estados — dos capas (unifica v1.1 `locked…achieved` con la escala 0–5 de la Guía)

| Capa | Valores | Qué responde |
|---|---|---|
| **Acceso** | `bloqueado` · `disponible` · `introducido` | ¿Se puede trabajar? ¿Ya se presentó? |
| **Logro** (escala Guía) | 0–1 Consolidación · 2 En proceso · 3 Logro mínimo · 4 Sólido · 5 Dominio | ¿Qué tan bien? |

Equivalencias UI tipo Duolingo: 🔒 bloqueado · ⚪ disponible sin introducir · 🟡 introducido o logro 1–2 · 🟢 logro 3 · ✅ logro 4–5.
(Enum real `progress_status`: `pending | in_process | approved | failed`; `nivel_estudiante`: `Nivel 1..5`.)

### 13.4 Prerrequisitos (v1.1 §37)

Un indicador se desbloquea cuando **todos** sus prerrequisitos alcanzan `umbral_desbloqueo` (default 3). Indicadores sin dependencia avanzan libremente. Dependencias sugeridas por IA (importador) requieren aprobación. Real: `indicator_dependencies` (diseñado).

### 13.5 Deuda pedagógica (v1.1 §38)

**Deuda = indicadores de unidades ya cerradas del plan con logro < 3.** Los críticos en deuda pesan **doble** en el % mostrado. El maestro ve: `Ana ████████░░ 80% · Pendientes: afinación escala Re, lectura ejercicio 14`.

### 13.6 Reglas de la Guía del Maestro convertidas en reglas Hermes ⚪

| Protocolo (Guía) | Regla Hermes | Acción |
|---|---|---|
| Alerta técnica prioritaria | Indicador crítico en 0–1 durante semanas 1–4 | Intervención ≤ 7 días; reevaluación en 2 semanas |
| Intervención especial | Mismo nodo sin avance en dos evaluaciones | Revisar asistencia, hábito, instrumento, motivación, entorno, audición, método |
| Regla de freno (N0) | > 30% del grupo con postura tensa/pulgar presionado en 0–1 | Detener avance; co-enseñanza profesor base + monitor |
| Calibración docente | Diferencia > 1 punto entre evaluadores del mismo alumno/indicador | Sesión de calibración con video |
| Comunicación con familias | Decisión "continúa en proceso" o "consolida" | Reunión ≤ 7 días, rúbrica, evidencia, plan en casa, fecha de reevaluación |
| Traspaso entre maestros | Cambio de docente o cierre de semestre | Paquete de traspaso + checklist (técnica, asistencia < 70%, talla de instrumento, material) |

### 13.7 Promoción ⚪ (enum real `resultado_audicion`: `PROMOVIDO | PERMANECE | NO_PROMOVIDO`)

Un alumno promueve de nivel cuando **todos los indicadores críticos** están en el umbral del nivel y **un % de obligatorios ≥ 3 configurable por cátedra y nivel** (D9 — RESUELTO: configurable). Decisiones: Promueve · Continúa · Consolida · Reubicación. En N3–N4, validación obligatoria del jefe de cátedra. SOI **genera el acta de promoción** con los datos ya evaluados; no se llena a mano.

### 13.8 Evaluación dentro de cada clase (v1.1 §40) — el punto que desbloquea todo

La causa de "4.163 indicadores / 20 evaluaciones" es **fricción**, no voluntad. Requisitos UX:

- La sesión trae **pre-cargados** los indicadores del objetivo en curso (desde el plan).
- Evaluar = tocar el nombre del alumno y un número 0–5. **Meta: ≤ 5 segundos por alumno por indicador.**
- Evaluación grupal rápida: "todos en 3 excepto…".
- **Funciona sin conexión** y sincroniza (herencia del spec PWA offline-first; `class_session_content_snapshots`).
- La observación libre sigue existiendo; el etiquetado inteligente la vincula a dimensiones.
- Una sesión puede cerrarse **sin** evaluar; Hermes mide % de sesiones con evaluación por maestro (señal, no sanción).
- **Gap SP-2:** no permitir guardar estado `achieved`/verde en indicadores **críticos** si `evidencia_url` está vacío.

**Criterio de éxito Fase 1:** ≥ 60% de sesiones realizadas con al menos un indicador evaluado.

### 13.9 Métricas musicales y Perfil 360 (v1.1 §41–42)

Cada dimensión = promedio ponderado del último logro de los indicadores cuya dimensión principal o secundaria coincide (secundaria pesa 0,5), sobre los indicadores **disponibles** del nivel. Se muestra tendencia (últimas 4 evaluaciones) y **nunca un número sin su base** ("Afinación 78% · basado en 12 indicadores"). Escalas por tonalidad, métodos (Wohlfahrt, Suzuki), repertorio con % de progreso.

### 13.10 Importador de planificaciones (v1.1 §43)

```
PDF / DOCX / FOTO / SCAN → Vision/Parser → extracción IA → Unidades → Objetivos
→ Indicadores → Dependencias sugeridas → PREVIEW → MAESTRO/COORDINADOR APRUEBA → BD
```

**Nunca** guardar una interpretación de IA sin preview (P9). Antes de crear indicadores nuevos, **buscar coincidencias en el catálogo existente**; mostrar "12 indicadores ya existen, 4 nuevos". Reales: `document_templates`, `document_batches`, `generated_documents`, `planning_documents`, `planned_content`, `schedule_runs`, `schedule_run_feedback`.

### 13.11 Planificación de maestros (v1.1 §60)

Tabla Asistencia/Planificación por maestro (`Camilo ✅✅ · Pedro ⚠✅ · Ana ✅🔴`). KPI: **≥ 90% de maestros con ruta de contenidos activa**. Acciones: push / mensaje / tarea.

### 13.12 Repertorio visual y mapa de calor ⚪ (v1.1 §64–75)

```
obras
  id, nucleo_id, titulo, compositor, arreglista, formato (orquesta | camara | coro | solo),
  nivel_sugerido, duracion, archivo_partitura_url, audio_referencia_url

obra_compases  (Measure Model — v1.1 §66)
  id, obra_id, numero_compas, marca_ensayo (rehearsal mark), numero_fila, posicion_en_fila

obra_secciones
  obra_id, compases_desde, compases_hasta, dificultad, indicadores_asociados[]

programacion_repertorio
  programa_id, obra_id, periodo, concierto_id

progreso_compas  (real embrión: repertoire_fragments)
  obra_id, compas_id, sujeto_tipo (student | class | instrument | section | family | ensemble),
  sujeto_id, estado, evaluado_por, evaluado_at
```

- **Filas configurables:** `measures_per_row` (8 por defecto; 4/6/10 según partichela).
- **Seis estados semánticos** por compás (nombrar semánticamente y asociar color en el Design System; **no depender solo del color**): Sin leer · Leído · En proceso · Con dificultad/avanzado · Listo · Silencio.
- **Capas:** Alumno / Clase / Instrumento / Fila / Familia / Orquesta completa.
- **Promedio:** el score general **no cuenta** instrumentos en silencio.
- **UX tablet:** modo rápido (tap cicla estados) + modo selección (mantener presionado → arrastrar → asignar estado). Botón ⓘ "Cómo usar el mapa".
- **Repertorio proactivo (v1.1 §75):** Hermes analiza fecha del concierto + avance + secciones débiles + ensayos restantes → `🔴 PRIORIDAD DE REPERTORIO · Compases 81–112`.
- **Regla de la Guía:** el repertorio comercial/hotelero **no** forma parte del currículo pedagógico.
- Conecta con KPIs del Challenge OSIJ-PC ("compases montados por semana").

## 14. SEGUIMIENTO DEL ALUMNO, ESTADO 360 Y DECISIONES SENSIBLES (v1.1 §55–59)

### 14.1 Caso de seguimiento

`[Activar seguimiento]` crea un registro en `casos` (tipo `alumno`) — **no** una tabla `student_case` aparte (generaliza los reales `student_cases`, `student_case_alerts`, `student_case_events`, `student_case_actions`). Al abrirse:

- Se vinculan eventos Hermes y escalamientos abiertos del alumno.
- Se generan `solicitudes_departamento` automáticas: FIN (situación de cuenta), LOG/LUT (instrumento asignado y estado), ACM (asistencia y progreso). **Cada departamento responde solo su eje** — FIN no ve progreso, ACM no ve montos.
- El caso tiene responsable, fecha de revisión y cierre con resultado (P6).

### 14.2 Estado 360 — cuatro ejes

| Eje | Fuente | 🟢 / 🟡 / 🔴 (configurable) | Visible para |
|---|---|---|---|
| Situación financiera familiar | FIN: cuenta de familia | Al día / atraso < 30 días / ≥ 30 días | FIN, DIR, coordinador del caso (**solo semáforo, sin montos**) |
| Asistencia | ACM | ≥ 85% / 70–85% / < 70% | ACM, DIR, maestro |
| Progreso pedagógico | Pedagogía | Sin críticos en deuda / 1 crítico / ≥ 2 críticos o nodo estancado | ACM, maestro, DIR |
| Responsabilidad patrimonial | LOG/LUT | Sin instrumento institucional o en buen estado / daño reportado / pérdida o no devolución | LOG, DIR |

El cuarto eje mide obligaciones sobre **instrumentos institucionales**; **no penaliza** a quien posea instrumento propio.

### 14.3 Revisión de compromiso (v1.1 §57)

Múltiples señales críticas → SOI **recomienda** revisión (reunión con representante, alumno y coordinación, con acta). Umbral por defecto: ≥ 2 ejes en 🔴 sostenidos ≥ 2 semanas.

**Salvaguarda:** el eje financiero en rojo **nunca** es suficiente por sí solo. En una institución de acción social, la dificultad económica es razón para **buscar beca**, no para iniciar una salida. SOI **no expulsa automáticamente**.

### 14.4 Decisiones sensibles (v1.1 §58) — enum real `bloqueo_certificado`, `bloqueo_evento`, `mora_flag`

Retirar alumno · retirar beca · retener instrumento · suspender · cambio de nivel por consolidación · baja administrativa · bloqueo de canal de comunicación · bloqueo de certificado/evento.

Todas exigen: **revisor humano con rol autorizado, justificación, evidencia vinculada, registro en `audit_log`, notificación al representante con el texto aprobado.**

### 14.5 Escalamiento de ausencias (v1.1 §59) — plantillas iniciales de la política `ausencias`

- **Falta 1** (tono amable): "Notamos que Ana no pudo asistir hoy. Recuerde notificarnos previamente… **¿Está todo bien?**" (la pregunta abierta convierte el mensaje en contacto, no en reclamo, e invita a responder → alimenta la bandeja).
- **Falta 2** (tono institucional): "Ana registra dos ausencias injustificadas durante el periodo actual…".
- **Falta 3** (caso formal): "Se abre revisión de compromiso. Requiere: representante, alumno, coordinación."

Medidas sobre instrumentos o permanencia: **configurables + aprobación humana**.

## 15. PORTAL ADMINISTRATIVO (ADM)

### 15.1 Lo que existe

Registro de maestros, alumnos (ficha 360°), clases, salones, postulados; nómina consolidada; gestión de justificaciones (bandeja de aprobación ADM-P08); Kanban de Hermes reflejado en tiempo real. Reales: `alumnos` (ficha muy amplia — ver Anexo A.1), `familias`, `salones`, `postulantes`, `alumno_escolaridad`, `historial_estado_alumno`.

### 15.2 Detección de duplicados (v1.1 §27) — Core Data Quality ✅

Detecta combinaciones de nombre, apellido, teléfono, representante, nacimiento, email, dirección. Resultado: `POSIBLE DUPLICADO 94% · Ana Pérez / Ana M. Pérez · [Comparar]`. **Nunca fusiona automáticamente.** Añadir: registro de decisiones de fusión y de "no son duplicados" (para no volver a sugerirlos).

### 15.3 Alumnos sin clase (v1.1 §28)

`active_student AND no_active_class_assignment` → aparece en Administrativo, Académico, Dirección y Hermes.

## 16. POSTULACIONES E INSCRIPCIONES (v1.1 §48–52)

### 16.1 Lo que existe

- Recuperación de postulados en el panel administrativo ✅ 🔍 (`postulantes`, `postulados-feature.md`).
- PWA de gestión de audiciones con Supabase ✅ 🔍 (**D7**: ¿integrada al SOI o separada?).
- Enrollment vía Google Apps Script (`docs/runbooks/GOOGLE_APPS_SCRIPT_ENROLLMENT_SETUP.md`).

### 16.2 Funnel

```
INTERESADO → LEAD → PRE-REGISTRO → INFORMACIÓN → CITA → EVALUACIÓN
   → AUDICIÓN/UBICACIÓN → { INSCRIPCIÓN → ALUMNO | LISTA DE ESPERA | NO ADMITIDO }
```

Pasos añadidos a v1.1: **AUDICIÓN/UBICACIÓN** (entre Evaluación e Inscripción) y estado **LISTA DE ESPERA** (cupos limitados; audiciones ≥ 2/año como KPI de dirección musical).

**Al pasar a ALUMNO, la persona conserva el mismo `id` de `personas`.** El prospecto **no se "copia"** a alumnos (fuente clásica de duplicados).

```
prospectos  (real: postulantes)
  id, nucleo_id, persona_id, first_name, last_name, birth_date, guardian_name,
  phone, email, instrument_interest, program_interest, status, source, created_at
```

### 16.3 Bot de Administración y Postulaciones — excepción declarada a P5 (D10 — RESUELTO)

**Un solo bot en el número de Administración (ADM)**, que atiende postulaciones e información administrativa general (ambas del mismo departamento). Los seguimientos de ausencias y cobranza salen de **su propio número/departamento** en el gateway (columna `departamento`), separados del bot.

- **Única excepción** a "SOI no responde solo", declarada por escrito en `ARCHITECTURE.md`.
- **De menú y determinista, sin LLM.** Responde solo contenido de `respuestas_aprobadas` (versionado, editable por ADM).
- **Menú inicial:** 1) Programas y edades · 2) Requisitos e inscripción · 3) Fechas de audición/inscripción · 4) Ubicación y horario de atención · 5) Cómo pagar (métodos, cuentas, horarios de caja) · 6) Solicitar cita · 7) Hablar con una persona.
- **Nunca responde sobre un alumno concreto** (saldo, asistencia, notas). Si el número es de un representante y pregunta algo personal → "Una persona del equipo te responderá" + bandeja ADM.
- Texto libre que no coincide con el menú → bandeja humana.
- La opción 6 crea el prospecto y la cita (§16.4) en estado `pendiente de confirmación humana`.
- Métricas: consultas por opción, % derivadas a humano, tiempo de respuesta humana.

### 16.4 Cita (v1.1 §51) y formulario de inscripción (v1.1 §52)

SOI puede: detectar apertura próxima → invitar → ofrecer horarios → reservar cita → enviar requisitos → recordatorio T-1 (L4 permitido, transaccional, plantilla aprobada). La cita aparece en Administrativo y en la agenda (§23).

Formulario en **tres bloques de acceso**:

| Bloque | Contenido | Acceso |
|---|---|---|
| **Básico** | Identificación, familia, contacto, escolaridad, disponibilidad, transporte, experiencia musical, aspiraciones, gustos | ADM, ACM, maestro (parcial) |
| **Sensible** | Condiciones socioeconómicas | ADM/FIN designados; solo para becas |
| **Médico / emergencia** | Información médica relevante, contactos de emergencia, autorizaciones | Lectura en emergencia por maestro de la clase; edición ADM |

Cada bloque sensible exige **consentimiento explícito** en `consentimientos`, y **ninguno alimenta reglas automáticas de Hermes** (P11).

### 16.5 Audiciones y jurado — módulo con interruptor ⚪ (D7 — RESUELTO)

La PWA de audiciones existe como **proyecto aparte**, no integrada. Decisión: construir en el SOI una **vista de calificación por jurado dentro del Portal de Maestros**, que permanece **apagada** y solo se enciende durante los periodos de audición. Integrar la PWA externa queda para el futuro.

**Interruptor por módulo:**

```
modulos_habilitados
  nucleo_id, modulo ('audiciones'), activo, activo_desde, activo_hasta, activado_por, roles_visibles[]
```

Fuera de la ventana, el módulo **no aparece en ningún menú**. Se enciende al abrir una convocatoria y se apaga solo al cerrarla.

```
convocatorias_audicion
  id, nucleo_id, titulo, tipo (ingreso | ubicacion_orquesta | promocion_nivel | solistas),
  instrumentos[], fechas, asientos_disponibles jsonb, rubrica_id, estado
candidatos_audicion
  id, convocatoria_id, persona_id (prospecto o alumno), instrumento, obra_presentada,
  turno, estado (inscrito | presentado | ausente)
jurados
  convocatoria_id, persona_id (maestro), panel, instrumentos_que_evalua[]
calificaciones_audicion
  candidato_id, jurado_id, criterio_id, puntaje, comentario, enviada_at
resultados_audicion
  candidato_id, puntaje_final, posicion, decision (admitido | lista_espera | no_admitido | asignado_fila_asiento), acta_id
```

**Reglas:**
- Rúbrica configurable (afinación, sonido, ritmo, técnica, musicalidad, lectura a primera vista…), reutilizando las dimensiones de §13.2.
- **Calificación independiente:** cada jurado no ve los puntajes de los demás hasta enviar los suyos.
- Cálculo configurable: promedio · mediana · promedio descartando extremos. Hermes señala discrepancias > 2 puntos entre jurados (reusa la regla de calibración de §13.6).
- Deliberación y **acta con firmas**; los resultados no se publican hasta cerrar el acta.
- Salida: admitidos → funnel de inscripción (§16.2); alumnos → ubicación en fila/asiento; alimenta el KPI "100% de asientos cubiertos al cierre de semestre".
- Funciona en tableta/móvil durante la audición, con registro sin conexión.
- (Enum real `resultado_audicion`: `PROMOVIDO | PERMANECE | NO_PROMOVIDO` para promoción de nivel.)

## 17. PORTAL FINANZAS FAMILIARES (FIN) (v1.1 §22–27)

### 17.1 Alcance — RESUELTO (D3)

**Fuera del SOI:** nómina, impuestos, contabilidad general, **fondos restringidos de donantes**, estados financieros, seguridad social, contabilidad de doble partida, flujo de caja de 12 semanas.

**Dentro del SOI (Finanzas Familiares):** mensualidades e inscripciones · tiendita (materiales, útiles, uniformes, accesorios) · cargos de lutería a familias · becas, descuentos y convenios de pago · registro de pagos mensuales y su aplicación a cargos · mecanismo de seguimiento de pagos (recordatorios, escalamiento de cobranza, perfil de pago) · **gestión del presupuesto mensual** (§17.8).

**Una sola integración con lo institucional:** el SOI exporta ingresos de familias por periodo. **D3 pendiente residual:** ¿quién lleva la contabilidad institucional y con qué herramienta? El SOI exporta en ese formato. La propuesta de gobernanza (§26) debe **actualizar su tabla de alcance** (todavía describe v2.0 con nómina).

### 17.2 Lo que existe

- Emisión de cuotas ✅ (474 emitidas). Enum real `cuota_estado`: `pendiente | pagada | vencida | en_mora | exonerada | becada | pre_pagada`.
- Registro de pagos 🟡 (2) — causas: C1 + fricción del flujo + falta de dueño operativo. Real: `pagos_alumnos`, `aplicaciones_pago`.
- Wallet familiar (enum `wallet_tipo/origen/modo/status`), exoneraciones, patrocinios (`patrocinante_tipo`, `patrocinio_cubre`), cierre de caja (`cierre_caja_estado`), minutas (`minuta_visibilidad`).
- Payment Health Index (v2.0) → se renombra **Perfil de Comportamiento de Pago**.
- Detector de riesgo combinado (`studentRiskDetectorService.js`, FIN-P13) — INTEGRADO.

### 17.3 Modelo

```
cuentas_familia  (real: familias + wallet)
  id, nucleo_id, representante_persona_id, estado

cargos
  id, cuenta_id, alumno_id,
  concepto (mensualidad | inscripcion | uniforme | accesorio | material | reparacion | otro),
  origen_tipo, origen_id (orden de lutería, venta de tiendita),
  monto, moneda (DOP), fecha_emision, fecha_vencimiento,
  estado (pendiente | parcial | pagado | anulado | becado)

pagos  (real: pagos_alumnos)
  id, cuenta_id, monto, metodo (efectivo | transferencia | pago_movil | tarjeta | mixto | tercero | link_externo),
  referencia, comprobante_url, fecha_pago, registrado_por, verificado_por

aplicaciones_pago  (real: aplicaciones_pago)
  pago_id, cargo_id, monto_aplicado          -- un pago puede cubrir varios cargos

becas_descuentos
  id, alumno_id, tipo (% | monto), valor, motivo_categoria, vigencia, aprobado_por
```

Cargos de lutería y tiendita **se generan desde su módulo** (`origen_tipo`/`origen_id`); FIN no los digita a mano.

### 17.4 Registro de pago — requisitos para cerrar la brecha (R3)

- Registrar un pago en **≤ 3 pasos** desde la cuenta de la familia.
- Aplicación automática al cargo más antiguo, editable.
- **Confirmación visible leyendo de la base** después de guardar (C1).
- Recibo generado (PDF / WhatsApp con aprobación).
- Conciliación semanal: lista de transferencias sin cuenta asignada.

### 17.5 Cuenta de familia (v1.1 §23)

```
Familia Suniaga
Mensualidad   RD$600 · Cuerdas RD$900 · Reparación RD$450
Total RD$1.950 · Pagado RD$1.500 · Pendiente RD$450
```

Añadidos: desglose por alumno cuando la familia tiene varios; becas como línea negativa; historial de 12 meses.

### 17.6 Perfil de Comportamiento de Pago (v1.1 §24)

El sistema aprende: día promedio de pago, desviación, pagos puntuales/tardíos, deuda histórica, recordatorios necesarios, tendencia. Ejemplo: "Familia Pérez · generalmente paga entre 25–30 · puntualidad 82% · retraso promedio 3,2 días · tendencia estable".

Salvaguardas: requiere **≥ 3 meses de historial**; visible **solo en FIN**; **no es un campo que otras reglas lean**, salvo la ventana de recordatorio (§17.7). **Nunca** puntuación secreta para expulsiones o decisiones discriminatorias (P12).

### 17.7 Recordatorios adaptativos (v1.1 §25) y escalamiento de cobranza (v1.1 §26)

Política `cobranza` del motor §8 con `respeta_ventana_habitual = true`. En lugar de "día 1 → mensaje para todos", SOI aprende la ventana habitual (padre paga 26–29 → recordatorio día 26, no días 5/10/15).

Escalamiento cada 3 días (configurable): Nivel 1 recordatorio cordial · Nivel 2 recordatorio institucional · Nivel 3 aviso formal de saldo · Nivel 4 solicitud de comunicación con Administración. Textos **parametrizables**. **Nunca** se envía cobranza al alumno, solo al representante.

**Orden de prioridad:** (1) C1 · (2) registro de pago sin fricción · (3) 3 meses de datos · (4) recordatorios adaptativos.

### 17.8 Reglas financieras heredadas (análisis de vacíos del sistema financiero, ago-2026)

Se adoptan porque aplican al alcance decidido:

| Regla | Definición |
|---|---|
| Montos exactos | Enteros (centavos), nunca flotantes. Formato `RD$ 1,250.00`. Cuotas a familias solo en **DOP** |
| Fecha de valor | Los motores de comportamiento usan `fecha_pago`, no la fecha en que se digitó |
| Registro retroactivo | ≤ 5 días sin fricción · 6–30 días exige motivo · > 30 días o periodo cerrado exige aprobación de DIR · todo desfase > 5 días aparece en un reporte de excepciones |
| Idempotencia | Generar cuotas dos veces para el mismo alumno+periodo no duplica (clave única `alumno_id + concepto + periodo`) |
| Becas | Se aplican al emitir la cuota; una beca retroactiva genera **nota de crédito**, no edita cuotas pasadas |
| Hermanos | Se factura por alumno y se cobra por representante; el estado de cuenta muestra ambos niveles |
| Retiro | El alumno deja de generar cuotas desde el mes siguiente a su salida (§10.6); la deuda previa se conserva |
| Pago mayor a la deuda | Genera crédito a favor, aplicado a la siguiente cuota |
| Convenio de pago | La deuda en convenio sale del aging corriente a un tramo "Cartera en convenio" conservando su antigüedad; si se incumple, regresa con su antigüedad acumulada |
| Ciclo académico vs año | Matrícula, cuotas y becas siguen el `ciclo_academico`; el perfil de pago usa ventana móvil de 12 meses; meses de receso no cuentan |
| Cierre de periodo | Al cerrar un mes se guarda una **foto inmutable** de los totales; los reportes de meses cerrados salen de esa foto |
| Nunca suspender | Ninguna función financiera suspende la participación de un alumno de forma automática |
| Protección de datos | Ley 172-13: minimización en exportaciones, registro de accesos a fichas sensibles, consentimiento del canal de mensajería |
| Uso en móvil | El cobro ocurre en el pasillo: todo el flujo de registro de pago funciona en el teléfono |

### 17.9 Presupuesto mensual ⚪ (D3 — dentro del alcance; D15 pendiente de validación)

Responde tres preguntas: **¿cuánto deberíamos recibir, cuánto recibimos, y qué gastamos para operar lo que cobramos?**

```
presupuesto_mensual
  nucleo_id, periodo, linea, tipo (ingreso | egreso_operativo), monto_presupuestado, notas
```

- **Ingresos esperados (se calculan solos):** cuotas emitidas − becas + inscripciones previstas + ventas estimadas de tiendita + cargos de lutería.
- **Ingresos reales:** pagos aplicados del periodo.
- **Egresos operativos del ámbito familiar:** compras de inventario de la tiendita, insumos de lutería cobrables, uniformes. **No incluye** nómina ni gastos generales.
- Vista: presupuestado vs real por línea, % de recaudo, proyección al cierre del mes según la ventana habitual de pago de cada familia (§17.7), alerta Hermes·FIN si el recaudo proyectado queda bajo un umbral configurable.

**D15:** confirmar con Omar/DIR que esta interpretación de "presupuesto mensual" coincide con lo esperado.

## 18. LUTERÍA, INVENTARIO Y TIENDITA (LOG / LUT) (v1.1 §76–83)

### 18.1 Lo que existe

| Capacidad | Estado |
|---|---|
| Inventario de instrumentos | 🟡 324 (`inventario_activos`); informe 2025: 219 al cierre — 🔍 conciliar |
| Asignación de instrumentos a alumnos (comodato) | 🟡 🔍 (`comodatos_activos`; 88 alumnos con instrumento a cierre 2025) |
| Órdenes de reparación | 🟡 1 registrada; tablas + mocks creados (`src/modules/luteria-taller/`, OPR-P10) |
| Catálogo de servicios de reparación en DOP | ✅ en hoja de cálculo, fuera del SOI |
| Sistema de inventario/ventas de accesorios (React+Firebase) | ❌ **No se construyó (D6).** La tiendita se construye directamente en el SOI (§18.5) |
| Accesorios | `inventario_accesorios`, `inventario_historial` |

**Feedback:** tres fuentes de verdad para instrumentos (SOI, informe anual, hoja de reparaciones). Primer paso: **conteo físico conciliado** y fijar el SOI como única fuente (Fase 0.7). Como el sistema React+Firebase **no se construyó, no hay migración**: la tiendita nace en el mismo Supabase, con el mismo `personas` y la misma cuenta de familia. Su spec de dic-2025 sirve como referencia funcional.

### 18.2 Ciclo de vida del instrumento

```
EN_INVENTARIO → ASIGNADO (comodato) → DEVUELTO
       ↓              ↓
  EN_REPARACIÓN ← DAÑO_REPORTADO
       ↓
  REPARADO → EN_INVENTARIO
       ↓
  BAJA (irreparable | pérdida | donado a otra institución)
```

```
instrumentos  (real: inventario_activos)
  id, nucleo_id, codigo_inventario, tipo,
  familia (cuerdas | maderas | metales | percusion | teclado),
  tamaño (4/4, 3/4, 1/2…), marca, serie, origen (compra | donacion), donante_org_id,
  valor_estimado, estado_fisico (1–5), estado_ciclo, ubicacion, foto_url

comodatos  (real: comodatos_activos)
  id, instrumento_id, alumno_id, representante_id, desde, hasta, contrato_url,
  firmado bool, estado, condicion_entrega, condicion_devolucion

ordenes_luteria  (real: ordenes_lutieria + repair_quotes)
  id, instrumento_id, reportado_por, origen (solicitud_maestro | inventario | familia),
  diagnostico, servicios[] (del catálogo), costo_estimado, requiere_autorizacion,
  autorizado_por, taller (interno | externo),
  estado (reportada | evaluada | autorizada | en_proceso | lista | entregada | cancelada),
  responsable_pago (institucion | familia), cargo_id (si familia), fechas, correlation_id

repair_quotes  (v1.1 §77)
  repair_order_id, amount, currency, description, valid_until,
  status (draft | sent | waiting_approval | approved | rejected | expired), guardian_approval_at
```

### 18.3 Lutería ↔ Finanzas (workflow interdepartamental, v1.1 §76)

```
Instrumento dañado → LUTERÍA diagnóstico → presupuesto → ADMINISTRACIÓN contacta representante
→ esperando aprobación → representante OK → LUTERÍA reparación → FINANZAS cargo → cuenta familiar
```

- Si `responsable_pago = familia`, al cerrar la orden se crea automáticamente un `cargo` con el precio del catálogo.
- Si es institución, se registra como gasto **exportable** (fuera del SOI, §17.1).
- Catálogo de servicios pasa de la hoja de cálculo a `catalogo_servicios` (DOP, tasa de referencia configurable).
- Todo comparte `correlation_id`. El sistema **bloquea el cierre del caso** hasta que Lutería suba el reporte del diagnóstico técnico.

### 18.4 Autorizaciones de gasto — RESUELTO (D5)

El umbral de autorización es **opcional y lo configura la propia Dirección**:

```
configuracion.autorizacion_gasto = {
  activo: false,
  niveles: [ { hasta: <monto>, aprueba_rol: '...' }, { hasta: null, aprueba_rol: 'DIR' } ]
}
```

- **Apagado:** las órdenes de lutería y compras de tiendita se registran sin paso de aprobación (quedan en `audit_log`).
- **Encendido:** cada orden cuyo costo supere un nivel espera la aprobación del rol correspondiente, con SLA del catálogo de solicitudes (§9.3).
- Los aprobadores se definen **por rol**, nunca por nombre de persona.

### 18.5 Tiendita / Procurement Catalog (v1.1 §79–83)

**No es comercio electrónico.** Es un **catálogo institucional de reposición y compras**, compartido por Finanzas, Lutería e Inventario.

```
productos
  id, nucleo_id, sku, nombre, categoria (cuerdas | cañas | aceites | resina | otro),
  stock, stock_minimo, precio, imagen_url, vendor, url_producto

movimientos_stock
  producto_id, tipo (entrada | venta | ajuste | uso_taller), cantidad, referencia

ventas
  id, cuenta_id | contado, items jsonb, total, metodo, registrado_por

purchase_requests  (v1.1 §82)
  id, product_id, quantity, department, reason, priority, requested_by, status, approved_by, created_at
```

- **URL Product Import (v1.1 §81):** el usuario pega una URL; el extractor obtiene OpenGraph image, nombre, marca, precio, moneda, descripción, especificaciones, vendor. Respeta las condiciones del proveedor (metadata pública / API), evita scraping prohibido.
- Venta a crédito → `cargo` en la cuenta de familia (`Stock -` → `Family charge`). Compra → `InventoryReceipt` → `Stock +`.
- Stock bajo mínimo → evento Hermes a LOG (enum real `notif_tipo` incluye `stock_bajo`, `accesorio_asignado`, `comodato_riesgo`).
- Uso de insumos en reparación descuenta stock.

### 18.6 KPIs (Master Book, ahora calculables)

Instrumentos en buen estado ≥ 90% · tiempo promedio de reparación < 15 días · alumnos con instrumento ≥ 45% · exactitud de inventario ≥ 99% · evaluación técnica de daños ≤ 48 h.

## 19. COMUNICACIONES OMNICANAL (v1.1 §16–19)

### 19.1 Lo que existe — WhatsApp institucional

| Pieza | Estado |
|---|---|
| Runner Baileys con sesión persistente y reconexión | ✅ F3 |
| Cola `hermes_whatsapp_queue` (estado, jid, mensaje, departamento, origen, fechas) | ✅ |
| Rate-limit: jitter 8–20 s, tope diario con calentamiento (`fn_whatsapp_cap_hoy`), horas de silencio | ✅ |
| Columnas `alumno_id` y `nucleo_id` en la cola | 🟡 aprobado |
| Inbound (`messages.upsert` → endpoint nuevo → match teléfono→alumno) | 🟡 aprobado para v1, **sin LLM ni autorespuesta** |
| Shell Electron por PC de departamento (F4) | 🔵 |
| Encolado manual `fn_whatsapp_encolar_manual` (F5) | 🔵 |
| Bandeja completa (F7) | 🔵 |
| Pipeline Evolution API + LLM | ❌ a retirar |

### 19.2 Corrección a v1.1 §17 (arquitectura WhatsApp)

v1.1 dice "Approved Provider/API". **La decisión real es una librería no oficial (Baileys) sobre un número institucional dedicado**; la cuenta Meta Business quedó en pausa. Consecuencias:

- **No hay "plantillas aprobadas por Meta"**; las plantillas son internas del SOI.
- **Riesgo de bloqueo del número** ante patrones masivos. Las campañas masivas por WhatsApp (§19.4) **no pueden usar este canal sin límites estrictos**.
- **Plan B documentado:** si el volumen/riesgo crece, migrar a la API oficial. La capa `Communication Service` usa **patrón adaptador**: cambiar de proveedor sin tocar el resto.

### 19.3 Modelo omnicanal

`mensajes` **extiende** la cola actual (sin reemplazarla). Enums reales: `notif_tipo`, `notif_canal` (whatsapp | portal | ambos), `notif_prioridad`, `notif_estado_wa`, `notif_estado_portal`, `mensaje_tipo`.

```
mensajes
  id, nucleo_id, departamento, canal (whatsapp | email | sms | push | interno),
  direccion (saliente | entrante), persona_id, alumno_id, organizacion_id,
  hilo_id, plantilla_id, contenido,
  estado (pendiente | procesando | enviado | entregado | leido | fallido | recibido | revisado),
  escalamiento_id, campaña_id, aprobado_por, created_at, procesado_at

consentimientos
  persona_id, canal, finalidad (academica | cobranza | difusion | fotos),
  otorgado bool, fecha, fuente, revocado_at
```

**Opt-out:** si un representante escribe "BAJA" o equivalente → revocación de `difusion`, notificación a un humano; **nunca** afecta mensajes académicos esenciales sin revisión.

### 19.4 Campaign Composer (v1.1 §18)

```
Crear campaña → Seleccionar audiencia → Crear contenido → Seleccionar canales →
Preview → Aprobación → Programar → Enviar/publicar → Resultados
```

Canales: WhatsApp, Instagram, Facebook, Email, Portal público, Pantallas institucionales.

Reglas añadidas:
- Audiencias por segmento (programa, clase, nivel, familias con saldo, prospectos). "Familias con saldo" **solo lo usa FIN**.
- **Por WhatsApp (Baileys):** tope por campaña = tope diario del gateway; envío escalonado en días; **solo** a personas con consentimiento `difusion`; mensajes personalizados (nombre), **nunca idénticos en ráfaga**.
- Instagram/Facebook: **publicación manual asistida** (SOI prepara textos e imágenes; publica un humano) hasta tener integración oficial.
- Portal público y pantallas: canal directo del SOI (§24).
- Resultados: enviados, entregados, leídos, respuestas.

### 19.5 Creative Studio — generador de flyers (v1.1 §19) ⚪

```
EVENTO SOI → datos oficiales → Hermes → Creative Brief → Prompt profesional →
modelo generativo de imagen → Flyer → revisión humana → publicación
```

El prompt incluye automáticamente: nombre del evento, fecha, hora, lugar, branding, logos, programa, tipo de público, proporción de imagen, canal.

Variantes: Instagram Post / Story · Facebook · WhatsApp · Pantalla 16:9 (1280×720) · Impresión.

Precisiones:
- **Identidad visual:** azul marino profundo + dorado/ámbar sobrio, tono filarmónico elegante (ya definida para la señalética). Nombre oficial siempre **"El Sistema Punta Cana"**.
- **No se generan rostros de niños con IA** ni se alteran fotos reales de alumnos. Fotos = reales, de alumnos con consentimiento `fotos` vigente.
- Los datos salen del evento en el SOI; si el evento cambia, el flyer queda marcado **"desactualizado"**.

## 20. CRM INSTITUCIONAL (v1.1 §9–15)

### 20.1 Estado

⚪ Nuevo como sistema, pero **ya hay relaciones reales** que son el primer contenido: intercambios con 10 países en 2025 (Bélgica, Chile, Colombia, Costa Rica, Cuba, Francia, España, EE. UU., Portugal…), donantes de los 46 instrumentos donados en 2025, el Centro Educativo en Artes Matías Ramón Mella y MINERD (taller de lutería), la gestión en curso con **D'Addario Foundation**.

### 20.2 Entidades

```
organizaciones_externas  (external_organizations)
  id, nombre, tipo_organizacion, pais, website, mision, descripcion,
  focus_areas jsonb, social_links jsonb, relationship_status, created_at, updated_at

contactos  (contacts) — contacto = persona
  id, persona_id (→ personas), organizacion_externa_id, job_title, departamento,
  phone, email, whatsapp, instagram, linkedin,
  relationship_strength (1–5: 1 contacto frío … 5 aliado activo con acuerdo vigente),
  responsable_relacion_id (persona interna, "relationship owner"), notes
  -- D14 — RESUELTO: en el ejemplo de v1.1, Kalani es la RESPONSABLE INTERNA de la relación
  --   con D'Addario Foundation, no la contraparte externa. Vista correcta:
  --   "D'Addario Foundation → contacto externo: [persona de la fundación] · responsable interna: Kalani"

hilos  (conversation_threads)
  id, subject, organizacion_externa_id, contacto_id, oportunidad_id,
  status, owner_id, last_activity_at
  -- dentro: emails, WhatsApp, notas, reuniones, llamadas, propuestas, documentos, acuerdos, tareas

propuestas  (proposals)
  id, organizacion_id, oportunidad_id, titulo, version,
  status (idea | draft | internal_review | ready | submitted | follow_up | accepted | rejected | archived),
  estimated_value, submitted_at, response_due_at, owner_id, document_url

acuerdos  (agreements)
  id, organizacion_externa_id, titulo, tipo, start_date, end_date, status,
  responsible_user, documents jsonb

compromisos  (v1.1 §14 — como filas, no jsonb, para generar tareas y vencimientos)
  id, acuerdo_id, parte (nosotros | ellos), descripcion, vence_at, responsable_id, estado, evidencia_url
```

### 20.3 Grafo de relaciones (v1.1 §11) — modelo futuro (P2)

Implementación inicial: tabla de aristas en Postgres, sin motor de grafos.

```
relaciones
  origen_tipo, origen_id,
  tipo (conoce | trabaja_en | apoya | presentado_por | financia),
  destino_tipo, destino_id, desde, fuente, confianza
```

Ejemplo: `Persona ─knows→ Persona · Persona ─works_at→ Organization · Organization ─supports→ Program · Contact ─introduced_by→ Contact`.

### 20.4 Follow-up externo (v1.1 §15)

Política `seguimiento_externo` del motor §8. Por defecto: 7 días sin respuesta → Hermes sugiere → prepara borrador → humano aprueba. **Máximo 2 seguimientos sin respuesta** antes de marcar "en pausa" (regla anti-acoso). **No debe acosar contactos automáticamente.**

### 20.5 Portal Comunicaciones — cinco áreas

Conversaciones · Contactos · Campañas · Relaciones · Solicitudes internas.

## 21. INTELIGENCIA INSTITUCIONAL — RADAR (v1.1 §4–8) ⚪

### 21.1 Posición en el roadmap

El módulo más atractivo y el de menor urgencia operativa. Se construye en **Fase 3**, después de que CRM y motor de seguimiento funcionen. Una oportunidad detectada sin CRM ni seguimiento es otro evento sin acción.

### 21.2 MVP antes del radar automático

- **Paso 1 (manual, Fase 2):** registro de oportunidades y fechas límite en el CRM, con scoring por formulario. Ya genera valor (no perder convocatorias) sin rastreo web.
- **Paso 2 (Fase 3):** radar automatizado.

### 21.3 Qué investiga

Fundaciones, ONG, empresas, embajadas, institutos culturales, organizaciones musicales, universidades, festivales, programas juveniles, programas de cooperación, fabricantes de instrumentos, convocatorias, becas, concursos, grants, patrocinios, RSE/ESG, programas educativos.

### 21.4 Pipeline

```
BÚSQUEDA WEB → DESCUBRIMIENTO → EXTRACCIÓN → CLASIFICACIÓN → DEDUPLICACIÓN
→ MATCH CON FUNEYCA → SCORING → OPORTUNIDAD → SEGUIMIENTO
```

| Etapa | Definición |
|---|---|
| Búsqueda | Consultas programadas por fuente de `watchlist` y palabras clave configurables (educación musical, orquestas juveniles, El Sistema, instrumentos, Caribe, República Dominicana, cooperación cultural). Frecuencia: semanal por defecto |
| Descubrimiento | URLs nuevas o páginas de la watchlist con cambios (hash de contenido) |
| Extracción | IA extrae: organización, tipo, título, elegibilidad, beneficio, monto, fecha límite, URL |
| Clasificación | Tipo según lista de v1.1 |
| Deduplicación | Misma organización + título similar + misma fecha límite |
| Match | Contra el perfil institucional (§21.6) |
| Scoring | §21.7 |
| Oportunidad | Estado `detectada` → requiere **validación humana** para pasar a `en_evaluacion` (P9) |
| Seguimiento | Tareas, responsable, fecha límite, propuesta |

### 21.5 Modelo de datos

```
external_organizations  -- §20.2

opportunities  (oportunidades)
  id, external_organization_id, type, title, description, source_url,
  eligibility, benefits, deadline, estimated_value, currency, fit_score,
  status (detectada | en_evaluacion | preparando | enviada | seguimiento | ganada | perdida | descartada),
  owner_id, next_action_at, created_at
  -- type: grant | sponsorship | partnership | donation | festival | scholarship | training
  --       | instrument_donation | exchange | competition | technical_cooperation

watchlist  (v1.1 §7)
  organizacion_id, agregada_por, revisar_cada (dias), ultimo_hash, ultima_revision
  -- revisa: cambios en convocatoria, nuevos programas, nuevas fechas, nuevos grants, anuncios, actividades
```

### 21.6 Perfil institucional (fuente del match)

Tabla `perfil_institucional` por núcleo: misión, programas, población atendida, edades, país, estatus legal (FUNEYCA-PC como entidad sin fines de lucro), documentos disponibles (estatutos, RNC, estados financieros, memorias), **métricas de impacto actualizadas desde el SOI** (alumnos, asistencia, instrumentos, conciertos). Ventaja única: las postulaciones llevan cifras reales y actualizadas.

### 21.7 Scoring (v1.1 §8) — nunca exclusivamente IA; reglas + IA

Cada criterio se puntúa 0–5 con definición, por reglas cuando es posible y por IA solo donde no.

| Criterio | Peso | Cómo se calcula |
|---|---|---|
| Mission fit | 20% | IA con justificación **citando el texto** de la convocatoria |
| Program fit | 20% | Coincidencia de etiquetas (programas, instrumentos, edades) — regla |
| Geografía | 10% | País/región elegible — regla |
| Elegibilidad | 15% | Checklist de requisitos vs documentos disponibles — regla + revisión |
| Potencial de financiamiento | 10% | Monto vs umbral configurable — regla |
| Relación existente | 10% | `relationship_strength` del CRM — regla |
| Viabilidad de plazo | 10% | Días hasta fecha límite vs esfuerzo estimado del tipo — regla |
| Valor estratégico | 5% | Humano |

Resultado: `Opportunity Fit: 87/100`. **Hermes muestra el desglose y explica el resultado.** Una oportunidad con Elegibilidad = 0 **no** se muestra como recomendada, sin importar el total.

### 21.8 Control de costos

Límite mensual de consultas/tokens configurable; el radar se **pausa** al alcanzarlo y lo notifica.

## 22. EVENTOS Y AGENDA INSTITUCIONAL (v1.1 §20)

### 22.1 Estado

🔵 El Master Book tiene un módulo de Eventos y Conciertos (recepción de solicitudes, visitas de inspección, negociación técnica y económica, logística, masterclasses). 🔍 Confirmar si existe algo en el SOI digital o es un portal-cascarón. Enum real `event_categoria`: `concierto | ensayo | reunion | patrocinio | pago | corte | inscripcion | auditoria | otro | aniversario | audicion_trimestral | ensayo_intensivo`.

### 22.2 Definición

```
eventos
  id, nucleo_id,
  tipo (concierto | ensayo | reunion | visita | festival | representacion | fecha_limite
        | cita_inscripcion | masterclass | audicion),
  titulo, inicio, fin, lugar, organizacion_externa_id, responsable_id,
  estado (solicitado | evaluando | confirmado | realizado | cancelado),
  requisitos_tecnicos, aporte_economico,
  participantes (clases/filas/personas), repertorio[] (obras), transporte, checklist jsonb
```

Agenda inteligente cubre: conciertos, reuniones, actividades, representación institucional, visitas, ensayos, festivales, fechas límite, propuestas, reuniones con patrocinadores.

Hermes detecta: conflictos con sesiones y ensayos, participantes con conflicto, **preparación insuficiente** (repertorio del concierto con progreso < umbral a N días), documentos pendientes, falta de representante institucional, viajes.

Un **concierto confirmado** genera automáticamente: sesiones de ensayo tipo `ensayo`, borrador de flyer (§19.5), publicación en pantallas (§24).

## 23. PORTAL DE DIRECCIÓN Y REPORTES (v1.1 §108)

### 23.1 Estado

🟡 Visión global de asistencias; reportes semanales y del Challenge OSIJ-PC manuales; Report Blueprint V8 🔍. `src/modules/hermes/views/dirDecisionCenterView.js` (DIR-P05, propuesta).

### 23.2 Command Center de Dirección

```
SOI · 10 SEP 2026
INSTITUCIÓN   163 alumnos activos · 7 sin clase · 11 seguimientos · 4 maestros pendientes
PEDAGOGÍA     82% planificación al día · 84% asistencia · 13 alumnos con deuda pedagógica
FINANZAS      18 familias pendientes · 92% recaudación
ACTIVOS       7 reparaciones · 3 esperando aprobación · 2 stocks críticos
REPERTORIO    Beethoven 5  64% · Navidad Coral  81%
RELACIONES    4 propuestas activas · 7 organizaciones en seguimiento
OPORTUNIDADES 3 nuevas detectadas · 1 urgente
EVENTOS       Concierto Navidad · 68% preparación
─────────────────────
HERMES · 5 asuntos requieren atención.
```

Además: casos críticos abiertos, decisiones sensibles pendientes de aprobación, salud de Hermes (§6.6), oportunidades con fecha límite ≤ 30 días, estado de los recorridos (§29).

### 23.3 Catálogo de reportes (automáticos)

| Reporte | Periodicidad | Destino | Fuente |
|---|---|---|---|
| Reporte semanal del maestro | Lunes | ACM | Sesiones, asistencia, contenidos, evaluaciones |
| Reporte académico semanal | Martes | DIR | Agregado ACM |
| Asistencia y deserción | Mensual | DIR, junta | ACM + bajas |
| Progreso pedagógico por cátedra/nivel | Semestral | ACM, DIR | Pedagogía |
| Finanzas familiares | Mensual | DIR, FIN | FIN |
| Inventario y lutería | Mensual | DIR, LOG | LOG |
| Memoria anual / impacto | Anual | Junta, aliados, postulaciones | Todo |

La **memoria anual** (como la de 2025: instrumentos 170→219, alumnos con instrumento 71→88, piano 17 alumnos/440 clases, intercambios con 10 países) sale del SOI **con un clic**. Es también la materia prima del radar (§21.6).

Formatos de exportación según permisos (v1.1 §94): CSV, XLSX, JSON, SQL, Markdown, PDF. **SQL completo solo para administradores con privilegios apropiados.**

### 23.4 KPIs institucionales consolidados

Asistencia orquestal ≥ 85% · casos críticos de asistencia < 5 por ciclo · rúbrica técnica semestral ≥ 4,0/5 · 100% de asientos cubiertos al cierre de semestre · 100% de maestros registrando · ≥ 90% con ruta de contenidos · asistencia docente ≥ 95% · respuesta a solicitudes < 48 h · instrumentos en buen estado ≥ 90% · exactitud de inventario ≥ 99%.

## 24. PORTAL PÚBLICO Y PANTALLAS (v1.1 §88–92)

### 24.1 Lo que existe — señalética del vestíbulo

SPA kiosk en Raspberry Pi Zero 2 W (Chromium kiosk), TV 32" 1280×720, sin interacción, 24/7 con modo nocturno. Panel multimedia 70% + columna 30% "Hoy/Mañana" (hasta 10 clases/día, clase actual resaltada, pasadas atenuadas, emergentes marcadas con punto de anillo). Identidad navy/dorado, tema oscuro + variante clara. (`docs/SIGNAGE_CARTELERA.md`.)

### 24.2 Reglas

1. Consume un **endpoint de solo lectura** del SOI con datos ya filtrados (nunca credenciales con acceso a tablas de alumnos en un dispositivo expuesto en el vestíbulo).
2. Caché local para operar sin conexión.
3. Contenido multimedia = campañas aprobadas (§19.4) con canal "pantalla".

```
public_playlists · public_slides · public_screen_assignments
```

Permite que Recepción, Salón Principal y Segundo Núcleo usen contenido diferente. Loop automático.

### 24.3 Reglas de contenido público

**Nunca:** nombres de alumnos con ausencias, saldos, casos, datos médicos, teléfonos, asistencia individual, información interna.
**Sí:** horarios de clases (sin lista de alumnos), eventos, logros colectivos, fotos con consentimiento, avisos institucionales.

### 24.4 Portal web público ⚪

Programas, calendario de conciertos, **formulario de interés** (entra al funnel §16 como `INTERESADO`), página de aliados (desde CRM, solo los que autorizan aparecer), transparencia (memoria anual). Completamente **read-only**. Ruta `/public` o dominio independiente.

### 24.5 Publicación en un clic (v1.1 §92)

Un usuario autorizado convierte: `Evento → anuncio público → flyer → pantalla → redes` **sin volver a introducir la información**.

## 25. PROTECCIÓN Y BIENESTAR ⚪ (añadido desde la visión SOI-Digital; obligatorio con menores)

### 25.1 Marco legal de referencia (República Dominicana)

- **Ley 136-03** (Código para la protección de los derechos de NNA): art. 14 obliga a toda persona que conozca o sospeche un abuso a denunciarlo, sin responsabilidad penal/civil por hacerlo. Denuncias: Ministerio Público; canales públicos: 9-1-1, Línea Vida (809-200-1202), Procuraduría Fiscal de NNA (809-596-4951). Fuente: conani.gob.do.
- **CONANI** es el órgano rector y lidera una actualización integral de la Ley 136-03: la política interna debe revisarse cuando esa reforma se apruebe.
- **Ley 172-13** de protección de datos personales (aplica a los registros de este dominio).

*No sustituye asesoría legal: la política final debe revisarla un profesional del derecho antes de aprobarse.*

### 25.2 Responsable designado — respuesta a D11 / D17

**Hoy no existe.** El SOI no puede nombrarlo; lo designa **DIR** (tarea inmediata, no espera ninguna fase). Estructura recomendada (*safeguarding*):

| Rol | Quién (recomendado) | Por qué |
|---|---|---|
| **Responsable institucional** (rinde cuentas) | Dirección Ejecutiva | La obligación legal y reputacional es de la institución |
| **Responsable Designado de Protección (RDP)** | Persona de Administración/Coordinación **presente en horario de clases**, que **no sea maestro directo** de la mayoría de los alumnos, con formación básica en protección | Debe recibir un reporte el mismo día, sin conflicto de interés con los maestros reportados |
| **Suplente del RDP** | Persona de otra área | Nadie debe quedar sin a quién reportar |
| **Asesoría técnica** | Psicólogo/a o trabajador/a social: voluntario, miembro de junta con ese perfil, convenio con universidad (prácticas) o con el centro educativo aliado | La institución no tiene este perfil en plantilla |
| **Contraparte externa** | Oficina regional de CONANI / Procuraduría de NNA | Para casos que superan a la institución |

**Por qué no Omar como RDP:** combina coordinador de cátedra + maestro directo + miembro de junta + desarrollador del sistema que guarda los registros. Concentrar además la recepción de denuncias crea conflicto de interés y punto único de falla.

### 25.3 Funcionalidad en el SOI

- Registro de **incidentes** (enum real `problemas_conducta`, `impedimento_social`): tipo, descripción **factual**, personas involucradas, reportado por, acciones, derivación externa, seguimiento. Acceso: **RDP, suplente y Dirección Ejecutiva; nadie más, incluido el desarrollador en producción.**
- **Canal de reporte** accesible a maestros, monitores y familias (formulario + opción en el menú humano, **nunca en el bot automático**).
- Protocolos configurables (a quién se notifica y en qué plazo), con registro de cumplimiento.
- **Nada de este dominio alimenta reglas automáticas, scoring ni Estado 360.** (P12)
- Autorizaciones de recogida del alumno y contactos de emergencia (vinculado a §16.4).
- Política de fotos y difusión (consentimiento `fotos`).
- **Código de conducta de monitores** (ya en la guía de monitores: no intercambiar números personales con alumnos menores, no agregarlos a redes, no reunirse fuera del horario) → **aceptación firmada y registrada** en el SOI.
- **Puede adelantarse** si DIR lo prioriza; no depende técnicamente de otras fases. La **designación del RDP no espera ninguna fase**.

## 26. REPLICABILIDAD Y NÚCLEOS ⚪ (añadido desde la visión)

- `nucleo_id` en todo (P3). Usuarios con acceso a uno o varios núcleos; DIR central con vista consolidada.
- **Kit de alta de núcleo:** configuración inicial (programas, niveles, rúbricas, calendario, políticas de escalamiento, plantillas), importadores de alumnos/instrumentos, y **los manuales de cada recorrido** (P10).
- Catálogos compartidos entre núcleos (indicadores, obras) con variantes locales.
### 26.1 Gobernanza y licencia — respuesta a D12 / D18

**Estado:** existe un **borrador de propuesta de gobernanza y uso de software** (9 sep 2026, tras reunión con Dirección Ejecutiva). Según lo registrado, **no ha sido revisado legalmente, presentado formalmente ni firmado**. 🔍 D18: confirmar si ya se presentó y cuándo se firma.

| Punto | Propuesta del borrador |
|---|---|
| Propiedad intelectual | Código, arquitectura y diseño técnico son del autor |
| Licencia | Uso institucional **permanente** para El Sistema PC / FUNEYCA-PC; **no exclusiva** (el autor puede ofrecerlo a otros núcleos/instituciones; la institución no puede revenderlo ni cederlo) |
| Datos | **100% propiedad de la institución, siempre**; exportación completa garantizada (CSV/SQL) sin depender del autor |
| Salida del autor | La institución conserva el uso de la versión existente; transición de 60–90 días con compensación |
| Infraestructura | Hosting, APIs y servicios de terceros los paga la institución |
| Compensación | Separada del salario docente: estipendio mensual de mantenimiento o pago por hito |
| Alcance | Tabla de módulos incluidos; **ViolinPath queda fuera** como herramienta personal |

**Ajustes necesarios tras esta unificación:** (1) actualizar la tabla de alcance — Finanzas **sin nómina** (D3); añadir WhatsApp gateway, Hermes, audiciones con interruptor, tiendita. (2) Resolver la frontera ViolinPath ↔ catálogo institucional (§13.1 / D16). (3) Añadir cláusula de **replicabilidad**: quién decide y cómo se comparte el beneficio si otro núcleo/institución adopta el SOI. (4) Revisión por un abogado antes de firmar.

**Regla de roadmap derivada:** la estrategia acordada fue *terminar primero lo que ya funciona y congelar lo que solo existe en papel hasta su aprobación formal*. Por eso: **Fase 0 y Fase 1 avanzan** (cierran módulos existentes); **Fase 2 y Fase 3 (módulos nuevos) comienzan después de firmar la gobernanza.** Abrir un segundo núcleo sin este acuerdo multiplicaría el problema de "SOI es una extensión de Omar".

---

# PARTE VI — SEGURIDAD, PRIVACIDAD Y AUDITORÍA (v1.1 §93–97, §106–107)

## 27. ROLES Y PERMISOS

Roles base: DIR · ADM · ACM (coordinación) · FIN · LOG · LUT · COM · TECNICO · Maestro · Monitor · Representante (futuro portal familias) · Invitado/solo lectura. Permisos por rol + concesiones puntuales (§10.4). RLS real por `get_user_department()`.

## 28. DECISIONES SENSIBLES (consolidado)

Acciones que **siempre** requieren revisión humana + justificación + registro + responsable + auditoría:
retirar alumno · retirar beca · retener instrumento · suspender · cambio de nivel por consolidación · baja administrativa · bloqueo de canal · bloqueo de certificado/evento · envío masivo · aprobación de gasto sobre umbral · fusión de duplicados · aceptar acuerdo externo · enviar propuesta.

## 29. DOS SISTEMAS DE AUDITORÍA SEPARADOS

### 29.1 Business Audit Log (`audit_log`) — prácticamente inmutable

Registra: **quién · qué hizo · sobre qué · antes · después · cuándo · por qué**.
Para: decisiones sensibles, cambios de datos sensibles, fusiones de duplicados, bajas, aprobaciones de gasto, envíos masivos, cambios de configuración. Real parcial: `ausencias_auditoria`.

### 29.2 Technical Observability

Registra: API calls, database timing, external services, AI tools, errors, traces, performance. **Separado** del audit de negocio (evita convertir cada SELECT interno en millones de registros de auditoría empresarial). Reales: `notification_trigger_logs`, `schedule_runs`.

### 29.3 AI Audit → §6.7 (`ai_runs`, `ai_tool_calls`).

## 30. PRIVACIDAD Y DATOS SENSIBLES

SOI maneja: menores, salud, situación familiar, información económica, comunicaciones, evaluaciones educativas.

Deben formar parte de la arquitectura **desde el inicio**: least privilege · field-level restrictions · RLS · audit · consent · encryption · data retention · purpose limitation.

- **No mezclar perfiles:** información médica, situación económica, conducta financiera y rendimiento académico **no se mezclan** automáticamente para crear una puntuación oculta.
- **Retención:** datos médicos y socioeconómicos se revisan al egreso del alumno (plazo configurable); prospectos no inscritos se anonimizan tras N meses.
- **Dispositivos compartidos** (PC de departamento con el runner WhatsApp, Raspberry del vestíbulo): credenciales de servicio con mínimo privilegio.
- Toda salida de IA que toque datos de personas: registro de qué datos se enviaron al modelo y para qué.

## 31. BACKUP Y PORTABILIDAD (v1.1 §93–95)

Estrategia formal en 6 capas: (1) Database backups · (2) Storage backups · (3) Migration history · (4) Configuration backup · (5) Document backup · (6) Disaster recovery.

**Portable Institutional Backup:**

```
SOI Backup Package
├── database.sql
├── exports/ (students.csv, attendance.csv, …)
├── files/
├── schema/
├── configuration/
└── manifest.json
```

---

# PARTE VII — MODELO DE DATOS CONSOLIDADO

Nombre **conceptual** (`nombre real hoy` cuando existe). Todas las tablas nuevas: `id uuid`, `nucleo_id`, `created_at`, `updated_at`, `created_by`, RLS explícita, comentario SQL con dueño + recorrido.

### Kernel (§5.3)
`nucleos` · `personas` · `familias` (`familias`) · `hermes_reglas` · `hermes_eventos` · `resultados_accion` ⚪ · `tareas` (`maestro_tareas`) · `casos` (`student_cases`) · `solicitudes_departamento` (`solicitudes_ausencia`) · `politicas_escalamiento` (`seguimiento_reglas`) · `escalamientos` ⚪ · `mensajes` (`hermes_whatsapp_queue`) · `consentimientos` ⚪ · `configuracion` (`system_config`, `catalogos`) · `audit_log` (`ausencias_auditoria`) · `ai_runs` ⚪ · `ai_tool_calls` ⚪

### Académico
`programas` · `catedras` · `niveles` · `clases` · `clase_alumnos` (`alumnos_clases`) · `sesiones_clase` · `clase_horarios` · `salones` · `permisos_maestros` · `clase_acceso_temporal` · `justificaciones_asistencia` (`justificaciones`) · `asistencias` · `student_exits` (`historial_estado_alumno`) · `conflict_engine` (lógica) · `schedule_agreements` ⚪

### Pedagogía
`indicadores` (`indicators`) · `indicador_dependencias` ⚪ · `unidades` (`unidades`) · `objetivos` (`plan_objetivos`) · `planes` (`academic_plans`) · `plan_indicadores` · `evaluacion_indicador` (`indicator_attempts`) · `sesion_indicadores` (`indicator_sessions`, `indicator_session_students`) · `deuda_pedagogica` (derivada) · `perfil_musical_360` (derivada) · `actas_promocion` ⚪ · `import_planificacion` (`document_batches`, `generated_documents`)

### Repertorio
`obras` ⚪ · `obra_compases` ⚪ · `obra_secciones` ⚪ · `programacion_repertorio` ⚪ · `progreso_compas` (`repertoire_fragments`)

### Maestros
`perfil_publico_maestro` ⚪ · `datos_laborales` ⚪ · `maestros` · `asistencia_maestros` · `ausencias_maestros` · `observaciones_alumnos` · `observaciones_sesion`

### Finanzas
`cuentas_familia` · `cargos` · `pagos` (`pagos_alumnos`) · `aplicaciones_pago` · `becas_descuentos` · `convenios_pago` ⚪ · `perfil_comportamiento_pago` ⚪ · `presupuesto_mensual` ⚪ · `cierres_periodo` ⚪ (foto inmutable) · `wallets` (enums `wallet_*`) · `patrocinios` (enums `patrocinio*`) · `cierres_caja`

### Lutería / Inventario
`instrumentos` (`inventario_activos`) · `comodatos` (`comodatos_activos`) · `ordenes_luteria` (`ordenes_lutieria`) · `repair_quotes` ⚪ · `catalogo_servicios` ⚪ · `productos` (`inventario_accesorios`) · `movimientos_stock` (`inventario_historial`) · `ventas` ⚪ · `purchase_requests` ⚪

### Postulaciones / Audiciones
`prospectos` (`postulantes`) · `citas_audicion` (`soi_citas_audicion`) · `respuestas_aprobadas` ⚪ · `alumno_escolaridad` · `modulos_habilitados` ⚪ · `convocatorias_audicion` ⚪ · `candidatos_audicion` ⚪ · `jurados` ⚪ · `calificaciones_audicion` ⚪ · `resultados_audicion` ⚪

### Comunicaciones / CRM
`mensajes` · `consentimientos` · `plantillas` ⚪ · `campañas` ⚪ · `organizaciones_externas` ⚪ · `contactos` ⚪ · `hilos` ⚪ · `propuestas` ⚪ · `acuerdos` ⚪ · `compromisos` ⚪ · `relaciones` ⚪

### Inteligencia
`oportunidades` ⚪ · `watchlist` ⚪ · `perfil_institucional` ⚪ · `radar_consultas` ⚪

### Eventos / Público / Protección / Núcleos
`eventos` ⚪ · `public_playlists` ⚪ · `public_slides` ⚪ · `public_screen_assignments` ⚪ · `incidentes` ⚪ · `protocolos_actuacion` ⚪ · `nucleo_config` ⚪

---

# PARTE VIII — HOJA DE RUTA

## 32. LOS CINCO RECORRIDOS CERRADOS

Un recorrido está **cerrado** cuando: (a) funciona de punta a punta en producción, (b) deja registro de resultado, (c) alguien que no es Omar lo opera con su manual, (d) tiene una métrica que se mueve.

| # | Recorrido | Brecha que cierra | Métrica de cierre |
|---|---|---|---|
| **R1** | Plan → sesión → evaluación de indicador → progreso visible | 4.163 indicadores / 20 evaluaciones | ≥ 60% de sesiones con evaluación |
| **R2** | Ausencia → alerta → contacto → respuesta → resolución | Vista de críticos sin acción | ≥ 70% de alumnos críticos con resultado registrado |
| **R3** | Cuota → recordatorio → pago → saldo al día | 474 cuotas / 2 pagos | ≥ 80% de pagos del mes registrados en el SOI |
| **R4** | Daño → orden de lutería → reparación → cargo o cierre | 324 instrumentos / 1 orden | 100% de reparaciones pasan por orden |
| **R5** | Evento Hermes → tarea → resultado | 1.971 eventos / 0 acciones | ≥ 70% de eventos críticos con resultado |

**D13 — RESUELTO:** la lista literal de los cinco recorridos de la Ruta a Referencia no quedó en las conversaciones recuperables. Solo está confirmado textualmente el recorrido **#2 (ausencia → alerta → contacto → resolución)** y su tarea 1.5 ("registro obligatorio de resultado al cerrar una tarea de seguimiento" → R5). **Se adoptan R1–R5 como definición oficial** (corresponden uno a uno con los cuatro desequilibrios medidos en la auditoría + el recorrido #2). Si el documento original difiere, se actualiza esta tabla, no al revés.

## 33. FASES

### Fase 0 — Higiene y verdad (≈ 4–6 semanas)

*Fase 0 y Fase 1 pueden avanzar sin esperar la gobernanza firmada: cierran módulos que ya existen (§26.1).*

| Tarea | Detalle | Salida |
|---|---|---|
| 0.0 **C1** | Verificar filas en todas las mutaciones, empezando por aprobaciones, finanzas y asistencias | 0 mutaciones sin verificación en `api/` |
| 0.0b **A1** | Regenerar `ARCHITECTURE.md` + `database_schema.sql` desde el código/BD real; marcar spec PWA Firestore como superado donde aplique | Documento verificado por lila |
| 0.0c A6/A7 | Typecheck + lint en CI | CI bloquea regresiones |
| 0.1 | Inventario de las 123 tablas vacías con uso real en código — **marcar el backbone WhatsApp F1–F9 como activo, no huérfano** | Tabla con Decisión y Dueño llenados por Omar |
| 0.2 | Poda controlada: ningún `DROP` sin decisión humana y backup | Tablas vacías ≤ 40, todas con dueño |
| 0.3 | Resolver `acm_*` vs `planificacion` vs `plan_*` vs `routes/*`; deduplicar catálogo de indicadores | Un solo modelo pedagógico |
| 0.4 | Decidir los 8 portales-cascarón (activar / fusionar / retirar) | Menú sin promesas vacías |
| 0.5 | Reconciliar `schema_reference.sql` con diff automático | 100% coincidencia |
| 0.6 | Depuración de clases y alumnos sin clase (§10.5) | 100% de activos con clase o estado explícito |
| 0.7 | Conteo físico y conciliación de instrumentos (§18.1) | Una sola cifra verdadera |

**Regla de la fase:** no se crean tablas nuevas salvo `resultados_accion` y las ya aprobadas del gateway WhatsApp.

### Fase 1 — Cerrar R2, R5 y el núcleo de R1 (≈ 8–10 semanas)

WhatsApp F4–F7 con inbound y bandeja · Motor de escalamiento unificado (`ausencias`, `cumplimiento_docente`) · `resultados_accion` + ciclo de vida de eventos Hermes · Bajas con categoría (D8) · Justificaciones · Evaluación rápida en sesión con modelo pedagógico unificado · Command Center académico · Manuales de operación de R2 y R5.

### Fase 2 — Cerrar R3, R4, completar R1 (≈ 10–12 semanas)

**Condición de entrada:** propuesta de gobernanza **firmada** (§26.1 / D18).

Finanzas familiares con registro de pago sin fricción + política `cobranza` (sin adaptativos) + reglas financieras heredadas (§17.8) · **Presupuesto mensual** (§17.9) · Lutería con órdenes y cargo a familia + tiendita · Solicitudes interdepartamentales generales · Casos y Estado 360 · Planificación completa, prerrequisitos, deuda, promoción, reglas de la Guía como reglas Hermes · Postulaciones con funnel completo (sin bot) · **Módulo de audiciones y jurado con interruptor** (§16.5 — puede adelantarse si hay audiciones programadas) · Registro manual de oportunidades en CRM básico · Reportes automáticos semanales.

### Fase 3 — Proactividad y expansión

CRM completo (propuestas, acuerdos, compromisos) · Radar + watchlist · Campaign Composer + Creative Studio · Bot de Administración y Postulaciones · Perfil de pago + recordatorios adaptativos (≥ 3 meses de datos) · Importador de planificaciones · Perfil 360 musical completo · Repertorio visual · Agenda inteligente · Portal web público · Protección y bienestar (**el módulo puede adelantarse; la designación del RDP no espera ninguna fase — es tarea de DIR ya**) · Replicabilidad: kit de núcleo + gobernanza.

### 33.1 Nota de capacidad

Este alcance, para una sola persona que además sostiene su ingreso con presentaciones musicales, es **bastante más de un año de trabajo**. Fase 0 y Fase 1 producen la **evidencia medible** (R2 y R5) para plantear a la junta que el SOI necesite recursos propios (horas institucionales, un monitor técnico formado, o un aliado que lo financie). Las cifras de §3 antes/después son ese argumento.

---

# PARTE IX — REGISTRO DE DECISIONES

## D1–D14 — RESUELTAS (Omar, 10 sep 2026)

| # | Pregunta | Decisión | Dónde se aplica |
|---|---|---|---|
| D1 | Convención de nombres | ✅ **Español** (`snake_case`, plural, sufijos técnicos permitidos) | §0.3 |
| D2 | Significado de AGT | ✅ **Agentes**: cada departamento tenía su agente → Hermes con un **perfil por departamento** | §7, §6.8 |
| D3 | Contabilidad institucional | ✅ **Fuera del SOI.** Dentro: pagos de representantes, mensualidades, inscripción, tiendita, registro y seguimiento de pagos, **presupuesto mensual** | §17.1, §17.8, §17.9 |
| D4 | Cuotas por alumno en dos programas | ✅ **Una sola cuota** (la cuota es del alumno, no de la clase) | §10.10 |
| D5 | Umbrales de autorización de gasto | ✅ **Opcionales**, configurados por DIR, por **rol** | §18.4 |
| D6 | Inventario React+Firebase | ✅ **No se construyó**; la tiendita nace en el SOI | §18.1, §18.5 |
| D7 | PWA de audiciones | ✅ Proyecto aparte. Se crea **vista de jurado en Portal de Maestros, apagada por defecto** (interruptor por módulo); integración futura | §16.5 |
| D8 | Categorías de baja | ✅ **6 tipos de salida + 13 motivos** definidos | §10.6 |
| D9 | % de obligatorios para promoción | ✅ **Configurable por cátedra y nivel** | §13.7 |
| D10 | Bot | ✅ **Un bot en el número de ADM** para postulaciones y administración (menú de 7 opciones, sin LLM) | §16.3 |
| D11 | Responsable de protección | 🟠 **No existe.** Estructura recomendada; **designa DIR** (inmediato, no espera fase) | §25.2 |
| D12 | Gobernanza/licencia | 🟠 Borrador del 9 sep **sin firmar**; 4 ajustes necesarios; **gate de Fase 2** | §26.1 |
| D13 | Cinco recorridos | ✅ Se adoptan **R1–R5** como oficiales (solo #2 confirmado literalmente) | §32 |
| D14 | Kalani en el CRM | ✅ **Responsable interna** de la relación con D'Addario | §20.2 |

## D15–D19 — ABIERTAS (surgidas de las decisiones). Las marcadas **B** bloquean su fase.

| # | Pregunta | Quién | Bloquea |
|---|---|---|---|
| D15 | ¿La interpretación de "presupuesto mensual" (§17.9) es correcta? | Omar / FIN | Fase 2 |
| D16 | ¿Los indicadores de ViolinPath entran al catálogo institucional? ¿Bajo qué figura (Guía del Maestro / licencia)? | Omar | **B** Fase 0.3 |
| D17 | Designación del RDP y suplente + capacitación básica | DIR | Protección (inmediato) |
| D18 | ¿La propuesta de gobernanza ya se presentó? ¿Cuándo se firma? | Omar / DIR | **B** Fase 2 |
| D19 | Plazo máximo de pausa temporal (`PAU`) antes de convertirse en baja | ACM | Fase 1 |
| D20 | Contabilidad institucional: ¿quién la lleva y con qué herramienta? (formato de exportación del SOI) | DIR / Omar | Fase 2 (residual de D3) |

---

# ANEXO A — INVENTARIO REAL DE LA BASE DE DATOS (EL CONTRASTE)

Extraído de `bbdd.md` (dump del esquema real, 100 tablas documentadas de las 247 totales) + enums de producción. **Esto es el punto de partida real; la Parte VII define el objetivo.**

## A.1 Tabla `alumnos` — la ficha real (advertencia de sobre-modelado)

`alumnos` tiene **~95 columnas** que mezclan identidad, representante (padre/madre/otro con cédula y WhatsApp cada uno), escolaridad, datos socioeconómicos (`beneficiario_subsidio_estado`, `familia_monoparental`, `impedimento_social`), datos médicos en texto libre (`condiciones_medicas`, `alergias`, `medicamentos`, `condicion_transmisible_desc`, `alergia_medicamento_desc`), aspiraciones y gustos (`musico_favorito`, `sentimiento_musica_clasica`), consentimientos como flags (`acepta_beca_4500`, `acepta_pago_600`, `autoriza_fotos_redes`), banderas operativas (`mora_flag`, `bloqueo_certificado`, `bloqueo_evento`, `abandono_score`, `exento_mensualidad`), y `familia_id`.

**Feedback para la reconstrucción:**
- Separar en: `personas` (identidad) + `alumno` (rol académico) + `alumno_escolaridad` (ya existe) + `alumno_datos_sensibles` (médico/socioeconómico, acceso restringido) + `consentimientos` (P11).
- Los datos del representante salen de `alumnos` → `personas` + `familias` (un representante con 3 hijos se registra una vez).
- `abandono_score` / `mora_flag` / `promedio_notas` son **derivados**: se calculan, no se almacenan como verdad editable, y son **señal, no veredicto** (P12).

## A.2 Custom Types / Enums de producción (33)

`route_status` · `progress_status` · `attempt_result` · `cuota_estado` · `metodo_pago` · `wallet_tipo` · `wallet_origen` · `wallet_modo` · `exoneracion_tipo` · `asignacion_estado` · `notif_tipo` · `notif_canal` · `notif_prioridad` · `notif_estado_wa` · `notif_estado_portal` · `tarea_tipo` · `tarea_estado` · `tarea_prioridad` · `patrocinante_tipo` · `patrocinio_cubre` · `mensaje_tipo` · `minuta_visibilidad` · `cierre_caja_estado` · `wallet_status` · `event_categoria` · `soi_departamento` (`DIR|ACM|ADM|FIN|LOG|COM|TECNICO|LUT`) · `tarea_institucional_estado` · `tarea_institucional_prioridad` · `sim_canal` · `sim_outbox_estado` · `sim_run_estado` · `sim_actor_tipo` · `sim_estado_pago` · `resultado_audicion` (`PROMOVIDO|PERMANECE|NO_PROMOVIDO`) · `nivel_estudiante` (`Nivel 1..5`).

Los `sim_*` sugieren un **simulador** de operación (postulante/alumno/maestro/representante, outbox, runs) — 🔍 confirmar su rol; útil para probar los recorridos sin datos reales.

## A.3 Tablas reales por dominio (de las 100 documentadas)

- **Académico base:** `programas`, `niveles`, `salones`, `maestros`, `alumnos`, `clases`, `horarios`, `clase_horarios`, `alumnos_programas`, `alumnos_clases`, `sesiones_clase`, `periodos`, `catalogos`, `system_config`, `profiles`.
- **Asistencia:** `asistencias`, `ausencias`, `ausencias_maestros`, `asistencia_maestros`, `clases_emergentes`, `asistencias_emergentes`, `justificaciones`, `historial_estado_alumno`, `ausencias_clases_afectadas`, `ausencias_notificaciones`, `ausencias_auditoria`, `notification_trigger_logs`, `notificaciones`, `notificaciones_asistencia`, `configuracion_recordatorios`, `push_subscriptions`.
- **Pedagogía / rutas:** `planificacion`, `planificaciones`, `planificacion_nodos`, `modulos`, `unidades`, `ejercicios`, `contenidos_sesion`, `progresos`, `observaciones_alumnos`, `observaciones_sesion`, `alumnos_rutas`, `alumnos_modulos`, `alumnos_ejercicios`, `intentos_ejercicios`, `routes`, `route_versions`, `blocks`, `levels`, `nodes`, `indicators`, `indicator_attempts`, `indicator_sessions`, `indicator_session_students`, `academic_plans`, `class_session_content_snapshots`, `class_events`, `class_event_methodology`, `homework_assignments`, `planning_documents`, `planned_content`, `plan_clases`, `plan_niveles`, `plan_temas`, `plan_objetivos`, `plan_indicadores`, `curriculos`, `curriculo_pilares`, `curriculo_objetivos`, `cobertura_alumno_objetivo`, `rutas_contenido`, `ruta_contenido_objetivos`, `alumno_plan_entradas`, `repertoire_fragments`, `pulso_score_history`, `soi_analisis_semanal`, `soi_rule_effectiveness`, `schedule_runs`, `schedule_run_feedback`.
- **Gamificación:** `xp_log`, `rachas`, `logros`, `alumnos_logros`.
- **Maestros / permisos:** `maestro_tareas`, `permisos_maestros`, `solicitudes_ausencia`, `solicitudes_permisos`, `solicitudes_necesidades`, `clase_acceso_temporal`, `registros_pendientes`.
- **Casos / seguimiento:** `seguimiento_reglas`, `student_cases`, `student_case_alerts`, `student_case_events`, `student_case_actions`.
- **Finanzas:** `pagos_alumnos`, `aplicaciones_pago` (RLS), (wallet/patrocinio/cierre_caja vía enums).
- **Lutería / inventario:** `inventario_activos`, `comodatos_activos`, `inventario_accesorios`, `inventario_historial`.
- **Admisiones:** `postulantes`, `alumno_escolaridad`, (`soi_postulados`, `soi_citas_audicion` según arquitectura).
- **Documentos:** `document_templates`, `document_batches`, `generated_documents`.
- **Hermes / comms:** `hermes_inbox`, `hermes_whatsapp_queue` (según SDD), `hermes_kanban_cards`, `hermes_reglas` (`hermes_rules_*` RLS por depto).

## A.4 Patrón RLS real

Políticas por departamento: `((auth.role() = 'authenticated') AND (get_user_department() = 'ACM') AND (departamento = 'ACM'))`, más `service_role` con `ALL`. Toda tabla nueva debe seguir este patrón y declararlo explícito.

## A.5 Funciones/RPC canónicas conocidas

`get_maestros_compliance_status`, `check_teacher_attendance`, `fn_whatsapp_cap_hoy`, `fn_whatsapp_encolar_manual`, `fn_hermes_close_process_case`, `fn_hermes_force_close_process_case`, `get_user_department`. 🔍 Extraer la lista completa de `pg_proc` al regenerar el esquema (A1).

## A.6 Discrepancias documento-vs-realidad ya detectadas

| Documento | Realidad | Acción |
|---|---|---|
| `docs/database_schema.sql` (65 CREATE TABLE) | 247 tablas reales | Regenerar (A1 / Fase 0.0b) |
| `SOI_ARCHITECTURE.md` menciona "Meta Graph API + KB FAQ Bot" | Decisión real: Baileys, número no oficial, sin LLM | Corregir (§19.2) |
| Teachers PWA spec: Firestore + event sourcing | Corre sobre Supabase | Marcar partes superadas |
| v1.1: tablas en inglés (`students`, `contacts`) | BD en español | D1 |
| Informe 2025: 219 instrumentos | BD: 324 | Conteo físico (Fase 0.7) |

---

# ANEXO B — EQUIVALENCIAS v1.1 ↔ REAL ↔ v2.0

| v1.1 | Existente (real o probable 🔍) | v2.0 |
|---|---|---|
| `student_case` | `student_cases` + tareas de seguimiento | `casos` + `tareas` + `resultados_accion` |
| Follow-up engine / Escalamiento cobranza / Escalamiento ausencias | Vista de críticos; cola WhatsApp; `seguimiento_reglas` | Motor unificado (`politicas_escalamiento`, `escalamientos`) |
| `department_requests` | `solicitudes_ausencia` / `solicitudes_permisos` / `solicitudes_necesidades` | `solicitudes_departamento` con `proceso_codigo` + `sla_horas` + `respuesta jsonb` |
| WhatsApp "Approved Provider/API" | Baileys + `hermes_whatsapp_queue` | `mensajes` como extensión de la cola; adaptador de proveedor |
| Estados de indicador `locked…achieved` | Escala 0–5 de la Guía; enum `progress_status` | Dos capas: acceso + logro |
| Plan → Unidad → Objetivo → Indicador | `planificacion`, `acm_*`, `plan_*`, `routes/*`, N0–N4 | Programa → Cátedra → Nivel → Plan → Unidad → Objetivo → Indicador (catálogo) |
| "Salud del padre" / Payment Health Index | Finanzas v2.0 | Perfil de Comportamiento de Pago (solo FIN, ≥ 3 meses) |
| Portal Público / Pantallas | Señalética del vestíbulo (Raspberry) | Endpoint de solo lectura + campañas canal "pantalla" |
| Detección de duplicados | ✅ Existente | + registro de decisiones de fusión |
| Hermes | 1.971 eventos, 317 notificaciones, motor de políticas, cierre de casos | Ciclo de vida + `resultados_accion` + niveles L0–L4 |
| — (no estaba) | Monitores/tutores | §10.11 |
| — (no estaba) | Protección (visión) | §25 |
| — (no estaba) | Replicabilidad (visión) | §26 |
| — (no estaba) | Bajas con motivo (decidido sep-2026) | §10.6 (6 tipos + 13 motivos) |
| — (no estaba) | PWA de audiciones (proyecto aparte) | §16.5 audiciones con interruptor + jurado |
| AGT (V8) | Agentes departamentales | Hermes con perfiles por departamento (§6.8) |
| `external_organizations`, `opportunities`, `contacts`, `proposals`, `agreements` | ⚪ (relaciones reales sin sistema) | `organizaciones_externas`, `oportunidades`, `contactos`, `propuestas`, `acuerdos`, `compromisos`, `relaciones` |
| Radar / watchlist / scoring | ⚪ | Fase 3; MVP manual en Fase 2 |
| Creative Studio | ⚪ | §19.5 (sin rostros IA de menores) |

---

# ANEXO C — GLOSARIO

- **ACM / ADM / DIR / FIN / LOG / LUT / COM / TECNICO:** departamentos V8 (Académico, Administración, Dirección, Finanzas, Logística/Inventario, Lutería, Comunicaciones, Técnico). `AGT` 🔍 (D2).
- **Brecha B:** Hermes detecta y notifica, pero no sabe si alguien actuó.
- **C1:** hallazgo de lila — mutaciones sin verificación de filas afectadas.
- **A1:** documentación de arquitectura/esquema desincronizada de la realidad.
- **Caso:** agrupación temporal de eventos, tareas y escalamientos sobre un sujeto.
- **Cátedra:** especialidad instrumental (no "materia/asignatura").
- **Clase / Sesión de clase:** definición permanente / encuentro real.
- **Comodato:** préstamo de instrumento institucional a un alumno (con contrato).
- **DataAdapter Pattern:** capa obligatoria UI ↔ persistencia (Modo Real Supabase / Modo Demo JSON).
- **Deuda pedagógica:** indicadores de unidades cerradas con logro < 3.
- **Escalamiento:** instancia de una política de pasos progresivos (ausencias, cobranza, seguimiento externo, cumplimiento docente).
- **Familia instrumental:** `cuerdas | maderas | metales | percusion | coral_iniciacion | general`.
- **FUNEYCA-PC:** Fundación Escuela de Orquestas y Coros Juveniles e Infantiles de Punta Cana (entidad sin fines de lucro).
- **Hermes:** capa transversal de detección, recomendación, preparación y seguimiento; **no decide, no conversa con familias**.
- **Monitor / tutor:** alumno avanzado que enseña a principiantes (principio fundacional de El Sistema).
- **Núcleo:** sede de El Sistema; eje `nucleo_id`.
- **OSIJ-PC:** Orquesta Sinfónica Infantil y Juvenil de Punta Cana.
- **RDP:** Responsable Designado de Protección (§25.2).
- **Tipo de salida / motivo:** los dos niveles obligatorios del registro de baja (§10.6).
- **Perfil de Hermes:** conjunto de reglas de un departamento en el motor único (`hermes_reglas.dominio`); evolución del AGT de V8.
- **Interruptor por módulo:** `modulos_habilitados` — enciende/apaga un módulo (p. ej. audiciones) por ventana de tiempo.
- **Recorrido cerrado:** flujo de punta a punta, con resultado registrado, operable sin el autor y medible.
- **Representante:** tutor legal del alumno.
- **Señal vs veredicto:** una inferencia sobre personas se muestra para revisión, nunca como etiqueta.
- **SOI:** Sistema Operativo Institucional.

---

# ANEXO D — INSTRUCCIONES PARA EL AGENTE CONSTRUCTOR

Para el agente/modelo de IA que reconstruye el SOI desde cero usando este documento como contexto maestro:

1. **Lee la Parte I–II antes de escribir una línea.** Los 12 principios (P1–P12) y el kernel (§5.3) gobiernan todo lo demás. Cualquier requisito que los contradiga está subordinado.
2. **Construye el kernel primero** (`personas`, `nucleos`, `familias`, `configuracion`, `audit_log`, `hermes_reglas`, `hermes_eventos`, `resultados_accion`, `tareas`, `casos`, `mensajes`, `consentimientos`). Todo lo demás cuelga de ahí.
3. **`resultados_accion` es la pieza que faltaba.** Ningún evento/tarea se cierra sin ella. Es la razón de ser de esta versión.
4. **Un solo motor de escalamiento** (§8) con políticas — no tres implementaciones paralelas.
5. **Un solo modelo pedagógico** (§13.1) — no `acm_*` + `planificacion` + `plan_*` + `routes/*` a la vez. El indicador vive en un catálogo; los planes lo referencian.
6. **Verifica cada escritura** (`.select()` + filas afectadas). Si 0 filas → error visible. (P7 / C1)
7. **La IA nunca escribe directo:** staging → preview → aprobación humana. (P9)
8. **Idioma:** español canónico para tablas/columnas nuevas (pendiente D1); alias en inglés solo donde ya están consolidados.
9. **Multi-núcleo desde el dato:** `nucleo_id NOT NULL` en toda tabla operativa. `departamento` y `nucleo_id` son ejes ortogonales.
10. **Datos de menores:** bloques de acceso separados, consentimiento explícito, sin diagnóstico médico literal, retención definida, **nada de esto alimenta reglas automáticas**. (P11 / P12)
11. **Respeta el orden de fases** (§33). Una capacidad de Fase 3 no se construye mientras las métricas de salida de Fase 1 no se alcancen, salvo autorización explícita de Omar. Prioridad de valor: **cerrar ciclos > abrir módulos**.
12. **Cada tabla nueva declara** dueño humano, recorrido al que sirve, criterio de "en uso", comentario SQL y política RLS por departamento (patrón Anexo A.4).
13. **Toda afirmación 🔍 VERIFICAR** se confirma contra el repositorio/BD antes de construir encima, y las discrepancias se reportan (no se asumen).
14. **Cada recorrido cerrado entrega su manual de operación** (P10). Un recorrido sin manual no está terminado.

*Fin del documento. SOI MASTER SPEC v2.0 — Contexto Maestro Unificado.*

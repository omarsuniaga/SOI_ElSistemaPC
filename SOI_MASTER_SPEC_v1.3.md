# SOI MASTER SPEC v1.2
### Unificación con el SOI existente · Estado real · Definición ampliada

**Estado:** actualización del Master SPEC v1.1 · **Rev. 2:** incorpora las decisiones D1–D14 de Omar (10 sep 2026)
**Fecha:** 10 sep 2026
**Autor funcional:** Omar Suniaga
**Objetivo:** reconciliar la visión v1.1 con lo que el SOI ya tiene construido, medido y decidido; dar feedback de mejora sobre lo existente; y desarrollar con más precisión lo que todavía no existe, sin eliminar ninguna característica.

---

## 0. CÓMO LEER ESTE DOCUMENTO

### 0.1 Leyenda de estado

Cada capacidad lleva una etiqueta:

| Etiqueta | Significado |
|---|---|
| ✅ EXISTE | Construido y en uso según lo reportado |
| 🟡 PARCIAL | Construido pero incompleto, sin cerrar el ciclo, o con defectos conocidos |
| 🔵 DISEÑADO | Especificado en documentos previos, sin construir |
| ⚪ NUEVO | Aparece por primera vez en v1.1/v1.2; aquí se define |
| 🔍 VERIFICAR | Afirmación basada en conversaciones/documentos; debe confirmarse contra el repositorio y la base de datos antes de construir encima |

### 0.2 Fuentes reconciliadas

1. **SOI Master SPEC v1.1** (este documento base).
2. **SOI Master Book V7.0** — 48 procesos, 7 departamentos. Evolución V8 ("Operación Genoma"): departamentos DIR, ACM, ADM, FIN, LOG, AGT y anatomía de proceso *disparador → entrada → proceso → salida → destino*.
3. **Documento de visión SOI-Digital** — 9 capacidades (alumno, académico, lutería, alianzas, finanzas, protección, reportes, Hermes, replicabilidad), regla de oro y contrato de evidencia de Hermes.
4. **SOI — Ruta a Referencia** (auditoría forense de la BD, 7 sep 2026) — cifras de línea base, Fase 0, anti-objetivos.
5. **SDD WhatsApp Gateway multidepto** (F1–F9, aprobado en Judgment Day) + ampliación de inbound en v1.
6. **Auditoría de lila** (hallazgos C1–C5, A1–A7).
7. **Teachers PWA spec** (2,957 líneas: modelos, contratos I/O, offline-first, event sourcing, 8 sprints).
8. **Guía del Maestro v5.0** y programa de cátedra N0–N4 (escala 0–5, protocolos, reglas de promoción).
9. **ViolinPath** (160+ indicadores de violín).
10. **Sistema Financiero SOI v2.0** (prompt: cuotas, Payment Health Index, fondos, flujo de caja, nómina, analítica de dirección).
11. **Señalética digital del vestíbulo** (SPA kiosk, Raspberry Pi).
12. **Documento de funciones** (módulo administrativo y portal de maestros ya operativos).

### 0.3 Advertencia sobre el documento base

El texto de v1.1 recibido **se corta en la sección 62** ("Alumno en dos programas — Puede exi…"). Las secciones 62 en adelante de este documento son desarrollo propio a partir de la intención visible y de lo que ya existe en el SOI. Si v1.1 tenía secciones posteriores (lutería, portal público, auditoría, reportes, mencionadas en su objetivo), deben compararse contra las de aquí.

### 0.4 Convención de nombres — DECIDIDO (D1)

**Español.** Toda tabla, columna, vista, función y política nueva se nombra en español, en `snake_case`, tablas en plural (`solicitudes_departamento`, `resultados_accion`). Se permiten los sufijos técnicos ya usados en la base (`_id`, `_at`, `created_at`) para no romper la coherencia con lo existente. No se renombra nada que ya esté en producción; los nombres en inglés propuestos por v1.1 quedan solo como referencia en el Anexo A.

---

# PARTE I — FUNDAMENTOS UNIFICADOS

## 1. DEFINICIÓN DEL SOI

Se mantiene la definición de v1.1:

> «Sistema Operativo Institucional activo, reactivo y proactivo, capaz de observar tanto el interior como el exterior de la institución, detectar situaciones relevantes, convertirlas en oportunidades, alertas, casos, relaciones, tareas y decisiones, y acompañar su seguimiento hasta obtener un resultado.»

**Se añade una cláusula que faltaba**, tomada de la visión SOI-Digital:

> «El producto real del SOI no es el software: es el método operativo documentado de la institución. El software es el vehículo. Una sede nueva debe poder operar el SOI leyendo sus manuales, sin depender de su autor.»

**Feedback:** la definición v1.1 describe muy bien *qué observa* el SOI, pero la palabra decisiva es la última: "hasta obtener un resultado". Hoy esa es precisamente la parte más débil del sistema real (ver §3). Todo este documento se ordena alrededor de cerrar ciclos, no de abrir más.

## 2. PRINCIPIOS RECTORES (NO NEGOCIABLES)

Consolidados de todas las fuentes. Cualquier requisito posterior que los contradiga queda subordinado.

| # | Principio | Origen | Consecuencia práctica |
|---|---|---|---|
| P1 | **Consolidación antes que expansión** | Ruta a Referencia | Ningún módulo ⚪ entra a construcción mientras su dependencia 🟡 no cierre su ciclo |
| P2 | **Lo particular se configura; lo común se estandariza** | Visión SOI-Digital | Niveles, rúbricas, umbrales, textos, calendarios, tallas → tablas de configuración, nunca `if` en código |
| P3 | **Multi-núcleo desde el dato** | Diagnóstico sep-2026 | Toda tabla operativa nueva nace con `nucleo_id`. `departamento` y `nucleo_id` coexisten (ejes distintos) |
| P4 | **Hermes recomienda; un humano decide** | Visión + SDD WhatsApp | Ninguna acción sensible (§58) se ejecuta sin aprobación registrada |
| P5 | **SOI no responde solo** | SDD WhatsApp | El inbound se recibe, se vincula y se muestra; no hay autorespuesta ni LLM conversando con familias (excepción declarada única: §49) |
| P6 | **Evidencia obligatoria** | Visión | Toda alerta/recomendación incluye: qué ocurrió → evidencia → por qué importa → acción sugerida → quién decide → cuándo revisar |
| P7 | **Toda escritura se verifica** | Auditoría lila C1 | Ninguna mutación se reporta como exitosa sin confirmar filas afectadas |
| P8 | **Ninguna tabla nueva sin dueño** | Anti-objetivo #2 | Cada tabla nueva declara: dueño humano, recorrido al que sirve, criterio de "en uso" |
| P9 | **La IA nunca escribe directo** | v1.1 §43 | Toda extracción/clasificación de IA pasa por preview y aprobación humana |
| P10 | **Cada recorrido cerrado trae su manual** | Diagnóstico | Un recorrido no está "terminado" hasta que alguien que no es Omar lo opera con su manual |
| P11 | **Datos de menores: mínimo necesario** | v1.1 §52 | Consentimiento, acceso restringido, retención definida, auditoría |
| P12 | **Señal, no veredicto** | Diagnóstico | Las inferencias sobre personas (maestro estancado, familia morosa, alumno en riesgo) se presentan como señales para revisión, nunca como etiquetas |

## 3. ESTADO REAL MEDIDO (LÍNEA BASE 7 SEP 2026)

Fuente: auditoría de la BD Supabase `SOI_DDBB_EL_SISTEMAPC` y auditoría de código de lila. 🔍 Cifras a re-medir al cierre de cada fase.

| Métrica | Valor | Lectura |
|---|---|---|
| Tablas totales | 247 | — |
| Tablas sin una sola fila | 123 (50.2%) | La mitad de la superficie no opera |
| Indicadores curriculares cargados | 4,163 | Activo pedagógico enorme |
| Intentos de evaluación de indicadores | 20 | El activo está prácticamente sin usar |
| Eventos detectados por Hermes | 1,971 | Hermes observa |
| Acciones registradas sobre esos eventos | 0 | Nadie sabe si algo se hizo (Brecha B) |
| Tareas de seguimiento | 187 | Existen, sin resultado registrado |
| Disparos de notificación | 317 | Existen, sin cierre |
| Cuotas emitidas | 474 | — |
| Pagos registrados | 2 | El circuito financiero no cierra |
| Instrumentos inventariados | 324 | — |
| Órdenes de reparación | 1 | Lutería no deja rastro |
| Portales-cascarón (1–4 archivos) | 8 | Navegación que promete lo que no hay |
| Mutaciones `.update()/.delete()` sin verificar filas | ~51–74 de 133 | Escrituras que pueden fallar en silencio |

### 3.1 Feedback central sobre v1.1

v1.1 es una visión excelente y coherente, pero **introduce al menos 12 contextos nuevos** (radar, watchlist, CRM, grafo de relaciones, propuestas, acuerdos, campañas, creative studio, bot, perfil de pago, recordatorios adaptativos, importador de planificaciones) sobre un sistema cuyos contextos actuales todavía no cierran.

Tres de sus conceptos más potentes ya **tienen su esqueleto dentro del SOI** y no deben construirse aparte:

- `student_case` (§55) ≈ las 187 **tareas de seguimiento** existentes.
- Follow-up engine (§15), escalamiento de ausencias (§59) y escalamiento de cobranza (§26) ≈ **un mismo motor** (§15 de esta versión).
- `department_requests` (§21) ≈ generalización de las **solicitudes de ausencia docente** que ya tienen flujo de aprobación.

La regla de esta versión: **v1.1 se construye completo, pero se construye extendiendo lo existente, en el orden de la Parte IV.**

## 4. MAPA DE PORTALES ↔ DEPARTAMENTOS

v1.1 organiza por portales (interfaz). El Master Book organiza por departamentos (responsabilidad). Ambos se necesitan: el portal es *dónde se trabaja*; el departamento es *quién responde*.

| Portal v1.1 | Depto. V8 | Estado | Nota |
|---|---|---|---|
| Dirección | DIR | 🟡 | Hoy existe como panel administrativo con visión global de asistencias 🔍 |
| Administrativo | ADM | ✅/🟡 | Registro de maestros, alumnos, clases, salones, postulados |
| Académico | ACM | 🟡 | Asistencias, alumnos críticos, cumplimiento docente, auditoría académica. Planificación incompleta |
| Maestros | ACM | ✅/🟡 | El módulo más usado del SOI (≈80% del ciclo diario) |
| Finanzas Familiares | FIN | 🟡 | Cuotas emitidas; registro de pagos casi inexistente |
| Lutería | LOG | 🟡 | Inventario cargado; órdenes de trabajo sin uso |
| Inventario / Tiendita | LOG | ⚪ | La tiendita no existe; el spec React+Firebase de dic-2025 no se construyó (D6) |
| Comunicaciones y Relaciones | ADM / DIR | 🟡 | Backbone WhatsApp F1–F3 construido; CRM ⚪ |
| Inteligencia Institucional | DIR | ⚪ | Nuevo |
| Eventos y Agenda | ADM (logística de eventos) | 🔵 | Módulo de Eventos y Conciertos del Master Book |
| Postulaciones e Inscripciones | ADM | 🟡 | Recuperación de postulados; PWA de audiciones con Supabase |
| Reportes | DIR | 🟡 | Report Blueprint V8 🔍; reportes semanales manuales |
| Portal Público / Pantallas | ADM | 🟡 | Señalética del vestíbulo diseñada/construida |
| Hermes | **AGT** (Agentes) | 🟡 | Detecta; no cierra. En V8, AGT era la capa de agentes: cada departamento tenía su agente. Hermes es su evolución (§7.6) |
| **Protección y Bienestar** | DIR | ⚪ **AÑADIDO** | Estaba en la visión SOI-Digital; v1.1 lo omitió (ver §24) |
| **Replicabilidad / Núcleos** | DIR | ⚪ **AÑADIDO** | Estaba en la visión; v1.1 lo omitió (ver §26) |

**Feedback sobre los 8 portales-cascarón:** antes de sumar los portales ⚪ de v1.1 al menú, cada cascarón debe tener una de tres decisiones: activar, fusionar o retirar de la navegación (Fase 0.4). Un menú con 16 portales de los cuales la mitad está vacía destruye la confianza del usuario no técnico.

## 5. ARQUITECTURA TÉCNICA (REAL + OBJETIVO)

### 5.1 Lo que existe 🔍

- **Datos:** Supabase / PostgreSQL con RLS, Edge Functions, `schema_reference.sql` (desincronizado del esquema real).
- **Frontend:** aplicación modular (`src/modules/*`, vistas por módulo; p. ej. `gateway-config/views/gatewayConfigView.js`) con capa `api/` de acceso a Supabase.
- **WhatsApp:** servicio `src/services/whatsapp-runner` con **Baileys** (decidido sobre whatsapp-web.js: sin Chromium headless, sesión más estable, MIT), sesión persistente `useMultiFileAuthState`, reconexión automática con alerta de reescaneo (401/loggedOut), cola `hermes_whatsapp_queue`, `dispatchLoop` con jitter 8–20 s, tope diario con calentamiento `fn_whatsapp_cap_hoy`, horas de silencio, y shell **Electron** por PC de departamento (F4).
- **Legado a retirar:** `supabase/functions/whatsapp-webhook/` atado a Evolution API con autorespuesta + LLM (obsoleto por F9; su lógica de *match teléfono → alumno* se reutiliza sin el LLM).
- **Proceso de desarrollo:** SDD con `openspec/changes/*`, memoria técnica en engram, revisión "Judgment Day", Claude Code implementa, **lila** audita, **AI-Anti** remedia.

### 5.2 Feedback técnico sobre lo existente

1. **C1 es prioridad cero.** Una mutación sin `.select()` que "tiene éxito" sin escribir contamina todas las cifras de §3: puede que parte de los "2 pagos" sea en realidad "pagos que se intentaron registrar y se perdieron". Hasta corregir C1 ninguna métrica de uso es confiable, y la clasificación de tablas vacías puede equivocarse.
2. **A1 (`ARCHITECTURE.md` describe un sistema que no existe)** es crítico precisamente porque trabajas con varios agentes: cada agente nuevo arranca con un mapa falso. Debe regenerarse desde el código y la BD, no desde la intención.
3. **Teachers PWA spec vs realidad:** el spec de 2,957 líneas fue escrito sobre Firestore con event sourcing y offline-first. El SOI real corre sobre Supabase. 🔍 Confirmar qué partes del spec se implementaron, en qué forma, y marcar el resto como superado. Un spec obsoleto que un agente lee como vigente es igual de dañino que A1.
4. **Typecheck + lint en CI (A6/A7)** es barato y evita que C1 se repita.

### 5.3 Modelo transversal (el "kernel" que todos los portales comparten)

Estas entidades deben existir **una sola vez** y ser reutilizadas por todos los módulos. Varias ya existen con otro nombre 🔍.

| Entidad conceptual | Propósito | Relación con lo existente |
|---|---|---|
| `nucleos` | Tenencia multi-sede | Crear si no existe; hoy un solo registro (Punta Cana) |
| `personas` | Identidad única (alumno, representante, maestro, contacto externo) | Hoy probablemente separadas por rol 🔍 |
| `hermes_eventos` | Todo lo que Hermes detecta | Ya existen 1,971 eventos 🔍 nombre real |
| `tareas` | Trabajo asignado a un humano | Ya existen 187 de seguimiento |
| `resultados_accion` | **Cierre obligatorio** de tarea/evento | ⚪ Es la pieza que falta (Brecha B) |
| `casos` | Agrupación de eventos+tareas sobre un sujeto durante un periodo | Generaliza `student_case` (§55) |
| `solicitudes_departamento` | Pedidos entre áreas (§21) | Generaliza solicitudes de ausencia docente |
| `politicas_escalamiento` | Pasos, tonos, intervalos, canales | Una tabla para ausencias, cobranza, seguimientos |
| `mensajes` | Todo envío/recepción omnicanal | Extiende `hermes_whatsapp_queue` |
| `configuracion` | Parámetros por núcleo/programa | P2 |
| `audit_log` | Quién hizo qué, cuándo, desde dónde, con qué justificación | ⚪/🔍 |
| `consentimientos` | Autorizaciones de datos y canales | ⚪ |

### 5.4 Reglas de implementación para cualquier agente

- Toda tabla nueva: `id uuid`, `nucleo_id`, `created_at`, `updated_at`, `created_by`, política RLS explícita, comentario SQL con dueño y recorrido.
- Toda mutación: `.select()` + verificación de filas; si 0 filas → error visible al usuario.
- Toda regla de Hermes: registrada en `hermes_reglas` con `version`, parámetros en configuración, y prueba con datos de ejemplo.
- Toda interpretación de IA: tabla de *staging* + preview + aprobación.
- Todo texto dirigido a familias: plantilla parametrizable, nunca literal en código.

---

# PARTE II — HERMES Y LOS MOTORES TRANSVERSALES

## 6. TRES MODOS OPERATIVOS

Se mantienen los tres modos de v1.1. Se añade el estado real y la condición de "cerrado".

| Modo | Ejemplo | Estado | Condición para considerarlo cerrado |
|---|---|---|---|
| Reactivo | Maestro registra asistencia → métricas | ✅ | Ya opera diariamente |
| Activo | 3 ausencias → caso → mensaje → coordinación | 🟡 | Vista de críticos/intermedios existe; falta acción + resultado registrado |
| Proactivo | Radar detecta convocatoria → oportunidad → tareas | ⚪ | Requiere CRM y motor de seguimiento cerrados primero |

**Regla nueva:** un modo superior no se habilita para un dominio mientras el modo inferior de ese dominio no cierre. No tiene sentido que Hermes busque *grants* afuera si todavía no sabe si alguien llamó al representante del alumno con 3 faltas.

## 7. HERMES — CONTRATO COMPLETO

### 7.1 Qué es

Hermes es la capa transversal de detección, relación, recomendación, preparación y seguimiento. **No es un chatbot** ni un agente con permisos de escritura libre. Es un conjunto de:

1. **Reglas deterministas** (configurables, versionadas) — la mayoría de los casos.
2. **Tareas de IA acotadas** (resumir, redactar borradores, extraer, clasificar, puntuar) — siempre con salida revisable.
3. **Un ciclo de vida obligatorio** para todo lo que detecta.

### 7.2 Ciclo de vida de un evento Hermes

```
DETECTADO → VISTO → EN ACCIÓN → RESUELTO
                 ↘            ↘
               DESCARTADO    ESCALADO
               (con motivo)  (nuevo nivel)
```

- Un evento no puede pasar a `RESUELTO` sin un registro en `resultados_accion`.
- Un evento no puede pasar a `DESCARTADO` sin motivo de una lista cerrada (falso positivo, ya atendido por otra vía, fuera de alcance, dato erróneo, otro+texto).
- Eventos sin `VISTO` en N horas (configurable por severidad) generan recordatorio al responsable, no un evento nuevo (evita la inflación que llevó a 1,971 eventos sin acción).

### 7.3 Modelo

```
hermes_reglas
-------------
id, nucleo_id, codigo, nombre, dominio, descripcion,
parametros jsonb, severidad_default, version, activa,
proceso_master_book (código V7/V8), dueño_id

hermes_eventos
--------------
id, nucleo_id, regla_id, regla_version,
entidad_tipo, entidad_id,
severidad (info | atencion | critico),
evidencia jsonb,        -- datos concretos que dispararon la regla
por_que_importa text,
accion_sugerida text,
decide_rol, asignado_a,
revisar_en timestamptz,
estado, motivo_descarte,
clave_dedup,            -- evita duplicar el mismo evento abierto
caso_id, tarea_id,
created_at, visto_at, resuelto_at

resultados_accion
-----------------
id, evento_id, tarea_id,
accion_realizada (lista cerrada + otro),
canal, resultado (resuelto | parcial | sin_respuesta | no_aplica),
nota, evidencia_url, registrado_por, registrado_at
```

### 7.4 Niveles de autonomía

| Nivel | Hermes puede | Ejemplos permitidos |
|---|---|---|
| L0 Observar | Registrar métricas | Tendencias de asistencia |
| L1 Notificar | Avisar a un humano | Badge "4 maestros sin asistencia" |
| L2 Preparar | Redactar borrador, pre-llenar formulario | Mensaje 1/3 al representante |
| L3 Ejecutar con aprobación | Enviar tras clic humano | Envío del mensaje aprobado |
| L4 Ejecutar automático | Solo acciones internas, no sensibles, reversibles | Push recordatorio de asistencia al maestro |

Ninguna acción hacia familias o externos es L4, salvo recordatorios transaccionales previamente aprobados como plantilla (p. ej. recordatorio de cita T-1, §51), y siempre respetando opt-out.

### 7.5 Métricas de salud de Hermes

- % de eventos con `resultado_accion` (meta Fase 1: ≥ 70% de eventos críticos).
- Tiempo mediano detección → visto, visto → resuelto.
- Tasa de descarte por "falso positivo" por regla (si > 30%, la regla se revisa).
- Eventos abiertos por responsable (carga).

**Feedback:** hoy Hermes es un buen sensor y un mal cerrador. No hacen falta reglas nuevas; hace falta que las existentes terminen en una fila de `resultados_accion`.

### 7.6 Hermes y el departamento AGT (D2)

En el Master Book V8, AGT agrupaba a los **agentes departamentales**: cada departamento tenía el suyo. En v1.2 esa idea se conserva así: **Hermes es un solo motor con un perfil por departamento**.

| Perfil | Reglas que ejecuta | Bandeja | Ejemplos |
|---|---|---|---|
| Hermes·DIR | Salud institucional, casos críticos, decisiones pendientes, fechas límite externas | Dirección | "3 decisiones sensibles esperan aprobación" |
| Hermes·ACM | Ausentismo, cumplimiento docente, deuda pedagógica, protocolos de la Guía | Académico | "Regla de freno N0 en Violín Iniciación B" |
| Hermes·ADM | Postulaciones, citas, datos incompletos, duplicados, bot de menú | Administración | "6 prospectos sin cita" |
| Hermes·FIN | Cuotas, pagos, convenios, cobranza, presupuesto mensual | Finanzas | "Recaudo del mes al 62% del presupuesto" |
| Hermes·LOG | Lutería, comodatos, stock de tiendita, inventario | Logística | "Resina bajo mínimo" |

Cada perfil tiene dueño humano, bandeja propia y sus reglas en `hermes_reglas.dominio`. Un evento que toca dos departamentos se crea una sola vez y se enruta con `solicitudes_departamento` (§9), no se duplica.

## 8. MOTOR DE ESCALAMIENTO UNIFICADO ⚪ (unifica §15, §26, §59 de v1.1)

v1.1 describe tres escaleras parecidas: seguimiento de propuestas, cobranza y ausencias. Además existe el cumplimiento docente. **Es un solo motor con distintas políticas.**

### 8.1 Política

```
politicas_escalamiento
----------------------
id, nucleo_id, codigo, dominio (ausencias | cobranza | seguimiento_externo | cumplimiento_docente),
disparador (regla Hermes),
pasos jsonb:
  [ { nivel: 1, espera_dias: 0, tono: "cordial",       canal: ["whatsapp"], plantilla_id, requiere_aprobacion: true },
    { nivel: 2, espera_dias: 3, tono: "institucional", canal: ["whatsapp"], plantilla_id, requiere_aprobacion: true },
    { nivel: 3, espera_dias: 3, tono: "formal",        canal: ["whatsapp","llamada"], abre_caso: true },
    { nivel: 4, espera_dias: 3, tono: "cita",          accion: "solicitar reunión con Administración" } ],
condicion_detencion (pagó | justificó | respondió | asistió),
respeta_ventana_habitual boolean,  -- §25
horario_permitido, dias_permitidos
```

### 8.2 Ejecución (instancia)

```
escalamientos
-------------
id, politica_id, sujeto_tipo, sujeto_id (alumno, familia, organización, maestro),
nivel_actual, estado (activo | pausado | detenido | completado),
motivo_detencion, proximo_paso_at, caso_id, responsable_id
```

### 8.3 Bandeja de estado (lo que Omar pidió explícitamente)

Vista única, filtrable por dominio:

```
ALUMNO/FAMILIA     DOMINIO     NIVEL   ÚLTIMO ENVÍO   RESPUESTA          PRÓXIMO
Ana Pérez          Ausencias   2/3     08 Sep         ✉ Respondió       Revisar respuesta
Familia Gómez      Cobranza    1/4     07 Sep         — Sin respuesta   10 Sep (nivel 2)
Luis Díaz          Ausencias   3/3     05 Sep         — Sin respuesta   Caso abierto
```

- "Respondió" depende del inbound (T3), ya aprobado para v1.
- Un humano abre la respuesta, la lee y registra el resultado. SOI no contesta.
- Cualquier respuesta entrante **pausa** el escalamiento hasta revisión.

### 8.4 Criterios de aceptación

- [ ] Un mismo representante con dos alumnos en falta recibe **un** mensaje consolidado, no dos (depende de dedup y de `personas`).
- [ ] Si el alumno asiste o se registra justificación, la escalera se detiene sola y queda el motivo.
- [ ] Ningún nivel se envía fuera del horario permitido ni sin la aprobación que su paso exige.
- [ ] Un usuario no técnico entiende en la bandeja, sin ayuda, qué está pendiente y qué le toca hacer.

## 9. SOLICITUDES INTERDEPARTAMENTALES (§21 v1.1) 🟡→⚪

### 9.1 Estado

Existe el flujo de **solicitudes de ausencia docente** con aprobación/rechazo e historial (`ausenciaAprobacionApi.js` — afectado por C1). Es el primer caso de un patrón general.

### 9.2 Definición ampliada

Se adopta la tabla de v1.1 (`department_requests` → `solicitudes_departamento`) con tres añadidos:

- `proceso_codigo`: vínculo con el proceso del Master Book. Cada tipo de solicitud corresponde a un proceso con *disparador → entrada → proceso → salida → destino*. Así el Master Book deja de ser un documento paralelo y se vuelve la definición ejecutable del flujo.
- `sla_horas`: tiempo esperado de respuesta según tipo (p. ej. autorización de reparación < 48 h, como ya está definido en el Master Book).
- `respuesta jsonb` + `adjuntos`: el resultado estructurado (p. ej. solvencia: `{al_dia: true, saldo: 0}`), no solo texto.

### 9.3 Catálogo inicial de tipos

| Tipo | Origen → Destino | SLA | Estado |
|---|---|---|---|
| Ausencia de maestro | Maestro → ACM | 24 h | ✅ (migrar al motor general) |
| Solvencia financiera de alumno | ACM → FIN | 48 h | ⚪ |
| Materiales / accesorios | Maestro → LOG | 72 h | ⚪ |
| Reparación de instrumento | Maestro → LOG (Lutería) | 48 h evaluación | 🔵 |
| Asignación de instrumento | ACM/ADM → LOG | 72 h | 🔵 |
| Cambio de horario / salón | Maestro → ACM | 48 h | ⚪ |
| Autorización de gasto | LOG/ACM → DIR según monto | 24–48 h | 🔵 (umbrales en configuración, ver §17.4) |
| Soporte técnico SOI | Cualquiera → ADM | 48 h | ⚪ |

### 9.4 Regla

Una solicitud vencida sin respuesta genera evento Hermes al jefe del departamento destino, no al solicitante.

---

# PARTE III — DOMINIOS Y PORTALES

## 10. PORTAL ACADÉMICO (ACM)

### 10.1 Lo que ya existe

| Capacidad | Estado | Feedback |
|---|---|---|
| Registro de programas, clases, maestros, alumnos, salones | ✅ | Base sólida. Depende de que las clases estén depuradas |
| Asistencia diaria por clase registrada por maestros | ✅ | Es el dato más valioso del SOI; protegerlo con C1 |
| Vista de alumnos críticos e intermedios por ausencias | ✅ | Convertirla en acción (motor §8), no solo en lista |
| Vista de maestros que no registran asistencia | ✅ | Convertirla en seguimiento activo (§13) |
| Detección de alumnos duplicados (similitud nombre/apellido, nacimiento, padres, instrumento, clase) | ✅ | Bien resuelto. Mejorar: registro de decisiones de fusión y "no son duplicados" para no volver a sugerirlos |
| Auditoría académica por criterios | 🟡 🔍 | Definir qué criterios y quién la usa |
| Análisis IA del contenido de clase (detectar estancamiento) | 🟡 | Mantener como señal (P12); la calidad depende del detalle del registro, que es desigual entre maestros |
| Planificación de contenidos secuenciales | 🟡 | Incompleto; conflicto `planificacion` vs familia `acm_*` (9 tablas vacías) |
| Registro de alumnos por el maestro y asignación a clases | ✅ | Requiere reglas de permisos (§11.4) |

### 10.2 Command Center "¿Qué ocurre hoy?" (§53 v1.1)

Se adopta el diseño de v1.1 y se define su contenido exacto:

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

Cada línea es clicable y lleva a la lista filtrada. Cada línea roja corresponde a un evento Hermes con dueño.

### 10.3 Clases y sesiones (§44–47)

Se adopta la separación `Clase` (definición permanente) / `SesionClase` (encuentro real).

```
clases: id, nucleo_id, programa_id, nivel_id, nombre, maestro_titular_id,
        maestros_apoyo[] (monitores), salon_id, horario_recurrente (rrule),
        plan_id, cupo_max, vigente_desde, vigente_hasta, estado

clase_alumnos: clase_id, alumno_id, rol (regular | oyente | refuerzo),
               desde, hasta, motivo_salida

sesiones_clase: id, clase_id, fecha, inicio, fin, salon_id, maestro_id,
                tipo (programada | emergente | recuperacion | extra | ensayo | masterclass),
                estado (programada | realizada | cancelada | sin_registro),
                motivo_cancelacion, asistencia_estado (pendiente | completa),
                contenido_registrado text, etiquetas[], indicadores_trabajados[]
```

**Clase emergente:** ya existe el concepto en la señalética (marcada con punto de anillo). Debe ser el mismo `tipo = emergente` del SOI, no un dato aparte.

### 10.4 Permisos del maestro sobre clases (§46)

Se adopta `class.create = false` por defecto. Permisos concedibles por persona, clase, periodo o programa:

| Permiso | Por defecto | Uso típico |
|---|---|---|
| `clase.editar_alumnos` | ❌ | Depuración de su lista (ya se permite con autorización) |
| `clase.crear_sesion_extra` | ❌ | Recuperaciones |
| `clase.ajustar_horario` | ❌ | Casos puntuales |
| `alumno.registrar` | ✅ 🔍 | Hoy los maestros registran alumnos |

**Feedback:** que el maestro pueda registrar alumnos reduce carga administrativa, pero es también una fuente probable de duplicados. Recomendación: el registro por maestro crea al alumno en estado `pre_registro`, y pasa por el detector de duplicados antes de quedar `activo`.

### 10.5 Depuración de clases (§47) 🟡

Es la **Etapa 1 "SOI confiable"**. Reglas de detección (todas configurables):

| Regla | Condición | Acción sugerida |
|---|---|---|
| Alumno inactivo en clase | ≥ N sesiones consecutivas ausente sin justificación y sin escalamiento abierto | Proponer retirar de la clase o abrir seguimiento |
| Alumno activo sin clase (§28) | `activo AND sin clase_alumnos vigente` | Asignar o dar de baja |
| Clase vacía | 0 alumnos vigentes | Cerrar o reasignar |
| Maestro sin alumnos | Titular sin clases vigentes con alumnos | Revisar carga |
| Horario inválido | Sesión fuera del calendario institucional o salón inexistente | Corregir |
| Duplicado | Detector existente | Comparar y decidir |

Criterio de salida de la depuración: 100% de alumnos activos con al menos una clase vigente o un estado explícito ("en espera", "refuerzo técnico", "baja en trámite").

### 10.6 Bajas, egresos y deserción — DECIDIDO (D8)

**Qué es "categorías oficiales de baja":** la lista cerrada de razones que el SOI obliga a elegir cada vez que un alumno deja la institución. Sin esa lista, cada persona escribe el motivo a su manera ("se mudó", "mudanza", "se fue a vivir a Higüey") y a fin de año nadie puede responder la pregunta que importa: **¿por qué se van los alumnos y qué podemos hacer para que no se vayan?**

La decisión tiene dos niveles: primero el **tipo de salida** (quién la origina) y luego el **motivo** (por qué).

#### Tipo de salida

| Código | Tipo | Definición | ¿Cuenta como deserción? |
|---|---|---|---|
| `VOL` | Retiro voluntario | La familia o el alumno avisa que se retira | Sí |
| `ABA` | Abandono sin aviso | Deja de asistir sin comunicar; se cierra tras agotar el escalamiento (§8) sin respuesta | Sí |
| `INS` | Baja institucional | Decisión de la institución tras revisión de compromiso (§14.3), con aprobación humana (§14.4) | Sí |
| `TRA` | Traslado | Pasa a otro núcleo o a otra institución musical (conservatorio, escuela de arte) | No — puede ser un logro |
| `EGR` | Egreso | Completa su ciclo / alcanza la edad o nivel terminal (T-A/T-B/T-C de la Guía) | No — es un logro |
| `PAU` | Pausa temporal | Suspensión con fecha de regreso prevista (máx. configurable, p. ej. 3 meses). **No es baja**; si vence sin regreso se convierte en `ABA` o `VOL` | No |

#### Motivo (obligatorio en VOL, ABA e INS; uno principal y hasta dos secundarios)

| Código | Motivo | Ejemplos |
|---|---|---|
| `ECO` | Económico | No puede pagar la cuota, transporte o materiales |
| `TRN` | Transporte / distancia | Sin quién lo lleve, mudanza dentro de la provincia |
| `MUD` | Mudanza fuera de la zona | Cambio de ciudad o país |
| `HOR` | Conflicto de horario | Horario escolar, trabajo del adolescente, otra actividad |
| `ACA` | Carga escolar | Rendimiento en la escuela, exigencia de los padres |
| `INT` | Pérdida de interés | Ya no quiere tocar, cambió de gusto |
| `FAM` | Situación familiar | Cambios en el hogar, cuidado de hermanos |
| `SAL` | Salud | Sin detalle clínico (P11) |
| `INSX` | Experiencia en la institución | Conflicto con compañeros o maestro, clima, no se sintió acompañado |
| `PED` | Pedagógico | Frustración por no avanzar, no pasó audición, ubicación inadecuada |
| `INSTR` | Instrumento | No se le asignó instrumento, no le gustó el asignado, daño sin reparar |
| `DES` | Desconocido | Solo válido para `ABA` cuando no hubo ningún contacto |
| `OTR` | Otro | Exige texto |

#### Campos del registro de salida

`tipo_salida`, `motivo_principal`, `motivos_secundarios[]`, `detalle` (texto opcional; obligatorio en `OTR` e `INSX`), `fecha_efectiva`, `ultima_asistencia`, `hubo_seguimiento` (se calcula solo: ¿existió escalamiento o caso en los 60 días previos?), `quien_informo` (representante, alumno, maestro, detectado por el sistema), `decidido_por`, `readmisible` (sí/no/con condiciones), `entrevista_salida_realizada` (sí/no).

#### Efectos automáticos

Cierre de `clase_alumnos` · detención de escalamientos · alerta a LOG si hay instrumento en comodato · alerta a FIN si hay saldo (la deuda se conserva; deja de generar cuotas desde el mes siguiente) · alerta a DIR si el alumno era monitor o ocupaba asiento en la orquesta.

#### Lo que esto permite responder

"% de bajas por motivo en el trimestre" · "% de bajas que tuvieron seguimiento previo" (la cifra que mide si el SOI sirve) · "deserción por programa, nivel y maestro" (señal, P12) · "motivos que la institución puede influir" (ECO, TRN, INSX, PED, INSTR) vs "los que no" (MUD, SAL). Los primeros alimentan decisiones reales: becas, rutas de transporte compartido, préstamo de instrumentos, acompañamiento pedagógico.

**Base legal de referencia:** el Código de protección de niños, niñas y adolescentes (Ley 136-03, art. 44) obliga a los directores de centros educativos a dirigirse a los padres tras dos ausencias o deserción. El Sistema no es un centro del MINERD, pero el estándar es útil: contactar a la familia antes de cerrar cualquier baja por abandono.

Las listas se guardan en `configuracion` (P2): ACM puede añadir motivos, no borrar los que ya tienen registros.

### 10.7 Justificaciones (§54)

Se adopta `attendance_excuses` → `justificaciones_asistencia`. Añadidos:

- Origen: `representante` (vía WhatsApp inbound, transcrita por un humano), `maestro`, `administracion`.
- Tipos: salud, escolar, familiar, transporte, otro. **No se almacena diagnóstico médico**; solo "salud" (P11).
- Una justificación vigente detiene escalamientos de ausencias del periodo.

### 10.8 Ausentismo (§29)

Se adoptan las tres reglas de v1.1 (3 consecutivas, 3 injustificadas/mes, 25% del periodo), configurables por programa. Se añade el umbral de la Guía del Maestro: **asistencia < 70%** como alerta en el checklist de traspaso y en revisiones semestrales.

### 10.9 Horarios y conflictos (§61)

Se adopta el Conflict Engine con cuatro tipos (salón, maestro, alumno, instrumento). Se define la severidad:

| Tipo | Bloquea guardar | Advierte |
|---|---|---|
| Salón (dos sesiones mismo salón, mismo tiempo) | ✅ | — |
| Maestro (dos sesiones simultáneas) | ✅ | — |
| Alumno (ver §10.10) | ❌ | ✅ |
| Instrumento institucional asignado a dos alumnos en sesiones simultáneas | ❌ | ✅ |

### 10.10 Alumno en dos programas (§62 — completado)

No todo solapamiento es error. Un alumno puede pertenecer a Orquesta y Coro, o a Orquesta y Piano. Reglas:

1. **Pertenencia múltiple permitida:** `clase_alumnos` admite varias clases de programas distintos.
2. **Solapamiento horario:** si dos sesiones del alumno se cruzan, el sistema pide definir una **prioridad** para ese bloque (p. ej. "ensayo general prevalece sobre clase de piano"). La prioridad se guarda como regla por alumno o por programa.
3. **Asistencia coherente:** si el alumno está presente en la sesión prioritaria, su ausencia en la otra se marca `ausencia_por_conflicto_autorizado` y **no** cuenta para escalamiento.
4. **Carga semanal:** Hermes advierte si un alumno supera N horas/semana (configurable), como señal de sobrecarga, no como bloqueo.
5. **Finanzas — DECIDIDO (D4):** un alumno genera **una sola cuota** aunque pertenezca a varios programas. La cuota es del alumno, no de la clase.

### 10.11 Monitores y tutores ⚪ (existe en la operación, no en v1.1)

La institución opera con monitores/tutores (alumnos avanzados que enseñan a principiantes, principio fundacional de El Sistema). El modelo debe soportarlo:

- Rol `monitor` sobre una persona que **también es alumno**.
- Clases con `maestro_titular_id` + `maestros_apoyo[]`.
- Supervisión: la Guía establece revisión quincenal del profesor base (15 min/grupo con rúbrica N0) y ficha obligatoria del monitor por sesión. Estas se registran como `sesiones_clase` con tipo `supervision` o como campo de revisión.
- Pregunta que SOI debe poder responder: "¿quién puede ser monitor?" (visión SOI-Digital) → alumnos con indicadores de su nivel ≥ 4 y asistencia ≥ umbral.

## 11. PORTAL MAESTROS (§31–33, §60)

### 11.1 Lo que ya existe

| Capacidad | Estado |
|---|---|
| Registro de asistencia diario, sencillo, por clase | ✅ |
| Edición/completado de asistencias pendientes | ✅ |
| Seguimiento individual de alumno o clase | ✅ |
| Solicitud de ausencia con historial de ausencias recurrentes | ✅ (afectado por C1) |
| Registro de planificación de contenidos secuenciales | 🟡 |
| Observaciones diarias con etiquetado inteligente | ✅ |
| Perfil de alumno con progreso histórico | 🟡 |
| Notificaciones y recordatorios de registro | ✅ 🔍 |

### 11.2 Home del maestro

Se adopta el diseño de v1.1 (Hoy / asistencia pendiente / planificación / repertorio / solicitudes). Se añade:

- **Evaluación rápida en la sesión** (ver §12.8): el botón principal durante la clase no es "tomar asistencia" sino "tomar asistencia y evaluar".
- **Deuda pedagógica del grupo:** los 3 indicadores más atrasados del grupo.
- **Mis escalamientos:** alumnos suyos con escalera activa (solo lectura del estado, sin datos financieros).

### 11.3 Biografía (§32)

Se adopta. Separación explícita: `perfil_publico_maestro` (foto, bio, instrumentos, formación — puede alimentar portal público y flyers) vs `datos_laborales` (contrato, pago — nunca visibles en portal público ni para otros maestros).

### 11.4 Solicitudes del maestro (§33)

Se enrutan por el motor de §9. La lista de tipos de v1.1 se adopta completa.

### 11.5 Cumplimiento docente (§30, §60) — ver §13.

## 12. PEDAGOGÍA ESTRUCTURADA (§34–43)

Este es el dominio con mayor activo acumulado (4,163 indicadores, ViolinPath 160+, Guía del Maestro v5, programa N0–N4) y menor uso (20 evaluaciones). **Es la brecha más importante del SOI.**

### 12.1 Unificación de jerarquías

v1.1 propone `Plan → Unidad → Objetivo → Indicador`. El programa de cátedra usa `Nivel (N0–N4) → Semestre → contenido/nodo → Indicador`. Unificación:

```
PROGRAMA (Orquesta · Coro · Piano · Iniciación)
 └── CÁTEDRA / INSTRUMENTO (Violín, Viola, …)
      └── NIVEL (N0 … N4)              ← estándar institucional (Guía del Maestro)
           └── PLAN (por periodo/semestre; se asigna a una Clase)
                └── UNIDAD (6 por defecto, configurable)
                     └── OBJETIVO
                          └── INDICADOR   ← catálogo reutilizable, no se copia por plan
```

Clave: **el indicador vive en un catálogo** por cátedra y nivel; los planes lo *referencian*. Hoy 4,163 indicadores sugiere posible duplicación por copia entre planes 🔍. Deduplicar el catálogo es parte de la Fase 0.3 (resolución `acm_*` vs `planificacion`).

**Atención propiedad intelectual:** la propuesta de gobernanza (§26.1) clasifica **ViolinPath como herramienta personal de Omar**, fuera del acuerdo institucional. Si sus 160+ indicadores se cargan al catálogo institucional, deben entrar como contenido de la Guía del Maestro (documento de cátedra) o bajo licencia explícita. Decidir antes de la Fase 0.3.

### 12.2 Indicador

Se adoptan los campos de v1.1 y se añaden los de la Guía:

```
indicadores
-----------
id, nucleo_id, catedra_id, nivel_id, codigo, nombre, descripcion,
criterio_logro (qué se observa, en qué condición: cuerda, posición, tempo),
tipo (critico | obligatorio | complementario),     -- Guía del Maestro
dimension_principal (afinación | pulso | técnica | sonido | agilidad | lectura | ritmo | musicalidad | repertorio),
dimensiones_secundarias[],
peso, orden, material_referencia (método/obra/escala),
umbral_desbloqueo (default 3),
activo, version
```

### 12.3 Estados — unificación con la escala 0–5

v1.1 propone `locked / pending / introduced / developing / achieved`. La Guía usa una escala 0–5. **No son excluyentes: son dos capas.**

| Capa | Valores | Qué responde |
|---|---|---|
| **Acceso** | `bloqueado` · `disponible` · `introducido` | ¿Se puede trabajar? ¿Ya se presentó? |
| **Logro** (escala Guía) | 0–1 Consolidación · 2 En proceso · 3 Logro mínimo · 4 Sólido · 5 Dominio | ¿Qué tan bien? |

Equivalencias para la UI tipo Duolingo:

| Visual | Condición |
|---|---|
| 🔒 | bloqueado |
| ⚪ | disponible, sin introducir |
| 🟡 | introducido o logro 1–2 |
| 🟢 | logro 3 (mínimo) |
| ✅ | logro 4–5 |

### 12.4 Prerrequisitos (§37)

Se adopta. Regla precisa: un indicador se desbloquea cuando **todos** sus prerrequisitos alcanzan `umbral_desbloqueo` (por defecto 3). Indicadores sin dependencia avanzan libremente (como define v1.1). Las dependencias sugeridas por IA (importador) requieren aprobación.

### 12.5 Deuda pedagógica (§38)

Se adopta. Se define: **deuda = indicadores de unidades ya cerradas del plan con logro < 3.** Los críticos en deuda pesan doble en el % mostrado.

### 12.6 Reglas de la Guía convertidas en reglas Hermes ⚪

La Guía del Maestro ya define protocolos. SOI debe ejecutarlos, no reinventarlos:

| Protocolo (Guía) | Regla Hermes | Acción |
|---|---|---|
| Alerta técnica prioritaria | Indicador crítico en 0–1 durante semanas 1–4 | Intervención ≤ 7 días; reevaluación en 2 semanas |
| Intervención especial | Mismo nodo sin avance en dos evaluaciones | Revisión de asistencia, hábito, instrumento, motivación, entorno, audición, método |
| Regla de freno (N0) | > 30% del grupo con postura tensa/pulgar presionado en 0–1 | Detener avance; co-enseñanza profesor base + monitor |
| Calibración docente | Diferencia > 1 punto entre evaluadores del mismo alumno/indicador | Sesión de calibración con video |
| Comunicación con familias | Decisión "continúa en proceso" o "consolida" | Reunión ≤ 7 días, rúbrica, evidencia, plan en casa, fecha de reevaluación |
| Traspaso entre maestros | Cambio de docente o cierre de semestre | Paquete de traspaso + checklist (técnica, asistencia < 70%, talla de instrumento, material) |

### 12.7 Promoción ⚪

Del programa de cátedra: un alumno promueve de nivel cuando **todos los indicadores críticos** están en el umbral del nivel y **un % configurable de obligatorios ≥ 3**. Decisiones: Promueve · Continúa · Consolida · Reubicación. En N3–N4, validación obligatoria del jefe de cátedra. SOI genera el **acta de promoción** con los datos ya evaluados; no se llena a mano.

### 12.8 Evaluación dentro de cada clase (§40) — el punto que desbloquea todo

La razón probable de "4,163 indicadores / 20 evaluaciones" es de **fricción**, no de voluntad. Requisitos de UX:

- La sesión trae pre-cargados los indicadores del objetivo en curso (desde el plan).
- Evaluar = tocar el nombre del alumno y un número 0–5. **Meta: ≤ 5 segundos por alumno por indicador.**
- Evaluación grupal rápida: "todos en 3 excepto…".
- Funciona sin conexión y sincroniza (herencia útil del spec PWA offline-first).
- La observación libre sigue existiendo (y el etiquetado inteligente la vincula a dimensiones).
- Una sesión puede cerrarse **sin** evaluar; pero Hermes mide % de sesiones con al menos una evaluación por maestro (señal, no sanción).

Criterio de éxito de Fase 1: ≥ 60% de sesiones realizadas con al menos un indicador evaluado.

### 12.9 Métricas musicales y Perfil 360 (§41–42)

Se adoptan. Cálculo definido: cada dimensión = promedio ponderado del último logro de los indicadores cuya dimensión principal o secundaria coincide (secundaria pesa 0.5), sobre los indicadores **disponibles** del nivel. Se muestra tendencia (últimas 4 evaluaciones) y nunca un número sin su base ("Afinación 78% · basado en 12 indicadores").

### 12.10 Importador de planificaciones (§43)

Se adopta el pipeline. Añadidos: primero **buscar coincidencias en el catálogo existente** antes de crear indicadores nuevos (evita inflar los 4,163); mostrar al aprobador "12 indicadores ya existen, 4 nuevos".

### 12.11 Planificación de maestros (§60)

Se adopta la tabla Asistencia/Planificación por maestro. KPI ya definido institucionalmente: **≥ 90% de maestros con ruta de contenidos activa.**

### 12.12 Repertorio visual ⚪ (en el objetivo de v1.1, sin sección propia)

```
obras: id, titulo, compositor, arreglista, formato (orquesta | cámara | coro | solo),
       nivel_sugerido, duracion, archivo_partitura_url, audio_referencia_url
obra_secciones: obra_id, compases_desde, compases_hasta, dificultad, indicadores_asociados[]
programacion_repertorio: programa_id, obra_id, periodo, concierto_id
progreso_obra: alumno_id | fila_id, obra_id, seccion_id, estado, fecha
```

Permite el "Beethoven 5 — trabajar compases 24–40" del home del maestro y el "Rieding — progreso 72%" del perfil. Conecta con los KPIs del Challenge OSIJ-PC ("compases montados por semana").

**Regla de la Guía que se respeta:** el repertorio comercial/hotelero no forma parte del currículo pedagógico.

## 13. CUMPLIMIENTO DOCENTE (§30, §60) 🟡

### 13.1 Estado

La vista de "maestros que no llenan asistencia" existe. Falta convertirla en seguimiento.

### 13.2 Definición

Regla v1.1 adoptada: `sesión terminó AND asistencia_estado != completa AND tiempo > umbral`.

Escalamiento (política `cumplimiento_docente`, motor §8, todo interno):

| Paso | Cuándo | Acción | Nivel Hermes |
|---|---|---|---|
| 1 | Umbral (p. ej. 2 h tras fin) | Push + badge al maestro | L4 |
| 2 | 24 h | Recordatorio + aparece en Command Center | L4 / L1 |
| 3 | 3 sesiones pendientes | Tarea a ACM con lista | L1 |
| 4 | Recurrente en el mes | Tema para reunión individual (no sanción automática) | L1 |

KPIs ya institucionales: asistencia del maestro ≥ 95%, cumplimiento de reportes 100%, 100% de maestros registrando en plataforma.

**Feedback:** el reporte semanal de maestros (lunes 12 pm → coordinación) definido en el Master Book debería **generarse solo** a partir de sesiones, asistencias y contenidos registrados. Si el maestro registra bien, no debería escribir un reporte adicional. Eso es un incentivo real para registrar.

## 14. SEGUIMIENTO DEL ALUMNO, ESTADO 360 Y DECISIONES SENSIBLES (§55–59)

### 14.1 Caso de seguimiento

`[Activar seguimiento]` crea un registro en `casos` (tipo `alumno`) — no una tabla `student_case` aparte. Al abrirse:

- Se vinculan los eventos Hermes y escalamientos abiertos del alumno.
- Se generan `solicitudes_departamento` automáticas: FIN (situación de cuenta), LOG (instrumento asignado y estado), ACM (asistencia y progreso). Cada departamento responde **solo su eje** — FIN no ve el progreso pedagógico, ACM no ve montos.
- El caso tiene responsable, fecha de revisión y cierre con resultado (P6).

### 14.2 Estado 360 — cuatro ejes (§56)

Se adoptan con nombres de v1.1 y fuentes definidas:

| Eje | Fuente | 🟢 / 🟡 / 🔴 (configurable) | Visible para |
|---|---|---|---|
| Situación financiera familiar | FIN: cuenta de familia | Al día / atraso < 30 días / ≥ 30 días | FIN, DIR, coordinador del caso (solo semáforo) |
| Asistencia | ACM | ≥ 85% / 70–85% / < 70% | ACM, DIR, maestro |
| Progreso pedagógico | Pedagogía | Sin críticos en deuda / 1 crítico / ≥ 2 críticos o nodo estancado | ACM, maestro, DIR |
| Responsabilidad patrimonial | LOG | Sin instrumento institucional o en buen estado / daño reportado / pérdida o no devolución | LOG, DIR |

El eje financiero se muestra como **semáforo sin montos** fuera de FIN.

### 14.3 Revisión de compromiso (§57)

Se adopta: múltiples señales críticas → SOI **recomienda** revisión. Umbral por defecto: ≥ 2 ejes en 🔴 sostenidos ≥ 2 semanas. La revisión es una reunión con representante, alumno y coordinación, con acta.

**Salvaguarda añadida:** el eje financiero en rojo **nunca** es suficiente por sí solo para recomendar revisión de compromiso. En una institución de acción social, la dificultad económica es una razón para buscar beca, no para iniciar un proceso de salida.

### 14.4 Decisiones sensibles (§58)

Se adopta la lista (retirar alumno, retirar beca, retener instrumento, suspender) y se añaden: cambio de nivel por consolidación (§12.7), baja administrativa (§10.6), bloqueo de canal de comunicación. Todas exigen: revisor humano con rol autorizado, justificación, evidencia vinculada, registro en `audit_log`, y notificación al representante con el texto aprobado.

### 14.5 Escalamiento de ausencias (§59)

Se adoptan los textos de v1.1 como plantillas iniciales de la política `ausencias` (§8). Ajuste recomendado al texto de Falta 1: añadir una pregunta abierta ("¿Está todo bien?") — invita a responder y convierte el mensaje en contacto, no en reclamo. Las respuestas son lo que alimenta la bandeja.

## 15. POSTULACIONES E INSCRIPCIONES (§48–52)

### 15.1 Lo que existe

- Recuperación de postulados en el panel administrativo ✅ 🔍
- PWA de gestión de audiciones con Supabase ✅ 🔍 (¿integrada al SOI o separada? confirmar)

### 15.2 Funnel

Se adopta el funnel de v1.1 y se añade el paso **AUDICIÓN/UBICACIÓN** entre Evaluación e Inscripción, y el estado **LISTA DE ESPERA** (hay cupos limitados y audiciones al menos 2/año como KPI de dirección musical):

```
INTERESADO → LEAD → PRE-REGISTRO → INFORMACIÓN → CITA → EVALUACIÓN
   → AUDICIÓN/UBICACIÓN → { INSCRIPCIÓN → ALUMNO | LISTA DE ESPERA | NO ADMITIDO }
```

Al pasar a ALUMNO, la persona **conserva el mismo id** de `personas`. El prospecto no se "copia" a alumnos (fuente clásica de duplicados).

### 15.3 Bot de Administración y Postulaciones — excepción declarada a P5 (D10)

**Decidido:** un solo bot en el **número de Administración (ADM)**, que atiende postulaciones e información administrativa general, porque ambas son del mismo departamento. Los seguimientos de ausencias y cobranza salen de su propio número/departamento en el gateway (columna `departamento`), separados del bot.

Reglas del bot:

- Es **la única excepción** a "SOI no responde solo", declarada en `ARCHITECTURE.md`.
- **De menú y determinista, sin LLM.** Responde solo contenido de `respuestas_aprobadas` (versionado, editable por ADM).
- Menú inicial propuesto: 1) Programas y edades · 2) Requisitos e inscripción · 3) Fechas de audición/inscripción · 4) Ubicación y horario de atención · 5) Cómo pagar (métodos, cuentas, horarios de caja) · 6) Solicitar cita · 7) Hablar con una persona.
- **Nunca responde sobre un alumno concreto** (saldo, asistencia, notas). Si el número pertenece a un representante y pregunta algo personal → "Una persona del equipo te responderá" + bandeja ADM.
- Cualquier texto libre que no coincida con el menú → bandeja humana.
- La opción 6 crea el prospecto y la cita (§15.4) en estado `pendiente de confirmación humana`.
- Métricas: consultas por opción, % derivadas a humano, tiempo de respuesta humana.

### 15.4 Cita (§51) y formulario de inscripción (§52)

Se adoptan. La cita aparece en Administrativo y en la agenda (§22). Recordatorio T-1 es L4 permitido (transaccional, plantilla aprobada).

Formulario: se adopta la lista de v1.1, separando en tres bloques de acceso:

| Bloque | Contenido | Acceso |
|---|---|---|
| Básico | Identificación, familia, contacto, escolaridad, disponibilidad, transporte, experiencia musical, aspiraciones, gustos | ADM, ACM, maestro (parcial) |
| Sensible | Condiciones socioeconómicas | ADM/FIN designados; solo para becas |
| Médico / emergencia | Información médica relevante, contactos de emergencia, autorizaciones | Lectura en emergencia por maestro de la clase; edición ADM |

Cada bloque sensible exige consentimiento explícito registrado en `consentimientos`, y **ninguno alimenta reglas automáticas** de Hermes (P11).

### 15.5 Audiciones y jurado — módulo con interruptor ⚪ (D7)

**Estado:** la PWA de audiciones existe como **proyecto aparte** y no está integrada. Decisión: construir en el SOI una vista de **calificación por jurado dentro del Portal de Maestros**, que permanece **apagada** y solo se enciende durante los periodos de audición. Integrar la PWA externa queda para el futuro.

**Interruptor por módulo:**

```
modulos_habilitados: nucleo_id, modulo ('audiciones'), activo, activo_desde, activo_hasta,
                     activado_por, roles_visibles[]
```

Fuera de la ventana, el módulo no aparece en ningún menú. Se enciende al abrir una convocatoria y se apaga solo al cerrarla.

**Modelo:**

```
convocatorias_audicion: id, nucleo_id, titulo, tipo (ingreso | ubicación orquesta | promoción de nivel | solistas),
                        instrumentos[], fechas, asientos_disponibles jsonb, rubrica_id, estado
candidatos_audicion: id, convocatoria_id, persona_id (prospecto o alumno), instrumento, obra_presentada,
                     turno, estado (inscrito | presentado | ausente)
jurados: convocatoria_id, persona_id (maestro), panel, instrumentos_que_evalua[]
calificaciones_audicion: candidato_id, jurado_id, criterio_id, puntaje, comentario, enviada_at
resultados_audicion: candidato_id, puntaje_final, posicion, decision (admitido | lista de espera |
                     no admitido | asignado a fila/asiento), acta_id
```

**Reglas:**

- Rúbrica configurable (afinación, sonido, ritmo, técnica, musicalidad, lectura a primera vista…), reutilizando las dimensiones de §12.2.
- **Calificación independiente:** cada jurado no ve los puntajes de los demás hasta enviar los suyos.
- Cálculo configurable: promedio, mediana, o promedio descartando extremos. Hermes señala discrepancias > 2 puntos entre jurados (se reusa la regla de calibración de §12.6).
- Deliberación y **acta** con firmas; los resultados no se publican hasta cerrar el acta.
- Salida: admitidos → funnel de inscripción (§15.2); alumnos → ubicación en fila/asiento de la orquesta; alimenta el KPI "100% de asientos cubiertos al cierre de semestre".
- Funciona en tableta o móvil durante la audición, con registro sin conexión.

## 16. PORTAL FINANZAS FAMILIARES (§22–27)

### 16.1 Alcance — DECIDIDO (D3)

**Fuera del SOI:** nómina, impuestos, contabilidad general, fondos restringidos de donantes, estados financieros, seguridad social.

**Dentro del SOI (Finanzas Familiares):**

- Mensualidades e inscripciones.
- Tiendita: materiales, útiles, uniformes, accesorios musicales.
- Cargos de lutería a familias.
- Becas, descuentos y convenios de pago.
- Registro de los pagos mensuales y su aplicación a cargos.
- Mecanismo de seguimiento de pagos (recordatorios, escalamiento de cobranza, perfil de pago).
- **Gestión del presupuesto mensual** (ver §16.9).

La parte de egresos institucionales del Sistema Financiero v2.0 (nómina, fondos, flujo de caja de 12 semanas, contabilidad de doble partida) queda como documento de referencia fuera del alcance del SOI. **La propuesta de gobernanza (§26.1) debe actualizar su tabla de alcance**, que todavía describe v2.0 incluyendo nómina.

### 16.2 Lo que existe

- Emisión de cuotas ✅ (474 emitidas)
- Registro de pagos 🟡 (2 registrados) — causas probables: C1 (escrituras silenciosas) + fricción del flujo + falta de dueño operativo.
- Payment Health Index (v2.0) 🔵 → se renombra **Perfil de Comportamiento de Pago** (v1.1).

### 16.3 Modelo

```
cuentas_familia: id, nucleo_id, representante_persona_id, estado
cargos: id, cuenta_id, alumno_id, concepto (mensualidad | inscripción | uniforme | accesorio | material |
        reparación | otro), origen_tipo, origen_id (orden de lutería, venta de tiendita),
        monto, moneda (DOP), fecha_emision, fecha_vencimiento, estado (pendiente | parcial | pagado | anulado | becado)
pagos: id, cuenta_id, monto, metodo (efectivo | transferencia | tarjeta | otro), referencia,
       comprobante_url, fecha_pago, registrado_por, verificado_por
aplicaciones_pago: pago_id, cargo_id, monto_aplicado        -- un pago puede cubrir varios cargos
becas_descuentos: id, alumno_id, tipo (% | monto), valor, motivo_categoria, vigencia, aprobado_por
```

Regla: los cargos de lutería y tiendita **se generan desde su módulo** (origen_tipo/origen_id); FIN no los digita a mano.

### 16.4 Registro de pago — requisitos para cerrar la brecha

- Registrar un pago en ≤ 3 pasos desde la cuenta de la familia.
- Aplicación automática al cargo más antiguo, editable.
- Confirmación visible **leyendo de la base** después de guardar (C1).
- Recibo generado (PDF/WhatsApp con aprobación).
- Conciliación semanal: lista de transferencias sin cuenta asignada.

### 16.5 Cuenta de familia (§23)

Se adopta la vista de v1.1. Añadidos: desglose por alumno cuando la familia tiene varios; becas visibles como línea negativa; historial de 12 meses.

### 16.6 Perfil de comportamiento de pago (§24)

Se adopta con sus salvaguardas. Añadidos:

- Requiere mínimo 3 meses de historial para mostrarse; antes: "sin datos suficientes".
- Visible solo en FIN.
- No es un campo que otras reglas puedan leer, salvo la ventana de recordatorio (§16.7).

### 16.7 Recordatorios adaptativos (§25) y escalamiento de cobranza (§26)

Se adoptan como política `cobranza` del motor §8, con `respeta_ventana_habitual = true`. Los cuatro niveles de v1.1 se adoptan como plantillas. **Nunca** se envía cobranza al alumno; solo al representante.

**Feedback de prioridad:** los recordatorios adaptativos son elegantes, pero no aportan nada mientras no se registren pagos: el sistema aprendería de 2 datos. Orden: (1) C1, (2) registro de pago sin fricción, (3) 3 meses de datos, (4) recordatorios adaptativos.

### 16.8 Reglas financieras heredadas (del análisis de vacíos del sistema financiero, ago-2026)

Se adoptan porque aplican al alcance decidido:

| Regla | Definición |
|---|---|
| Montos exactos | Montos en enteros (centavos), nunca decimales flotantes. Formato `RD$ 1,250.00`. Cuotas a familias solo en DOP |
| Fecha de valor | Los motores de comportamiento usan `fecha_pago`, no la fecha en que se digitó |
| Registro retroactivo | Hasta 5 días sin fricción; 6–30 días exige motivo; > 30 días o periodo cerrado exige aprobación de DIR; todo desfase > 5 días aparece en un reporte de excepciones |
| Idempotencia | Generar cuotas dos veces para el mismo alumno y periodo no duplica (clave única `alumno_id + concepto + periodo`) |
| Becas | Se aplican al emitir la cuota; una beca aprobada con retroactividad genera **nota de crédito**, no edita cuotas pasadas |
| Hermanos | Se factura por alumno y se cobra por representante; el estado de cuenta muestra ambos niveles |
| Retiro | El alumno deja de generar cuotas desde el mes siguiente a su salida (§10.6); la deuda previa se conserva |
| Pago mayor a la deuda | Genera crédito a favor que se aplica a la siguiente cuota |
| Convenio de pago | La deuda en convenio sale del aging corriente a un tramo "Cartera en convenio", conservando su antigüedad; si se incumple, regresa con su antigüedad acumulada |
| Ciclo académico vs año | La matrícula, cuotas y becas siguen el `ciclo_academico`; el perfil de pago usa ventana móvil de 12 meses independiente del ciclo; meses de receso no cuentan |
| Cierre de periodo | Al cerrar un mes se guarda una foto inmutable de los totales; los reportes de meses cerrados salen de esa foto y no cambian |
| Nunca suspender | Ninguna función financiera suspende la participación de un alumno de forma automática |
| Protección de datos | Ley 172-13 de protección de datos personales: minimización en exportaciones, registro de accesos a fichas sensibles, consentimiento del canal de mensajería |
| Uso en móvil | El cobro ocurre en el pasillo: todo el flujo de registro de pago funciona en el teléfono |

### 16.9 Presupuesto mensual ⚪ (D3)

Dentro del alcance de Finanzas Familiares, el presupuesto mensual responde tres preguntas: **¿cuánto deberíamos recibir, cuánto recibimos, y qué gastamos para operar lo que cobramos?**

```
presupuesto_mensual: nucleo_id, periodo, linea, tipo (ingreso | egreso_operativo), monto_presupuestado, notas
```

- **Ingresos esperados** (se calculan solos): cuotas emitidas − becas, inscripciones previstas, ventas estimadas de tiendita, cargos de lutería.
- **Ingresos reales:** pagos aplicados del periodo.
- **Egresos operativos del ámbito familiar:** compras de inventario de la tiendita, insumos de lutería cobrables, uniformes. **No incluye** nómina ni gastos generales de la institución.
- Vista: presupuestado vs real por línea, % de recaudo, proyección al cierre del mes según la ventana habitual de pago de cada familia (§16.7), y alerta Hermes·FIN si el recaudo proyectado queda bajo un umbral configurable.

🔍 Confirmar con Omar/DIR que esta interpretación de "presupuesto mensual" coincide con lo esperado.

## 17. LUTERÍA, INVENTARIO Y TIENDITA (LOG)

### 17.1 Lo que existe

| Capacidad | Estado |
|---|---|
| Inventario de instrumentos | 🟡 324 registrados (el informe 2025 reportaba 219 al cierre; 🔍 conciliar: ¿incluye accesorios o bajas?) |
| Asignación de instrumentos a alumnos | 🟡 🔍 (88 alumnos con instrumento a cierre 2025) |
| Órdenes de reparación | 🟡 1 registrada |
| Catálogo de servicios de reparación en DOP (cuerdas, madera, metal, paquetes) | ✅ en hoja de cálculo, fuera del SOI |
| Sistema de inventario y ventas de accesorios (React + Firebase) | ❌ **No se construyó** (D6). La tiendita se construye directamente dentro del SOI (§17.5) |

**Feedback:** hay tres fuentes de verdad para instrumentos (SOI, informe anual, hoja de reparaciones). El primer paso es un **conteo físico conciliado** y fijar el SOI como única fuente. Como el sistema React+Firebase no se construyó, no hay migración: la tiendita nace en el mismo Supabase, con el mismo `personas` y la misma cuenta de familia. Su spec de dic-2025 sirve como referencia funcional.

### 17.2 Ciclo de vida del instrumento

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
instrumentos: id, nucleo_id, codigo_inventario, tipo, familia (cuerdas | madera | metal | percusión | teclado),
              tamaño (4/4, 3/4, 1/2…), marca, serie, origen (compra | donación), donante_org_id,
              valor_estimado, estado_fisico (1–5), estado_ciclo, ubicacion, foto_url
comodatos: id, instrumento_id, alumno_id, representante_id, desde, hasta, contrato_url,
           firmado (bool), estado, condicion_entrega, condicion_devolucion
ordenes_lutieria: id, instrumento_id, reportado_por, origen (solicitud maestro | inventario | familia),
                  diagnostico, servicios[] (del catálogo), costo_estimado, requiere_autorizacion,
                  autorizado_por, taller (interno | externo), estado (reportada | evaluada | autorizada |
                  en_proceso | lista | entregada | cancelada), responsable_pago (institución | familia),
                  cargo_id (si familia), fechas
```

### 17.3 Lutería ↔ Finanzas (del objetivo de v1.1)

- Si `responsable_pago = familia`, al cerrar la orden se crea automáticamente un `cargo` en la cuenta de familia con el precio del catálogo.
- Si es institución, se registra como gasto exportable (fuera del SOI, §16.1).
- El catálogo de servicios pasa de la hoja de cálculo a la tabla `catalogo_servicios` (moneda DOP, tasa de referencia configurable).

### 17.4 Autorizaciones de gasto — DECIDIDO (D5)

El umbral de autorización es **opcional y lo configura la propia Dirección**:

```
configuracion.autorizacion_gasto: { activo: false,
  niveles: [ { hasta: <monto>, aprueba_rol: '...' }, { hasta: null, aprueba_rol: 'DIR' } ] }
```

- Si está **apagado**, las órdenes de lutería y compras de tiendita se registran sin paso de aprobación (quedan en `audit_log`).
- Si está **encendido**, cada orden cuyo costo supere un nivel espera la aprobación del rol correspondiente, con SLA del catálogo de solicitudes (§9.3).
- Los aprobadores se definen por **rol**, nunca por nombre de persona.

### 17.5 Tiendita / accesorios

```
productos: id, sku, nombre, categoria (cuerdas | cañas | aceites | resina | otro), stock, stock_minimo, precio
movimientos_stock: producto_id, tipo (entrada | venta | ajuste | uso_taller), cantidad, referencia
ventas: id, cuenta_id | contado, items jsonb, total, metodo, registrado_por
```

Venta a crédito → `cargo` en la cuenta de familia. Stock bajo mínimo → evento Hermes a LOG. Uso de insumos en reparación descuenta stock.

### 17.6 KPIs (del Master Book, ahora calculables)

Instrumentos en buen estado ≥ 90% · tiempo promedio de reparación < 15 días · alumnos con instrumento ≥ 45% · exactitud de inventario ≥ 99% · evaluación técnica de daños ≤ 48 h.

## 18. COMUNICACIONES (§16–18)

### 18.1 Lo que existe — WhatsApp institucional

| Pieza | Estado |
|---|---|
| Runner Baileys con sesión persistente y reconexión | ✅ F3 |
| Cola `hermes_whatsapp_queue` (estado, jid, mensaje, departamento, origen, fechas) | ✅ |
| Rate-limit: jitter 8–20 s, tope diario con calentamiento, horas de silencio | ✅ |
| Columnas `alumno_id` y `nucleo_id` en la cola | 🟡 aprobado |
| Inbound (`messages.upsert` → endpoint nuevo → match teléfono→alumno) | 🟡 aprobado para v1, sin LLM ni autorespuesta, con comentario de desactivación intencional |
| Shell Electron por PC de departamento (F4) | 🔵 |
| Encolado manual `fn_whatsapp_encolar_manual` (F5) | 🔵 |
| Bandeja completa (F7) | 🔵 |
| Pipeline Evolution API + LLM | ❌ a retirar |

### 18.2 Corrección a v1.1 §17

v1.1 dice "Approved Provider/API". **La decisión real es una librería no oficial (Baileys) sobre un número institucional dedicado**; la cuenta Meta Business quedó en pausa. Consecuencias que el spec debe asumir:

- No hay "plantillas aprobadas por Meta"; las plantillas son internas del SOI.
- Riesgo de bloqueo del número ante patrones masivos. Por eso **las campañas masivas por WhatsApp (§18.4) no pueden usar este canal sin límites estrictos**.
- Plan B documentado: si el volumen o el riesgo crece, migrar a la API oficial (la capa `Communication Service` debe permitir cambiar de proveedor sin tocar el resto: patrón adaptador).

### 18.3 Modelo omnicanal

`mensajes` extiende la cola actual (sin reemplazarla):

```
mensajes: id, nucleo_id, departamento, canal (whatsapp | email | sms | push | interno),
          direccion (saliente | entrante), persona_id, alumno_id, organizacion_id,
          hilo_id, plantilla_id, contenido, estado (pendiente | procesando | enviado | entregado |
          leído | fallido | recibido | revisado), escalamiento_id, campaña_id,
          aprobado_por, created_at, procesado_at
consentimientos: persona_id, canal, finalidad (académica | cobranza | difusión | fotos),
                 otorgado (bool), fecha, fuente, revocado_at
```

**Opt-out:** si un representante escribe "BAJA" o equivalente, se registra revocación para `difusión`, se notifica a un humano, y nunca afecta mensajes académicos esenciales sin revisión (se conversa con la familia).

### 18.4 Comunicaciones masivas — Campaign Composer (§18)

Se adopta el flujo de v1.1. Reglas añadidas:

- Audiencias por segmento (programa, clase, nivel, familias con saldo, prospectos). Segmento de "familias con saldo" solo lo usa FIN.
- **Por WhatsApp (Baileys):** tope por campaña = tope diario del gateway; envío escalonado en días si hace falta; solo a personas con consentimiento `difusión`. Mensajes personalizados (nombre), nunca idénticos en ráfaga.
- Instagram/Facebook: publicación manual asistida (el SOI prepara textos e imágenes; publica un humano) hasta tener integración oficial.
- Portal público y pantallas: canal directo del SOI (§25).
- Resultados: enviados, entregados, leídos, respuestas.

## 19. CRM INSTITUCIONAL (§9–14)

### 19.1 Estado

⚪ Nuevo como sistema. Pero **ya hay relaciones reales** que deben ser el primer contenido, no una base vacía: intercambios con 10 países en 2025 (Bélgica, Chile, Colombia, Costa Rica, Cuba, Francia, España, EE. UU., Portugal y otros), donantes de los 46 instrumentos donados en 2025, el Centro Educativo en Artes Matías Ramón Mella y MINERD (taller de lutería), la gestión en curso con D'Addario Foundation.

### 19.2 Entidades

Se adoptan `external_organizations` → `organizaciones_externas`, `contacts` → `contactos`, `conversation_threads` → `hilos`, `proposals` → `propuestas`, `agreements` → `acuerdos`, con estas precisiones:

- **Contacto = persona**: `contactos.persona_id` apunta a `personas`. Así un contacto externo que también es representante de un alumno no se duplica.
- **Distinguir dos roles:** el **contacto externo** (persona de la organización) y el **responsable interno de la relación** (`responsable_relacion_id`, persona de la institución). **Decidido (D14):** en el ejemplo de v1.1, Kalani es la **responsable interna** de la relación con D'Addario Foundation, no la contraparte. La vista correcta es: `D'Addario Foundation → contacto externo: [persona de la fundación] · responsable interna: Kalani`.
- `relationship_strength`: escala 1–5 con definición (1 = contacto frío … 5 = aliado activo con acuerdo vigente).
- `acuerdos.compromisos_nosotros/ellos` como filas, no solo jsonb, para poder generar tareas y vencimientos:

```
compromisos: id, acuerdo_id, parte (nosotros | ellos), descripcion, vence_at, responsable_id,
             estado, evidencia_url
```

### 19.3 Grafo de relaciones (§11)

Se adopta como **modelo futuro** (P2). Implementación inicial: tabla de aristas en Postgres, sin motor de grafos:

```
relaciones: origen_tipo, origen_id, tipo (conoce | trabaja_en | apoya | presentado_por | financia),
            destino_tipo, destino_id, desde, fuente, confianza
```

### 19.4 Follow-up externo (§15)

Política `seguimiento_externo` del motor §8. Por defecto: 7 días sin respuesta → Hermes sugiere; prepara borrador; el humano aprueba. Máximo 2 seguimientos sin respuesta antes de marcar "en pausa" (regla anti-acoso de v1.1 hecha explícita).

## 20. INTELIGENCIA INSTITUCIONAL — RADAR (§4–8) ⚪

### 20.1 Posición en el roadmap

Es el módulo más atractivo y el de menor urgencia operativa. Se construye en **Fase 3**, después de que CRM y motor de seguimiento funcionen. Una oportunidad detectada sin CRM ni seguimiento es otro evento sin acción.

### 20.2 MVP antes del radar automático

Paso 1 (manual, Fase 2): registro de oportunidades y fechas límite en el CRM, con el scoring aplicado por formulario. Esto ya genera valor (no perder convocatorias) sin rastreo web.

Paso 2 (Fase 3): radar automatizado.

### 20.3 Pipeline (§5) — definición operativa

| Etapa | Definición |
|---|---|
| Búsqueda | Consultas programadas por fuente de `watchlist` y por palabras clave configurables (educación musical, orquestas juveniles, El Sistema, instrumentos, Caribe, República Dominicana, cooperación cultural). Frecuencia: semanal por defecto |
| Descubrimiento | URLs nuevas o páginas de la watchlist con cambios (hash de contenido) |
| Extracción | IA extrae: organización, tipo, título, elegibilidad, beneficio, monto, fecha límite, URL |
| Clasificación | Tipo según lista de v1.1 |
| Deduplicación | Misma organización + título similar + misma fecha límite |
| Match | Contra el perfil institucional (§20.4) |
| Scoring | §20.5 |
| Oportunidad | Entra en estado `detectada` → requiere **validación humana** para pasar a `en_evaluacion` (P9) |
| Seguimiento | Tareas, responsable, fecha límite, propuesta |

### 20.4 Perfil institucional (fuente del match)

Tabla `perfil_institucional` por núcleo: misión, programas, población atendida, edades, país, estatus legal (FUNEYCA-PC como entidad sin fines de lucro), documentos disponibles (estatutos, RNC, estados financieros, memorias), métricas de impacto actualizadas desde el SOI (alumnos, asistencia, instrumentos, conciertos). **Esta es una ventaja única del SOI:** las postulaciones pueden llevar cifras reales y actualizadas.

### 20.5 Scoring (§8) — rúbrica definida

Se adoptan los pesos de v1.1. Cada criterio se puntúa 0–5 con definición, por reglas cuando es posible y por IA solo donde no:

| Criterio | Peso | Cómo se calcula |
|---|---|---|
| Mission fit | 20% | IA con justificación citando el texto de la convocatoria |
| Program fit | 20% | Coincidencia de etiquetas (programas, instrumentos, edades) — regla |
| Geografía | 10% | País/región elegible — regla |
| Elegibilidad | 15% | Checklist de requisitos vs documentos disponibles — regla + revisión |
| Potencial de financiamiento | 10% | Monto vs umbral configurable — regla |
| Relación existente | 10% | `relationship_strength` del CRM — regla |
| Viabilidad de plazo | 10% | Días hasta fecha límite vs esfuerzo estimado del tipo — regla |
| Valor estratégico | 5% | Humano |

Hermes muestra el desglose. Una oportunidad con Elegibilidad = 0 no se muestra como recomendada, sin importar el total.

### 20.6 Control de costos

Límite mensual de consultas/tokens configurable; el radar se pausa al alcanzarlo y lo notifica.

## 21. CREATIVE STUDIO (§19) ⚪

Se adopta el flujo. Precisiones:

- Identidad visual institucional: **azul marino profundo + dorado/ámbar sobrio**, tono filarmónico elegante (ya definida para la señalética).
- Nombre oficial siempre "El Sistema Punta Cana".
- **No se generan rostros de niños con IA** ni se alteran fotos reales de alumnos. Si el flyer lleva fotos, son reales y de alumnos con consentimiento `fotos` vigente.
- Los datos (fecha, hora, lugar, programa) salen del evento en el SOI, no se reescriben a mano: si el evento cambia, el flyer queda marcado "desactualizado".
- Variantes de v1.1 adoptadas, más **1280×720** para la pantalla del vestíbulo.

## 22. EVENTOS Y AGENDA INSTITUCIONAL (§20)

### 22.1 Estado

🔵 El Master Book tiene un módulo de Eventos y Conciertos (recepción de solicitudes, visitas de inspección, negociación técnica y económica, logística, masterclasses). 🔍 Confirmar si existe algo en el SOI digital o si corresponde a un portal-cascarón.

### 22.2 Definición

```
eventos: id, nucleo_id, tipo (concierto | ensayo | reunion | visita | festival | representacion |
         fecha_limite | cita_inscripcion | masterclass | audicion), titulo, inicio, fin, lugar,
         organizacion_externa_id, responsable_id, estado (solicitado | evaluando | confirmado |
         realizado | cancelado), requisitos_tecnicos, aporte_economico, participantes (clases/filas/personas),
         repertorio[] (obras), transporte, checklist jsonb
```

Hermes detecta (v1.1 adoptado): conflictos con sesiones y ensayos, participantes con conflicto, preparación insuficiente (repertorio del concierto con progreso < umbral a N días), documentos pendientes, falta de representante institucional.

Un concierto confirmado genera automáticamente: sesiones de ensayo tipo `ensayo`, borrador de flyer (§21), publicación en pantallas (§25).

## 23. PORTAL DE DIRECCIÓN Y REPORTES

### 23.1 Estado

🟡 Visión global de asistencias; reportes semanales y del Challenge OSIJ-PC hechos manualmente; Report Blueprint V8 🔍.

### 23.2 Dirección

Tablero con: KPIs institucionales (tabla abajo), casos críticos abiertos, decisiones sensibles pendientes de aprobación, salud de Hermes (§7.5), oportunidades con fecha límite ≤ 30 días, estado de los recorridos (§28).

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

La **memoria anual** (como la de 2025: instrumentos 170→219, alumnos con instrumento 71→88, piano 17 alumnos/440 clases, intercambios con 10 países) debe salir del SOI con un clic. Es también la materia prima del radar (§20.4).

### 23.4 KPIs institucionales ya definidos (consolidados)

Asistencia orquestal ≥ 85% · casos críticos de asistencia < 5 por ciclo · rúbrica técnica semestral ≥ 4.0/5 · 100% de asientos cubiertos al cierre de semestre · 100% de maestros registrando · ≥ 90% con ruta de contenidos · asistencia docente ≥ 95% · respuesta a solicitudes < 48 h.

## 24. PROTECCIÓN Y BIENESTAR ⚪ (añadido desde la visión SOI-Digital)

v1.1 no lo contempla, y en una institución que trabaja con menores es obligatorio.

### 24.1 Marco legal de referencia (República Dominicana)

- **Ley 136-03** (Código para la protección de los derechos de niños, niñas y adolescentes): su art. 14 obliga a toda persona que conozca o sospeche un abuso a denunciarlo, sin que eso le genere responsabilidad penal o civil. Las denuncias las recibe el Ministerio Público; los canales públicos incluyen el 9-1-1, la Línea Vida (809-200-1202) y la Procuraduría Fiscal de NNA (809-596-4951). Fuente: conani.gob.do.
- **CONANI** es el órgano rector del sistema nacional de protección de la niñez y la adolescencia, y lidera actualmente un proceso de actualización integral de la Ley 136-03: la política interna debe revisarse cuando esa reforma se apruebe.
- **Ley 172-13** de protección de datos personales (aplica a los registros de este dominio).

No soy abogado: la política final debe revisarla un profesional del derecho antes de aprobarse.

### 24.2 Responsable designado — respuesta a D11

**Hoy no existe.** El SOI no puede nombrarlo; lo designa DIR. Recomendación basada en buenas prácticas de protección infantil (*safeguarding*) aplicadas a la estructura actual:

| Rol | Quién (recomendado) | Por qué |
|---|---|---|
| **Responsable institucional** (rinde cuentas) | Dirección Ejecutiva | La obligación legal y reputacional es de la institución; debe recaer en la máxima autoridad operativa |
| **Responsable designado de protección (RDP)** | Una persona de Administración o Coordinación **presente en el horario de clases**, que **no sea maestro directo** de la mayoría de los alumnos, con formación básica en protección | Debe poder recibir un reporte el mismo día y no tener conflicto de interés con los maestros reportados |
| **Suplente del RDP** | Otra persona de un área distinta | Nadie debe quedar sin a quién reportar si el RDP está ausente o involucrado |
| **Asesoría técnica** | Psicólogo/a o trabajador/a social: voluntario profesional, miembro de la junta con ese perfil, convenio con una universidad (prácticas de psicología) o con el centro educativo aliado | La institución no tiene este perfil en plantilla; se cubre con alianza |
| **Contraparte externa** | Oficina regional de CONANI / Procuraduría de NNA | Para derivar casos que superan a la institución |

**Por qué no Omar como RDP:** combina los roles de coordinador de cátedra, maestro directo de muchos alumnos, miembro de la junta y desarrollador del sistema que guarda los registros. Concentrar además la recepción de denuncias crea conflicto de interés y un punto único de falla.

**Tarea inmediata para DIR:** designar RDP y suplente, y darles una capacitación básica. Esto no requiere software y puede hacerse antes de cualquier fase.

### 24.3 Funcionalidad en el SOI

- Registro de **incidentes** (el Master Book ya prevé formularios de incidentes de comportamiento): tipo, descripción factual, personas involucradas, reportado por, acciones, derivación externa, seguimiento. Acceso: RDP, suplente y Dirección Ejecutiva; nadie más, incluido el desarrollador en producción.
- **Canal de reporte** accesible a maestros, monitores y familias (formulario + opción en el menú humano, nunca en el bot automático).
- Protocolos configurables (a quién se notifica y en qué plazo), con registro de cumplimiento.
- **Nada de este dominio alimenta reglas automáticas, scoring ni Estado 360.**
- Autorizaciones de recogida del alumno y contactos de emergencia (vinculado a §15.4).
- Política de fotos y difusión (consentimiento `fotos`).
- Código de conducta de monitores (ya existe en la guía de monitores: no intercambiar números personales con alumnos menores, no agregarlos a redes, no reunirse fuera del horario) → aceptación firmada y registrada en el SOI.

## 25. PORTAL PÚBLICO Y PANTALLAS

### 25.1 Lo que existe

Señalética del vestíbulo: SPA kiosk en Raspberry Pi Zero 2 W (Chromium kiosk), TV 32" 1280×720, sin interacción, 24/7 con modo nocturno; panel multimedia 70% + columna 30% "Hoy/Mañana" (hasta 10 clases por día, clase actual resaltada, pasadas atenuadas, emergentes marcadas); identidad navy/dorado, tema oscuro y variante clara.

### 25.2 Feedback

Bien resuelto para el hardware. Mejoras: (1) debe consumir un **endpoint de solo lectura** del SOI con datos ya filtrados (nunca credenciales con acceso a tablas de alumnos en un dispositivo expuesto en el vestíbulo); (2) caché local para operar sin conexión (ya existe el diseño de estado offline); (3) el contenido multimedia sale de campañas aprobadas (§18.4) con canal "pantalla".

### 25.3 Reglas de contenido público

Nunca: nombres de alumnos con ausencias, saldos, casos, datos médicos. Sí: horarios de clases (sin lista de alumnos), eventos, logros colectivos, fotos con consentimiento, avisos institucionales.

### 25.4 Portal web público ⚪

Programas, calendario de conciertos, formulario de interés (entra al funnel §15 como `INTERESADO`), página de aliados (desde CRM, solo los que autorizan aparecer), transparencia (memoria anual).

## 26. REPLICABILIDAD Y NÚCLEOS ⚪ (añadido desde la visión)

- `nucleo_id` en todo (P3). Usuarios con acceso a uno o varios núcleos; DIR central con vista consolidada.
- **Kit de alta de núcleo:** configuración inicial (programas, niveles, rúbricas, calendario, políticas de escalamiento, plantillas), importadores de alumnos/instrumentos, y los manuales de cada recorrido (P10).
- Catálogos compartidos entre núcleos (indicadores, obras) con posibilidad de variantes locales.

### 26.1 Gobernanza y licencia — respuesta a D12

**Estado actual:** existe un **borrador de propuesta de gobernanza y uso de software** (redactado el 9 sep 2026, tras la reunión con Dirección Ejecutiva). Según lo registrado, **no ha sido revisado legalmente, presentado formalmente ni firmado**. 🔍 Confirmar si ya se presentó.

Contenido del borrador:

| Punto | Propuesta |
|---|---|
| Propiedad intelectual | Código, arquitectura y diseño técnico son del autor |
| Licencia | Uso institucional permanente para El Sistema PC / FUNEYCA-PC; **no exclusiva**: el autor puede ofrecer el software a otros núcleos o instituciones; la institución no puede revenderlo ni cederlo |
| Datos | 100% propiedad de la institución, siempre; exportación completa garantizada (CSV/SQL) sin depender del autor |
| Salida del autor | La institución conserva el uso de la versión existente; transición de 60–90 días con compensación |
| Infraestructura | Hosting, APIs y servicios de terceros los paga la institución |
| Compensación | Separada del salario docente: estipendio mensual de mantenimiento o pago por hito entregado |
| Alcance | Tabla de módulos incluidos; ViolinPath queda fuera como herramienta personal |

**Ajustes necesarios tras esta v1.2:**

1. Actualizar la tabla de alcance: Finanzas **sin nómina** (D3); añadir WhatsApp gateway, Hermes, audiciones con interruptor, tiendita.
2. Resolver la frontera ViolinPath ↔ catálogo institucional de indicadores (§12.1).
3. Añadir cláusula de **replicabilidad**: quién decide y cómo se comparte el beneficio si otro núcleo o institución adopta el SOI.
4. Revisión por un abogado antes de firmar.

**Regla de roadmap derivada:** la estrategia acordada fue *terminar primero lo que ya funciona y congelar lo que solo existe en papel hasta su aprobación formal*. Por eso: **Fase 0 y Fase 1 pueden avanzar** (cierran módulos existentes); **Fase 2 y 3 (módulos nuevos) comienzan después de firmar la gobernanza.** Abrir un segundo núcleo sin este acuerdo multiplicaría el problema de "SOI es una extensión de Omar".

## 27. SEGURIDAD, PRIVACIDAD Y AUDITORÍA

### 27.1 Roles base

DIR · ADM · ACM (coordinación) · FIN · LOG · Maestro · Monitor · Representante (futuro portal familias) · Invitado/solo lectura. Permisos por rol + concesiones puntuales (§10.4).

### 27.2 Reglas

- RLS en todas las tablas; ninguna tabla nueva sin política.
- `audit_log` para: decisiones sensibles, cambios de datos sensibles, fusiones de duplicados, bajas, aprobaciones de gasto, envíos masivos, cambios de configuración.
- Retención: datos médicos y socioeconómicos se revisan al egreso del alumno (plazo configurable); prospectos no inscritos se anonimizan tras N meses.
- Dispositivos compartidos (PC de departamento con el runner WhatsApp, Raspberry del vestíbulo) usan credenciales de servicio con mínimo privilegio.
- Toda salida de IA que toque datos de personas: registro de qué datos se enviaron al modelo y para qué.

---

# PARTE IV — HOJA DE RUTA UNIFICADA

## 28. LOS CINCO RECORRIDOS CERRADOS

Un recorrido está **cerrado** cuando: (a) funciona de punta a punta en producción, (b) deja registro de resultado, (c) alguien que no es Omar lo opera con su manual, (d) tiene una métrica que se mueve.

**Respuesta a D13:** la lista literal de los cinco recorridos de la Ruta a Referencia no quedó registrada en las conversaciones recuperables (el documento llegó como adjunto). Solo está confirmado textualmente el recorrido **#2: ausencia → alerta → contacto → resolución**, y la tarea 1.5 de esa ruta ("registro obligatorio de resultado al cerrar una tarea de seguimiento"), que corresponde a R5. **Decisión:** se adoptan R1–R5 como definición oficial, porque corresponden uno a uno con los cuatro desequilibrios medidos en la auditoría más el recorrido #2. Si el documento original difiere, se actualiza esta tabla, no al revés.

| # | Recorrido | Brecha que cierra | Métrica de cierre |
|---|---|---|---|
| R1 | Plan → sesión → evaluación de indicador → progreso visible | 4,163 indicadores / 20 evaluaciones | ≥ 60% de sesiones con evaluación |
| R2 | Ausencia → alerta → contacto → respuesta → resolución | Vista de críticos sin acción | ≥ 70% de alumnos críticos con resultado registrado |
| R3 | Cuota → recordatorio → pago → saldo al día | 474 cuotas / 2 pagos | ≥ 80% de pagos del mes registrados en el SOI |
| R4 | Daño → orden de lutería → reparación → cargo o cierre | 324 instrumentos / 1 orden | 100% de reparaciones pasan por orden |
| R5 | Evento Hermes → tarea → resultado | 1,971 eventos / 0 acciones | ≥ 70% de eventos críticos con resultado |

## 29. FASES

### Fase 0 — Higiene y verdad (≈ 4–6 semanas)

| Tarea | Detalle | Salida |
|---|---|---|
| 0.0 C1 | Verificar filas en todas las mutaciones, empezando por aprobaciones, finanzas y asistencias | 0 mutaciones sin verificación en `api/` |
| 0.0b A1 | Regenerar `ARCHITECTURE.md` desde el código real; marcar spec PWA Firestore como superado donde aplique | Documento verificado por lila |
| 0.0c A6/A7 | Typecheck + lint en CI | CI bloquea regresiones |
| 0.1 | Inventario de las 123 tablas vacías (con uso real en código) — **marcar el backbone WhatsApp F1–F9 como activo, no huérfano** | Tabla con Decisión y Dueño llenados por Omar |
| 0.2 | Poda controlada: ningún `DROP` sin decisión humana y backup | Tablas vacías ≤ 40, todas con dueño |
| 0.3 | Resolver `acm_*` vs `planificacion`; deduplicar catálogo de indicadores | Un solo modelo pedagógico |
| 0.4 | Decidir los 8 portales-cascarón | Menú sin promesas vacías |
| 0.5 | Reconciliar `schema_reference.sql` con diff automático | 100% coincidencia |
| 0.6 | Depuración de clases y alumnos sin clase (§10.5) | 100% de activos con clase o estado explícito |
| 0.7 | Conteo físico y conciliación de instrumentos (§17.1) | Una sola cifra verdadera |

**Regla de la fase:** no se crean tablas nuevas salvo `resultados_accion` y las ya aprobadas del gateway WhatsApp.

### Fase 1 — Cerrar R2, R5 y el núcleo de R1 (≈ 8–10 semanas)

- WhatsApp F4–F7 con inbound y bandeja (§18.1).
- Motor de escalamiento unificado con políticas `ausencias` y `cumplimiento_docente` (§8, §13).
- `resultados_accion` y ciclo de vida de eventos Hermes (§7).
- Bajas con categoría (§10.6), justificaciones (§10.7).
- Evaluación rápida en sesión (§12.8) con el modelo pedagógico unificado.
- Command Center académico (§10.2).
- Manuales de operación de R2 y R5.

### Fase 2 — Cerrar R3, R4, completar R1 (≈ 10–12 semanas)

**Condición de entrada:** propuesta de gobernanza firmada (§26.1).


- Finanzas familiares con registro de pago sin fricción (§16.4) y política `cobranza` (sin adaptativos aún).
- Lutería con órdenes y cargo a familia; tiendita (§17).
- Solicitudes interdepartamentales generales (§9).
- Casos y Estado 360 (§14).
- Planificación completa, prerrequisitos, deuda, promoción y reglas de la Guía como reglas Hermes (§12).
- Postulaciones con funnel completo (§15), sin bot.
- Módulo de audiciones y jurado con interruptor (§15.5) — puede adelantarse si hay audiciones programadas.
- Presupuesto mensual (§16.9).
- Registro manual de oportunidades en CRM básico (§20.2).
- Reportes automáticos semanales (§23.3).

### Fase 3 — Proactividad y expansión

- CRM completo, propuestas, acuerdos, compromisos (§19).
- Radar de oportunidades y watchlist (§20).
- Campaign Composer y Creative Studio (§18.4, §21).
- Bot de Administración y Postulaciones (§15.3).
- Perfil de pago y recordatorios adaptativos (§16.6–16.7) — con ≥ 3 meses de datos.
- Importador de planificaciones (§12.10), Perfil 360 musical completo, repertorio visual (§12.12).
- Agenda inteligente (§22), portal web público (§25.4).
- Protección y bienestar (§24) — la **designación del responsable no espera ninguna fase**: es tarea de DIR ya. El módulo de software puede adelantarse si DIR lo prioriza.
- Replicabilidad: kit de núcleo + gobernanza (§26).

### 29.1 Nota de capacidad

Este alcance, para una sola persona que además sostiene su ingreso con presentaciones musicales, representa bastante más de un año de trabajo. La Fase 0 y la Fase 1 son las que producen la **evidencia medible** (R2 y R5) para plantear a la junta que el SOI necesite recursos propios (horas institucionales, un monitor técnico formado o un aliado que lo financie). Las cifras de §3 antes/después son ese argumento.

---

# PARTE V — REGISTRO DE DECISIONES

| # | Pregunta | Decisión | Dónde se aplica |
|---|---|---|---|
| D1 | Convención de nombres | ✅ **Español** (snake_case, sufijos técnicos permitidos) | §0.4 |
| D2 | Significado de AGT | ✅ **Agentes**: cada departamento tenía su agente → Hermes con un perfil por departamento | §4, §7.6 |
| D3 | Contabilidad institucional | ✅ **Fuera del SOI.** Dentro: pagos de representantes, mensualidades, inscripción, tiendita, registro de pagos, seguimiento de pagos, presupuesto mensual | §16.1, §16.8, §16.9 |
| D4 | Cuotas por alumno en dos programas | ✅ **Una sola cuota** | §10.10 |
| D5 | Umbrales de autorización de gasto | ✅ **Opcionales**, configurados por DIR, por rol | §17.4 |
| D6 | Inventario React+Firebase | ✅ **No se construyó**; la tiendita nace en el SOI | §17.1, §17.5 |
| D7 | PWA de audiciones | ✅ Proyecto aparte. Se crea **vista de jurado en Portal de Maestros, apagada por defecto**; integración de la PWA en el futuro | §15.5 |
| D8 | Categorías de baja | ✅ Propuesta definida: 6 tipos de salida + 13 motivos | §10.6 |
| D9 | % de obligatorios para promoción | ✅ **Configurable por cátedra y nivel** | §12.7 |
| D10 | Bot | ✅ **Un bot en el número de ADM** para postulaciones y administración | §15.3 |
| D11 | Responsable de protección | 🟠 **No existe.** Recomendación de estructura; **designa DIR** | §24.2 |
| D12 | Gobernanza/licencia | 🟠 Borrador del 9 sep sin firmar; 4 ajustes necesarios; **gate de Fase 2** | §26.1 |
| D13 | Cinco recorridos | ✅ Se adoptan R1–R5 como oficiales | §28 |
| D14 | Kalani en el CRM | ✅ **Responsable interna** | §19.2 |

### Pendientes nuevos surgidos de estas decisiones

| # | Pregunta | Quién | Bloquea |
|---|---|---|---|
| D15 | ¿La interpretación de "presupuesto mensual" (§16.9) es correcta? | Omar / FIN | Fase 2 |
| D16 | ¿Los indicadores de ViolinPath entran al catálogo institucional? ¿Bajo qué figura? | Omar | **B** Fase 0.3 |
| D17 | Designación del RDP y suplente | DIR | Protección (inmediato) |
| D18 | ¿La propuesta de gobernanza ya se presentó? ¿Cuándo se firma? | Omar / DIR | **B** Fase 2 |
| D19 | Plazo máximo de pausa temporal (`PAU`) antes de convertirse en baja | ACM | Fase 1 |

# ANEXOS

## A. Equivalencias v1.1 ↔ SOI real ↔ v1.2

| v1.1 | Existente (real o probable 🔍) | v1.2 |
|---|---|---|
| `student_case` | tareas de seguimiento | `casos` + `tareas` |
| Follow-up engine / Escalamiento cobranza / Escalamiento ausencias | Vista de críticos; cola WhatsApp | Motor de escalamiento unificado (`politicas_escalamiento`, `escalamientos`) |
| `department_requests` | Solicitudes de ausencia docente | `solicitudes_departamento` con `proceso_codigo` |
| WhatsApp "Approved Provider/API" | Baileys + `hermes_whatsapp_queue` | `mensajes` como extensión de la cola; adaptador de proveedor |
| Estados de indicador locked…achieved | Escala 0–5 de la Guía | Dos capas: acceso + logro |
| Plan → Unidad → Objetivo → Indicador | Niveles N0–N4, `planificacion`, `acm_*` | Programa → Cátedra → Nivel → Plan → Unidad → Objetivo → Indicador (catálogo) |
| "Salud del padre" / Payment Health Index | Finanzas v2.0 | Perfil de Comportamiento de Pago |
| Portal Público / Pantallas | Señalética del vestíbulo | Endpoint de solo lectura + campañas canal "pantalla" |
| Detección de duplicados | ✅ Existente | Añadir registro de decisiones |
| Hermes | 1,971 eventos, 317 notificaciones | Ciclo de vida + `resultados_accion` |
| — (no estaba) | Monitores/tutores | §10.11 |
| — (no estaba) | Protección (visión) | §24 |
| — (no estaba) | Replicabilidad (visión) | §26 |
| — (no estaba) | Bajas con motivo (decidido sep-2026) | §10.6 (tipos + motivos) |
| — (no estaba) | PWA de audiciones (aparte) | §15.5 Audiciones con interruptor |
| AGT (V8) | Agentes departamentales | Hermes con perfiles por departamento (§7.6) |

## B. Glosario

- **ACM / ADM / DIR / FIN / LOG / AGT:** departamentos del Master Book V8 (Académico, Administración, Dirección, Finanzas, Logística/Lutería/Inventario, Agentes). AGT evoluciona a Hermes con perfiles por departamento.
- **RDP:** Responsable Designado de Protección.
- **Tipo de salida / motivo:** los dos niveles obligatorios del registro de baja (§10.6).
- **Brecha B:** Hermes detecta y notifica, pero no sabe si alguien actuó.
- **C1:** hallazgo de lila — mutaciones sin verificación de filas afectadas.
- **Caso:** agrupación temporal de eventos, tareas y escalamientos sobre un sujeto.
- **Clase / Sesión:** definición permanente / encuentro real.
- **Deuda pedagógica:** indicadores de unidades cerradas con logro < 3.
- **Escalamiento:** instancia de una política de pasos progresivos (ausencias, cobranza, seguimiento, cumplimiento).
- **Hermes:** capa transversal de detección, recomendación, preparación y seguimiento; no decide.
- **Núcleo:** sede de El Sistema; eje `nucleo_id`.
- **Recorrido cerrado:** flujo de punta a punta, con resultado registrado, operable sin el autor y medible.
- **Señal vs veredicto:** una inferencia sobre personas se muestra para revisión, nunca como etiqueta.

## C. Instrucción para agentes (Claude Code / lila / AI-Anti)

1. Antes de implementar cualquier sección, verificar sus marcas 🔍 contra el repositorio y la base de datos, y reportar discrepancias.
2. No crear una entidad del kernel (§5.3) si existe una equivalente; extenderla.
3. Respetar la Parte IV: una sección de Fase 3 no se implementa mientras las métricas de salida de Fase 1 no se alcancen, salvo autorización explícita de Omar.
4. lila audita cada fase contra los principios P1–P12.

*Fin del documento.*

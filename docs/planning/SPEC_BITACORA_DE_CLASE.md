# SPEC · Bitácora de Clase (Observaciones de Clase)

> Estado: propuesta para revisión · Fecha: 2026-10-20 · Ámbito: Portal de Maestros → asistencia → "Observaciones de Clase"
> Relacionado: [especificacion_malla_curricular_evaluacion_deudas_2026-10-11.md](especificacion_malla_curricular_evaluacion_deudas_2026-10-11.md), [POLITICA_DE_DESARROLLO.md](../POLITICA_DE_DESARROLLO.md), PR #148 (chips de alumno), PR #150 (revisión IA).

## 0. Resumen en una frase

La sección deja de ser **un texto que después alguien interpreta** y pasa a ser **la bitácora de la sesión**: un conjunto de **registros atómicos y confirmados** (quién · qué tipo · qué · de qué frase sale), escritos de forma transaccional, de los que leen **todos** los informes y reportes. El texto libre sigue existiendo, pero como *forma rápida de capturar* y como *evidencia*, no como fuente de datos.

---

## 1. Problema (estado medido, 2026-10-20)

Datos consultados en producción (`SOI_DDBB_EL_SISTEMAPC`) y en el código:

| Hecho | Evidencia |
|---|---|
| La observación vive solo como texto libre | 559 de 636 `sesiones_clase` tienen `contenido`; `contenido_dsl` está vacío en las 636 (la app no lo escribe). |
| Uso real de la sintaxis | De 559 textos: 136 con `#alumno`, 47 con `#todos`, 156 con `[ ]`, 62 con `( )`, 67 con `{ }`. Largo medio 150 caracteres (p90 ≈ 280). 17 maestros, desde 2026-05-06. |
| El desglose por alumno casi no existe | `observaciones_alumnos` = **0** filas; `maestro_tareas` = **0**; `contenidos_sesion` = **0**; `asistencias.valoracion` = 5; `evaluacion_indicador` = 5. |
| Copia duplicada del texto | `observaciones_sesion` = 291 filas (`contenido_parsed` solo en 5) con el mismo texto que `sesiones_clase.contenido`. |
| Notas sin captura explícita | `progresos` = 266 filas `evaluacion_tipo='observacion'`, **213 con `calificacion`** (7 maestros). Hay que verificar cuántas vienen de `n/5` escrito por el maestro y cuántas del evaluador heurístico (R6). |
| Escritura no transaccional | "Guardar observación" escribe 4–5 tablas en secuencia (`indicator_attempts`, `observaciones_sesion`, `progresos`, `observaciones_alumnos`); un fallo intermedio deja datos parciales. |
| **Pérdida de datos offline** | `queueSyncHandler.syncQueueItem` solo procesa `insert/update/delete`; los ítems encolados como `upsert` (observaciones, intentos, asistencias) se descartan sin escribir. `syncManager.js` tiene el manejo correcto pero nadie lo importa. *(Verificado en código.)* |
| Claves únicas inexistentes | `observaciones_sesion` y `observaciones_alumnos` solo tienen PK `id`, pero el código hace `upsert` por `(sesion_id, maestro_id)` / `(sesion_clase_id, alumno_id)`. *(Verificado en BD.)* |
| Al menos 6 intérpretes distintos del texto | `portal-maestros/utils/dslParser.js`, `shared/utils/dslParser.js`, `planificacion/utils/dslParser.js`, regex ad hoc en `reportService.js`, regex en `generarPdfExpediente.js`, heurísticas de `observationParser.js` y el clasificador de `contenidoAnalyticsApi.js`. Cada informe "entiende" el texto a su manera. |
| Vínculo por nombre, no por id | El texto guardado no lleva `alumno_id`; `#Ana` puede coincidir con "Mariana" por subcadena (`evaluationService.js`). |

**Consecuencia:** los informes (diario, mensual, expediente, analítica ADM, riesgo pedagógico) no son trazables a registros (viola R5), se contradicen entre sí y no pueden responder preguntas básicas como *"¿qué contenidos recibió este alumno este mes?"* sin volver a interpretar texto.

---

## 2. Resultado esperado

1. El maestro registra una clase **en menos de 2 minutos**, escribiendo o dictando, sin aprender sintaxis.
2. Antes de guardar **ve exactamente lo que quedará registrado**, alumno por alumno.
3. Un solo gesto, **"Cerrar clase"**, guarda asistencia, registros y valoraciones **en una transacción**, también offline sin pérdida.
4. Todos los informes leen **una sola fuente estructurada** (`registros_sesion`) con drill-down a la frase original.
5. Lo que una clase deja abierto (refuerzo, tarea) **reaparece en la siguiente** para cerrarlo (R2).

---

## 3. Principios (vinculantes para el diseño)

| # | Principio | Política |
|---|---|---|
| P1 | **Fuente única.** Los informes leen registros, nunca re-interpretan texto. Un único intérprete compartido (`parseBitacora`) en `src/shared/`. | R5 |
| P2 | **Registro atómico.** Una fila = un hecho sobre un destinatario. Un registro grupal no se copia a mano a cada alumno; se expande al leer o al cerrar con ids explícitos. | R5 |
| P3 | **Evidencia siempre.** Cada registro guarda el fragmento literal de donde sale y su origen (escrito, dictado, IA sugerida, migrado). | R5 |
| P4 | **La persona decide.** La IA y las reglas proponen; nada queda `confirmado` sin acción del maestro. Ninguna nota se deduce del texto. | R6 |
| P5 | **Cierre del bucle.** Todo refuerzo o tarea nace `abierto` y debe resolverse en una sesión posterior (cumplido / parcial / no cumplido / descartado). | R2 |
| P6 | **Sin pérdida offline.** Ids generados en el cliente + escritura idempotente: reintentar nunca duplica ni descarta. | — |
| P7 | **Configuración, no esquema.** Tipos de registro, etiquetas y escalas de valoración salen de un catálogo configurable por institución. | R4 |
| P8 | **Multi-institución.** Toda tabla nueva lleva `institucion_id` o exención declarada con plan de pago. | R3 |

---

## 4. Lenguaje del dominio (para `CONTEXT.md`)

| Término | Definición |
|---|---|
| **Bitácora de clase** | El conjunto de registros de una sesión. Sustituye a "observación" como concepto de datos. |
| **Nota de clase** | El texto que el maestro escribe o dicta. Es entrada y evidencia; no es fuente de informes. |
| **Registro** | Un hecho atómico de la sesión: `tipo` + `texto` + `destinatario` + `evidencia`. |
| **Tipo de registro** | `contenido` (lo trabajado) · `refuerzo` (aspecto a reforzar) · `tarea` (asignación) · `desempeno` (lo observado en el alumno). Catálogo configurable (P7). |
| **Destinatario** | Un alumno presente, o el **grupo de presentes** (equivale al `#todos` actual). |
| **Evidencia** | El fragmento literal de la nota del que sale el registro, con su posición. |
| **Origen** | `escrito` · `dictado` · `chip` · `sugerido_ia` · `planificado` · `migrado`. |
| **Estado del registro** | `borrador` → `confirmado`; `descartado`. Solo `confirmado` alimenta informes. |
| **Pendiente** | Un registro `refuerzo`/`tarea` confirmado con `seguimiento = abierto`. |
| **Cerrar clase** | Acción única que confirma registros, asistencia y valoraciones en una transacción. |

---

## 5. Experiencia (contrato funcional)

### 5.1 Al abrir la clase

- **Contenido planificado precargado:** si la sesión tiene un indicador o tema activo, aparece un registro `contenido` grupal en estado `borrador`, con origen `planificado`: *"¿Se trabajó Escala de Sol mayor?"* (confirmar / editar / quitar).
- **Pendientes de la clase anterior:** se listan los refuerzos y tareas abiertos de los alumnos **presentes**, con resolución en un toque: `cumplido · parcial · no cumplido · descartar`. Los de ausentes no se muestran como acción (siguen abiertos).
- **Cobertura:** contador visible *"0/11 presentes con registro"*.

### 5.2 Capturar (escribir / dictar / chips)

- Texto libre o dictado, sin sintaxis obligatoria. Los chips (`#alumno`, `[ ]`, `( )`, `{ }`) son **aceleradores**: fijan destinatario o tipo sin ambigüedad.
- Se pueden mencionar alumnos escribiendo el nombre sin `#`; el sistema lo reconoce si es inequívoco contra la nómina de presentes.

### 5.3 Ver en vivo lo que se va a registrar

Junto al editor (debajo en móvil) se muestra el **panel de registros** que se actualiza mientras se escribe:

1. **Reglas deterministas primero, sin IA y sin red:** chips, menciones `#Nombre`/`#todos` (sin distinguir tildes ni mayúsculas, nombre único), conectores `#A y #B`, tokens `[ ] ( ) { }`. *(Base existente: `splitByMentions` en `utils/lessonReview.js`.)*
2. **IA solo para lo ambiguo, en pausa de escritura (≥ 1,5 s) y solo online:** clasificar tipo, separar ideas, proponer destinatarios de frases sin mención. Todo lo de la IA se muestra como **sugerido** (estilo distinto) y nunca se preselecciona como destinatario.
3. Cada tarjeta de registro muestra: destinatario(s), tipo, texto, y al pasar/tocar **resalta su frase** en la nota.
4. Bloque **"Sin asignar"** para frases sin destinatario. No bloquea el cierre, pero se cuenta en el resumen.
5. Avisos no bloqueantes: mención de un **ausente/justificado** (se ofrece quitarlo o marcar asistencia), nombre **ambiguo** (dos alumnos con el mismo nombre).

### 5.4 Cerrar clase (una sola acción)

"Cerrar clase" sustituye a ✨ IA + "Evaluar presentes" + "Guardar sesión". Abre un resumen **por alumno presente**:

- Registros que recibe (propios + grupales), editables.
- **Valoración opcional** 0–5 en la misma tarjeta (escala configurable). Vacía por defecto; nunca se precarga desde el texto.
- Pendientes resueltos hoy.
- Huecos señalados, no rellenados: *"3 presentes sin registro"*, *"2 frases sin asignar"*.

Al confirmar: una sola transacción (§7.3). Si no hay red: se encola como **una** operación idempotente y la UI muestra *"Pendiente de sincronizar"* hasta su confirmación.

### 5.5 Modos según tipo de clase

| Modo | Cuándo | Captura |
|---|---|---|
| **Grupal** | Orquesta, coro, lenguaje musical, ensambles | Nota libre + panel de registros (§5.3). |
| **Turnos individuales** | Clases con `Turnos individuales` (p. ej. 3A Violín) | **Una tarjeta por alumno en orden de turno**: tocar alumno → escribir/dictar → siguiente. Destinatario implícito, sin menciones. |

El modo se infiere del tipo de clase (dato existente, ver `SPEC_ADM_TURNOS_INDIVIDUALES_SOI.md`) y el maestro puede alternarlo.

### 5.6 Reabrir y corregir

- Una sesión cerrada se puede reabrir el mismo día por su maestro; después, solo con motivo registrado (auditoría).
- Corregir un registro confirmado crea una versión nueva (`reemplaza_id`); los informes leen la vigente.

---

## 6. Reglas de negocio

| ID | Regla |
|---|---|
| BR-01 | Solo registros `confirmado` alimentan informes, alertas y métricas. |
| BR-02 | Un destinatario individual debe ser un alumno **presente** (P o tardanza) en esa sesión. Ausentes y justificados no reciben contenido como si hubieran participado. |
| BR-03 | El destinatario `grupo` se resuelve a la lista de presentes **al cerrar**, y esa lista queda congelada en la fila (`destinatarios_ids`) para que un cambio posterior de asistencia no altere lo registrado sin una nueva confirmación. |
| BR-04 | Una frase de la nota nunca se asigna a un alumno no mencionado ni elegido explícitamente por el maestro. |
| BR-05 | La suma de evidencias cubre toda la nota (sin pérdida): lo no atribuido queda en "Sin asignar" o en un registro grupal confirmado por el maestro. |
| BR-06 | Ninguna valoración ni estado de logro se deduce del texto. Se mantiene la sintaxis explícita `n/5` y `!LOGRADO` solo como **atajo del maestro**, y genera una valoración en `borrador` que el maestro confirma. |
| BR-07 | Todo `refuerzo` y `tarea` confirmado nace con `seguimiento = abierto` y aparece como pendiente en la siguiente sesión de la misma clase donde el alumno esté presente. |
| BR-08 | Resolver un pendiente registra `resuelto_en_sesion_id`, `resolucion` y quién resolvió. Nunca se borra el pendiente original. |
| BR-09 | Nombres duplicados en la nómina: no se resuelve por nombre; el maestro elige con chip. |
| BR-10 | "Cerrar clase" es idempotente: reenviar el mismo cierre (mismos ids) no duplica filas. |
| BR-11 | El texto original de la nota se conserva íntegro en `sesiones_clase.contenido` (compatibilidad y evidencia). |

---

## 7. Modelo de datos

### 7.1 Tabla nueva: `registros_sesion`

Una fila por **registro × destinatario**. El registro grupal lleva `alcance = 'grupo'` y la lista congelada.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | **Generado en el cliente** (idempotencia, P6). |
| `institucion_id` | uuid null | Exención declarada (§7.5). |
| `sesion_clase_id` | uuid FK `sesiones_clase` not null | |
| `clase_id` | uuid FK `clases` not null | Desnormalizado para informes por clase. |
| `maestro_id` | uuid FK `maestros` not null | Autor. |
| `fecha` | date not null | Fecha de la sesión (desnormalizada). |
| `grupo_registro_id` | uuid not null | Agrupa las filas nacidas de **una misma idea** (p. ej. `#Ana y #Luis …`). |
| `tipo` | text not null | `contenido · refuerzo · tarea · desempeno` (catálogo, P7). |
| `alcance` | text not null | `alumno · grupo`. |
| `alumno_id` | uuid FK `alumnos` null | Obligatorio si `alcance='alumno'`. |
| `destinatarios_ids` | uuid[] null | Presentes congelados si `alcance='grupo'` (BR-03). |
| `texto` | text not null | Redacción final confirmada. |
| `evidencia` | text not null | Fragmento literal de la nota. |
| `evidencia_inicio` / `evidencia_fin` | int null | Posición en `sesiones_clase.contenido`. |
| `indicador_id` | uuid FK null | Indicador curricular vinculado (ver decisión D2). |
| `origen` | text not null | `escrito · dictado · chip · sugerido_ia · planificado · migrado`. |
| `estado` | text not null | `borrador · confirmado · descartado`. |
| `seguimiento` | text null | Solo `refuerzo/tarea`: `abierto · cumplido · parcial · no_cumplido · descartado`. |
| `resuelto_en_sesion_id` | uuid FK `sesiones_clase` null | BR-08. |
| `resuelto_por` / `resuelto_at` | uuid / timestamptz null | |
| `reemplaza_id` | uuid FK self null | Versionado de correcciones (§5.6). |
| `confirmado_por` / `confirmado_at` | uuid / timestamptz null | |
| `created_at` / `updated_at` | timestamptz | |

Índices: `(sesion_clase_id)`, `(alumno_id, fecha)`, `(clase_id, fecha)`, parcial `(alumno_id) where seguimiento = 'abierto'`, GIN `(destinatarios_ids)`.
Restricciones: `check (alcance='alumno') = (alumno_id is not null)`, `check tipo in (catálogo)`, `check (seguimiento is null) = (tipo not in ('refuerzo','tarea'))`.

### 7.2 Lo que se reutiliza (no se crea)

| Dato | Dónde | Motivo |
|---|---|---|
| Nota original | `sesiones_clase.contenido` | Ya poblado en 559 sesiones; lo leen los informes actuales durante la transición. |
| Asistencia | `asistencias` (UNIQUE `sesion_clase_id, alumno_id`) | Fuente de presentes. |
| Valoración 0–5 | `asistencias.valoracion` (+ `valorada_por/at`) | Ya existe (migración 2026-10-20); una valoración por alumno y sesión. |
| Evaluación por indicador | `evaluacion_indicador` / `indicator_attempts` | Flujo de malla curricular; no se duplica aquí. `registros_sesion.indicador_id` solo vincula. |

### 7.3 Escritura: `cerrar_sesion` (RPC transaccional)

Función Postgres `security invoker` que recibe **todo el cierre** en un JSON:

```
cerrar_sesion({
  sesion: { id, clase_id, fecha, contenido },
  asistencia: [{ alumno_id, estado }],
  registros: [{ id, grupo_registro_id, tipo, alcance, alumno_id?, texto, evidencia, ... }],
  valoraciones: [{ alumno_id, valoracion }],
  resoluciones: [{ registro_id, resolucion }]
})
```

- Una transacción: o se escribe todo o nada.
- `insert … on conflict (id) do update` para registros (idempotencia BR-10).
- Valida BR-02/BR-03 en servidor (destinatarios presentes) y congela `destinatarios_ids`.
- Devuelve los ids escritos; el cliente marca la cola como sincronizada solo al recibirlos.
- Offline: la cola guarda **una operación `rpc`** con el payload completo (no 4–5 operaciones sueltas).

### 7.4 Lectura: contrato para informes

Vistas de solo lectura (RLS heredada):

| Vista | Para | Contenido |
|---|---|---|
| `v_registros_alumno` | Expediente, perfil del alumno, informe a padres, riesgo pedagógico | Registros confirmados vigentes **expandidos por alumno** (individuales + grupales vía `destinatarios_ids`). |
| `v_contenidos_clase` | Informe diario/mensual, analítica ADM | Registros `contenido` por clase y fecha, con conteo de alumnos alcanzados. |
| `v_pendientes_abiertos` | Inicio de clase, alertas Hermes | Refuerzos/tareas con `seguimiento='abierto'` y antigüedad. |
| `v_cobertura_sesion` | Métricas de calidad del registro | Por sesión: presentes, presentes con registro, frases sin asignar. |

Regla: **ningún consumidor nuevo lee `sesiones_clase.contenido` para extraer datos**; solo para mostrar la evidencia.

### 7.5 Políticas estructurales

- **R1:** la migración de `registros_sesion` y su escritor (`cerrar_sesion` + UI de cierre) viajan en el **mismo PR**. Primera fila real: la primera clase cerrada con el flujo nuevo por un maestro piloto; fecha comprometida en el PR de la Fase 2.
- **R3:** producción no tiene tabla `instituciones` ni `institucion_id` en `sesiones_clase/clases/alumnos`. Se declara `-- policy:exento-institucion_id razón: …` con el mismo plan que `20261018120000_documentos_publicos_qr.sql`; la columna `institucion_id uuid null` se crea ya para poblarla cuando exista el modelo multi-institución.
- **R4:** catálogo `tipos_registro` configurable (etiqueta, color, token de atajo, si genera seguimiento) en lugar de un `enum` rígido. Puede empezar como configuración en código con forma de catálogo y migrar a tabla cuando otra institución lo necesite.
- **R5:** cada número de informe enlaza a `registros_sesion.id` → `evidencia`.
- **R6:** sin valoraciones inferidas; IA solo `sugerido_ia` en `borrador`.

### 7.6 Tablas legadas

| Tabla | Filas | Decisión |
|---|---|---|
| `contenidos_sesion` | 0 | Reemplazada por `registros_sesion` (tipo `contenido`). Dejar de leerla; marcar deprecada; borrar tras 1 período sin lectores. |
| `observaciones_alumnos` | 0 | Reemplazada (tipo `desempeno`, alcance `alumno`). Mismo tratamiento. Quitar `observationPromotionService` y el cron de promoción. |
| `maestro_tareas` | 0 | Reemplazada (tipo `tarea` con seguimiento). |
| `observaciones_sesion` | 291 | Copia del texto. Congelar escritura en Fase 2; migrar `contenido_ia_dsl` útil al backfill; deprecar. |
| `progresos` (`evaluacion_tipo='observacion'`) | 266 | Auditar el origen de las 213 notas (BR-06). Las que no provengan de `n/5` explícito se marcan como no confirmadas y no alimentan informes. |
| `sesiones_clase.contenido_dsl` | 0 usos | Eliminar columna en limpieza posterior. |

---

## 8. Migración de históricos (backfill)

- Ejecutar el intérprete determinista sobre las 559 notas existentes y crear registros con `origen='migrado'`, `estado='confirmado'` **solo** cuando el destinatario es inequívoco (chip/mención resuelta contra la asistencia de esa sesión). Lo ambiguo va a `alcance='grupo'` con `tipo='contenido'` si tiene `[ ]`, o queda sin registro (la nota sigue disponible como evidencia).
- No se migran valoraciones ni estados de logro desde texto (BR-06).
- El backfill es re-ejecutable (ids deterministas: `uuid v5(sesion_id, offset)`), y se entrega con un informe: sesiones procesadas, registros creados, frases sin asignar.

---

## 9. Papel de la IA

| Hace | No hace |
|---|---|
| Clasificar el tipo de frases sin token. | Elegir destinatarios por su cuenta (solo sugiere, sin preselección). |
| Separar una frase con varias ideas. | Deducir notas, logros o diagnósticos. |
| Reconocer nombres sin `#` (si son inequívocos). | Reescribir el significado; solo ortografía y claridad. |
| Redactar el informe a padres **desde registros confirmados**. | Leer texto crudo para informes. |

Límites: una llamada por pausa, timeout corto, degradación silenciosa a solo reglas. El texto del maestro se trata como datos, nunca como instrucciones. En Modo Demo no se envía nada a la IA.

---

## 10. Entregas por fases

Cada fase es un PR (o cadena) con valor por sí misma y sin romper informes existentes.

| Fase | Entrega | Criterio de aceptación |
|---|---|---|
| **F0 · Prerrequisitos** (bloqueante) | Arreglar la cola offline (`upsert` descartado: procesar `upsert`/`rpc` o importar `syncManager`), claves únicas faltantes, quitar el emparejamiento por subcadena de nombres. | Test: un ítem `upsert` encolado se escribe tras reconectar. Ningún `upsert` sin restricción única que lo respalde. |
| **F1 · Panel de registros en vivo (sin escritura nueva)** | `parseBitacora` compartido en `src/shared/` (reemplaza los 6 intérpretes en el portal), panel en vivo, "Sin asignar", avisos de ausentes. Guarda como hoy. | Para el texto del incidente del 2026-10-20 cada alumno recibe solo su frase; cobertura 100 % de la nota; tests de reglas. |
| **F2 · Cierre transaccional** | Migración `registros_sesion` + `cerrar_sesion` + UI "Cerrar clase" (con valoración en tarjeta). Piloto con 1–2 maestros. | Cierre offline → online sin duplicar ni perder; BR-02, BR-03, BR-10 con tests de BD. Primera fila real con fecha comprometida (R1). |
| **F3 · Pendientes y planificado** | `v_pendientes_abiertos`, resolución al inicio de clase, contenido planificado precargado. | Un refuerzo confirmado hoy aparece en la siguiente sesión del alumno presente y se puede resolver (R2). |
| **F4 · Informes sobre registros** | Vistas §7.4; migrar `reportService` (diario/mensual), expediente PDF, analítica ADM y riesgo pedagógico a las vistas. Backfill §8. | Cada cifra de informe abre sus registros y su evidencia (R5). Ningún consumidor parsea texto. |
| **F5 · IA y turnos individuales** | Sugerencias IA en pausa; modo turnos individuales; informe a padres desde registros. | La IA nunca deja un registro `confirmado` sin acción del maestro (test). |

Orden de consumidores a migrar en F4 (según impacto): `reportService.generateDailyReport` → mensual → `generarPdfExpediente` → `contenidoAnalyticsApi` / `maestroClasesContenidoView` → `studentRiskDetectorService` y vistas pedagógicas → `alumnoPerfilView`.

---

## 11. Pruebas de aceptación

1. **Incidente del 2026-10-20:** la nota `#Gerali … #Lesly … #Santa … y #Yereni … #todos …` produce 4 registros individuales (Santa y Yereni comparten `grupo_registro_id`) + 1 grupal; ningún texto se repite en otro alumno.
2. Mención a un ausente → aviso; al cerrar no se crea su registro salvo que el maestro corrija la asistencia.
3. `#todos` con 8 presentes → 1 fila `grupo` con 8 ids congelados; cambiar después la asistencia no altera esa fila.
4. Cierre sin red, reintento ×3 al volver la red → exactamente un juego de filas.
5. Error en una parte del cierre (p. ej. valoración inválida) → no se escribe nada.
6. Refuerzo confirmado el martes → aparece abierto el jueves para ese alumno; resolverlo como `parcial` guarda la sesión del jueves como resolución.
7. Informe mensual de un alumno: cada línea enlaza a su registro y frase de origen.
8. Texto sin menciones ni tokens, sin IA disponible → un bloque "Sin asignar"; el maestro puede cerrar igual (contado en cobertura).
9. Nombre duplicado en la nómina → nunca se asigna por nombre.
10. Valoración: nunca aparece precargada desde el texto; `3/5` escrito genera una valoración `borrador` visible en la tarjeta.

---

## 12. Métricas de éxito

| Métrica | Fuente | Meta inicial |
|---|---|---|
| Tiempo de registro por clase | Telemetría de UI (apertura → cierre) | < 2 min mediana |
| % presentes con al menos un registro | `v_cobertura_sesion` | ≥ 80 % |
| % registros vinculados a indicador | `registros_sesion.indicador_id` | ≥ 50 % en clases con malla |
| % pendientes resueltos en ≤ 2 sesiones | `v_pendientes_abiertos` | ≥ 60 % |
| Cierres perdidos offline | Cola vs. BD | 0 |

---

## 13. Decisiones abiertas

| ID | Decisión | Recomendación |
|---|---|---|
| D1 | ¿Una fila por destinatario o registro + tabla puente? | **Una fila por destinatario** + `grupo_registro_id`: consultas de informe triviales; el grupal usa `destinatarios_ids`. |
| D2 | Tabla canónica de indicadores para `indicador_id`. | **Resuelta (2026-10-20): `maestro_indicadores`** (31 filas, `id uuid`). `registros_sesion.indicador_id` es FK a `maestro_indicadores(id)` con `on delete set null`. Las otras candidatas (`plan_indicadores`, `clase_mapa_indicadores`, `indicator_attempts.indicator_id`) no se enlazan en F2. |
| D3 | ¿Valoración por sesión (`asistencias.valoracion`) o por registro? | **Por sesión** (ya existe); la evaluación por indicador sigue en su flujo. |
| D4 | Ventana de reapertura sin motivo | Mismo día. |
| D5 | ¿Qué hacer con las 213 notas de `progresos`? | Auditar origen en F0; no alimentan informes nuevos si no fueron explícitas. |

## 14. Fuera de alcance

- Rediseño de la malla curricular, deudas y exoneraciones (spec propia del 2026-10-11).
- Notificaciones Hermes a familias (consumirán `v_pendientes_abiertos` en otra entrega, con consentimiento verificable — R6).
- Repertorio (`sesion_repertorio_trabajos`) — se vinculará en una iteración posterior.

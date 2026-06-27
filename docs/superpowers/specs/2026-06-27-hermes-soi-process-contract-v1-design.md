# Hermes SOI Process Contract V1

**Fecha:** 2026-06-27  
**Estado:** Draft implementable  
**Programa:** SOI Digital / Hermes Orquestador  
**Propósito:** amarrar el canon documental del SOI con la operación digital de portales, tareas, evidencia y automatización.

---

## 1. Problema

El SOI ya tiene documentación institucional, fichas de proceso, portales departamentales, tareas Hermes y evidencia operativa. El riesgo es que esas piezas evolucionen separadas:

- un proceso existe en Markdown, pero no existe como contrato ejecutable;
- una tarea existe en Hermes, pero no indica qué proceso SOI está ejecutando;
- un departamento completa trabajo manual, pero la evidencia queda débil o dispersa;
- una necesidad recurrente aparece muchas veces, pero no se convierte en módulo o automatización.

El contrato V1 resuelve ese vacío.

---

## 2. Principio arquitectónico

La columna vertebral digital del SOI es:

```text
Proceso SOI documentado
→ Contrato digital del proceso
→ Caso/Procedimiento Hermes
→ Tareas departamentales
→ Evidencia auditable
→ Cierre
→ Candidato de automatización
```

No reemplaza la política documental ni las fichas departamentales. Las conecta con la ejecución real.

---

## 3. Capas existentes que respeta

| Capa | Fuente | Rol en el contrato |
| --- | --- | --- |
| Gobernanza documental | `00_SISTEMA_MAESTRO/SOI_POLITICA_DOCUMENTAL_CANONICA.md` | Define autoridad por capa. |
| Navegación/control | `00_SISTEMA_MAESTRO/SOI_MASTER_SYSTEM_MAP.md` | Orienta procesos, owners y outputs. |
| Canon operativo | `01_DEPARTAMENTOS/**` | Define cómo se ejecuta cada proceso. |
| Orquestación digital | `SOI_HERMES_CORE_V9.md` + SP-0 | Ejecuta casos, tareas, evidencia e historial. |
| Portales | `src/portales/**` | Capturan datos y evidencia por departamento. |

---

## 4. Conceptos canónicos

### 4.1 Process Contract

Representa un proceso SOI documentado y ejecutable digitalmente.

Campos conceptuales:

```text
process_code             FIN-P13 / ACM-P02 / OPR-P10
process_name             Nombre humano del proceso
department_owner         Departamento dueño
canonical_doc_path       Ruta del documento canónico
doc_id                   doc_id/frontmatter si existe
trigger_type             manual | event | scheduled | data_driven | conversation
required_evidence        Evidencias mínimas para cerrar
closure_criteria         Criterios verificables de cierre
responsible_departments  Departamentos que pueden recibir tareas
task_templates           Plantillas iniciales de tareas
automation_status        manual | semi_auto | automated | deprecated
recurrence_count         Señal para detectar automatización futura
```

### 4.2 Process Case

Representa una ejecución concreta de un contrato. Es el “caso/procedimiento” vivo.

Regla clave:

```text
hermes_process_cases.id == tareas_institucionales.correlation_id
```

Esto mantiene compatibilidad con SP-0: las tareas siguen agrupadas por `correlation_id`, pero ahora el caso tiene metadata propia.

### 4.3 Department Task

Cada tarea en `tareas_institucionales` debe poder declarar:

```text
process_code
correlation_id
entidad_tipo / entidad_id / entidad_label
departamento
estado
prioridad
documentos_adjuntos
comentarios
historial
```

### 4.4 Evidence

La evidencia puede vivir como adjunto de tarea o como registro específico de un módulo departamental. V1 exige que el contrato declare qué evidencia mínima se espera; no obliga todavía a crear una tabla universal de evidencias.

---

## 5. Flujo principal

### 5.1 Director pide algo y el dato existe

```text
DIR pregunta
→ Hermes consulta Supabase / snapshot / agente departamental
→ responde con fuente y timestamp
```

### 5.2 Director pide algo y el dato no existe

```text
DIR pregunta
→ Hermes detecta falta de dato
→ busca contrato SOI relacionado
→ crea hermes_process_case
→ genera tareas por departamento
→ portal captura trabajo manual + evidencia
→ Hermes responde cuando el caso se cierra
```

### 5.3 Necesidad recurrente

```text
casos manuales repetidos
→ recurrence_count sube
→ automation_status pasa de manual a semi_auto candidato
→ se propone módulo/automatización
→ se implementa con spec + migración + UI + pruebas
```

---

## 6. Reglas de gobierno

1. Hermes no inventa datos institucionales: si no existen, abre caso.
2. Ningún caso crítico se cierra sin evidencia mínima declarada.
3. Cada tarea debe conservar actor real, historial y comentarios.
4. Los portales departamentales son la fuente de captura operativa.
5. La documentación SOI sigue siendo autoridad de proceso; el contrato solo la vuelve ejecutable.
6. Una automatización nueva debe nacer desde recurrencia observada o decisión explícita de DIR.

---

## 7. MVP recomendado

Primera implementación mínima:

1. Tabla `soi_process_contracts`.
2. Tabla `hermes_process_cases`.
3. Columna `process_code` en `tareas_institucionales`.
4. RPC `fn_hermes_start_process_case(...)`.
5. Vista DIR futura: “Procedimientos SOI”.
6. Semillas iniciales para 3-5 procesos críticos.

Procesos candidatos iniciales:

- `ACM-P02` — Asistencia y contenido.
- `FIN-P13` — Mora y cobranza.
- `OPR-P10` — Taller/lutería y mantenimiento.
- `DIR-P08` — Daily standup / minuta.
- `COM-P10` — Crowdfunding / campañas.

---

## 8. Criterios de aceptación V1

- Un proceso documental puede registrarse como contrato digital.
- Un caso puede abrirse desde un `process_code`.
- Las tareas generadas comparten `correlation_id`.
- Las tareas generadas quedan vinculadas a `process_code`.
- El caso conserva entidad, solicitante, estado, prioridad y metadata.
- El contrato declara evidencia y cierre esperados.
- La implementación es aditiva y no rompe SP-0.

---

## 9. Decisiones pendientes

- Confirmar si `LUT` será departamento oficial o si Lutería debe operar bajo `OPR`, `LOG` o `TECNICO`.
- Definir roles finos por portal; hoy varios portales aún usan `admin` como acceso temporal.
- Decidir si los contratos se alimentarán manualmente, desde frontmatter o desde un importador documental.

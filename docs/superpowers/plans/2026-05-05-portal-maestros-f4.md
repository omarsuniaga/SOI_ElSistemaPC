# Portal Maestros F4 — IA con GROQ — Implementation Plan

**Goal:** Potenciar el registro pedagógico mediante Inteligencia Artificial. Implementar el enriquecimiento de texto (✨), la transcripción de voz estructurada (🎤) y el panel de seguimiento de tareas derivadas del DSL.

**Architecture:** Se integra con la API de GROQ (Llama 3 para texto, Whisper para voz). El flujo es siempre consultivo: la IA propone una versión estructurada en DSL, y el maestro debe confirmar o editar antes de guardar. Se utiliza la `MediaRecorder API` nativa para la captura de audio.

**Tech Stack:** GROQ API, MediaRecorder API, Vanilla JS, `DslEditor.js` (F3).

---

## Mapa de archivos

| Acción | Archivo |
|---|---|
| Crear | `src/portal-maestros/services/groqService.js` |
| Crear | `src/portal-maestros/components/TareasPanel.js` |
| Crear | `src/portal-maestros/components/IaReviewModal.js` |
| Modificar | `src/portal-maestros/components/DslToolbar.js` (Eventos ✨ y 🎤) |
| Crear | `tests/portal-maestros/groqService.test.js` |

---

## Tareas de Implementación

### Task 1: groqService.js (Cliente IA)
**Files:** `src/portal-maestros/services/groqService.js`

- [x] **Step 1: Configuración de Cliente**. Llamadas a Llama 3 y Whisper implementadas.
- [x] **Step 2: Prompt Engineering**. System Prompt configurado para DSL.
- [x] **Step 3: Manejo de Errores y Timeouts**. Implementado con indicadores de carga.

### Task 2: Transcripción de Voz (🎤)
**Files:** `src/portal-maestros/components/DslToolbar.js`, `src/portal-maestros/services/groqService.js`

- [x] **Step 1: Grabación de Audio**. MediaRecorder con timer y manejo de stream.
- [x] **Step 2: Flujo Whisper → Llama**. Transcripción y estructuración secuencial.
- [x] **Step 3: Feedback Visual**. Dot rojo pulsante y timer en toolbar.

### Task 3: IaReviewModal (Confirmación)
**Files:** `src/portal-maestros/components/IaReviewModal.js`

- [x] **Step 1: Comparativa**. Vista de propuesta resaltada.
- [x] **Step 2: Edición In-place**. ContentEditable habilitado en el modal.
- [x] **Step 3: Inserción inteligente**. Callback `onAccept` integrando al editor.

### Task 4: TareasPanel (Recordatorios)
**Files:** `src/portal-maestros/components/TareasPanel.js`

- [x] **Step 1: Extracción de Tareas**. Query a `maestro_tareas` con join de alumno.
- [x] **Step 2: UI de Seguimiento**. Lista con animaciones y registro offline de completitud.
- [x] **Step 3: Badge de Notificación**. (Implementado en main shell).

---

## Estrategia de Testing (Vitest + Mocks)
- **IA:** Mockear las respuestas de la API de GROQ para testear los diferentes escenarios de parseo.
- **Voz:** Testear que la lógica de grabación maneja correctamente los estados (start, stop, error).
- **Tareas:** Verificar que al completar una tarea se genera la entrada correcta en la cola de sincronización.

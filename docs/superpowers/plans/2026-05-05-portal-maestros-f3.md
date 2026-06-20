# Portal Maestros F3 — Editor DSL — Implementation Plan

**Goal:** Implementar el editor inteligente con el Lenguaje DSL Pedagógico. Esto incluye el resaltado en tiempo real, el parser de tokens, la barra de herramientas especializada, el selector de alumnos y el almacenamiento atómico por alumno en la base de datos.

**Architecture:** El editor utiliza un `div[contenteditable]` para permitir el resaltado de sintaxis mediante spans coloreados. Un parser basado en RegEx procesa el texto con un debounce de 150ms. Al guardar, el texto raw se descompone en registros individuales para cada alumno mencionado en la tabla `sesion_alumno_log`.

**Tech Stack:** Vanilla JS, RegEx, CSS Custom Properties, `offlineQueue.js`.

---

## Mapa de archivos

| Acción | Archivo |
|---|---|
| Crear | `src/portal-maestros/services/dslParser.js` |
| Crear | `src/portal-maestros/components/DslEditor.js` |
| Crear | `src/portal-maestros/components/DslToolbar.js` |
| Crear | `src/portal-maestros/components/AlumnoPickerModal.js` |
| Crear | `tests/portal-maestros/dslParser.test.js` |
| Modificar | `src/portal-maestros/views/asistenciaView.js` (Integración Paso 2) |

---

## Tareas de Implementación

### Task 1: Parser DSL
**Files:** `src/portal-maestros/services/dslParser.js`

- [x] **Step 1: Definir RegEx para tokens**. Patterns para #, [], (), {}, $, N/5, >.
- [x] **Step 2: Implementar `parseDSL(texto)`**. Devuelve objeto estructurado.
- [x] **Step 3: Implementar `highlightDSL(texto)`**. Genera HTML con spans coloreados.

### Task 2: DslEditor Component
**Files:** `src/portal-maestros/components/DslEditor.js`

- [x] **Step 1: Estructura ContentEditable**. Sincronización de texto y vista resaltada.
- [x] **Step 2: Gestión del Cursor (Caret)**. Lógica para mantener posición tras highlight.
- [x] **Step 3: Autocompletado Básico**. (InsertText API para toolbar/picker).

### Task 3: DslToolbar & AlumnoPicker
**Files:** `src/portal-maestros/components/DslToolbar.js`, `src/portal-maestros/components/AlumnoPickerModal.js`

- [x] **Step 1: Toolbar UI**. Botones para insertar tokens.
- [x] **Step 2: Modal de Selección**. AlumnoPickerModal para inserción de menciones.
- [x] **Step 3: Integración con Objetivos**. (> Token implementado).

### Task 4: Almacenamiento Atómico (Sync Logic)
**Files:** `src/portal-maestros/views/asistenciaView.js`

- [x] **Step 1: Lógica de Guardado**. Generación de `sesiones_clase` con logs parseados.
- [x] **Step 2: Generación de Tareas**. (Integrado en el objeto de sesión).
- [x] **Step 3: Atomicidad Offline**. Encolado de sesión completa en `offlineQueue`.

---

## Estrategia de Testing (Vitest)
- **Parser:** Testear exhaustivamente la RegEx con strings complejos, múltiples alumnos y tokens mezclados.
- **Highlight:** Verificar que `highlightDSL` no rompa caracteres especiales y genere los tags correctos.
- **Integración:** Validar que el objeto resultante del parser se transforme correctamente en el payload de la base de datos.

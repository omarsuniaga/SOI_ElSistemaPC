# Portal Maestros F2 — Asistencia Core — Implementation Plan

**Goal:** Implementar el flujo completo de toma de asistencia optimizado para "uso en campo", con soporte para estados P/A/J, controles masivos, justificaciones con imagen y persistencia offline-first automática.

**Tech Stack:** Vanilla JS, CSS Custom Properties, `offlineQueue.js` (F1), Supabase (Auth/DB).

---

## Mapa de archivos

| Acción | Archivo |
|---|---|
| Modificar | `src/main-maestros.js` (Rutas y eventos) |
| Crear | `src/portal-maestros/views/asistenciaView.js` |
| Crear | `src/portal-maestros/components/AsistenciaLista.js` |
| Crear | `src/portal-maestros/components/JustificacionModal.js` |
| Crear | `tests/portal-maestros/asistencia.test.js` |

---

## Tareas de Implementación

### Task 1: Componente AsistenciaLista (Cola UX)
**Files:** `src/portal-maestros/components/AsistenciaLista.js`

- [x] **Step 1: Implementar la lógica de "Cola UX"**. Al marcar un alumno, este se desplaza al final de la lista con una animación suave.
- [x] **Step 2: Estados Visuales**. Aplicar variables CSS dinámicas: `--pm-success` (P), `--pm-danger` (A), `--pm-pending` (J).
- [x] **Step 3: Barra de Progreso**. Implementar una barra superior que se llena proporcionalmente al total de alumnos marcados.

### Task 2: Vista AsistenciaView (Contenedor y Persistencia)
**Files:** `src/portal-maestros/views/asistenciaView.js`

- [x] **Step 1: Carga de Datos**. Obtener lista de alumnos inscritos en la clase y verificar si existe un borrador previo en `sesiones_clase`.
- [x] **Step 2: Auto-guardado (Debounce)**. Cada cambio en la asistencia dispara un guardado automático con `borrador: true` usando el `offlineQueue`.
- [x] **Step 3: Controles Bulk**. Botones "Todos P" y "Todos A" que operan sobre los alumnos no marcados aún.

### Task 4: JustificacionModal
**Files:** `src/portal-maestros/components/JustificacionModal.js`

- [x] **Step 1: Captura de Datos**. Formulario con `textarea` para el motivo y un `input type="file" accept="image/*"` para capturar la evidencia.
- [x] **Step 2: Integración**. Al guardar, actualiza el estado del alumno a 'J' y guarda localmente la referencia de la imagen (blob/base64 para offline).

### Task 4: Resolución de Conflictos y Guardado Final
- [x] **Step 1: Botón "Finalizar Sesión"**. Cambia `borrador: false` y dispara la sincronización forzada.
- [x] **Step 2: Conflict Resolution**. Antes de subir, comparar `updated_at`. Si el servidor tiene una versión más nueva, mostrar banner de advertencia al maestro.

---

## Estrategia de Testing (Vitest)
- **Unitarios:** Validar que la función de ordenamiento de la cola mueve correctamente a los alumnos marcados al final.
- **Integración:** Simular toma de asistencia offline y verificar que el `payload` generado para `offlineQueue` incluya todos los campos requeridos por `asistencia_sesion`.

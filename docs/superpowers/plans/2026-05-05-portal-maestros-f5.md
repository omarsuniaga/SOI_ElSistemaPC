# Portal Maestros F5 — Calendario Completo + Clases Especiales — Implementation Plan

**Goal:** Expandir las capacidades del calendario para permitir la gestión de sesiones pasadas, la creación de clases emergentes (eventuales) y el soporte inicial para co-docencia en modo lectura.

**Tech Stack:** Vanilla JS, CSS Custom Properties, `offlineQueue.js`, Supabase.

---

## Mapa de archivos

| Acción | Archivo |
|---|---|
| Modificar | `src/portal-maestros/views/calendarioView.js` (Eventos y drawer) |
| Crear | `src/portal-maestros/components/ClaseEmergente.js` |
| Crear | `src/portal-maestros/components/SustitucionModal.js` |
| Modificar | `src/main-maestros.js` (Nuevas rutas) |

---

## Tareas de Implementación

### Task 1: Drawer de Acciones por Fecha
**Files:** `src/portal-maestros/views/calendarioView.js`

- [x] **Step 1: Implementar Drawer Bottom**. Drawer animado con overlay y cierre al clickear fuera.
- [x] **Step 2: Acciones Contextuales**. Botones dinámicos para Hoy (Pasar Asistencia, Emergente) y Pasado (Ver Sesión).

### Task 2: Clases Emergentes (Eventuales)
**Files:** `src/portal-maestros/views/claseEmergenteView.js`

- [x] **Step 1: Modal de Creación**. Vista de formulario completa con fecha, motivo y nombre.
- [x] **Step 2: Guardado Offline**. Registro en `clases_emergentes` via `offlineQueue`.

### Task 3: Co-docencia (Lectura)
- [x] **Step 1: Identificar Clases como Auxiliar**. (Lógica integrada en las queries de Supabase).
- [x] **Step 2: Vista de Lectura**. (Soporte básico para ver estados en calendario).

---

## Estrategia de Testing (Vitest)
- **Integración:** Verificar que el drawer muestra las opciones correctas según la fecha seleccionada relativa a la fecha actual.
- **Funcional:** Validar que la creación de una clase emergente genera los registros correctos en la cola de sincronización.

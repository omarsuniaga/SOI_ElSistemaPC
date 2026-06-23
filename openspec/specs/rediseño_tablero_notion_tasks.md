# Plan de Trabajo (Tasks) - Rediseño de Tablero de Tareas de HERMES

Este documento contiene la lista detallada de tareas físicas requeridas para completar el rediseño.

## Tareas de Implementación

- [x] **sdd-init:** Detectar e inicializar el estado de SDD (Validado en openspec/config.yaml con `strict_tdd: true`).
- [x] **Task 1: Definición de Estilos CSS (Notion Board & Drawer)**
  * Actualizar la inyección de estilos `injectStyles()` en `tareasView.js` para dar soporte al grid del tablero, las tarjetas de tareas simplificadas y las animaciones de deslizamiento del Drawer y su backdrop.
- [x] **Task 2: Reestructuración del Framework HTML**
  * Modificar `renderFrame()` en `tareasView.js` para definir las 3 columnas de tareas (Pendientes, Programadas, Asignadas) más la columna de completadas lateral.
  * Añadir el marcado base para el Drawer (`#task-detail-drawer`) y su backdrop (`#task-drawer-backdrop`) al final del contenedor.
- [x] **Task 3: Lógica de Clasificación y Renderizado Compacto de Tarjetas**
  * Modificar `populateWorkspace()` para:
    * Filtrar las tareas del departamento activo.
    * Clasificar las tareas activas en los tres estados temporales (Pendientes, Programadas, Asignadas) y las completadas en el historial.
    * Renderizar tarjetas compactas (título, origen, vencimiento, progreso de checklist) y añadir event listeners en cada una para abrir el Drawer al hacer clic.
- [x] **Task 4: Implementación del Motor del Drawer (Evaluar y Decidir)**
  * Escribir las funciones `openDrawer(task)` y `closeDrawer()` en `tareasView.js`.
  * Diseñar la estructura dinámica de HTML dentro del drawer para mostrar la información completa, checklist interactivo y subida de documentos.
  * Conectar los botones del "Action Box":
    * **Iniciar Trabajo:** Cambia el estado a `en_progreso`.
    * **Completar Tarea:** Pasa el estado a `completada` y archiva.
    * **Bloquear Tarea:** Cambia el estado a `bloqueada` pidiendo comentarios.
    * **Reprogramar:** Cambia el vencimiento.
- [x] **Task 5: Pruebas y Validación Cruzada**
  * Validar en el modo Demo que las tareas se actualizan reactivamente al cambiar de columna usando el drawer.
  * Verificar que el portal `/caja` y `/inventario` continúan funcionando correctamente con el filtro de departamento heredado.

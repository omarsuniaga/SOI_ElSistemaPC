# Diseño Técnico: Rediseño de Tablero de Tareas de HERMES (Estilo Notion)

Este documento detalla la reestructuración arquitectónica y de interfaz de `tareasView.js`.

## 1. Cambios en la Interfaz (HTML/CSS)

### Layout General del Tablero (Bootstrap)
Reemplazaremos el contenedor de contenido actual por un grid de 12 columnas:
* **`col-md-9` (Tablero Activo):** Contendrá un grid interno de 3 columnas iguales (`col-md-4` cada una) para representar los estados operativos:
  1. **Pendientes (Inbox):** Color de cabecera gris/sutil.
  2. **Programadas:** Color de cabecera azul sutil.
  3. **Asignadas / En Progreso:** Color de cabecera amarillo/verde sutil.
* **`col-md-3` (Historial de Completadas):** Panel lateral derecho clásico para almacenar las tareas archivadas/completadas.

```html
<!-- Grid Principal -->
<div class="row g-4">
  <!-- Tablero Activo (3 Columnas) -->
  <div class="col-md-9">
    <div class="row g-3">
      <!-- Columna: Pendientes -->
      <div class="col-md-4">
        <div class="card shadow-sm border-0 p-3 h-100 notion-col" style="border-radius: 16px; background: var(--apple-canvas-subtle);">
          <h6 class="fw-bold mb-3 d-flex justify-content-between align-items-center text-muted">
            <span>📥 Pendientes (Inbox)</span>
            <span class="badge bg-secondary text-white" id="count-pending">0</span>
          </h6>
          <div class="d-flex flex-column gap-2" id="list-pending"></div>
        </div>
      </div>
      <!-- Columna: Programadas -->
      <div class="col-md-4">
        <div class="card shadow-sm border-0 p-3 h-100 notion-col" style="border-radius: 16px; background: var(--apple-canvas-subtle);">
          <h6 class="fw-bold mb-3 d-flex justify-content-between align-items-center text-primary">
            <span>📅 Programadas</span>
            <span class="badge bg-primary text-white" id="count-scheduled">0</span>
          </h6>
          <div class="d-flex flex-column gap-2" id="list-scheduled"></div>
        </div>
      </div>
      <!-- Columna: Asignadas / En Progreso -->
      <div class="col-md-4">
        <div class="card shadow-sm border-0 p-3 h-100 notion-col" style="border-radius: 16px; background: var(--apple-canvas-subtle);">
          <h6 class="fw-bold mb-3 d-flex justify-content-between align-items-center text-success">
            <span>⚡ Asignadas / En Progreso</span>
            <span class="badge bg-success text-white" id="count-assigned">0</span>
          </h6>
          <div class="d-flex flex-column gap-2" id="list-assigned"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Columna: Historial (Completadas) -->
  <div class="col-md-3">
    <div class="card shadow-sm border-0 p-3 h-100" style="border-radius: 16px; background: var(--apple-canvas);">
      <h6 class="fw-bold mb-3 d-flex justify-content-between align-items-center text-dark">
        <span>✅ Completadas</span>
        <span class="badge bg-dark text-white" id="count-completed">0</span>
      </h6>
      <div class="d-flex flex-column gap-2" id="completed-tasks-list"></div>
    </div>
  </div>
</div>
```

### Componente Drawer (Panel Lateral)
Se creará dinámicamente un Drawer fijo a la derecha para evaluar y decidir sobre la tarea seleccionada.

```css
/* Estilos para el Drawer de Notion */
.task-drawer {
  position: fixed;
  top: 0;
  right: -500px;
  width: 500px;
  height: 100vh;
  background: var(--apple-canvas);
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.15);
  z-index: 1050;
  transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--apple-hairline);
}
.task-drawer.open {
  right: 0;
}
.task-drawer-header {
  padding: 20px;
  border-bottom: 1px solid var(--apple-hairline);
}
.task-drawer-body {
  padding: 24px;
  overflow-y: auto;
  flex-grow: 1;
}
.task-drawer-footer {
  padding: 20px;
  border-top: 1px solid var(--apple-hairline);
  background: var(--apple-canvas-subtle);
}
.task-drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1040;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}
.task-drawer-backdrop.show {
  opacity: 1;
  visibility: visible;
}
```

## 2. Clasificación de Tareas (Lógica JS)
El estado de las tareas se clasificará en el cliente de la siguiente forma:

* **Hoy (Base de referencia):** `const todayStr = new Date().toISOString().split('T')[0];`
* **Filtro Departamental:** `const deptTasks = tasks.filter(t => t.departamento === activeDept);`
* **Clasificación:**
  * **Pendientes (Inbox):** `t.estado === 'pendiente' && (!t.fecha_vencimiento || t.fecha_vencimiento <= todayStr)`
  * **Programadas:** `t.estado === 'pendiente' && t.fecha_vencimiento > todayStr`
  * **Asignadas / En Progreso:** `t.estado === 'en_progreso' || t.estado === 'bloqueada'`
  * **Completadas:** `t.estado === 'completada'`

## 3. Acciones del Panel Lateral (Drawer)
Cuando una tarea es seleccionada, el drawer se poblará y gestionará los siguientes flujos de decisión rápidos:

1. **Botón "Iniciar Trabajo" (Mover a Asignadas):**
   * Disponible si `estado === 'pendiente'`.
   * Ejecuta: `actualizarTarea(task.id, { estado: 'en_progreso' })` y refresca el tablero.
2. **Botón "Completar Tarea":**
   * Disponible para cualquier tarea activa.
   * Ejecuta: `actualizarTarea(task.id, { estado: 'completada', feedback: textarea.value })`
3. **Botón "Marcar como Bloqueada":**
   * Disponible si `estado === 'en_progreso'`.
   * Pide un motivo de bloqueo y ejecuta: `actualizarTarea(task.id, { estado: 'bloqueada', feedback: 'BLOQUEADO: ' + motivo })`
4. **Selector de Reprogramación:**
   * Un control de fecha en el drawer que permite cambiar `fecha_vencimiento` mediante `actualizarTarea(task.id, { fecha_vencimiento: nuevaFecha })`.

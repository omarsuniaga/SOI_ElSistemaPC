# Especificación: Rediseño de Tablero de Tareas de HERMES (Estilo Notion)

## 1. Declaración del Problema
Actualmente, la vista de tareas de HERMES (`tareasView.js`) utiliza un diseño simple de dos columnas: una para tareas activas (mezclando tareas nuevas, programadas y en progreso) y otra para el historial de completadas. Las acciones de cada tarea (checklist, documentos, feedback y botones de acción) están expuestas directamente en la tarjeta de la tarea, lo que genera una interfaz visualmente saturada, difícil de leer y que no permite a los coordinadores departamentales evaluar y tomar decisiones rápidas.

## 2. Objetivos y Propuesta
Reestructurar la vista `tareasView.js` para transformarla en un tablero de control limpio inspirado en la interfaz de Notion. 

La solución se compone de dos partes clave:
1. **Un tablero de tres columnas lógicas para las tareas activas:**
   * **Pendientes (Inbox):** Tareas nuevas que requieren atención inmediata o asignación. (Estado `pendiente`, vencimiento hoy o vencido).
   * **Programadas:** Tareas planificadas a futuro. (Estado `pendiente`, vencimiento mayor a hoy).
   * **Asignadas / En Proceso:** Tareas en las que el equipo ya está trabajando. (Estado `en_progreso` o `bloqueada`).
   * *Nota:* Las tareas en estado `completada` se seguirán moviendo a la columna lateral de Historial de Completadas.
2. **Un Panel Lateral (Drawer) de Evaluación ("Evaluar y Decidir"):**
   * Al hacer clic en una tarjeta de tarea, se abrirá un panel lateral derecho deslizante (Drawer).
   * Este panel contendrá todos los detalles de la tarea, la lista de pasos del protocolo, la carga de documentos y el feedback.
   * Expondrá un "Action Box" con botones de acción ejecutiva: **"Iniciar Trabajo"**, **"Completar"**, **"Bloquear"** y **"Cambiar Fecha"**.

## 3. Criterios de Aceptación

### Criterio 1: Tablero de 3 Columnas (Notion Board)
* La sección de tareas activas debe estar dividida visualmente en tres columnas con un diseño minimalista y moderno.
* Cada columna debe mostrar su respectivo contador de tareas.
* Las tarjetas de tareas en las columnas deben ser ultracompactas, mostrando solo:
  * Título de la tarea.
  * Origen (evento de calendario).
  * Prioridad (con indicador de color a la izquierda).
  * Fecha de vencimiento y cuenta regresiva.
  * Porcentaje de progreso de la checklist (barra de progreso simplificada).
* Al hacer clic en una tarjeta, se debe activar la tarea seleccionada y abrir el Panel Lateral.

### Criterio 2: Panel Lateral (Drawer) de Decisión y Evaluación
* Se debe implementar un panel lateral (`.task-drawer`) que aparezca desde el lateral derecho de la pantalla con una animación suave de transición.
* Debe ser colapsable mediante un botón de cerrar (`X`) o haciendo clic fuera del drawer.
* El Drawer debe renderizar dinámicamente la información completa de la tarea seleccionada:
  * **Cabecera:** Título, prioridad, fecha de vencimiento y origen del evento.
  * **Cuerpo:** Descripción completa, checklist del protocolo interactivo (donde cada paso cicla de estado entre Pendiente, En Progreso e Listo al hacer clic).
  * **Documentos:** Listado de archivos adjuntos con opción de descarga, botón para subir archivos y botón para desvincular documentos.
  * **Reporte y Notas:** Caja de texto para guardar avances o notas.
  * **Barra de Acciones Ejecutivas (Action Box):**
    * Botón **"Iniciar Trabajo"** (solo si está en estado `pendiente`). Cambia el estado a `en_progreso` y traslada la tarea a la columna "Asignadas".
    * Botón **"Completar Tarea"** (pasa el estado a `completada` y cierra/mueve al historial).
    * Botón **"Marcar como Bloqueada"** (pasa el estado a `bloqueada`).
    * Botón **"Guardar Reporte"** (para guardar el texto de la caja de comentarios).

### Criterio 3: Integración Transversal y Consistencia
* La vista debe seguir respetando las propiedades del objeto `options` (como `options.departamento` para filtrar por área, lo que mantendrá la compatibilidad con los portales de `/caja` y `/inventario` de inmediato).
* Se debe respetar la regla de veto de saturación (`AGT-P09`): si hay 6 o más tareas activas en el departamento, se debe renderizar el banner de advertencia arriba del tablero.
* El diseño debe ser responsive y amigable en dispositivos móviles y de escritorio.
* Se debe implementar en modo Demo (Mock) y en modo Supabase real utilizando el `hermesApi.js`.

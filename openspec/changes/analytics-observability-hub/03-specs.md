# 03. Especificaciones Técnicas: Observability & Analytics Hub

Este documento define las especificaciones técnicas funcionales y no funcionales para la unificación y robustecimiento de la suite de analítica y observabilidad en el Portal Administrador de **sistema-academico-pwa**.

---

## 🎯 1. Requerimientos Funcionales (Casos de Uso)

La suite de Observabilidad y Analítica se compone de cinco áreas funcionales unificadas bajo un único contenedor de vistas dinámicas:

### 📊 UC-1: Hub Analítico Centralizado
*   **Descripción:** Unificar las vistas fragmentadas del Portal Admin bajo una sola pantalla interactiva estructurada en pestañas persistentes.
*   **Pestañas Requeridas:**
    1.  `resumen`: Resumen ejecutivo con KPIs unificados (Radar de Alumnos, Tasa de Asistencia Hoy, Alertas Críticas de maestros).
    2.  `operaciones`: Cruces de rendimiento pedagógico y demoras docentes (Widgets importados de `admin-dashboard` y comportamiento de llenado).
    3.  `logs`: Monitor de excepciones del cliente, errores de red y estado offline de la PWA.
    4.  `auditoria`: Visualizador interactivo del historial transaccional de seguridad (`ausencias_auditoria`).
    5.  `ia`: SOI Intelligence (motor narrativo de reportes asistido por IA).

### 🖥️ UC-2: Integración de Métricas del Personal
*   **Descripción:** Integrar el widget de Cumplimiento de Maestros (`CumplimientoMaestrosWidget.js`) y la analítica de llenado en la pestaña `operaciones` del hub.
*   **Criterio de Aceptación:** Los filtros dinámicos por categoría docente ('responsable', 'negligente') y retraso acumulado deben funcionar de forma reactiva sin recargar la página.

### 🔌 UC-3: Centro de Logging de Cliente (PWA)
*   **Descripción:** Consola interactiva para depuración y monitoreo técnico de la PWA.
*   **Campos de Log:** Marca de tiempo (Timestamp), Nivel (INFO, WARNING, ERROR), Módulo de origen, Mensaje de error, Estado de red (Online/Offline), y Detalles del Stack Trace.
*   **Comportamiento:** Los errores técnicos generados en cualquier parte del sistema deben capturarse y registrarse en esta consola para que el administrador pueda auditar fallas del RLS de Supabase o fallas de red.

### ☁️ UC-4: Monitor de Sincronización Offline
*   **Descripción:** Indicar de forma visual si la aplicación del cliente (o dispositivos sincronizados) tiene transacciones pendientes de sincronización en su storage local (IndexedDB/LocalStorage).
*   **Micro-animaciones:** Ícono de sincronización que cambia de color y pulsa dinámicamente cuando el estado de red cambia o hay colas de datos pendientes.

### 🛡️ UC-5: Audit Trail (Trazabilidad de Seguridad)
*   **Descripción:** Renderizar una tabla tabular premium que exponga los logs de la tabla `ausencias_auditoria`.
*   **Filtros Requeridos:** Rango de fechas, usuario responsable, y tipo de acción (creación, revisión, aprobación final).

### 🤖 UC-6: SOI Intelligence IA
*   **Descripción:** Generador de reportes narrativos dinámicos a través de la integración de Groq.
*   **Criterio de Inferencia:** La IA debe utilizar el payload resumido (DSL JSON) pre-procesado para evitar alucinaciones matemáticas y garantizar una generación rápida (menos de 3 segundos).

---

## ⚙️ 2. Requerimientos No Funcionales & Restricciones

*   **Rendimiento:** Las consultas SQL pesadas de auditoría o cruce de datos deben limitarse a un paginado estricto de máximo 50 registros por página.
*   **Seguridad (RLS):** Las pestañas de logs técnicos (`logs`) y auditoría transaccional (`auditoria`) solo deben ser accesibles y visibles para usuarios autenticados con rol de `admin`.
*   **Modo Demo (Mock First):** Todas las nuevas funcionalidades (excepciones de logs, datos de auditoría cruzados) deben operar en Modo Demo cuando `config.isDemoMode` esté activo, utilizando generadores de datos aleatorios realistas.
*   **Tolerancia a Fallos (Resiliencia):** Si una llamada a Supabase falla o la red está caída, la suite de analítica no debe romperse ni quedar en blanco; debe mostrar un estado amigable de fallback con datos cacheados localmente.

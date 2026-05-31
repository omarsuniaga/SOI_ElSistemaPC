# 05. Plan de Trabajo & Desglose de Tareas: Analytics Hub

Este documento define la descomposición de tareas detallada en batches manejables y estimaciones de peso, diseñadas para no superar el límite de **400 líneas de código modificadas por PR** (siguiendo las directivas de `chained-pr` y `work-unit-commits`).

---

## 📅 1. Estimación del Review Workload Forecast

*   **Líneas Estimadas Totales:** ~350-480 líneas de código (repartidas en múltiples archivos).
*   **Recomendación de Chained PRs:** **Sí** (Se divide la entrega en 3 Slices autocontenidos y funcionales para asegurar revisiones enfocadas de ≤30 minutos cada una).
*   **Estrategia de Entrega:** **Stacked PRs** a la rama principal (o commits por unidad de trabajo atómica).

---

## 🛠️ 2. Desglose de Slices de Entrega

### 📦 Slice 1: Fundación del Hub, DataAdapter & Limpieza de Rutas
> **Objetivo:** Sentar las bases del hub, estructurar la navegación de pestañas y crear la API de observabilidad con sus mocks de demo.

*   [ ] **Tarea 1.1: DataAdapter de Observabilidad**
    *   *Archivos:* `src/modules/metricas/api/observabilidadApi.js`, `src/modules/metricas/api/observabilidadMock.js`, `src/modules/metricas/api/observabilidadSupabase.js`
    *   *Descripción:* Implementar el patrón `DataAdapter`. El Mock generará datos realistas de Core Web Vitals de la PWA, excepciones técnicas del cliente y registros de auditoría para el modo Demo.
    *   *Complejidad:* Media
*   [ ] **Tarea 1.2: Rediseño del Orquestador de la Vista**
    *   *Archivos:* `src/modules/metricas/views/dashboardMetricasView.js`
    *   *Descripción:* Rediseñar el componente para dar soporte a la barra de 5 pestañas persistentes (`resumen`, `operaciones`, `logs`, `auditoria`, `ia`) y los handlers de navegación reactivos sin destrucción de estado.
    *   *Complejidad:* Media
*   [ ] **Tarea 1.3: Limpieza del Menú Lateral y Rutas**
    *   *Archivos:* `src/main.js`, `src/modules/metricas/metricas.router.js`
    *   *Descripción:* Limpiar el menú de Análisis en `main.js` para que apunte al Hub de Métricas Centralizado y limpiar el enrutador de métricas.
    *   *Complejidad:* Baja

---

### 📦 Slice 2: Widgets Técnicos, Operativos & Audit Trail
> **Objetivo:** Desarrollar los visualizadores avanzados de logs de sistema, monitor de sincronización offline, widgets de cumplimiento de maestros, e historial de transacciones.

*   [ ] **Tarea 2.1: Widget de Logs del Sistema & Monitor Offline**
    *   *Archivos:* `src/modules/metricas/views/systemLogsWidget.js`
    *   *Descripción:* Crear la consola terminal premium para mostrar excepciones del cliente con filtros rápidos por severidad (INFO, WARN, ERR) y un indicador visual palpitante del estado offline de la PWA.
    *   *Complejidad:* Alta
*   [ ] **Tarea 2.2: Widget de Trazabilidad de Auditoría (Audit Trail)**
    *   *Archivos:* `src/modules/metricas/views/auditTrailWidget.js`
    *   *Descripción:* Desarrollar la tabla tabular premium para renderizar el log de la tabla `ausencias_auditoria` con filtros reactivos por usuario y acción.
    *   *Complejidad:* Media
*   [ ] **Tarea 2.3: Integración de Widgets del Personal (Cumplimiento)**
    *   *Archivos:* `src/modules/metricas/views/dashboardMetricasView.js`
    *   *Descripción:* Importar e integrar el `CumplimientoMaestrosWidget` y las analíticas de velocidad de llenado en la pestaña `operaciones` del Hub.
    *   *Complejidad:* Baja

---

### 📦 Slice 3: Optimización del Motor de IA & Control de Calidad
> **Objetivo:** Implementar el pipeline del Payload DSL, la inferencia narrativa con Groq libre de alucinaciones y la verificación final de tests.

*   [ ] **Tarea 3.1: Pipeline de Pre-procesamiento de Payload DSL**
    *   *Archivos:* `src/modules/metricas/views/iaReporteGeneradorView.js`
    *   *Descripción:* Escribir el procesador local que compila las métricas agregadas del Radar, dificultades de nodos y rendimiento docente en un JSON estructurado de menos de 20 líneas.
    *   *Complejidad:* Media
*   [ ] **Tarea 3.2: Escribir Prompt del Sistema & Inferencia Narrativa**
    *   *Archivos:* `src/modules/metricas/views/iaReporteGeneradorView.js`
    *   *Descripción:* Ajustar el prompt de sistema para Groq y refinar la interfaz del reporte narrativo Markdown con tipografías y espaciados premium.
    *   *Complejidad:* Media
*   [ ] **Tarea 3.3: Pruebas de Calidad, Lints y Cobertura**
    *   *Archivos:* `tests/`
    *   *Descripción:* Correr linter, formateador Prettier y ejecutar la suite de pruebas unitarias/integración para garantizar que no haya regresiones.
    *   *Complejidad:* Baja

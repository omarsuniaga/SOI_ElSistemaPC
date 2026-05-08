# Rúbrica de Evaluación — Orquestador Claude

## Criterios por agente (cada ítem vale 1 punto / máx 10)

### OBLIGATORIOS (bloquean aprobación si fallan)
- [ ] Los archivos existen en las rutas exactas especificadas
- [ ] Los imports usan rutas correctas relativas al archivo
- [ ] Las funciones exportadas tienen los nombres exactos del prompt
- [ ] No modifica archivos existentes (metricsApi.js, router.js, main.js, etc.)
- [ ] Cada vista maneja los 3 estados: loading / error / empty

### CALIDAD (suman al score)
- [ ] Tests implementados con runTests() ejecutable
- [ ] Todos los tests pasan sin errores en consola
- [ ] Los eventos custom 'navigate:alumno' y 'navigate:observaciones' están implementados
- [ ] El filtrado funciona sin recargar datos desde la API
- [ ] El código no tiene console.error sin capturar

## Escala de aprobación
- 10/10 → ✅ APROBADO — merge directo
- 8-9/10 → ⚠️ APROBADO CON OBSERVACIONES — correcciones menores
- < 8/10  → ❌ RECHAZADO — devolver con feedback específico

## Checklist por agente

### GEMINI
Archivos esperados:
  src/modules/metricas/utils/metricsUtils.js
  src/modules/metricas/utils/metricsUtils.test.js
  src/modules/metricas/components/kpiCard.js
  src/modules/metricas/views/dashboardMetricasView.js
  src/modules/periodos/api/periodosApi.js
  src/modules/periodos/views/periodosView.js

Funciones clave a verificar:
  formatScore(87) === '87/100'
  formatTasa(95) contiene '%'
  createKpiCard({...}) retorna string HTML
  renderDashboardMetricasView es función async exportada
  renderPeriodosView es función async exportada

### KIMI
Archivos esperados:
  src/modules/metricas/components/alertaBadge.js
  src/modules/metricas/components/alertaBadge.test.js
  src/modules/metricas/views/alertasView.js
  src/modules/metricas/views/destacadosView.js

Funciones clave a verificar:
  createAlertaBadge('rojo') contiene 'danger'
  createAlertaIcon('caida_calificacion') === '📉'
  renderAlertasView es función async exportada
  renderDestacadosView es función async exportada
  El auto-refresh de 5 minutos está implementado

### ANTIGRAVITY
Archivos esperados:
  src/modules/metricas/components/riesgoIndicador.js
  src/modules/metricas/components/riesgoIndicador.test.js
  src/modules/metricas/views/riesgoAbandonoView.js
  src/modules/metricas/views/rendimientoMaestrosView.js

Funciones clave a verificar:
  createRiesgoBar(20) contiene 'bg-success'
  createRiesgoBar(75) contiene 'bg-danger'
  renderRiesgoAbandonoView es función async exportada
  renderRendimientoMaestrosView es función async exportada
  El botón "Exportar CSV" está implementado

### CLAUDE (auto-evaluación)
Archivos entregados:
  ✅ src/modules/metricas/views/patronAsistenciaView.js
  ✅ src/modules/metricas/metricas.router.js
  ✅ src/modules/metricas/index.js
  ✅ main.js — módulo metricas y periodos registrados
  ✅ 7 vistas DB verificadas (todas responden)
  ✅ 3 funciones RPC verificadas

Pendiente:
  - Evaluar diagnósticos de Gemini, Kimi y Antigravity
  - Ejecutar integración final una vez que todos los archivos estén presentes

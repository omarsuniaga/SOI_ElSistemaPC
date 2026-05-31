# 04. Diseño de Software: Observability & Analytics Hub

Este documento detalla el diseño técnico, la estructura de archivos, contratos de API, el patrón de datos `DataAdapter` y el diseño de la UI para el nuevo módulo unificado.

---

## 📂 1. Nueva Estructura de Archivos del Módulo `metricas`

La estructura modular autocontenida de `metricas` se reorganiza de la siguiente manera:

```
src/modules/metricas/
├── api/
│   ├── metricasApi.js            # Router de API (DataAdapter existente)
│   ├── metricasMock.js           # Mock académico existente
│   ├── metricsApi.js             # Supabase académico existente
│   ├── observabilidadApi.js      # NUEVO: Router DataAdapter para Logs y Auditoría
│   ├── observabilidadMock.js     # NUEVO: Mocks realistas para logs y auditorías
│   └── observabilidadSupabase.js # NUEVO: Implementación Supabase RLS para logs y auditorías
├── components/
│   └── MetricCard.js             # Tarjeta métrica premium (existente)
├── views/
│   ├── auditTrailWidget.js       # NUEVO: Visualizador de ausencias_auditoria
│   ├── dashboardMetricasView.js  # MODIFICADO: Orquestador Hub (5 pestañas)
│   ├── iaReporteGeneradorView.js # MODIFICADO: Generación optimizada con Payload DSL
│   └── systemLogsWidget.js       # NUEVO: Consola de logs y sincronización offline
└── metricas.router.js            # MODIFICADO: Rutas centralizadas y limpias
```

---

## 🔄 2. DataAdapter Pattern: Contrato de Observabilidad

Diseñamos el contrato para el nuevo servicio de datos en `src/modules/metricas/api/observabilidadApi.js`.

```javascript
// Contrato de Servicios de Observabilidad y Logs
import { config } from '../../../core/config/config.js'
import * as supabaseImpl from './observabilidadSupabase.js'
import * as mockImpl from './observabilidadMock.js'

const getApi = () => config.isDemoMode ? mockImpl : supabaseImpl

/**
 * Obtiene los logs de excepciones técnicas del cliente
 * @returns {Promise<Array<{timestamp: string, level: string, message: string, module: string, network: string}>>}
 */
export const getSystemLogs = (...args) => getApi().getSystemLogs(...args)

/**
 * Obtiene el trail de auditorías transaccionales del sistema (ausencias_auditoria)
 * @returns {Promise<Array<{id: string, accion: string, usuario_id: string, creado_a: string, detalles: object}>>}
 */
export const getAuditLogs = (...args) => getApi().getAuditLogs(...args)

/**
 * Registra una excepción técnica ocurrida en el cliente (para auditoría offline)
 * @param {object} logEntry
 */
export const recordSystemLog = (...args) => getApi().recordSystemLog(...args)
```

---

## 🖥️ 3. Rediseño del Orquestador: `dashboardMetricasView.js`

El componente principal se convertirá en una máquina de estado simple que maneja la navegación reactiva entre las 5 pestañas sin destruir la sesión de datos.

```javascript
const state = {
  activeTab: localStorage.getItem('pm_metrics_tab') || 'resumen',
  stats: null,
  alertas: [],
  cargando: false,
  container: null
}

export async function renderDashboardMetricasView(container) {
  state.container = container
  state.cargando = true
  renderLoading(container)
  
  // Cargar estadísticas globales e inicializar estado
  state.stats = await getEstadisticasPeriodoActivo()
  state.cargando = false
  
  renderContent(container)
  _attachEvents(container)
}
```

### 🎨 Estética Premium de las Nuevas Pestañas:
*   **Pestaña de Logs (`systemLogsWidget.js`):** Renderizará una consola terminal con tipografía monoespaciada (`JetBrains Mono` o `Courier New`), colores HSL vibrantes según severidad, y botones de filtro rápido (*INFO*, *WARN*, *ERR*).
*   **Monitor Offline:** Un ícono de red dinámico en el encabezado. Si `navigator.onLine` es falso, mostrará una insignia naranja con el lema *"Trabajando en modo Offline — logs encolados localmente"*.

---

## 🤖 4. Integración de IA Narrativa (Payload DSL)

El generador de reportes en `iaReporteGeneradorView.js` se modificará para pre-procesar los datos y construir un payload DSL estructurado antes de llamar a `callGroq`:

```javascript
/**
 * Construye el payload DSL unificado con los datos agregados
 */
function buildAnalyticsDSLPayload(radarData, nodeDifficulty, complianceData) {
  return {
    timestamp: new Date().toISOString(),
    resumen: {
      total_alumnos: radarData.length,
      alumnos_estancados: radarData.filter(s => s.health_status === 'stagnant').length,
    },
    hotspots: nodeDifficulty.slice(0, 3).map(n => ({
      nodo: n.node_name,
      tasa_fallo: n.failure_percentage
    })),
    docentes_criticos: complianceData.filter(d => d.categoria === 'negligente').map(d => ({
      nombre: d.nombre,
      atrasos: d.sesiones_rojo
    }))
  }
}
```

El prompt del sistema de IA se ajustará rígidamente:
```
Actúas como el Auditor de Inteligencia Académica Senior de la institución. 
Se te proveerá un Payload DSL en formato JSON con métricas pre-calculadas y consistentes.
Tu única tarea es analizar los datos y redactar un informe ejecutivo (en markdown limpio con tipografía y espaciados premium) enfocado en:
1. Resumen ejecutivo de la salud escolar (3 frases).
2. Diagnóstico de los 2 hotspots pedagógicos más críticos.
3. Plan de acción recomendado (máximo 3 bullets accionables).

REGLA CRÍTICA: No inventes números, no asumas porcentajes que no estén en el JSON, y sé sumamente conciso.
```

# 02. Propuesta Formal: Suite de Observabilidad y Analítica Centralizada

> [!IMPORTANT]
> **Enfoque de Mínimo Impacto, Máxima Cohesión:** En lugar de crear un módulo nuevo desde cero que fragmente aún más la aplicación, robusteceremos el **`Analytics Hub`** existente en `src/modules/metricas`, convirtiéndolo en el único centro unificado de control. Importaremos y adaptaremos los widgets de `admin-dashboard` para que funcionen bajo una sola estructura de pestañas y API.

---

## 🏛️ 1. Arquitectura de Módulos Modificados y Creados

Para implementar la convergencia respetando las reglas de gobernanza del proyecto (`AGENTS.md`), realizaremos las siguientes acciones sobre el codebase:

### 🆕 A. Nuevos Servicios y Vistas (Modo Demo & Supabase)
*   **`src/modules/metricas/api/observabilidadApi.js`**: Nuevo servicio que implementa el patrón `DataAdapter` para obtener logs de error del sistema y registros de auditoría.
*   **`src/modules/metricas/api/observabilidadMock.js`**: Implementación de Mocks JSON con datos de logs de red, Core Web Vitals de la PWA y transacciones de auditoría para el modo Demo.
*   **`src/modules/metricas/views/systemLogsWidget.js`**: Widget responsivo y premium que renderiza los logs de excepciones de JavaScript, errores de red y el estado de sincronización offline de la PWA.
*   **`src/modules/metricas/views/auditTrailWidget.js`**: Widget interactivo que expone la tabla de auditoría `ausencias_auditoria` con filtros avanzados por usuario, acción y fecha.

### 🛠️ B. Archivos Modificados para la Integración
*   **`src/modules/metricas/metricas.router.js`**: Registro de las nuevas subvistas y pestañas dentro del router del hub.
*   **`src/modules/metricas/views/dashboardMetricasView.js`**: Rediseño del orquestador del Hub. Añadiremos soporte para las 5 pestañas de observabilidad cruzada e integraremos los widgets operativos de cumplimiento docente.
*   **`src/main.js`**: Limpieza del menú lateral "Análisis" para redirigir todo el tráfico analítico al Hub Centralizado, reduciendo la fatiga de navegación.

---

## 🧭 2. El Plan de Cruce y Flujo de Datos (Payload DSL)

Implementaremos la correlación de datos en el frontend mediante un procesador local, y expondremos el motor de IA con un flujo determinista:

```
[Base de Datos: Supabase / Mock]
       │
       ▼ (Consultas Optimizadas)
[observabilidadApi.js (DataAdapter)]
       │
       ▼ (Payload DSL Compacto)
┌──────────────────────────────────────┐
│  • Alumnos stagnant: 12             │
│  • Maestros negligentes: carlos_g    │
│  • Hotspots: Violín (90% fallo)      │
└──────────────────┬───────────────────┘
                   │
                   ├──────────────────────────┐
                   ▼ (Renderizado Tablas)     ▼ ( callGroq )
             [Widgets de UI]           [SOI Intelligence IA]
             - Gráficos de barra       - Reporte narrativo
             - Consola de logs         - Plan de acción sugerido
```

---

## 🎨 3. Diseño de la Interfaz Visual (Premium UI)

Siguiendo las directrices de **Diseño Estético Premium**, la interfaz presentará:
1.  **Glassmorphism en los Logs:** La consola de errores técnicos del sistema tendrá un fondo traslúcido (`backdrop-filter: blur()`) con colores HSL armoniosos según la gravedad del log:
    *   `INFO`: Azul suave (`#3b82f6` / `hsl(217, 91%, 60%)`)
    *   `WARNING`: Ámbar sofisticado (`#f59e0b` / `hsl(38, 92%, 50%)`)
    *   `ERROR/CRITICAL`: Rojo carmesí (`#ef4444` / `hsl(0, 84%, 60%)`)
2.  **Micro-animaciones de Sincronización:** El indicador de sincronización offline de la PWA tendrá un ícono de nube animado (`animate-pulse`) que palpita suavemente cuando detecte datos pendientes en el storage local.
3.  **Filtros Dinámicos sin Recarga de Página:** Todas las pestañas de logs y auditorías utilizarán transiciones CSS fluidas al aplicar filtros.

---

## 🛡️ 4. Análisis de Tradeoffs

| Decisión Arquitectónica | Ventajas | Desventajas / Riesgos | Mitigación |
| :--- | :--- | :--- | :--- |
| **Unificar todo en el módulo `metricas`** | Reduce la duplicidad de código, centraliza el estado en un solo view-model y mejora la mantenibilidad de rutas. | El archivo `dashboardMetricasView.js` puede crecer en tamaño de líneas de código. | Separaremos los componentes en módulos autocontenidos (`systemLogsWidget.js`, `auditTrailWidget.js`) importándolos dinámicamente. |
| **Logging local en IndexedDB** | Permite auditoría técnica 100% offline, crucial para una PWA. No satura de tráfico la API de Supabase. | Los logs técnicos se perderán si el usuario borra la caché del navegador antes de sincronizar. | Implementaremos un trigger automático de sincronización en background en cuanto la red pase a estado `online`. |

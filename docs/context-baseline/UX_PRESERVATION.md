# UX PRESERVATION PACK — Inventario y Criterios de Preservación de Interfaz

> **Proyecto:** `sistema-academico-pwa` (SOI — El Sistema Punta Cana)  
> **Fecha:** 10 sep 2026  
> **Premisa Clave:** Portal Maestros es la interfaz con mayor frecuencia de uso y adopción real (2.812 asistencias registradas). Romper o alterar drásticamente la ergonomía del maestro destruiría la operación diaria.

---

## 1. Clasificación de Decisiones de Interfaz

- **`PRESERVE`**: La pantalla funciona con alta ergonomía y adopción comprobada. Mantener intacta la interacción y layout en SOI 2.0.
- **`PRESERVE_AND_IMPROVE`**: La pantalla es esencial pero tiene fricciones identificadas (feedback visual, tiempos de carga, verificación de mutación C1). Conservar estructura mejorando robustez.
- **`REDESIGN`**: La pantalla no cumple su propósito operativo, es confusa o representa un cuello de botella arquitectónico.
- **`DEPRECATE`**: Interfaz experimental, sin uso comprobado o sustituida por flujos consolidados.

---

## 2. Inventario de Flujos Reales e Interfaces

| SCREEN | USER | PURPOSE | CURRENT STEPS | FREQUENCY | BACKEND DEPENDENCIES | PAIN POINTS | RECOMMENDATION |
|---|---|---|---|---|---|---|---|
| **Home del Maestro (`#hoy`)** | Maestros | Panorama del día, clases asignadas y accesos directos | 1. Login -> 2. Vista de tarjetas de clases con horario y salón -> 3. Botón directo a Asistencia | Diaria (Alta) | `clases`, `sesiones_clase`, `salones` | Falta indicador visual de qué clases ya fueron cerradas y cuáles están pendientes | `PRESERVE_AND_IMPROVE` |
| **Toma de Asistencia (`#asistencia`)** | Maestros | Marcar P/A/J de alumnos, justificaciones y tema visto | 1. Clic en clase -> 2. Lista de alumnos -> 3. Toggle Presente/Ausente/Justificado -> 4. Guardar | Diaria (Crítica) | `asistencias`, `sesiones_clase`, `justificaciones`, `fn_marcar_asistencia` | En conexiones lentas el guardado no daba feedback transaccional inmediato (C1) | `PRESERVE` |
| **Mis Clases / Horarios (`#mis-clases`)** | Maestros | Consultar horarios semanales y alumnos inscritos | 1. Menú lateral -> 2. Mis Clases -> 3. Clic en acordeón de cátedra | Semanal | `clases`, `clase_horarios`, `alumnos_clases` | El cálculo de cupos y cruces de salón debe sincronizarse con horario general | `PRESERVE` |
| **Ficha 360 del Alumno (`#alumno`)** | Maestros / Coord | Ver historial pedagógico, asistencias y datos de emergencia | 1. Búsqueda en lista -> 2. Clic en ficha -> 3. Tabs (Asistencia, Evaluaciones, Datos) | Frecuente | `alumnos`, `fn_alumno_ficha_360`, `progresos` | Datos médicos/contacto a veces incompletos por falta de validación en admisión | `PRESERVE_AND_IMPROVE` |
| **Diseñador Curricular (`#planificacion-disenador`)** | Maestros / ACM | Estructuración de objetivos e indicadores por nivel | 1. Cátedra -> 2. Nivel -> 3. Añadir Unidad/Objetivo -> 4. Guardar árbol | Mensual | `indicators`, `nodes`, `fn_sincronizar_arbol_curricular` | Curva de aprendizaje empinada; 4.163 indicadores pero pocos intentos de evaluación | `PRESERVE_AND_IMPROVE` |
| **Solicitudes de Ausencia / Permiso** | Maestros | Solicitar permiso laboral con fecha y suplente sugerido | 1. Perfil -> 2. Solicitar permiso -> 3. Fecha y motivo -> 4. Enviar | Ocasional | `ausencias_maestros`, `solicitudes_permisos` | Notificación al coordinador a veces tardía | `PRESERVE` |
| **Torre de Control Académico (`#acm`)** | Coord Académica | Monitoreo global de clases, asistencias y semáforo ausentes | 1. Entrar a acm.html -> 2. Dashboard ausentismo -> 3. Casos críticos | Diaria | `vw_alertas_activas`, `vw_destacados_y_riesgo_academico` | Dashboard recientemente rediseñado (AUS1d), visualmente potente | `PRESERVE` |
| **Padrón de Alumnos y Fusión (`#alumnos`)** | Administración | Gestión de estudiantes y resolución de duplicados | 1. Listado alumnos -> 2. Filtrar -> 3. Detector de duplicados -> 4. Fusión atómica | Semanal | `alumnos`, `familias`, `fn_fusionar_alumnos_duplicados` | Excelente flujo atómico de deduplicación; debe protegerse | `PRESERVE` |
| **Registro de Cobro FIFO (`#finanzas-registro`)** | Finanzas / Caja | Cobro de cuotas familiares e imputación a más antiguas | 1. Buscar familia -> 2. Ver cuotas vencidas -> 3. Registrar monto -> 4. FIFO transaccional | Frecuente | `cuotas`, `pagos`, `fn_registrar_pago_transaccional` | Solo 2 pagos reales en BD: el flujo técnico existe pero falta adopción operativa | `PRESERVE_AND_IMPROVE` |
| **Control de Stock y Comodatos (`#inventario`)** | Lutería / Inventario | Asignación de instrumentos a alumnos con contrato | 1. Seleccionar activo -> 2. Alumno -> 3. Fechas -> 4. Generar contrato PDF | Frecuente | `inventario_activos`, `comodatos_activos`, `generar_contrato_pdf` | Conciliar desfase entre activos inventariados (324) y comodatos vigentes | `PRESERVE_AND_IMPROVE` |
| **Taller de Lutería (`#luteria-ordenes`)** | Lutier | Ingreso de instrumento dañado, diagnóstico y costeo | 1. Crear orden -> 2. Diagnóstico -> 3. Insumos -> 4. Estado reparación | Frecuente | `lut_ordenes_reparacion`, `fn_lut_upsert_diagnostico` | Solo 1 orden en BD; interfaz completa pero subutilizada | `PRESERVE_AND_IMPROVE` |
| **Casos y Procedimientos Hermes (`#hermes-procedimientos`)** | Dirección | Monitoreo de casos multi-departamentales abiertos | 1. Ver lista de casos -> 2. Detalle de tareas -> 3. Cerrar caso con evidencia | Diaria | `hermes_process_cases`, `fn_hermes_close_process_case` | Brecha B: 1.971 eventos detectados pero 0 acciones/cierres registrados | `PRESERVE_AND_IMPROVE` |

---

## 3. Protocolo de Captura de Pantalla Manual (Checklist)

Para documentar visualmente el estado previo a SOI 2.0 sin alterar la base de datos de producción:
- [ ] **Captura 1:** `index.html#hoy` (Feed de clases del día del maestro)
- [ ] **Captura 2:** `index.html#asistencia?clase=[id]` (Cuadrícula de toma de asistencia)
- [ ] **Captura 3:** `index.html#mis-clases` (Listado y acordeón de cátedras asignadas)
- [ ] **Captura 4:** `index.html#alumno?id=[id]` (Ficha 360 integral del alumno)
- [ ] **Captura 5:** `acm.html#pedagogico-dashboard` (Dashboard de ausentismo y alumnos en riesgo)
- [ ] **Captura 6:** `adm.html#alumnos` (Padrón administrativo con buscador y filtros)
- [ ] **Captura 7:** `adm.html#alumnos-duplicados` (Herramienta de comparación y fusión)
- [ ] **Captura 8:** `fin.html#finanzas-registro` (Cobro de cuotas FIFO)
- [ ] **Captura 9:** `inventario.html#inventario-comodatos` (Matriz de comodatos activos)
- [ ] **Captura 10:** `luteria.html#luteria-ordenes` (Taller de lutería y diagnóstico técnico)

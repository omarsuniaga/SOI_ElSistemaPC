# Master Specification & Architecture Plan: Portal ADM Streamlining & Academic Reports

## 1. Visión y Propósito Ejecutivo
Este documento constituye el **plan maestro técnico y de arquitectura** para la reestructuración del **Portal de Administración (ADM)** del Sistema Operativo Institucional (SOI) y la integración de los **Reportes Académicos Ejecutivos** (Mensual y Semestral).

El objetivo es preparar el portal para la demostración ejecutiva (Romina y directivos), eliminando la sobrecarga cognitiva de submódulos técnicos y enfocando la plataforma en la toma de decisiones basada en datos reales.

---

## 2. Arquitectura de Navegación Simplificada (`src/portales/adm/adm.js`)

Se reduce la estructura de 23 ítems a **14 módulos estratégicos** organizados en 5 categorías de valor:

```text
📁 PERSONAS (bi-people)
  ├── 👤 Alumnos (id: 'alumnos')
  ├── 🎓 Maestros (id: 'maestros')
  └── 📝 Postulados (id: 'postulados')

📁 OPERACIÓN (bi-clipboard-data)
  ├── 📅 Clases de Hoy (id: 'clases-hoy') [Ruta por Defecto]
  ├── 🗓️ Período Académico (id: 'periodos')
  └── 📊 Cumplimiento de Maestros (id: 'admin-dashboard')

📁 BANDEJA (bi-inbox) [Anteriormente 'Hermes']
  ├── 📋 Tareas Institucionales (id: 'hermes-tareas')
  └── 🔍 Seguimiento de Tareas (id: 'seguimiento-tareas')

📁 REPORTES (bi-file-earmark-bar-graph) [Nuevo Apartado Ejecutivo]
  ├── 📈 Resumen del Mes (id: 'reporte-mensual')
  └── 📜 Informe del Período (id: 'reporte-semestral') [Badge: "Cierre de Ciclo"]

📁 SISTEMA (bi-gear)
  ├── 🔔 Centro de Actividad (id: 'admin-notificaciones')
  ├── ✅ Aprobaciones (id: 'admin-aprobacion')
  ├── 👥 Gestión de Usuarios (id: 'gestion-usuarios')
  └── 🛡️ Permisos (id: 'permisos')
```

---

## 3. Decisiones de Negocio y Métricas Definitivas

### 3.1. Criterio Definitivo de Estado de Sesión (Opción 3 - Combinada)
Para la auditoría y cómputo de asistencias pendientes o completas:
- **Sesión Incompleta / Pendiente:** Fecha de la clase ya transcurrida (`fecha < CURRENT_DATE` o fecha hoy y `hora_fin < CURRENT_TIME`), `estado IN ('programada', 'abierta', 'pendiente', 'atrasada')` **Y** campo `asistencia` vacío (`[]` o `NULL`).
- **Sesión Completa:** `estado IN ('asistencia_registrada', 'cerrada', 'progreso_registrado', 'registrada')` **O** campo `asistencia` con alumnos registrados.
- **Sesión Excluida:** `estado = 'cancelada'` queda completamente excluida de los cálculos de inasistencias y deudas docentes.

---

### 3.2. Métricas del Informe Mensual (`reporte-mensual`)
Consolida el mes calendario vencido para cortes operativos:
1. **Índice Global de Asistencia:**
   $$\text{Tasa Asistencia} = \frac{\text{Presentes} + \text{Tardes}}{\text{Total Convocatorias Registradas}} \times 100$$
2. **Ratio de Justificación Formal:**
   $$\text{Ratio Justificación} = \frac{\text{Ausencias Justificadas}}{\text{Ausencias Injustificadas} + \text{Ausencias Justificadas}} \times 100$$
3. **Patrón Semanal de Concurrencia:**
   - **Día Pico:** Día de la semana con mayor porcentaje de asistencia efectiva.
   - **Día Valle:** Día de la semana con mayor ausentismo.
   - Distribución porcentual Lunes a Sábado.
4. **Alumnos en Zona Roja (Alerta Temprana):**
   - Listado de alumnos con $\ge 2$ inasistencias en el mes.
   - Campos: Nombre completo, Instrumento, Maestro responsable, Contacto de representante, Total ausencias.
5. **Semáforo de Cumplimiento Docente:**
   - % de sesiones cerradas a tiempo por maestro.
   - Conteo de sesiones con `observaciones_sesion` o contenidos cargados.
6. **Efectividad del Calendario:**
   - Ratio de clases impartidas vs. clases canceladas en el mes.

---

### 3.3. Métricas del Informe Semestral (`reporte-semestral`)
Consolida el ciclo completo para evaluación pedagógica y retención:
1. **Evolución Temporal:** Curva de asistencia mes a mes para detectar fatiga de ciclo.
2. **Cuadro de Honor de Asistencia:** Alumnos con $\ge 95\%$ de asistencia y regularidad.
3. **Top Ausentismo y Análisis de Causas:** Ranking de inasistencias y distribución de motivos desde `justificaciones` (Salud, Transporte, Escolar, Personal).
4. **Tasa de Retención por Cátedra:**
   $$\text{Retención} = \frac{\text{Alumnos Activos al Cierre}}{\text{Alumnos Inscritos al Inicio del Período}} \times 100$$
5. **Alumnos Destacados (Merit Score):**
   $$\text{Merit Score} = (0.40 \times \text{\% Asistencia}) + (0.30 \times \text{Logros Aprobados}) + (0.30 \times \text{Indicadores Aprobados})$$
6. **Evaluación Consolidada del Desempeño Docente:**
   - Ponderación: 60% Solvencia administrativa (cero mora) + 40% Seguimiento pedagógico (observaciones y tareas registradas).

---

## 4. Arquitectura de Backend y Servicios Existentes

1. **Procedimientos Almacenados en PostgreSQL / Supabase:**
   - Archivo de migración: `supabase/migrations/20260826_create_academic_reports_rpcs.sql`
   - RPC Mensual: `get_resumen_academico_mensual(p_periodo_id, p_mes, p_anio)`
   - RPC Semestral: `get_informe_academico_semestral(p_periodo_id)`
2. **Capa de Consumo Frontend:**
   - Cliente API: `src/modules/admin-dashboard/api/academicReportsApi.js`
   - Expone: `getResumenAcademicoMensual()` y `getInformeAcademicoSemestral()`.

---

## 5. Plan de Ejecución Paso a Paso para Hermes

### Paso 1: Actualizar `src/portales/adm/adm.js`
Reemplazar `navGroups` con la configuración de 5 grupos y 14 ítems definidos en la Sección 2.

### Paso 2: Registrar Rutas y Vistas para Reportes y Bandeja
En `src/portales/_shared/allRegistrars.js` (o en el módulo de enrutamiento correspondiente):
- Registrar la ruta `reporte-mensual`: Renderiza una vista con tarjetas KPI, tabla de Alumnos en Riesgo y resumen de Cumplimiento Docente consumiendo `getResumenAcademicoMensual()`.
- Registrar la ruta `reporte-semestral`: Renderiza el resumen longitudinal del período con cuadro de honor, retención por cátedra y evaluación docente consumiendo `getInformeAcademicoSemestral()`.
- Registrar `seguimiento-tareas`: Renderiza el listado o visor de estado de tareas institucionales.

### Paso 3: Fallbacks y Resiliencia de UI
Si los datos aún no están poblados o la red falla, la UI debe mostrar estados limpios de carga (`loading`), datos vacíos con placeholder descriptivo (`empty state`) o alertas amigables sin arrojar excepciones en consola.

### Paso 4: Verificación de Calidad
1. Ejecutar `npm run lint` o validación de sintaxis.
2. Ejecutar `npm run build` o `npm run build:safe`.
3. Verificar que `http://localhost:3000/adm.html` cargue de inmediato en la ruta por defecto `clases-hoy`.

---

## 6. Prompt Directo para Ejecución en Hermes (Claude Sonnet 5)

```text
Lee atentamente el plan maestro en docs/specs/simplificacion-portal-adm.md y ejecuta la implementación completa:

1. Modifica 'src/portales/adm/adm.js' actualizando los navGroups a la nueva estructura de 5 grupos (Personas, Operación, Bandeja, Reportes, Sistema) y 14 ítems.
2. Registra las rutas 'reporte-mensual', 'reporte-semestral' y 'seguimiento-tareas' en los registrars del portal para que carguen vistas ejecutivas limpias (usando 'src/modules/admin-dashboard/api/academicReportsApi.js' para los datos).
3. Asegura que la navegación por defecto sea 'clases-hoy'.
4. Corre 'npm run build' para garantizar que no haya errores de importación ni regresiones.
```

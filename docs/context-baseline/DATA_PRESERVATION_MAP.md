# DATA PRESERVATION MAP — Estrategia de Preservación y Migración de Datos

> **Proyecto:** `SOI_DDBB_EL_SISTEMAPC`
> **Fecha:** 10 sep 2026
> **Regla de Oro:** NO copiar datos personales sensibles en este documento. Solo estructura y volúmenes.

## 1. Acciones de Migración Permitidas

- **`PRESERVE_AS_IS`**: Mantener esquema y datos intactos en SOI 2.0.
- **`TRANSFORM`**: Ajustar tipos, columnas o normalizar claves foráneas sin pérdida de registros.
- **`MERGE`**: Unificar múltiples tablas dispersas en una entidad consolidada (ej. `personas`).
- **`ARCHIVE`**: Mover datos históricos o períodos cerrados a almacenamiento de consulta histórica.
- **`REBUILD_STRUCTURE_KEEP_DATA`**: Rediseñar la tabla para arquitectura limpia preservando el 100% de filas.
- **`DISCARD_CANDIDATE`**: Tablas confirmadas como obsoletas o de prueba (requiere validación).
- **`HUMAN_DECISION`**: Ambigüedad funcional que requiere orden explícita de Dirección.

## 2. Mapa por Dominio de Datos

| DATASET | TABLES | ROW COUNT | BUSINESS VALUE | DATA QUALITY | SENSITIVE | MIGRATION ACTION |
|---|---|---|---|---|---|---|
| **Identidad y Acceso** | `profiles`, `app_users`, `maestros_credentials` | 35 | Crítico | Alta | Sí (emails, credenciales cifradas) | `TRANSFORM` (unificar perfiles RBAC) |
| **Padrón de Estudiantes** | `alumnos`, `familias`, `representantes` | 670 (282+298+90) | Crítico | Media (campos legacy en alumnos) | Sí (menores de edad, teléfonos) | `MERGE` (hacia `personas` + `alumnos`) |
| **Admisiones y Postulantes** | `postulantes`, `applicants`, `appointments` | 404 | Alto | Buena | Sí (contactos de familias aspirantes) | `TRANSFORM` (normalizar con embudo CRM) |
| **Cátedras y Horarios** | `clases`, `clase_horarios`, `salones`, `programas` | 127 | Crítico | Alta | No | `PRESERVE_AS_IS` |
| **Asistencia Histórica** | `asistencias`, `sesiones_clase`, `justificaciones` | 3.258 | Crítico | Muy Alta (2.812 asistencias) | No | `PRESERVE_AS_IS` |
| **Currículo e Indicadores** | `indicators`, `nodes`, `levels`, `blocks`, `routes` | 5.388 | Muy Alto | Alta (árbol de 4.163 indicadores) | No | `PRESERVE_AS_IS` |
| **Evaluaciones y Progreso** | `progresos`, `evaluacion_indicador`, `indicator_attempts` | 244 | Alto | Media (pocas evaluaciones formales) | No | `REBUILD_STRUCTURE_KEEP_DATA` |
| **Finanzas Familiares** | `cuotas`, `pagos`, `aplicaciones_pago`, `becas` | 728 | Crítico | Alta (718 cuotas estructuradas) | Sí (montos, recibos de pago) | `PRESERVE_AS_IS` |
| **Instrumentos e Inventario** | `inventario_activos`, `comodatos_activos`, `inventario_historial` | 830 | Crítico | Alta (324 instrumentos físicos) | No | `PRESERVE_AS_IS` |
| **Taller de Lutería** | `lut_ordenes_reparacion`, `lut_diagnosticos` | 1 | Medio | Baja (solo 1 orden de prueba) | No | `REBUILD_STRUCTURE_KEEP_DATA` |
| **Eventos e Inteligencia Hermes** | `soi_eventos`, `tareas_institucionales`, `hermes_whatsapp_queue` | 2.864 | Muy Alto | Alta (2.579 eventos de telemetría) | Sí (mensajes a tutores) | `PRESERVE_AS_IS` |
| **Simulador (Sandbox)** | `sim_runs`, `sim_actores`, `sim_log`, `sim_outbox` | ~200 | Bajo | Ficticia (datos simulados) | No | `DISCARD_CANDIDATE` (o aislar en test) |
| **Tablas Deprecadas 2026-09** | `plan_clases`, `clase_mapa_*`, `rachas`, `accesorios` | 0 - 30 | Nulo | Obsoleta (comentario explícito) | No | `ARCHIVE` (mover a schema legacy) |

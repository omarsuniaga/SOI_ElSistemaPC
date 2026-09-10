# IDENTITY MIGRATION — Preservación de Claves Primarias y Relaciones

> **Objetivo:** Garantizar la integridad referencial y evitar orfandad de datos históricos durante la evolución hacia SOI 2.0.

## 1. Criterios de Asignación de Identidades

- **`KEEP_ID`**: Clave primaria que **NUNCA** debe cambiar. Fundamental para tablas con cientos o miles de relaciones vivas (`alumnos`, `clases`, `asistencias`, `cuotas`).
- **`MAP_ID`**: Identificador que se unifica mediante una tabla puente `legacy_id_mapping(source_table, old_id, new_id)` sin destruir el registro original.
- **`GENERATE_NEW_ID`**: Nuevas entidades sintetizadas (ej. entidad abstracta `personas` o consolidación de solicitudes).

## 2. Matriz de Decisión por Entidad

| Entidad | Volumen en BD | Dependencias FK Críticas | Estrategia de ID | Justificación Técnica |
|---|---|---|---|---|
| **`alumnos.id`** | 282 | `asistencias` (2.812), `cuotas` (718), `alumnos_clases` (476), `comodatos_activos` (30) | `KEEP_ID` | Cambiar el UUID de un alumno requeriría actualizar en cascada más de 4.500 registros con riesgo severo de bloqueo y corrupción. |
| **`maestros.id`** | 33 | `clases` (41), `sesiones_clase` (290), `asistencia_maestros`, `permisos_maestros` (29) | `KEEP_ID` | Identidad docente firmemente vinculada a horarios y auditoría de asistencia. |
| **`clases.id`** | 41 | `alumnos_clases` (476), `clase_horarios` (68), `sesiones_clase` (290), `asistencias` | `KEEP_ID` | Unidad estructural académica; inmutable. |
| **`cuotas.id`** | 718 | `aplicaciones_pago` (6), referencias en cobranza | `KEEP_ID` | Integridad contable y trazabilidad fiscal. |
| **`inventario_activos.id`** | 324 | `comodatos_activos` (30), `inventario_historial` (476) | `KEEP_ID` | Código de barras físico y trazabilidad de instrumentos. |
| **`personas.id` (Nueva)** | 0 | Nueva tabla raíz de personas | `GENERATE_NEW_ID` | Se generará un UUID nuevo para cada persona física única, asociando a él los roles de alumno, maestro o tutor. |
| **`solicitudes.id`** | 5 | Unificación de ausencias, permisos y necesidades | `MAP_ID` | Unificar con tabla puente para no perder los IDs citados en mensajes de WhatsApp o correo. |

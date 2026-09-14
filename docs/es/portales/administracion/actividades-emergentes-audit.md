# Guía de Auditoría: Registro y Trazabilidad de Actividades Emergentes (ADM)

**Módulo:** Portal de Administración y Reportes (ADM)  
**Audiencia:** Administradores del Sistema, Auditores Internos, Oficiales de Cumplimiento y Control de Gestión  
**Componente Asociado:** `ActividadEmergenteAuditView`

---

## 1. Propósito y Alcance

La **Vista de Auditoría de Actividades Emergentes** provee una pista de auditoría inmutable e integral sobre todas las justificaciones emitidas en la plataforma. Su finalidad es asegurar la veracidad de los reportes académicos, respaldar el cálculo de honorarios docentes y garantizar el cumplimiento institucional ante auditorías externas o directivas.

El acceso a este módulo está estrictamente restringido a usuarios con rol administrativo (`ADM`) mediante políticas de seguridad a nivel de fila (Row Level Security - RLS).

---

## 2. Datos Capturados en la Pista de Auditoría

Cada registro de confirmación almacena un histórico de eventos con los siguientes metadatos de auditoría:

| Campo | Tipo | Descripción |
|---|---|---|
| `actividad_id` | UUID | Identificador unívoco de la actividad institucional raíz en `sesiones_clase`. |
| `maestro_id` | UUID | Identificador del docente convocado. |
| `fecha` | DATE | Fecha de ejecución de la actividad y de las clases afectadas. |
| `respuesta` | ENUM | Declaración emitida por el maestro: `si`, `no`, `no_aplica` o `no_se`. |
| `estado_validacion` | ENUM | Estado administrativo: `pendiente`, `validado`, `rechazado`. |
| `respondido_por` | UUID | Usuario autenticado que emitió la confirmación inicial. |
| `respondido_at` | TIMESTAMPTZ | Fecha y hora exacta (con zona horaria) de la respuesta. |
| `validado_por` | UUID | Usuario con rol ACM que dictaminó sobre una respuesta `no_se`. |
| `validado_at` | TIMESTAMPTZ | Fecha y hora de la validación administrativa. |
| `clases_afectadas` | JSONB / ARRAY | Lista de identificadores de sesiones de clase cubiertas por la justificación. |
| `observaciones` | TEXT | Comentarios y notas adicionales ingresadas por el maestro o el coordinador. |
| `updated_at` | TIMESTAMPTZ | Marca temporal del último cambio o reintento de confirmación. |

---

## 3. Uso de Filtros en la Vista de Auditoría

Para facilitar inspecciones dirigidas, el panel ofrece controles de filtrado dinámico:
- **Maestro:** Búsqueda por nombre o UUID del docente.
- **Rango de Fechas:** Permite auditar ciclos académicos o quincenas específicas.
- **Actividad:** Filtrado por evento institucional concreto.
- **Respuesta:** Aísla declaraciones específicas (ej. solo confirmaciones `si` o casos `no_se`).
- **Estado de Validación:** Muestra registros `validado`, `rechazado` o `pendiente`.

---

## 4. Fila Expandible: Detalle de Trazabilidad (Audit Trail)

Al hacer clic en cualquier fila de la tabla principal, se despliega el contenedor de detalle:
- **Historial de Cambios:** Permite visualizar cuándo se respondió y si hubo actualizaciones posteriores.
- **Relación de Clases Afectadas:** Muestra el listado de sesiones ordinarias que quedaron reclasificadas a `justificada_por_actividad_institucional`.
- **Dictamen de Validación:** Si el caso fue escalado, expone el usuario coordinador y la nota de justificación institucional.

---

## 5. Exportación para Auditoría Externa (CSV)

El módulo incluye un mecanismo de exportación para su análisis en herramientas externas (Excel, Google Sheets, PowerBI o software de nómina):

1. Aplique los filtros deseados o conserve la vista total para exportar el universo de datos.
2. Pulse el botón **"Exportar CSV"** en la barra de herramientas.
3. El sistema genera de forma automática un archivo con formato:
   `confirmaciones_emergentes_audit_YYYY-MM-DD.csv`
4. El archivo exportado contiene encabezados estandarizados y codificación UTF-8 compatible con acentos y caracteres del español.

---

## 6. Seguridad y Reglas de Acceso (RLS)

- **Aislamiento por Rol:** Los docentes solo pueden visualizar sus propios registros en el portal de maestros. Si un docente intenta acceder directamente a los registros de auditoría global mediante la API de Supabase, la política RLS denegará la consulta (cero filas retornadas).
- **Acceso Total ADM:** Los administradores disponen de permisos de lectura sobre la totalidad de las tablas `confirmaciones_emergentes` y vistas asociadas.
- **Idempotencia y No-Duplicidad:** La clave primaria y unicidad garantizan que no existan registros duplicados para una misma tupla `(actividad_id, maestro_id, fecha)`.
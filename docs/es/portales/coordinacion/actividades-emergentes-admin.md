# Guía de Administración: Gestión de Actividades Emergentes (ACM)

**Módulo:** Portal de Coordinación Académica (ACM)  
**Audiencia:** Coordinadores Académicos, Directores Musicales y Jefes de Programa  
**Componente Asociado:** `ActividadEmergenteManagerView`

---

## 1. Visión General

La Coordinación Académica es responsable de planificar, difundir y supervisar eventos y actividades institucionales extraordinarias (giras, conciertos didácticos, talleres intensivos, festivales, ensayos seccionales extraordinarios).

El módulo de **Gestión de Actividades Emergentes** permite:
1. Registrar una nueva actividad institucional en el calendario académico.
2. Definir con precisión el **alcance** (qué maestros son convocados o afectados).
3. Monitorear las respuestas de los maestros en tiempo real.
4. Resolver y validar dudas reportadas como *"No Sé"* antes del cierre de nómina de asistencias.

---

## 2. Creación de una Actividad Institucional

Para dar de alta una actividad:
1. Navegue al panel de administración académica y seleccione **Gestión de Actividades Emergentes**.
2. En el formulario superior **"Nueva Actividad Institucional"**, complete los campos requeridos:
   - **Nombre de la Actividad:** Identificador descriptivo (ej. *"Concierto Aniversario Punta Cana"*).
   - **Fecha:** Día de ejecución del evento (`YYYY-MM-DD`).
   - **Lugar:** Ubicación física (ej. *"Salón Plenario / Iglesia Santa María"*).
   - **Tipo de Alcance:** Criterio de difusión a los docentes.
   - **Configuración de Alcance (JSON / Parámetros):** Según el tipo seleccionado.
3. Pulse el botón **"Crear Actividad"**.
   - El sistema ejecuta la función `fn_difundir_actividad_por_alcance`.
   - Se crea la sesión de clase raíz institucional.
   - Se generan automáticamente los registros de confirmación pendientes para todos los docentes dentro del alcance definido.

---

## 3. Tipos de Alcance y Configuración

El alcance previene la sobre-notificación a maestros que no tienen relación con el evento:

### A. `institucion` (Institucional Global)
- **Definición:** Convoca o afecta a **todos los maestros** que tengan sesiones de clase programadas en esa fecha.
- **Uso:** Conciertos generales, cierres de ciclo, asambleas de la orquesta, eventos con suspensión general de clases ordinarias.
- **Configuración:** `{}` (objeto vacío).

### B. `programa` (Programa Académico Específico)
- **Definición:** Aplica únicamente a los docentes asignados a un programa determinado (ej. Iniciación, Vientos, Cuerdas, Coro Infantil).
- **Uso:** Encuentros seccionales o talleres formativos de un programa en particular.
- **Configuración:** `{"programa_id": "UUID_DEL_PROGRAMA"}`.

### C. `grupo` (Agrupación o Ensamble Específico)
- **Definición:** Aplica a los maestros vinculados a un ensamble o grupo específico.
- **Uso:** Ensayos de metales, ensambles de cámara, cuarteto de cuerdas.
- **Configuración:** `{"grupo_id": "UUID_DEL_GRUPO"}`.

### D. `maestros_especificos` (Selección Manual Puntual)
- **Definición:** Se especifica una lista explícita de identificadores de maestros.
- **Uso:** Apoyo logístico puntual, maestros solistas o comisiones especiales.
- **Configuración:** `{"maestro_ids": ["UUID_M1", "UUID_M2", "UUID_M3"]}`.

---

## 4. Validación de Confirmaciones en Estado "No Sé"

Cuando un docente selecciona *"No Sé"* al responder una actividad, el sistema genera una alerta y marca el estado de validación como `pendiente`. Esta situación requiere mediación de Coordinación Académica:

1. **Localización de Casos:**
   - En la tabla de confirmaciones del Manager View, utilice el filtro **Estado de Validación: Pendiente** o busque filas donde la respuesta sea `no_se`.
   - Estas filas muestran una insignia amarilla: **"Requiere Validación"**.
2. **Acción de Validación:**
   - Pulse el botón **"Validar"** junto al registro correspondiente.
   - Se abrirá el modal de mediación.
3. **Resolución:**
   - **Validado (`validado`):** Si Coordinación confirma que el maestro efectivamente participó o estuvo disponible para el evento institucional. La sesión de clase queda justificada.
   - **Rechazado (`rechazado`):** Si el maestro no asistió a la actividad institucional ni impartió su clase. La sesión se considerará no justificada.
   - **Observaciones:** Ingrese la justificación técnica del dictamen (ej. *"Confirmado por lista física de tarima"*).
4. Al guardar, el RPC `fn_validar_confirmacion_acm` actualiza el registro auditando al coordinador responsable.

---

## 5. Resumen Agregado e Indicadores (KPIs)

En la cabecera del módulo, el panel de métricas presenta en tiempo real:
- **Total Actividades:** Volumen de eventos institucionales registrados en el período.
- **Respuestas Confirmadas:** Desglose de respuestas `si`, `no`, `no_aplica` y `no_se`.
- **Validaciones Pendientes:** Conteo de casos que requieren acción inmediata por parte de ACM.
- **Tasa de Respuesta Docente:** Porcentaje de maestros convocados que ya han emitido su respuesta.

---

## 6. Políticas Operativas y Período Recomendado

> [!IMPORTANT]
> **Ventana de Resolución de 24 a 48 Horas:**
> Se recomienda resolver todos los registros *"No Sé"* en un plazo máximo de **48 horas** tras la culminación de la actividad, y obligatoriamente **antes del día 25 de cada mes**, momento en que se genera la vista consolidada de asistencias (`vw_asistencias_consolidada`) para la nómina y reportes directivos.
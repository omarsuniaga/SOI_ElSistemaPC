# Guía de Uso: Confirmación de Actividades Emergentes e Institucionales

**Módulo:** Portal de Maestros  
**Audiencia:** Maestros y Docentes  
**Propósito:** Evitar falsos reportes de "sesión sin asistencia" cuando se desarrollan actividades institucionales (conciertos, masterclasses, talleres o ensayos generales).

---

## 1. ¿Qué es una Confirmación de Actividad Institucional?

En el modelo operativo de El Sistema Punta Cana, surgen eventos de carácter institucional —tales como conciertos extraordinarios, presentaciones comunitarias o masterclasses— que alteran la rutina normal de clases.

Anteriormente, si un maestro participaba en una actividad institucional durante su horario habitual, el sistema reportaba su sesión académica como **"Sesión sin asistencia"** o falta no justificada.

Con el sistema de **Confirmaciones Emergentes**, cuando Coordinación Académica registra un evento institucional, el sistema notifica a los maestros afectados. A través de una bandeja dedicada, el maestro puede confirmar con un solo clic si su clase del día fue cubierta o justificada por dicha actividad.

---

## 2. ¿Cómo Confirmar una Actividad?

1. **Ingreso a la Bandeja:**
   - En el menú lateral o superior de navegación, seleccione la opción **Actividades Emergentes** (o acceda directamente a la ruta `#/confirmaciones-emergentes`).
   - Si recibió un enlace directo (deep-link con `?actividad_id=...`), el portal abrirá automáticamente la ventana de confirmación correspondiente a esa actividad.

2. **Revisión de Actividades:**
   - La bandeja presenta las actividades del día o pendientes de confirmación, detallando:
     - Nombre de la actividad (ej. *Concierto Extraordinario Aniversario*).
     - Fecha y lugar del evento.
     - Tipo de alcance institucional.
     - Estado actual de su confirmación.

3. **Selección de Respuesta:**
   - Al pulsar sobre la fila de la actividad, se desplegará el modal interactivo con los **4 botones de acción**.
   - Opcionalmente, puede añadir observaciones adicionales en el campo de texto (por ejemplo, detalles sobre los grupos o cátedras involucradas).
   - Pulse su respuesta para registrarla de manera inmediata.

---

## 3. ¿Qué Significan los 4 Botones?

La interfaz está optimizada tanto para escritorio como para dispositivos móviles (botones táctiles de al menos 44px de altura) con 4 opciones claras:

| Botón | Valor Registrado | Significado y Efecto en el Sistema |
|---|---|---|
| **Sí, Aplica** | `si` | **Justifica plenamente la sesión.** La clase del maestro en esa fecha se reclasifica automáticamente a `justificada_por_actividad_institucional` y no genera reporte negativo de asistencia. |
| **No, No Aplica** | `no` | **No justifica la sesión.** La actividad no sustituyó su clase ordinaria; el maestro dictó clase regular o no participó. La sesión seguirá el flujo normal de asistencia o inasistencia. |
| **No Aplica** | `no_aplica` | **La actividad no corresponde a su disciplina o grupo.** El evento fue convocado con un alcance que no interfiere con sus responsabilidades docentes del día. |
| **No Sé** | `no_se` | **Duda o situación especial.** El maestro no tiene certeza si el evento justificaba sus horas. El sistema marca el registro como **"En Validación"** y lo escala automáticamente a la bandeja de Coordinación Académica (ACM) para su resolución. |

---

## 4. Caso de Uso Práctico: Concierto General (15-09)

Imaginemos el siguiente escenario:
1. **Fecha:** 15 de Septiembre de 2026.
2. **Evento:** Concierto General de la Orquesta en el Auditorio Principal (14:00 a 18:00).
3. **Situación del Maestro:** El maestro de Violín I tenía programadas dos clases individuales de 15:00 a 17:00, pero todos sus alumnos y él estuvieron en el montaje y presentación del concierto.
4. **Acción del Maestro:**
   - Ingresa a **Actividades Emergentes**.
   - Observa la tarjeta del *Concierto General*.
   - Pulsa la tarjeta y selecciona **"Sí, Aplica"**.
   - Opcional: Escribe *"Alumnos de Violín I participaron en fila de primeros violines"*.
5. **Resultado:**
   - El sistema vincula la actividad a sus clases del día.
   - En los reportes de cierre de mes y nómina académica, las sesiones quedan **100% justificadas e institucionales**.

---

## 5. Preguntas Frecuentes (FAQ)

### ¿Por qué no veo una actividad en mi bandeja?
Una actividad solo aparece en su bandeja si:
1. Fue creada con alcance **Institución** (aplica a todos los maestros con clases programadas esa fecha).
2. Fue creada con alcance **Programa** o **Grupo** al que usted y sus asignaturas pertenecen.
3. Su usuario fue incluido explícitamente en el alcance de **Maestros Específicos**.  
Si considera que debió ser convocado, contacte a Coordinación Académica (ACM).

### ¿Puedo cambiar mi respuesta si me equivoqué?
Sí. El sistema implementa actualización idempotente (UPSERT). Si vuelve a abrir la actividad en la bandeja y selecciona otra opción, el registro se actualizará con su última respuesta y se auditará la fecha de actualización (`updated_at`).

### ¿Qué ocurre si selecciono "No Sé"?
El registro pasa a estado **Pendiente de Validación**. Coordinación Académica revisará la lista de maestros en dicha situación y, tras consultar la asistencia física o bitácora de la actividad, validará o rechazará la justificación.

### ¿Funciona sin conexión a internet (Offline)?
Si está en Modo Demo o utilizando la PWA con capacidades locales, la respuesta se almacena temporalmente y se procesa según la conectividad del dispositivo.
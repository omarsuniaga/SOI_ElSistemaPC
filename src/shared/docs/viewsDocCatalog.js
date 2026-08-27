/**
 * viewsDocCatalog.js
 * Catálogo canónico de documentación funcional, operativa y contextual para todas
 * las vistas del sistema académico (SSOT para modales de Info y Onboarding).
 */

export const VIEWS_DOC_CATALOG = {
  // ==========================================================================
  // GRUPO 1: PERSONAS
  // ==========================================================================
  'alumnos': {
    routeId: 'alumnos',
    title: 'Directorio & Expediente de Alumnos',
    group: 'Personas',
    icon: 'bi-people',
    summary: 'Registro maestro de estudiantes matriculados, datos de contacto, nivel instrumental, representante legal y ficha académica individual.',
    workflow: [
      'Búsqueda y Filtros: Localiza alumnos por nombre, nivel, instrumento o estatus (activo/inactivo).',
      'Creación de Alumno: Haz clic en "Nuevo Alumno" para matricular a un estudiante completando datos personales y de su tutor.',
      'Expediente Detallado: Haz clic sobre la tarjeta de un alumno para ver su historial de asistencia, materias inscritas y observaciones pedagógicas.',
      'Exportación: Descarga el listado consolidado en CSV para reportes de secretaría.'
    ],
    keyRules: [
      'Un alumno inactivo no figura en las listas de asistencia diaria de las clases.',
      'El número de teléfono del representante es el canal principal para notificaciones de ausencia.',
      'Los cambios de nivel instrumental deben reflejarse en la asignación de sus clases correspondientes.'
    ]
  },

  'maestros': {
    routeId: 'maestros',
    title: 'Directorio Docente & Cátedras',
    group: 'Personas',
    icon: 'bi-person-check',
    summary: 'Administración del cuerpo docente institucional, especialidad de cátedra, asignación académica y datos de contacto directo.',
    workflow: [
      'Exploración: Consulta la lista de profesores clasificados por especialidad instrumental y carga horaria.',
      'Alta de Maestro: Registra nuevos profesores especificando su especialidad principal y credenciales de acceso.',
      'Ficha Docente: Consulta las clases asignadas a cada docente y su estado de vinculación académica.',
      'Contacto Rápido: Utiliza los accesos de WhatsApp o correo para comunicación institucional inmediata.'
    ],
    keyRules: [
      'Cada maestro debe tener asociada su especialidad (cátedra) para la asignación correcta de horarios.',
      'La vinculación de un docente con una cuenta de usuario le permite acceder a su propio Portal de Maestros.'
    ]
  },

  'postulados': {
    routeId: 'postulados',
    title: 'Aspirantes & Registro de Admisión',
    group: 'Personas',
    icon: 'bi-person-plus-fill',
    summary: 'Gestión del pipeline de admisión de nuevos aspirantes, evaluación de requisitos y estado de postulación para nuevos ciclos.',
    workflow: [
      'Monitoreo del Embudo: Revisa postulados agrupados por estatus (Pendiente, Entrevista, Evaluado, Admitido, Rechazado).',
      'Revisión de Ficha: Inspecciona la información del aspirante, instrumento deseado y antecedentes musicales.',
      'Agendamiento: Deriva al aspirante hacia el calendario de citas para su audición o entrevista.',
      'Conversión a Alumno: Una vez admitido, promueve el expediente directamente a Alumno Matriculado.'
    ],
    keyRules: [
      'Un postulado admitido debe ser matriculado antes del inicio del período lectivo para asignarle horarios.',
      'Las razones de rechazo o no admisión quedan registradas para trazabilidad institucional.'
    ]
  },

  'postulados-calendario': {
    routeId: 'postulados-calendario',
    title: 'Calendario de Citas & Entrevistas',
    group: 'Personas',
    icon: 'bi-calendar-event',
    summary: 'Agenda cronológica y programación de audiciones, entrevistas de admisión y pruebas de nivel para aspirantes.',
    workflow: [
      'Visualización de Agenda: Navega por la vista mensual o semanal de entrevistas programadas.',
      'Agendar Cita: Selecciona un día y hora disponible, asigna al postulante y al jurado o entrevistador.',
      'Confirmación: Registra la asistencia del postulante a su cita y añade las notas preliminares de la audición.'
    ],
    keyRules: [
      'No se permite solapar dos citas en el mismo salón o con el mismo entrevistador.',
      'Las citas canceladas liberan el espacio en la agenda para nuevos turnos.'
    ]
  },

  // ==========================================================================
  // GRUPO 2: OPERACIÓN
  // ==========================================================================
  'clases-hoy': {
    routeId: 'clases-hoy',
    title: 'Clases de Hoy & Monitoreo en Vivo',
    group: 'Operación',
    icon: 'bi-calendar-day',
    summary: 'Tablero operativo en tiempo real de las clases programadas para la jornada actual, estado de pase de lista y salones ocupados.',
    workflow: [
      'Supervisión Diaria: Monitorea qué clases se imparten hoy ordenadas por bloque horario y salón.',
      'Estado de Registro: Verifica con un vistazo qué docentes ya completaron el pase de lista y cuáles están pendientes.',
      'Acceso Rápido: Haz clic en una clase para auditar la lista de estudiantes presentes/ausentes en tiempo real.',
      'Notificaciones de Emergencia: Detecta rápidamente si un salón está sin docente o si hay retraso en el pase de lista.'
    ],
    keyRules: [
      'Solo muestra las clases cuya recurrencia horaria coincide con el día lectivo en curso (AST).',
      'Las clases marcadas como no impartidas o canceladas se reflejan inmediatamente en el monitoreo.'
    ]
  },

  'clases': {
    routeId: 'clases',
    title: 'Gestión de Clases & Horarios',
    group: 'Operación',
    icon: 'bi-calendar3',
    summary: 'Configuración curricular de clases, asignación de docentes titulares, horarios semanales, salones físicos y roster de alumnos inscritos.',
    workflow: [
      'Directorio de Clases: Filtra clases por nivel, instrumento, día o maestro asignado.',
      'Creación y Edición: Configura nombre de materia, días de la semana, hora de inicio/fin, salón y capacidad máxima.',
      'Inscripción de Alumnos: Gestiona qué alumnos forman parte del roster de la clase.',
      'Exportar Horarios: Genera planillas de asistencia y listas de clases para secretaría.'
    ],
    keyRules: [
      'El horario de una clase no puede generar conflicto de salón con otra clase en la misma franja.',
      'La capacidad de la clase está restringida por la capacidad física del salón asignado.'
    ]
  },

  'salones': {
    routeId: 'salones',
    title: 'Directorio de Salones & Espacios',
    group: 'Operación',
    icon: 'bi-door-open',
    summary: 'Administración de la infraestructura física, capacidad máxima de plazas, ubicación por piso, condición operativa y equipamiento disponible.',
    workflow: [
      'Exploración de Espacios: Utiliza la barra de búsqueda y filtros para revisar aulas por piso o condición.',
      'Nuevo Salón: Registra aulas ingresando nombre/código, piso, capacidad en personas y equipamiento (pianos, atriles, etc.).',
      'Mantenimiento: Actualiza la condición física (Excelente, Buena, Regular, Mala) para coordinar reparaciones con servicios generales.',
      'Descarga CSV: Exporta el inventario de espacios físicos de la institución.'
    ],
    keyRules: [
      'Un salón marcado como inactivo no puede ser seleccionado en la creación o edición de clases.',
      'La capacidad declarada actúa como tope de seguridad en la asignación de cupos de alumnos.'
    ]
  },

  'periodos': {
    routeId: 'periodos',
    title: 'Gestión de Períodos Académicos',
    group: 'Operación',
    icon: 'bi-calendar-event',
    summary: 'Ciclos de estudio semestrales, definición de fechas de inicio/cierre, activación atómica del ciclo lectivo y auditorías de cierre de semestre.',
    workflow: [
      'Listado de Ciclos: Revisa todos los períodos académicos registrados con sus fechas oficiales de vigencia.',
      'Nuevo Ciclo: Crea un nuevo período definiendo fecha de inicio y término formal.',
      'Activar Período: Ejecuta el corte atómico para convertir un ciclo en el "Período Activo" del sistema.',
      'Auditar Cierre: Genera el informe de cierre de período y descarga el PDF ejecutivo consolidado.'
    ],
    keyRules: [
      'Solo puede existir UN único período activo en el sistema simultáneamente (operación atómica).',
      'Un período cerrado congela la edición histórica para garantizar la inmutabilidad de los registros académicos.'
    ]
  },

  'asistencias': {
    routeId: 'asistencias',
    title: 'Resumen Institucional de Asistencias',
    group: 'Operación',
    icon: 'bi-calendar-check',
    summary: 'Historial global de marcas de asistencia de estudiantes por día lectivo, estadísticas de concurrencia y detección de ausentismo.',
    workflow: [
      'Filtro por Rango: Selecciona rango de fechas, cátedra o clase específica para consultar asistencia.',
      'Inspección de Marcas: Revisa estudiantes presentes, ausentes y justificados.',
      'Reporte de Ausentismo: Identifica alumnos en riesgo de reprobación por acumulación de faltas.'
    ],
    keyRules: [
      'El cálculo institucional cuenta días lectivos con asistencia y no sesiones duplicadas en una misma jornada.',
      'Las ausencias con justificación aprobada no penalizan negativamente el índice de riesgo académico.'
    ]
  },

  'admin-dashboard': {
    routeId: 'admin-dashboard',
    title: 'Cumplimiento de Maestros & Solvencia',
    group: 'Operación',
    icon: 'bi-clipboard-check',
    summary: 'Control y balance canónico de clases impartidas vs asistencias registradas por los docentes para validación y solvencia de nómina.',
    workflow: [
      'Selector de Período: Analiza el cumplimiento en la Semana Actual, Últimas 2 Semanas o Mes en Curso.',
      'Filtro de Solvencia: Aísla docentes Solventes, Con Pendientes (≤7 días) o Con Vencidas (>7 días).',
      'Recordatorio WhatsApp: Envía una notificación con un clic al docente que tenga asistencias pendientes.',
      'Reporte Institucional: Genera un informe PDF consolidado con todas las clases dadas por todos los maestros en un rango.'
    ],
    keyRules: [
      'Un maestro es Solvente únicamente si no tiene ninguna clase con pase de lista pendiente o vencido.',
      'Las clases vencidas (>7 días) generan alerta prioritaria para la Dirección Académica.'
    ]
  },

  'admin-ausencias': {
    routeId: 'admin-ausencias',
    title: 'Gestión & Justificación de Ausencias',
    group: 'Operación',
    icon: 'bi-calendar-x',
    summary: 'Módulo de registro, soporte documental y aprobación administrativa de licencias, permisos médicos y ausencias justificadas de docentes y alumnos.',
    workflow: [
      'Bandeja de Solicitudes: Revisa licencias médicas o permisos solicitados.',
      'Carga de Justificación: Adjunta constancias médicas o motivos institucionales a una fecha específica.',
      'Aprobación: Aprueba o desestima la justificación para actualizar el cómputo de asistencias.'
    ],
    keyRules: [
      'Una ausencia justificada revierte la penalización de cumplimiento en el balance docente.',
      'Toda justificación debe contar con respaldo administrativo registrado en el sistema.'
    ]
  },

  // ==========================================================================
  // GRUPO 3: REPORTES
  // ==========================================================================
  'reporte-mensual': {
    routeId: 'reporte-mensual',
    title: 'Resumen Operativo del Mes',
    group: 'Reportes',
    icon: 'bi-graph-up',
    summary: 'Consolidado estadístico mensual de sesiones impartidas, tasa de asistencia estudiantil, horas cátedra y métricas operativas generales.',
    workflow: [
      'Selección de Mes: Elige el mes y año a auditar.',
      'Análisis de KPIs: Visualiza tasas porcentuales de asistencia, cantidad total de sesiones y ausentismo promedio.',
      'Exportación: Descarga planillas e informes ejecutivos para reuniones de directorio.'
    ],
    keyRules: [
      'Los datos se calculan exclusivamente sobre el universo de clases programadas en el mes seleccionado.',
      'Permite comparar el rendimiento operativo respecto al mes inmediatamente anterior.'
    ]
  },

  'analisis-contenido': {
    routeId: 'analisis-contenido',
    title: 'Análisis Pedagógico & Cobertura Curricular',
    group: 'Reportes',
    icon: 'bi-journal-text',
    summary: 'Auditoría del avance programático de las clases, contenidos pedagógicos impartidos por los maestros y cumplimiento de los planes de estudio.',
    workflow: [
      'Exploración Curricular: Filtra por nivel, cátedra o instrumento para ver los temas cubiertos.',
      'Revisión de Bitácoras: Inspecciona los temas y obras musicales registradas en cada clase por los docentes.',
      'Detección de Brechas: Identifica cátedras con retrasos en el cronograma curricular.'
    ],
    keyRules: [
      'Se alimenta de las notas pedagógicas registradas por los maestros al cerrar cada sesión de clase.',
      'Ayuda a garantizar la homogeneidad pedagógica entre diferentes secciones del mismo nivel.'
    ]
  },

  'reporte-semestral': {
    routeId: 'reporte-semestral',
    title: 'Informe del Período & Cierre de Ciclo',
    group: 'Reportes',
    icon: 'bi-journal-bookmark',
    summary: 'Balance general consolidado del período académico completo: retención estudiantil, cumplimiento docente acumulado y notas institucionales.',
    workflow: [
      'Auditoría Global: Selecciona el ciclo semestral para obtener el informe macro.',
      'Evaluación Docente: Revisa el índice de puntualidad y registro de cada maestro durante el semestre.',
      'Descarga Oficial: Exporta el dossier final en PDF para archivo institucional permanente.'
    ],
    keyRules: [
      'Es el informe requerido antes de proceder con el cierre definitivo de un período académico.',
      'Los docentes sin clases registradas se aíslan para no distorsionar el promedio general.'
    ]
  },

  // ==========================================================================
  // GRUPO 4: SISTEMA
  // ==========================================================================
  'admin-notificaciones': {
    routeId: 'admin-notificaciones',
    title: 'Centro de Actividad & Eventos',
    group: 'Sistema',
    icon: 'bi-bell',
    summary: 'Panel de monitoreo de alertas del sistema, avisos automáticos de ausencias, notificaciones push enviadas y registro de actividad relevante.',
    workflow: [
      'Revisión de Alertas: Consulta avisos clasificados por prioridad (Urgente, Advertencia, Informativo).',
      'Filtro por Tipo: Aísla notificaciones de inasistencia, cambios de horario o avisos administrativos.',
      'Marcar como Leído: Gestiona el estado de atención de los eventos generados.'
    ],
    keyRules: [
      'Las alertas críticas permanecen visibles hasta que se resuelva la causa que las originó.',
      'Se sincroniza en tiempo real con las acciones de maestros y alumnos.'
    ]
  },

  'admin-aprobacion': {
    routeId: 'admin-aprobacion',
    title: 'Bandeja de Aprobaciones Administrativas',
    group: 'Sistema',
    icon: 'bi-person-check',
    summary: 'Mecanismo de autorización de solicitudes docentes, modificaciones extemporáneas de asistencia y cambios en la planificación académica.',
    workflow: [
      'Inspección de Solicitudes: Examina peticiones pendientes remitidas por profesores o coordinadores.',
      'Revisión de Justificación: Consulta el motivo y los datos previos vs propuestos.',
      'Resolución: Aprueba o rechaza la solicitud con comentarios de retroalimentación.'
    ],
    keyRules: [
      'Cualquier alteración a un registro histórico bloqueado exige aprobación en esta bandeja.',
      'Queda registro del usuario administrador que autorizó o denegó la operación.'
    ]
  },

  'gestion-usuarios': {
    routeId: 'gestion-usuarios',
    title: 'Gestión de Usuarios & Accesos',
    group: 'Sistema',
    icon: 'bi-person-gear',
    summary: 'Administración de cuentas de acceso a la plataforma, asignación de roles (SuperAdmin, Admin, Coordinación, Docente, Alumno) y vinculación con personas.',
    workflow: [
      'Directorio de Cuentas: Busca usuarios por correo electrónico, nombre o rol asignado.',
      'Crear / Invitar Usuario: Registra credenciales de acceso vinculándolas al expediente del maestro o funcionario.',
      'Gestión de Estado: Activa, desactiva o restablece contraseñas de cuentas.'
    ],
    keyRules: [
      'Un usuario debe tener un rol asignado para poder superar el guard de navegación de los portales.',
      'La desactivación de una cuenta revoca inmediatamente el acceso a las sesiones activas.'
    ]
  },

  'permisos': {
    routeId: 'permisos',
    title: 'Matriz de Seguridad & Permisos',
    group: 'Sistema',
    icon: 'bi-shield-lock',
    summary: 'Configuración granular de políticas de seguridad, permisos por departamento y reglas de acceso a nivel de fila (RLS) en la base de datos.',
    workflow: [
      'Matriz de Roles: Consulta qué módulos y departamentos están autorizados para cada perfil de usuario.',
      'Ajuste de Políticas: Habilita o restringe operaciones sensibles de lectura/escritura/eliminación.',
      'Auditoría de Seguridad: Verifica que ningún rol tenga privilegios no justificados.'
    ],
    keyRules: [
      'Las políticas definidas gobiernan tanto la interfaz visual como la seguridad a nivel de base de datos en Supabase.',
      'Solo usuarios con rol SuperAdmin pueden modificar la estructura de permisos y roles.'
    ]
  },

  // ==========================================================================
  // GRUPO: VISTAS ACADÉMICAS Y PEDAGÓGICAS (ACM)
  // ==========================================================================
  'programas': {
    routeId: 'programas',
    title: 'Programas Académicos & Niveles de Formación',
    group: 'Académico',
    icon: 'bi-book',
    summary: 'Estructura curricular y definición de niveles formativos (Iniciación, Básico, Medio, Orquesta, Coro) con sus respectivas materias y objetivos formativos.',
    workflow: [
      'Visualización: Explora los programas activos y sus cátedras asociadas.',
      'Configuración: Define la duración de ciclos, requisitos previos y carga lectiva recomendada.',
      'Asignación: Vincula materias y clases al programa correspondiente para estructurar la progresión del alumno.'
    ],
    keyRules: [
      'Un programa activo estructura las clases ofertadas en los períodos académicos.',
      'Las materias vinculadas definen los hitos pedagógicos que los alumnos deben superar para avanzar de nivel.'
    ]
  },

  'pedagogico-dashboard': {
    routeId: 'pedagogico-dashboard',
    title: 'Dashboard Pedagógico & Avance Curricular',
    group: 'Pedagógico',
    icon: 'bi-grid-1x2',
    summary: 'Panel central de supervisión pedagógica para la Coordinación Académica. Muestra la tasa de asistencia, planes de clase semanales y alertas tempranas de rendimiento.',
    workflow: [
      'Supervisión de KPIs: Revisa alumnos activos, clases operativas, planes ejecutados y tasa de asistencia de los últimos 7 días.',
      'Detección de Riesgo: Consulta la lista de alumnos con ausentismo reiterado para coordinar intervenciones con sus maestros.',
      'Navegación Rápida: Accede directamente a Planificación, Seguimiento, Evaluaciones o Reportes detallados.'
    ],
    keyRules: [
      'Los planes de clase deben registrarse semanalmente por los maestros antes de impartir la cátedra.',
      'Las alertas de riesgo se activan automáticamente si un estudiante cae por debajo del umbral mínimo de asistencia en las últimas 4 semanas.'
    ]
  },

  'planificacion-acm': {
    routeId: 'planificacion-acm',
    title: 'Planificación Docente & Aprobación ACM',
    group: 'Pedagógico',
    icon: 'bi-journal-text',
    summary: 'Centro de gobernanza curricular donde la Coordinación Académica revisa, aprueba, devuelve o promociona a plantilla oficial los planes de clase presentados por los docentes.',
    workflow: [
      'Bandeja de Revisión: Filtra planificaciones por estado (Pendientes de Revisión, Aprobadas, Borradores o Todas).',
      'Auditoría Curricular: Inspecciona los objetivos de aprendizaje, obras asignadas y alertas de velocidad temporal.',
      'Acciones de Aprobación: Aprueba planes individualmente o selecciona múltiples registros para aprobación masiva en un solo clic.',
      'Plantillas Oficiales: Promociona planificaciones destacadas a "Plantilla Oficial Institucional" con el botón ⭐ para que sirvan de modelo al resto del cuerpo docente.'
    ],
    keyRules: [
      'Solo los planes con estado "revisada" pueden ser aprobados y publicados hacia los maestros y alumnos.',
      'Si un plan presenta retraso en el cronograma, la coordinación puede solicitar una justificación formal de desfase temporal.',
      'Los planes devueltos a borrador notifican al maestro para que ajuste las correcciones indicadas.'
    ]
  },

  'planificacion-cobertura': {
    routeId: 'planificacion-cobertura',
    title: 'Cobertura Curricular & Cumplimiento de Objetivos',
    group: 'Pedagógico',
    icon: 'bi-grid-3x3-gap',
    summary: 'Matriz analítica que mide el grado de cobertura del plan de estudios, avance de contenidos y cumplimiento de objetivos pedagógicos por cátedra e instrumento.',
    workflow: [
      'Exploración por Clase: Selecciona la clase o cátedra para visualizar el mapa térmico de cobertura de contenidos.',
      'Auditoría de Objetivos: Verifica qué objetivos del programa ya fueron impartidos, cuáles están en progreso y cuáles pendientes.',
      'Detección de Brechas: Identifica materias o grupos rezagados respecto al cronograma institucional del semestre.'
    ],
    keyRules: [
      'La cobertura se calcula a partir de las bitácoras de clase efectivamente impartidas y registradas por los maestros.',
      'Permite a la Dirección Académica garantizar que ninguna sección quede sin cubrir los contenidos obligatorios del ciclo.'
    ]
  },

  'planificacion-ruta': {
    routeId: 'planificacion-ruta',
    title: 'Rutas de Aprendizaje & Mapa de Progreso',
    group: 'Pedagógico',
    icon: 'bi-signpost-2',
    summary: 'Visualización interactiva y gamificada del itinerario formativo del estudiante, representando hitos musicales, repertorio y logros alcanzados.',
    workflow: [
      'Mapa de Ruta: Navega por los nodos formativos de la especialidad musical.',
      'Seguimiento por Alumno: Consulta el posicionamiento del estudiante dentro de su ruta pedagógica y las estrellas/logros obtenidos.',
      'Desbloqueo de Hitos: Valida el cumplimiento de obras y técnicas requeridas para avanzar a la siguiente estación de aprendizaje.'
    ],
    keyRules: [
      'Cada nodo de la ruta está respaldado por indicadores de evaluación objetivos.',
      'El progreso se actualiza dinámicamente con las calificaciones y bitácoras del docente.'
    ]
  },

  'pedagogico-evaluaciones': {
    routeId: 'pedagogico-evaluaciones',
    title: 'Evaluaciones, Rúbricas & Calificaciones',
    group: 'Pedagógico',
    icon: 'bi-clipboard2-check',
    summary: 'Consolidador de evaluaciones académicas, rúbricas cuantitativas y cualitativas de desempeño musical, técnico y teórico.',
    workflow: [
      'Consulta de Calificaciones: Filtra por clase, período o instrumento para ver el rendimiento general.',
      'Registro de Evaluaciones: Ingresa calificaciones parciales, exámenes de fin de ciclo o audiciones internas.',
      'Exportación de Sabanas de Notas: Genera reportes consolidados de notas para las actas oficiales de secretaría académica.'
    ],
    keyRules: [
      'Las calificaciones definitivas se congelan al finalizar el período académico activo.',
      'Las evaluaciones se asocian a las competencias específicas de cada nivel formativo.'
    ]
  },

  'metricas': {
    routeId: 'metricas',
    title: 'Dashboard de Métricas & Analítica Académica',
    group: 'Seguimiento',
    icon: 'bi-bar-chart-line',
    summary: 'Tablero ejecutivo con gráficos de tendencias de matrícula, distribución por instrumentos, cumplimiento docente y retención institucional.',
    workflow: [
      'Análisis Temporal: Compara métricas entre distintos períodos y semestres lectivos.',
      'Segmentación: Filtra la analítica por sede, nivel, cátedra o instrumento musical.',
      'Toma de Decisiones: Utiliza los indicadores para planificar cupos, salones y contratación docente del próximo ciclo.'
    ],
    keyRules: [
      'Los indicadores se alimentan en tiempo real de las operaciones diarias de asistencia y clases.',
      'Ofrece visibilidad directa para la toma de decisiones del Consejo Directivo.'
    ]
  },

  'hermes-tareas': {
    routeId: 'hermes-tareas',
    title: 'Tareas & Compromisos Académicos Hermes',
    group: 'Hermes',
    icon: 'bi-check2-square',
    summary: 'Gestor institucional de tareas, compromisos y acuerdos departamentales con trazabilidad, responsables y fechas límite de cumplimiento.',
    workflow: [
      'Bandeja de Tareas: Consulta los compromisos asignados al departamento académico.',
      'Creación de Tarea: Registra acuerdos derivados de reuniones de claustro o directivas.',
      'Seguimiento y Cierre: Marca tareas completadas con evidencia de resolución institucional.'
    ],
    keyRules: [
      'Permite asegurar que los compromisos adquiridos en reuniones académicas se ejecuten a tiempo.',
      'Notifica automáticamente a los responsables asignados.'
    ]
  },

  // ==========================================================================
  // GRUPO: TALLER DE LUTERÍA (LUT)
  // ==========================================================================
  'luteria-dashboard': {
    routeId: 'luteria-dashboard',
    title: 'Dashboard de Control & KPIs del Taller de Lutería',
    group: 'Lutería',
    icon: 'bi-grid-1x2',
    summary: 'Centro de mando operativo del Taller de Lutería. Muestra la carga de trabajo en mesa técnica, instrumentos en reparación activa, alertas de stock de insumos críticos y accesos directos.',
    workflow: [
      'Monitoreo de KPIs: Revisa instrumentos en banco de trabajo, diagnósticos pendientes, órdenes en espera de repuestos y listos para entrega.',
      'Triaje de Órdenes Recientes: Consulta las órdenes prioritarias y avanza su estado de reparación con un solo clic.',
      'Alertas de Repuestos: Identifica consumibles bajo stock mínimo para coordinar compras antes de que detengan el flujo del taller.'
    ],
    keyRules: [
      'Las órdenes en estado "en_reparacion" computan activamente como ocupación del banco de trabajo.',
      'Los instrumentos reparados deben pasar por la fase de calibración acústica antes de ser marcados como listos para entrega.'
    ]
  },

  'luteria-diagnosticos': {
    routeId: 'luteria-diagnosticos',
    title: 'Banco de Diagnósticos & Triaje Técnico',
    group: 'Lutería',
    icon: 'bi-wrench-adjustable',
    summary: 'Evaluación técnica y física de instrumentos musicales institucionales. Permite registrar estado de conservación, cambiar disponibilidad y abrir órdenes de reparación.',
    workflow: [
      'Búsqueda y Filtro: Localiza instrumentos por código de inventario, número de serie, marca o estado de uso.',
      'Cambio Rápido de Estado: Marca un instrumento como "Listo / Disponible" o "En Mantenimiento" según la inspección física.',
      'Generación de Orden: Haz clic en "Crear Orden" para abrir el asistente de reparación técnica asociando el alumno y tipo de daño.'
    ],
    keyRules: [
      'El estado de uso se sincroniza directamente con el inventario maestro de activos.',
      'Un instrumento en reparación queda automáticamente inhabilitado para ser asignado en comodato a estudiantes.'
    ]
  },

  'luteria-ordenes': {
    routeId: 'luteria-ordenes',
    title: 'Tablero Kanban de Órdenes de Reparación',
    group: 'Lutería',
    icon: 'bi-kanban',
    summary: 'Gestión visual interactiva del ciclo de vida de las reparaciones a través de 4 macro-etapas: Recepción, Aprobación/Insumos, Banco de Trabajo y Control de Calidad/Entrega.',
    workflow: [
      'Alternancia de Vistas: Cambia entre la vista Tablero Kanban y la vista de Lista Tabular según la necesidad de gestión.',
      'Avance de Estados: Utiliza los botones direccionales para avanzar la orden al siguiente hito del flujo técnico.',
      'Filtros de Urgencia: Segmenta por prioridades (Crítica, Alta, Media, Baja) para atender primero los instrumentos requeridos para conciertos o clases.'
    ],
    keyRules: [
      'Toda orden completada debe registrar las piezas sustituidas y el luthier responsable.',
      'Las órdenes que requieren cobro al representante deben contar con aprobación formal previa antes de adquirir repuestos.'
    ]
  },

  'luteria-insumos': {
    routeId: 'luteria-insumos',
    title: 'Almacén de Insumos & Repuestos de Lutería',
    group: 'Lutería',
    icon: 'bi-boxes',
    summary: 'Control de existencias de consumibles de lutería (juegos de cuerdas, puentes, almas, clavijas, colofonias, fieltros, zapatillas y adhesivos especiales).',
    workflow: [
      'Exploración de Stock: Consulta los artículos agrupados por categorías técnicas y visualiza su costo unitario.',
      'Ajuste Rápido: Registra entradas de nuevas compras, consumos en reparaciones específicas o mermas.',
      'Registro de Nuevos Insumos: Da de alta nuevos repuestos definiendo umbrales mínimos de stock para alertas tempranas.'
    ],
    keyRules: [
      'El consumo de repuestos en una reparación descuenta automáticamente el inventario físico.',
      'Los artículos por debajo del stock mínimo activan alertas visuales rojas en el Dashboard del taller.'
    ]
  },
}

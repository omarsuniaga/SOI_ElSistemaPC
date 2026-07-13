/**
 * Vista de Ayuda e Información del Portal SOI
 * Explica a los usuarios cómo navegar y usar cada sección del sistema.
 */

const SECTIONS = [
  {
    id: 'direccion',
    title: 'Dirección',
    icon: 'bi-bullseye',
    color: 'primary',
    description: 'Vista estratégica para directores y administradores generales.',
    items: [
      {
        name: 'Score del Director',
        icon: 'bi-bullseye',
        what: 'Panel principal que muestra el estado general de la institución: tareas pendientes, alertas de riesgo, métricas clave y eventos próximos.',
        how: 'Es la primera vista que ves al iniciar sesión. Revisa las tarjetas de resumen y haz clic en cualquier área para profundizar.',
        tip: 'Las alertas en rojo requieren atención inmediata.',
      },
    ],
  },
  {
    id: 'academico',
    title: 'Académico',
    icon: 'bi-easel',
    color: 'success',
    description: 'Gestión de programas, clases, espacios y horarios.',
    items: [
      {
        name: 'Programas',
        icon: 'bi-book',
        what: 'Catálogo de programas académicos (ej: Piano, Guitarra, Canto). Cada programa define instrumento, duración y estructura curricular.',
        how: 'Crea un programa con su nombre, instrumento y duración. Luego asigna maestros y alumnos desde otras secciones.',
        tip: 'Un programa es el punto de partida: todo lo demás depende de él.',
      },
      {
        name: 'Clases',
        icon: 'bi-easel2',
        what: 'Gestión de clases individuales o grupales, incluyendo horarios, maestro asignado y lista de alumnos.',
        how: 'Selecciona un programa, asigna un maestro, define el horario y agrega alumnos.',
        tip: 'Puedes crear clases individuales o grupales desde la misma vista.',
      },
      {
        name: 'Salones',
        icon: 'bi-door-open',
        what: 'Inventario de espacios físicos disponibles para clases (aulas, estudios, salas de ensayo).',
        how: 'Registra salones con capacidad, equipamiento y disponibilidad horaria.',
        tip: 'Asigna salones a clases para evitar conflictos de horario.',
      },
      {
        name: 'Constructor de Horarios',
        icon: 'bi-calendar-range',
        what: 'Herramienta visual para crear y optimizar horarios de clases, detectando conflictos automáticamente.',
        how: 'Arrastra clases al calendario o usa el asistente automático para generar horarios sin conflictos.',
        tip: 'El sistema resalta en rojo cualquier conflicto de horario o salón.',
      },
    ],
  },
  {
    id: 'personas',
    title: 'Personas',
    icon: 'bi-people',
    color: 'info',
    description: 'Gestión de alumnos, maestros y postulados.',
    items: [
      {
        name: 'Alumnos',
        icon: 'bi-people',
        what: 'Directorio completo de estudiantes con datos personales, contacto, instrumento asignado y estado de inscripción.',
        how: 'Registra alumnos con sus datos básicos. Aspígnalos a programas y clases desde la vista de detalles.',
        tip: 'Usa la barra de búsqueda para encontrar alumnos rápido por nombre o instrumento.',
      },
      {
        name: 'Maestros',
        icon: 'bi-person-check',
        what: 'Directorio de docentes con especialidad, horario disponible, clases asignadas y métricas de desempeño.',
        how: 'Registra maestros con su especialidad y disponibilidad. Luego asígnales clases.',
        tip: 'Las métricas de cada maestro se actualizan automáticamente con el tiempo.',
      },
      {
        name: 'Postulados',
        icon: 'bi-person-plus-fill',
        what: 'Lista de personas que han solicitado inscribirse pero aún no han sido aprobadas.',
        how: 'Revisa cada postulado, verifica su información y aprueba o rechaza su solicitud.',
        tip: 'Los postulados aprobados se convierten automáticamente en alumnos.',
      },
      {
        name: 'Calendario de Citas',
        icon: 'bi-calendar-event',
        what: 'Agenda de citas para audiciones, entrevistas de admisión o reuniones con padres.',
        how: 'Crea citas con fecha, hora y tipo (audición, entrevista, reunión). El sistema envía recordatorios.',
        tip: 'Marca las citas como completadas para mantener el historial actualizado.',
      },
    ],
  },
  {
    id: 'pedagogico',
    title: 'Pedagógico',
    icon: 'bi-journal-check',
    color: 'warning',
    description: 'Planificación, seguimiento y reportes del proceso de enseñanza-aprendizaje.',
    items: [
      {
        name: 'Dashboard Pedagógico',
        icon: 'bi-grid-1x2',
        what: 'Vista resumen del progreso académico general: cobertura curricular, planificaciones completadas, tendencias.',
        how: 'Revisa las tarjetas de KPIs y los gráficos de tendencia para identificar áreas que necesitan atención.',
        tip: 'Las alertas amarillas indican progreso lento que puede requerir intervención.',
      },
      {
        name: 'Planificación',
        icon: 'bi-journal-text',
        what: 'Herramienta para crear planes de clase semanales o mensuales, definiendo objetivos, contenidos y actividades.',
        how: 'Selecciona una clase, define el período, agrega objetivos y contenidos. Puedes usar la IA para sugerencias.',
        tip: 'La IA puede generar borradores de planificación basados en el programa curricular.',
      },
      {
        name: 'Bitácora',
        icon: 'bi-journal-check',
        what: 'Registro cronológico de lo que se impartió en cada clase: contenidos, observaciones y evidencias.',
        how: 'Después de cada clase, registra qué se trabajó, cómo respondieron los alumnos y cualquier observación.',
        tip: 'Una bitácora completa es clave para el seguimiento pedagógico.',
      },
      {
        name: 'Cobertura Curricular',
        icon: 'bi-grid-3x3-gap',
        what: 'Mapa visual que muestra qué porcentaje del programa curricular se ha cubierto vs. lo pendiente.',
        how: 'Revisa el mapa de calor: verde = cubierto, amarillo = en progreso, rojo = pendiente.',
        tip: 'Si hay áreas en rojo cerca del final del período, prioriza esas clases.',
      },
      {
        name: 'Seguimiento',
        icon: 'bi-person-lines-fill',
        what: 'Análisis individual del progreso de cada alumno: fortalezas, debilidades y recomendaciones.',
        how: 'Selecciona un alumno para ver su evolución detallada y comparativa con el grupo.',
        tip: 'Usa los filtros de período para comparar progreso entre trimestres.',
      },
    ],
  },
  {
    id: 'analisis',
    title: 'Análisis',
    icon: 'bi-bar-chart-line',
    color: 'danger',
    description: 'Métricas, reportes y analítica institucional.',
    items: [
      {
        name: 'Dashboard de Métricas',
        icon: 'bi-bar-chart-line',
        what: 'Panel con KPIs principales: tasa de asistencia, retención, progreso promedio, satisfacción.',
        how: 'Explora las tarjetas de métricas y haz clic en los gráficos para ver detalles.',
        tip: 'Las métricas se actualizan en tiempo real con cada registro de asistencia o progreso.',
      },
      {
        name: 'Cumplimiento de Maestros',
        icon: 'bi-clipboard-check',
        what: 'Reporte del nivel de actividad de cada maestro: planificaciones creadas, asistencias registradas, bitácoras completadas.',
        how: 'Revisa la tabla de cumplimiento. Los maestros en rojo tienen bajo nivel de actividad.',
        tip: 'Usa este reporte para identificar maestros que necesitan apoyo o seguimiento.',
      },
      {
        name: 'Reportes del Director',
        icon: 'bi-file-earmark-pdf',
        what: 'Generación de reportes ejecutivos en PDF para presentar a la dirección o inversores.',
        how: 'Selecciona el tipo de reporte, período y formato. El sistema genera el documento automáticamente.',
        tip: 'Los reportes incluyen gráficos y tablas listos para presentar.',
      },
      {
        name: 'Tendencias',
        icon: 'bi-arrow-up-right',
        what: 'Análisis de tendencias a lo largo del tiempo: evolución de métricas por trimestre o año.',
        how: 'Selecciona la métrica y período que quieres analizar. El gráfico muestra la evolución.',
        tip: 'Compara trimestres para identificar patrones estacionales.',
      },
    ],
  },
  {
    id: 'operaciones',
    title: 'Operaciones y Finanzas',
    icon: 'bi-bank',
    color: 'secondary',
    description: 'Gestión financiera, inventario y mantenimiento de instrumentos.',
    items: [
      {
        name: 'Balances de Alumnos',
        icon: 'bi-wallet2',
        what: 'Estado de cuenta de cada alumno: pagos realizados, pendientes, becas y descuentos.',
        how: 'Selecciona un alumno para ver su historial financiero completo.',
        tip: 'Los colores indican estado: verde = al día, amarillo = próximo a vencer, rojo = vencido.',
      },
      {
        name: 'Registro de Pagos',
        icon: 'bi-cash-coin',
        what: 'Registro de todos los cobros y pagos recibidos: matrícula, mensualidades, materiales, eventos.',
        how: 'Registra cada pago con monto, método y concepto. El sistema actualiza el balance automáticamente.',
        tip: 'Puedes registrar pagos parciales y el sistema mantiene el control del saldo.',
      },
      {
        name: 'Stock de Instrumentos',
        icon: 'bi-box-seam',
        what: 'Inventario de instrumentos disponibles para préstamo o comodato a alumnos.',
        how: 'Registra instrumentos con estado, ubicación y valor. Asigna a alumnos desde aquí.',
        tip: 'Marca el estado regularmente: excelente, bueno, regular, necesita reparación.',
      },
      {
        name: 'Comodatos / Préstamos',
        icon: 'bi-file-earmark-text',
        what: 'Control de instrumentos prestados a alumnos: fechas, condiciones y devoluciones.',
        how: 'Registra cada préstamo con alumno, instrumento, fecha y condiciones de uso.',
        tip: 'Establece fechas de devolución para mantener control del inventario.',
      },
      {
        name: 'Reparaciones (Lutería)',
        icon: 'bi-tools',
        what: 'Registro de diagnósticos y órdenes de reparación de instrumentos.',
        how: 'Crea una orden de reparación con diagnóstico, costo estimado y estado.',
        tip: 'Sigue el ciclo: diagnóstico → presupuesto → reparación → devolución.',
      },
    ],
  },
  {
    id: 'sistema',
    title: 'Sistema',
    icon: 'bi-gear',
    color: 'dark',
    description: 'Configuración, permisos, notificaciones y administración del sistema.',
    items: [
      {
        name: 'Centro de Actividad',
        icon: 'bi-bell',
        what: 'Alertas tempranas de riesgo: alumnos con bajo rendimiento, clases sin planificar, pagos vencidos.',
        how: 'Revisa las alertas y toma acción directamente desde cada notificación.',
        tip: 'Activa las notificaciones push en Configuración para no perderte alertas importantes.',
      },
      {
        name: 'Aprobaciones',
        icon: 'bi-person-check',
        what: 'Cola de aprobación para nuevos maestros que se han registrado y esperan ser habilitados.',
        how: 'Revisa la información del maestro, verifica credenciales y aprueba o rechaza.',
        tip: 'Solo los maestros aprobados pueden acceder al sistema.',
      },
      {
        name: 'Gestión de Usuarios',
        icon: 'bi-person-gear',
        what: 'Administración de cuentas de usuario: crear, editar, desactivar cuentas de admin y maestros.',
        how: 'Crea usuarios con rol (admin, maestro) y asigna permisos según necesidad.',
        tip: 'Usa roles específicos: no des permisos de admin a quien solo necesita ver reportes.',
      },
      {
        name: 'Gestión de Ausencias',
        icon: 'bi-calendar-x',
        what: 'Registro y gestión de ausencias de maestros con sistema de sustituciones sugeridas.',
        how: 'Registra la ausencia y el sistema sugiere sustitutos disponibles automáticamente.',
        tip: 'Las sustituciones se basan en especialidad y disponibilidad del maestro.',
      },
      {
        name: 'Configuración',
        icon: 'bi-sliders',
        what: 'Ajustes generales del sistema: API keys de IA, preferencias de notificación, documentos institucionales.',
        how: 'Accede desde aquí para configurar modelos de IA, notificaciones push y documentos.',
        tip: 'Configura las notificaciones push para recibir alertas en tu navegador.',
      },
      {
        name: 'Permisos',
        icon: 'bi-shield-lock',
        what: 'Control granular de qué puede hacer cada rol: ver, crear, editar, eliminar en cada módulo.',
        how: 'Revisa y ajusta los permisos por rol. Cada módulo tiene permisos independientes.',
        tip: 'El principio de mínimo privilegio: solo otorga los permisos estrictamente necesarios.',
      },
      {
        name: 'Importar / Exportar Datos',
        icon: 'bi-cloud-upload',
        what: 'Herramientas para importar datos desde archivos CSV/Excel y exportar reportes.',
        how: 'Selecciona el tipo de dato a importar, prepara el archivo en el formato correcto y súbelo.',
        tip: 'Siempre exporta un respaldo antes de importar datos nuevos.',
      },
    ],
  },
]

function renderSectionCard(section) {
  return `
    <div class="card shadow-sm mb-4 help-section" id="section-${section.id}">
      <div class="card-header bg-${section.color} bg-opacity-10 d-flex align-items-center">
        <i class="bi ${section.icon} fs-4 me-2 text-${section.color}"></i>
        <div>
          <h4 class="mb-0 fw-bold">${section.title}</h4>
          <small class="text-muted">${section.description}</small>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="accordion" id="accordion-${section.id}">
          ${section.items
            .map(
              (item, idx) => `
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button ${idx > 0 ? 'collapsed' : ''}" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#collapse-${section.id}-${idx}">
                  <i class="bi ${item.icon} me-2 text-${section.color}"></i>
                  <strong>${item.name}</strong>
                </button>
              </h2>
              <div id="collapse-${section.id}-${idx}" class="accordion-collapse collapse ${idx === 0 ? 'show' : ''}" 
                   data-bs-parent="#accordion-${section.id}">
                <div class="accordion-body">
                  <div class="row g-3">
                    <div class="col-12">
                      <div class="d-flex align-items-start mb-2">
                        <span class="badge bg-secondary me-2 flex-shrink-0">QUÉ ES</span>
                        <span>${item.what}</span>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="d-flex align-items-start mb-2">
                        <span class="badge bg-primary me-2 flex-shrink-0">CÓMO USAR</span>
                        <span>${item.how}</span>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="d-flex align-items-start">
                        <span class="badge bg-warning text-dark me-2 flex-shrink-0">TIP</span>
                        <span class="text-muted fst-italic">${item.tip}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    </div>
  `
}

export function renderHelpView(container) {
  container.innerHTML = `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12 col-lg-10 col-xl-8 mx-auto">
          
          <!-- Encabezado -->
          <div class="d-flex align-items-center mb-4">
            <i class="bi bi-question-circle-fill fs-1 me-3 text-primary"></i>
            <div>
              <h2 class="mb-0 fw-bold">Centro de Ayuda</h2>
              <small class="text-muted">Guía completa del Portal SOI — El Sistema Académico</small>
            </div>
          </div>

          <!-- Navegación rápida -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <h6 class="fw-bold mb-3">
                <i class="bi bi-list-nested me-2"></i>
                Navegación Rápida
              </h6>
              <div class="d-flex flex-wrap gap-2">
                ${SECTIONS.map(
                  (s) => `
                  <a href="#section-${s.id}" class="btn btn-outline-${s.color} btn-sm">
                    <i class="bi ${s.icon} me-1"></i>${s.title}
                  </a>
                `,
                ).join('')}
              </div>
            </div>
          </div>

          <!-- Cómo funciona el portal -->
          <div class="card shadow-sm mb-4 border-primary">
            <div class="card-header bg-primary bg-opacity-10">
              <h5 class="mb-0 fw-bold">
                <i class="bi bi-lightbulb me-2"></i>
                Cómo Funciona el Portal
              </h5>
            </div>
            <div class="card-body">
              <div class="row g-3 text-center">
                <div class="col-md-3">
                  <div class="p-3">
                    <i class="bi bi-sidebar fs-1 text-primary"></i>
                    <h6 class="mt-2 fw-bold">Sidebar</h6>
                    <small class="text-muted">Usa el menú lateral para navegar entre secciones agrupadas por área.</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="p-3">
                    <i class="bi bi-phone fs-1 text-success"></i>
                    <h6 class="mt-2 fw-bold">Móvil</h6>
                    <small class="text-muted">En móvil, toca una pestaña inferior y desliza para ver las opciones del grupo.</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="p-3">
                    <i class="bi bi-moon-stars fs-1 text-warning"></i>
                    <h6 class="mt-2 fw-bold">Tema</h6>
                    <small class="text-muted">Cambia entre modo claro y oscuro con el botón de sol/luna en el sidebar.</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="p-3">
                    <i class="bi bi-bell fs-1 text-danger"></i>
                    <h6 class="mt-2 fw-bold">Alertas</h6>
                    <small class="text-muted">El badge en "Centro de Actividad" muestra alertas pendientes en tiempo real.</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Secciones del sistema -->
          ${SECTIONS.map(renderSectionCard).join('')}

          <!-- Atajos de teclado -->
          <div class="card shadow-sm mb-4">
            <div class="card-header">
              <h5 class="mb-0 fw-bold">
                <i class="bi bi-keyboard me-2"></i>
                Atajos Útiles
              </h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-sm-6">
                  <div class="d-flex align-items-center">
                    <kbd class="me-2">Ctrl</kbd> + <kbd class="ms-1 me-2">K</kbd>
                    <span class="text-muted">Buscar (próximamente)</span>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-moon-stars me-2"></i>
                    <span class="text-muted">Botón <strong>Sol/Luna</strong> en el sidebar cambia el tema</span>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-box-arrow-right me-2"></i>
                    <span class="text-muted">Botón <strong>Salir</strong> en el sidebar cierra la sesión</span>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-phone me-2"></i>
                    <span class="text-muted">En móvil, toca una <strong>pestaña inferior</strong> para navegar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Soporte -->
          <div class="card shadow-sm mb-4 border-info">
            <div class="card-header bg-info bg-opacity-10">
              <h5 class="mb-0 fw-bold">
                <i class="bi bi-headset me-2"></i>
                ¿Necesitas Ayuda?
              </h5>
            </div>
            <div class="card-body">
              <p class="mb-2">
                Si tienes dudas o problemas, contacta al administrador del sistema.
              </p>
              <p class="mb-0 text-muted">
                <i class="bi bi-envelope me-1"></i> 
                <small>El administrador puede acceder a la sección <strong>Configuración</strong> para ajustar permisos, usuarios y preferencias del sistema.</small>
              </p>
            </div>
          </div>

          <!-- Pie -->
          <div class="text-center text-muted py-3">
            <small>SOI — Sistema Operativo Institucional v1.0.0 · El Sistema Punta Cana</small>
          </div>

        </div>
      </div>
    </div>
  `
}

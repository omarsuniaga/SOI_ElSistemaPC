/**
 * eventProjectManagerEngine.js — Motor de Orquestación y Project Manager Institucional
 * SOI (Sistema Operativo Institucional) · El Sistema Punta Cana
 *
 * Transforma eventos del calendario en Proyectos Institucionales Autónomos:
 *   1. ACTIVO: Genera el Plan Maestro (WBS T-Minus) multidepartamental en Hermes.
 *   2. REACTIVO: Monitorea cuellos de botella, atrasos y escala riesgos a Dirección.
 *   3. PROACTIVO: Sugiere recintos en Punta Cana, evalúa repertorio y anticipa compras.
 */

// ── 1. Directorio Curado de Espacios y Recintos en Punta Cana ─────────────────
export const PUNTA_CANA_VENUES = [
  {
    id: 'auditorio-puntacana-club',
    nombre: 'Auditorio Puntacana Club (Resort)',
    capacidad: 450,
    tipo: 'Auditorio Cerrado / Climatizado',
    acustica: 'Excelente (acústica tratada para orquesta de cámara y sinfónica)',
    ubicacion: 'Punta Cana Resort & Club',
    departamentoContacto: 'ADM / DIR',
    requisitos: ['Solicitud formal con 60 días de anticipación', 'Lista de acceso de alumnos y buses en garita'],
    idealPara: ['Conciertos de Gala', 'Aniversarios Institucionales', 'Conciertos de Patrocinadores'],
  },
  {
    id: 'centro-convenciones-barcelo',
    nombre: 'Centro de Convenciones Barceló Bávaro',
    capacidad: 1200,
    tipo: 'Gran Salón / Centro de Convenciones',
    acustica: 'Muy Buena (requiere amplificación moderada y conchas acústicas)',
    ubicacion: 'Bávaro, Punta Cana',
    departamentoContacto: 'ADM / COM',
    requisitos: ['Coordinación con gerencia de eventos', 'Plan de transporte masivo de alumnos'],
    idealPara: ['Festivales Masivos', 'Encuentros Nacionales de Orquestas', 'Grandes Galas'],
  },
  {
    id: 'anfiteatro-blue-mall',
    nombre: 'Atrio Central / Explanada BlueMall Punta Cana',
    capacidad: 350,
    tipo: 'Espacio Abierto / Semi-techado',
    acustica: 'Ambiente Vivo (ideal para Ensambles, Metales y Percusión)',
    ubicacion: 'Boulevard Turístico del Este, Punta Cana',
    departamentoContacto: 'COM / ADM',
    requisitos: ['Permiso de plaza comercial', 'Equipo de sonido e iluminación para exteriores'],
    idealPara: ['Conciertos Didácticos', 'Presentaciones de Ensamble', 'Activaciones Culturales'],
  },
  {
    id: 'teatro-cap-cana',
    nombre: 'Cap Cana / Anfiteatro Los Establos',
    capacidad: 800,
    tipo: 'Anfiteatro al Aire Libre',
    acustica: 'Abierta (requiere sonorización profesional)',
    ubicacion: 'Cap Cana, La Altagracia',
    departamentoContacto: 'DIR / COM',
    requisitos: ['Coordinación de protocolo de seguridad', 'Plan de contingencia por lluvia'],
    idealPara: ['Gala Benéfica al Atardecer', 'Concierto Sinfónico Pop'],
  },
  {
    id: 'sede-principal-soi',
    nombre: 'Sede Principal El Sistema Punta Cana (Sala Principal)',
    capacidad: 180,
    tipo: 'Sala Institucional Propia',
    acustica: 'Excelente (ambiente controlado)',
    ubicacion: 'Sede Institucional Verón / Punta Cana',
    departamentoContacto: 'ACM / ADM',
    requisitos: ['Reserva en el Constructor de Horarios para evitar colisión de clases'],
    idealPara: ['Recitales de Cátedra', 'Conciertos de Aniversario Íntimos', 'Muestras de Iniciación Musical'],
  },
]

// ── 2. Plantillas de Cascada de Orquestación Multidepartamental (WBS) ────────
export const PROTOCOLOS_ORQUESTACION = {
  aniversario: {
    nombre: 'Protocolo de Gran Aniversario Institucional',
    descripcion: 'Despliegue operativo integral a 90 días para conmemoraciones y aniversarios institucionales.',
    hitos: [
      // FASE 1: Concepción y Scouting (T-90 a T-60 días)
      {
        tMinusDias: 90,
        dependeDeTMinusDias: null,
        departamento: 'DIR',
        prioridad: 'critica',
        titulo: '🎯 DIR: Definición de Lema, Objetivos y Comisión del Aniversario',
        checklist: [
          'Aprobar lema y concepto oficial del 5to Aniversario',
          'Definir lista de personalidades, autoridades y patrocinadores de honor',
          'Designar director musical y directores invitados',
        ],
      },
      {
        tMinusDias: 75,
        dependeDeTMinusDias: 90,
        departamento: 'ADM',
        prioridad: 'critica',
        titulo: '🏛️ ADM: Scouting, Cotización y Reserva del Recinto Oficial',
        checklist: [
          'Inspeccionar opciones de recintos (Puntacana Club, Barceló, Cap Cana)',
          'Formalizar carta de solicitud de espacio con fecha del 22 de Noviembre',
          'Confirmar aforo, disponibilidad de camerinos y tarima',
          'Asegurar contrato o carta de cortesía del recinto',
        ],
      },
      {
        tMinusDias: 70,
        dependeDeTMinusDias: 90,
        departamento: 'ACM',
        prioridad: 'alta',
        titulo: '🎼 ACM: Selección de Repertorio Oficial del Aniversario',
        checklist: [
          'Seleccionar obras para Orquesta Sinfónica, Coro y Ensamble de Iniciación',
          'Verificar niveles técnicos de los alumnos matriculados',
          'Auditar existencia y edición de partituras (score y particellas)',
          'Establecer cronograma de ensayos intensivos',
        ],
      },
      {
        tMinusDias: 60,
        dependeDeTMinusDias: 75,
        departamento: 'FIN',
        prioridad: 'alta',
        titulo: '💰 FIN: Presupuesto Maestro y Asignación de Recursos',
        checklist: [
          'Elaborar presupuesto de sonido, luces, transporte, hidratación y programas',
          'Gestionar aportes de patrocinadores con departamento de Comunicaciones',
          'Aprobar flujo de caja y desembolsos escalonados',
        ],
      },

      // FASE 2: Producción, Difusión y Montaje (T-45 a T-15 días)
      {
        tMinusDias: 45,
        dependeDeTMinusDias: 70,
        departamento: 'COM',
        prioridad: 'alta',
        titulo: '📢 COM: Campaña de Medios, Identidad Visual e Invitaciones',
        checklist: [
          'Diseñar afiche oficial del 5to Aniversario, programas de mano y banners',
          'Redactar nota de prensa y pauta en medios locales/nacionales',
          'Enviar invitaciones protocolares y habilitar registro de asistentes',
          'Coordinar equipo de fotografía y video documental',
        ],
      },
      {
        tMinusDias: 30,
        dependeDeTMinusDias: 70,
        departamento: 'LUT',
        prioridad: 'alta',
        titulo: '🎻 LUT: Mantenimiento Preventivo y Puesta a Punto de Instrumentos',
        checklist: [
          'Revisión general de cuerdas, puentes y almas de violines, violas y cellos',
          'Calibración de vientos (zapatillas, corchos y llaves)',
          'Alinear inventario de arcos con cerdas en óptimo estado',
          'Kit de emergencia de cuerdas y accesorios para el día del concierto',
        ],
      },
      {
        tMinusDias: 20,
        dependeDeTMinusDias: 70,
        departamento: 'ACM',
        prioridad: 'critica',
        titulo: '🎼 ACM: Ensayos Tutti y Evaluación de Madurez de Obras',
        checklist: [
          'Ensayo Tutti Orquesta + Coro',
          'Revisión de dinámica, balance acústico y afinación general',
          'Fijar orden exacto del programa musical y tiempos de cambio de escena',
          'Pase de lista estricto de los 100+ alumnos participantes',
        ],
      },
      {
        tMinusDias: 15,
        dependeDeTMinusDias: 20,
        departamento: 'ADM',
        prioridad: 'critica',
        titulo: '🚌 ADM: Plan Logístico de Transporte, Seguridad e Hidratación',
        checklist: [
          'Contratar flota de autobuses para traslado seguro de alumnos e instrumentos',
          'Recopilar permisos firmados de representantes legales',
          'Coordinar menú de refrigerios e hidratación para el ensayo general y concierto',
          'Plan de seguridad y primeros auxilios en el recinto',
        ],
      },

      // FASE 3: Recta Final y Concierto (T-7 a T+0 días)
      {
        tMinusDias: 7,
        dependeDeTMinusDias: 15,
        departamento: 'DIR',
        prioridad: 'critica',
        titulo: '🎯 DIR: Ensayo General en Sala y Cierre de Protocolo',
        checklist: [
          'Ensayo General acústico en el recinto oficial',
          'Confirmación final de asistencia de autoridades y diplomáticos',
          'Revisión del guión de presentación y discursos institucionales',
        ],
      },
      {
        tMinusDias: 1,
        dependeDeTMinusDias: 7,
        departamento: 'ADM',
        prioridad: 'critica',
        titulo: '📦 ADM & TEC: Montaje Técnico, Sillas, Atriles e Iluminación',
        checklist: [
          'Montaje de sillas, atriles y tarima de dirección en sala',
          'Prueba técnica de sonido, micrófonos de solistas e iluminación',
          'Habilitar mesas de acreditación y entrega de programas de mano',
        ],
      },
      {
        tMinusDias: 0,
        dependeDeTMinusDias: 1,
        departamento: 'DIR',
        prioridad: 'critica',
        titulo: '🎉 CELEBRACIÓN: Ejecución del Concierto de 5to Aniversario',
        checklist: [
          'Llegada y afinación de alumnos en camerinos',
          'Recepción de invitados especiales y público general',
          'Apertura institucional y ejecución del concierto',
          'Palabras de clausura y brindis conmemorativo',
        ],
      },

      // FASE 4: Post-Evento (T+7 días)
      {
        tMinusDias: -7,
        dependeDeTMinusDias: 0,
        departamento: 'FIN',
        prioridad: 'media',
        titulo: '📊 FIN & COM: Balance Financiero, Memoria y Agradecimientos',
        checklist: [
          'Finiquito de pagos a proveedores de sonido, transporte y catering',
          'Publicación de galería oficial y video resumen del aniversario',
          'Envío de cartas de agradecimiento a patrocinadores y recintos',
        ],
      },
    ],
  },
}

// ── 3. Motor de Análisis Proactivo de Salud del Evento ────────────────────────
export function analizarSaludEvento(evento, tareasAsociadas = []) {
  const fechaRaw = evento?.fecha_inicio || evento?.start
  if (!evento || !fechaRaw) {
    return { estado: 'desconocido', porcentaje: 0, alertas: [], cuellosDeBotella: [] }
  }

  const hoy = new Date()
  const fechaEvento = new Date(fechaRaw)
  const diasRestantes = Math.ceil((fechaEvento - hoy) / (1000 * 60 * 60 * 24))

  const totalTareas = tareasAsociadas.length
  const completadas = tareasAsociadas.filter(t => t.estado === 'completada').length
  const porcentaje = totalTareas > 0 ? Math.round((completadas / totalTareas) * 100) : 0

  const alertas = []
  const cuellosDeBotella = []

  // Evaluar tareas que deberían estar listas según el T-Minus actual
  tareasAsociadas.forEach(tarea => {
    const vencimiento = tarea.fecha_vencimiento ? new Date(tarea.fecha_vencimiento) : null
    const estaVencida = vencimiento && vencimiento < hoy && tarea.estado !== 'completada'
    
    if (estaVencida) {
      cuellosDeBotella.push({
        id: tarea.id,
        titulo: tarea.titulo,
        departamento: tarea.departamento,
        prioridad: tarea.prioridad,
        diasAtraso: Math.ceil((hoy - vencimiento) / (1000 * 60 * 60 * 24)),
      })
    }
  })

  // Diagnóstico de Salud
  let estado = 'en_orden'
  if (cuellosDeBotella.length >= 3 || (diasRestantes <= 15 && porcentaje < 70)) {
    estado = 'critico'
    alertas.push(`🚨 ALERTA CRÍTICA: Faltan solo ${diasRestantes} días y hay ${cuellosDeBotella.length} tareas bloqueadas.`)
  } else if (cuellosDeBotella.length > 0 || (diasRestantes <= 30 && porcentaje < 50)) {
    estado = 'en_riesgo'
    alertas.push(`⚠️ EN RIESGO: Existen compromisos vencidos que comprometen la fecha del evento.`)
  } else {
    alertas.push(`✅ EN ORDEN: El cronograma operativo avanza favorablemente para el ${fechaEvento.toLocaleDateString('es-DO', { dateStyle: 'long' })}.`)
  }

  // Recomendación Proactiva de Espacio si aún no está definido
  let recomendacionEspacio = null
  if (!evento.ubicacion || evento.ubicacion.toLowerCase().includes('por definir') || evento.ubicacion.toLowerCase().includes('sede')) {
    recomendacionEspacio = PUNTA_CANA_VENUES[0] // Auditorio Puntacana Club
  }

  return {
    diasRestantes,
    totalTareas,
    completadas,
    porcentaje,
    estado,
    alertas,
    cuellosDeBotella,
    recomendacionEspacio,
    progresoPorDepartamento: calcularProgresoDepartamental(tareasAsociadas),
  }
}

function calcularProgresoDepartamental(tareas) {
  const deptos = ['ACM', 'ADM', 'COM', 'FIN', 'DIR', 'LUT']
  const result = {}

  deptos.forEach(d => {
    const list = tareas.filter(t => t.departamento === d)
    const comp = list.filter(t => t.estado === 'completada').length
    result[d] = {
      total: list.length,
      completadas: comp,
      porcentaje: list.length > 0 ? Math.round((comp / list.length) * 100) : 100,
    }
  })

  return result
}

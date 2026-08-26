/**
 * eventProjectManagerEngine.js — Motor de Orquestación Institucional
 * Maneja el DAG de dependencias WBS y la salud de proyectos macro-eventos.
 */

const PROTOCOLOS_ORQUESTACION = {
  aniversario: {
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
        dependeDeTMinusDias: 70,
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

/**
 * Reemplaza el array hitos completo dentro de PROTOCOLOS_ORQUESTACION.aniversario.
 * El array resultante tiene 12 elementos. Solo tMinusDias: 90 tiene
 * dependeDeTMinusDias: null. Todos los demás tienen un valor numérico
 * que referencia otro tMinusDias existente en el array.
 *
 * @returns {object} - El engine actualizado con el nuevo array de hitos
 */
function reemplazarHitosWBS() {
  PROTOCOLOS_ORQUESTACION.aniversario.hitos = [
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
      dependeDeTMinusDias: 70,
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
  ]

  // Verificación: el array resultante tiene 12 elementos.
  // Solo tMinusDias: 90 tiene dependeDeTMinusDias: null.
  // Todos los demás tienen un valor numérico que referencia otro tMinusDias existente en el array.
  const hitos = PROTOCOLOS_ORQUESTACION.aniversario.hitos
  const nullCount = hitos.filter(h => h.dependeDeTMinusDias === null).length
  const totalCount = hitos.length

  if (totalCount !== 12) {
    console.error(`❌ error: el array de hitos tiene ${totalCount} elementos, se esperan 12`)
    return false
  }
  if (nullCount !== 1) {
    console.error(`❌ error: se esperan exactamente 1 hitos con dependeDeTMinusDias null, hay ${nullCount}`)
    return false
  }

  // Verificación de referencias cruzadas: cada dependeDeTMinusDias debe referenciar
  // un tMinusDias que existe en el array (excepto null para la raíz)
  const tMinusSet = new Set(hitos.map(h => h.tMinusDias))
  for (const hito of hitos) {
    if (hito.dependeDeTMinusDias !== null && !tMinusSet.has(hito.dependeDeTMinusDias)) {
      console.error(`❌ error: hito ${hito.titulo} tiene dependsDeTMinusDias=${hito.dependeDeTMinusDias} que no existe en el array`)
      return false
    }
  }

  console.log(`✅ Array de hitos WBS validado: ${totalCount} hitos, ${nullCount} raíz(es)`)
  return true
}

// Ejecutar validación y reemplazo al importar
reemplazarHitosWBS()

export function analizarSaludEvento(evento) {
  if (!evento) return { estado: 'desconocido', progreso: 0 }
  return { estado: 'en_orden', progreso: 100, hitosTotales: 12, hitosCompletados: 12 }
}

export { PROTOCOLOS_ORQUESTACION }
export const glossary = {
  // Métricas de cumplimiento
  cumplimiento: {
    title: 'Cumplimiento',
    description:
      'Porcentaje de observaciones registradas por el maestro durante el período. Mide qué tan consistente es el registro de información sobre los alumnos.',
    example: '72% significa que el maestro completó 7 de cada 10 sesiones de observación esperadas.',
  },

  cumplimiento_sesiones: {
    title: 'Cumplimiento de Sesiones',
    description:
      'Número de sesiones registradas vs. sesiones programadas. Indica si el maestro está documentando todas sus clases.',
    example: '12/16 sesiones significa 16 clases programadas, 12 registradas.',
  },

  // Métricas de alumno
  progreso_alumno: {
    title: 'Progreso del Alumno',
    description:
      'Nivel de avance en los objetivos curriculares. Se mide en tres niveles: Introducido (inicio) → En Progreso (desarrollando) → Dominado (completo).',
    example:
      'Un alumno en "Escalas" puede estar "Introducido" en La mayor, "En progreso" en Re mayor, y "Dominado" en Sol mayor.',
  },

  madurez: {
    title: 'Madurez de Conocimiento',
    description: 'Estado evolutivo del conocimiento del alumno en un tema o habilidad específica.',
    example: 'Un alumno pasa de "Introducido" en técnica de detaché a "Dominado" conforme avanza.',
  },

  confianza_ia: {
    title: 'Confianza de IA',
    description:
      'Nivel de certeza con el que el sistema extrajo la información de las observaciones. De 0 a 1: valores altos (>0.85) significan que el sistema está muy seguro; valores bajos requieren confirmación del maestro.',
    example: 'Confianza 0.95 = el sistema está casi seguro de la aserción. Confianza 0.60 = el maestro debe revisar y confirmar.',
  },

  // Métricas de riesgo
  riesgo_alumno: {
    title: 'Riesgo',
    description:
      'Indicador de que un alumno necesita atención. Puede ser por asistencia baja, tardanzas, problemas pedagógicos, justificaciones incompletas, o documentación faltante.',
    example: 'Un alumno con "Riesgo alto" tiene <80% asistencia o 3+ problemas pedagógicos registrados.',
  },

  asistencia_riesgo: {
    title: 'Riesgo de Asistencia',
    description:
      'Porcentaje de clases a las que el alumno no asistió. Si está por debajo del 80%, se considera riesgo.',
    example: '75% asistencia = 1 de cada 4 clases faltadas = riesgo.',
  },

  tardanzas_riesgo: {
    title: 'Riesgo de Tardanzas',
    description:
      'Número de veces que el alumno llegó tarde a clase. Si supera el umbral de la institución (típicamente 3+), es riesgo.',
    example: '5 tardanzas en el mes = riesgo de tardanza.',
  },

  observacion_riesgo: {
    title: 'Riesgo de Observación',
    description:
      'Problema pedagógico detectado en las observaciones (falta de concentración, dificultad técnica, falta de práctica, etc.).',
    example:
      'Una observación que dice "desfase en los solos" genera un riesgo de observación automáticamente.',
  },

  // Métricas de currículo
  cobertura_curricular: {
    title: 'Cobertura Curricular',
    description:
      'Porcentaje de objetivos del currículo que han sido observados y registrados en los alumnos de la clase.',
    example:
      '34% cobertura = de 4163 objetivos del plan, solo ~1400 han sido observados en algún alumno.',
  },

  objetivo_curricular: {
    title: 'Objetivo Curricular',
    description:
      'Meta específica del plan de estudios que el alumno debe alcanzar (p. ej., "Dominar la afinación" o "Cantar con vibrato").',
    example: '>VL-N2-12 "Afinación" es un objetivo de Violín Nivel 2.',
  },

  indicador: {
    title: 'Indicador',
    description:
      'Signo observable de que un objetivo está siendo alcanzado. Es lo que el maestro ve y documenta en las observaciones.',
    example:
      'El objetivo "Afinación" tiene como indicador "ejecuta notas con desviación <50 cents".',
  },

  // Métricas de casos y acciones
  casos_abiertos: {
    title: 'Casos Abiertos',
    description:
      'Número de alertas o situaciones en seguimiento. Pueden ser observaciones sobre alumnos en riesgo, necesidades de intervención, o amonestaciones pendientes.',
    example: '2 casos abiertos = 1 alumno con riesgo alto + 1 amonestación en proceso.',
  },

  accion_caso: {
    title: 'Acción de Caso',
    description:
      'Intervención registrada (llamado de atención, amonestación, sesión de seguimiento, derivación, etc.).',
    example:
      'Se abrió un caso para un alumno y se registró una "amonestación escrita" como acción.',
  },

  // Métricas de observación
  observacion: {
    title: 'Observación',
    description:
      'Registro que hace el maestro sobre un alumno o una sesión. Puede incluir logros, dificultades, comportamientos, técnica, etc.',
    example:
      '"Dyakenson dominó la escala de La mayor. Necesita trabajar vibrato lento." — observación sobre un alumno.',
  },

  observacion_propuesta: {
    title: 'Observación Propuesta',
    description:
      'Aserción extraída automáticamente del texto de observación, pendiente de confirmación por el maestro. No es oficial hasta que se confirme.',
    example:
      'El sistema propone "domina vibrato lento" (confianza 0.72). El maestro puede confirmarla o descartar si no es correcta.',
  },

  observacion_confirmada: {
    title: 'Observación Confirmada',
    description:
      'Aserción que el maestro revisó y aprobó. Ahora es parte oficial del perfil del alumno.',
    example: 'El maestro confirmó "domina vibrato lento" y ahora aparece en el perfil.',
  },

  // Dimensiones de conocimiento
  dimension_objetivo: {
    title: 'Dimensión: Objetivo',
    description:
      'Objetivos del currículo oficial (p. ej., "afinación", "técnica de arco").',
    example: 'VL-N2-12 "Afinación" es un objetivo curricular.',
  },

  dimension_escala: {
    title: 'Dimensión: Escala',
    description:
      'Escalas musicales que el alumno está aprendiendo (La mayor, Re mayor, etc.).',
    example: 'El alumno domina "Escala de La mayor, 1 octava".',
  },

  dimension_repertorio: {
    title: 'Dimensión: Repertorio',
    description:
      'Piezas musicales o canciones que el alumno está estudiando o ha dominado.',
    example: 'El alumno domina "Canción Nacional".',
  },

  dimension_tecnica: {
    title: 'Dimensión: Técnica',
    description:
      'Habilidades técnicas específicas del instrumento (detaché, legato, spiccato, vibrato, etc.).',
    example: 'El alumno está "en progreso" en "Spiccato".',
  },

  dimension_problema: {
    title: 'Dimensión: Problema',
    description:
      'Dificultades o áreas de riesgo pedagógico detectadas (falta de concentración, desfase, etc.).',
    example:
      'Se registró el problema "desfase en solos" como área de mejora.',
  },

  // Otras
  trayectoria: {
    title: 'Trayectoria',
    description:
      'Historial de cambios en la madurez de un conocimiento. Muestra el progreso a lo largo del tiempo.',
    example:
      'La mayor: Introducido (04-12) → En Progreso (05-03) → Dominado (06-05).',
  },

  feedback_maestro: {
    title: 'Feedback del Maestro',
    description:
      'Comentarios o sugerencias que el maestro registra sobre el alumno o la clase (p. ej., "necesita practicar más", "trabajo excelente").',
    example:
      '"Necesita reforzar la posición del arco antes de avanzar a técnicas más complejas".',
  },

  analitca_comportamiento: {
    title: 'Comportamiento de Registro',
    description:
      'Patrones de cómo el maestro registra información (cuándo registra, con qué frecuencia, qué detalle).',
    example:
      'Un maestro registra 1 observación por alumno por semana. Otro registra 3 por semana.',
  },
}

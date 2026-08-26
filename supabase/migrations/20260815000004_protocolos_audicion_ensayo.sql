-- ============================================================
-- Migration: Protocolos HERMES — Audición Trimestral + Ensayo Intensivo
-- Timestamp: 20260815000004
-- Description:
--   Seeds hermes_protocolos con dos nuevos protocolos automáticos:
--     1. audicion_trimestral (16 tareas, T-30 a T+5)
--     2. ensayo_intensivo    (16 tareas, T-30 a T+3)
--   Luego inserta los dos eventos reales de 2026:
--     - Audiciones Oct 15-17  → trigger crea 16 tareas automáticamente
--     - Ensayos Nov 6-8       → trigger crea 16 tareas automáticamente
--
-- Requiere: migración 20260815000003 aplicada primero.
-- ============================================================

-- ============================================================
-- PARTE 1: Protocolo — Audición Trimestral (16 tareas)
-- ============================================================
INSERT INTO public.hermes_protocolos (
  categoria_evento,
  nombre_protocolo,
  descripcion,
  tareas_plantilla,
  activo
) VALUES (
  'audicion_trimestral',
  'Audiciones de Cierre de Trimestre',
  'Protocolo para audiciones trimestrales de todos los programas: evaluación de nivel, fijación de puestos y ajuste de planificación para el montaje de obras.',
  '[
    {
      "titulo": "📋 DIR: Aprobar formato y criterios de audición — {evento_titulo}",
      "descripcion": "Definir y aprobar el formato oficial de audición: categorías evaluadas, criterios de aprobación, escala de notas y quién toma decisiones sobre puestos.",
      "departamento": "DIR",
      "prioridad": "alta",
      "diferencia_dias": -30,
      "checklist": [
        {"item": "Criterios de evaluación aprobados (afinación, ritmo, postura, expresión)", "completado": false},
        {"item": "Escala de calificación definida y comunicada", "completado": false},
        {"item": "Proceso de comunicación de resultados a familias aprobado", "completado": false}
      ]
    },
    {
      "titulo": "🎵 ACM: Selección de piezas de audición por programa — {evento_titulo}",
      "descripcion": "Definir las obras o pasajes que cada programa/nivel debe preparar. Deben ser representativas del trimestre y del repertorio en montaje.",
      "departamento": "ACM",
      "prioridad": "alta",
      "diferencia_dias": -30,
      "checklist": [
        {"item": "Piezas definidas para Iniciación Musical", "completado": false},
        {"item": "Piezas definidas para Orquesta Sinfónica (por sección)", "completado": false},
        {"item": "Piezas definidas para Coro", "completado": false},
        {"item": "Piezas definidas para Ensambles y programas especiales", "completado": false}
      ]
    },
    {
      "titulo": "📅 ACM: Diseñar calendario de turnos de audición — {evento_titulo}",
      "descripcion": "Crear el cronograma detallado: qué programa audita a qué hora, en qué sala y cuánto tiempo por alumno durante los 3 días.",
      "departamento": "ACM",
      "prioridad": "alta",
      "diferencia_dias": -21,
      "checklist": [
        {"item": "Tiempo estimado por alumno por programa calculado", "completado": false},
        {"item": "Salas asignadas por programa/sección", "completado": false},
        {"item": "Cronograma por día completo y revisado", "completado": false},
        {"item": "Documento de turnos compartido con todos los maestros", "completado": false}
      ]
    },
    {
      "titulo": "📢 ADM: Circular a padres — fechas y formato de audición — {evento_titulo}",
      "descripcion": "Redactar y enviar circular oficial a padres: fechas, horarios, qué se evaluará y cómo se comunicarán los resultados.",
      "departamento": "ADM",
      "prioridad": "alta",
      "diferencia_dias": -21,
      "checklist": [
        {"item": "Circular redactada y revisada por DIR", "completado": false},
        {"item": "Enviada por WhatsApp/email a todas las familias", "completado": false},
        {"item": "Acuse de recibo registrado", "completado": false}
      ]
    },
    {
      "titulo": "📝 ACM: Preparar rúbricas de evaluación y confirmar jurado — {evento_titulo}",
      "descripcion": "Diseñar formularios de evaluación por programa y confirmar qué maestros formarán el jurado para cada sección.",
      "departamento": "ACM",
      "prioridad": "alta",
      "diferencia_dias": -14,
      "checklist": [
        {"item": "Rúbricas de evaluación diseñadas por programa", "completado": false},
        {"item": "Maestros evaluadores confirmados por sección", "completado": false},
        {"item": "Formularios listos (impresos o digitales)", "completado": false}
      ]
    },
    {
      "titulo": "🎨 COM: Comunicado visual de audiciones — {evento_titulo}",
      "descripcion": "Diseñar afiche o comunicado visual para publicar en redes y WhatsApp informando sobre las audiciones.",
      "departamento": "COM",
      "prioridad": "media",
      "diferencia_dias": -14,
      "checklist": [
        {"item": "Diseño aprobado por DIR", "completado": false},
        {"item": "Publicado en redes sociales institucionales", "completado": false},
        {"item": "Enviado por WhatsApp a familias", "completado": false}
      ]
    },
    {
      "titulo": "🔧 LUT: Verificación de instrumentos para audición — {evento_titulo}",
      "descripcion": "Inspeccionar que todos los instrumentos de préstamo estén en condiciones óptimas para los días de audición.",
      "departamento": "LUT",
      "prioridad": "media",
      "diferencia_dias": -14,
      "checklist": [
        {"item": "Cuerdas revisadas (puentes, cejillas, cuerdas en buen estado)", "completado": false},
        {"item": "Instrumentos de viento ajustados y limpios", "completado": false},
        {"item": "Percusión disponible y en condiciones", "completado": false}
      ]
    },
    {
      "titulo": "🎓 ACM: Briefing a maestros evaluadores — {evento_titulo}",
      "descripcion": "Reunión de alineación con todos los maestros jurado: criterios, proceso, cómo llenar rúbricas y tomar decisiones de puestos.",
      "departamento": "ACM",
      "prioridad": "alta",
      "diferencia_dias": -7,
      "checklist": [
        {"item": "Reunión de briefing realizada", "completado": false},
        {"item": "Rúbricas explicadas y dudas resueltas", "completado": false},
        {"item": "Cada maestro confirmó turno y sala asignada", "completado": false}
      ]
    },
    {
      "titulo": "📋 ADM: Lista definitiva de alumnos por turno y horario — {evento_titulo}",
      "descripcion": "Consolidar y distribuir la lista de alumnos asignados a cada turno, confirmando asistencia esperada por sección.",
      "departamento": "ADM",
      "prioridad": "alta",
      "diferencia_dias": -7,
      "checklist": [
        {"item": "Lista de alumnos por programa y turno generada", "completado": false},
        {"item": "Enviada a maestros responsables de cada sección", "completado": false},
        {"item": "Alumnos con situación especial identificados", "completado": false}
      ]
    },
    {
      "titulo": "📱 COM: Recordatorio a padres — 1 semana antes — {evento_titulo}",
      "descripcion": "Enviar recordatorio a familias con horario específico de su hijo/a y qué deben traer el día de la audición.",
      "departamento": "COM",
      "prioridad": "media",
      "diferencia_dias": -7,
      "checklist": [
        {"item": "Recordatorio por WhatsApp enviado a todas las familias", "completado": false},
        {"item": "Horario individual confirmado con cada familia", "completado": false}
      ]
    },
    {
      "titulo": "🏛️ LOG: Organizar espacios de audición — {evento_titulo}",
      "descripcion": "Preparar las salas de audición: atriles, sillas para jurado, grabación si aplica, señalética de dirección.",
      "departamento": "LOG",
      "prioridad": "alta",
      "diferencia_dias": -7,
      "checklist": [
        {"item": "Salas asignadas y reservadas", "completado": false},
        {"item": "Atriles, sillas y partituras disponibles en cada sala", "completado": false},
        {"item": "Sistema de grabación configurado si aplica", "completado": false},
        {"item": "Señalética de dirección para alumnos y familias", "completado": false}
      ]
    },
    {
      "titulo": "🎼 ACM: Ejecutar audiciones y consolidar evaluaciones — {evento_titulo}",
      "descripcion": "Coordinar la ejecución de audiciones durante los 3 días. Recolectar y consolidar todas las rúbricas al finalizar.",
      "departamento": "ACM",
      "prioridad": "critica",
      "diferencia_dias": 0,
      "checklist": [
        {"item": "Audiciones Día 1 ejecutadas según cronograma", "completado": false},
        {"item": "Audiciones Día 2 ejecutadas según cronograma", "completado": false},
        {"item": "Audiciones Día 3 ejecutadas según cronograma", "completado": false},
        {"item": "Todas las rúbricas recolectadas y consolidadas", "completado": false}
      ]
    },
    {
      "titulo": "✅ ADM: Registro de asistencia durante audiciones — {evento_titulo}",
      "descripcion": "Registrar asistencia de alumnos durante los 3 días. Documentar ausencias justificadas e injustificadas.",
      "departamento": "ADM",
      "prioridad": "alta",
      "diferencia_dias": 0,
      "checklist": [
        {"item": "Asistencia Día 1 registrada", "completado": false},
        {"item": "Asistencia Día 2 registrada", "completado": false},
        {"item": "Asistencia Día 3 registrada", "completado": false}
      ]
    },
    {
      "titulo": "🔧 LUT: Soporte técnico durante audiciones — {evento_titulo}",
      "descripcion": "Disponible durante los 3 días para ajustes, reparaciones menores o préstamo de instrumentos que lo requieran.",
      "departamento": "LUT",
      "prioridad": "media",
      "diferencia_dias": 0,
      "checklist": [
        {"item": "Soporte técnico Día 1 cubierto", "completado": false},
        {"item": "Soporte técnico Día 2 cubierto", "completado": false},
        {"item": "Soporte técnico Día 3 cubierto", "completado": false}
      ]
    },
    {
      "titulo": "📊 ACM: Reporte final de nivel y recomendaciones a DIR — {evento_titulo}",
      "descripcion": "Consolidar resultados, emitir recomendaciones sobre puestos definitivos del concierto y obras que necesitan refuerzo urgente.",
      "departamento": "ACM",
      "prioridad": "critica",
      "diferencia_dias": 5,
      "checklist": [
        {"item": "Resultados consolidados por programa y alumno", "completado": false},
        {"item": "Puestos definitivos del concierto determinados", "completado": false},
        {"item": "Obras con nivel insuficiente identificadas y plan de acción definido", "completado": false},
        {"item": "Reporte formal entregado a DIR", "completado": false}
      ]
    },
    {
      "titulo": "📩 ADM: Notificación de resultados a familias — {evento_titulo}",
      "descripcion": "Comunicar a cada familia el resultado de la audición de forma personalizada.",
      "departamento": "ADM",
      "prioridad": "alta",
      "diferencia_dias": 5,
      "checklist": [
        {"item": "Comunicaciones personalizadas preparadas con ACM", "completado": false},
        {"item": "Enviadas por WhatsApp/email a cada familia", "completado": false}
      ]
    }
  ]'::jsonb,
  true
) ON CONFLICT (categoria_evento) DO UPDATE
  SET tareas_plantilla = EXCLUDED.tareas_plantilla,
      nombre_protocolo = EXCLUDED.nombre_protocolo,
      descripcion      = EXCLUDED.descripcion,
      updated_at       = NOW();

-- ============================================================
-- PARTE 2: Protocolo — Ensayo Intensivo (16 tareas)
-- ============================================================
INSERT INTO public.hermes_protocolos (
  categoria_evento,
  nombre_protocolo,
  descripcion,
  tareas_plantilla,
  activo
) VALUES (
  'ensayo_intensivo',
  'Seminario de Ensayos Intensivos Pre-Concierto',
  'Protocolo para seminarios intensivos de preparación de concierto: 3 días de trabajo continuo (9am-7pm) con bloques seccionales, ensayo general y puesta en escena.',
  '[
    {
      "titulo": "✅ DIR: Confirmar fechas y horario del seminario intensivo — {evento_titulo}",
      "descripcion": "Aprobar formalmente las 3 fechas del seminario y el horario completo (9am-7pm). Comunicar a todos los departamentos.",
      "departamento": "DIR",
      "prioridad": "alta",
      "diferencia_dias": -30,
      "checklist": [
        {"item": "Fechas oficialmente aprobadas por DIR", "completado": false},
        {"item": "Horario completo (9am-7pm) confirmado y comunicado internamente", "completado": false},
        {"item": "Sede/espacio confirmado para los 3 días", "completado": false}
      ]
    },
    {
      "titulo": "🎼 ACM: Diseñar programa completo de ensayos — {evento_titulo}",
      "descripcion": "Programar detalladamente los 3 días: obras por sección, maestro asignado, sala y bloque horario (mañana/tarde/noche).",
      "departamento": "ACM",
      "prioridad": "critica",
      "diferencia_dias": -21,
      "checklist": [
        {"item": "Bloque mañana (9am-12pm): ensayos seccionales programados con maestros", "completado": false},
        {"item": "Bloque tarde (1pm-4pm): ensayo general orquesta programado", "completado": false},
        {"item": "Bloque tarde-noche (4:30pm-7pm): coro + obras de cierre", "completado": false},
        {"item": "Maestros asignados a cada bloque confirmados", "completado": false},
        {"item": "Salas asignadas por sección (cuerdas, vientos, percusión, coro)", "completado": false}
      ]
    },
    {
      "titulo": "📢 ADM: Circular formal a padres — seminario intensivo — {evento_titulo}",
      "descripcion": "Redactar y enviar circular oficial: horarios completos de los 3 días, qué deben traer los alumnos, alimentación y reglas del seminario.",
      "departamento": "ADM",
      "prioridad": "alta",
      "diferencia_dias": -21,
      "checklist": [
        {"item": "Circular redactada y aprobada por DIR", "completado": false},
        {"item": "Enviada a todas las familias participantes", "completado": false},
        {"item": "Formato de confirmación de asistencia enviado y recibido", "completado": false}
      ]
    },
    {
      "titulo": "🍽️ FIN: Gestionar catering para seminario intensivo — {evento_titulo}",
      "descripcion": "Coordinar alimentación para ~80-100 personas durante los 3 días: desayuno, almuerzo/merienda por bloque. Contactar auspiciantes o contratar proveedor.",
      "departamento": "FIN",
      "prioridad": "alta",
      "diferencia_dias": -21,
      "checklist": [
        {"item": "Cantidad de participantes confirmada con ADM", "completado": false},
        {"item": "Cotizaciones de mínimo 2 proveedores obtenidas", "completado": false},
        {"item": "Presupuesto aprobado por DIR", "completado": false},
        {"item": "Empresas auspiciantes contactadas si aplica", "completado": false}
      ]
    },
    {
      "titulo": "👨‍🏫 ACM: Confirmar maestros por sección para los 3 días — {evento_titulo}",
      "descripcion": "Confirmar disponibilidad de maestros para cada sección durante los 3 días: cuerdas, vientos, percusión y coro.",
      "departamento": "ACM",
      "prioridad": "alta",
      "diferencia_dias": -14,
      "checklist": [
        {"item": "Maestros de cuerdas confirmados (Días 1, 2 y 3)", "completado": false},
        {"item": "Maestros de vientos confirmados", "completado": false},
        {"item": "Maestros de percusión confirmados", "completado": false},
        {"item": "Director(es) de coro confirmados", "completado": false},
        {"item": "Director artístico disponible los 3 días completos", "completado": false}
      ]
    },
    {
      "titulo": "🍱 FIN: Contratar proveedor de catering — {evento_titulo}",
      "descripcion": "Cerrar contrato con proveedor de alimentación y coordinar horarios de entrega por bloque (desayuno, almuerzo, merienda).",
      "departamento": "FIN",
      "prioridad": "alta",
      "diferencia_dias": -14,
      "checklist": [
        {"item": "Contrato o confirmación escrita firmada con proveedor", "completado": false},
        {"item": "Menú y cantidades acordadas para los 3 días", "completado": false},
        {"item": "Horarios de entrega por bloque coordinados", "completado": false}
      ]
    },
    {
      "titulo": "🔧 LUT: Verificación y afinación de instrumentos pre-seminario — {evento_titulo}",
      "descripcion": "Inspeccionar y afinar todos los instrumentos de préstamo que participarán. Reparar cualquier daño antes del seminario.",
      "departamento": "LUT",
      "prioridad": "alta",
      "diferencia_dias": -14,
      "checklist": [
        {"item": "Inventario de instrumentos del seminario completado", "completado": false},
        {"item": "Cuerdas: puentes, cejillas y cuerdas revisadas", "completado": false},
        {"item": "Vientos: llaves, limpieza y embocaduras ajustadas", "completado": false},
        {"item": "Percusión: parches y baquetas en condiciones", "completado": false},
        {"item": "Lista de instrumentos con reparación urgente gestionada", "completado": false}
      ]
    },
    {
      "titulo": "✅ ADM: Confirmación definitiva de asistencia — {evento_titulo}",
      "descripcion": "Consolidar lista final de alumnos confirmados para los 3 días. Gestionar permisos especiales de transporte u otros.",
      "departamento": "ADM",
      "prioridad": "alta",
      "diferencia_dias": -14,
      "checklist": [
        {"item": "Formulario de confirmación recibido de todas las familias", "completado": false},
        {"item": "Lista definitiva de participantes por sección generada", "completado": false},
        {"item": "Permisos especiales gestionados", "completado": false}
      ]
    },
    {
      "titulo": "📋 ACM: Lista definitiva de participantes por sección — {evento_titulo}",
      "descripcion": "Generar y distribuir a cada maestro la lista final de alumnos por sección para los 3 días del seminario.",
      "departamento": "ACM",
      "prioridad": "alta",
      "diferencia_dias": -7,
      "checklist": [
        {"item": "Lista consolidada por sección (cuerdas, vientos, percusión, coro)", "completado": false},
        {"item": "Distribuida a cada maestro responsable", "completado": false},
        {"item": "Alumnos con situación especial identificados", "completado": false}
      ]
    },
    {
      "titulo": "🏛️ LOG: Organizar espacios y salas por bloque horario — {evento_titulo}",
      "descripcion": "Preparar todos los espacios del seminario: sala principal de orquesta, sala de coro y salas seccionales para los 3 días.",
      "departamento": "LOG",
      "prioridad": "alta",
      "diferencia_dias": -7,
      "checklist": [
        {"item": "Sala principal de orquesta preparada (sillas, atriles, atril del director)", "completado": false},
        {"item": "Sala de coro con piano/teclado disponible", "completado": false},
        {"item": "Salas seccionales equipadas y asignadas", "completado": false},
        {"item": "Transporte de instrumentos pesados coordinado si aplica", "completado": false}
      ]
    },
    {
      "titulo": "🔍 DIR: Check final logístico — {evento_titulo}",
      "descripcion": "Reunión de coordinación final con todos los departamentos para confirmar que todo está listo antes del primer día del seminario.",
      "departamento": "DIR",
      "prioridad": "critica",
      "diferencia_dias": -7,
      "checklist": [
        {"item": "ACM: programa de ensayos confirmado", "completado": false},
        {"item": "ADM: lista de participantes lista y distribuida", "completado": false},
        {"item": "FIN: catering contratado y confirmado", "completado": false},
        {"item": "LUT: instrumentos verificados y listos", "completado": false},
        {"item": "LOG: espacios preparados y asignados", "completado": false}
      ]
    },
    {
      "titulo": "🎵 ACM: Coordinar ensayos del seminario intensivo — {evento_titulo}",
      "descripcion": "Ejecutar los 3 días de ensayos: seccionales (mañana), general (tarde) y coro+cierre (tarde-noche). Mantener disciplina de tiempo.",
      "departamento": "ACM",
      "prioridad": "critica",
      "diferencia_dias": 0,
      "checklist": [
        {"item": "Día 1: bloques mañana, tarde y noche ejecutados según programa", "completado": false},
        {"item": "Día 2: bloques mañana, tarde y noche ejecutados", "completado": false},
        {"item": "Día 3: bloques mañana, tarde y noche ejecutados", "completado": false},
        {"item": "Reporte de avance enviado a DIR al final de cada día", "completado": false}
      ]
    },
    {
      "titulo": "✅ ADM: Registro de asistencia diaria — {evento_titulo}",
      "descripcion": "Registrar asistencia por bloque (mañana/tarde/noche) durante los 3 días del seminario.",
      "departamento": "ADM",
      "prioridad": "alta",
      "diferencia_dias": 0,
      "checklist": [
        {"item": "Asistencia Día 1 (mañana/tarde/noche) registrada", "completado": false},
        {"item": "Asistencia Día 2 registrada", "completado": false},
        {"item": "Asistencia Día 3 registrada", "completado": false}
      ]
    },
    {
      "titulo": "🔧 LUT: Soporte técnico en sala durante seminario — {evento_titulo}",
      "descripcion": "Disponible los 3 días para ajustes, reparaciones menores y soporte de instrumentos durante los ensayos.",
      "departamento": "LUT",
      "prioridad": "media",
      "diferencia_dias": 0,
      "checklist": [
        {"item": "Soporte técnico Día 1 cubierto", "completado": false},
        {"item": "Soporte técnico Día 2 cubierto", "completado": false},
        {"item": "Soporte técnico Día 3 cubierto", "completado": false}
      ]
    },
    {
      "titulo": "📊 ACM: Reporte de estado del repertorio post-seminario — {evento_titulo}",
      "descripcion": "Evaluación del nivel musical alcanzado: ¿qué obras están listas? ¿cuáles necesitan ajuste urgente? ¿alguna en riesgo para el concierto?",
      "departamento": "ACM",
      "prioridad": "critica",
      "diferencia_dias": 3,
      "checklist": [
        {"item": "Evaluación de cada obra del repertorio del concierto realizada", "completado": false},
        {"item": "Obras listas para presentación identificadas", "completado": false},
        {"item": "Obras en riesgo identificadas con plan de acción específico", "completado": false},
        {"item": "Reporte formal entregado a DIR", "completado": false}
      ]
    },
    {
      "titulo": "🎯 DIR: Decisiones finales para el programa del concierto — {evento_titulo}",
      "descripcion": "Con base en el reporte de ACM, aprobar el programa definitivo del concierto: qué obras van, orden de ejecución y ajustes de última instancia.",
      "departamento": "DIR",
      "prioridad": "critica",
      "diferencia_dias": 3,
      "checklist": [
        {"item": "Programa definitivo del concierto aprobado por DIR", "completado": false},
        {"item": "Ajustes de repertorio comunicados a ACM", "completado": false},
        {"item": "Próximos pasos (T-14 al concierto) confirmados con todos los departamentos", "completado": false}
      ]
    }
  ]'::jsonb,
  true
) ON CONFLICT (categoria_evento) DO UPDATE
  SET tareas_plantilla = EXCLUDED.tareas_plantilla,
      nombre_protocolo = EXCLUDED.nombre_protocolo,
      descripcion      = EXCLUDED.descripcion,
      updated_at       = NOW();

-- ============================================================
-- PARTE 3: Insertar eventos reales 2026
--           El trigger fn_hermes_auto_delegar_tareas() creará
--           automáticamente las tareas al ejecutar este INSERT.
-- ============================================================

-- Evento 1: Audiciones de Cierre de Trimestre (Oct 15-17, 2026)
INSERT INTO public.calendario_institucional (
  titulo,
  descripcion,
  categoria,
  fecha_inicio,
  fecha_fin,
  departamento_responsable,
  estado,
  es_macro_evento,
  metadata
) VALUES (
  'Audiciones de Cierre de Trimestre — Todos los Programas',
  'Audiciones para evaluación de nivel, fijación de puestos y ajuste de planificación para el montaje del Concierto 5to Aniversario. Participan todos los programas: Iniciación, Orquesta Sinfónica, Coro y Ensambles.',
  'audicion_trimestral',
  '2026-10-15 09:00:00+00',
  '2026-10-17 18:00:00+00',
  'ACM',
  'programado',
  true,
  '{"anio": 2026, "trimestre": 3, "programas": ["iniciacion", "orquesta", "coro", "ensambles"], "objetivo_concierto": "Concierto 5to Aniversario 22-nov-2026"}'::jsonb
);

-- Evento 2: Ensayos Intensivos Pre-Concierto (Nov 6-8, 2026)
INSERT INTO public.calendario_institucional (
  titulo,
  descripcion,
  categoria,
  fecha_inicio,
  fecha_fin,
  departamento_responsable,
  estado,
  es_macro_evento,
  metadata
) VALUES (
  'Ensayos Intensivos Pre-Concierto Aniversario (Nov 6-8)',
  'Seminario intensivo de 3 días (9am-7pm) aprovechando el feriado. Bloques: seccionales mañana, ensayo general tarde, coro+cierre tarde-noche. Preparación final para el Concierto 5to Aniversario del 22 de noviembre.',
  'ensayo_intensivo',
  '2026-11-06 09:00:00+00',
  '2026-11-08 19:00:00+00',
  'ACM',
  'programado',
  true,
  '{"anio": 2026, "duracion_dias": 3, "horario": "09:00-19:00", "participantes_estimados": 100, "concierto_objetivo": "Concierto 5to Aniversario 22-nov-2026"}'::jsonb
);

-- Verificar tareas creadas:
-- SELECT e.titulo, t.departamento, t.titulo, t.fecha_vencimiento
-- FROM tareas_institucionales t
-- JOIN calendario_institucional e ON e.id = t.event_id
-- WHERE e.categoria IN ('audicion_trimestral', 'ensayo_intensivo')
-- ORDER BY e.titulo, t.fecha_vencimiento;

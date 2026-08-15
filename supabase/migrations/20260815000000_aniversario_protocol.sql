-- ============================================================
-- Migration: Protocolo Concierto Aniversario — Hermes SOI
-- Timestamp: 20260815000000
-- Description:
--   1. Agrega valor 'aniversario' al enum event_categoria
--   2. Inserta protocolo completo (25 tareas T-Minus) en hermes_protocolos
--   3. Trigger fn_validar_checklist_tarea: bloquea completar tarea con checklist incompleto
--   4. Función + cron fn_hermes_escalar_tareas_bloqueadas: escala tareas bloqueadas >72h a DIR
-- ============================================================

-- ─── 1. NUEVO VALOR EN ENUM ─────────────────────────────────────────────────
ALTER TYPE event_categoria ADD VALUE IF NOT EXISTS 'aniversario';

-- ─── 2. PROTOCOLO ANIVERSARIO EN hermes_protocolos ──────────────────────────
-- UPSERT: si ya existe la categoría 'aniversario', actualiza. Si no, inserta.
INSERT INTO public.hermes_protocolos (
  categoria_evento,
  nombre_protocolo,
  descripcion,
  tareas_plantilla,
  activo
)
VALUES (
  'aniversario',
  'Protocolo de Gran Concierto Aniversario Institucional',
  'Despliegue operativo integral a 90 días para el Concierto Aniversario del Sistema Musical Punta Cana. 25 tareas multidepartamentales con deadlines T-Minus desde la fecha del evento.',
  '[
    {
      "titulo": "🎯 DIR: Definición de Lema, Objetivos y Comisión — {evento_titulo}",
      "descripcion": "Aprobar el lema oficial, los objetivos del aniversario y designar la comisión organizadora. Definir la lista de personalidades, autoridades y patrocinadores de honor.",
      "departamento": "DIR",
      "prioridad": "critica",
      "diferencia_dias": -90,
      "checklist": [
        {"item": "Aprobar lema y concepto oficial del aniversario", "completado": false},
        {"item": "Definir lista de personalidades y patrocinadores de honor", "completado": false},
        {"item": "Designar director musical y directores invitados", "completado": false},
        {"item": "Constituir formalmente la comisión organizadora", "completado": false}
      ]
    },
    {
      "titulo": "🏛️ ADM: Scouting, Cotización y Reserva del Recinto Oficial — {evento_titulo}",
      "descripcion": "Inspeccionar opciones de recintos (Puntacana Club, Barceló, Cap Cana, sede propia). Formalizar carta de solicitud de espacio y asegurar contrato o carta de cortesía.",
      "departamento": "ADM",
      "prioridad": "critica",
      "diferencia_dias": -75,
      "checklist": [
        {"item": "Inspeccionar opciones de recintos (Puntacana Club, Barceló, Cap Cana)", "completado": false},
        {"item": "Formalizar carta de solicitud de espacio con fecha del evento", "completado": false},
        {"item": "Confirmar aforo, disponibilidad de camerinos y tarima (100 personas)", "completado": false},
        {"item": "Asegurar contrato o carta de cortesía firmada del recinto", "completado": false}
      ]
    },
    {
      "titulo": "🎼 ACM: Selección de Repertorio Oficial — {evento_titulo}",
      "descripcion": "Seleccionar obras para Orquesta Sinfónica, Coro y Ensamble de Iniciación. Verificar niveles técnicos y auditar existencia de partituras (score y particellas).",
      "departamento": "ACM",
      "prioridad": "alta",
      "diferencia_dias": -70,
      "checklist": [
        {"item": "Seleccionar obras para Orquesta Sinfónica, Coro y Ensamble de Iniciación", "completado": false},
        {"item": "Verificar niveles técnicos de los alumnos matriculados", "completado": false},
        {"item": "Auditar existencia y edición de partituras (score y particellas)", "completado": false},
        {"item": "Establecer cronograma de ensayos y definir obras del programa de mano", "completado": false}
      ]
    },
    {
      "titulo": "💰 FIN: Presupuesto Maestro y Asignación de Recursos — {evento_titulo}",
      "descripcion": "Elaborar presupuesto maestro del evento: sonido, luces, transporte, hidratación y programas. Gestionar aportes de patrocinadores y aprobar flujo de caja.",
      "departamento": "FIN",
      "prioridad": "alta",
      "diferencia_dias": -60,
      "checklist": [
        {"item": "Elaborar presupuesto: sonido, luces, transporte, hidratación, programas", "completado": false},
        {"item": "Gestionar aportes de patrocinadores con COM", "completado": false},
        {"item": "Aprobar flujo de caja y desembolsos escalonados", "completado": false},
        {"item": "Definir tope presupuestario para contratación de personal logístico", "completado": false}
      ]
    },
    {
      "titulo": "📬 COM: Cartas a empresas para refrigerios, picadera y auspicios — {evento_titulo}",
      "descripcion": "Redactar y enviar cartas institucionales a empresas privadas solicitando apoyo con refrigerios, picadera y auspicios para el evento (mín. 100 personas).",
      "departamento": "COM",
      "prioridad": "alta",
      "diferencia_dias": -55,
      "checklist": [
        {"item": "Redactar carta institucional de solicitud de auspicio", "completado": false},
        {"item": "Identificar mínimo 8 empresas objetivo para contactar", "completado": false},
        {"item": "Enviar cartas y hacer seguimiento semanal", "completado": false},
        {"item": "Confirmar compromisos de al menos 3 empresas para refrigerios", "completado": false}
      ]
    },
    {
      "titulo": "🌟 DIR: Búsqueda de personalidades VIP e invitaciones especiales — {evento_titulo}",
      "descripcion": "Identificar y contactar personalidades importantes: Familia Rainieri, Familia de Ted Keel, Ayuntamiento de Verón, entidades diplomáticas, empresarios y colaboradores.",
      "departamento": "DIR",
      "prioridad": "alta",
      "diferencia_dias": -50,
      "checklist": [
        {"item": "Elaborar lista definitiva de personalidades VIP a invitar", "completado": false},
        {"item": "Redactar invitaciones protocolares personalizadas", "completado": false},
        {"item": "Enviar invitaciones (Familia Rainieri, Ted Keel, Ayuntamiento Verón, etc.)", "completado": false},
        {"item": "Hacer seguimiento de confirmaciones cada 5 días", "completado": false}
      ]
    },
    {
      "titulo": "📢 COM: Campaña de Medios, Identidad Visual e Invitaciones — {evento_titulo}",
      "descripcion": "Diseñar el afiche oficial, piezas para redes sociales, programa de mano (borrador) y banners. Habilitar registro de asistentes. Coordinar equipo de fotografía y video.",
      "departamento": "COM",
      "prioridad": "alta",
      "diferencia_dias": -45,
      "checklist": [
        {"item": "Diseñar afiche oficial del aniversario (aprobación DIR)", "completado": false},
        {"item": "Publicar en redes sociales institucionales", "completado": false},
        {"item": "Diseñar plantillas para invitaciones digitales e impresas", "completado": false},
        {"item": "Habilitar formulario/registro de asistentes", "completado": false},
        {"item": "Coordinar equipo de fotografía y video documental del evento", "completado": false}
      ]
    },
    {
      "titulo": "📰 COM: Nota de prensa y pauta en medios locales/nacionales — {evento_titulo}",
      "descripcion": "Redactar y distribuir nota de prensa oficial del concierto aniversario a medios locales, regionales y nacionales. Coordinar entrevistas anticipadas.",
      "departamento": "COM",
      "prioridad": "media",
      "diferencia_dias": -42,
      "checklist": [
        {"item": "Redactar nota de prensa oficial del evento", "completado": false},
        {"item": "Distribuir a medios locales (mínimo 5 medios)", "completado": false},
        {"item": "Confirmar cobertura periodística para el día del evento", "completado": false}
      ]
    },
    {
      "titulo": "📋 ADM: Permisos de ausencias de clase para días de seminario — {evento_titulo}",
      "descripcion": "Gestionar y formalizar los permisos de ausencia de clases para los alumnos participantes durante los días del seminario intensivo previo al concierto.",
      "departamento": "ADM",
      "prioridad": "alta",
      "diferencia_dias": -40,
      "checklist": [
        {"item": "Solicitar autorización formal a DIR para días de seminario", "completado": false},
        {"item": "Generar lista de alumnos participantes (sin estado ROJO)", "completado": false},
        {"item": "Emitir circular oficial de permisos a maestros de materias académicas", "completado": false},
        {"item": "Registrar permisos en sistema de asistencia", "completado": false}
      ]
    },
    {
      "titulo": "📝 ACM: Circulares a profesores para semana de ensayos intensivos — {evento_titulo}",
      "descripcion": "Comunicar a todos los profesores el calendario del seminario intensivo (mañana, tarde y noche). Solicitar apoyo y definir roles de cada maestro durante la semana.",
      "departamento": "ACM",
      "prioridad": "alta",
      "diferencia_dias": -35,
      "checklist": [
        {"item": "Redactar circular oficial del seminario intensivo para profesores", "completado": false},
        {"item": "Distribuir a todos los maestros con al menos 5 semanas de anticipación", "completado": false},
        {"item": "Confirmar disponibilidad de cada profesor para los días del seminario", "completado": false},
        {"item": "Asignar roles (ensayo seccional, ensayo general, apoyo logístico)", "completado": false}
      ]
    },
    {
      "titulo": "🎻 LUT: Mantenimiento preventivo y puesta a punto de instrumentos — {evento_titulo}",
      "descripcion": "Revisión general de cuerdas, puentes y almas de violines, violas y cellos. Calibración de vientos (zapatillas, corchos y llaves). Inventario de instrumentos en comodato.",
      "departamento": "LUT",
      "prioridad": "alta",
      "diferencia_dias": -30,
      "checklist": [
        {"item": "Revisión general de violines: cuerdas, puente, alma", "completado": false},
        {"item": "Revisión general de violas y cellos", "completado": false},
        {"item": "Calibración de vientos: zapatillas, corchos, llaves", "completado": false},
        {"item": "Inventario de instrumentos en comodato para el evento", "completado": false},
        {"item": "Marcar instrumentos que requieren reparación urgente", "completado": false}
      ]
    },
    {
      "titulo": "📸 COM: Solicitud de presupuesto a fotógrafo y videógrafo — {evento_titulo}",
      "descripcion": "Contactar fotógrafos y videógrafos profesionales. Solicitar presupuesto para cobertura del evento (fotos + video documental). Seleccionar y contratar.",
      "departamento": "COM",
      "prioridad": "media",
      "diferencia_dias": -28,
      "checklist": [
        {"item": "Contactar mínimo 3 fotógrafos/videógrafos profesionales", "completado": false},
        {"item": "Solicitar presupuesto detallado (horas, formato de entrega)", "completado": false},
        {"item": "Seleccionar proveedor y firmar contrato", "completado": false},
        {"item": "Briefing al fotógrafo: momentos clave, lista de personalidades VIP", "completado": false}
      ]
    },
    {
      "titulo": "👪 ADM: Aviso formal a padres: fechas del seminario y logística — {evento_titulo}",
      "descripcion": "Enviar circular a todos los representantes/padres con las fechas del seminario intensivo, horarios, logística de transporte, alimentación y permisos requeridos.",
      "departamento": "ADM",
      "prioridad": "alta",
      "diferencia_dias": -25,
      "checklist": [
        {"item": "Redactar circular formal para representantes/padres", "completado": false},
        {"item": "Incluir: fechas del seminario, horarios, transporte, alimentación", "completado": false},
        {"item": "Distribuir por todos los canales (WhatsApp, email, físico)", "completado": false},
        {"item": "Solicitar confirmación de asistencia del alumno al seminario", "completado": false}
      ]
    },
    {
      "titulo": "🍽️ FIN: Gestión de refrigerios para seminario (100 personas) — {evento_titulo}",
      "descripcion": "Asegurar alimentación para al menos 100 personas (coro + orquesta) durante los días del seminario intensivo. Coordinar con empresas auspiciantes o proveedores contratados.",
      "departamento": "FIN",
      "prioridad": "alta",
      "diferencia_dias": -21,
      "checklist": [
        {"item": "Confirmar cantidad exacta de participantes del seminario", "completado": false},
        {"item": "Coordinar con empresas auspiciantes confirmadas", "completado": false},
        {"item": "Contratar catering si no hay auspicios suficientes (cotizar 3 proveedores)", "completado": false},
        {"item": "Asegurar agua, snacks y comida para cada jornada (mañana, tarde, noche)", "completado": false}
      ]
    },
    {
      "titulo": "🚚 OPR: Gestión de transporte para traslado de instrumentos — {evento_titulo}",
      "descripcion": "Reservar y coordinar el transporte necesario para el traslado de instrumentos musicales (incluyendo instrumentos pesados: cellos, contrabajos, timbales, percusión) a la sede del concierto.",
      "departamento": "OPR",
      "prioridad": "alta",
      "diferencia_dias": -21,
      "checklist": [
        {"item": "Inventariar instrumentos que requieren transporte especial", "completado": false},
        {"item": "Cotizar y contratar transporte adecuado (camión/van de carga)", "completado": false},
        {"item": "Coordinar día y hora de carga con OPR y LUT", "completado": false},
        {"item": "Asegurar transporte también para personal y alumnos", "completado": false}
      ]
    },
    {
      "titulo": "👷 OPR: Contratación de personal logístico para montaje/desmontaje — {evento_titulo}",
      "descripcion": "Contratar personal de apoyo logístico (posiblemente externos) para cargar instrumentos pesados, montar la tarima, atriles y el escenario, y desmontar al finalizar.",
      "departamento": "OPR",
      "prioridad": "alta",
      "diferencia_dias": -18,
      "checklist": [
        {"item": "Definir cantidad de personal logístico necesario", "completado": false},
        {"item": "Contratar personal (interno + externo según disponibilidad)", "completado": false},
        {"item": "Briefing completo: roles, horarios, equipo a manipular", "completado": false},
        {"item": "Preparar lista de tareas imprimibles para el personal de logística", "completado": false}
      ]
    },
    {
      "titulo": "🎵 ACM: Coordinación del Seminario Intensivo — {evento_titulo}",
      "descripcion": "Ejecutar el seminario intensivo (jornada continua mañana, tarde y noche con pausas reglamentarias). Supervisar ensayos seccionales y generales. Asegurar calidad musical mínima aceptable.",
      "departamento": "ACM",
      "prioridad": "critica",
      "diferencia_dias": -14,
      "checklist": [
        {"item": "Ejecutar ensayos seccionales por sección (cuerdas, vientos, coro)", "completado": false},
        {"item": "Realizar ensayo general con toda la orquesta y coro", "completado": false},
        {"item": "Validar que el repertorio está a nivel aceptable para presentación", "completado": false},
        {"item": "Registrar asistencia diaria del seminario (ADM)", "completado": false},
        {"item": "Reportar a DIR el estado del repertorio al final del seminario", "completado": false}
      ]
    },
    {
      "titulo": "📋 COM: Lista de tareas imprimibles para personal de logística — {evento_titulo}",
      "descripcion": "Crear documentos imprimibles con la lista detallada de procesos, herramientas e instrumentos que el personal logístico debe seguir en montaje y desmontaje.",
      "departamento": "COM",
      "prioridad": "media",
      "diferencia_dias": -14,
      "checklist": [
        {"item": "Crear checklist de montaje: tarima, atriles, iluminación, sonido", "completado": false},
        {"item": "Crear checklist de desmontaje y embalaje", "completado": false},
        {"item": "Imprimir y distribuir al personal asignado", "completado": false}
      ]
    },
    {
      "titulo": "📄 COM: Programa de mano — diseño, revisión y envío a imprenta — {evento_titulo}",
      "descripcion": "Diseñar el programa de mano oficial del concierto (mensaje de bienvenida, historia de 5 años, obras, créditos, patrocinadores). Enviar a imprenta con suficiente tiempo.",
      "departamento": "COM",
      "prioridad": "alta",
      "diferencia_dias": -10,
      "checklist": [
        {"item": "Definir contenido: mensaje DIR, historia 5 años, obras, créditos, patrocinadores", "completado": false},
        {"item": "Diseñar programa de mano (aprobación DIR antes de imprimir)", "completado": false},
        {"item": "Enviar a imprenta (cantidad mínima: 300 copias)", "completado": false},
        {"item": "Confirmar fecha de entrega de imprenta (debe llegar antes de T-3)", "completado": false}
      ]
    },
    {
      "titulo": "🖼️ COM: Afiche Memorístico 5 Años — diseño e impresión — {evento_titulo}",
      "descripcion": "Diseñar y producir el afiche memorístico de los primeros 5 años del Sistema Musical Punta Cana. Legado visual del aniversario para distribución a asistentes.",
      "departamento": "COM",
      "prioridad": "alta",
      "diferencia_dias": -10,
      "checklist": [
        {"item": "Recolectar fotos y materiales de los 5 años para el afiche", "completado": false},
        {"item": "Diseñar afiche memorístico (aprobación DIR)", "completado": false},
        {"item": "Enviar a imprenta (cantidad: igual al aforo + 20%)", "completado": false}
      ]
    },
    {
      "titulo": "🎤 DIR: Preparación de discursos y reconocimientos — {evento_titulo}",
      "descripcion": "Redactar y ensayar el discurso de apertura del director. Preparar los reconocimientos especiales (maestros, alumnos destacados, patrocinadores). Definir el protocolo del acto.",
      "departamento": "DIR",
      "prioridad": "alta",
      "diferencia_dias": -7,
      "checklist": [
        {"item": "Redactar discurso de apertura (máx. 7 minutos)", "completado": false},
        {"item": "Definir lista de reconocimientos especiales", "completado": false},
        {"item": "Preparar diplomas/certificados/reconocimientos físicos", "completado": false},
        {"item": "Definir orden y protocolo del acto (emcee, presentadores)", "completado": false}
      ]
    },
    {
      "titulo": "✅ COM: Confirmación final de invitados VIP y protocolo de recibimiento — {evento_titulo}",
      "descripcion": "Confirmar asistencia de todos los invitados VIP. Coordinar el protocolo de recibimiento: personal asignado, ubicación de asientos VIP, señalética.",
      "departamento": "COM",
      "prioridad": "alta",
      "diferencia_dias": -7,
      "checklist": [
        {"item": "Contactar a todos los VIPs invitados para confirmar asistencia", "completado": false},
        {"item": "Asignar personal de protocolo para recibimiento de autoridades", "completado": false},
        {"item": "Preparar señalética y reserva de asientos VIP", "completado": false},
        {"item": "Confirmar equipo de seguridad si aplica", "completado": false}
      ]
    },
    {
      "titulo": "🔍 OPR: Verificación técnica de locación — {evento_titulo}",
      "descripcion": "Inspección técnica del recinto: tarima con espacio para 100 personas, iluminación escénica, sistema de micrófonos (mín. 8 canales), acústica, camerinos y servicios.",
      "departamento": "OPR",
      "prioridad": "critica",
      "diferencia_dias": -5,
      "checklist": [
        {"item": "Verificar tarima: espacio suficiente para 100 personas (coro + orquesta)", "completado": false},
        {"item": "Verificar iluminación escénica dirigida", "completado": false},
        {"item": "Verificar sistema de micrófonos (mín. 8 canales para dir/solistas)", "completado": false},
        {"item": "Confirmar camerinos y área backstage para alumnos", "completado": false},
        {"item": "Verificar acceso para instrumentos de gran tamaño", "completado": false},
        {"item": "Plan de contingencia por lluvia si es espacio abierto", "completado": false}
      ]
    },
    {
      "titulo": "📡 COM: Gira de medios de comunicación y entrevistas — {evento_titulo}",
      "descripcion": "Coordinar entrevistas y apariciones en medios de comunicación locales y regionales. Presentar el evento, el sistema y el aniversario ante la prensa.",
      "departamento": "COM",
      "prioridad": "media",
      "diferencia_dias": -3,
      "checklist": [
        {"item": "Confirmar entrevistas en al menos 2 medios regionales", "completado": false},
        {"item": "Preparar vocero/director para las entrevistas", "completado": false},
        {"item": "Distribuir material de prensa actualizado a todos los medios", "completado": false}
      ]
    },
    {
      "titulo": "🏁 DIR: Check final — confirmación de todos los departamentos — {evento_titulo}",
      "descripcion": "Reunión final de coordinación con todos los departamentos. Confirmar que cada área está lista. Última oportunidad para resolver bloqueos antes del evento.",
      "departamento": "DIR",
      "prioridad": "critica",
      "diferencia_dias": -1,
      "checklist": [
        {"item": "ACM confirma: repertorio listo, alumnos preparados, maestros en posición", "completado": false},
        {"item": "OPR confirma: transporte reservado, personal logístico briefeado", "completado": false},
        {"item": "COM confirma: programas de mano recibidos, VIPs confirmados, fotógrafo listo", "completado": false},
        {"item": "FIN confirma: presupuesto ejecutado, catering asegurado, pagos al día", "completado": false},
        {"item": "ADM confirma: lista de alumnos depurada, permisos firmados", "completado": false},
        {"item": "LUT confirma: todos los instrumentos en buen estado", "completado": false}
      ]
    }
  ]'::jsonb,
  true
)
ON CONFLICT (categoria_evento)
DO UPDATE SET
  nombre_protocolo = EXCLUDED.nombre_protocolo,
  descripcion = EXCLUDED.descripcion,
  tareas_plantilla = EXCLUDED.tareas_plantilla,
  activo = EXCLUDED.activo,
  updated_at = now();

-- ─── 3. TRIGGER DE VALIDACIÓN DE CHECKLIST ──────────────────────────────────
-- Impide marcar una tarea como 'completada' si tiene items de checklist sin completar.

CREATE OR REPLACE FUNCTION public.fn_validar_checklist_tarea()
RETURNS TRIGGER AS $$
DECLARE
  v_items_pendientes integer;
BEGIN
  IF NEW.estado = 'completada' AND OLD.estado != 'completada' THEN
    IF jsonb_array_length(COALESCE(NEW.checklist, '[]'::jsonb)) > 0 THEN
      SELECT COUNT(*) INTO v_items_pendientes
      FROM jsonb_array_elements(NEW.checklist) AS item
      WHERE NOT COALESCE((item->>'completado')::boolean, false);

      IF v_items_pendientes > 0 THEN
        RAISE EXCEPTION
          'No se puede completar la tarea: % item(s) del checklist están pendientes.',
          v_items_pendientes
          USING ERRCODE = 'P0001';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_validar_checklist ON public.tareas_institucionales;
CREATE TRIGGER trg_validar_checklist
  BEFORE UPDATE OF estado ON public.tareas_institucionales
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_validar_checklist_tarea();

-- ─── 4. FUNCIÓN DE ESCALAMIENTO DE TAREAS BLOQUEADAS ────────────────────────
-- Crea una tarea urgente en DIR cuando una tarea lleva >72h en estado 'bloqueada'.
-- Incluye deduplicación: no crea duplicados si ya hay una tarea de escalamiento activa.

CREATE OR REPLACE FUNCTION public.fn_hermes_escalar_tareas_bloqueadas()
RETURNS void AS $$
DECLARE
  v_tarea RECORD;
BEGIN
  FOR v_tarea IN
    SELECT t.id, t.titulo, t.departamento, t.updated_at
    FROM public.tareas_institucionales t
    WHERE t.estado = 'bloqueada'
      AND t.updated_at < NOW() - INTERVAL '72 hours'
      -- Evitar duplicados: no escalar si ya existe tarea activa de escalamiento para esta
      AND NOT EXISTS (
        SELECT 1
        FROM public.tareas_institucionales esc
        WHERE esc.titulo LIKE '🚨 ESCALA: %' || LEFT(t.titulo, 40) || '%'
          AND esc.departamento = 'DIR'
          AND esc.estado NOT IN ('completada', 'cancelada')
          AND esc.created_at > NOW() - INTERVAL '96 hours'
      )
  LOOP
    INSERT INTO public.tareas_institucionales (
      titulo,
      descripcion,
      departamento,
      estado,
      prioridad,
      fecha_vencimiento
    ) VALUES (
      '🚨 ESCALA: ' || LEFT(v_tarea.titulo, 80),
      'Tarea BLOQUEADA por más de 72 horas sin movimiento. Requiere atención inmediata de Dirección. ' ||
      'Departamento responsable: ' || v_tarea.departamento || '. ' ||
      'Tarea original ID: ' || v_tarea.id::text || '. ' ||
      'Bloqueada desde: ' || v_tarea.updated_at::date::text,
      'DIR',
      'pendiente',
      'critica',
      CURRENT_DATE + 1
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cron job: ejecutar fn_hermes_escalar_tareas_bloqueadas cada 4 horas
SELECT cron.schedule(
  'hermes-escalar-tareas-bloqueadas',
  '0 */4 * * *',
  'SELECT public.fn_hermes_escalar_tareas_bloqueadas()'
);

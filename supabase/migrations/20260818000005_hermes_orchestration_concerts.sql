-- ============================================================================
-- MIGRATION: 20260818000005_hermes_orchestration_concerts.sql
-- Substrato de Datos y Motor de Orquestación de Conciertos (SOP-SOI-CON-001)
-- Hermes Virtual Operations Manager - SOI V9
-- ============================================================================

-- 1. TABLA: eventos_conciertos
CREATE TABLE IF NOT EXISTS public.eventos_conciertos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación
  nombre TEXT NOT NULL,
  institucion_contratante TEXT,
  fecha DATE NOT NULL,
  hora TIME,
  lugar TEXT,
  direccion_exacta TEXT,
  contacto_externo JSONB DEFAULT '{}'::jsonb,  -- {nombre, telefono, email}
  
  -- Información artística
  agrupacion TEXT,
  director_responsable TEXT,
  repertorio JSONB DEFAULT '[]'::jsonb,        -- [{obra, duracion_minutos}, ...]
  num_musicos INT DEFAULT 0,
  num_maestros INT DEFAULT 0,
  num_monitores INT DEFAULT 0,
  num_colaboradores INT DEFAULT 0,
  
  -- Logística
  tiempo_traslado_minutos INT,                 -- DATO CRÍTICO (D)
  transportacion TEXT DEFAULT 'interno',       -- 'interno', 'contratado', 'propio'
  num_vehiculos INT DEFAULT 0,
  capacidad_personas INT DEFAULT 0,
  instrumentos_grandes BOOLEAN DEFAULT FALSE,
  necesita_sonido BOOLEAN DEFAULT FALSE,
  es_exterior BOOLEAN DEFAULT FALSE,
  plan_b_lluvia TEXT,
  
  -- Tiempos calculados automáticamente por Hermes
  convocatoria_estimada TIMESTAMP WITH TIME ZONE,
  salida_estimada TIMESTAMP WITH TIME ZONE,
  llegada_estimada TIMESTAMP WITH TIME ZONE,
  fin_concierto_estimado TIMESTAMP WITH TIME ZONE,
  regreso_estimado TIMESTAMP WITH TIME ZONE,
  recogida_estimada TIMESTAMP WITH TIME ZONE,
  
  -- Estado / Hitos (G0 a G10)
  estado TEXT NOT NULL DEFAULT 'G0' 
    CHECK (estado IN ('G0','G1','G2','G3','G4','G5','G6','G7','G8','G9','G10')),
  
  -- Beneficio institucional
  beneficio_tipo TEXT,                         -- 'economico', 'patrocinio', 'alianza', 'social'
  beneficio_monto NUMERIC(12, 2) DEFAULT 0.00,
  
  -- Meteorología / Alertas dinámicas
  pronostico_clima TEXT,
  alerta_clima BOOLEAN DEFAULT FALSE,
  
  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid()
);

CREATE INDEX IF NOT EXISTS idx_eventos_conciertos_estado ON public.eventos_conciertos(estado);
CREATE INDEX IF NOT EXISTS idx_eventos_conciertos_fecha ON public.eventos_conciertos(fecha);
CREATE INDEX IF NOT EXISTS idx_eventos_conciertos_convocatoria ON public.eventos_conciertos(convocatoria_estimada);

-- 2. TABLA: tareas_concierto (con soporte DAG y dependencias)
CREATE TABLE IF NOT EXISTS public.tareas_concierto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES public.eventos_conciertos(id) ON DELETE CASCADE,
  
  -- Delegación
  departamento TEXT NOT NULL,                  -- 'ACM', 'LUT', 'FIN', 'LOG', 'COM', 'ADM', 'DIR'
  responsable_id UUID,
  portal_destino TEXT,                         -- 'admin-dashboard', 'portal-maestros', 'caja', etc.
  
  -- Especificación de la Tarea
  tipo_tarea TEXT NOT NULL,                    -- 'checklist', 'confirmacion', 'preparacion', 'validacion', 'presupuesto', 'beneficio', 'comunicacion'
  titulo TEXT NOT NULL,
  descripcion TEXT,
  pregunta_operativa TEXT,                     -- Pregunta concisa para el responsable en el portal
  
  -- Estado y flujo
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'en_proceso', 'bloqueada', 'completada', 'no_aplica')),
  
  -- Dependencias DAG
  tarea_previa_id UUID REFERENCES public.tareas_concierto(id) ON DELETE SET NULL,
  requiere_aprobacion_dir BOOLEAN DEFAULT FALSE,
  
  -- Prioridad y tiempos
  prioridad INT DEFAULT 0,                     -- 0=Normal, 1=Alta, 2=Crítica
  fecha_vencimiento TIMESTAMP WITH TIME ZONE,
  
  -- Feedback y Registro
  feedback JSONB DEFAULT '{}'::jsonb,          -- {respuesta: 'Si/No', observaciones: '...', timestamp: '...', por_quien: '...'}
  intentos INT DEFAULT 0,
  
  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT tarea_evento_depto_unic UNIQUE(evento_id, departamento, tipo_tarea)
);

CREATE INDEX IF NOT EXISTS idx_tareas_concierto_evento ON public.tareas_concierto(evento_id);
CREATE INDEX IF NOT EXISTS idx_tareas_concierto_estado ON public.tareas_concierto(estado);
CREATE INDEX IF NOT EXISTS idx_tareas_concierto_responsable ON public.tareas_concierto(responsable_id);
CREATE INDEX IF NOT EXISTS idx_tareas_concierto_departamento ON public.tareas_concierto(departamento);

-- 3. TABLA: hitos_concierto (Tracking de compuertas G0-G10)
CREATE TABLE IF NOT EXISTS public.hitos_concierto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES public.eventos_conciertos(id) ON DELETE CASCADE,
  
  numero INT NOT NULL CHECK (numero >= 0 AND numero <= 10),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  
  completado BOOLEAN DEFAULT FALSE,
  timestamp_completado TIMESTAMP WITH TIME ZONE,
  completado_por UUID,
  evidencia JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT evento_hito_unic UNIQUE(evento_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_hitos_concierto_evento ON public.hitos_concierto(evento_id, numero);

-- 4. TABLA: alertas_operativas
CREATE TABLE IF NOT EXISTS public.alertas_operativas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES public.eventos_conciertos(id) ON DELETE CASCADE,
  
  tipo TEXT NOT NULL,                          -- 'capacidad', 'horario', 'instrumento', 'clima', 'presupuesto', 'repertorio'
  severidad TEXT NOT NULL CHECK (severidad IN ('baja', 'media', 'alta', 'critica')),
  
  descripcion TEXT NOT NULL,
  recomendacion TEXT,
  
  estado TEXT DEFAULT 'abierta' CHECK (estado IN ('abierta', 'mitigada', 'ignorada', 'cerrada')),
  
  tareas_relacionadas UUID[] DEFAULT '{}'::UUID[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cerrada_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_alertas_operativas_evento_sev ON public.alertas_operativas(evento_id, severidad);
CREATE INDEX IF NOT EXISTS idx_alertas_operativas_estado ON public.alertas_operativas(estado);

-- 5. TABLA: hermes_inbox_telegram (Ingesta de Mensajería Externa)
CREATE TABLE IF NOT EXISTS public.hermes_inbox_telegram (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id BIGINT,
  user_id BIGINT,
  user_name TEXT,
  mensaje TEXT NOT NULL,
  mensaje_timestamp BIGINT,
  procesado BOOLEAN DEFAULT FALSE,
  tipo_detectado TEXT,                         -- 'concierto', 'tarea', 'consulta', 'feedback', 'otro'
  evento_id UUID REFERENCES public.eventos_conciertos(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hermes_inbox_telegram_proc ON public.hermes_inbox_telegram(procesado);

-- ============================================================================
-- FUNCIONES PL/PGSQL DEL MOTOR DE ORQUESTACIÓN HERMES
-- ============================================================================

-- 6. FUNCIÓN: Inicializar Hitos G0-G10
CREATE OR REPLACE FUNCTION public.fn_hermes_inicializar_hitos_concierto(
  p_evento_id UUID
)
RETURNS INT AS $$
DECLARE
  v_count INT := 0;
BEGIN
  INSERT INTO public.hitos_concierto (evento_id, numero, nombre, descripcion, completado, timestamp_completado)
  VALUES
    (p_evento_id, 0, 'G0 - Evento recibido', 'Invitación o solicitud registrada en el sistema', TRUE, NOW()),
    (p_evento_id, 1, 'G1 - Evento aceptado', 'Dirección Ejecutiva aprueba viabilidad inicial', FALSE, NULL),
    (p_evento_id, 2, 'G2 - Producción confirmada', 'Transporte, locación y fechas base fijadas', FALSE, NULL),
    (p_evento_id, 3, 'G3 - Preparación artística', 'Repertorio listo y validado por ACM', FALSE, NULL),
    (p_evento_id, 4, 'G4 - Logística confirmada', 'Instrumentos, personal y refrigerios listos', FALSE, NULL),
    (p_evento_id, 5, 'G5 - Comunicación completada', 'Representantes y maestros informados formalmente', FALSE, NULL),
    (p_evento_id, 6, 'G6 - Salida autorizada', 'Asistencia y carga verificadas en sede', FALSE, NULL),
    (p_evento_id, 7, 'G7 - Escenario listo', 'Prueba de sonido concluida y orquesta en posición', FALSE, NULL),
    (p_evento_id, 8, 'G8 - Retorno autorizado', 'Inventario y alumnos verificados tras concierto', FALSE, NULL),
    (p_evento_id, 9, 'G9 - Cierre operativo', 'Alumnos entregados a representantes en sede', FALSE, NULL),
    (p_evento_id, 10, 'G10 - Evento cerrado', 'Expediente completo y balance financiero archivado', FALSE, NULL)
  ON CONFLICT (evento_id, numero) DO NOTHING;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNCIÓN: Crear las 7 Tareas Departamentales Estándar
CREATE OR REPLACE FUNCTION public.fn_hermes_crear_tareas_concierto(
  p_evento_id UUID
)
RETURNS INT AS $$
DECLARE
  v_tareas INT := 0;
  v_tarea RECORD;
BEGIN
  FOR v_tarea IN
    SELECT 
      'ACM'::TEXT AS departamento,
      'portal-maestros'::TEXT AS portal,
      'validacion'::TEXT AS tipo,
      'Validar repertorio artístico'::TEXT AS titulo,
      'Verificar que el repertorio seleccionado esté ensamblado y los alumnos listos'::TEXT AS descripcion,
      '¿El repertorio está listo para el concierto?'::TEXT AS pregunta,
      FALSE AS requiere_aprobacion,
      1 AS prioridad
    UNION ALL
    SELECT 'LUT', 'luteria-taller', 'confirmacion', 'Confirmar instrumentos disponibles',
           'Validar estado físico de atriles, cuerdas e instrumentos requeridos',
           '¿Tenemos todos los instrumentos necesarios en óptimas condiciones?', FALSE, 1
    UNION ALL
    SELECT 'FIN', 'caja', 'presupuesto', 'Presupuesto para colaboradores y viáticos',
           'Aprobar dotación de hidratación, colaboradores y gastos operativos',
           '¿Tenemos presupuesto asignado para la operación del concierto?', FALSE, 0
    UNION ALL
    SELECT 'LOG', 'inventario', 'checklist', 'Checklist logístico y transporte',
           'Asegurar cupo de transporte, conductores, carga de instrumentos grandes',
           '¿El transporte y la logística de carga están confirmados?', FALSE, 1
    UNION ALL
    SELECT 'COM', 'comunicaciones', 'coordinacion', 'Coordinación externa y locación',
           'Confirmar locación, tarima, punto eléctrico, sonido y plan de contingencia',
           '¿La locación y requerimientos técnicos externos están listos?', FALSE, 0
    UNION ALL
    SELECT 'COM', 'comunicaciones', 'comunicacion', 'Comunicación a familias y representantes',
           'Emitir circular formal con cronograma exacto de salida y retorno',
           '¿Los representantes han sido notificados formalmente?', FALSE, 1
    UNION ALL
    SELECT 'DIR', 'director-aprobacion', 'beneficio', 'Definición de beneficio institucional',
           'Alinear contraprestación institucional (donación, visibilidad, alianza)',
           '¿Está definido y aprobado el beneficio institucional del evento?', TRUE, 2
  LOOP
    INSERT INTO public.tareas_concierto (
      evento_id, departamento, portal_destino, tipo_tarea, titulo,
      descripcion, pregunta_operativa, requiere_aprobacion_dir, prioridad, estado
    ) VALUES (
      p_evento_id,
      v_tarea.departamento,
      v_tarea.portal,
      v_tarea.tipo,
      v_tarea.titulo,
      v_tarea.descripcion,
      v_tarea.pregunta,
      v_tarea.requiere_aprobacion,
      v_tarea.prioridad,
      'pendiente'
    )
    ON CONFLICT (evento_id, departamento, tipo_tarea) DO NOTHING;
    
    v_tareas := v_tareas + 1;
  END LOOP;

  RETURN v_tareas;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. FUNCIÓN: Detectar Inconsistencias Operativas
CREATE OR REPLACE FUNCTION public.fn_hermes_detectar_inconsistencias_concierto(
  p_evento_id UUID
)
RETURNS INT AS $$
DECLARE
  v_evento public.eventos_conciertos%ROWTYPE;
  v_alertas INT := 0;
  v_total_personas INT;
BEGIN
  SELECT * INTO v_evento FROM public.eventos_conciertos WHERE id = p_evento_id;

  IF v_evento.id IS NULL THEN
    RETURN 0;
  END IF;

  -- 1. Alerta por falta de dato crítico: tiempo de traslado
  IF v_evento.tiempo_traslado_minutos IS NULL THEN
    INSERT INTO public.alertas_operativas (
      evento_id, tipo, severidad, descripcion, recomendacion
    ) VALUES (
      p_evento_id,
      'horario',
      'alta',
      'Tiempo de traslado no confirmado (DATO CRÍTICO)',
      'Definir tiempo de traslado en minutos para calcular la línea temporal operativa (convocatoria, salida, retorno).'
    );
    v_alertas := v_alertas + 1;
  END IF;

  -- 2. Alerta por Capacidad de Transporte
  v_total_personas := COALESCE(v_evento.num_musicos, 0) + 
                      COALESCE(v_evento.num_maestros, 0) + 
                      COALESCE(v_evento.num_monitores, 0) + 
                      COALESCE(v_evento.num_colaboradores, 0);

  IF v_evento.capacidad_personas > 0 AND v_total_personas > v_evento.capacidad_personas THEN
    INSERT INTO public.alertas_operativas (
      evento_id, tipo, severidad, descripcion, recomendacion
    ) VALUES (
      p_evento_id,
      'capacidad',
      'critica',
      format('El personal proyectado (%s personas) supera la capacidad de transporte declarada (%s personas)', v_total_personas, v_evento.capacidad_personas),
      'Solicitar vehículo adicional o aumentar capacidad de autobús con Logística.'
    );
    v_alertas := v_alertas + 1;
  END IF;

  -- 3. Alerta por Clima en Exteriores
  IF v_evento.es_exterior AND (v_evento.alerta_clima OR v_evento.plan_b_lluvia IS NULL OR TRIM(v_evento.plan_b_lluvia) = '') THEN
    INSERT INTO public.alertas_operativas (
      evento_id, tipo, severidad, descripcion, recomendacion
    ) VALUES (
      p_evento_id,
      'clima',
      'media',
      'Evento al aire libre sin Plan B de lluvia definido o con alerta climática activa',
      'Definir carpa, espacio techado alternativo o protocolo de suspensión.'
    );
    v_alertas := v_alertas + 1;
  END IF;

  RETURN v_alertas;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. FUNCIÓN: Calcular Tiempos Operativos de Concierto
CREATE OR REPLACE FUNCTION public.fn_hermes_calcular_tiempos_concierto(
  p_evento_id UUID,
  p_tiempo_traslado_minutos INT
)
RETURNS JSONB AS $$
DECLARE
  v_evento public.eventos_conciertos%ROWTYPE;
  v_base_timestamp TIMESTAMP WITH TIME ZONE;
  v_convocatoria TIMESTAMP WITH TIME ZONE;
  v_salida TIMESTAMP WITH TIME ZONE;
  v_llegada TIMESTAMP WITH TIME ZONE;
  v_fin_concierto TIMESTAMP WITH TIME ZONE;
  v_regreso TIMESTAMP WITH TIME ZONE;
  v_recogida TIMESTAMP WITH TIME ZONE;
  v_hora_inicio TIME;
BEGIN
  SELECT * INTO v_evento FROM public.eventos_conciertos WHERE id = p_evento_id;
  
  IF v_evento.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Evento no encontrado');
  END IF;

  v_hora_inicio := COALESCE(v_evento.hora, '19:00:00'::TIME);
  v_base_timestamp := (v_evento.fecha::TEXT || ' ' || v_hora_inicio::TEXT)::TIMESTAMP WITH TIME ZONE;

  -- Regla Operativa Estándar SOI:
  -- H = Hora inicio
  -- Llegada al sitio = H - 75 min (prueba de sonido, afinación)
  -- Salida de la sede = Llegada - Traslado (D)
  -- Convocatoria en sede = Salida - 45 min (carga de instrumentos, pase de lista)
  -- Fin de concierto = H + 60 min (duración estimada)
  -- Salida del lugar = Fin + 45 min (desmontaje y carga)
  -- Regreso a sede = Salida lugar + Traslado (D)
  -- Recogida de alumnos = Regreso + 30 min (entrega a familias)

  v_llegada := v_base_timestamp - INTERVAL '75 minutes';
  v_salida := v_llegada - (p_tiempo_traslado_minutos || ' minutes')::INTERVAL;
  v_convocatoria := v_salida - INTERVAL '45 minutes';
  v_fin_concierto := v_base_timestamp + INTERVAL '60 minutes';
  v_regreso := v_fin_concierto + INTERVAL '45 minutes' + (p_tiempo_traslado_minutos || ' minutes')::INTERVAL;
  v_recogida := v_regreso + INTERVAL '30 minutes';

  -- Actualizar registro del evento
  UPDATE public.eventos_conciertos SET
    tiempo_traslado_minutos = p_tiempo_traslado_minutos,
    convocatoria_estimada = v_convocatoria,
    salida_estimada = v_salida,
    llegada_estimada = v_llegada,
    fin_concierto_estimado = v_fin_concierto,
    regreso_estimado = v_regreso,
    recogida_estimada = v_recogida,
    updated_at = NOW()
  WHERE id = p_evento_id;

  -- Mitigar alerta de horario si existía abierta
  UPDATE public.alertas_operativas
  SET estado = 'mitigada', cerrada_at = NOW()
  WHERE evento_id = p_evento_id AND tipo = 'horario' AND estado = 'abierta';

  RETURN jsonb_build_object(
    'success', true,
    'evento_id', p_evento_id,
    'tiempo_traslado_minutos', p_tiempo_traslado_minutos,
    'convocatoria_estimada', v_convocatoria,
    'salida_estimada', v_salida,
    'llegada_estimada', v_llegada,
    'fin_concierto_estimado', v_fin_concierto,
    'regreso_estimado', v_regreso,
    'recogida_estimada', v_recogida,
    'duracion_operativa_total_horas', ROUND((EXTRACT(EPOCH FROM (v_recogida - v_convocatoria)) / 3600.0)::NUMERIC, 2)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. FUNCIÓN CORE: Orquestar Concierto Completo
CREATE OR REPLACE FUNCTION public.fn_hermes_orquestar_concierto(
  p_nombre TEXT,
  p_lugar TEXT,
  p_fecha DATE,
  p_hora TIME DEFAULT NULL,
  p_institucion TEXT DEFAULT NULL,
  p_mensaje_original TEXT DEFAULT NULL,
  p_created_by UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
  v_evento_id UUID;
  v_tareas_creadas INT := 0;
  v_hitos_creados INT := 0;
  v_alertas INT := 0;
BEGIN
  -- 1. Crear Evento en G0
  INSERT INTO public.eventos_conciertos (
    nombre, lugar, fecha, hora, institucion_contratante,
    estado, created_by, created_at
  ) VALUES (
    p_nombre, p_lugar, p_fecha, p_hora, p_institucion,
    'G0', p_created_by, NOW()
  ) RETURNING id INTO v_evento_id;

  -- 2. Inicializar Matriz de Hitos G0-G10
  v_hitos_creados := public.fn_hermes_inicializar_hitos_concierto(v_evento_id);

  -- 3. Generar las 7 Tareas Departamentales
  v_tareas_creadas := public.fn_hermes_crear_tareas_concierto(v_evento_id);

  -- 4. Evaluar Inconsistencias Iniciales
  v_alertas := public.fn_hermes_detectar_inconsistencias_concierto(v_evento_id);

  -- 5. Avanzar estado a G1 (Evento aceptado y en proceso de confirmación)
  UPDATE public.eventos_conciertos SET estado = 'G1', updated_at = NOW() WHERE id = v_evento_id;
  UPDATE public.hitos_concierto SET completado = TRUE, timestamp_completado = NOW() 
  WHERE evento_id = v_evento_id AND numero = 1;

  RETURN jsonb_build_object(
    'success', true,
    'evento_id', v_evento_id,
    'nombre', p_nombre,
    'fecha', p_fecha,
    'lugar', p_lugar,
    'estado_actual', 'G1',
    'tareas_creadas', v_tareas_creadas,
    'hitos_inicializados', v_hitos_creados,
    'alertas_detectadas', v_alertas,
    'siguiente_accion_critica', 'Confirmar tiempo_traslado_minutos para calcular cronograma maestro'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. FUNCIÓN: Procesar Feedback de Tarea y Desbloquear DAG
CREATE OR REPLACE FUNCTION public.fn_hermes_procesar_feedback_tarea(
  p_tarea_id UUID,
  p_estado_nuevo TEXT,
  p_feedback JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_tarea public.tareas_concierto%ROWTYPE;
  v_evento_id UUID;
  v_desbloqueadas INT := 0;
  v_acciones TEXT[] := '{}'::TEXT[];
BEGIN
  SELECT * INTO v_tarea FROM public.tareas_concierto WHERE id = p_tarea_id;
  
  IF v_tarea.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tarea no encontrada');
  END IF;

  v_evento_id := v_tarea.evento_id;

  -- 1. Actualizar estado y feedback
  UPDATE public.tareas_concierto SET
    estado = p_estado_nuevo,
    feedback = CASE 
      WHEN p_feedback IS NOT NULL THEN COALESCE(feedback, '{}'::jsonb) || p_feedback 
      ELSE feedback 
    END,
    updated_at = NOW()
  WHERE id = p_tarea_id;

  -- 2. Desbloqueo reactivo si se completó
  IF p_estado_nuevo = 'completada' THEN
    WITH desbloqueadas AS (
      UPDATE public.tareas_concierto
      SET estado = 'pendiente', updated_at = NOW()
      WHERE evento_id = v_evento_id
        AND tarea_previa_id = p_tarea_id
        AND estado = 'bloqueada'
      RETURNING id, titulo
    )
    SELECT count(*), array_agg(titulo) INTO v_desbloqueadas, v_acciones FROM desbloqueadas;
  END IF;

  -- 3. Escalamiento a Dirección si se reportó bloqueada
  IF p_estado_nuevo = 'bloqueada' THEN
    INSERT INTO public.alertas_operativas (
      evento_id, tipo, severidad, descripcion, recomendacion, tareas_relacionadas
    ) VALUES (
      v_evento_id,
      'bloqueo_operativo',
      'alta',
      format('Tarea departamental bloqueada: [%s] %s', v_tarea.departamento, v_tarea.titulo),
      'Intervención de Dirección Ejecutiva requerida para destrabar el proceso.',
      ARRAY[p_tarea_id]
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'tarea_id', p_tarea_id,
    'evento_id', v_evento_id,
    'estado_nuevo', p_estado_nuevo,
    'tareas_desbloqueadas', v_desbloqueadas,
    'acciones', v_acciones
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. TRIGGER: Procesar Mensajes Entrantes de Telegram Inbox
CREATE OR REPLACE FUNCTION public.fn_hermes_procesar_telegram_inbox()
RETURNS TRIGGER AS $$
DECLARE
  v_tipo TEXT := 'otro';
BEGIN
  IF NEW.procesado = FALSE THEN
    -- Clasificación determinística de intención
    IF NEW.mensaje ~* 'concierto|presentacion|tocata|recital|evento' THEN
      v_tipo := 'concierto';
    ELSIF NEW.mensaje ~* 'tarea|pendiente|hacer|asignar' THEN
      v_tipo := 'tarea';
    ELSIF NEW.mensaje ~* 'estado|como va|resumen|reporte|alerta' THEN
      v_tipo := 'consulta';
    ELSIF NEW.mensaje ~* 'listo|aprobado|confirmado|cancelado' THEN
      v_tipo := 'feedback';
    ELSE
      v_tipo := 'general';
    END IF;

    UPDATE public.hermes_inbox_telegram SET
      tipo_detectado = v_tipo,
      procesado = TRUE
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hermes_procesar_telegram_inbox ON public.hermes_inbox_telegram;
CREATE TRIGGER trg_hermes_procesar_telegram_inbox
  AFTER INSERT ON public.hermes_inbox_telegram
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_hermes_procesar_telegram_inbox();

-- ============================================================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================================================

ALTER TABLE public.eventos_conciertos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas_concierto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hitos_concierto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_operativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hermes_inbox_telegram ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para usuarios autenticados
DROP POLICY IF EXISTS "eventos_conciertos_auth_all" ON public.eventos_conciertos;
CREATE POLICY "eventos_conciertos_auth_all" ON public.eventos_conciertos 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "tareas_concierto_auth_all" ON public.tareas_concierto;
CREATE POLICY "tareas_concierto_auth_all" ON public.tareas_concierto 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "hitos_concierto_auth_all" ON public.hitos_concierto;
CREATE POLICY "hitos_concierto_auth_all" ON public.hitos_concierto 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "alertas_operativas_auth_all" ON public.alertas_operativas;
CREATE POLICY "alertas_operativas_auth_all" ON public.alertas_operativas 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "hermes_inbox_telegram_auth_all" ON public.hermes_inbox_telegram;
CREATE POLICY "hermes_inbox_telegram_auth_all" ON public.hermes_inbox_telegram 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

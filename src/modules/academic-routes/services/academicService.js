import { supabase } from '../../../lib/supabaseClient';

/**
 * Servicio para la gestión de Rutas Académicas y Progreso.
 */
export const academicService = {
  /**
   * Obtiene datos básicos de un estudiante.
   */
  async getStudent(studentId) {
    const { data, error } = await supabase
      .from('students')
      .select('name, last_name, instrument_principal')
      .eq('id', studentId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Obtiene todas las rutas con su versión publicada (status = 'published').
   * Cada ruta incluye `current_version` con la versión publicada más reciente
   * (o null si la ruta aún no tiene una versión publicada).
   */
  async fetchRoutes() {
    const { data, error } = await supabase
      .from('routes')
      .select(`
        id,
        name,
        description,
        instrument,
        status,
        created_at,
        route_versions (
          id,
          version,
          status,
          published_at
        )
      `);

    if (error) throw error;

    return (data || []).map((route) => {
      const published = (route.route_versions || [])
        .filter((v) => v.status === 'published')
        .sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));

      const { route_versions, ...rest } = route;
      return { ...rest, current_version: published[0] || null };
    });
  },

  /**
   * Resuelve la versión publicada más reciente de una ruta.
   * @param {string} routeId - ID de la ruta.
   * @returns {Promise<string|null>} ID de la route_version publicada, o null.
   */
  async getPublishedVersionId(routeId) {
    const { data, error } = await supabase
      .from('route_versions')
      .select('id, published_at')
      .eq('route_id', routeId)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data?.id || null;
  },

  /**
   * Obtiene el detalle completo de una ruta (Bloques -> Niveles -> Nodos -> Indicadores).
   * @param {string} routeId - ID de la ruta.
   * @param {string} [routeVersionId] - ID de la versión concreta a usar. Si se
   *   omite, se resuelve la versión publicada (status = 'published') más reciente.
   */
  async getRouteDetail(routeId, routeVersionId = null) {
    // 1. Resolver la versión a consultar (publicada por defecto)
    let versionId = routeVersionId;
    if (!versionId) {
      versionId = await this.getPublishedVersionId(routeId);
      if (!versionId) {
        throw new Error('La ruta no tiene una versión publicada.');
      }
    }

    // 2. Obtener la jerarquía completa.
    // Se mapean las columnas reales del esquema a los nombres que esperan las
    // vistas: nodes.name -> title, nodes.objective -> description.
    const { data, error } = await supabase
      .from('blocks')
      .select(`
        id,
        name,
        order_index,
        levels (
          id,
          name,
          order_index,
          nodes (
            id,
            title:name,
            description:objective,
            type,
            order_index,
            indicators (
              id,
              description,
              order_index
            )
          )
        )
      `)
      .eq('route_version_id', versionId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Obtiene el progreso de un estudiante en una ruta específica.
   * @param {string} studentId - ID del estudiante.
   * @param {string} routeId - ID de la ruta.
   */
  async getStudentProgress(studentId, routeId) {
    const { data, error } = await supabase
      .from('student_node_progress')
      .select(`
        node_id,
        status,
        last_attempt_at,
        teacher_id
      `)
      .eq('student_id', studentId);
      // Nota: El filtro por routeId se hace implícitamente al cruzar con la estructura de la ruta
      // o podríamos filtrar por los nodes que pertenecen a esa route_version.

    if (error) throw error;
    return data;
  },

  /**
   * Mapea un estado de progreso a un token visual de Apple.
   * @param {string} status - 'approved', 'in_process', 'failed', 'pending'
   */
  getStatusToken(status) {
    const tokens = {
      approved: {
        color: 'var(--apple-success)',
        icon: 'bi-check-circle-fill',
        label: 'Aprobado',
        bg: 'rgba(52, 199, 89, 0.1)'
      },
      in_process: {
        color: 'var(--apple-warning)',
        icon: 'bi-clock-history',
        label: 'En Proceso',
        bg: 'rgba(255, 149, 0, 0.1)'
      },
      failed: {
        color: 'var(--apple-danger)',
        icon: 'bi-exclamation-triangle-fill',
        label: 'No Logrado',
        bg: 'rgba(255, 59, 48, 0.1)'
      },
      pending: {
        color: 'var(--apple-text-muted)',
        icon: 'bi-circle',
        label: 'Pendiente',
        bg: 'rgba(142, 142, 147, 0.1)'
      }
    };
    return tokens[status] || tokens.pending;
  },

  /**
   * Crea un nuevo plan académico para un estudiante.
   */
  async createAcademicPlan(studentId, routeVersionId) {
    const { data, error } = await supabase
      .from('academic_plans')
      .insert([
        {
          student_id: studentId,
          route_version_id: routeVersionId,
          status: 'in_process',
          started_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Agrega o actualiza una entrada de planificación semanal.
   */
  async createWeeklyEntry(planId, data) {
    const { data: result, error } = await supabase
      .from('weekly_plan_entries')
      .upsert({
        academic_plan_id: planId,
        week_number: data.week_number,
        start_date: data.start_date,
        end_date: data.end_date,
        focus: data.focus,
        planned_nodes: data.planned_nodes || [],
        planned_indicators: data.planned_indicators || []
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  /**
   * Genera snapshots de contenido para una sesión de clase basados en la planificación.
   * @param {string} claseId - ID de la clase.
   * @param {string} fecha - Fecha de la sesión (YYYY-MM-DD).
   * @param {string} maestroId - ID del maestro.
   */
  async createSnapshotFromPlan(claseId, fecha, maestroId) {
    // 1. Asegurar que existe la sesión en sesiones_clase (Portal Maestros)
    let { data: session, error: sError } = await supabase
      .from('sesiones_clase')
      .select('id')
      .eq('clase_id', claseId)
      .eq('fecha', fecha)
      .eq('maestro_id', maestroId)
      .maybeSingle();

    if (sError) throw sError;

    // Si no existe, la creamos (comportamiento por defecto de hoyView)
    if (!session) {
      const { data: newSession, error: nError } = await supabase
        .from('sesiones_clase')
        .insert([{
          clase_id: claseId,
          fecha: fecha,
          maestro_id: maestroId,
          borrador: true
        }])
        .select()
        .single();
      
      if (nError) throw nError;
      session = newSession;
    }

    const sessionId = session.id;

    // 2. Obtener alumnos inscritos en la clase
    const { data: enrolledStudents, error: eError } = await supabase
      .from('alumnos_clases')
      .select('alumno_id')
      .eq('clase_id', claseId);

    if (eError) throw eError;
    if (!enrolledStudents || enrolledStudents.length === 0) return { sessionId, snapshots: 0 };

    let totalSnapshots = 0;

    // 3. Para cada alumno, buscar su plan y planificación para esta fecha
    for (const enrollment of enrolledStudents) {
      const studentId = enrollment.alumno_id;

      // Buscar plan activo
      const { data: plan, error: pError } = await supabase
        .from('academic_plans')
        .select('id')
        .eq('student_id', studentId)
        .eq('status', 'in_process')
        .maybeSingle();

      if (pError || !plan) continue;

      // Buscar planificación semanal para la fecha
      const { data: weeklyPlan, error: wpError } = await supabase
        .from('weekly_plan_entries')
        .select('planned_nodes, planned_indicators')
        .eq('academic_plan_id', plan.id)
        .lte('start_date', fecha)
        .gte('end_date', fecha)
        .maybeSingle();

      if (wpError || !weeklyPlan) continue;

      // 4. Si hay planificación, generar snapshots inmutables
      const snapshots = [];

      // Mapear indicadores planificados
      if (weeklyPlan.planned_indicators && weeklyPlan.planned_indicators.length > 0) {
        for (const indicator of weeklyPlan.planned_indicators) {
          snapshots.push({
            session_id: sessionId,
            student_id: studentId,
            node_id: indicator.node_id,
            indicator_id: indicator.indicator_id,
            node_name: indicator.node_name,
            indicator_description: indicator.description,
            is_critical: indicator.is_critical || false
          });
        }
      } 
      // Si solo hay nodos planificados pero no indicadores específicos (fallback)
      else if (weeklyPlan.planned_nodes && weeklyPlan.planned_nodes.length > 0) {
        for (const node of weeklyPlan.planned_nodes) {
          snapshots.push({
            session_id: sessionId,
            student_id: studentId,
            node_id: node.node_id,
            node_name: node.title,
            is_critical: node.is_critical || false
          });
        }
      }

      if (snapshots.length > 0) {
        const { error: insError } = await supabase
          .from('class_session_content_snapshots')
          .insert(snapshots);
        
        if (!insError) totalSnapshots += snapshots.length;
      }
    }

    return { sessionId, totalSnapshots };
  },

  /**
   * Guarda un intento de evaluación de un indicador.
   * Utiliza el offlineQueue para asegurar persistencia.
   * @param {object} payload - Datos del intento.
   */
  async saveIndicatorAttempt(payload) {
    const { enqueue } = await import('../../../portal-maestros/services/offlineQueue.js');
    
    await enqueue({
      tabla: 'indicator_attempts',
      operacion: 'insert',
      payload: {
        student_id: payload.student_id,
        indicator_id: payload.indicator_id,
        session_id: payload.session_id,
        created_by: payload.teacher_id,
        status: payload.status,
        feedback: payload.feedback || '',
        attempt_number: payload.attempt_number || 1,
        created_at: new Date().toISOString()
      }
    });

    return { success: true, local: true };
  },

  /**
   * Obtiene intentos exitosos combinando Supabase y cola local (Híbrido).
   */
  async getEffectiveApprovedAttempts(studentId, indicatorIds) {
    // 1. Intentos en la nube
    const { data: remoteAttempts, error } = await supabase
      .from('indicator_attempts')
      .select('indicator_id')
      .eq('student_id', studentId)
      .eq('status', 'approved')
      .in('indicator_id', indicatorIds);

    if (error) throw error;

    // 2. Intentos pendientes en la cola local
    const { getQueue } = await import('../../../portal-maestros/services/offlineQueue.js');
    const queue = await getQueue();
    const localApproved = queue
      .filter(item => 
        item.tabla === 'indicator_attempts' && 
        item.payload.student_id === studentId && 
        item.payload.status === 'approved' &&
        indicatorIds.includes(item.payload.indicator_id)
      )
      .map(item => ({ indicator_id: item.payload.indicator_id }));

    // Combinar (Set para unicidad)
    const allIds = new Set([
      ...remoteAttempts.map(a => a.indicator_id),
      ...localApproved.map(a => a.indicator_id)
    ]);

    return Array.from(allIds).map(id => ({ indicator_id: id }));
  },

  /**
   * Recalcula el progreso de un nodo basado en sus indicadores (Híbrido).
   */
  async recalculateNodeProgress(studentId, nodeId) {
    const { data: indicators, error: iError } = await supabase
      .from('indicators')
      .select('id')
      .eq('node_id', nodeId);

    if (iError) throw iError;
    if (!indicators || indicators.length === 0) return { status: 'no_indicators' };

    const indicatorIds = indicators.map(i => i.id);
    
    // USAR MOTOR HÍBRIDO
    const attempts = await this.getEffectiveApprovedAttempts(studentId, indicatorIds);

    const approvedCount = attempts.length;
    const isApproved = approvedCount === indicators.length;

    if (isApproved) {
      const { enqueue } = await import('../../../portal-maestros/services/offlineQueue.js');
      await enqueue({
        tabla: 'student_node_progress',
        operacion: 'upsert',
        payload: {
          student_id: studentId,
          node_id: nodeId,
          status: 'approved',
          last_attempt_at: new Date().toISOString()
        }
      });
      return { status: 'approved', changed: true };
    }

    return { status: 'in_process', changed: false };
  },

  /**
   * Verifica si un nivel ha sido completado (Basado en banderas, no strings).
   */
  async checkLevelCompletion(studentId, levelId) {
    const { data: nodes, error: nError } = await supabase
      .from('nodes')
      .select('id, title, is_critical')
      .eq('level_id', levelId);

    if (nError) throw nError;

    // Obtener progreso híbrido local
    const { getQueue } = await import('../../../portal-maestros/services/offlineQueue.js');
    const queue = await getQueue();
    const localNodeProgress = queue
      .filter(item => 
        item.tabla === 'student_node_progress' && 
        item.payload.student_id === studentId && 
        item.payload.status === 'approved'
      )
      .map(item => item.payload.node_id);

    const nodeIds = nodes.map(n => n.id);
    const { data: remoteProgress, error: pError } = await supabase
      .from('student_node_progress')
      .select('node_id, status')
      .eq('student_id', studentId)
      .in('node_id', nodeIds);

    if (pError) throw pError;

    const approvedNodes = new Set([
      ...remoteProgress.filter(p => p.status === 'approved').map(p => p.node_id),
      ...localNodeProgress
    ]);

    const allNodesApproved = nodes.every(n => approvedNodes.has(n.id));
    
    // REGLA CRÍTICA: Usar bandera is_critical
    const criticalNodes = nodes.filter(n => n.is_critical);
    const allCriticalApproved = criticalNodes.every(n => approvedNodes.has(n.id));

    if (allNodesApproved && allCriticalApproved) {
      const { enqueue } = await import('../../../portal-maestros/services/offlineQueue.js');
      await enqueue({
        tabla: 'student_level_progress',
        operacion: 'upsert',
        payload: {
          student_id: studentId,
          level_id: levelId,
          status: 'approved',
          completed_at: new Date().toISOString()
        }
      });
      return { status: 'approved', changed: true, levelId };
    }

    return { status: 'in_process', changed: false };
  },

  /**
   * Crea snapshot para un alumno específico (Lazy loading / On-demand).
   */
  async createSnapshotForStudent(sessionId, studentId, fecha) {
    const { data: plan } = await supabase
      .from('academic_plans')
      .select('id')
      .eq('student_id', studentId)
      .eq('status', 'in_process')
      .maybeSingle();

    if (!plan) return null;

    const { data: weeklyPlan } = await supabase
      .from('weekly_plan_entries')
      .select('planned_nodes, planned_indicators')
      .eq('academic_plan_id', plan.id)
      .lte('start_date', fecha)
      .gte('end_date', fecha)
      .maybeSingle();

    if (!weeklyPlan) return null;

    const snapshots = [];
    if (weeklyPlan.planned_indicators?.length > 0) {
      weeklyPlan.planned_indicators.forEach(indicator => {
        snapshots.push({
          session_id: sessionId,
          student_id: studentId,
          node_id: indicator.node_id,
          indicator_id: indicator.indicator_id,
          node_name: indicator.node_name,
          indicator_description: indicator.description,
          is_critical: indicator.is_critical || false
        });
      });
    }

    if (snapshots.length > 0) {
      await supabase.from('class_session_content_snapshots').insert(snapshots);
      return snapshots;
    }
    return null;
  },


  /**
   * Orquestador de cierre de sesión: recorre los alumnos evaluados y dispara recálculos.
   */
  async processSessionClosure(sessionId) {
    // 1. Obtener todos los alumnos que tuvieron evaluaciones en esta sesión
    const { data: evaluations, error: eError } = await supabase
      .from('indicator_attempts')
      .select('student_id, indicator_id')
      .eq('session_id', sessionId);

    if (eError) {
      console.warn('Error obtener indicator_attempts:', eError.message);
      return [];
    }
    if (!evaluations || evaluations.length === 0) return [];

    // 1b. Obtener node_id desde indicators (la tabla indicator_attempts no tiene node_id)
    const indicatorIds = [...new Set(evaluations.map(e => e.indicator_id).filter(Boolean))];
    let nodeMap = new Map();
    if (indicatorIds.length > 0) {
      const { data: indicators } = await supabase
        .from('indicators').select('id, node_id').in('id', indicatorIds);
      nodeMap = new Map((indicators || []).map(i => [i.id, i.node_id]));
    }

    // Mapear node_id a cada evaluación
    evaluations.forEach(ev => { ev.node_id = nodeMap.get(ev.indicator_id) ?? ev.node_id; });

    // 2. Agrupar por estudiante para evitar redundancia
    const studentMap = new Map();
    evaluations.forEach(ev => {
      if (!ev.node_id) return; // skip if no node_id found
      if (!studentMap.has(ev.student_id)) studentMap.set(ev.student_id, new Set());
      studentMap.get(ev.student_id).add(ev.node_id);
    });

    const results = [];

    for (const [studentId, nodesEvaluated] of studentMap) {
      const studentAchievements = {
        studentId,
        approvedNodes: [],
        levelPromoted: null
      };

      // Recalcular cada nodo evaluado
      for (const nodeId of nodesEvaluated) {
        const nodeRes = await this.recalculateNodeProgress(studentId, nodeId);
        if (nodeRes.status === 'approved') {
          // Obtener nombre del nodo para el feedback
          const { data: nodeData } = await supabase.from('nodes').select('title, level_id').eq('id', nodeId).single();
          studentAchievements.approvedNodes.push(nodeData.title);

          // Si el nodo se aprobó, verificar si el nivel también
          if (nodeData.level_id) {
            const levelRes = await this.checkLevelCompletion(studentId, nodeData.level_id);
            if (levelRes.status === 'approved') {
              const { data: levelData } = await supabase.from('levels').select('name').eq('id', nodeData.level_id).single();
              studentAchievements.levelPromoted = levelData.name;
            }
          }
        }
      }

      if (studentAchievements.approvedNodes.length > 0 || studentAchievements.levelPromoted) {
        // Obtener nombre del alumno
        const { data: stu } = await supabase.from('alumnos').select('nombre_completo').eq('id', studentId).single();
        results.push({
          ...studentAchievements,
          studentName: stu.nombre_completo
        });
      }
    }

    return results;
  }
};

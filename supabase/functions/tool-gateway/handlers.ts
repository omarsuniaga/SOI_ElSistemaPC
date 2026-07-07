/**
 * handlers.ts (Deno) — mcp-legacy-inline
 *
 * Migración 1:1 de la lógica de negocio YA CORREGIDA en la auditoría #2734
 * desde `mcp-server-soi-portal/mcp_server.py` (Python, `handle_tool_call`)
 * hacia Deno/TypeScript. NO se reescriben reglas de negocio — mismas
 * columnas reales, mismas validaciones, mismos mensajes (traducidos).
 *
 * Cubre las 5 tools originales del proxy MCP (handler_type='mcp-legacy-inline'
 * en el catálogo): acm_get_student_pedagogical_profile, acm_register_leveling_plan,
 * fin_register_lutherie_report, inv_update_instrument_state, fin_apply_repair_charge.
 * Las 4 tools nuevas de solo-lectura del slice vertical (lut_estado_orden,
 * inv_consultar_activo, fin_estado_cuenta_familia, cal_listar_eventos) usan
 * handler_type='rest' (forward directo a PostgREST) y NO pasan por aquí.
 *
 * Cada handler recibe un `SupabaseClient` con service_role (bypassa RLS,
 * igual que el `service_role` key que usaba mcp_server.py via urllib) y los
 * `args` ya validados contra `input_schema` por el pipeline de index.ts.
 */

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export type HandlerResult = { ok: boolean; mensaje: string; data?: unknown }

// ── acm_get_student_pedagogical_profile ────────────────────────────────────
// Puerto 1:1 de mcp_server.py líneas 132-163. Solo lectura (nivel_riesgo=read
// en el catálogo), pero se incluye aquí porque handler_target apunta a este
// mismo archivo para las 5 tools "legacy" migradas juntas por simplicidad.
export async function acmGetStudentPedagogicalProfile(sb: SupabaseClient, args: Record<string, unknown>): Promise<HandlerResult> {
  const alumnoId = args.alumno_id as string
  const { data, error } = await sb.from('alumnos').select('*').eq('id', alumnoId).limit(1)

  if (!error && data && data.length > 0) {
    const alumno = data[0]
    return {
      ok: true,
      mensaje: 'Perfil pedagógico recuperado.',
      data: {
        alumno_id: alumnoId,
        nombre_completo: alumno.nombre_completo ?? 'Estudiante',
        asistencia_promedio_4w: 94.0,
        nivel_instrumental_actual: 8,
        alertas_activas: [],
        plan_nivelacion_activo: false,
      },
    }
  }

  // Fallback "demo mode" — mismo comportamiento que mcp_server.py cuando el
  // alumno no existe (nunca lanza, siempre responde algo usable).
  return {
    ok: true,
    mensaje: 'Perfil pedagógico (demo mode, alumno no encontrado).',
    data: {
      alumno_id: alumnoId,
      nombre_completo: 'Juancito Pérez (Demo Mode)',
      asistencia_promedio_4w: 92.5,
      nivel_instrumental_actual: 12,
      instrumento: 'Violín',
      alertas_activas: ['mora_lutería_pendiente'],
      plan_nivelacion_activo: false,
    },
  }
}

// ── acm_register_leveling_plan ──────────────────────────────────────────────
// Puerto 1:1 de mcp_server.py líneas 165-226. Resolución de clase_id vía la
// tabla PUENTE `alumnos_clases` (NUNCA `alumno_clases` singular, tabla legacy
// con el mismo conteo de filas — gotcha documentado y auditado en #2734).
// Columnas reales NOT NULL de `planificaciones`: clase_id, maestro_id,
// titulo, fecha_inicio. contenidos/tecnicas/obras/etc. son jsonb.
export async function acmRegisterLevelingPlan(sb: SupabaseClient, args: Record<string, unknown>): Promise<HandlerResult> {
  const alumnoId = args.alumno_id as string
  const maestroId = args.maestro_id as string
  const fechaInicio = args.fecha_inicio as string
  const objetivos = Array.isArray(args.objetivos_pedagogicos) ? args.objetivos_pedagogicos : [String(args.objetivos_pedagogicos)]

  // 1. Nombre del alumno (solo para trazabilidad del mensaje de respuesta).
  let studentName = 'Estudiante'
  const { data: alumnoData } = await sb.from('alumnos').select('nombre_completo').eq('id', alumnoId).limit(1)
  if (alumnoData && alumnoData.length > 0) studentName = alumnoData[0].nombre_completo ?? studentName

  // 2. Resolver clase_id vía la tabla puente `alumnos_clases` (inscripción activa).
  const { data: matriculaData } = await sb
    .from('alumnos_clases')
    .select('clase_id')
    .eq('alumno_id', alumnoId)
    .eq('activo', true)
    .order('created_at', { ascending: false })
    .limit(1)

  const claseId = matriculaData && matriculaData.length > 0 ? matriculaData[0].clase_id : null

  if (!claseId) {
    return {
      ok: false,
      mensaje: `No se pudo registrar el plan de nivelación: el alumno ${alumnoId} no tiene una inscripción activa en 'alumnos_clases' (clase_id no resuelto). Verificar matrícula antes de reintentar.`,
    }
  }

  // 3. Insertar en planificaciones con las columnas reales del modelo.
  const { error: planError } = await sb.from('planificaciones').insert({
    clase_id: claseId,
    maestro_id: maestroId,
    titulo: `Plan de Nivelación: ${studentName}`,
    descripcion: 'Plan de reforzamiento técnico de 4 semanas por alerta de rendimiento.',
    fecha_inicio: fechaInicio,
    contenidos: objetivos,
    estado: 'planificado',
  })

  if (planError) {
    return { ok: false, mensaje: `Error al registrar el plan de nivelación en 'planificaciones': ${planError.message}` }
  }

  return {
    ok: true,
    mensaje: `Plan de nivelación curricular registrado en la tabla 'planificaciones' para el alumno ${studentName} (${alumnoId}) bajo la supervisión del maestro ${maestroId}.`,
  }
}

// ── fin_register_lutherie_report ────────────────────────────────────────────
// Puerto 1:1 de mcp_server.py líneas 228-290. Valida contra `inventario_activos`
// (fuente de verdad real, 304 activos) ANTES de insertar. fecha_recepcion es
// NOT NULL real en `lut_ordenes_reparacion` (gotcha corregido en #2734).
// CONOCIDO: la FK real de `lut_ordenes_reparacion.instrumento_id` aún apunta
// a la tabla legacy `instrumentos` (3 filas), no a `inventario_activos` —
// drift de migración pendiente, resuelto solo bajo gate humano (Slice 5).
export async function finRegisterLutherieReport(sb: SupabaseClient, args: Record<string, unknown>): Promise<HandlerResult> {
  const instrumentoId = args.instrumento_id as string
  const alumnoId = args.alumno_id as string

  const { data: activoData, error: activoError } = await sb
    .from('inventario_activos')
    .select('id')
    .eq('id', instrumentoId)
    .limit(1)

  if (activoError || !activoData || activoData.length === 0) {
    return {
      ok: false,
      mensaje: `No se pudo registrar la orden: el instrumento ${instrumentoId} no existe en 'inventario_activos' (fuente de verdad real del inventario).`,
    }
  }

  const payload: Record<string, unknown> = {
    instrumento_id: instrumentoId,
    alumno_id: alumnoId,
    descripcion_inicial: args.descripcion_danio,
    estado: 'reportado',
    prioridad: 'media',
    departamento_origen: 'ACM',
    fecha_recepcion: new Date().toISOString(),
  }

  const { data: alumnoData } = await sb.from('alumnos').select('nombre_completo').eq('id', alumnoId).limit(1)
  const alumnoNombre = alumnoData && alumnoData.length > 0 ? alumnoData[0].nombre_completo : alumnoId

  const { error: ordenError } = await sb.from('lut_ordenes_reparacion').insert(payload)

  if (ordenError) {
    return {
      ok: false,
      mensaje: `Error al registrar la orden de reparación LUT: ${ordenError.message}. Si el error menciona una violación de foreign key sobre 'instrumento_id', es el drift de migración conocido (la FK real todavía apunta a la tabla legacy 'instrumentos') — requiere una migración de esquema (Slice 5), no un fix de código.`,
    }
  }

  return {
    ok: true,
    mensaje: `Orden de reparación LUT registrada exitosamente. Instrumento ${instrumentoId} asignado a cola de diagnóstico de Kalani bajo la orden asociada al alumno ${alumnoNombre}.`,
  }
}

// ── inv_update_instrument_state ─────────────────────────────────────────────
// Puerto 1:1 de mcp_server.py líneas 292-311.
export async function invUpdateInstrumentState(sb: SupabaseClient, args: Record<string, unknown>): Promise<HandlerResult> {
  const instrumentoId = args.instrumento_id as string
  const nuevoEstado = args.nuevo_estado as string
  const nota = args.nota_historial as string

  const { error } = await sb.from('inventario_activos').update({ estado_uso: nuevoEstado }).eq('id', instrumentoId)

  if (error) {
    return { ok: false, mensaje: `Error al actualizar el activo ${instrumentoId}: ${error.message}` }
  }

  return {
    ok: true,
    mensaje: `Inventario unificado actualizado. Activo ${instrumentoId} cambiado a estado_uso: ${nuevoEstado}. Nota: ${nota}`,
  }
}

// ── fin_apply_repair_charge ──────────────────────────────────────────────────
// Puerto 1:1 de mcp_server.py líneas 313-368. Columnas reales NOT NULL de
// `cuotas`: familia_id, monto_base, monto_final, fecha_generacion, ciclo_mes,
// ciclo_anio (NO existe columna `monto` suelta — gotcha corregido en #2734).
// nivel_riesgo=critical: pasa SIEMPRE por resolverAutonomia() antes de llegar
// aquí, este handler no vuelve a decidir autonomía.
export async function finApplyRepairCharge(sb: SupabaseClient, args: Record<string, unknown>): Promise<HandlerResult> {
  const alumnoId = args.alumno_id as string
  const ordenId = args.orden_id as string
  const monto = args.monto as number
  const fechaPago = args.fecha_compromiso_pago as string

  const { data: alumnoData } = await sb.from('alumnos').select('familia_id').eq('id', alumnoId).limit(1)
  const familiaId = alumnoData && alumnoData.length > 0 ? alumnoData[0].familia_id : null

  if (!familiaId) {
    return {
      ok: false,
      mensaje: `No se pudo aplicar el cargo: el alumno ${alumnoId} no tiene familia_id asociado en 'alumnos'. Verificar el expediente familiar antes de reintentar.`,
    }
  }

  const hoy = new Date()
  const { error } = await sb.from('cuotas').insert({
    familia_id: familiaId,
    alumno_id: alumnoId,
    concepto: `Reparación Lutería (${ordenId})`,
    monto_base: monto,
    monto_final: monto,
    fecha_generacion: hoy.toISOString().slice(0, 10),
    fecha_vencimiento: fechaPago,
    ciclo_mes: hoy.getMonth() + 1,
    ciclo_anio: hoy.getFullYear(),
    estado: 'pendiente',
  })

  if (error) {
    return { ok: false, mensaje: `Error al aplicar el cargo financiero en 'cuotas': ${error.message}` }
  }

  return {
    ok: true,
    mensaje: `Cargo financiero de lutería aplicado en la tabla 'cuotas' de caja. Deuda de RD$${monto} registrada para la familia del alumno ${alumnoId} vinculada a la orden ${ordenId} con fecha de vencimiento ${fechaPago}.`,
  }
}

// Registro handler_target -> función (usado por index.ts cuando handler_type='mcp-legacy-inline')
export const LEGACY_HANDLERS: Record<string, (sb: SupabaseClient, args: Record<string, unknown>) => Promise<HandlerResult>> = {
  acm_get_student_pedagogical_profile: acmGetStudentPedagogicalProfile,
  acm_register_leveling_plan: acmRegisterLevelingPlan,
  fin_register_lutherie_report: finRegisterLutherieReport,
  inv_update_instrument_state: invUpdateInstrumentState,
  fin_apply_repair_charge: finApplyRepairCharge,
}

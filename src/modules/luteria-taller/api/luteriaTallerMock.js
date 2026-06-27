/**
 * luteriaTallerMock.js — Datos demo del Portal de Lutería.
 *
 * Mock First: todas las funciones CRUD para órdenes, diagnósticos, presupuestos,
 * insumos, movimientos, solicitudes de compra y evidencias.
 *
 * Refleja el esquema REAL de las tablas lut_*.
 */

const LATENCIA = 200
const delay = (v) => new Promise((r) => setTimeout(() => r(v), LATENCIA))
const clone = (x) => JSON.parse(JSON.stringify(x))

function enDias(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

// ─── Órdenes de reparación ────────────────────────────────────────────────────

let ordenes = [
  {
    id: 'lut-ord-001',
    correlation_id: 'corr-dano-001',
    instrumento_id: 'inst-003',
    alumno_id: null,
    alumno_nombre: null,
    reportado_por: 'maestro-demo-01',
    reportado_por_nombre: 'Carlos Méndez',
    recibido_por: 'lut-demo-01',
    recibido_por_nombre: 'Juan Luthier',
    tecnico_responsable: 'lut-demo-01',
    tecnico_responsable_nombre: 'Juan Luthier',
    departamento_origen: 'ACM',
    estado: 'en_reparacion',
    prioridad: 'alta',
    descripcion_inicial: 'Clavijero roto — la guitarra no mantiene afinación.',
    diagnostico_resumen: 'Clavijas mecánicas desgastadas, requiere reemplazo completo del clavijero.',
    tipo_dano: 'clavijas_defectuosas',
    gravedad: 'moderada',
    requiere_reemplazo: false,
    requiere_cobro: false,
    requiere_aprobacion_direccion: false,
    costo_estimado: 45.00,
    costo_final: null,
    fecha_recepcion: enDias(-5),
    fecha_diagnostico: enDias(-4),
    fecha_inicio_reparacion: enDias(-3),
    fecha_estimada_entrega: enDias(2),
    fecha_entrega: null,
    created_at: enDias(-5),
    updated_at: enDias(-3),
  },
  {
    id: 'lut-ord-002',
    correlation_id: 'corr-dano-002',
    instrumento_id: 'inst-006',
    alumno_id: 'alu-demo-002',
    alumno_nombre: 'Pedro Rodríguez',
    reportado_por: 'maestro-demo-02',
    reportado_por_nombre: 'Ana Castillo',
    recibido_por: 'lut-demo-01',
    recibido_por_nombre: 'Juan Luthier',
    tecnico_responsable: null,
    tecnico_responsable_nombre: null,
    departamento_origen: 'ACM',
    estado: 'pendiente_diagnostico',
    prioridad: 'media',
    descripcion_inicial: 'El cello tiene un zumbido extraño al tocar la cuerda Do.',
    diagnostico_resumen: null,
    tipo_dano: null,
    gravedad: null,
    requiere_reemplazo: true,
    requiere_cobro: false,
    requiere_aprobacion_direccion: false,
    costo_estimado: null,
    costo_final: null,
    fecha_recepcion: enDias(-1),
    fecha_diagnostico: null,
    fecha_inicio_reparacion: null,
    fecha_estimada_entrega: null,
    fecha_entrega: null,
    created_at: enDias(-1),
    updated_at: enDias(-1),
  },
  {
    id: 'lut-ord-003',
    correlation_id: 'corr-dano-003',
    instrumento_id: 'inst-001',
    alumno_id: null,
    alumno_nombre: null,
    reportado_por: 'lut-admin',
    reportado_por_nombre: 'Admin Lutería',
    recibido_por: 'lut-demo-01',
    recibido_por_nombre: 'Juan Luthier',
    tecnico_responsable: 'lut-demo-01',
    tecnico_responsable_nombre: 'Juan Luthier',
    departamento_origen: 'LUT',
    estado: 'listo_entrega',
    prioridad: 'baja',
    descripcion_inicial: 'Mantenimiento preventivo: cambio de cuerdas y limpieza general.',
    diagnostico_resumen: 'Cuerdas oxidadas, barniz con marcas de resina acumulada.',
    tipo_dano: 'mantenimiento_preventivo',
    gravedad: 'leve',
    requiere_reemplazo: false,
    requiere_cobro: false,
    requiere_aprobacion_direccion: false,
    costo_estimado: 25.00,
    costo_final: 28.50,
    fecha_recepcion: enDias(-10),
    fecha_diagnostico: enDias(-9),
    fecha_inicio_reparacion: enDias(-8),
    fecha_estimada_entrega: enDias(-2),
    fecha_entrega: null,
    created_at: enDias(-10),
    updated_at: enDias(-2),
  },
  {
    id: 'lut-ord-004',
    correlation_id: 'corr-dano-004',
    instrumento_id: 'inst-004',
    alumno_id: 'alu-demo-003',
    alumno_nombre: 'Lucía Fernández',
    reportado_por: 'maestro-demo-01',
    reportado_por_nombre: 'Carlos Méndez',
    recibido_por: 'lut-demo-01',
    recibido_por_nombre: 'Juan Luthier',
    tecnico_responsable: 'lut-demo-01',
    tecnico_responsable_nombre: 'Juan Luthier',
    departamento_origen: 'ACM',
    estado: 'cerrado',
    prioridad: 'critica',
    descripcion_inicial: 'El puente del cello se despegó — el instrumento no puede tocarse.',
    diagnostico_resumen: 'Puente partido por tensión excesiva. Se reemplazó puente completo.',
    tipo_dano: 'puente_partido',
    gravedad: 'grave',
    requiere_reemplazo: true,
    requiere_cobro: true,
    requiere_aprobacion_direccion: true,
    costo_estimado: 120.00,
    costo_final: 135.00,
    fecha_recepcion: enDias(-20),
    fecha_diagnostico: enDias(-19),
    fecha_inicio_reparacion: enDias(-18),
    fecha_estimada_entrega: enDias(-12),
    fecha_entrega: enDias(-10),
    created_at: enDias(-20),
    updated_at: enDias(-10),
  },
  {
    id: 'lut-ord-005',
    correlation_id: 'corr-dano-005',
    instrumento_id: 'inst-005',
    alumno_id: 'alu-demo-004',
    alumno_nombre: 'Sofía Gómez',
    reportado_por: 'maestro-demo-02',
    reportado_por_nombre: 'Ana Castillo',
    recibido_por: 'lut-demo-01',
    recibido_por_nombre: 'Juan Luthier',
    tecnico_responsable: null,
    tecnico_responsable_nombre: null,
    departamento_origen: 'ACM',
    estado: 'reportado',
    prioridad: 'alta',
    descripcion_inicial: 'El arco del violín se rompió durante la clase. La vara tiene una grieta longitudinal.',
    diagnostico_resumen: null,
    tipo_dano: 'arco_daniado',
    gravedad: 'moderada',
    requiere_reemplazo: true,
    requiere_cobro: true,
    requiere_aprobacion_direccion: false,
    costo_estimado: null,
    costo_final: null,
    fecha_recepcion: enDias(0),
    fecha_diagnostico: null,
    fecha_inicio_reparacion: null,
    fecha_estimada_entrega: null,
    fecha_entrega: null,
    created_at: enDias(0),
    updated_at: enDias(0),
  },
]

// ─── Diagnósticos ─────────────────────────────────────────────────────────────

let diagnosticos = [
  {
    id: 'lut-diag-001',
    orden_id: 'lut-ord-001',
    diagnostico_tecnico: 'Las clavijas mecánicas presentan desgaste en el engranaje. No mantienen tensión. Se recomienda reemplazo completo del set.',
    causa_probable: 'Desgaste por uso normal — las clavijas originales son de baja calidad.',
    tipo_dano: 'clavijas_defectuosas',
    gravedad: 'moderada',
    zona_afectada: 'Clavijero / Diapasón',
    reparacion_recomendada: 'Reemplazar clavijas mecánicas por set de mejor calidad.',
    materiales_requeridos: 'Set clavijas mecánicas (4 unidades)',
    tiempo_estimado_horas: 2.0,
    costo_mano_obra: 25.00,
    costo_materiales: 20.00,
    requiere_servicio_externo: false,
    observaciones: 'Se recomienda lubricar puntos de fricción.',
    diagnosticado_por: 'lut-demo-01',
    diagnosticado_por_nombre: 'Juan Luthier',
    created_at: enDias(-4),
  },
  {
    id: 'lut-diag-002',
    orden_id: 'lut-ord-003',
    diagnostico_tecnico: 'Cambio de cuerdas completo. Limpieza de barniz y diapasón. Ajuste de alma.',
    causa_probable: 'Mantenimiento preventivo programado.',
    tipo_dano: 'mantenimiento_preventivo',
    gravedad: 'leve',
    zona_afectada: 'General',
    reparacion_recomendada: 'Cambio de cuerdas + limpieza + ajuste.',
    materiales_requeridos: 'Juego cuerdas violín 4/4, paño microfibra, alcohol isopropílico',
    tiempo_estimado_horas: 1.5,
    costo_mano_obra: 15.00,
    costo_materiales: 10.00,
    requiere_servicio_externo: false,
    observaciones: 'Instrumento en buen estado general.',
    diagnosticado_por: 'lut-demo-01',
    diagnosticado_por_nombre: 'Juan Luthier',
    created_at: enDias(-9),
  },
  {
    id: 'lut-diag-003',
    orden_id: 'lut-ord-004',
    diagnostico_tecnico: 'Puente de cello partido en dos secciones por tensión excesiva. Requiere reemplazo completo y verificación de alma.',
    causa_probable: 'Tensión excesiva por afinación incorrecta. Posible factor: el alumno intentó afinar sin supervisión.',
    tipo_dano: 'puente_partido',
    gravedad: 'grave',
    zona_afectada: 'Puente',
    reparacion_recomendada: 'Reemplazar puente. Verificar alma. Reajustar cuerdas.',
    materiales_requeridos: 'Puente cello 4/4, cuerdas cello (juego)',
    tiempo_estimado_horas: 4.0,
    costo_mano_obra: 60.00,
    costo_materiales: 60.00,
    requiere_servicio_externo: false,
    observaciones: 'Se contactó al representante para aprobación del costo. Aprobado.',
    diagnosticado_por: 'lut-demo-01',
    diagnosticado_por_nombre: 'Juan Luthier',
    created_at: enDias(-19),
  },
]

// ─── Presupuestos ─────────────────────────────────────────────────────────────

let presupuestos = [
  {
    id: 'lut-pres-001',
    orden_id: 'lut-ord-004',
    estado: 'aprobado',
    subtotal_mano_obra: 60.00,
    subtotal_materiales: 60.00,
    subtotal_servicios_externos: 0,
    descuento: 0,
    monto_institucion: 100.00,
    monto_representante: 35.00,
    aprobado_por: 'fin-demo-01',
    aprobado_en: enDias(-17),
    observaciones: 'El seguro institucional cubre 100. El representante paga 35.',
    created_at: enDias(-18),
    updated_at: enDias(-17),
  },
]

// ─── Insumos ──────────────────────────────────────────────────────────────────

let insumos = [
  { id: 'lut-ins-001', nombre: 'Cuerdas violín 4/4 (juego)', categoria: 'cuerdas', unidad: 'juego', stock_actual: 12, stock_minimo: 5, costo_unitario: 8.50, proveedor_sugerido: 'MusicPro', activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'lut-ins-002', nombre: 'Cuerdas violín 3/4 (juego)', categoria: 'cuerdas', unidad: 'juego', stock_actual: 8, stock_minimo: 5, costo_unitario: 7.50, proveedor_sugerido: 'MusicPro', activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'lut-ins-003', nombre: 'Cuerdas cello 4/4 (juego)', categoria: 'cuerdas', unidad: 'juego', stock_actual: 3, stock_minimo: 3, costo_unitario: 35.00, proveedor_sugerido: 'LuthierSupply', activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'lut-ins-004', nombre: 'Clavijas mecánicas (set 4)', categoria: 'clavijas', unidad: 'set', stock_actual: 1, stock_minimo: 3, costo_unitario: 18.00, proveedor_sugerido: 'Parts4Strings', activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'lut-ins-005', nombre: 'Puente cello 4/4', categoria: 'puentes', unidad: 'unidad', stock_actual: 2, stock_minimo: 2, costo_unitario: 45.00, proveedor_sugerido: 'LuthierSupply', activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'lut-ins-006', nombre: 'Resina para arco', categoria: 'accesorios', unidad: 'unidad', stock_actual: 10, stock_minimo: 5, costo_unitario: 5.00, proveedor_sugerido: 'MusicPro', activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'lut-ins-007', nombre: 'Alma cello 4/4', categoria: 'almas', unidad: 'unidad', stock_actual: 0, stock_minimo: 2, costo_unitario: 12.00, proveedor_sugerido: 'LuthierSupply', activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'lut-ins-008', nombre: 'Crin para arco violín', categoria: 'crin', unidad: 'madeja', stock_actual: 0, stock_minimo: 3, costo_unitario: 15.00, proveedor_sugerido: 'Parts4Strings', activo: false, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-06-01T00:00:00Z' },
]

// ─── Movimientos de insumos ───────────────────────────────────────────────────

let movimientos = [
  { id: 'lut-mov-001', insumo_id: 'lut-ins-004', orden_id: 'lut-ord-001', tipo_movimiento: 'consumo', cantidad: 1, costo_unitario: 18.00, registrado_por: 'lut-demo-01', created_at: enDias(-3) },
  { id: 'lut-mov-002', insumo_id: 'lut-ins-001', orden_id: 'lut-ord-003', tipo_movimiento: 'consumo', cantidad: 1, costo_unitario: 8.50, registrado_por: 'lut-demo-01', created_at: enDias(-8) },
  { id: 'lut-mov-003', insumo_id: 'lut-ins-005', orden_id: 'lut-ord-004', tipo_movimiento: 'consumo', cantidad: 1, costo_unitario: 45.00, registrado_por: 'lut-demo-01', created_at: enDias(-17) },
  { id: 'lut-mov-004', insumo_id: 'lut-ins-003', orden_id: 'lut-ord-004', tipo_movimiento: 'consumo', cantidad: 1, costo_unitario: 35.00, registrado_por: 'lut-demo-01', created_at: enDias(-17) },
  { id: 'lut-mov-005', insumo_id: 'lut-ins-001', orden_id: null, tipo_movimiento: 'entrada', cantidad: 5, costo_unitario: 8.00, registrado_por: 'log-demo-01', created_at: enDias(-15) },
]

// ─── Solicitudes de compra ────────────────────────────────────────────────────

let solicitudes = [
  {
    id: 'lut-sol-001',
    orden_id: 'lut-ord-004',
    insumo_id: 'lut-ins-007',
    cantidad_solicitada: 2,
    justificacion: 'Sin stock de almas de cello — se requieren 2 unidades para reparaciones en curso.',
    urgencia: 'alta',
    costo_estimado: 24.00,
    proveedor_sugerido: 'LuthierSupply',
    estado: 'pendiente',
    solicitado_por: 'lut-demo-01',
    aprobado_por: null,
    fecha_requerida: enDias(-14).slice(0, 10),
    created_at: enDias(-16),
    updated_at: enDias(-16),
  },
  {
    id: 'lut-sol-002',
    orden_id: 'lut-ord-001',
    insumo_id: 'lut-ins-004',
    cantidad_solicitada: 3,
    justificacion: 'Stock bajo de clavijas mecánicas (1 unidad). Reponer para próximas reparaciones.',
    urgencia: 'media',
    costo_estimado: 54.00,
    proveedor_sugerido: 'Parts4Strings',
    estado: 'pendiente',
    solicitado_por: 'lut-demo-01',
    aprobado_por: null,
    fecha_requerida: enDias(5).slice(0, 10),
    created_at: enDias(-1),
    updated_at: enDias(-1),
  },
]

// ─── Evidencias ───────────────────────────────────────────────────────────────

let evidencias = [
  { id: 'lut-ev-001', orden_id: 'lut-ord-001', tipo: 'foto_antes', nombre: 'clavijero_antes.jpg', storage_path: 'luteria/lut-ord-001/clavijero_antes.jpg', descripcion: 'Clavijero antes de la reparación — desgaste visible en engranajes.', visibilidad: 'interno', subido_por: 'lut-demo-01', subido_por_nombre: 'Juan Luthier', created_at: enDias(-4) },
  { id: 'lut-ev-002', orden_id: 'lut-ord-004', tipo: 'foto_antes', nombre: 'puente_partido_antes.jpg', storage_path: 'luteria/lut-ord-004/puente_partido_antes.jpg', descripcion: 'Puente partido en dos secciones.', visibilidad: 'finanzas', subido_por: 'lut-demo-01', subido_por_nombre: 'Juan Luthier', created_at: enDias(-19) },
  { id: 'lut-ev-003', orden_id: 'lut-ord-004', tipo: 'foto_despues', nombre: 'puente_nuevo_despues.jpg', storage_path: 'luteria/lut-ord-004/puente_nuevo_despues.jpg', descripcion: 'Puente nuevo instalado y ajustado.', visibilidad: 'interno', subido_por: 'lut-demo-01', subido_por_nombre: 'Juan Luthier', created_at: enDias(-12) },
]

// ─── Funciones CRUD ───────────────────────────────────────────────────────────

// --- Órdenes ---

export async function getOrdenes(filtros = {}) {
  let res = ordenes.map(clone)
  if (filtros.estado && filtros.estado !== 'todos') {
    res = res.filter((o) => o.estado === filtros.estado)
  }
  if (filtros.instrumento_id) {
    res = res.filter((o) => o.instrumento_id === filtros.instrumento_id)
  }
  if (filtros.alumno_id) {
    res = res.filter((o) => o.alumno_id === filtros.alumno_id)
  }
  if (filtros.prioridad && filtros.prioridad !== 'todos') {
    res = res.filter((o) => o.prioridad === filtros.prioridad)
  }
  if (filtros.requiere_cobro !== undefined) {
    res = res.filter((o) => o.requiere_cobro === filtros.requiere_cobro)
  }
  res.sort((a, b) => new Date(b.fecha_recepcion) - new Date(a.fecha_recepcion))
  return delay(res)
}

export async function getOrdenById(id) {
  const o = ordenes.find((x) => x.id === id)
  return delay(o ? clone(o) : null)
}

export async function createOrden(datos) {
  const orden = {
    id: `lut-ord-${Date.now()}`,
    correlation_id: datos.correlation_id || null,
    instrumento_id: datos.instrumento_id,
    alumno_id: datos.alumno_id || null,
    alumno_nombre: datos.alumno_nombre || null,
    reportado_por: datos.reportado_por || null,
    reportado_por_nombre: datos.reportado_por_nombre || null,
    recibido_por: datos.recibido_por || null,
    recibido_por_nombre: datos.recibido_por_nombre || null,
    tecnico_responsable: datos.tecnico_responsable || null,
    tecnico_responsable_nombre: datos.tecnico_responsable_nombre || null,
    departamento_origen: datos.departamento_origen || 'LUT',
    estado: 'reportado',
    prioridad: datos.prioridad || 'media',
    descripcion_inicial: datos.descripcion_inicial || '',
    diagnostico_resumen: null,
    tipo_dano: datos.tipo_dano || null,
    gravedad: datos.gravedad || null,
    requiere_reemplazo: datos.requiere_reemplazo || false,
    requiere_cobro: datos.requiere_cobro || false,
    requiere_aprobacion_direccion: false,
    costo_estimado: datos.costo_estimado || null,
    costo_final: null,
    fecha_recepcion: new Date().toISOString(),
    fecha_diagnostico: null,
    fecha_inicio_reparacion: null,
    fecha_estimada_entrega: null,
    fecha_entrega: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  ordenes.unshift(orden)
  return delay(clone(orden))
}

export async function updateOrdenEstado(id, nuevoEstado, datos = {}) {
  const idx = ordenes.findIndex((o) => o.id === id)
  if (idx === -1) throw new Error(`Orden ${id} no encontrada`)
  ordenes[idx] = {
    ...ordenes[idx],
    estado: nuevoEstado,
    ...datos,
    updated_at: new Date().toISOString(),
  }
  return delay(clone(ordenes[idx]))
}

export async function updateOrden(id, cambios) {
  const idx = ordenes.findIndex((o) => o.id === id)
  if (idx === -1) throw new Error(`Orden ${id} no encontrada`)
  ordenes[idx] = {
    ...ordenes[idx],
    ...cambios,
    updated_at: new Date().toISOString(),
  }
  return delay(clone(ordenes[idx]))
}

// --- Diagnósticos ---

export async function getDiagnosticos(ordenId) {
  const res = diagnosticos.filter((d) => d.orden_id === ordenId).map(clone)
  return delay(res)
}

export async function createDiagnostico(datos) {
  const diag = {
    id: `lut-diag-${Date.now()}`,
    orden_id: datos.orden_id,
    diagnostico_tecnico: datos.diagnostico_tecnico || '',
    causa_probable: datos.causa_probable || null,
    tipo_dano: datos.tipo_dano || null,
    gravedad: datos.gravedad || null,
    zona_afectada: datos.zona_afectada || null,
    reparacion_recomendada: datos.reparacion_recomendada || null,
    materiales_requeridos: datos.materiales_requeridos || null,
    tiempo_estimado_horas: datos.tiempo_estimado_horas || null,
    costo_mano_obra: datos.costo_mano_obra || 0,
    costo_materiales: datos.costo_materiales || 0,
    requiere_servicio_externo: datos.requiere_servicio_externo || false,
    observaciones: datos.observaciones || null,
    diagnosticado_por: datos.diagnosticado_por || null,
    diagnosticado_por_nombre: datos.diagnosticado_por_nombre || null,
    created_at: new Date().toISOString(),
  }
  diagnosticos.push(diag)
  return delay(clone(diag))
}

// --- Presupuestos ---

export async function getPresupuestos(ordenId) {
  const res = presupuestos.filter((p) => p.orden_id === ordenId).map(clone)
  return delay(res)
}

export async function createPresupuesto(datos) {
  const pres = {
    id: `lut-pres-${Date.now()}`,
    orden_id: datos.orden_id,
    estado: 'borrador',
    subtotal_mano_obra: datos.subtotal_mano_obra || 0,
    subtotal_materiales: datos.subtotal_materiales || 0,
    subtotal_servicios_externos: datos.subtotal_servicios_externos || 0,
    descuento: datos.descuento || 0,
    monto_institucion: datos.monto_institucion || 0,
    monto_representante: datos.monto_representante || 0,
    aprobado_por: null,
    aprobado_en: null,
    observaciones: datos.observaciones || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  presupuestos.push(pres)
  return delay(clone(pres))
}

export async function updatePresupuestoEstado(id, nuevoEstado, datos = {}) {
  const idx = presupuestos.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error(`Presupuesto ${id} no encontrado`)
  presupuestos[idx] = {
    ...presupuestos[idx],
    estado: nuevoEstado,
    ...datos,
    updated_at: new Date().toISOString(),
  }
  return delay(clone(presupuestos[idx]))
}

// --- Insumos ---

export async function getInsumos(filtros = {}) {
  let res = insumos.map(clone)
  if (filtros.categoria && filtros.categoria !== 'todos') {
    res = res.filter((i) => i.categoria === filtros.categoria)
  }
  if (filtros.activo !== undefined) {
    res = res.filter((i) => i.activo === filtros.activo)
  }
  if (filtros.stock_bajo) {
    res = res.filter((i) => i.stock_actual <= i.stock_minimo)
  }
  return delay(res)
}

export async function getInsumoById(id) {
  const i = insumos.find((x) => x.id === id)
  return delay(i ? clone(i) : null)
}

export async function ajustarStock(insumoId, cantidad, tipo = 'ajuste', ordenId = null, registradoPor = null) {
  const idx = insumos.findIndex((i) => i.id === insumoId)
  if (idx === -1) throw new Error(`Insumo ${insumoId} no encontrado`)

  const costoUnitario = insumos[idx].costo_unitario
  const mov = {
    id: `lut-mov-${Date.now()}`,
    insumo_id: insumoId,
    orden_id: ordenId,
    tipo_movimiento: tipo,
    cantidad: Math.abs(cantidad),
    costo_unitario: costoUnitario,
    registrado_por: registradoPor,
    created_at: new Date().toISOString(),
  }

  if (tipo === 'consumo' || tipo === 'perdida') {
    insumos[idx].stock_actual -= Math.abs(cantidad)
  } else if (tipo === 'entrada' || tipo === 'devolucion') {
    insumos[idx].stock_actual += Math.abs(cantidad)
  }
  // 'ajuste' = cantidad puede ser positiva o negativa
  if (tipo === 'ajuste') {
    insumos[idx].stock_actual += cantidad
  }
  insumos[idx].updated_at = new Date().toISOString()
  movimientos.push(mov)
  return delay(clone(mov))
}

// --- Solicitudes de compra ---

export async function getSolicitudesCompra(filtros = {}) {
  let res = solicitudes.map(clone)
  if (filtros.estado && filtros.estado !== 'todos') {
    res = res.filter((s) => s.estado === filtros.estado)
  }
  if (filtros.orden_id) {
    res = res.filter((s) => s.orden_id === filtros.orden_id)
  }
  return delay(res)
}

export async function createSolicitudCompra(datos) {
  const sol = {
    id: `lut-sol-${Date.now()}`,
    orden_id: datos.orden_id || null,
    insumo_id: datos.insumo_id,
    cantidad_solicitada: datos.cantidad_solicitada,
    justificacion: datos.justificacion || '',
    urgencia: datos.urgencia || 'media',
    costo_estimado: datos.costo_estimado || null,
    proveedor_sugerido: datos.proveedor_sugerido || null,
    estado: 'pendiente',
    solicitado_por: datos.solicitado_por || null,
    aprobado_por: null,
    fecha_requerida: datos.fecha_requerida || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  solicitudes.push(sol)
  return delay(clone(sol))
}

export async function updateSolicitudEstado(id, nuevoEstado, datos = {}) {
  const idx = solicitudes.findIndex((s) => s.id === id)
  if (idx === -1) throw new Error(`Solicitud ${id} no encontrada`)
  solicitudes[idx] = {
    ...solicitudes[idx],
    estado: nuevoEstado,
    ...datos,
    updated_at: new Date().toISOString(),
  }
  return delay(clone(solicitudes[idx]))
}

// --- Evidencias ---

export async function getEvidencias(ordenId) {
  const res = evidencias.filter((e) => e.orden_id === ordenId).map(clone)
  return delay(res)
}

export async function createEvidencia(datos) {
  const ev = {
    id: `lut-ev-${Date.now()}`,
    orden_id: datos.orden_id,
    tipo: datos.tipo || 'foto_antes',
    nombre: datos.nombre || null,
    storage_path: datos.storage_path || null,
    descripcion: datos.descripcion || null,
    visibilidad: datos.visibilidad || 'interno',
    subido_por: datos.subido_por || null,
    subido_por_nombre: datos.subido_por_nombre || null,
    created_at: new Date().toISOString(),
  }
  evidencias.push(ev)
  return delay(clone(ev))
}

// --- Dashboard KPIs ---

export async function getDashboard() {
  const abiertas = ordenes.filter((o) =>
    !['entregado', 'cerrado', 'cancelado'].includes(o.estado)
  )
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const hoyStr = hoy.toISOString()

  return delay({
    recibidos_hoy: ordenes.filter((o) => o.fecha_recepcion >= hoyStr).length,
    pendientes_diagnostico: ordenes.filter((o) => o.estado === 'pendiente_diagnostico').length,
    en_reparacion: ordenes.filter((o) => o.estado === 'en_reparacion').length,
    esperando_insumos: ordenes.filter((o) => o.estado === 'esperando_insumos').length,
    listos_entrega: ordenes.filter((o) => o.estado === 'listo_entrega').length,
    abiertas_total: abiertas.length,
    costo_estimado_abierto: abiertas.reduce((s, o) => s + (o.costo_estimado || 0), 0),
    con_cobro_pendiente: ordenes.filter((o) => o.requiere_cobro && o.estado !== 'cerrado').length,
    insumos_stock_bajo: insumos.filter((i) => i.stock_actual <= i.stock_minimo).length,
  })
}

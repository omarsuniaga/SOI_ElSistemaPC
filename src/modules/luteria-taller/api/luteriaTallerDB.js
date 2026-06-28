/**
 * luteriaTallerDB.js — Capa de persistencia IndexedDB para el Portal de Lutería.
 *
 * Schema: soi-luteria v1 con 8 object stores.
 * Seed automático en primera apertura si las stores están vacías.
 * Exporta resetAll() para restaurar datos demo.
 */

import { openDB } from 'idb'

const DB_NAME = 'soi-luteria'
const DB_VERSION = 1

const STORES = [
  { name: 'ordenes', keyPath: 'id', indices: ['estado', 'instrumento_id', 'prioridad'] },
  { name: 'diagnosticos', keyPath: 'id', indices: ['orden_id'] },
  { name: 'presupuestos', keyPath: 'id', indices: ['orden_id'] },
  { name: 'insumos', keyPath: 'id', indices: ['categoria'] },
  { name: 'movimientos_stock', keyPath: 'id', indices: ['insumo_id', 'tipo_movimiento'] },
  { name: 'solicitudes_compra', keyPath: 'id', indices: ['estado', 'insumo_id'] },
  { name: 'evidencias', keyPath: 'id', indices: ['orden_id'] },
  { name: 'instrumentos', keyPath: 'id', indices: [] },
]

let _db = null

export async function getDB() {
  if (_db) return _db
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      for (const { name, keyPath, indices } of STORES) {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, { keyPath })
          for (const idx of indices) {
            store.createIndex(`by_${idx}`, idx)
          }
        }
      }
    },
  })
  await seedIfEmpty(_db)
  return _db
}

export function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function enDias(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

// ─── Seed data ─────────────────────────────────────────────────────────────────

const SEED_ORDENES = [
  { id: 'lut-ord-001', correlation_id: 'corr-dano-001', instrumento_id: 'inst-003', alumno_id: null, alumno_nombre: null, reportado_por: 'maestro-demo-01', reportado_por_nombre: 'Carlos Méndez', recibido_por: 'lut-demo-01', recibido_por_nombre: 'Juan Luthier', tecnico_responsable: 'lut-demo-01', tecnico_responsable_nombre: 'Juan Luthier', departamento_origen: 'ACM', estado: 'en_reparacion', prioridad: 'alta', descripcion_inicial: 'Clavijero roto — la guitarra no mantiene afinación.', diagnostico_resumen: 'Clavijas mecánicas desgastadas, requiere reemplazo completo del clavijero.', tipo_dano: 'clavijas_defectuosas', gravedad: 'moderada', requiere_reemplazo: false, requiere_cobro: false, requiere_aprobacion_direccion: false, costo_estimado: 45.00, costo_final: null, fecha_recepcion: enDias(-5), fecha_diagnostico: enDias(-4), fecha_inicio_reparacion: enDias(-3), fecha_estimada_entrega: enDias(2), fecha_entrega: null, created_at: enDias(-5), updated_at: enDias(-3) },
  { id: 'lut-ord-002', correlation_id: 'corr-dano-002', instrumento_id: 'inst-006', alumno_id: 'alu-demo-002', alumno_nombre: 'Pedro Rodríguez', reportado_por: 'maestro-demo-02', reportado_por_nombre: 'Ana Castillo', recibido_por: 'lut-demo-01', recibido_por_nombre: 'Juan Luthier', tecnico_responsable: null, tecnico_responsable_nombre: null, departamento_origen: 'ACM', estado: 'pendiente_diagnostico', prioridad: 'media', descripcion_inicial: 'El cello tiene un zumbido extraño al tocar la cuerda Do.', diagnostico_resumen: null, tipo_dano: null, gravedad: null, requiere_reemplazo: true, requiere_cobro: false, requiere_aprobacion_direccion: false, costo_estimado: null, costo_final: null, fecha_recepcion: enDias(-1), fecha_diagnostico: null, fecha_inicio_reparacion: null, fecha_estimada_entrega: null, fecha_entrega: null, created_at: enDias(-1), updated_at: enDias(-1) },
  { id: 'lut-ord-003', correlation_id: 'corr-dano-003', instrumento_id: 'inst-001', alumno_id: null, alumno_nombre: null, reportado_por: 'lut-admin', reportado_por_nombre: 'Admin Lutería', recibido_por: 'lut-demo-01', recibido_por_nombre: 'Juan Luthier', tecnico_responsable: 'lut-demo-01', tecnico_responsable_nombre: 'Juan Luthier', departamento_origen: 'LUT', estado: 'listo_entrega', prioridad: 'baja', descripcion_inicial: 'Mantenimiento preventivo: cambio de cuerdas y limpieza general.', diagnostico_resumen: 'Cuerdas oxidadas, barniz con marcas de resina acumulada.', tipo_dano: 'mantenimiento_preventivo', gravedad: 'leve', requiere_reemplazo: false, requiere_cobro: false, requiere_aprobacion_direccion: false, costo_estimado: 25.00, costo_final: 28.50, fecha_recepcion: enDias(-10), fecha_diagnostico: enDias(-9), fecha_inicio_reparacion: enDias(-8), fecha_estimada_entrega: enDias(-2), fecha_entrega: null, created_at: enDias(-10), updated_at: enDias(-2) },
  { id: 'lut-ord-004', correlation_id: 'corr-dano-004', instrumento_id: 'inst-004', alumno_id: 'alu-demo-003', alumno_nombre: 'Lucía Fernández', reportado_por: 'maestro-demo-01', reportado_por_nombre: 'Carlos Méndez', recibido_por: 'lut-demo-01', recibido_por_nombre: 'Juan Luthier', tecnico_responsable: 'lut-demo-01', tecnico_responsable_nombre: 'Juan Luthier', departamento_origen: 'ACM', estado: 'cerrado', prioridad: 'critica', descripcion_inicial: 'El puente del cello se despegó — el instrumento no puede tocarse.', diagnostico_resumen: 'Puente partido por tensión excesiva. Se reemplazó puente completo.', tipo_dano: 'puente_partido', gravedad: 'grave', requiere_reemplazo: true, requiere_cobro: true, requiere_aprobacion_direccion: true, costo_estimado: 120.00, costo_final: 135.00, fecha_recepcion: enDias(-20), fecha_diagnostico: enDias(-19), fecha_inicio_reparacion: enDias(-18), fecha_estimada_entrega: enDias(-12), fecha_entrega: enDias(-10), created_at: enDias(-20), updated_at: enDias(-10) },
  { id: 'lut-ord-005', correlation_id: 'corr-dano-005', instrumento_id: 'inst-005', alumno_id: 'alu-demo-004', alumno_nombre: 'Sofía Gómez', reportado_por: 'maestro-demo-02', reportado_por_nombre: 'Ana Castillo', recibido_por: 'lut-demo-01', recibido_por_nombre: 'Juan Luthier', tecnico_responsable: null, tecnico_responsable_nombre: null, departamento_origen: 'ACM', estado: 'reportado', prioridad: 'alta', descripcion_inicial: 'El arco del violín se rompió durante la clase. La vara tiene una grieta longitudinal.', diagnostico_resumen: null, tipo_dano: 'arco_daniado', gravedad: 'moderada', requiere_reemplazo: true, requiere_cobro: true, requiere_aprobacion_direccion: false, costo_estimado: null, costo_final: null, fecha_recepcion: enDias(0), fecha_diagnostico: null, fecha_inicio_reparacion: null, fecha_estimada_entrega: null, fecha_entrega: null, created_at: enDias(0), updated_at: enDias(0) },
]

const SEED_DIAGNOSTICOS = [
  { id: 'lut-diag-001', orden_id: 'lut-ord-001', diagnostico_tecnico: 'Las clavijas mecánicas presentan desgaste en el engranaje. No mantienen tensión. Se recomienda reemplazo completo del set.', causa_probable: 'Desgaste por uso normal — las clavijas originales son de baja calidad.', tipo_dano: 'clavijas_defectuosas', gravedad: 'moderada', zona_afectada: 'Clavijero / Diapasón', reparacion_recomendada: 'Reemplazar clavijas mecánicas por set de mejor calidad.', materiales_requeridos: 'Set clavijas mecánicas (4 unidades)', tiempo_estimado_horas: 2.0, costo_mano_obra: 25.00, costo_materiales: 20.00, requiere_servicio_externo: false, observaciones: 'Se recomienda lubricar puntos de fricción.', diagnosticado_por: 'lut-demo-01', diagnosticado_por_nombre: 'Juan Luthier', created_at: enDias(-4) },
  { id: 'lut-diag-002', orden_id: 'lut-ord-003', diagnostico_tecnico: 'Cambio de cuerdas completo. Limpieza de barniz y diapasón. Ajuste de alma.', causa_probable: 'Mantenimiento preventivo programado.', tipo_dano: 'mantenimiento_preventivo', gravedad: 'leve', zona_afectada: 'General', reparacion_recomendada: 'Cambio de cuerdas + limpieza + ajuste.', materiales_requeridos: 'Juego cuerdas violín 4/4, paño microfibra, alcohol isopropílico', tiempo_estimado_horas: 1.5, costo_mano_obra: 15.00, costo_materiales: 10.00, requiere_servicio_externo: false, observaciones: 'Instrumento en buen estado general.', diagnosticado_por: 'lut-demo-01', diagnosticado_por_nombre: 'Juan Luthier', created_at: enDias(-9) },
  { id: 'lut-diag-003', orden_id: 'lut-ord-004', diagnostico_tecnico: 'Puente de cello partido en dos secciones por tensión excesiva. Requiere reemplazo completo y verificación de alma.', causa_probable: 'Tensión excesiva por afinación incorrecta. Posible factor: el alumno intentó afinar sin supervisión.', tipo_dano: 'puente_partido', gravedad: 'grave', zona_afectada: 'Puente', reparacion_recomendada: 'Reemplazar puente. Verificar alma. Reajustar cuerdas.', materiales_requeridos: 'Puente cello 4/4, cuerdas cello (juego)', tiempo_estimado_horas: 4.0, costo_mano_obra: 60.00, costo_materiales: 60.00, requiere_servicio_externo: false, observaciones: 'Se contactó al representante para aprobación del costo. Aprobado.', diagnosticado_por: 'lut-demo-01', diagnosticado_por_nombre: 'Juan Luthier', created_at: enDias(-19) },
]

const SEED_PRESUPUESTOS = [
  { id: 'lut-pres-001', orden_id: 'lut-ord-004', estado: 'aprobado', subtotal_mano_obra: 60.00, subtotal_materiales: 60.00, subtotal_servicios_externos: 0, descuento: 0, monto_institucion: 100.00, monto_representante: 35.00, aprobado_por: 'fin-demo-01', aprobado_en: enDias(-17), observaciones: 'El seguro institucional cubre 100. El representante paga 35.', created_at: enDias(-18), updated_at: enDias(-17) },
]

const SEED_INSUMOS = [
  { id: 'lut-ins-001', nombre: 'Cuerdas violín 4/4 (juego)', categoria: 'cuerdas', unidad: 'juego', stock_actual: 12, stock_minimo: 5, costo_unitario: 8.50, proveedor_sugerido: 'MusicPro', activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'lut-ins-002', nombre: 'Cuerdas violín 3/4 (juego)', categoria: 'cuerdas', unidad: 'juego', stock_actual: 8, stock_minimo: 5, costo_unitario: 7.50, proveedor_sugerido: 'MusicPro', activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'lut-ins-003', nombre: 'Cuerdas cello 4/4 (juego)', categoria: 'cuerdas', unidad: 'juego', stock_actual: 3, stock_minimo: 3, costo_unitario: 35.00, proveedor_sugerido: 'LuthierSupply', activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'lut-ins-004', nombre: 'Clavijas mecánicas (set 4)', categoria: 'clavijas', unidad: 'set', stock_actual: 1, stock_minimo: 3, costo_unitario: 18.00, proveedor_sugerido: 'Parts4Strings', activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'lut-ins-005', nombre: 'Puente cello 4/4', categoria: 'puentes', unidad: 'unidad', stock_actual: 2, stock_minimo: 2, costo_unitario: 45.00, proveedor_sugerido: 'LuthierSupply', activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'lut-ins-006', nombre: 'Resina para arco', categoria: 'accesorios', unidad: 'unidad', stock_actual: 10, stock_minimo: 5, costo_unitario: 5.00, proveedor_sugerido: 'MusicPro', activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'lut-ins-007', nombre: 'Alma cello 4/4', categoria: 'almas', unidad: 'unidad', stock_actual: 0, stock_minimo: 2, costo_unitario: 12.00, proveedor_sugerido: 'LuthierSupply', activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'lut-ins-008', nombre: 'Crin para arco violín', categoria: 'crin', unidad: 'madeja', stock_actual: 0, stock_minimo: 3, costo_unitario: 15.00, proveedor_sugerido: 'Parts4Strings', activo: false, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-06-01T00:00:00Z' },
]

const SEED_MOVIMIENTOS = [
  { id: 'lut-mov-001', insumo_id: 'lut-ins-004', orden_id: 'lut-ord-001', tipo_movimiento: 'consumo', cantidad: 1, costo_unitario: 18.00, registrado_por: 'lut-demo-01', created_at: enDias(-3) },
  { id: 'lut-mov-002', insumo_id: 'lut-ins-001', orden_id: 'lut-ord-003', tipo_movimiento: 'consumo', cantidad: 1, costo_unitario: 8.50, registrado_por: 'lut-demo-01', created_at: enDias(-8) },
  { id: 'lut-mov-003', insumo_id: 'lut-ins-005', orden_id: 'lut-ord-004', tipo_movimiento: 'consumo', cantidad: 1, costo_unitario: 45.00, registrado_por: 'lut-demo-01', created_at: enDias(-17) },
  { id: 'lut-mov-004', insumo_id: 'lut-ins-003', orden_id: 'lut-ord-004', tipo_movimiento: 'consumo', cantidad: 1, costo_unitario: 35.00, registrado_por: 'lut-demo-01', created_at: enDias(-17) },
  { id: 'lut-mov-005', insumo_id: 'lut-ins-001', orden_id: null, tipo_movimiento: 'entrada', cantidad: 5, costo_unitario: 8.00, registrado_por: 'log-demo-01', created_at: enDias(-15) },
]

const SEED_SOLICITUDES = [
  { id: 'lut-sol-001', orden_id: 'lut-ord-004', insumo_id: 'lut-ins-007', cantidad_solicitada: 2, justificacion: 'Sin stock de almas de cello — se requieren 2 unidades para reparaciones en curso.', urgencia: 'alta', costo_estimado: 24.00, proveedor_sugerido: 'LuthierSupply', estado: 'pendiente', solicitado_por: 'lut-demo-01', aprobado_por: null, fecha_requerida: enDias(-14).slice(0, 10), created_at: enDias(-16), updated_at: enDias(-16) },
  { id: 'lut-sol-002', orden_id: 'lut-ord-001', insumo_id: 'lut-ins-004', cantidad_solicitada: 3, justificacion: 'Stock bajo de clavijas mecánicas (1 unidad). Reponer para próximas reparaciones.', urgencia: 'media', costo_estimado: 54.00, proveedor_sugerido: 'Parts4Strings', estado: 'pendiente', solicitado_por: 'lut-demo-01', aprobado_por: null, fecha_requerida: enDias(5).slice(0, 10), created_at: enDias(-1), updated_at: enDias(-1) },
]

const SEED_EVIDENCIAS = [
  { id: 'lut-ev-001', orden_id: 'lut-ord-001', tipo: 'foto_antes', nombre: 'clavijero_antes.jpg', storage_path: 'luteria/lut-ord-001/clavijero_antes.jpg', descripcion: 'Clavijero antes de la reparación — desgaste visible en engranajes.', visibilidad: 'interno', subido_por: 'lut-demo-01', subido_por_nombre: 'Juan Luthier', created_at: enDias(-4) },
  { id: 'lut-ev-002', orden_id: 'lut-ord-004', tipo: 'foto_antes', nombre: 'puente_partido_antes.jpg', storage_path: 'luteria/lut-ord-004/puente_partido_antes.jpg', descripcion: 'Puente partido en dos secciones.', visibilidad: 'finanzas', subido_por: 'lut-demo-01', subido_por_nombre: 'Juan Luthier', created_at: enDias(-19) },
  { id: 'lut-ev-003', orden_id: 'lut-ord-004', tipo: 'foto_despues', nombre: 'puente_nuevo_despues.jpg', storage_path: 'luteria/lut-ord-004/puente_nuevo_despues.jpg', descripcion: 'Puente nuevo instalado y ajustado.', visibilidad: 'interno', subido_por: 'lut-demo-01', subido_por_nombre: 'Juan Luthier', created_at: enDias(-12) },
]

const SEED_INSTRUMENTOS = [
  { id: 'inst-001', marca: 'Yamaha', modelo: 'C40', tipo_instrumento: 'Guitarra Clásica', numero_serie: 'YAMC40-2024-001', imagen_url: null, alumno_nombre: 'Admin Lutería', alumno_matricula: null, ultima_reparacion: enDias(-2) },
  { id: 'inst-003', marca: 'Cremona', modelo: 'SC-175', tipo_instrumento: 'Violín 4/4', numero_serie: 'CRM-SC175-2301', imagen_url: null, alumno_nombre: 'Admin Lutería', alumno_matricula: null, ultima_reparacion: enDias(-3) },
  { id: 'inst-004', marca: 'Eastman', modelo: 'VC100', tipo_instrumento: 'Cello 4/4', numero_serie: 'EVC100-2023-045', imagen_url: null, alumno_nombre: 'Lucía Fernández', alumno_matricula: 'ALU-2024-045', ultima_reparacion: enDias(-10) },
  { id: 'inst-005', marca: 'Gliga', modelo: 'GVC-200', tipo_instrumento: 'Violín 4/4', numero_serie: 'GLI-GVC200-112', imagen_url: null, alumno_nombre: 'Sofía Gómez', alumno_matricula: 'ALU-2024-078', ultima_reparacion: null },
  { id: 'inst-006', marca: 'Eastman', modelo: 'VC200', tipo_instrumento: 'Cello 4/4', numero_serie: 'EVC200-2024-091', imagen_url: null, alumno_nombre: 'Pedro Rodríguez', alumno_matricula: 'ALU-2024-102', ultima_reparacion: null },
  { id: 'inst-007', marca: 'Yamaha', modelo: 'YVS-100', tipo_instrumento: 'Violín 3/4', numero_serie: 'YVS100-2023-204', imagen_url: null, alumno_nombre: 'María Castro', alumno_matricula: 'ALU-2024-015', ultima_reparacion: enDias(-15) },
]

async function seedIfEmpty(db) {
  const count = await db.count('ordenes')
  if (count > 0) return

  const seedMap = [
    ['ordenes', SEED_ORDENES],
    ['diagnosticos', SEED_DIAGNOSTICOS],
    ['presupuestos', SEED_PRESUPUESTOS],
    ['insumos', SEED_INSUMOS],
    ['movimientos_stock', SEED_MOVIMIENTOS],
    ['solicitudes_compra', SEED_SOLICITUDES],
    ['evidencias', SEED_EVIDENCIAS],
    ['instrumentos', SEED_INSTRUMENTOS],
  ]

  const tx = db.transaction(seedMap.map(([s]) => s), 'readwrite')
  for (const [storeName, items] of seedMap) {
    const store = tx.objectStore(storeName)
    for (const item of items) {
      store.add(item)
    }
  }
  await tx.done
}

export async function resetAll() {
  const db = await getDB()
  for (const { name } of STORES) {
    await db.clear(name)
  }
  await seedIfEmpty(db)
}

export async function getAll(storeName) {
  const db = await getDB()
  return db.getAll(storeName)
}

export async function getById(storeName, id) {
  const db = await getDB()
  return db.get(storeName, id) || null
}

export async function getByIndex(storeName, indexName, value) {
  const db = await getDB()
  return db.getAllFromIndex(storeName, `by_${indexName}`, value)
}

export async function addItem(storeName, item) {
  const db = await getDB()
  await db.add(storeName, item)
  return item
}

export async function putItem(storeName, item) {
  const db = await getDB()
  await db.put(storeName, item)
  return item
}

export async function deleteItem(storeName, id) {
  const db = await getDB()
  await db.delete(storeName, id)
}

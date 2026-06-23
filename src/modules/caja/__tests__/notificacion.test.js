import { describe, test, expect } from 'vitest'
import { NOTIF_TIPOS, buildNotificacion, buildEscalacionMora, shouldSendPush } from '../domain/notificacion.js'

describe('NOTIF_TIPOS', () => {
  test('exports all notification types', () => {
    expect(Object.values(NOTIF_TIPOS)).toContain('mora_recordatorio')
    expect(Object.values(NOTIF_TIPOS)).toContain('mora_compromiso')
    expect(Object.values(NOTIF_TIPOS)).toContain('mora_escalada')
    expect(Object.values(NOTIF_TIPOS)).toContain('accesorio_asignado')
    expect(Object.values(NOTIF_TIPOS)).toContain('stock_bajo')
  })
})

describe('buildNotificacion', () => {
  const base = {
    familia_id: 'fam-1',
    representante_id: 'rep-1',
    alumno_id: 'alu-1',
    tipo: 'mora_recordatorio',
    canal: 'ambos',
    prioridad: 'baja',
    titulo: 'Recordatorio',
    cuerpo: 'Tiene una cuota pendiente',
    datos_extra: {},
    fecha_programada: null,
  }

  test('builds notificacion with default estados', () => {
    const n = buildNotificacion(base)
    expect(n.estado_whatsapp).toBe('pendiente')
    expect(n.estado_portal).toBe('no_leida')
  })

  test('includes all provided fields', () => {
    const n = buildNotificacion(base)
    expect(n.familia_id).toBe('fam-1')
    expect(n.tipo).toBe('mora_recordatorio')
    expect(n.canal).toBe('ambos')
    expect(n.prioridad).toBe('baja')
  })
})

describe('buildEscalacionMora', () => {
  const cuota = { id: 'c1', familia_id: 'fam-1' }
  const familia = { id: 'fam-1', representante_id: 'rep-1' }

  test('diasMora=7 → mora_recordatorio, baja, ambos', () => {
    const n = buildEscalacionMora(cuota, 7, familia)
    expect(n.tipo).toBe('mora_recordatorio')
    expect(n.prioridad).toBe('baja')
    expect(n.canal).toBe('ambos')
  })

  test('diasMora=15 → mora_compromiso, media, ambos', () => {
    const n = buildEscalacionMora(cuota, 15, familia)
    expect(n.tipo).toBe('mora_compromiso')
    expect(n.prioridad).toBe('media')
    expect(n.canal).toBe('ambos')
  })

  test('diasMora=30 → mora_escalada, alta, ambos', () => {
    const n = buildEscalacionMora(cuota, 30, familia)
    expect(n.tipo).toBe('mora_escalada')
    expect(n.prioridad).toBe('alta')
    expect(n.canal).toBe('ambos')
  })

  test('diasMora=45 → mora_escalada, critica, portal', () => {
    const n = buildEscalacionMora(cuota, 45, familia)
    expect(n.tipo).toBe('mora_escalada')
    expect(n.prioridad).toBe('critica')
    expect(n.canal).toBe('portal')
  })

  test('diasMora=60 → mora_escalada, critica, portal', () => {
    const n = buildEscalacionMora(cuota, 60, familia)
    expect(n.tipo).toBe('mora_escalada')
    expect(n.prioridad).toBe('critica')
    expect(n.canal).toBe('portal')
  })

  test('other diasMora → null', () => {
    expect(buildEscalacionMora(cuota, 10, familia)).toBeNull()
    expect(buildEscalacionMora(cuota, 0, familia)).toBeNull()
    expect(buildEscalacionMora(cuota, 90, familia)).toBeNull()
  })
})

describe('shouldSendPush', () => {
  test('alta prioridad + portal canal → true', () => {
    expect(shouldSendPush({ prioridad: 'alta', canal: 'portal' })).toBe(true)
  })

  test('critica prioridad + ambos canal → true', () => {
    expect(shouldSendPush({ prioridad: 'critica', canal: 'ambos' })).toBe(true)
  })

  test('baja prioridad → false', () => {
    expect(shouldSendPush({ prioridad: 'baja', canal: 'portal' })).toBe(false)
  })

  test('alta prioridad + whatsapp only canal → false', () => {
    expect(shouldSendPush({ prioridad: 'alta', canal: 'whatsapp' })).toBe(false)
  })
})

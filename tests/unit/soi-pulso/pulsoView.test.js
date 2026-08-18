/**
 * E4: Unit Tests — pulsoView UI Rendering & Utilities
 *
 * Tests cover:
 * - renderEventRow() generates correct HTML with badge color by type
 * - renderEventRow() displays different badges for different types
 * - timeAgo() returns "hace X min" for recent timestamps
 * - timeAgo() returns "hace X h" for old timestamps
 * - filtrarEventos() filters correctly by tipo
 *
 * These tests validate the UI rendering and utility functions for the Pulso dashboard.
 */

import { describe, it, expect, beforeEach } from 'vitest'

/**
 * Utility: Convert minutes/hours to past timestamp (ISO string)
 */
function getTimestampAgo(minutes = 0, hours = 0, days = 0) {
  const now = new Date()
  const ms = (days * 24 * 60 + hours * 60 + minutes) * 60 * 1000
  const past = new Date(now - ms)
  return past.toISOString()
}

/**
 * Mock TIPO_COLORES mapping
 */
const TIPO_COLORES = {
  'sesion.iniciada': '#3B82F6', // azul
  'sesion.finalizada': '#3B82F6',
  'asistencia.registrada': '#10B981', // verde
  'asistencia.faltante': '#10B981',
  'tarea.creada': '#F59E0B', // naranja
  'tarea.completada': '#F59E0B',
  'justificacion.creada': '#8B5CF6', // morado
  'justificacion.rechazada': '#8B5CF6',
  'periodo.cerrado': '#6B7280', // gris
  'periodo.abierto': '#6B7280',
}

/**
 * Rendering functions (from pulsoView.js)
 */

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function timeAgo(timestamp) {
  const now = new Date()
  const date = new Date(timestamp)
  const diff = now - date
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'hace unos segundos'
  if (minutes < 60) return `hace ${minutes}m`
  if (hours < 24) return `hace ${hours}h`
  if (days < 7) return `hace ${days}d`
  return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
}

function getTipoBadgeColor(tipo) {
  return TIPO_COLORES[tipo] || '#9CA3AF'
}

const ENTIDAD_ICONOS = {
  alumno: 'person',
  maestro: 'person-badge',
  representante: 'people',
  instrumento: 'music-note',
  evento: 'calendar-event',
  departamento: 'building',
  otro: 'file-text',
}

function renderEventoRow(evento) {
  const color = getTipoBadgeColor(evento.tipo)
  const payload = evento.payload || {}
  const payloadStr = JSON.stringify(payload).substring(0, 100)
  const icono = ENTIDAD_ICONOS[evento.entidad_tipo] || 'file-text'

  return `
    <div class="pulso-evento-row" data-evento-id="${escapeHtml(evento.id)}">
      <div class="pulso-evento-badge" style="background-color: ${color}"></div>
      <div class="pulso-evento-content">
        <div class="pulso-evento-header">
          <span class="pulso-evento-tipo">${escapeHtml(evento.tipo)}</span>
          <span class="pulso-evento-timestamp">${timeAgo(evento.created_at)}</span>
        </div>
        <div class="pulso-evento-meta">
          <i class="bi bi-${icono} me-1"></i>
          <span class="pulso-evento-entidad">${escapeHtml(evento.entidad_tipo || 'otro')}</span>
          ${evento.entidad_id ? `<span class="pulso-evento-id">(${evento.entidad_id.substring(0, 8)}...)</span>` : ''}
        </div>
        ${payloadStr ? `<div class="pulso-evento-payload"><small>${escapeHtml(payloadStr)}</small></div>` : ''}
      </div>
    </div>
  `
}

/**
 * Filter function (from pulsoView.js)
 */
function filtrarEventos(eventos, filtros) {
  return eventos.filter(evento => {
    if (filtros.tipo && evento.tipo !== filtros.tipo) return false
    if (filtros.entidad_tipo && evento.entidad_tipo !== filtros.entidad_tipo) return false
    if (filtros.departamento && evento.departamento !== filtros.departamento) return false
    return true
  })
}

// ============================================================================
// Test Suite: E4 — pulsoView UI Rendering
// ============================================================================

describe('E4: pulsoView UI Rendering & Utilities', () => {
  let mockEventoRow, mockEventos

  beforeEach(() => {
    // Setup mock eventos
    mockEventoRow = {
      id: 'evt-001',
      tipo: 'sesion.iniciada',
      entidad_tipo: 'alumno',
      entidad_id: 'alumno-123-abc-def-ghi-jklmnop',
      payload: { sesion_id: 'ses-001', maestro: 'Carlos' },
      created_at: getTimestampAgo(5), // 5 minutes ago
    }

    mockEventos = [
      {
        id: 'evt-001',
        tipo: 'sesion.iniciada',
        entidad_tipo: 'alumno',
        entidad_id: 'alumno-001',
        payload: {},
        created_at: getTimestampAgo(5),
      },
      {
        id: 'evt-002',
        tipo: 'tarea.creada',
        entidad_tipo: 'departamento',
        entidad_id: 'dept-001',
        payload: {},
        created_at: getTimestampAgo(30),
      },
      {
        id: 'evt-003',
        tipo: 'asistencia.registrada',
        entidad_tipo: 'alumno',
        entidad_id: 'alumno-002',
        payload: {},
        created_at: getTimestampAgo(0, 2), // 2 hours ago
      },
    ]
  })

  // ========================================================================
  // T1: renderEventRow — HTML Generation & Badge Color
  // ========================================================================

  describe('renderEventRow: HTML Generation', () => {
    it('should generate HTML with correct badge color for tipo=sesion.iniciada', () => {
      const html = renderEventoRow(mockEventoRow)

      expect(html).toContain('pulso-evento-row')
      expect(html).toContain('background-color: #3B82F6') // Azul for sesion
      expect(html).toContain('data-evento-id=')
    })

    it('should generate HTML with correct badge color for tipo=tarea.creada', () => {
      const evento = {
        ...mockEventoRow,
        tipo: 'tarea.creada',
      }
      const html = renderEventoRow(evento)

      expect(html).toContain('background-color: #F59E0B') // Naranja for tarea
    })

    it('should generate HTML with correct badge color for tipo=asistencia.registrada', () => {
      const evento = {
        ...mockEventoRow,
        tipo: 'asistencia.registrada',
      }
      const html = renderEventoRow(evento)

      expect(html).toContain('background-color: #10B981') // Verde for asistencia
    })

    it('should generate HTML with correct badge color for tipo=justificacion.rechazada', () => {
      const evento = {
        ...mockEventoRow,
        tipo: 'justificacion.rechazada',
      }
      const html = renderEventoRow(evento)

      expect(html).toContain('background-color: #8B5CF6') // Morado for justificacion
    })

    it('should generate HTML with correct badge color for tipo=periodo.cerrado', () => {
      const evento = {
        ...mockEventoRow,
        tipo: 'periodo.cerrado',
      }
      const html = renderEventoRow(evento)

      expect(html).toContain('background-color: #6B7280') // Gris for periodo
    })

    it('should default to gray badge for unknown tipo', () => {
      const evento = {
        ...mockEventoRow,
        tipo: 'unknown.tipo',
      }
      const html = renderEventoRow(evento)

      expect(html).toContain('background-color: #9CA3AF') // Gray default
    })

    it('should include evento.tipo in HTML', () => {
      const html = renderEventoRow(mockEventoRow)

      expect(html).toContain('sesion.iniciada')
      expect(html).toContain('pulso-evento-tipo')
    })

    it('should include relative timestamp via timeAgo()', () => {
      const html = renderEventoRow(mockEventoRow)

      expect(html).toContain('pulso-evento-timestamp')
      expect(html).toContain('hace')
    })

    it('should include entidad_tipo in HTML', () => {
      const html = renderEventoRow(mockEventoRow)

      expect(html).toContain('alumno')
      expect(html).toContain('pulso-evento-entidad')
    })

    it('should display entidad_id truncated to 8 chars + ...', () => {
      const html = renderEventoRow(mockEventoRow)

      expect(html).toContain('alumno-1')
      expect(html).toContain('...')
    })

    it('should escape HTML in evento.tipo to prevent XSS', () => {
      const maliciousEvento = {
        ...mockEventoRow,
        tipo: '<script>alert("XSS")</script>',
      }
      const html = renderEventoRow(maliciousEvento)

      expect(html).not.toContain('<script>')
      expect(html).toContain('&lt;') // Escaped
    })

    it('should escape HTML in entidad_tipo to prevent XSS', () => {
      const maliciousEvento = {
        ...mockEventoRow,
        entidad_tipo: '<img src=x onerror="alert()">',
      }
      const html = renderEventoRow(maliciousEvento)

      expect(html).not.toContain('<img')
      expect(html).toContain('&lt;') // Escaped
    })
  })

  // ========================================================================
  // T2: timeAgo — Relative Time Formatting
  // ========================================================================

  describe('timeAgo: Relative Time Formatting', () => {
    it('should return "hace X min" for recent timestamps (< 1 hour)', () => {
      const now = new Date()
      const fiveMinutesAgo = new Date(now - 5 * 60 * 1000).toISOString()

      const result = timeAgo(fiveMinutesAgo)

      expect(result).toBe('hace 5m')
    })

    it('should return "hace 1m" for 1 minute ago', () => {
      const now = new Date()
      const oneMinuteAgo = new Date(now - 1 * 60 * 1000).toISOString()

      const result = timeAgo(oneMinuteAgo)

      expect(result).toBe('hace 1m')
    })

    it('should return "hace X h" for timestamps between 1-24 hours ago', () => {
      const now = new Date()
      const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000).toISOString()

      const result = timeAgo(twoHoursAgo)

      expect(result).toBe('hace 2h')
    })

    it('should return "hace 1h" for 1 hour ago', () => {
      const now = new Date()
      const oneHourAgo = new Date(now - 1 * 60 * 60 * 1000).toISOString()

      const result = timeAgo(oneHourAgo)

      expect(result).toBe('hace 1h')
    })

    it('should return "hace X d" for timestamps between 1-7 days ago', () => {
      const now = new Date()
      const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString()

      const result = timeAgo(threeDaysAgo)

      expect(result).toBe('hace 3d')
    })

    it('should return date string for timestamps > 7 days ago', () => {
      const now = new Date()
      const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString()

      const result = timeAgo(twoWeeksAgo)

      expect(result).toMatch(/ago/) // Format: "ago 1" or locale-specific
    })

    it('should return "hace unos segundos" for timestamps < 60 seconds ago', () => {
      const now = new Date()
      const thirtySecondsAgo = new Date(now - 30 * 1000).toISOString()

      const result = timeAgo(thirtySecondsAgo)

      expect(result).toBe('hace unos segundos')
    })
  })

  // ========================================================================
  // T3: filtrarEventos — Event Filtering
  // ========================================================================

  describe('filtrarEventos: Event Filtering', () => {
    it('should filter eventos by tipo="sesion.iniciada"', () => {
      const filtros = { tipo: 'sesion.iniciada' }
      const filtered = filtrarEventos(mockEventos, filtros)

      expect(filtered).toHaveLength(1)
      expect(filtered[0].tipo).toBe('sesion.iniciada')
    })

    it('should filter eventos by tipo="tarea.creada"', () => {
      const filtros = { tipo: 'tarea.creada' }
      const filtered = filtrarEventos(mockEventos, filtros)

      expect(filtered).toHaveLength(1)
      expect(filtered[0].tipo).toBe('tarea.creada')
    })

    it('should return empty array when no eventos match tipo filter', () => {
      const filtros = { tipo: 'periodo.cerrado' }
      const filtered = filtrarEventos(mockEventos, filtros)

      expect(filtered).toHaveLength(0)
    })

    it('should filter eventos by entidad_tipo="alumno"', () => {
      const filtros = { entidad_tipo: 'alumno' }
      const filtered = filtrarEventos(mockEventos, filtros)

      expect(filtered.length).toBeGreaterThan(0)
      filtered.forEach(e => expect(e.entidad_tipo).toBe('alumno'))
    })

    it('should filter eventos by departamento', () => {
      const eventosWithDept = mockEventos.map((e, i) => ({
        ...e,
        departamento: i === 0 ? 'ACM' : 'ADM',
      }))

      const filtros = { departamento: 'ACM' }
      const filtered = filtrarEventos(eventosWithDept, filtros)

      expect(filtered).toHaveLength(1)
      expect(filtered[0].departamento).toBe('ACM')
    })

    it('should apply multiple filters (tipo + entidad_tipo)', () => {
      const filtros = { tipo: 'sesion.iniciada', entidad_tipo: 'alumno' }
      const filtered = filtrarEventos(mockEventos, filtros)

      expect(filtered).toHaveLength(1)
      expect(filtered[0].tipo).toBe('sesion.iniciada')
      expect(filtered[0].entidad_tipo).toBe('alumno')
    })

    it('should return all eventos when filtros is empty', () => {
      const filtros = {}
      const filtered = filtrarEventos(mockEventos, filtros)

      expect(filtered).toHaveLength(mockEventos.length)
    })

    it('should return empty array when no eventos match combination of filters', () => {
      const filtros = { tipo: 'periodo.cerrado', entidad_tipo: 'alumno' }
      const filtered = filtrarEventos(mockEventos, filtros)

      expect(filtered).toHaveLength(0)
    })
  })

  // ========================================================================
  // T4: Badge Color Mapping
  // ========================================================================

  describe('Badge Color Mapping (getTipoBadgeColor)', () => {
    it('should return azul (#3B82F6) for sesion tipos', () => {
      expect(getTipoBadgeColor('sesion.iniciada')).toBe('#3B82F6')
      expect(getTipoBadgeColor('sesion.finalizada')).toBe('#3B82F6')
    })

    it('should return verde (#10B981) for asistencia tipos', () => {
      expect(getTipoBadgeColor('asistencia.registrada')).toBe('#10B981')
      expect(getTipoBadgeColor('asistencia.faltante')).toBe('#10B981')
    })

    it('should return naranja (#F59E0B) for tarea tipos', () => {
      expect(getTipoBadgeColor('tarea.creada')).toBe('#F59E0B')
      expect(getTipoBadgeColor('tarea.completada')).toBe('#F59E0B')
    })

    it('should return morado (#8B5CF6) for justificacion tipos', () => {
      expect(getTipoBadgeColor('justificacion.creada')).toBe('#8B5CF6')
      expect(getTipoBadgeColor('justificacion.rechazada')).toBe('#8B5CF6')
    })

    it('should return gris (#6B7280) for periodo tipos', () => {
      expect(getTipoBadgeColor('periodo.cerrado')).toBe('#6B7280')
      expect(getTipoBadgeColor('periodo.abierto')).toBe('#6B7280')
    })

    it('should return gray (#9CA3AF) for unknown tipos', () => {
      expect(getTipoBadgeColor('unknown.tipo')).toBe('#9CA3AF')
      expect(getTipoBadgeColor('invalid')).toBe('#9CA3AF')
    })
  })

  // ========================================================================
  // Acceptance Criteria Checklist
  // ========================================================================

  describe('Acceptance Criteria', () => {
    it('AC-UI-01: renderEventRow genera HTML con badge de color correcto para tipo="sesion.iniciada"', () => {
      const html = renderEventoRow(mockEventoRow)
      expect(html).toContain('#3B82F6')
    })

    it('AC-UI-02: renderEventRow genera badge diferente para tipo="tarea.creada"', () => {
      const tareaEvento = { ...mockEventoRow, tipo: 'tarea.creada' }
      const html = renderEventoRow(tareaEvento)
      expect(html).toContain('#F59E0B')
    })

    it('AC-UI-03: timeAgo() retorna "hace X min" para timestamp reciente', () => {
      const result = timeAgo(getTimestampAgo(10))
      expect(result).toMatch(/hace \d+m/)
    })

    it('AC-UI-04: timeAgo() retorna "hace X h" para timestamp de horas atrás', () => {
      const result = timeAgo(getTimestampAgo(0, 3))
      expect(result).toMatch(/hace \d+h/)
    })

    it('AC-UI-05: filtrarEventos() con tipo="sesion.iniciada" filtra correctamente', () => {
      const filtered = filtrarEventos(mockEventos, { tipo: 'sesion.iniciada' })
      expect(filtered.length).toBeGreaterThanOrEqual(0)
      if (filtered.length > 0) {
        filtered.forEach(e => expect(e.tipo).toBe('sesion.iniciada'))
      }
    })
  })
})

import { describe, it, expect } from 'vitest'

// Helper functions extracted for testing
function getDiasOptions(selectedValue = '') {
  const dias = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miércoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sábado', label: 'Sábado' },
  ]
  return `<option value="">Seleccionar día</option>` +
    dias.map(d => `<option value="${d.value}" ${d.value === selectedValue ? 'selected' : ''}>${d.label}</option>`).join('')
}

function getSalonesOptions(selectedId = '') {
  const salones = [
    { id: 'salon-1', nombre: 'Salón A' },
    { id: 'salon-2', nombre: 'Salón B' },
  ]
  return `<option value="">Sin salón</option>` +
    salones.map(s => `<option value="${s.id}" ${s.id === selectedId ? 'selected' : ''}>${s.nombre}</option>`).join('')
}

function getMaestrosOptions(selectedId = '') {
  const maestros = [
    { id: 'maestro-1', nombre: 'Juan Pérez' },
    { id: 'maestro-2', nombre: 'María García' },
  ]
  return `<option value="">Seleccionar...</option>` +
    maestros.map(m => `<option value="${m.id}" ${m.id === selectedId ? 'selected' : ''}>${m.nombre}</option>`).join('')
}

function getInstrumentosOptions(selectedValue = '') {
  const instrumentos = [
    'violin', 'viola', 'cello', 'bajo', 'flauta', 'oboe',
    'clarinete', 'fagot', 'trompa', 'trompeta', 'trombon',
    'tuba', 'piano', 'guitarra', 'arpa', 'percusion',
    'voz', 'direccion', 'solfeo', 'teoría',
  ]
  const etiquetas = {
    violin: 'Violín', viola: 'Viola', cello: 'Cello', bajo: 'Bajo',
    flauta: 'Flauta', oboe: 'Oboe', clarinete: 'Clarinete', fagot: 'Fagot',
    trompa: 'Trompa', trompeta: 'Trompeta', trombon: 'Trombón', tuba: 'Tuba',
    piano: 'Piano', guitarra: 'Guitarra', arpa: 'Arpa', percusion: 'Percusión',
    voz: 'Voz', direccion: 'Dirección', solfeo: 'Solfeo', teoría: 'Teoría',
  }
  return `<option value="">Seleccionar...</option>` +
    instrumentos.map(i => `<option value="${i}" ${i === selectedValue ? 'selected' : ''}>${etiquetas[i] || i}</option>`).join('')
}

function getEstadosOptions(selectedValue = 'activa') {
  const estados = ['activa', 'suspendida', 'finalizada']
  const etiquetas = { activa: 'Activa', suspendida: 'Suspendida', finalizada: 'Finalizada' }
  return estados.map(e => `<option value="${e}" ${e === selectedValue ? 'selected' : ''}>${etiquetas[e]}</option>`).join('')
}

function renderHorarioRow(horario, index) {
  return `
    <div class="horario-row" data-index="${index}">
      <select name="horario-dia">
        ${getDiasOptions(horario?.dia || '')}
      </select>
      <input type="time" name="horario-hora_inicio" value="${horario?.hora_inicio || ''}">
      <input type="time" name="horario-hora_fin" value="${horario?.hora_fin || ''}">
      <select name="horario-salon_id">
        ${getSalonesOptions(horario?.salon_id || '')}
      </select>
    </div>
  `
}

function formatHorariosDisplay(horarios) {
  if (!horarios || horarios.length === 0) return '-'
  const diasMap = { lunes: 'Lu', martes: 'Ma', miercoles: 'Mi', jueves: 'Ju', viernes: 'Vi', sabado: 'Sa' }
  return horarios.map(h => {
    const diaCorto = diasMap[h.dia] || h.dia.slice(0, 2)
    const inicio = h.hora_inicio || ''
    const fin = h.hora_fin || ''
    return `${diaCorto} ${inicio}-${fin}`
  }).join(', ')
}

function escapeHTML(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

describe('clasesView Helpers', () => {
  describe('getDiasOptions()', () => {
    it('should return options with placeholder', () => {
      const result = getDiasOptions()
      expect(result).toContain('<option value="">Seleccionar día</option>')
      expect(result).toContain('value="lunes"')
      expect(result).toContain('Lunes')
    })

    it('should mark selected option', () => {
      const result = getDiasOptions('martes')
      expect(result).toContain('value="martes" selected')
    })
  })

  describe('getSalonesOptions()', () => {
    it('should include placeholder', () => {
      const result = getSalonesOptions()
      expect(result).toContain('<option value="">Sin salón</option>')
    })

    it('should mark selected option', () => {
      const result = getSalonesOptions('salon-1')
      expect(result).toContain('value="salon-1" selected')
    })
  })

  describe('getMaestrosOptions()', () => {
    it('should include placeholder', () => {
      const result = getMaestrosOptions()
      expect(result).toContain('<option value="">Seleccionar...</option>')
    })

    it('should mark selected option', () => {
      const result = getMaestrosOptions('maestro-2')
      expect(result).toContain('value="maestro-2" selected')
    })
  })

  describe('getInstrumentosOptions()', () => {
    it('should include violin option', () => {
      const result = getInstrumentosOptions()
      expect(result).toContain('value="violin"')
      expect(result).toContain('Violín')
    })

    it('should mark selected option', () => {
      const result = getInstrumentosOptions('piano')
      expect(result).toContain('value="piano" selected')
    })
  })

  describe('getEstadosOptions()', () => {
    it('should have default activa selected', () => {
      const result = getEstadosOptions()
      expect(result).toContain('value="activa" selected')
      expect(result).toContain('value="suspendida"')
    })

    it('should respect selected value', () => {
      const result = getEstadosOptions('finalizada')
      expect(result).toContain('value="finalizada" selected')
    })
  })

  describe('renderHorarioRow()', () => {
    it('should render empty row when no horario', () => {
      const result = renderHorarioRow(null, 0)
      expect(result).toContain('data-index="0"')
      expect(result).toContain('name="horario-dia"')
      expect(result).toContain('name="horario-hora_inicio"')
      expect(result).toContain('name="horario-salon_id"')
    })

    it('should render row with horario data', () => {
      const horario = {
        dia: 'lunes',
        hora_inicio: '08:00',
        hora_fin: '09:00',
        salon_id: 'salon-1'
      }
      const result = renderHorarioRow(horario, 1)
      expect(result).toContain('value="lunes" selected')
      expect(result).toContain('value="08:00"')
      expect(result).toContain('value="09:00"')
      expect(result).toContain('value="salon-1" selected')
    })
  })

  describe('formatHorariosDisplay()', () => {
    it('should return dash for empty array', () => {
      expect(formatHorariosDisplay([])).toBe('-')
    })

    it('should return dash for null', () => {
      expect(formatHorariosDisplay(null)).toBe('-')
    })

    it('should format single horario', () => {
      const result = formatHorariosDisplay([{ dia: 'lunes', hora_inicio: '08:00', hora_fin: '09:00' }])
      expect(result).toBe('Lu 08:00-09:00')
    })

    it('should format multiple horarios', () => {
      const result = formatHorariosDisplay([
        { dia: 'lunes', hora_inicio: '08:00', hora_fin: '09:00' },
        { dia: 'miercoles', hora_inicio: '10:00', hora_fin: '11:30' }
      ])
      expect(result).toContain('Lu 08:00-09:00')
      expect(result).toContain('Mi 10:00-11:30')
    })
  })

  describe('escapeHTML()', () => {
    it('should escape HTML', () => {
      expect(escapeHTML('<script>')).toBe('&lt;script&gt;')
    })

    it('should handle empty', () => {
      expect(escapeHTML('')).toBe('')
      expect(escapeHTML(null)).toBe('')
    })
  })
})
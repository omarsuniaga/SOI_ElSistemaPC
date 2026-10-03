import { describe, it, expect } from 'vitest'
import {
  filtrarCriticosPorInstrumento,
  renderPlantillaWhatsapp,
  PLANTILLA_WHATSAPP_DEFAULT,
} from '../alumnosCriticosService.js'

const criticos = [
  { alumno_id: 'a1', nombre_completo: 'Ana', instrumento: 'Violín', dias_ausencia_distintos: 5, representante_nombre: 'Rosa', telefono_whatsapp: '+18295551111' },
  { alumno_id: 'a2', nombre_completo: 'Luis', instrumento: 'Piano', dias_ausencia_distintos: 3, representante_nombre: null, telefono_whatsapp: null },
]

describe('filtrarCriticosPorInstrumento', () => {
  it('devuelve todos cuando no hay filtro', () => {
    expect(filtrarCriticosPorInstrumento(criticos, '')).toHaveLength(2)
  })

  it('filtra por instrumento exacto, sin distinguir mayúsculas ni tildes', () => {
    const res = filtrarCriticosPorInstrumento(criticos, 'violin')
    expect(res.map((c) => c.alumno_id)).toEqual(['a1'])
  })
})

describe('renderPlantillaWhatsapp', () => {
  it('sustituye los campos del alumno y del representante', () => {
    const msg = renderPlantillaWhatsapp('Hola {representante}, {alumno} tiene {dias} días de ausencia.', criticos[0])
    expect(msg).toBe('Hola Rosa, Ana tiene 5 días de ausencia.')
  })

  it('usa "Representante" cuando no hay nombre de representante', () => {
    const msg = renderPlantillaWhatsapp('Hola {representante}', criticos[1])
    expect(msg).toBe('Hola Representante')
  })

  it('la plantilla por defecto menciona al alumno y los días', () => {
    const msg = renderPlantillaWhatsapp(PLANTILLA_WHATSAPP_DEFAULT, criticos[0])
    expect(msg).toContain('Ana')
    expect(msg).toContain('5')
  })
})

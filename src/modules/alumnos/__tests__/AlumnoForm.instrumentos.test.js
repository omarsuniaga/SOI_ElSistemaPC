import { describe, expect, it } from 'vitest'
import { AlumnoForm } from '../components/AlumnoForm.js'

describe('alta de alumno sin cátedra instrumental', () => {
  it('guarda el interés sin exigir instrumento principal', () => {
    const form = new AlumnoForm()
    const body = document.createElement('div')
    body.innerHTML = form.render()
    body.querySelector('#modal-nombre').value = 'Alumna de iniciación'
    body.querySelector('#modal-telefono').value = '8091234567'
    body.querySelector('#modal-instrumento-interes').value = 'Violín'

    const result = form.validate(body)
    expect(result.valid).toBe(true)
    expect(result.data.instrumento).toBe('')
    expect(result.data.instrumento_interes).toBe('Violín')
  })

  it('permite dejar ambos instrumentos vacíos para un alumno de coro', () => {
    const form = new AlumnoForm()
    const body = document.createElement('div')
    body.innerHTML = form.render()
    body.querySelector('#modal-nombre').value = 'Alumna de coro'
    body.querySelector('#modal-telefono').value = '8091234567'

    expect(form.validate(body)).toMatchObject({ valid: true, data: { instrumento: '', instrumento_interes: null } })
  })
})

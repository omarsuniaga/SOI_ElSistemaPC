import { Ruta } from '../models/ruta.model.js'

describe('Ruta Model', () => {
  it('creates instance with defaults', () => {
    const ruta = new Ruta({
      instrumento: 'Guitarra',
      nivel: 'Nivel 1',
      nombre: 'SOI Estándar',
      tipo: 'soi-estandar',
      estado: 'activa',
      objetivos: [{ descripcion: 'Obj1', semana_inicio: 1, semana_fin: 2 }]
    })
    expect(ruta.duracion_semanas).toBe(40)
    expect(ruta.isActiva()).toBe(true)
  })

  it('validates required fields', () => {
    const ruta = new Ruta({ tipo: 'soi-estandar', estado: 'activa' })
    const errors = ruta.validate()
    expect(errors).toContain('Instrumento es requerido')
    expect(errors).toContain('Nivel es requerido')
  })

  it('validates objetivo order and ranges', () => {
    const ruta = new Ruta({
      instrumento: 'Guitarra',
      nivel: 'Nivel 1',
      nombre: 'Test',
      tipo: 'soi-estandar',
      estado: 'activa',
      duracion_semanas: 10,
      objetivos: [
        { descripcion: 'Obj1', semana_inicio: 5, semana_fin: 3 } // fin < inicio
      ]
    })
    const errors = ruta.validate()
    expect(errors).toContain('Objetivo 1: semana_fin >= semana_inicio')
  })

  it('requires ruta_base_id for variants', () => {
    const ruta = new Ruta({
      instrumento: 'Guitarra',
      nivel: 'Nivel 1',
      nombre: 'Variante',
      tipo: 'maestro-variante',
      estado: 'pendiente',
      objetivos: [{ descripcion: 'Obj1', semana_inicio: 1, semana_fin: 2 }]
      // Missing ruta_base_id
    })
    const errors = ruta.validate()
    expect(errors).toContain('Variante debe referenciar ruta base')
  })
})

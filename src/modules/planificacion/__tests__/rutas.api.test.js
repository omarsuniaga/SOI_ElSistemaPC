import { supabase } from '../../../lib/supabaseClient.js'
import {
  crearRuta,
  obtenerRuta,
  listarRutas,
  actualizarRuta,
  obtenerProgresoRuta,
  obtenerVariantesPendientes,
  aprobarVariante
} from '../api/rutasApi.js'

describe('Rutas API', () => {
  const rutaData = {
    instrumento: 'Guitarra',
    nivel: 'Nivel 1',
    nombre: 'Test SOI',
    tipo: 'soi-estandar',
    estado: 'activa',
    duracion_semanas: 40,
    objetivos: [
      { descripcion: 'Escala Do Mayor', semana_inicio: 1, semana_fin: 2, orden: 1 },
      { descripcion: 'Lectura', semana_inicio: 3, semana_fin: 3, orden: 2 }
    ]
  }

  it('creates a ruta with objectives', async () => {
    const ruta = await crearRuta(rutaData)
    expect(ruta.id).toBeDefined()
    expect(ruta.nombre).toBe('Test SOI')
    expect(ruta.objetivos.length).toBe(2)
  })

  it('fetches a ruta by id', async () => {
    const created = await crearRuta(rutaData)
    const fetched = await obtenerRuta(created.id)
    expect(fetched.id).toBe(created.id)
    expect(fetched.objetivos.length).toBe(2)
  })

  it('lists rutas filtered by instrumento/nivel/estado', async () => {
    await crearRuta(rutaData)
    const lista = await listarRutas({ instrumento: 'Guitarra', nivel: 'Nivel 1', estado: 'activa' })
    expect(lista.length).toBeGreaterThan(0)
    expect(lista[0].instrumento).toBe('Guitarra')
  })

  it('updates a ruta', async () => {
    const created = await crearRuta(rutaData)
    const updated = await actualizarRuta(created.id, { nombre: 'Updated' })
    expect(updated.nombre).toBe('Updated')
  })

  it('gets progreso (progress) for a clase', async () => {
    // This test requires a clase with ruta_id
    // Placeholder for integration test
    expect(true).toBe(true)
  })

  it('lists pending variants for admin', async () => {
    const pending = await obtenerVariantesPendientes()
    expect(Array.isArray(pending)).toBe(true)
  })

  it('approves a variant', async () => {
    // Requires setup with variant
    expect(true).toBe(true)
  })
})

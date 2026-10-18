import { describe, expect, it } from 'vitest'

URL.createObjectURL = () => 'blob:demo'
const api = await import('../api/documentosPublicosMock.js')

const png = () => new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])], 'a.png', { type: 'image/png' })

describe('documentosPublicosMock (modo Demo)', () => {
  it('flujo completo: crear, subir, publicar, reemplazar manteniendo el slug, despublicar y archivar', async () => {
    const p = await api.crearPublicacion({ titulo: 'Circular de prueba', descripcion: '', fecha: '2026-10-01', categoria: 'comunicado' })
    expect(p.slug).toMatch(/^[a-z0-9]{10}$/)
    await expect(api.cambiarEstado(p.id, 'publicado')).rejects.toThrow(/sin un documento/)
    const v1 = await api.subirVersion(p.id, png(), 'inicial')
    expect(v1.numero).toBe(1)
    await api.cambiarEstado(p.id, 'publicado')
    expect((await api.obtenerPublicacionPublica(p.slug)).version_numero).toBe(1)
    const v2 = await api.subirVersion(p.id, png(), 'corrección')
    expect(v2.numero).toBe(2)
    const pub = await api.obtenerPublicacionPublica(p.slug)
    expect(pub.slug).toBe(p.slug)
    expect(pub.version_numero).toBe(2)
    expect(pub).not.toHaveProperty('created_by')
    await api.activarVersion(p.id, v1.id)
    expect((await api.obtenerPublicacionPublica(p.slug)).version_numero).toBe(1)
    await api.cambiarEstado(p.id, 'borrador')
    expect(await api.obtenerPublicacionPublica(p.slug)).toBeNull()
    await api.cambiarEstado(p.id, 'archivado')
    await expect(api.cambiarEstado(p.id, 'publicado')).rejects.toThrow(/Transición/)
    await expect(api.subirVersion(p.id, png())).rejects.toThrow(/archivada/)
    const acciones = (await api.listarEventos(p.id)).map((e) => e.accion)
    expect(acciones).toEqual(expect.arrayContaining(['crear', 'nueva_version', 'publicar', 'activar_version', 'despublicar', 'archivar']))
  })
  it('rechaza archivos con contenido falso', async () => {
    const p = await api.crearPublicacion({ titulo: 'Otra circular', categoria: 'general' })
    const fake = new File([new Uint8Array([0x4d, 0x5a, 0, 0, 0, 0, 0, 0])], 'x.png', { type: 'image/png' })
    await expect(api.subirVersion(p.id, fake)).rejects.toThrow()
  })
  it('no expone borradores ni slugs inexistentes al público', async () => {
    expect(await api.obtenerPublicacionPublica('demo2026cd2')).toBeNull()
    expect(await api.obtenerPublicacionPublica('zzzzzzzzzz')).toBeNull()
    expect((await api.obtenerPublicacionPublica('demo2026ab1')).titulo).toMatch(/Calendario/)
  })
})

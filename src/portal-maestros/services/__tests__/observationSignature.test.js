import { describe, expect, it } from 'vitest'
import { buildObservationSignature, observationSignatureLabel } from '../observationSignature.js'
import { renderSignedSessionObservations } from '../../../shared/components/signedSessionObservations.js'
const clase = { maestro_principal_id: 'titular', maestro_suplente_id: 'suplente' }
describe('firma de la observación', () => {
  it('firma con el actor real conservando la titularidad de la sesión', () => {
    const signature = buildObservationSignature('titular', { clase, actorMaestroId: 'suplente', actorNombre: 'Luis', maestroUserId: 'auth-luis' })
    expect(signature).toMatchObject({ maestro_id: 'suplente', nombre: 'Luis', user_id: 'auth-luis', rol: 'suplente' })
    expect(observationSignatureLabel(signature)).toBe('Escrita por Luis · Maestro suplente')
  })
  it('identifica al titular y no inventa autoría en registros antiguos', () => {
    expect(buildObservationSignature('titular', { clase }).rol).toBe('titular')
    expect(observationSignatureLabel(null)).toBe('Autor no registrado')
  })
  it('muestra la firma fuera del texto musical y escapa texto y nombre', () => {
    const signature = buildObservationSignature('titular', { clase, actorMaestroId: 'suplente', actorNombre: '<script>Luis</script>' })
    const html = renderSignedSessionObservations([{ contenido_raw: '<img src=x>', contenido_parsed: { _author: signature } }])
    expect(html).toContain('Maestro suplente')
    expect(html).toContain('&lt;img src=x&gt;')
    expect(html).not.toContain('<script>')
  })
})

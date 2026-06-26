import { useState, useEffect } from 'react'
import { obtenerGatewayConfig, actualizarGatewayConfig, crearGatewayConfig } from '../api/gatewayApi.js'

export default function GatewayConfigView() {
  const [config, setConfig] = useState(null)
  const [edit, setEdit] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    cargarConfig()
  }, [])

  async function cargarConfig() {
    try {
      setLoading(true)
      const cfg = await obtenerGatewayConfig()
      setConfig(cfg)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function guardarCambios() {
    if (!Object.keys(edit).length) return
    try {
      setSaving(true)
      const actualizado = await actualizarGatewayConfig(edit)
      setConfig(actualizado)
      setEdit({})
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Cargando...</div>
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>
  if (!config) {
    return (
      <div>
        <h2>Configuración del Gateway</h2>
        <p>No hay configuración activa. Crear una nueva:</p>
        <input type="text" placeholder="gateway_url" />
        <input type="text" placeholder="instance_name (Baileys)" />
        <input type="text" placeholder="api_key" />
        <input type="text" placeholder="numero_wid (+1234567890)" />
        <input type="text" placeholder="numero_nombre (amigable)" />
        <button>Crear Gateway</button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', fontFamily: 'monospace' }}>
      <h2>Gateway WhatsApp (Baileys) — Subsistema 4</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <td style={{ padding: '8px', fontWeight: 'bold' }}>Número dedicado</td>
            <td style={{ padding: '8px' }}>{edit.numero_wid ?? config.numero_wid ?? '(sin asignar)'}</td>
            <td style={{ padding: '8px' }}>
              <input
                type="text"
                value={edit.numero_wid ?? config.numero_wid ?? ''}
                onChange={(e) => setEdit({ ...edit, numero_wid: e.target.value })}
                placeholder="Ej: +1 (829) 555-0123"
              />
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <td style={{ padding: '8px', fontWeight: 'bold' }}>Nombre amigable</td>
            <td style={{ padding: '8px' }}>{edit.numero_nombre ?? config.numero_nombre ?? '(sin nombre)'}</td>
            <td style={{ padding: '8px' }}>
              <input
                type="text"
                value={edit.numero_nombre ?? config.numero_nombre ?? ''}
                onChange={(e) => setEdit({ ...edit, numero_nombre: e.target.value })}
                placeholder="Ej: Botón Inscripción"
              />
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <td style={{ padding: '8px', fontWeight: 'bold' }}>Cap diario</td>
            <td style={{ padding: '8px' }}>{edit.cap_diario ?? config.cap_diario}</td>
            <td style={{ padding: '8px' }}>
              <input
                type="number"
                value={edit.cap_diario ?? config.cap_diario}
                onChange={(e) => setEdit({ ...edit, cap_diario: parseInt(e.target.value) })}
              />
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <td style={{ padding: '8px', fontWeight: 'bold' }}>Warmup desde</td>
            <td style={{ padding: '8px' }}>{edit.warmup_desde ?? config.warmup_desde ?? '(no iniciado)'}</td>
            <td style={{ padding: '8px' }}>
              <input
                type="date"
                value={edit.warmup_desde ?? config.warmup_desde ?? ''}
                onChange={(e) => setEdit({ ...edit, warmup_desde: e.target.value })}
              />
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <td style={{ padding: '8px', fontWeight: 'bold' }}>Gateway URL</td>
            <td colSpan="2" style={{ padding: '8px', fontSize: '0.9em' }}>
              {config.gateway_url}
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <td style={{ padding: '8px', fontWeight: 'bold' }}>Instance</td>
            <td colSpan="2" style={{ padding: '8px', fontSize: '0.9em' }}>
              {config.instance_name}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '8px', fontWeight: 'bold' }}>Activo</td>
            <td colSpan="2" style={{ padding: '8px' }}>
              {config.activo ? '✓ SÍ' : '✗ NO'}
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: '16px' }}>
        <button onClick={guardarCambios} disabled={saving || !Object.keys(edit).length}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}

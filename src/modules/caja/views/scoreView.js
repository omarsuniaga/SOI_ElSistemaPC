/**
 * scoreView.js - Score dashboard (admin only)
 * Route: #/score
 * Shows family score/nivel list sorted by score ASC.
 * Level distribution bar chart is CSS-only (no canvas).
 */
import * as cajaApi from '../api/cajaApi.js'

const VERDE = '#059669'

const NIVEL_CONFIG = {
  A: { color: '#059669', label: 'Excelente' },
  B: { color: '#0d9488', label: 'Bueno' },
  C: { color: '#f59e0b', label: 'Regular' },
  D: { color: '#f97316', label: 'En riesgo' },
  E: { color: '#ef4444', label: 'Critico' },
}

function getNivelCfg(nivel) {
  return NIVEL_CONFIG[(nivel || 'C').toUpperCase()] || NIVEL_CONFIG.C
}

function fmtScore(val) {
  return Number(val || 0).toFixed(1)
}

function nivelBadge(nivel) {
  const cfg = getNivelCfg(nivel)
  return '<span style="display:inline-flex;align-items:center;justify-content:center;'
    + 'width:28px;height:28px;border-radius:50%;background:' + cfg.color + ';'
    + 'color:#fff;font-size:0.8125rem;font-weight:800">' + (nivel || '?').toUpperCase() + '</span>'
}

function scoreBar(score) {
  const pct = Math.min(100, Math.max(0, Number(score || 0)))
  const color = pct >= 70 ? VERDE : pct >= 40 ? '#f59e0b' : '#ef4444'
  return '<div style="width:100%;background:#e2e8f0;border-radius:4px;height:6px;margin-top:4px">'
    + '<div style="width:' + pct + '%;background:' + color + ';height:6px;border-radius:4px"></div></div>'
}

function distributionBar(familias) {
  const total = familias.length || 1
  const counts = { A: 0, B: 0, C: 0, D: 0, E: 0 }
  for (const f of familias) {
    const n = (f.nivel || 'C').toUpperCase()
    if (counts[n] !== undefined) counts[n]++
    else counts.C++
  }
  return Object.entries(counts).map(([nivel, count]) => {
    if (count === 0) return ''
    const cfg = getNivelCfg(nivel)
    const pct = ((count / total) * 100).toFixed(1)
    return '<div style="flex:' + count + ';min-width:30px;background:' + cfg.color + ';'
      + 'display:flex;align-items:center;justify-content:center;color:#fff;'
      + 'font-size:0.6875rem;font-weight:700;padding:0.25rem 0" '
      + 'title="Nivel ' + nivel + ': ' + count + ' (' + pct + '%)">'
      + nivel + ' ' + count + '</div>'
  }).join('')
}

export async function render(container, session) {
  // Role guard
  const role = session?.user?.user_metadata?.role
  if (role !== 'admin') {
    container.innerHTML = '<div style="padding:2rem;text-align:center">'
      + '<i class="bi bi-shield-lock-fill" style="font-size:2.5rem;color:#94a3b8"></i>'
      + '<p style="color:#64748b;margin-top:0.75rem">Esta seccion es exclusiva para administradores.</p></div>'
    return { teardown() {} }
  }

  container.innerHTML = '<div style="padding:1.5rem"><p style="color:#94a3b8">Cargando scores...</p></div>'

  const { data: familias, error } = await cajaApi.getFamilias()

  if (error) {
    container.innerHTML = '<div style="padding:1.5rem"><p style="color:#ef4444">Error al cargar datos.</p></div>'
    return { teardown() {} }
  }

  const sorted = [...(familias || [])].sort((a, b) => Number(a.score || 0) - Number(b.score || 0))

  const conteo = { A: 0, B: 0, C: 0, D: 0, E: 0 }
  for (const f of sorted) {
    const n = (f.nivel || 'C').toUpperCase()
    if (conteo[n] !== undefined) conteo[n]++
    else conteo.C++
  }

  function familyRow(f) {
    const cfg = getNivelCfg(f.nivel)
    return '<div style="display:flex;align-items:center;gap:1rem;padding:0.875rem 1rem;border-bottom:1px solid #f1f5f9">'
      + '<div style="flex-shrink:0">' + nivelBadge(f.nivel) + '</div>'
      + '<div style="flex:1;min-width:0">'
      + '<p style="margin:0;font-size:0.875rem;font-weight:600;color:#0f172a;'
      + 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'
      + (f.nombre || f.codigo || '-') + '</p>'
      + '<p style="margin:0;font-size:0.75rem;color:#64748b">'
      + (f.representante_nombre || f.representante || '-') + '</p>'
      + scoreBar(f.score)
      + '</div>'
      + '<div style="text-align:right;flex-shrink:0">'
      + '<span style="font-size:1.125rem;font-weight:800;color:' + cfg.color + '">' + fmtScore(f.score) + '</span>'
      + '<p style="margin:0;font-size:0.6875rem;color:#94a3b8">' + cfg.label + '</p>'
      + '</div></div>'
  }

  const legendHtml = Object.entries(conteo).map(([n, c]) =>
    '<span style="display:flex;align-items:center;gap:0.375rem;font-size:0.75rem;color:#475569">'
    + '<span style="width:10px;height:10px;border-radius:50%;background:' + getNivelCfg(n).color + ';display:inline-block"></span>'
    + 'Nivel ' + n + ': <b>' + c + '</b></span>'
  ).join('')

  container.innerHTML =
    '<div style="padding:1.5rem;max-width:900px">'
    + '<div style="margin-bottom:1.5rem;display:flex;align-items:center;justify-content:space-between">'
    + '<div><h2 style="margin:0;font-size:1.25rem;font-weight:700;color:#0f172a">'
    + '<i class="bi bi-trophy-fill" style="color:' + VERDE + '"></i> Score de Familias</h2>'
    + '<p style="margin:0;font-size:0.8125rem;color:#64748b">'
    + sorted.length + ' familias &mdash; ordenadas por riesgo (menor primero)</p></div>'
    + '<span style="background:#f0fdf4;color:' + VERDE + ';font-size:0.75rem;font-weight:600;'
    + 'padding:0.25rem 0.75rem;border-radius:9999px;border:1px solid #bbf7d0">'
    + '<i class="bi bi-shield-lock"></i> Admin</span></div>'
    // Distribution bar
    + '<div style="background:#fff;border-radius:12px;padding:1.25rem;'
    + 'box-shadow:0 1px 3px rgba(0,0,0,0.08);margin-bottom:1.5rem">'
    + '<p style="margin:0 0 0.75rem;font-size:0.8125rem;font-weight:600;color:#64748b">DISTRIBUCION POR NIVEL</p>'
    + '<div style="display:flex;border-radius:8px;overflow:hidden;height:32px">'
    + distributionBar(sorted) + '</div>'
    + '<div style="display:flex;gap:1.5rem;margin-top:0.75rem;flex-wrap:wrap">' + legendHtml + '</div></div>'
    // Family list
    + '<div style="background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);overflow:hidden">'
    + '<div style="padding:1rem;border-bottom:1px solid #f1f5f9">'
    + '<p style="margin:0;font-size:0.875rem;font-weight:600;color:#0f172a">Listado de familias</p></div>'
    + sorted.map(familyRow).join('')
    + (sorted.length === 0
        ? '<p style="padding:2rem;text-align:center;color:#94a3b8">Sin familias registradas</p>'
        : '')
    + '</div></div>'

  return { teardown() {} }
}

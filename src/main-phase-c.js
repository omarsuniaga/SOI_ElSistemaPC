/**
 * Phase C: E2E Testing - Ultra-simplified Portal Maestros
 * Only what's needed: Login → Select Student → View Route → Evaluate
 */

import { supabase } from './lib/supabaseClient.js'

const STATE = {
  maestro: null,
  estudiante: null,
  ruta: null,
  niveles: [],
  nodos: []
}

// ═══════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════

async function showLoginView() {
  const app = document.getElementById('portal-app')
  app.innerHTML = `
    <div style="max-width: 400px; margin: 60px auto; padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h1 style="text-align: center; color: #333; margin-top: 0;">Portal Maestros — SOI</h1>
      <p style="text-align: center; color: #666; font-size: 14px;">Phase C: E2E Testing</p>

      <form id="login-form" style="display: flex; flex-direction: column; gap: 12px;">
        <input
          id="email"
          type="email"
          placeholder="Email"
          required
          style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;"
        />
        <input
          id="password"
          type="password"
          placeholder="Contraseña"
          required
          style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;"
        />
        <button
          type="submit"
          style="padding: 10px; background: #007aff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;"
        >
          Iniciar sesión
        </button>
      </form>
      <p id="login-status" style="text-align: center; color: #d32f2f; font-size: 12px; margin-top: 10px;"></p>
    </div>
  `

  document.getElementById('login-form').addEventListener('submit', handleLogin)
}

async function handleLogin(e) {
  e.preventDefault()
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const status = document.getElementById('login-status')

  try {
    status.textContent = 'Iniciando sesión...'

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)

    const { data: maestro, error: maestroErr } = await supabase
      .from('maestros')
      .select('*')
      .eq('user_id', data.user.id)
      .single()

    if (maestroErr || !maestro) throw new Error('No tienes acceso de maestro')

    STATE.maestro = maestro
    status.textContent = ''
    showStudentSelector()
  } catch (err) {
    status.textContent = '❌ ' + err.message
  }
}

// ═══════════════════════════════════════════════════════════════
// STUDENT SELECTOR
// ═══════════════════════════════════════════════════════════════

async function showStudentSelector() {
  const app = document.getElementById('portal-app')
  app.innerHTML = `<div style="padding: 20px; text-align: center;">Cargando estudiantes...</div>`

  try {
    const { data: clases } = await supabase
      .from('clases')
      .select('id, nombre')
      .or(`maestro_principal_id.eq.${STATE.maestro.id},maestro_suplente_id.eq.${STATE.maestro.id}`)

    if (!clases?.length) throw new Error('No tienes clases')

    const { data: inscripciones } = await supabase
      .from('alumnos_clases')
      .select('alumno_id, alumnos(id, nombre_completo)')
      .in('clase_id', clases.map(c => c.id))

    if (!inscripciones?.length) throw new Error('No hay estudiantes inscritos')

    const estudiantes = [...new Map(inscripciones.map(i => [i.alumno_id, {
      id: i.alumno_id,
      nombre: i.alumnos?.nombre_completo || 'Estudiante'
    }])).values()]

    let html = `
      <div style="max-width: 500px; margin: 40px auto; padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="margin-top: 0;">Selecciona un Estudiante</h2>
        <div style="display: flex; flex-direction: column; gap: 8px;">
    `

    estudiantes.forEach(est => {
      html += `
        <button
          onclick="window.selectEstudiante('${est.id}')"
          style="padding: 12px; text-align: left; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 14px; transition: all 0.2s;"
          onmouseover="this.style.background='#e3f2fd'"
          onmouseout="this.style.background='#f5f5f5'"
        >
          📚 ${est.nombre}
        </button>
      `
    })

    html += `</div></div>`
    app.innerHTML = html
  } catch (err) {
    app.innerHTML = `<div style="padding: 20px; color: red;">Error: ${err.message}</div>`
  }
}

window.selectEstudiante = async (alumnoId) => {
  STATE.estudiante = { id: alumnoId }
  showRouteView()
}

// ═══════════════════════════════════════════════════════════════
// ROUTE VIEW - Ver ruta académica con indicadores
// ═══════════════════════════════════════════════════════════════

async function showRouteView() {
  const app = document.getElementById('portal-app')
  app.innerHTML = `<div style="padding: 20px; text-align: center;">Cargando ruta académica...</div>`

  try {
    // Get route - filter to get one with actual levels/nodes
    const { data: routes } = await supabase
      .from('routes')
      .select('id, name')
      .eq('status', 'published')

    if (!routes?.length) throw new Error('No hay ruta académica publicada')

    // Get the first route that has levels
    let route = null
    for (const r of routes) {
      const { data: levels } = await supabase
        .from('levels')
        .select('id')
        .eq('route_version_id', r.id)
        .limit(1)

      if (levels?.length > 0) {
        route = r
        break
      }
    }

    if (!route) throw new Error('No hay ruta con niveles publicada')

    if (!route) throw new Error('No hay ruta académica publicada')

    // Get version
    const { data: version } = await supabase
      .from('route_versions')
      .select('id')
      .eq('route_id', route.id)
      .eq('status', 'published')
      .single()

    if (!version) throw new Error('No hay versión de ruta publicada')

    // Get levels
    const { data: levels } = await supabase
      .from('levels')
      .select('id, level_number, nombre')
      .eq('route_version_id', version.id)
      .order('level_number')

    if (!levels) throw new Error('No hay niveles')

    STATE.ruta = { id: route.id, versionId: version.id }
    STATE.niveles = levels

    // Get all nodes for this version
    const { data: nodes } = await supabase
      .from('nodes')
      .select('id, name, level_id, type')
      .in('level_id', levels.map(l => l.id))

    STATE.nodos = nodes || []

    // Get all indicators
    const { data: indicators } = await supabase
      .from('indicators')
      .select('id, node_id, nombre')
      .in('node_id', STATE.nodos.map(n => n.id))

    const indicatorsMap = {}
    indicators?.forEach(ind => {
      if (!indicatorsMap[ind.node_id]) indicatorsMap[ind.node_id] = []
      indicatorsMap[ind.node_id].push(ind)
    })

    // Render
    let html = `
      <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="margin: 0;">📚 ${route.name}</h2>
          <button onclick="window.logout()" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Cerrar sesión
          </button>
        </div>
    `

    // Show levels with nodes
    levels.forEach(level => {
      const levelNodes = STATE.nodos.filter(n => n.level_id === level.id)

      html += `
        <div style="margin-bottom: 30px; padding: 15px; background: #f9f9f9; border-radius: 8px; border-left: 4px solid #007aff;">
          <h3 style="margin-top: 0; color: #333;">Nivel ${level.level_number}: ${level.nombre}</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;">
      `

      levelNodes.forEach(node => {
        const nodeIndicators = indicatorsMap[node.id] || []
        html += `
          <div style="padding: 12px; background: white; border: 1px solid #ddd; border-radius: 6px; cursor: pointer;"
               onclick="window.showNodeEvaluation('${node.id}')">
            <strong style="color: #007aff;">${node.name}</strong>
            <div style="font-size: 12px; color: #666; margin-top: 6px;">
              ${nodeIndicators.length} indicador${nodeIndicators.length !== 1 ? 'es' : ''}
            </div>
          </div>
        `
      })

      html += `</div></div>`
    })

    html += `</div>`
    app.innerHTML = html
  } catch (err) {
    app.innerHTML = `<div style="padding: 20px; color: red;">Error: ${err.message}</div>`
  }
}

// ═══════════════════════════════════════════════════════════════
// NODE EVALUATION
// ═══════════════════════════════════════════════════════════════

window.showNodeEvaluation = async (nodeId) => {
  const app = document.getElementById('portal-app')

  try {
    const { data: indicators } = await supabase
      .from('indicators')
      .select('*')
      .eq('node_id', nodeId)

    if (!indicators?.length) {
      alert('No hay indicadores para este nodo')
      return
    }

    let html = `
      <div style="max-width: 600px; margin: 20px auto; padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <button onclick="window.showRouteView()" style="margin-bottom: 20px; padding: 8px 16px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">
          ← Volver
        </button>
        <h3 style="margin-top: 0;">Evaluación de Indicadores</h3>
        <form id="eval-form" style="display: flex; flex-direction: column; gap: 12px;">
    `

    indicators.forEach((ind, idx) => {
      html += `
        <div style="padding: 12px; background: #f5f5f5; border-radius: 4px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">${ind.nombre}</label>
          <select name="ind_${ind.id}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="">-- Selecciona --</option>
            <option value="no_iniciado">❌ No iniciado</option>
            <option value="en_progreso">⏳ En progreso</option>
            <option value="completado">✅ Completado</option>
            <option value="sobresaliente">⭐ Sobresaliente</option>
          </select>
        </div>
      `
    })

    html += `
        <button type="submit" style="padding: 12px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
          Guardar Evaluación
        </button>
      </form>
      </div>
    `

    app.innerHTML = html

    document.getElementById('eval-form').addEventListener('submit', async (e) => {
      e.preventDefault()

      const evals = []
      indicators.forEach(ind => {
        const value = document.querySelector(`select[name="ind_${ind.id}"]`).value
        if (value) {
          evals.push({
            indicator_id: ind.id,
            alumno_id: STATE.estudiante.id,
            estado: value,
            fecha: new Date().toISOString().split('T')[0]
          })
        }
      })

      if (!evals.length) {
        alert('Selecciona al menos un indicador')
        return
      }

      try {
        const { error } = await supabase
          .from('indicator_attempts')
          .insert(evals)

        if (error) throw error
        alert('✅ Evaluación guardada correctamente')
        showRouteView()
      } catch (err) {
        alert('❌ Error al guardar: ' + err.message)
      }
    })
  } catch (err) {
    alert('Error: ' + err.message)
  }
}

// ═══════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════

window.logout = async () => {
  await supabase.auth.signOut()
  STATE.maestro = null
  STATE.estudiante = null
  showLoginView()
}

// ═══════════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════════

async function boot() {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      const { data: maestro } = await supabase
        .from('maestros')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (maestro) {
        STATE.maestro = maestro
        showStudentSelector()
      } else {
        showLoginView()
      }
    } else {
      showLoginView()
    }
  } catch (err) {
    console.error('Boot error:', err)
    showLoginView()
  }
}

boot()

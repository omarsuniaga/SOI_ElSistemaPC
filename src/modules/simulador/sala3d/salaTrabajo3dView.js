/**
 * salaTrabajo3dView.js — Sala de Trabajo 3D (Three.js).
 *
 * Vista contenedora que monta la escena 3D completa: piso, paredes, 7
 * escritorios departamentales, avatares con locomoción (grafo de pasillos),
 * globos de diálogo, y suscripción Realtime a sim_log.
 *
 * Patrón: render(container, opciones, THREE) -> { teardown() }
 * THREE se inyecta (no se importa estáticamente).
 *
 * Verificación manual (C.9):
 *   1. Abrir /simulador -> Sala de Trabajo con una corrida activa.
 *   2. Confirmar oficina 3D renderizada: piso, paredes semitransparentes,
 *      7 escritorios con etiquetas (DIR, ACM, ADM, FIN, LOG, COM, TECNICO).
 *   3. Confirmar 7 avatares visibles en sus escritorios, uno por depto.
 *   4. Disparar un tick desde el Panel de Control (o insertar sim_log vía
 *      SQL) y confirmar que el avatar del departamento_origen (si existe)
 *      camina por el pasillo hacia el escritorio destino.
 *   5. Si departamento_origen = departamento (mismo depto), el avatar no
 *      camina; pasa directo a working -> talking (idéntico a 2D).
 *   6. Confirmar globo de diálogo legible sobre el avatar en estado talking.
 *   7. Eventos concurrentes: se encolan y procesan uno a la vez (FIFO).
 *   8. Cambiar tema (claro/oscuro) y confirmar que colores de escena/
 *      materiales se actualizan sin recargar.
 *   9. Cambiar de pestaña: rAF se pausa (DevTools Timeline), al volver se
 *      reanuda sin glitch.
 *  10. Navegar a otra ruta: teardown() libera geometrías, materiales,
 *      texturas y renderer (Chrome DevTools Memory: sin leaks tras
 *      navegar in/out repetido).
 */

import * as simuladorApi from '../api/simuladorApi.js'
import { supabase } from '../../../lib/supabaseClient.js'
import { calcularLayoutEscritorios, mapearLayout2Da3D, construirGrafoWaypoints } from '../logic/escritorioLayout.js'
import { crearEscritorioMaquinaEstados } from '../logic/escritorioMaquinaEstados.js'
import { mapLogAEventoAnimacion, esFilaDeRunActiva, requiereCaminata } from '../logic/simuladorLogMapper.js'
import { construirEscena } from './sceneBuilder.js'
import { crearAvatares } from './avatarFactory.js'
import { crearSistemaGlobo } from './speechBubbleSystem.js'
import { crearColaLocomocion } from './locomotionSystem.js'
import { tokensTemaATresColores } from './themeAdapter.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const RUN_DEMO_ID = '00000000-0000-0000-0000-000000000001'

export async function renderSalaTrabajo3dView(container, opciones = {}, THREE) {
  const abortController = new AbortController()
  let sceneData = null
  let avatares = []
  let sistemaGlobo = null
  const maquinas = {}
  const colasLocomocion = {}
  let renderer = null
  let controls = null
  let toolbar = null
  let raycaster = null
  let pointer = null
  let pointerDown = null
  let timer = null
  let rafId = null
  let resizeObserver = null

  function disposeRecursivo(obj) {
    if (obj.geometry) obj.geometry.dispose()
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
      else obj.material.dispose()
    }
  }

  const layout2D = calcularLayoutEscritorios({ width: 800, height: 400 })
  const layout3D = mapearLayout2Da3D(layout2D)
  const grafo = construirGrafoWaypoints(layout3D)
  const posiciones = Object.values(layout3D)
  const centroX = posiciones.reduce((acc, pos) => acc + pos.x, 0) / Math.max(posiciones.length, 1)
  const centroZ = posiciones.reduce((acc, pos) => acc + pos.z, 0) / Math.max(posiciones.length, 1)
  const minX = posiciones.reduce((acc, pos) => Math.min(acc, pos.x), Infinity)
  const maxX = posiciones.reduce((acc, pos) => Math.max(acc, pos.x), -Infinity)
  const minZ = posiciones.reduce((acc, pos) => Math.min(acc, pos.z), Infinity)
  const maxZ = posiciones.reduce((acc, pos) => Math.max(acc, pos.z), -Infinity)
  const cameraBaseY = 260
  const cameraOffset = Math.max(maxX - minX, maxZ - minZ) * 0.85
  const esOscuro = document.documentElement.getAttribute('data-bs-theme') === 'dark'
  const colores = tokensTemaATresColores(esOscuro)

  sceneData = construirEscena(THREE, { layout3D, layout2D, colores })
  avatares = crearAvatares(THREE, layout3D, colores)
  sistemaGlobo = crearSistemaGlobo(THREE, colores)

  for (const avatar of avatares) {
    sceneData.scene.add(avatar.grupo)
    sistemaGlobo.montar(avatar.departamento, avatar.grupo)
    maquinas[avatar.departamento] = crearEscritorioMaquinaEstados()
    colasLocomocion[avatar.departamento] = crearColaLocomocion(layout3D[avatar.departamento])
  }

  const canvas = document.createElement('canvas')
  container.innerHTML = ''
  container.appendChild(canvas)

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth || 800, 500)
  renderer.shadowMap.enabled = false

  const camera = sceneData.camera
  camera.aspect = renderer.domElement.width / renderer.domElement.height
  camera.updateProjectionMatrix()

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.enablePan = true
  controls.screenSpacePanning = true
  controls.enableRotate = true
  controls.enableZoom = true
  controls.minDistance = 180
  controls.maxDistance = 1400
  controls.minPolarAngle = Math.PI * 0.18
  controls.maxPolarAngle = Math.PI * 0.49
  controls.target.set(centroX, 0, centroZ)
  controls.update()

  function moverCamaraA({ x, y, z }, target) {
    camera.position.set(x, y, z)
    controls.target.set(target.x, target.y, target.z)
    controls.update()
  }

  function enfocarEnPunto({ x, y, z }, distancia = 190) {
    moverCamaraA(
      { x: x + distancia, y: cameraBaseY, z: z + distancia },
      { x, y: 0, z },
    )
  }

  function aplicarPreset(preset) {
    const targetCentro = { x: centroX, y: 0, z: centroZ }
    if (preset === 'general') {
      moverCamaraA(
        { x: centroX, y: 500, z: centroZ + 500 },
        targetCentro,
      )
      return
    }

    if (preset === 'frontal') {
      moverCamaraA(
        { x: centroX, y: cameraBaseY, z: maxZ + cameraOffset },
        targetCentro,
      )
      return
    }

    if (preset === 'lateral') {
      moverCamaraA(
        { x: maxX + cameraOffset, y: cameraBaseY, z: centroZ },
        targetCentro,
      )
      return
    }

    const escritorio = sceneData.escritorios.find(e => e.departamento === preset)
    if (!escritorio) return

    moverCamaraA(
      {
        x: escritorio.mesh.position.x + 160,
        y: cameraBaseY,
        z: escritorio.mesh.position.z + 160,
      },
      {
        x: escritorio.mesh.position.x,
        y: 0,
        z: escritorio.mesh.position.z,
      },
    )
  }

  toolbar = document.createElement('div')
  toolbar.className = 'simulador-3d-toolbar'
  toolbar.setAttribute('role', 'toolbar')
  toolbar.setAttribute('aria-label', 'Controles de navegación 3D')
  toolbar.innerHTML = `
    <button type="button" data-preset="general" class="btn btn-sm btn-light border">
      <i class="bi bi-bounding-box-circles me-1"></i>General
    </button>
    <button type="button" data-preset="frontal" class="btn btn-sm btn-light border">
      <i class="bi bi-camera-video me-1"></i>Frontal
    </button>
    <button type="button" data-preset="lateral" class="btn btn-sm btn-light border">
      <i class="bi bi-arrow-repeat me-1"></i>Lateral
    </button>
    ${avatares.map(avatar => `
      <button type="button" data-preset="${avatar.departamento}" class="btn btn-sm btn-light border">
        <i class="bi bi-geo-alt me-1"></i>${avatar.departamento}
      </button>
    `).join('')}
  `
  const toolbarStyle = toolbar.style
  toolbarStyle.position = 'absolute'
  toolbarStyle.top = '0.75rem'
  toolbarStyle.right = '0.75rem'
  toolbarStyle.zIndex = '5'
  toolbarStyle.display = 'flex'
  toolbarStyle.flexWrap = 'wrap'
  toolbarStyle.gap = '0.35rem'
  toolbarStyle.maxWidth = 'min(92vw, 520px)'
  toolbarStyle.padding = '0.5rem'
  toolbarStyle.borderRadius = '0.75rem'
  toolbarStyle.background = 'rgba(255, 255, 255, 0.82)'
  toolbarStyle.backdropFilter = 'blur(8px)'
  toolbarStyle.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)'
  container.style.position = 'relative'
  container.appendChild(toolbar)
  toolbar.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-preset]')
    if (!button) return
    aplicarPreset(button.dataset.preset)
  })

  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()

  function obtenerTargetDesdeInterseccion(intersection) {
    if (!intersection) return null

    const objeto = intersection.object
    const directorio = objeto.parent?.position ?? objeto.position
    const punto = intersection.point ?? directorio

    return {
      x: punto.x,
      y: punto.y,
      z: punto.z,
    }
  }

  function encontrarDepartamentoDesdeObjeto(objeto) {
    let actual = objeto
    while (actual) {
      const escritorio = sceneData.escritorios.find(e => e.mesh === actual)
      if (escritorio) return escritorio.departamento
      const avatar = avatares.find(a => a.grupo === actual)
      if (avatar) return avatar.departamento
      actual = actual.parent
    }
    return null
  }

  function buscarObjetivoInteractivo(event) {
    const rect = renderer.domElement.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    pointer.set(x, y)
    raycaster.setFromCamera(pointer, camera)

    const escritorios = sceneData.escritorios.map(e => e.mesh)
    const avataresInteractivos = avatares.map(a => a.grupo)
    const hits = [
      ...raycaster.intersectObjects(escritorios, true),
      ...raycaster.intersectObjects(avataresInteractivos, true),
    ].sort((a, b) => a.distance - b.distance)

    return hits[0] ?? null
  }

  function onCanvasClick(event) {
    if (abortController.signal.aborted) return
    if (pointerDown) {
      const distancia = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y)
      if (distancia > 6) return
    }
    const hit = buscarObjetivoInteractivo(event)
    if (!hit) return

    const objetivo = obtenerTargetDesdeInterseccion(hit)
    if (!objetivo) return

    const dept = encontrarDepartamentoDesdeObjeto(hit.object)
    if (dept) {
      const escritorio = sceneData.escritorios.find(e => e.departamento === dept)
      if (escritorio) {
        enfocarEnPunto(
          { x: escritorio.mesh.position.x, y: 0, z: escritorio.mesh.position.z },
          170,
        )
        return
      }
    }

    enfocarEnPunto(objetivo, 170)
  }

  renderer.domElement.style.cursor = 'grab'
  renderer.domElement.addEventListener('pointerdown', (event) => {
    pointerDown = { x: event.clientX, y: event.clientY }
  }, { signal: abortController.signal })
  renderer.domElement.addEventListener('pointerup', (event) => {
    onCanvasClick(event)
    pointerDown = null
  }, { signal: abortController.signal })

  timer = new THREE.Timer()

  function animar() {
    if (abortController.signal.aborted) return
    if (document.hidden) { rafId = null; return }

    const delta = timer.update()
    if (controls) controls.update()

    for (const dept of Object.keys(maquinas)) {
      const estado = maquinas[dept].getEstado()
      const avatar = avatares.find(a => a.departamento === dept)
      if (!avatar) continue

      if (estado === 'walking') {
        colasLocomocion[dept].tick(delta)
        const pos = colasLocomocion[dept].getPosicionActual()
        avatar.grupo.position.x = pos.x
        avatar.grupo.position.z = pos.z
      }

      if (estado === 'talking') {
        sistemaGlobo.mostrar(dept, maquinas[dept].getDialogo())
      } else if (estado !== 'walking') {
        sistemaGlobo.ocultar(dept)
      }
    }

    renderer.render(sceneData.scene, camera)
    rafId = requestAnimationFrame(animar)
  }

  rafId = requestAnimationFrame(animar)

  resizeObserver = new ResizeObserver(() => {
    const w = container.clientWidth || 800
    const h = 500
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  })
  resizeObserver.observe(container)
  abortController.signal.addEventListener('abort', () => resizeObserver.disconnect(), { once: true })

  function procesarFilaLog(fila) {
    const evento = mapLogAEventoAnimacion(fila)
    const necesitaCaminata = requiereCaminata(evento)

    if (necesitaCaminata && evento.departamento_origen) {
      const colaOrigen = colasLocomocion[evento.departamento_origen]
      const escritorio = sceneData.escritorios.find(e => e.departamento === evento.departamento)
      if (colaOrigen && escritorio) {
        const destXZ = { x: escritorio.mesh.position.x, z: escritorio.mesh.position.z }
        colaOrigen.encolarDestino(destXZ, grafo)
      }
    }

    const maquina = maquinas[evento.departamento]
    if (maquina) {
      maquina.encolarEvento({ texto: evento.texto, requiereCaminata: necesitaCaminata })
    }
  }

  async function initRealtime() {
    try {
      const run = await simuladorApi.getRunById(RUN_DEMO_ID)
      if (!run || abortController.signal.aborted) return

      const channelName = `simulador:sala-trabajo-3d:${run.id}`
      const stale = supabase.getChannels().find(c => c.topic === channelName)
      if (stale) supabase.removeChannel(stale)

      const channel = supabase
        .channel(channelName)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sim_log' }, (payload) => {
          if (abortController.signal.aborted) return
          if (!esFilaDeRunActiva(payload, run.id)) return
          procesarFilaLog(payload.new)
        })
        .subscribe()
      abortController.signal.addEventListener('abort', () => channel.unsubscribe(), { once: true })
    } catch (err) {
      console.error('[salaTrabajo3dView] init error:', err.message)
    }
  }
  initRealtime()

  const visibilityHandler = () => {
    if (document.hidden) {
      if (rafId != null) { cancelAnimationFrame(rafId); rafId = null }
    } else if (rafId == null) {
      timer = new THREE.Timer()
      rafId = requestAnimationFrame(animar)
    }
  }
  document.addEventListener('visibilitychange', visibilityHandler, { signal: abortController.signal })

  return {
    teardown: () => {
      abortController.abort()
      if (rafId != null) cancelAnimationFrame(rafId)
    if (renderer) {
      if (sceneData?.scene) sceneData.scene.traverse(disposeRecursivo)
      for (const avatar of avatares) {
        avatar.geometrias.forEach(g => g.dispose())
        avatar.materiales.forEach(m => m.dispose())
      }
      if (controls) {
        controls.dispose()
        controls = null
      }
      if (raycaster) raycaster = null
      if (pointer) pointer = null
      if (toolbar) {
        toolbar.remove()
        toolbar = null
      }
      renderer.dispose()
    }
      sceneData = null
      avatares = []
      sistemaGlobo = null
      renderer = null
      timer = null
    },
  }
}

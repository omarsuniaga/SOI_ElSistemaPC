export function construirEscena(THREE, { layout3D, layout2D, colores }) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(colores.fondo)

  const xs = Object.values(layout3D).map(p => p.x)
  const zs = Object.values(layout3D).map(p => p.z)
  const minX = Math.min(...xs); const maxX = Math.max(...xs)
  const minZ = Math.min(...zs); const maxZ = Math.max(...zs)
  const cx = (minX + maxX) / 2; const cz = (minZ + maxZ) / 2

  const margen = Math.max(maxX - minX, maxZ - minZ) * 0.3
  const ancho = maxX - minX + margen * 2
  const fondo = maxZ - minZ + margen * 2

  const geomPiso = new THREE.PlaneGeometry(ancho, fondo)
  const matPiso = new THREE.MeshStandardMaterial({ color: colores.escritorio, roughness: 0.8 })
  const piso = new THREE.Mesh(geomPiso, matPiso)
  piso.rotation.x = -Math.PI / 2
  piso.position.set(cx, -2, cz)
  scene.add(piso)

  const alturaPared = 100
  const espesorPared = 2
  const colorPared = new THREE.Color(colores.borde)

  function crearPared(anchoP, altoP, x, y, z, rotY) {
    const g = new THREE.BoxGeometry(anchoP, altoP, espesorPared)
    const m = new THREE.MeshStandardMaterial({ color: colorPared, roughness: 0.9, transparent: true, opacity: 0.15 })
    const pared = new THREE.Mesh(g, m)
    pared.position.set(x, y, z)
    if (rotY) pared.rotation.y = rotY
    scene.add(pared)
    return { geometry: g, material: m }
  }

  const disp = []
  disp.push(crearPared(ancho + espesorPared * 2, alturaPared, cx, alturaPared / 2 - 2, minZ - margen - espesorPared / 2))
  disp.push(crearPared(ancho + espesorPared * 2, alturaPared, cx, alturaPared / 2 - 2, maxZ + margen + espesorPared / 2))
  disp.push(crearPared(fondo + espesorPared * 2, alturaPared, minX - margen - espesorPared / 2, alturaPared / 2 - 2, cz, Math.PI / 2))
  disp.push(crearPared(fondo + espesorPared * 2, alturaPared, maxX + margen + espesorPared / 2, alturaPared / 2 - 2, cz, Math.PI / 2))

  const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(luzAmbiente)

  const luzDir = new THREE.DirectionalLight(0xffffff, 0.8)
  luzDir.position.set(cx, 300, cz + 200)
  scene.add(luzDir)

  const escritorios = []
  const labelSprites = []
  const materialesEscritorios = []

  for (const dept of Object.keys(layout3D)) {
    const pos = layout3D[dept]
    const pos2D = layout2D[dept]
    const deskW = pos2D.w * 0.8
    const deskD = pos2D.h * 0.8

    const geomDesk = new THREE.BoxGeometry(deskW, 6, deskD)
    const matDesk = new THREE.MeshStandardMaterial({ color: colores.escritorio, roughness: 0.6, metalness: 0.1 })
    materialesEscritorios.push(matDesk)
    const desk = new THREE.Mesh(geomDesk, matDesk)
    desk.position.set(pos.x, 0, pos.z)
    scene.add(desk)
    escritorios.push({ mesh: desk, geometry: geomDesk, departamento: dept })

    const labelTexture = crearTexturaLabel(THREE, dept, colores.texto, colores.borde)
    const labelMat = new THREE.SpriteMaterial({ map: labelTexture, transparent: true, depthTest: false })
    const label = new THREE.Sprite(labelMat)
    label.position.set(pos.x, 18, pos.z)
    label.scale.set(40, 12, 1)
    scene.add(label)
    labelSprites.push({ sprite: label, material: labelMat, texture: labelTexture })
  }

  const camera = new THREE.PerspectiveCamera(45, 1, 1, 2000)
  camera.position.set(cx, 500, cz + 500)
  camera.lookAt(cx, 0, cz)

  return {
    scene,
    camera,
    disposables: {
      geometries: [geomPiso, ...disp.map(d => d.geometry), ...escritorios.map(e => e.geometry)],
      materials: [matPiso, ...disp.map(d => d.material), ...materialesEscritorios, ...labelSprites.map(l => l.material)],
      textures: labelSprites.map(l => l.texture),
      lights: [luzAmbiente, luzDir],
      piso,
    },
    updateTheme(nuevosColores) {
      scene.background = new THREE.Color(nuevosColores.fondo)
      matPiso.color = new THREE.Color(nuevosColores.escritorio)
      for (const mat of materialesEscritorios) mat.color = new THREE.Color(nuevosColores.escritorio)
      for (const d of disp) d.material.color = new THREE.Color(nuevosColores.borde)
    },
    escritorios,
    labelSprites,
  }
}

function crearTexturaLabel(THREE, texto, colorTexto, colorBorde) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = 'rgba(0,0,0,0)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.font = 'bold 28px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.fillStyle = colorBorde
  const metrics = ctx.measureText(texto)
  const padX = 16; const padY = 8
  const tw = metrics.width + padX * 2; const th = 44
  const rx = (canvas.width - tw) / 2; const ry = (canvas.height - th) / 2

  ctx.beginPath()
  ctx.roundRect(rx, ry, tw, th, 8)
  ctx.fill()

  ctx.fillStyle = colorTexto
  ctx.fillText(texto, canvas.width / 2, canvas.height / 2 + 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

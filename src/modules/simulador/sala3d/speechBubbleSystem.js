export function crearSistemaGlobo(THREE, colores) {
  const globos = {}

  function generarTextura(texto, ancho, alto) {
    const canvas = document.createElement('canvas')
    canvas.width = ancho
    canvas.height = alto
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, ancho, alto)

    const radius = 12
    ctx.fillStyle = colores.dialogoFondo
    ctx.beginPath()
    ctx.moveTo(radius, 0)
    ctx.lineTo(ancho - radius, 0)
    ctx.quadraticCurveTo(ancho, 0, ancho, radius)
    ctx.lineTo(ancho, alto - radius)
    ctx.quadraticCurveTo(ancho, alto, ancho - radius, alto)
    ctx.lineTo(radius, alto)
    ctx.quadraticCurveTo(0, alto, 0, alto - radius)
    ctx.lineTo(0, radius)
    ctx.quadraticCurveTo(0, 0, radius, 0)
    ctx.closePath()
    ctx.fill()

    ctx.strokeStyle = colores.borde
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.font = '16px sans-serif'
    ctx.fillStyle = colores.texto
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const lineas = envolverTexto(ctx, texto, ancho - 24)
    const lineHeight = 22
    const startY = (alto - lineas.length * lineHeight) / 2 + lineHeight / 2
    for (let i = 0; i < lineas.length; i++) {
      ctx.fillText(lineas[i], ancho / 2, startY + i * lineHeight)
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return { texture, canvas }
  }

  return {
    montar(dept, avatarGrupo) {
      const { texture } = generarTextura('', 128, 48)
      const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
      const sprite = new THREE.Sprite(mat)
      sprite.position.y = 30
      sprite.scale.set(40, 15, 1)
      sprite.visible = false
      avatarGrupo.add(sprite)

      globos[dept] = { sprite, material: mat, texture }
    },

    mostrar(dept, texto) {
      const globo = globos[dept]
      if (!globo) return

      const ancho = Math.min(Math.max(texto.length * 10, 80), 300)
      const alto = 48 + Math.floor(texto.length / 12) * 18
      const { texture } = generarTextura(texto, ancho, alto)
      globo.sprite.material.map = texture
      globo.sprite.material.needsUpdate = true
      globo.sprite.scale.set(ancho * 0.3, alto * 0.3, 1)
      globo.sprite.visible = true

      if (globo.texture !== texture) globo.texture.dispose()
      globo.texture = texture
    },

    ocultar(dept) {
      const globo = globos[dept]
      if (globo) globo.sprite.visible = false
    },

    ocultarTodos() {
      for (const dept of Object.keys(globos)) globos[dept].sprite.visible = false
    },

    updateTheme(nuevosColores) {
      colores = nuevosColores
    },
  }
}

function envolverTexto(ctx, texto, maxWidth) {
  const palabras = texto.split(' ')
  const lineas = []
  let lineaActual = ''

  for (const palabra of palabras) {
    const prueba = lineaActual ? `${lineaActual} ${palabra}` : palabra
    if (ctx.measureText(prueba).width > maxWidth && lineaActual) {
      lineas.push(lineaActual)
      lineaActual = palabra
    } else {
      lineaActual = prueba
    }
  }
  if (lineaActual) lineas.push(lineaActual)
  return lineas
}

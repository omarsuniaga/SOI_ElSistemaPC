export function construirRuta(origenXZ, destinoXZ, grafoPasillos) {
  if (!origenXZ || !destinoXZ) throw new Error('origen y destino son requeridos')
  if (!grafoPasillos) throw new Error('grafoPasillos es requerido')

  const { waypoints, adyacencias } = grafoPasillos

  function encontrarNodoMasCercano(pos) {
    let minDist = Infinity
    let nodo = null
    for (const [id, wp] of Object.entries(waypoints)) {
      const dist = Math.hypot(pos.x - wp.x, pos.z - wp.z)
      if (dist < minDist) {
        minDist = dist
        nodo = id
      }
    }
    for (const dept of Object.keys(adyacencias)) {
      if (waypoints[dept]) continue
      const dist = Math.hypot(pos.x - dept.x, pos.z - dept.z)
    }
    return nodo
  }

  function bfs(inicio, fin) {
    const visitados = new Set()
    const cola = [[inicio]]
    visitados.add(inicio)

    while (cola.length > 0) {
      const camino = cola.shift()
      const nodo = camino[camino.length - 1]

      if (nodo === fin) return camino

      const vecinos = adyacencias[nodo] || []
      for (const vecino of vecinos) {
        if (!visitados.has(vecino)) {
          visitados.add(vecino)
          cola.push([...camino, vecino])
        }
      }
    }

    return null
  }

  const wpOrigen = encontrarNodoMasCercano(origenXZ)
  const wpDestino = encontrarNodoMasCercano(destinoXZ)

  const camino = bfs(wpOrigen, wpDestino)
  if (!camino) throw new Error('No se encontró ruta entre origen y destino')

  const ruta = [origenXZ]
  for (const nodo of camino) {
    if (waypoints[nodo]) {
      ruta.push(waypoints[nodo])
    }
  }
  ruta.push(destinoXZ)

  return ruta
}

export function posicionEnT(ruta, tSegundos, velocidadUnidadesPorSeg = 2) {
  if (!ruta || ruta.length < 2) throw new Error('ruta debe tener al menos 2 puntos')

  let distanciaTotal = 0
  const tramos = []
  for (let i = 0; i < ruta.length - 1; i++) {
    const d = Math.hypot(ruta[i + 1].x - ruta[i].x, ruta[i + 1].z - ruta[i].z)
    tramos.push(d)
    distanciaTotal += d
  }

  if (distanciaTotal === 0) {
    return {
      x: ruta[0].x,
      z: ruta[0].z,
      terminado: true,
      anguloOrientacion: 0,
    }
  }

  const distanciaRecorrida = velocidadUnidadesPorSeg * tSegundos

  if (distanciaRecorrida >= distanciaTotal) {
    const ultimo = ruta[ruta.length - 1]
    const penultimo = ruta[ruta.length - 2]
    return {
      x: ultimo.x,
      z: ultimo.z,
      terminado: true,
      anguloOrientacion: Math.atan2(ultimo.z - penultimo.z, ultimo.x - penultimo.x),
    }
  }

  let acumulado = 0
  for (let i = 0; i < tramos.length; i++) {
    if (acumulado + tramos[i] >= distanciaRecorrida) {
      const resto = distanciaRecorrida - acumulado
      const t = tramos[i] > 0 ? resto / tramos[i] : 0
      const x = ruta[i].x + (ruta[i + 1].x - ruta[i].x) * t
      const z = ruta[i].z + (ruta[i + 1].z - ruta[i].z) * t
      const angulo = Math.atan2(ruta[i + 1].z - ruta[i].z, ruta[i + 1].x - ruta[i].x)
      return { x, z, terminado: false, anguloOrientacion: angulo }
    }
    acumulado += tramos[i]
  }

  return {
    x: ruta[ruta.length - 1].x,
    z: ruta[ruta.length - 1].z,
    terminado: true,
    anguloOrientacion: 0,
  }
}

export function crearColaLocomocion(posicionInicial) {
  let _cola = []
  let _rutaActual = null
  let _tAcumulado = 0
  let _estado = 'idle'
  let _posicionActual = { ...posicionInicial }

  function _procesarSiguiente() {
    if (_cola.length === 0) {
      _estado = 'idle'
      _rutaActual = null
      _tAcumulado = 0
      return
    }

    const { destino, grafo } = _cola.shift()
    _rutaActual = construirRuta(_posicionActual, destino, grafo)
    _tAcumulado = 0
    _estado = 'walking'
  }

  return {
    encolarDestino(destino, grafo) {
      _cola.push({ destino, grafo })
      if (_estado === 'idle') _procesarSiguiente()
    },

    tick(deltaSeg) {
      if (_estado !== 'walking' || !_rutaActual) return

      _tAcumulado += deltaSeg
      const resultado = posicionEnT(_rutaActual, _tAcumulado, 2)

      _posicionActual = { x: resultado.x, z: resultado.z }

      if (resultado.terminado) _procesarSiguiente()
    },

    getEstado() { return _estado },
    getPosicionActual() { return { ..._posicionActual } },
    getColaLength() { return _cola.length },
    reset() {
      _cola = []
      _rutaActual = null
      _tAcumulado = 0
      _estado = 'idle'
    },
  }
}

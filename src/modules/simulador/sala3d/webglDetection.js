function defaultProbe() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    return Boolean(gl)
  } catch {
    return false
  }
}

export function puedeUsarWebGL(probeFn) {
  if (probeFn !== undefined) {
    try {
      return Boolean(probeFn())
    } catch {
      return false
    }
  }

  return defaultProbe()
}

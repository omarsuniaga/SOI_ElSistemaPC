export function tokensTemaATresColores(esOscuro) {
  return {
    fondo: esOscuro ? '#1e1e2e' : '#f5f5fa',
    escritorio: esOscuro ? '#2a2a3d' : '#ffffff',
    borde: esOscuro ? '#44445a' : '#d8d8e6',
    texto: esOscuro ? '#e4e4f0' : '#2b2b3a',
    muneco: esOscuro ? '#8b9cff' : '#4c5fd5',
    working: '#f0ad4e',
    talking: '#5cb85c',
    dialogoFondo: esOscuro ? '#33334a' : '#ffffff',
  }
}

export function aplicarColorMateriales(THREE, materiales, colorHex) {
  if (!THREE || !materiales || !colorHex) return
  try {
    const c = new THREE.Color(colorHex)
    for (const mat of materiales) {
      if (mat && typeof mat.color?.set === 'function') mat.color.set(c)
    }
  } catch {
  }
}

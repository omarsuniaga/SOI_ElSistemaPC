export function crearAvatares(THREE, layout3D, colores) {
  const avatares = []

  for (const dept of Object.keys(layout3D)) {
    const pos = layout3D[dept]
    const grupo = new THREE.Group()

    const geomCuerpo = new THREE.CylinderGeometry(6, 6, 14, 8)
    const colorMuneco = new THREE.Color(colores.muneco)
    const matCuerpo = new THREE.MeshStandardMaterial({ color: colorMuneco, roughness: 0.5 })
    const cuerpo = new THREE.Mesh(geomCuerpo, matCuerpo)
    cuerpo.position.y = 7
    grupo.add(cuerpo)

    const geomCabeza = new THREE.SphereGeometry(5, 8, 8)
    const matCabeza = new THREE.MeshStandardMaterial({ color: colorMuneco, roughness: 0.3 })
    const cabeza = new THREE.Mesh(geomCabeza, matCabeza)
    cabeza.position.y = 18
    grupo.add(cabeza)

    grupo.position.set(pos.x, -2, pos.z)

    avatares.push({
      grupo,
      departamento: dept,
      materiales: [matCuerpo, matCabeza],
      geometrias: [geomCuerpo, geomCabeza],
      updateColor(nuevoColor) {
        const c = new THREE.Color(nuevoColor)
        for (const mat of [matCuerpo, matCabeza]) mat.color = c
      },
    })
  }

  return avatares
}

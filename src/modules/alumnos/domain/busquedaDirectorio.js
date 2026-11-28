const normalizar = valor => String(valor ?? '').normalize('NFD').replace(/\p{M}/gu, '')
  .toLocaleLowerCase('es').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()

export function coincideBusqueda(consulta, campos) {
  const tokens = normalizar(consulta).split(/\s+/)
  const texto = campos.map(normalizar).join(' ')
  if (/^[\d\s()+.-]+$/.test(consulta.trim())) {
    const numero = consulta.replace(/\D/g, '')
    if (numero) return campos.some(c => String(c ?? '').replace(/\D/g, '').includes(numero))
  }
  return tokens.every(token => texto.includes(token))
}

export function coincideAlumno(consulta, a) {
  return coincideBusqueda(consulta, [a.nombre, a.nombre_completo, a.instrumento, a.instrumento_principal,
    a.telefono, a.familiar_telefono, a.representante_tlf, a.tlf_alumno, a.familiar_nombre,
    a.representante_nombre, a.email, a.correo_representante, a.cedula, a.representante_cedula])
}

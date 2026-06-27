/**
 * comunicacionesMock.js — Datos en memoria para el portal de Comunicaciones.
 * Espejo del adaptador Supabase (mismo shape de contacto y plantilla).
 */

import { familiaDe, normalizarInstrumento } from '../domain/secciones.js'

const LATENCIA = 200
const delay = (val) => new Promise((r) => setTimeout(() => r(val), LATENCIA))
const clone = (x) => JSON.parse(JSON.stringify(x))

const ALUMNOS_DEMO = [
  ['Ana Lucía Pérez', 'Violín', 'María Pérez', '8095551001', 'maria.perez@example.com'],
  ['Carlos Ramírez', 'Violin', 'José Ramírez', '8295551002', 'jose.ramirez@example.com'],
  ['Daniela Gómez', 'Viola', 'Rosa Gómez', '8495551003', 'rosa.gomez@example.com'],
  ['Esteban Núñez', 'Cello', 'Pedro Núñez', '8095551004', 'pedro.nunez@example.com'],
  ['Fabiola Díaz', 'Contrabajo', 'Luisa Díaz', '8095551005', null],
  ['Gabriel Soto', 'Flauta', 'Carmen Soto', '8295551006', 'carmen.soto@example.com'],
  ['Helena Cruz', 'Clarinete', 'Marta Cruz', '8495551007', 'marta.cruz@example.com'],
  ['Iván Mejía', 'Trompeta', 'Raúl Mejía', '8095551008', 'raul.mejia@example.com'],
  ['Julia Vargas', 'Trombón', 'Sofía Vargas', null, 'sofia.vargas@example.com'],
  ['Kevin Reyes', 'Percusión', 'Ana Reyes', '8295551010', 'ana.reyes@example.com'],
]

const contactos = ALUMNOS_DEMO.map((row, i) => {
  const [alumno, instrumento, contactoNombre, whatsapp, email] = row
  return {
    alumnoId: `mock-al-${String(i + 1).padStart(3, '0')}`,
    alumno,
    instrumento: normalizarInstrumento(instrumento),
    familia: familiaDe(instrumento),
    contactoNombre,
    whatsapp,
    email,
  }
})

let plantillas = [
  {
    id: 'mock-tpl-1',
    nombre: 'Recordatorio de ensayo',
    tipo: 'mensaje',
    descripcion: 'Aviso de ensayo a representantes',
    contenido:
      'Hola {representante}, le recordamos que {nombre_alumno} ({instrumento}, sección {seccion}) tiene ensayo este sábado a las 9:00 a.m. ¡Gracias por su apoyo!',
    variables: ['representante', 'nombre_alumno', 'instrumento', 'seccion'],
    estado: 'activa',
    version: 1,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-tpl-2',
    nombre: 'Invitación a concierto',
    tipo: 'correo',
    descripcion: 'Invitación formal a concierto',
    contenido:
      'Estimado/a {representante}:\n\nLe invitamos cordialmente al concierto de nuestra orquesta, donde {nombre_alumno} participará en la sección de {seccion}. Su presencia es muy importante para nuestros jóvenes músicos.\n\nCon aprecio,\nEl Sistema Punta Cana',
    variables: ['representante', 'nombre_alumno', 'seccion'],
    estado: 'activa',
    version: 1,
    updated_at: new Date().toISOString(),
  },
]

let _seq = 100

export async function getContactos() {
  return delay(contactos.map(clone))
}

export async function getPlantillas() {
  return delay(plantillas.map(clone))
}

export async function guardarPlantilla(plantilla) {
  if (plantilla.id) {
    const idx = plantillas.findIndex((p) => p.id === plantilla.id)
    if (idx >= 0) {
      plantillas[idx] = { ...plantillas[idx], ...plantilla, updated_at: new Date().toISOString() }
      return delay(clone(plantillas[idx]))
    }
  }
  const nueva = {
    id: `mock-tpl-${_seq++}`,
    estado: 'activa',
    version: 1,
    tipo: 'mensaje',
    variables: [],
    ...plantilla,
    updated_at: new Date().toISOString(),
  }
  plantillas.push(nueva)
  return delay(clone(nueva))
}

export async function eliminarPlantilla(id) {
  plantillas = plantillas.filter((p) => p.id !== id)
  return delay(true)
}

export async function enviarCorreo(payload) {
  // Simula el envío exitoso del edge function.
  const total = Array.isArray(payload.to) ? payload.to.length : 1
  return delay({ ok: true, total, enviados: total, fallidos: 0, batches: [{ batch: 0, ok: true, count: total }] })
}

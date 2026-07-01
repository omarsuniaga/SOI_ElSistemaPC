/**
 * tareasApi.js — Dispatcher: enruta las llamadas a tareasMock o tareasSupabase
 * según la variable de entorno VITE_USE_MOCK.
 *
 * Uso:
 *   import * as tareasApi from './tareasApi.js'
 *   const tareas = await tareasApi.getTareas()
 *
 * Las tareas son generadas automáticamente por el motor Hermes
 * (fn_hermes_auto_delegar_tareas) al insertarse un evento en
 * calendario_institucional. Este módulo las LEE y permite actualizarlas.
 *
 * SP-0 agrega: listarComentarios, agregarComentario, listarHistorial,
 * actualizarEntidadAsociada, agregarAdjunto, urlFirmada, observarTarea.
 */

import * as mock from './tareasMock.js'
import * as real from './tareasSupabase.js'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const api = USE_MOCK ? mock : real

// ─── Existing exports ─────────────────────────────────────────────────────────
export const getTareas = api.getTareas
export const getTareaById = api.getTareaById
export const getTareasByDepartamento = api.getTareasByDepartamento
export const getTareasByEvento = api.getTareasByEvento
export const updateTareaEstado = api.updateTareaEstado
export const updateChecklistItem = api.updateChecklistItem
export const completarTarea = api.completarTarea
export const guardarFeedback = api.guardarFeedback
export const getTareasFiltradas = api.getTareasFiltradas
export const crearEventoInstitucional = api.crearEventoInstitucional
export const crearTareaInstitucional = api.crearTareaInstitucional

// ─── SP-0: new exports ────────────────────────────────────────────────────────
export const listarComentarios = api.listarComentarios
export const agregarComentario = api.agregarComentario
export const listarHistorial = api.listarHistorial
export const actualizarEntidadAsociada = api.actualizarEntidadAsociada
export const agregarAdjunto = api.agregarAdjunto
export const urlFirmada = api.urlFirmada
export const observarTarea = api.observarTarea

// ─── SP-3: vista de procedimientos (Director) ──────────────────────────────────
export const getProcedimientos = api.getProcedimientos

// ─── SP-4: flujo de dominio "alumno en riesgo" (fan-out cross-departamental) ─────
export const reportarAlumnoRiesgo = api.reportarAlumnoRiesgo

// ─── SP-5: capa de consulta de Hermes (snapshot institucional factual) ──────────
export const getConsultaEstado = api.getConsultaEstado

// Process Backbone V1: contratos SOI + apertura/cierre de casos Hermes.
export const getProcessContracts = api.getProcessContracts
export const startProcessCase = api.startProcessCase
export const getProcessCaseDetail = api.getProcessCaseDetail
export const closeProcessCase = api.closeProcessCase

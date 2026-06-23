/**
 * cajaApi.js — Dispatcher: routes all API calls to cajaMock or cajaSupabase
 * based on the VITE_USE_MOCK environment variable.
 *
 * Usage:
 *   import * as cajaApi from './cajaApi.js'
 *   const { data } = await cajaApi.getFamilias()
 */

import * as mock from './cajaMock.js'
import * as real from './cajaSupabase.js'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const api = USE_MOCK ? mock : real

export const getFamilias             = api.getFamilias
export const getFamiliaById          = api.getFamiliaById
export const getRepresentanteByFamiliaId = api.getRepresentanteByFamiliaId
export const getCuotasByFamilia      = api.getCuotasByFamilia
export const getPagosByFamilia       = api.getPagosByFamilia
export const registrarPago           = api.registrarPago
export const getWalletByFamilia      = api.getWalletByFamilia
export const registrarMovimientoWallet = api.registrarMovimientoWallet
export const getAccesorios           = api.getAccesorios
export const getAccesorioById        = api.getAccesorioById
export const asignarAccesorio        = api.asignarAccesorio
export const updateStockAccesorio    = api.updateStockAccesorio
export const getNotificaciones       = api.getNotificaciones
export const marcarNotificacionLeida = api.marcarNotificacionLeida
export const getTareas               = api.getTareas
export const createTarea             = api.createTarea
export const updateTareaEstado       = api.updateTareaEstado
export const getMinutas              = api.getMinutas
export const createMinuta            = api.createMinuta
export const getHilos                = api.getHilos
export const createHilo              = api.createHilo
export const getMensajesByHilo       = api.getMensajesByHilo
export const sendMensaje             = api.sendMensaje
export const getCampanas             = api.getCampanas
export const createCampana             = api.createCampana
export const getCampanaParticipaciones = api.getCampanaParticipaciones
export const registrarParticipacion    = api.registrarParticipacion
export const savePushSubscription      = api.savePushSubscription
export const deletePushSubscription    = api.deletePushSubscription
export const getScoreByRepresentante = api.getScoreByRepresentante
export const getCierreCajaHoy        = api.getCierreCajaHoy
export const registrarCierreCaja     = api.registrarCierreCaja
export const getCierresByFecha       = api.getCierresByFecha
export const updateWalletStatus      = api.updateWalletStatus
export const subscribeNotificaciones = api.subscribeNotificaciones

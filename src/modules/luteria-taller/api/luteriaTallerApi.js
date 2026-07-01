/**
 * luteriaTallerApi.js — DataAdapter para el Portal de Lutería.
 *
 * Dispatcher: enruta a mock o Supabase según el modo de la app.
 * Sigue el patrón estándar del proyecto (tareasApi.js, bitacoraAdapter.js).
 */

import { config } from '../../../core/config/config.js'
import * as mockImpl from './luteriaTallerMock.js'
import * as supabaseImpl from './luteriaTallerSupabase.js'

const impl = config.isDemoMode ? mockImpl : supabaseImpl

// ─── Órdenes ──────────────────────────────────────────────────────────────────
export const getOrdenes = impl.getOrdenes
export const getOrdenById = impl.getOrdenById
export const createOrden = impl.createOrden
export const updateOrdenEstado = impl.updateOrdenEstado
export const updateOrden = impl.updateOrden

// ─── Diagnósticos ─────────────────────────────────────────────────────────────
export const getDiagnosticos = impl.getDiagnosticos
export const createDiagnostico = impl.createDiagnostico

// ─── Presupuestos ─────────────────────────────────────────────────────────────
export const getPresupuestos = impl.getPresupuestos
export const createPresupuesto = impl.createPresupuesto
export const updatePresupuestoEstado = impl.updatePresupuestoEstado

// ─── Insumos ──────────────────────────────────────────────────────────────────
export const getInsumos = impl.getInsumos
export const getInsumoById = impl.getInsumoById
export const ajustarStock = impl.ajustarStock

// ─── Solicitudes de compra ────────────────────────────────────────────────────
export const getSolicitudesCompra = impl.getSolicitudesCompra
export const createSolicitudCompra = impl.createSolicitudCompra
export const updateSolicitudEstado = impl.updateSolicitudEstado

// ─── Evidencias ───────────────────────────────────────────────────────────────
export const getEvidencias = impl.getEvidencias
export const createEvidencia = impl.createEvidencia

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboard = impl.getDashboard

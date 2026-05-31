/**
 * useAdminNotificationActions — Centralized action handlers for admin notifications
 *
 * Handles: approve/reject ausencias, approve/reject maestros, navigate, notify-sub
 * Encapsulates: UI feedback, toast messages, event state mutations, KPI updates
 */

import { supabase } from '../../../lib/supabaseClient.js'
import { aprobarAusencia, rechazarAusencia } from '../../admin-aprobacion/api/ausenciaAprobacionApi.js'

export class AdminNotificationActionsHook {
  constructor({ onRefresh, onKPIUpdate } = {}) {
    this.onRefresh = onRefresh
    this.onKPIUpdate = onKPIUpdate
  }

  /**
   * Show toast message (dispatches custom event for app-wide handling)
   */
  _toast(message, type = 'info') {
    window.dispatchEvent(new CustomEvent('showToast', {
      detail: { message, type }
    }))
  }

  /**
   * Handle "notify-sub" action (substitute proposal)
   */
  async handleNotifySub(btn, event) {
    const subName = btn.dataset.subName
    btn.disabled = true
    btn.innerHTML = '<i class="bi bi-check-lg"></i> Propuesto'
    btn.className = 'anv-suplente-btn notified'
    this._toast(`Propuesta de suplencia enviada a ${subName}`, 'success')
  }

  /**
   * Handle "approve" action (ausencia approval)
   * Returns updated event state if successful, throws on error
   */
  async handleApproveAusencia(event) {
    try {
      await aprobarAusencia(event.sourceId, '')
      this._toast('Ausencia aprobada con éxito', 'success')

      if (this.onKPIUpdate) this.onKPIUpdate()
      if (window.adminAusenciasInsights) {
        window.adminAusenciasInsights.evaluate()
      }

      return this.getUpdatedEventState(event, 'approve')
    } catch (err) {
      this._toast(`Error: ${err.message}`, 'error')
      throw err
    }
  }

  /**
   * Handle "reject" action (ausencia rejection)
   * Returns updated event state if successful, throws on error
   */
  async handleRejectAusencia(event) {
    try {
      await rechazarAusencia(event.sourceId, '')
      this._toast('Ausencia rechazada con éxito', 'success')

      if (this.onKPIUpdate) this.onKPIUpdate()
      if (window.adminAusenciasInsights) {
        window.adminAusenciasInsights.evaluate()
      }

      return this.getUpdatedEventState(event, 'reject')
    } catch (err) {
      this._toast(`Error: ${err.message}`, 'error')
      throw err
    }
  }

  /**
   * Handle "approve-maestro" action
   * Returns updated event state if successful, throws on error
   */
  async handleApproveMaestro(event) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ estado: 'activo' })
        .eq('id', event.sourceId)

      if (error) throw error

      this._toast('Maestro aprobado con éxito', 'success')
      if (this.onKPIUpdate) this.onKPIUpdate()

      return this.getUpdatedEventState(event, 'approve-maestro')
    } catch (err) {
      this._toast(`Error: ${err.message}`, 'error')
      throw err
    }
  }

  /**
   * Handle "reject-maestro" action
   * Returns updated event state if successful, throws on error
   */
  async handleRejectMaestro(event) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ estado: 'rechazado' })
        .eq('id', event.sourceId)

      if (error) throw error

      this._toast('Maestro rechazado con éxito', 'success')
      if (this.onKPIUpdate) this.onKPIUpdate()

      return this.getUpdatedEventState(event, 'reject-maestro')
    } catch (err) {
      this._toast(`Error: ${err.message}`, 'error')
      throw err
    }
  }

  /**
   * Get updated event state (caller handles DOM replacement via _buildEventEl)
   */
  getUpdatedEventState(originalEvent, action) {
    const updated = { ...originalEvent, actionable: false }

    if (action === 'approve') {
      updated.estado = 'aprobada'
      updated.priority = 'info'
      updated.icon = 'bi-calendar-check-fill'
      updated.iconColor = '#22c55e'
    } else if (action === 'reject') {
      updated.estado = 'rechazada'
      updated.priority = 'info'
      updated.icon = 'bi-calendar-minus-fill'
      updated.iconColor = '#ef4444'
    } else if (action === 'approve-maestro') {
      updated.estado = 'activo'
      updated.priority = 'info'
      updated.icon = 'bi-person-check-fill'
      updated.iconColor = '#22c55e'
      updated.titulo = `Maestro registrado aprobado: ${originalEvent.titulo.replace('Nuevo maestro registrado esperando aprobación: ', '')}`
    } else if (action === 'reject-maestro') {
      updated.estado = 'rechazado'
      updated.priority = 'info'
      updated.icon = 'bi-person-dash-fill'
      updated.iconColor = '#ef4444'
      updated.titulo = `Maestro registrado rechazado: ${originalEvent.titulo.replace('Nuevo maestro registrado esperando aprobación: ', '')}`
    }

    return updated
  }
}

export function useAdminNotificationActions(config = {}) {
  return new AdminNotificationActionsHook(config)
}

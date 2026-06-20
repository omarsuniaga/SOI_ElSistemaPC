/**
 * LifecycleManager - Centralized management of subscriptions, intervals, and listeners
 *
 * Tracks all active Supabase channels, setInterval IDs, and event listeners
 * for proper cleanup when a service is destroyed.
 */

import { supabase } from '../../lib/supabaseClient.js'

export class LifecycleManager {
  constructor(scope = 'default') {
    this.scope = scope
    this.subscriptions = [] // Supabase channels
    this.intervals = [] // setInterval IDs
    this.listeners = [] // Event listeners {el, event, fn}
  }

  registerChannel(channel) {
    if (channel && !this.subscriptions.includes(channel)) {
      this.subscriptions.push(channel)
    }
  }

  registerInterval(id) {
    if (id !== null && !this.intervals.includes(id)) {
      this.intervals.push(id)
    }
  }

  registerListener(el, event, fn) {
    if (el && event && fn) {
      this.listeners.push({ el, event, fn })
    }
  }

  destroy() {
    // Unsubscribe all Supabase channels
    this.subscriptions.forEach((ch) => {
      try {
        if (ch) {
          supabase.removeChannel(ch)
        }
      } catch (err) {
        console.warn(`[LifecycleManager] Error removing channel (${this.scope}):`, err)
      }
    })

    // Clear all intervals
    this.intervals.forEach((id) => {
      try {
        clearInterval(id)
      } catch (err) {
        console.warn(`[LifecycleManager] Error clearing interval (${this.scope}):`, err)
      }
    })

    // Remove all event listeners
    this.listeners.forEach(({ el, event, fn }) => {
      try {
        if (el && event && fn) {
          el.removeEventListener(event, fn)
        }
      } catch (err) {
        console.warn(`[LifecycleManager] Error removing listener (${this.scope}):`, err)
      }
    })

    // Reset
    this.subscriptions = []
    this.intervals = []
    this.listeners = []

    console.log(`[LifecycleManager] Cleanup completed for scope: ${this.scope}`)
  }
}

/**
 * gatewayDispatcherIntegration.test.js — Suite de pruebas para la integración del Gateway WhatsApp,
 * telemetría Anti-Ban, Heartbeat y despacho Outbox.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as gatewayApi from '../api/gatewayApi.js'
import { config } from '../../../core/config/config.js'

describe('WhatsApp Gateway — Telemetría Anti-Ban, Heartbeat y Cola Outbox', () => {
  beforeEach(() => {
    config.isDemoMode = true
    vi.clearAllMocks()
  })

  it('1. Calcula dinámicamente el cupo diario según la fase de calentamiento (Warmup)', async () => {
    const stats = await gatewayApi.obtenerGatewayStats()

    expect(stats).toBeTruthy()
    expect(stats.capDiarioTope).toBe(200)
    expect(stats.totalDiasWarmup).toBe(7)
    expect(stats.diaWarmup).toBeGreaterThanOrEqual(1)
    expect(stats.capHoy).toBeGreaterThan(0)
    expect(stats.capHoy).toBeLessThanOrEqual(stats.capDiarioTope)
    expect(stats.jitterText).toContain('s – ')
    expect(stats.rateLimitHora).toBeGreaterThan(0)
  })

  it('2. Encola y despacha un mensaje de prueba a través de la cola Outbox', async () => {
    const testJid = '+1 (829) 555-0999'
    const testMsg = 'Mensaje de validación del subsistema 4'

    const enqueued = await gatewayApi.enviarMensajePrueba(testJid, testMsg)

    expect(enqueued).toBeTruthy()
    expect(enqueued.jid).toBe(testJid)
    expect(enqueued.mensaje).toBe(testMsg)
    expect(enqueued.estado).toBe('enviado')

    const queue = await gatewayApi.obtenerColaMensajes(10)
    const found = queue.find((q) => q.jid === testJid)
    expect(found).toBeTruthy()
  })

  it('3. Permite reintentar un mensaje fallido en la cola', async () => {
    const queue = await gatewayApi.obtenerColaMensajes(10)
    const target = queue[0]
    expect(target).toBeTruthy()

    const retried = await gatewayApi.reintentarMensajeCola(target.id)
    expect(retried).toBeTruthy()
    expect(retried.error_msg).toBeNull()
  })

  it('4. Actualiza y persiste las políticas Anti-Ban (Jitter, Cap, Batch)', async () => {
    const updates = {
      cap_diario: 350,
      cap_horario: 60,
      jitter_min_seg: 10,
      jitter_max_seg: 25,
      batch_size: 15,
    }

    const updated = await gatewayApi.actualizarGatewayConfig(updates)

    expect(updated.cap_diario).toBe(350)
    expect(updated.cap_horario).toBe(60)
    expect(updated.jitter_min_seg).toBe(10)
    expect(updated.jitter_max_seg).toBe(25)
    expect(updated.batch_size).toBe(15)
  })

  it('5. Inicializa la configuración por defecto con fecha de warmup fresca', async () => {
    const initialized = await gatewayApi.inicializarGatewayDefault()

    expect(initialized).toBeTruthy()
    expect(initialized.activo).toBe(true)
    expect(initialized.instance_name).toBe('soi-main')
    expect(initialized.warmup_desde).toBe(new Date().toISOString().slice(0, 10))
  })
})

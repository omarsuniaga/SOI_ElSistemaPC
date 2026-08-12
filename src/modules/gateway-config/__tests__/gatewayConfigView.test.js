/**
 * gatewayConfigView.test.js — Suite de pruebas para el Panel de Control del Gateway WhatsApp (Subsistema 4)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

import { renderGatewayConfigView } from '../views/gatewayConfigView.js'
import * as gatewayApi from '../api/gatewayApi.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { config } from '../../../core/config/config.js'

describe('GatewayConfigView — Panel de Control del Gateway WhatsApp (Baileys)', () => {
  beforeEach(() => {
    config.isDemoMode = true
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('renderiza el encabezado, estado en vivo y métricas de telemetría Anti-Ban', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    await renderGatewayConfigView(container)

    expect(container.textContent).toContain('Gateway WhatsApp (Baileys)')
    expect(container.textContent).toContain('Subsistema 4')
    expect(container.textContent).toContain('Conectado')
    expect(container.textContent).toContain('Consumo Diario')
    expect(container.textContent).toContain('Fase de Warmup')
    expect(container.textContent).toContain('Ritmo y Retardo')
  })

  it('permite enviar un mensaje de prueba desde la consola de diagnóstico en caliente', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    await renderGatewayConfigView(container)

    const jidInput = container.querySelector('#test-jid')
    const msgInput = container.querySelector('#test-mensaje')
    const sendBtn = container.querySelector('#btn-enviar-test')

    expect(jidInput).toBeTruthy()
    expect(msgInput).toBeTruthy()
    expect(sendBtn).toBeTruthy()

    jidInput.value = '+18295550999'
    msgInput.value = 'Mensaje de prueba automatizado'

    await sendBtn.click()

    expect(AppToast.success).toHaveBeenCalledWith(expect.stringContaining('+18295550999'))
  })

  it('permite inicializar la configuración recomendada con 1 clic', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    await renderGatewayConfigView(container)

    const initBtn = container.querySelector('#btn-init-gw')
    expect(initBtn).toBeTruthy()

    initBtn.click()
    await new Promise((r) => setTimeout(r, 60))

    expect(AppToast.success).toHaveBeenCalledWith(expect.stringContaining('Gateway inicializado'))
  })

  it('filtra los mensajes de la cola de salida según su estado', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    await renderGatewayConfigView(container)

    const pendientesBtn = container.querySelector('[data-queue-filter="pendiente"]')
    expect(pendientesBtn).toBeTruthy()

    pendientesBtn.click()

    const updatedBtn = container.querySelector('[data-queue-filter="pendiente"]')
    expect(updatedBtn.classList.contains('btn-warning')).toBe(true)
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import './setup.js'
import { createNodeEvaluationCard } from '../../src/portal-maestros/components/NodeEvaluationCard.js'
import { academicService } from '../../src/modules/academic-routes/services/academicService.js'

// Mock de academicService
vi.mock('../../src/modules/academic-routes/services/academicService.js', () => ({
  academicService: {
    getStatusToken: vi.fn(() => ({ color: 'blue', icon: 'bi-check', label: 'OK', bg: 'rgba(0,0,0,0.1)' })),
    saveIndicatorAttempt: vi.fn().mockResolvedValue({ success: true })
  }
}))

describe('NodeEvaluationCard', () => {
  let container
  const mockProps = {
    indicator: {
      indicator_id: 'ind-1',
      node_id: 'node-1',
      node_name: 'Postura',
      indicator_description: 'Espalda recta',
      is_critical: true,
      status: 'pending',
      feedback: ''
    },
    sessionId: 'sess-1',
    studentId: 'stu-1',
    teacherId: 'teach-1',
    onSave: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('debe renderizar el contenido correctamente', () => {
    createNodeEvaluationCard(container, mockProps)
    
    expect(container.querySelector('.pm-eval-node-name').textContent).toBe('Postura')
    expect(container.querySelector('.pm-eval-indicator-desc').textContent).toBe('Espalda recta')
    expect(container.querySelector('.pm-badge-critical')).not.toBeNull()
  })

  it('debe marcar como activo el botón del estado actual', () => {
    createNodeEvaluationCard(container, {
      ...mockProps,
      indicator: { ...mockProps.indicator, status: 'approved' }
    })

    const btnApproved = container.querySelector('.btn-approved')
    expect(btnApproved.classList.contains('active')).toBe(true)
  })

  it('debe disparar saveIndicatorAttempt y cambiar clases CSS al hacer clic en un estado', async () => {
    createNodeEvaluationCard(container, mockProps)
    const card = container.querySelector('.pm-node-eval-card')
    
    const btnApproved = container.querySelector('.btn-approved')
    btnApproved.click()

    expect(academicService.saveIndicatorAttempt).toHaveBeenCalledWith(expect.objectContaining({
      status: 'approved',
      indicator_id: 'ind-1',
      student_id: 'stu-1'
    }))
    
    await vi.waitFor(() => {
      expect(card.classList.contains('status-approved')).toBe(true)
      expect(mockProps.onSave).toHaveBeenCalled()
    })
  })

  it('debe guardar automáticamente tras escribir en el feedback (debounce)', async () => {
    vi.useFakeTimers()
    createNodeEvaluationCard(container, mockProps)
    
    const textarea = container.querySelector('.pm-eval-feedback-input')
    textarea.value = 'Mejorar inclinación'
    textarea.dispatchEvent(new Event('input'))

    // No debe guardar inmediatamente
    expect(academicService.saveIndicatorAttempt).not.toHaveBeenCalled()

    // Avanzar tiempo
    vi.advanceTimersByTime(1600)
    
    expect(academicService.saveIndicatorAttempt).toHaveBeenCalledWith(expect.objectContaining({
      feedback: 'Mejorar inclinación'
    }))

    vi.useRealTimers()
  })
})

// AchievementsSummaryModal: cobertura movida a
// src/portal-maestros/components/__tests__/AchievementsSummaryModal.test.js
// (openspec/changes/juego-gamificado-planificacion, Spec B-03) — el
// componente pasó de recibir `approvedNodes`/`levelPromoted` (sistema legado
// de nodes/levels, ya no produce evaluaciones reales) a `logrosNuevos`/
// `rachaActual`/`rachaSubio` (alumnos_logros/rachas reales).

import { describe, it, expect, vi, beforeEach } from 'vitest'
import './setup.js'
import { createNodeEvaluationCard } from '../../src/portal-maestros/components/NodeEvaluationCard.js'
import { createAchievementsSummaryModal } from '../../src/portal-maestros/components/AchievementsSummaryModal.js'
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

describe('AchievementsSummaryModal', () => {
  let container
  const mockResults = [
    {
      studentName: 'Juan Perez',
      approvedNodes: ['Postura', 'Afinación'],
      levelPromoted: 'Nivel 2'
    },
    {
      studentName: 'Maria Garcia',
      approvedNodes: ['Ritmo'],
      levelPromoted: null
    }
  ]

  beforeEach(() => {
    document.body.innerHTML = ''
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('debe renderizar la lista de logros recibida', () => {
    createAchievementsSummaryModal(container, mockResults)
    
    const studentNames = container.querySelectorAll('.pm-student-name')
    expect(studentNames[0].textContent).toBe('Juan Perez')
    expect(studentNames[1].textContent).toBe('Maria Garcia')

    const badges = container.querySelectorAll('.pm-badge-node')
    expect(badges.length).toBe(3) // 2 para Juan, 1 para Maria
    expect(badges[0].textContent.trim()).toBe('Postura')
    
    const promotion = container.querySelector('.pm-badge-level')
    expect(promotion.textContent).toContain('Promovido a: Nivel 2')
  })

  it('debe cerrarse al hacer clic en continuar', async () => {
    const promise = createAchievementsSummaryModal(container, mockResults)
    const btn = container.querySelector('#pm-achievements-close')
    
    btn.click()
    
    await promise // Espera a que la promesa se resuelva
    expect(container.querySelector('.pm-modal-overlay')).toBeNull()
  })

  it('no debe renderizar nada si results está vacío', () => {
    createAchievementsSummaryModal(container, [])
    expect(container.innerHTML).toBe('')
  })
})

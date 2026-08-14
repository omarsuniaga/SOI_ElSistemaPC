// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/dom'

const { saveObservationMock } = vi.hoisted(() => ({
  saveObservationMock: vi.fn().mockResolvedValue({ id: 'obs-1' }),
}))

vi.mock('../../../services/autoDraftService.js', () => ({
  saveObservation: saveObservationMock,
}))

vi.mock('../../../services/evaluationService.js', () => ({
  processarEvaluacion: vi.fn().mockResolvedValue({
    error: null,
    modo: 'dsl',
    dslGenerado: null,
    textoMejorado: null,
    missing: [],
    evaluaciones: [],
  }),
  saveEvaluaciones: vi.fn().mockResolvedValue({ error: null }),
}))

vi.mock('../../../utils/dslParser.js', () => ({
  parseDSL: vi.fn().mockReturnValue({ estados: [] }),
}))

vi.mock('../../../services/progressAggregatorService.js', () => ({
  saveProgressFromDSL: vi.fn().mockResolvedValue({ saved: [], errors: [] }),
  saveProgressFromEvaluaciones: vi.fn().mockResolvedValue({ error: null }),
}))

vi.mock('../../../utils/asistenciaHelpers.js', () => ({
  showProgressFeedback: vi.fn(),
}))

vi.mock('../../../services/observationPromotionService.js', () => ({
  promocionarObservacionesAlumnos: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('../../../services/classEventService.js', () => ({
  updateClassEventStatus: vi.fn().mockResolvedValue(null),
}))

vi.mock('../../../../shared/components/AppToast.js', () => ({
  AppToast: {
    warning: vi.fn(),
    error: vi.fn(),
  },
}))

import { createObservationSaveButton } from '../ObservationSaveButton.js'

describe('ObservationSaveButton', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    container.innerHTML = `
      <button id="btn-guardar-obs">Guardar observación</button>
      <div id="pm-active-tema-badge"></div>
    `
    document.body.appendChild(container)
    saveObservationMock.mockClear()
  })

  afterEach(() => {
    container?.remove()
  })

  it('passes class context to saveObservation so substitute audit can run', async () => {
    createObservationSaveButton(container, {
      rutaId: 'ruta-1',
      sesionId: 'ses-1',
      claseId: 'clase-1',
      clase: {
        id: 'clase-1',
        nombre: 'Violín Inicial',
        maestro_principal_id: 'maestro-titular',
        maestro_suplente_id: 'maestro-suplente',
      },
      maestro: {
        id: 'maestro-suplente',
        user_id: 'user-1',
      },
      fechaHoy: '2026-08-14',
      alumnos: [{ id: 'al-1', nombre_completo: 'Alumno 1' }],
      estado: { 'al-1': 'P' },
      planificationCard: {
        getActivePlanificacionId: () => 'plan-1',
        getActiveIndicador: () => ({ id: 'ind-1', nombre: 'Compás' }),
      },
      editorContainer: document.createElement('div'),
      getEditorValue: () => 'Texto de prueba',
      setEditorValue: vi.fn(),
      claseNombre: 'Violín Inicial',
      onAppendModal: vi.fn(),
    })

    fireEvent.click(container.querySelector('#btn-guardar-obs'))

    await waitFor(() => {
      expect(saveObservationMock).toHaveBeenCalledWith(
        'ses-1',
        'maestro-suplente',
        'Texto de prueba',
        expect.objectContaining({ indicador_id: 'ind-1' }),
        null,
        null,
        expect.objectContaining({
          clase: expect.objectContaining({ id: 'clase-1' }),
          maestroUserId: 'user-1',
          fechaHoy: '2026-08-14',
        }),
      )
    })
  })
})

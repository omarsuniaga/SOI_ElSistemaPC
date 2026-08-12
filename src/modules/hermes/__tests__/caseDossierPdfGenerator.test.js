/**
 * caseDossierPdfGenerator.test.js — Suite de pruebas para la generación del Acta de Expediente PDF
 */

import { describe, it, expect, vi } from 'vitest'
import { generateCaseDossierPdf } from '../logic/caseDossierPdfGenerator.js'

describe('caseDossierPdfGenerator — Generación de Actas Formales SOI', () => {
  it('genera un documento jsPDF con carátula, matriz de tareas, auditoría y firmas', () => {
    const mockCaseDetail = {
      correlation_id: 'case-acm-p02-demo-12345',
      contract: {
        process_code: 'ACM-P02',
        process_name: 'Asistencia y contenido de clase',
        department_owner: 'ACM',
        canonical_doc_path: 'Manual SOI Sección 4.2',
        required_evidence: [{ label: 'Listado de asistencia firmado' }],
      },
      tasks: [
        {
          id: 't-1',
          titulo: 'ACM: Exigir regularización a 2 docentes en mora',
          departamento: 'ACM',
          estado: 'completada',
          fecha_vencimiento: '2026-08-20',
          checklist: [{ item: 'Prof. Carlos Santana', completado: true }],
          updated_by_nombre: 'Coordinador Académico',
        },
        {
          id: 't-2',
          titulo: 'DIR: Supervisión y firma de acta',
          departamento: 'DIR',
          estado: 'completada',
          fecha_vencimiento: '2026-08-22',
          checklist: [],
          updated_by_nombre: 'Director General',
        },
      ],
      metrics: {
        total: 2,
        completadas: 2,
        bloqueadas: 0,
        observadas: 0,
        evidencias: 1,
      },
      closure_summary: 'Auditoría completada al 100%. Todos los maestros regularizaron su carga académica.',
    }

    const doc = generateCaseDossierPdf(mockCaseDetail, { autoDownload: false })

    expect(doc).toBeTruthy()
    expect(doc.internal.getNumberOfPages()).toBeGreaterThanOrEqual(1)
  })

  it('maneja estructuras vacías o nulas sin fallar', () => {
    const doc = generateCaseDossierPdf({}, { autoDownload: false })
    expect(doc).toBeTruthy()
    expect(doc.internal.getNumberOfPages()).toBeGreaterThanOrEqual(1)
  })
})

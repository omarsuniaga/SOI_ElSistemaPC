import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  spanishPhoneticKey,
  tokenSimilarity,
  compareNombres,
  similitudEntre,
  camposCompartidos,
  detectarPosiblesDuplicados,
  construirFusion,
  evaluarCampo,
  quienEsMasCompleto,
} from '../../../src/modules/alumnos/domain/duplicadosAlumnos.js'
import { DuplicadosModal } from '../../../src/modules/alumnos/components/DuplicadosModal.js'
import { AppModal } from '../../../src/shared/components/AppModal.js'
import * as alumnosApi from '../../../src/modules/alumnos/api/alumnosApi.js'

vi.mock('../../../src/shared/components/AppModal.js', () => ({
  AppModal: {
    open: vi.fn(),
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
  },
}))

vi.mock('../../../src/shared/components/AppToast.js', () => ({
  AppToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('../../../src/modules/alumnos/api/alumnosApi.js', () => ({
  obtenerTodosLosAlumnosParaAnalisis: vi.fn(),
  obtenerInscripcionesDetalladasAlumno: vi.fn(),
  fusionarAlumnos: vi.fn(),
}))

describe('Evaluación de Ingeniería de Duplicados', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── 1. Evaluación del Caso Central ─────────────────────────────────────────
  describe('Caso Central: "Matias Paredes" vs "Mathias Alejandro Paredes Masuoka"', () => {
    const alumnoA = {
      id: 'id_matias_1',
      nombre_completo: 'Matias Paredes',
      padre_nombre: 'Carlos Paredes',
      familiar_telefono: '829-315-9040',
      instrumento_principal: 'Iniciación',
    }

    const alumnoB = {
      id: 'id_mathias_2',
      nombre_completo: 'Mathias Alejandro Paredes Masuoka',
      padre_nombre: 'Carlos Paredes Masuoka',
      representante_tlf: '8293159040',
      instrumento_principal: 'Violín',
      direccion: 'Bávaro, Punta Cana',
      fecha_nacimiento: '2014-08-15',
    }

    it('iguala fonéticamente "mathias" y "matias" con tokenSimilarity >= 0.90', () => {
      expect(spanishPhoneticKey('mathias')).toBe(spanishPhoneticKey('matias'))
      expect(tokenSimilarity('matias', 'mathias')).toBeGreaterThanOrEqual(0.90)
    })

    it('detecta cobertura de nombre superior al 85% a pesar de segundo nombre y segundo apellido', () => {
      const score = compareNombres(alumnoA.nombre_completo, alumnoB.nombre_completo)
      expect(score).toBeGreaterThanOrEqual(0.85)
    })

    it('identifica coincidencias de padre y teléfono en camposCompartidos', () => {
      const compartidos = camposCompartidos(alumnoA, alumnoB)
      const claves = compartidos.map(c => c.key)
      expect(claves).toContain('padre_nombre')
      expect(claves).toContain('telefono')
    })

    it('calcula puntaje global de similitud con "Alta certeza" (>= 0.85)', () => {
      const score = similitudEntre(alumnoA, alumnoB)
      expect(score.puntaje).toBeGreaterThanOrEqual(0.85)
    })

    it('detectaPosiblesDuplicados encuentra la pareja dentro de una lista con otros alumnos no relacionados', () => {
      const listaAlumnos = [
        alumnoA,
        { id: 'otro_1', nombre_completo: 'Dylan Machillanda', padre_nombre: 'Dylan Machillanda Sr' },
        alumnoB,
        { id: 'otro_2', nombre_completo: 'Iriam Méndez José', padre_nombre: 'José Paulino' },
      ]

      const resultados = detectarPosiblesDuplicados(listaAlumnos)
      expect(resultados.length).toBe(1)
      expect(resultados[0].a.id).toBe('id_matias_1')
      expect(resultados[0].b.id).toBe('id_mathias_2')
      expect(resultados[0].nivel).toBe('alta')
    })
  })

  // ── 2. Evaluación de Variaciones Fonéticas y Ortográficas ─────────────────
  describe('Variaciones Fonéticas y Ortográficas en Español', () => {
    it('detecta "Sofia Hernandez" vs "Sophia Hernández" con mismo teléfono', () => {
      const s1 = { id: 's1', nombre_completo: 'Sofia Hernandez', representante_tlf: '8095551234' }
      const s2 = { id: 's2', nombre_completo: 'Sophia Hernández', familiar_telefono: '(809) 555-1234' }
      const res = detectarPosiblesDuplicados([s1, s2])
      expect(res.length).toBe(1)
      expect(res[0].puntaje).toBeGreaterThanOrEqual(0.85)
    })

    it('detecta "Bryan Rodriguez" vs "Brian Rodríguez Pérez" con misma madre', () => {
      const b1 = { id: 'b1', nombre_completo: 'Bryan Rodriguez', madre_nombre: 'Carmen Perez' }
      const b2 = { id: 'b2', nombre_completo: 'Brian Rodríguez Pérez', madre_nombre: 'Carmen Pérez' }
      const res = detectarPosiblesDuplicados([b1, b2])
      expect(res.length).toBe(1)
      expect(res[0].nivel).toBe('alta')
    })

    it('detecta orden invertido de nombres: "Paredes Matias" vs "Mathias Paredes"', () => {
      const p1 = { id: 'p1', nombre_completo: 'Paredes Matias', padre_nombre: 'Carlos' }
      const p2 = { id: 'p2', nombre_completo: 'Mathias Paredes', padre_nombre: 'Carlos' }
      const res = detectarPosiblesDuplicados([p1, p2])
      expect(res.length).toBe(1)
      expect(res[0].puntaje).toBeGreaterThanOrEqual(0.85)
    })

    it('NO confunde alumnos con mismo apellido pero nombres y padres completamente diferentes', () => {
      const a1 = { id: 'a1', nombre_completo: 'Pedro Martinez', padre_nombre: 'Juan Martinez' }
      const a2 = { id: 'a2', nombre_completo: 'Ana Martinez', padre_nombre: 'Roberto Martinez' }
      const res = detectarPosiblesDuplicados([a1, a2])
      expect(res.length).toBe(0)
    })

    it('Regla Anti-Hermanos: discrimina a Jose Tomas Lorenzo Ogando y Alondra Lorenzo Ogando (mismos padres/apellidos pero distintos nombres de pila e instrumentos)', () => {
      const hermano = {
        id: 'h1',
        nombre_completo: 'Jose Tomas Lorenzo Ogando',
        padre_nombre: 'Tomas Lorenzo',
        madre_nombre: 'Maria Ogando',
        representante_tlf: '8295559988',
        genero: 'M',
        instrumento_principal: 'Trompeta',
      }
      const hermana = {
        id: 'h2',
        nombre_completo: 'Alondra Lorenzo Ogando',
        padre_nombre: 'Tomas Lorenzo',
        madre_nombre: 'Maria Ogando',
        representante_tlf: '8295559988',
        genero: 'F',
        instrumento_principal: 'Violoncello',
      }

      const score = similitudEntre(hermano, hermana)
      expect(score.esHermano).toBe(true)
      expect(score.puntaje).toBe(0.0)

      const res = detectarPosiblesDuplicados([hermano, hermana])
      expect(res.length).toBe(0)
    })
  })

  // ── 3. Evaluación de Fusión de Clases e Interacción Modal ──────────────────
  describe('Unificación de Clases y Selección de Principal en Modal', () => {
    const alumno1 = {
      id: 'al_001',
      nombre_completo: 'Matias Paredes',
      padre_nombre: 'Carlos Paredes',
      instrumento_principal: 'Iniciación',
    }

    const alumno2 = {
      id: 'al_002',
      nombre_completo: 'Mathias Alejandro Paredes Masuoka',
      padre_nombre: 'Carlos Paredes',
      instrumento_principal: 'Violín',
      direccion: 'Residencial Bavaro',
      fecha_nacimiento: '2014-08-15',
    }

    it('determina que alumno2 es más completo por tener más datos cargados', () => {
      const masCompleto = quienEsMasCompleto(alumno1, alumno2)
      expect(masCompleto.id).toBe('al_002')
    })

    it('construirFusion completa los datos faltantes y detecta conflicto en instrumento', () => {
      const fusion = construirFusion(alumno2, alumno1)
      expect(fusion.resultante.fecha_nacimiento).toBe('2014-08-15')
      expect(fusion.resultante.direccion).toBe('Residencial Bavaro')
      
      const campoInst = fusion.campos.find(c => c.key === 'instrumento_principal')
      expect(campoInst.tipo).toBe('conflicto')
      expect(campoInst.puedeElegir).toBe(true)
    })

    it('el flujo completo del modal carga las clases de ambos, muestra la unificación y permite alternar principal', async () => {
      const clasesAlumno1 = [
        { id: 'clase_iniciacion', nombre: 'Iniciación Musical (Tarde)', clase_horarios: [{ dia: 'Lunes', hora_inicio: '15:30:00' }] }
      ]
      const clasesAlumno2 = [
        { id: 'clase_coro', nombre: 'Coro Infantil (Sábado)', clase_horarios: [{ dia: 'Sábado', hora_inicio: '10:00:00' }] }
      ]

      alumnosApi.obtenerInscripcionesDetalladasAlumno.mockImplementation(async (id) => {
        if (id === 'al_001') return clasesAlumno1
        if (id === 'al_002') return clasesAlumno2
        return []
      })

      alumnosApi.fusionarAlumnos.mockResolvedValue({
        success: true,
        principal_id: 'al_001',
        eliminado: true,
      })

      const onSuccess = vi.fn()
      await DuplicadosModal.abrir({ alumnos: [alumno1, alumno2], onSuccess })

      // 1. Iniciar análisis
      await AppModal.open.mock.calls[0][0].onSave()

      // 2. Lista de duplicados
      const listModal = AppModal.open.mock.calls[1][0]
      const containerList = document.createElement('div')
      containerList.innerHTML = listModal.body
      listModal.onShow(containerList)

      // Clic en la primera pareja
      containerList.querySelector('[data-duplicado-idx="0"]').click()
      await new Promise(r => setTimeout(r, 20))

      // 3. Modal de Detalle
      const detailModal = AppModal.open.mock.calls[2][0]
      expect(detailModal.title).toBe('Revisar y fusionar alumnos')
      
      // Ambas clases deben aparecer en el cuerpo del modal
      expect(detailModal.body).toContain('Iniciación Musical (Tarde)')
      expect(detailModal.body).toContain('Coro Infantil (Sábado)')
      expect(detailModal.body).toContain('Fusión de clases')

      // Verificar que el contenedor de detalle maneja el cambio de principal
      const containerDetail = document.createElement('div')
      containerDetail.innerHTML = detailModal.body
      detailModal.onShow(containerDetail)

      // Clic en el botón para conservar alumno1 en lugar de alumno2
      const btnAlumno1 = containerDetail.querySelector('button[data-principal-id="al_001"]')
      expect(btnAlumno1).not.toBeNull()
      btnAlumno1.click()

      // Confirmar fusión
      const saveResult = await detailModal.onSave()
      expect(saveResult).toBe(true)
      expect(alumnosApi.fusionarAlumnos).toHaveBeenCalledWith(expect.objectContaining({
        principalId: 'al_001',
        obsoletoId: 'al_002',
      }))
      expect(onSuccess).toHaveBeenCalled()
    })
  })
})

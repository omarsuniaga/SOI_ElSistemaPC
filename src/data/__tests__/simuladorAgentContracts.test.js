/**
 * simuladorAgentContracts.test.js
 * Slice 2 — Portal Simulador: contratos de agentes como asset versionado.
 * Design: decisión #2 (contratos AGT-*.md leídos en build-time y copiados
 *   como asset machine-readable) + decisión #3 (fallback GENERICO para
 *   ADM/LOG/TECNICO, que no tienen AGT dedicado).
 * Fuente: 06_IA_AGENTS_LOGIC/00_INDICE_AGENTES.md + AGT-DIR/ACM/FIN/COM/ATN.
 * TDD: tests escritos ANTES de la implementación (strict TDD mode).
 */
import { describe, it, expect } from 'vitest'
import { simuladorAgentContracts, resolverContratoPorDepartamento } from '../simuladorAgentContracts.js'

const CLAVES_ESPERADAS = ['DIR', 'ACM', 'FIN', 'COM', 'ATN', 'GENERICO']
const CAMPOS_CONTRATO = ['rol', 'responsabilidades', 'accionesPermitidas', 'tono']

describe('simuladorAgentContracts — estructura', () => {
  it('expone exactamente las claves DIR, ACM, FIN, COM, ATN, GENERICO', () => {
    expect(Object.keys(simuladorAgentContracts).sort()).toEqual([...CLAVES_ESPERADAS].sort())
  })

  it.each(CLAVES_ESPERADAS)('el contrato %s tiene todos los campos requeridos', (clave) => {
    const contrato = simuladorAgentContracts[clave]
    for (const campo of CAMPOS_CONTRATO) {
      expect(contrato).toHaveProperty(campo)
    }
    expect(Array.isArray(contrato.responsabilidades)).toBe(true)
    expect(contrato.responsabilidades.length).toBeGreaterThan(0)
    expect(Array.isArray(contrato.accionesPermitidas)).toBe(true)
    expect(contrato.accionesPermitidas.length).toBeGreaterThan(0)
  })

  it('las acciones permitidas están dentro del vocabulario válido del orquestador', () => {
    const ACCIONES_VALIDAS = ['crear_tarea', 'enviar_whatsapp', 'enviar_email', 'registrar_log']
    for (const clave of CLAVES_ESPERADAS) {
      for (const accion of simuladorAgentContracts[clave].accionesPermitidas) {
        expect(ACCIONES_VALIDAS).toContain(accion)
      }
    }
  })

  it('DIR referencia el dominio real de AGT-DIR (dirección ejecutiva)', () => {
    expect(simuladorAgentContracts.DIR.rol.toLowerCase()).toContain('dirección')
  })

  it('FIN referencia mora/pago (dominio real de AGT-FIN)', () => {
    const responsabilidades = simuladorAgentContracts.FIN.responsabilidades.join(' ').toLowerCase()
    expect(responsabilidades).toMatch(/mora|pago|cobranza/)
  })

  it('GENERICO es el fallback embebido para departamentos sin AGT dedicado', () => {
    expect(simuladorAgentContracts.GENERICO.rol.toLowerCase()).toMatch(/gen[eé]rico|operativo/)
  })
})

describe('resolverContratoPorDepartamento', () => {
  it('DIR -> contrato DIR', () => {
    expect(resolverContratoPorDepartamento('DIR')).toBe(simuladorAgentContracts.DIR)
  })
  it('ACM -> contrato ACM', () => {
    expect(resolverContratoPorDepartamento('ACM')).toBe(simuladorAgentContracts.ACM)
  })
  it('FIN -> contrato FIN', () => {
    expect(resolverContratoPorDepartamento('FIN')).toBe(simuladorAgentContracts.FIN)
  })
  it('COM -> contrato COM', () => {
    expect(resolverContratoPorDepartamento('COM')).toBe(simuladorAgentContracts.COM)
  })

  it.each(['ADM', 'LOG', 'TECNICO'])('%s (sin AGT dedicado) -> contrato GENERICO', (depto) => {
    expect(resolverContratoPorDepartamento(depto)).toBe(simuladorAgentContracts.GENERICO)
  })

  it('un código de departamento desconocido también hace fallback a GENERICO (falla cerrado, no lanza)', () => {
    expect(resolverContratoPorDepartamento('NO_EXISTE')).toBe(simuladorAgentContracts.GENERICO)
  })

  it('ATN se resuelve explícitamente por su propio código (no es un soi_departamento pero tiene contrato dedicado)', () => {
    expect(resolverContratoPorDepartamento('ATN')).toBe(simuladorAgentContracts.ATN)
  })
})

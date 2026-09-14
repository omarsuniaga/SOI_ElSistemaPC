export function createSectionalDemoAdapter({ measureCount = 32, canViewOrchestra = false } = {}) {
  const evidence = Array.from({ length: measureCount }, (_, measure) => [
    { sectionId: 'maderas', measureId: String(measure + 1), filaId: 'flauta', filaName: 'Flauta', collectiveState: 'SIN_ESTUDIAR', applicability: 'TOCA', students: Array(8).fill({}) },
    { sectionId: 'maderas', measureId: String(measure + 1), filaId: 'oboe', filaName: 'Oboe', collectiveState: 'CONSOLIDADO', applicability: 'TOCA', students: [{ overrideState: 'SIN_ESTUDIAR' }] },
    { sectionId: 'maderas', measureId: String(measure + 1), filaId: 'clarinete', filaName: 'Clarinete', collectiveState: 'DOMINADO', applicability: 'TOCA', students: Array(6).fill({}) },
    { sectionId: 'maderas', measureId: String(measure + 1), filaId: 'fagot', filaName: 'Fagot', collectiveState: 'DOMINADO', applicability: measure % 8 === 0 ? 'TACET' : 'TOCA', students: Array(2).fill({}) }
  ]).flat().concat(Array.from({ length: measureCount }, (_, measure) => [
    { sectionId: 'metales', measureId: String(measure + 1), filaId: 'trompeta', filaName: 'Trompeta I', collectiveState: 'DOMINADO', applicability: 'TOCA', students: [{}] },
    { sectionId: 'metales', measureId: String(measure + 1), filaId: 'trompa', filaName: 'Trompa I', collectiveState: 'CONSOLIDADO', applicability: 'TOCA', students: [{}] }
  ]).flat())
  return { async listEvidence() { return structuredClone(evidence) }, authorizedSectionIds: ['maderas', 'metales'], canViewOrchestra, editableFilaIds: ['flauta', 'trompeta'], assertFilaEditable(filaId) { if (!this.editableFilaIds.includes(filaId)) throw new Error('Fila fuera del alcance editable'); return true } }
}

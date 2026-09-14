export function createSectionalDemoAdapter() {
  const evidence = Array.from({ length: 32 }, (_, measure) => [
    { sectionId: 'maderas', measureId: String(measure + 1), filaId: 'flauta', filaName: 'Flauta', collectiveState: 'SIN_ESTUDIAR', applicability: 'TOCA', students: Array(8).fill({}) },
    { sectionId: 'maderas', measureId: String(measure + 1), filaId: 'oboe', filaName: 'Oboe', collectiveState: 'CONSOLIDADO', applicability: 'TOCA', students: [{}] },
    { sectionId: 'maderas', measureId: String(measure + 1), filaId: 'clarinete', filaName: 'Clarinete', collectiveState: 'DOMINADO', applicability: 'TOCA', students: Array(6).fill({}) },
    { sectionId: 'maderas', measureId: String(measure + 1), filaId: 'fagot', filaName: 'Fagot', collectiveState: 'DOMINADO', applicability: measure % 8 === 0 ? 'TACET' : 'TOCA', students: Array(2).fill({}) }
  ]).flat()
  return { async listEvidence() { return structuredClone(evidence) }, authorizedSectionIds: ['maderas'], editableFilaIds: ['flauta'] }
}

import { generateOptimizedSchedule } from '../engine/schedulingEngine.js'

function lcgRand(seed) {
  let s = seed | 0
  return () => {
    s = Math.imul(1664525, s) + 1013904223 | 0
    return (s >>> 0) / 0x100000000
  }
}

export function shuffleWithSeed(arr, seed) {
  const shuffled = [...arr]
  const rand = lcgRand(seed)
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function fingerprint(assignments) {
  return assignments
    .map((a) => `${a.clase_id}:${a.dia}:${a.hora_inicio}`)
    .sort()
    .join('|')
}

export function generateMultipleProposals({ clasesConMaestro, maestros, salones }, config, n = 3) {
  const seen = new Set()
  return Array.from({ length: n }, (_, i) => {
    const shuffled = shuffleWithSeed(clasesConMaestro, i + 1)
    const result = generateOptimizedSchedule({ clasesConMaestro: shuffled, maestros, salones, config })
    const fp = fingerprint(result.assignments)
    const isDuplicate = seen.has(fp)
    seen.add(fp)
    return {
      id: i + 1,
      assignments: result.assignments,
      noAsignadas: result.noAsignadas ?? [],
      metricas: result.metricas ?? {},
      fingerprint: fp,
      _duplicate: isDuplicate,
    }
  })
}

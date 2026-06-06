export function extractVariables(templateContent = '') {
  const matches = templateContent.match(/\{(\w+)\}/g) || []
  return [...new Set(matches)]
}

export function resolveTemplate(templateContent = '', context = {}) {
  return templateContent.replace(/\{(\w+)\}/g, (_, key) => {
    const val = context[key]
    if (val === undefined || val === null || String(val).trim() === '') {
      return `[Dato faltante: ${key}]`
    }
    return String(val)
  })
}

export function getMissingVariables(templateContent = '', context = {}) {
  const vars = extractVariables(templateContent)
  return vars.filter(token => {
    const key = token.replace(/[{}]/g, '')
    const val = context[key]
    return val === undefined || val === null || String(val).trim() === ''
  })
}

export function validateDocumentData(templateContent = '', context = {}, criticalVars = []) {
  const missingVars = getMissingVariables(templateContent, context)
  const hasCritical = missingVars.some(v => criticalVars.includes(v))
  const warnings    = missingVars.map(v => `Falta dato: ${v.replace(/[{}]/g, '')}`)
  return { valid: missingVars.length === 0, missingVars, warnings, hasCritical }
}

export function buildResolvedDocument({ template, context }) {
  const contenidoFinal     = resolveTemplate(template.contenido, context)
  const variablesUsadas    = Object.fromEntries(
    extractVariables(template.contenido).map(token => {
      const key = token.replace(/[{}]/g, '')
      return [key, context[key] || null]
    })
  )
  const variablesFaltantes = getMissingVariables(template.contenido, context)
    .map(v => v.replace(/[{}]/g, ''))
  const advertencias = variablesFaltantes.map(v => `Dato faltante: ${v}`)
  return { contenidoFinal, variablesUsadas, variablesFaltantes, advertencias }
}

/**
 * jsonSchemaMini.ts (Deno)
 *
 * DUPLICADO MÍNIMO 1:1 (comentado) de la FUENTE DE VERDAD con tests Vitest:
 *   src/modules/tool-gateway/logic/jsonSchemaMini.js
 * Mismo patrón documentado en `simulador-tick/index.ts`: ninguna edge function
 * del proyecto importa desde `src/` (Deno Deploy no tiene el bundling de
 * Vite). Cualquier cambio de regla de negocio DEBE actualizarse en AMBOS
 * lugares — este archivo y el .js de src/modules/tool-gateway/logic/.
 */

// deno-lint-ignore no-explicit-any
type JsonSchema = any

function tipoDe(valor: unknown): string {
  if (valor === null || valor === undefined) return 'null'
  if (Array.isArray(valor)) return 'array'
  return typeof valor
}

function validarValor(schema: JsonSchema, valor: unknown, path: string, errores: string[]): void {
  if (!schema || typeof schema !== 'object') return

  if (schema.type) {
    const tipoReal = tipoDe(valor)
    const tipoEsperado = schema.type
    const tipoOk =
      tipoEsperado === 'object'
        ? tipoReal === 'object'
        : tipoEsperado === 'array'
          ? tipoReal === 'array'
          : tipoReal === tipoEsperado

    if (!tipoOk) {
      errores.push(`${path}: se esperaba tipo "${tipoEsperado}" pero se recibio "${tipoReal}"`)
      return
    }
  }

  if (schema.enum && !schema.enum.includes(valor)) {
    errores.push(`${path}: valor "${valor}" no esta permitido (enum: ${schema.enum.join(', ')})`)
  }

  if (typeof schema.minimum === 'number' && typeof valor === 'number' && valor < schema.minimum) {
    errores.push(`${path}: valor ${valor} es menor que el minimo permitido (${schema.minimum})`)
  }

  if (schema.type === 'object' && schema.properties) {
    if (Array.isArray(schema.required)) {
      for (const campoRequerido of schema.required) {
        if (valor === null || typeof valor !== 'object' || !(campoRequerido in (valor as Record<string, unknown>))) {
          errores.push(`${path}${path ? '.' : ''}${campoRequerido}: campo requerido faltante`)
        }
      }
    }
    if (valor && typeof valor === 'object') {
      for (const [clave, subSchema] of Object.entries(schema.properties as Record<string, JsonSchema>)) {
        if (clave in (valor as Record<string, unknown>)) {
          validarValor(subSchema, (valor as Record<string, unknown>)[clave], path ? `${path}.${clave}` : clave, errores)
        }
      }
    }
  }

  if (schema.type === 'array' && schema.items && Array.isArray(valor)) {
    valor.forEach((item, i) => validarValor(schema.items, item, `${path}[${i}]`, errores))
  }
}

export function validate(schema: JsonSchema, args: unknown): { ok: boolean; errors: string[] } {
  const errores: string[] = []
  validarValor(schema, args, '', errores)
  return { ok: errores.length === 0, errors: errores }
}

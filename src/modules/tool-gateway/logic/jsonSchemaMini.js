/**
 * jsonSchemaMini.js
 * Slice 2 — MCP Tool Gateway: validador JSON Schema subset propio.
 *
 * Cubre exactamente los constraints usados por los 9 `input_schema` del
 * catalogo (`20260708_tool_catalog_core.sql`): type (object/string/number/
 * array/boolean), required, properties, enum, minimum, items (recursivo para
 * arrays de string). NO es un validador JSON Schema completo — mismo patron
 * "self-contained, sin dependencias externas" que `hermes-crear-tarea` /
 * `simulador-tick` (design ADR#1: "implementacion minima propia, NO ajv/zod").
 *
 * Este archivo es la FUENTE DE VERDAD con tests Vitest. Se duplica 1:1,
 * comentado, en `supabase/functions/tool-gateway/jsonSchemaMini.ts` (Deno)
 * porque ninguna edge function del proyecto importa desde `src/` (mismo
 * precedente documentado en `simulador-tick/index.ts`).
 */

function tipoDe(valor) {
  if (valor === null || valor === undefined) return 'null'
  if (Array.isArray(valor)) return 'array'
  return typeof valor
}

/**
 * Valida `valor` contra `schema` (subset), acumulando errores en `errores`
 * con el `path` provisto para mensajes legibles (ej. "objetivos_pedagogicos[1]").
 */
function validarValor(schema, valor, path, errores) {
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
      return // sin tipo correcto no tiene sentido seguir validando este nodo
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
        if (valor === null || typeof valor !== 'object' || !(campoRequerido in valor)) {
          errores.push(`${path}${path ? '.' : ''}${campoRequerido}: campo requerido faltante`)
        }
      }
    }
    if (valor && typeof valor === 'object') {
      for (const [clave, subSchema] of Object.entries(schema.properties)) {
        if (clave in valor) {
          validarValor(subSchema, valor[clave], path ? `${path}.${clave}` : clave, errores)
        }
      }
    }
  }

  if (schema.type === 'array' && schema.items && Array.isArray(valor)) {
    valor.forEach((item, i) => validarValor(schema.items, item, `${path}[${i}]`, errores))
  }
}

/**
 * @param {object} schema - input_schema del catalogo (JSON Schema subset).
 * @param {*} args - argumentos recibidos en la tool_call.
 * @returns {{ok: boolean, errors: string[]}}
 */
export function validate(schema, args) {
  const errores = []
  validarValor(schema, args, '', errores)
  return { ok: errores.length === 0, errors: errores }
}

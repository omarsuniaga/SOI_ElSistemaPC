#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://zmhmdvmyeyswunurcyow.supabase.co'

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function checkTable(table, columns = []) {
  const result = {
    table,
    ok: false,
    count: null,
    error: null,
  }

  const selectExpr = columns.length ? columns.join(', ') : '*'
  const { count, error } = await supabase.from(table).select(selectExpr, { count: 'exact', head: true })

  if (error) {
    result.error = error.message
    return result
  }

  result.ok = true
  result.count = count
  return result
}

;(async () => {
  try {
    console.log('🔎 Verificando cierre académico ACM...\n')
    console.log(`URL: ${SUPABASE_URL}`)
    console.log(`Modo: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service-role' : 'anon-fallback'}\n`)

    const checks = [
      await checkTable('periodos', ['id', 'nombre', 'activo', 'cerrado', 'cerrado_at', 'cerrado_por', 'observaciones_cierre']),
      await checkTable('periodos_cierre_auditoria', ['id', 'periodo_id', 'fecha_inicio', 'fecha_fin', 'resumen', 'snapshot', 'created_at']),
    ]

    for (const item of checks) {
      if (item.ok) {
        console.log(`✅ ${item.table}: accesible (${item.count ?? 0} registros visibles)`)
      } else {
        console.log(`❌ ${item.table}: ${item.error}`)
      }
    }

    const rpcResult = await supabase.rpc('fn_cerrar_periodo_academico', {
      p_periodo_id: '00000000-0000-0000-0000-000000000000',
      p_fecha_inicio: null,
      p_fecha_fin: null,
      p_cerrado_por: null,
      p_observaciones: 'verificacion tecnica',
    })

    if (rpcResult.error) {
      console.log(`ℹ️ RPC fn_cerrar_periodo_academico responde: ${rpcResult.error.message}`)
    } else {
      console.log('✅ RPC fn_cerrar_periodo_academico disponible')
    }

    const hasFailure = checks.some((c) => !c.ok)
    process.exit(hasFailure ? 1 : 0)
  } catch (err) {
    console.error('💥 Error fatal:', err.message)
    process.exit(1)
  }
})()


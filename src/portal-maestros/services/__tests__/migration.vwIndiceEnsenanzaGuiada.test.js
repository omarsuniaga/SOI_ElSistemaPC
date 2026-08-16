import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * migration.vwIndiceEnsenanzaGuiada.test.js — Spec D-01/D-02
 * (openspec/changes/juego-gamificado-planificacion)
 *
 * Test de estructura: la vista agrega sesiones_clase.estado = 'registrada'
 * (confirmado con datos reales: 'programada'/'pendiente' son mayoritariamente
 * borrador=true) contra evaluacion_indicador cruzado por (clase_id, fecha)
 * — no hay FK directa sesion_id. El acceso está restringido vía
 * fn_get_indice_ensenanza_guiada() (SECURITY DEFINER, es_admin() OR
 * es_coordinador_acm()) porque la vista en sí, al ser propiedad de
 * `postgres`, bypassa RLS de las tablas base si se consultara directo.
 */

const MIGRATION_PATH = resolve(process.cwd(), 'supabase/migrations/20260816050000_vw_indice_ensenanza_guiada.sql')

let sql

beforeAll(() => {
  try {
    sql = readFileSync(MIGRATION_PATH, 'utf-8')
  } catch {
    sql = null
  }
})

describe('Migration: 20260816050000_vw_indice_ensenanza_guiada.sql', () => {
  it('should exist at the expected path', () => {
    expect(sql).not.toBeNull()
  })

  it('should have a commented DOWN block at the end of the file', () => {
    expect(sql).toMatch(/--\s*={5,}\s*\n--\s*DOWN\s*\n--\s*={5,}/i)
  })

  describe('vw_indice_ensenanza_guiada', () => {
    let viewSql

    beforeAll(() => {
      viewSql = sql.match(/CREATE OR REPLACE VIEW vw_indice_ensenanza_guiada AS[\s\S]*?GROUP BY sc\.maestro_id;/i)?.[0]
    })

    it('is defined', () => {
      expect(viewSql).toBeTruthy()
    })

    it('exposes the exact columns from design.md: maestro_id, total_sesiones, sesiones_con_indicador, indice', () => {
      expect(viewSql).toMatch(/sc\.maestro_id/i)
      expect(viewSql).toMatch(/AS total_sesiones/i)
      expect(viewSql).toMatch(/AS sesiones_con_indicador/i)
      expect(viewSql).toMatch(/AS indice/i)
    })

    it('only counts sesiones_clase WHERE estado = \'registrada\' (sesiones ya dictadas, no futuras/borrador)', () => {
      expect(viewSql).toMatch(/WHERE sc\.estado = 'registrada'/i)
    })

    it('cross-references evaluacion_indicador by (clase_id, fecha) — no direct sesion_id FK exists', () => {
      expect(viewSql).toMatch(/ei\.clase_id = sc\.clase_id/i)
      expect(viewSql).toMatch(/ei\.fecha_evaluacion::date = sc\.fecha/i)
    })

    it('only counts evaluations via maestro_indicador_id (Sistema B), not the legacy indicator_id column', () => {
      expect(viewSql).toMatch(/ei\.maestro_indicador_id IS NOT NULL/i)
    })

    it('computes indice as sesiones_con_indicador / NULLIF(total_sesiones, 0), matching design.md\'s Interfaces/Contracts', () => {
      expect(viewSql).toMatch(/NULLIF\(count\(DISTINCT sc\.id\), 0\)/i)
    })
  })

  describe('fn_get_indice_ensenanza_guiada', () => {
    let fnSql

    beforeAll(() => {
      fnSql = sql.match(/CREATE OR REPLACE FUNCTION fn_get_indice_ensenanza_guiada\(\)[\s\S]*?\$\$;/i)?.[0]
    })

    it('is defined with SECURITY DEFINER, returning SETOF the view', () => {
      expect(fnSql).toBeTruthy()
      expect(fnSql).toMatch(/RETURNS SETOF vw_indice_ensenanza_guiada/i)
      expect(fnSql).toMatch(/SECURITY DEFINER/i)
    })

    it('restricts access to es_admin() OR es_coordinador_acm(), raising an exception otherwise', () => {
      expect(fnSql).toMatch(/IF NOT \(es_admin\(\) OR es_coordinador_acm\(\)\) THEN/i)
      expect(fnSql).toMatch(/RAISE EXCEPTION/i)
    })

    it('returns rows from the view only after the authorization check', () => {
      expect(fnSql).toMatch(/RETURN QUERY SELECT \* FROM vw_indice_ensenanza_guiada/i)
    })
  })
})

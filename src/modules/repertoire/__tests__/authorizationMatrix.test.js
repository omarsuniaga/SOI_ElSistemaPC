import { describe, expect, it } from 'vitest'
import { REPERTOIRE_AUTHORIZATION_MATRIX, REPERTOIRE_CAPABILITIES, REPERTOIRE_TABLE_POLICY_AUDIT } from '../domain/authorizationMatrix.js'

describe('Repertoire authorization contract', () => {
  it('keeps Finanzas outside Repertoire capabilities', () => {
    expect(Object.values(REPERTOIRE_AUTHORIZATION_MATRIX.finanzas).every((value) => value === false)).toBe(true)
  })

  it('requires assignment or explicit academic scope for teacher-sensitive capabilities', () => {
    expect(REPERTOIRE_AUTHORIZATION_MATRIX.teacher.EDIT_PREPARATION).toBe('assigned')
    expect(REPERTOIRE_AUTHORIZATION_MATRIX.teacher.EDIT_STUDENT_OVERRIDE).toBe('assigned')
    expect(REPERTOIRE_AUTHORIZATION_MATRIX.acm.EDIT_PREPARATION).toBe('academic')
  })

  it('audits every Repertoire table without granting history deletion', () => {
    expect(REPERTOIRE_TABLE_POLICY_AUDIT.length).toBeGreaterThanOrEqual(22)
    expect(REPERTOIRE_TABLE_POLICY_AUDIT.find(({ table }) => table === 'montaje_preparacion_historial')).toMatchObject({ remove: 'none' })
    expect(REPERTOIRE_CAPABILITIES).toContain('ACK_SIGNAL')
  })
})

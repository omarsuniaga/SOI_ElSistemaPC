import {beforeEach,describe,expect,it} from 'vitest'
import { classifyCatalogAudit, clearCatalogAuditResults, getCatalogAuditResults, reportCatalogAudit, summarizeCatalogDiagnostics } from './catalogAudit.js'
describe('catalog audit memory store',()=>{
 beforeEach(()=>clearCatalogAuditResults())
 it('keeps only the latest result per portal without PII',()=>{reportCatalogAudit({portalId:'ACM',defaultRoute:'clases',registeredRoutes:['clases']});reportCatalogAudit({portalId:'ACM',defaultRoute:'clases',registeredRoutes:['clases']});expect(getCatalogAuditResults()).toHaveLength(1);expect(JSON.stringify(getCatalogAuditResults())).not.toContain('email')})
 it('aggregates issues and coverage',()=>{reportCatalogAudit({portalId:'ADM',defaultRoute:'alumnos',navGroups:[{items:[{id:'ghost'}]}],registeredRoutes:['alumnos']});const summary=summarizeCatalogDiagnostics();expect(summary.observedPortalCount).toBe(1);expect(summary.issueCount).toBeGreaterThan(0);expect(summary.helpCoverage).toBe(0)})
 it('distinguishes known catalog debt from broken defaults',()=>{const debt=reportCatalogAudit({portalId:'ACM',defaultRoute:'clases',navGroups:[{items:[{id:'ghost'}]}],registeredRoutes:['clases','ghost']});expect(classifyCatalogAudit(debt)).toBe('DEUDA_CONOCIDA');const broken=reportCatalogAudit({portalId:'ADM',defaultRoute:'alumnos',registeredRoutes:[]});expect(classifyCatalogAudit(broken)).toBe('ROTO')})
 it('surfaces observed legacy routes as candidates instead of a broken portal',()=>{const candidate=reportCatalogAudit({portalId:'ACM',defaultRoute:'clases',registeredRoutes:['clases','periodos-academicos']});expect(candidate.legacyCandidateRoutes).toEqual(['periodos-academicos']);expect(classifyCatalogAudit(candidate)).toBe('CANDIDATOS')})
})

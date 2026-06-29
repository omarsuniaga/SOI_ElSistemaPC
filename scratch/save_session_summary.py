import sqlite3
import datetime
import uuid

db_file = r"C:\Users\omare\.engram\engram.db"
obs_topic = "sessions/last-summary"
obs_title = "Session Summary: MVP1 Weekly Plans & Decoupled Semaphore UI"
project = "soi_elsistemapc"

summary_content = """# Session Summary

## Goal
Implement the initial weekly plans and the semantic semaphore grid for the Academics and Teacher Portal under the new automatic autonomous mode.

## Accomplished
1. **Decoupled database queries**: Created `weeklyPlanAdapter.js`, `weeklyPlanMock.js`, and `weeklyPlanSupabase.js` to decouple Supabase queries from UI, conforming to the project's DataAdapter pattern.
2. **Weekly planning mockup**: Wrote `acm_weekly_plans.json` containing the schedule (weeks 1 to 6) of Violin N0 (OSPC Guide V2.0) and Language Music (Manuel's guide) for demo mode.
3. **Interactive Weekly UI**: Refactored `PlanificationCard.js` to render a premium interactive week-by-week navigator containing themes, objectives, strategies, and evidence.
4. **Semantic Semaphore Grid**: Rewrote `studentProgressPanel.js` to render a 6-state semaphore grid (`not_started`, `worked`, `in_process`, `achieved`, `needs_reinforcement`, `failed`, `exceeded`) and persist student qualifications through the unified adapter.
5. **Operational Student CTAs**: Injected hover-revealed CTAs (Ver Perfil, Evaluar Indicador, Registrar Evidencia) directly in the student rows of the Pedagogical Map traceability panel (`mapaPedagogicoPanel.js`), opening evaluation and evidence modals linked to `weeklyPlanAdapter`.
6. **OpenPencil Design Integration (Design-as-Code)**: Established the workflow standard in `OPENPENCIL_WORKFLOW.md` and designed 3 vector layouts (`mapa_pedagogico_trazabilidad.op`, `login_view.op`, `hoy_view.op`).
7. **Design Compilation Engine Optimizations**:
   - Implemented an exclusion list (`excludedIds`) in `compile_design.js` to filter out redundant vector placeholder labels and button text nodes, preventing them from superposing and blocking HTML input typing.
   - Added automatic injection of real interactive inner contents and icons (like `pm-btn-loader` spinners, eye icons, and biometric fingerprint layouts) based on design element IDs.
   - Injected auto-generated CSS media queries for high-fidelity responsive layouts on mobile viewports.
   - Refactored tablet and mobile layouts (`max-width: 1024px`) to discard absolute positioning in favor of a fluid relative Flexbox flow, adapting components vertically to any viewport width and orientation.
   - Repositioned the branding elements (logo, title, subtitle) relative and centered above the login card on mobile/tablet viewports to form a native Hero banner.
   - Nested all input fields, checkboxes, labels, and buttons inside the children array of `rect-login-card` in the design file, ensuring the generated DOM correctly nests controls within the visual background card container, eliminating empty spatial boxes on responsive reflows.
8. **Restored Original SOI Branding**:
   - Reverted Dribbble layout clone.
   - Restored the canvas background `#0f172a` and card background `#1e293b`.
   - Re-established the brand left-side hero layout with the `linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)` blue gradient and the standard white/translucent circular logo.
   - Re-implemented the standard inputs background `rgba(255, 255, 255, 0.02)` and the primary blue button `#3b82f6` with hover states.
   - Maintained all nesting structural corrections to preserve 100% responsive fluid stacking for tablets.
9. **UI Specification Prompt**: Designed and committed `login_ui_spec_prompt.md` containing a professional, production-ready specification of requirements for the login portal.
10. **Hermes & WhatsApp Security Specification**: Designed and committed `hermes_whatsapp_architecture_spec.md` which establishes parent-child distributed agent navigation loops, Anti-Ban message scheduling delays, and Prompt Injection firewall parameters.
11. **Obsidian Link Graph Auditor**: Created and optimized `audit_obsidian_graph.py` which parses Wikilinks, filters out legacy `SOI_QUARANTINE_BACKUP` noise, and lists active orphan nodes grouped by department.
12. **Gemma Graph Resolution**: Updated the index in `00_HOME.md` to link all 11 Gemma files, successfully resolving their orphan status and boosting the active vault's Graph Cohesion Score from 37.34% to 41.91%.
13. **Agent Lector de Portales (AGT-PORTAL)**: Executed the observer agent protocol, producing `SOI_INVENTARIO_Y_RELACION_PORTALES_V9.md` mapping the 5 active unified web portals.
14. **Document Normalization (AGT-NORM)**: Designed and executed `normalize_doc_headers.py` in production mode over the entire Obsidian vault. Standardized the YAML frontmatter (ID, type, department, owner, paths, backlinks) for 194 active markdown files.
15. **Real Login Refactor**: Integrated the compiled template inside the production `loginView.js` view. Event listeners, validation rules, error tracking, and biometric auth remain fully active on top of the newly generated OpenPencil markup.
16. **Build Fixes**: Resolved missing mock/production exports in `weeklyPlanAdapter.js`, `weeklyPlanMock.js`, and `weeklyPlanSupabase.js` for curriculum versioning methods.
17. **Git Hygiene**: Committed changes to local branch `feat/acm-ruta-academica-mvp1` using conventional commits.

## Next Steps
- Implement the admin planning matrix panel in the Academics (ACM) Portal to assign these weekly schedules.
- Connect real Supabase tables for weekly schedules to production.

## Relevant Files
- `src/portal-maestros/views/loginView.js`
- `src/portal-maestros/views/templates/loginDesignTemplate.js`
- `scripts/compile_design.js`
- `src/modules/planificacion/api/weeklyPlanAdapter.js`"""

now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
new_sync_id = f"obs-{uuid.uuid4().hex[:16]}"
session_id = "ses_0fea2ce80ffeEGXnNpVoFlT2uF"

try:
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM observations WHERE topic_key = ? AND project = ?;", (obs_topic, project))
    cursor.execute("""
        INSERT INTO observations (type, title, topic_key, content, scope, project, sync_id, session_id, created_at, updated_at, last_seen_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, ("session_summary", obs_title, obs_topic, summary_content, "project", project, new_sync_id, session_id, now_str, now_str, now_str))
    conn.commit()
    conn.close()
    print("Session summary successfully updated in Engram.")
except Exception as e:
    print(f"Error saving session summary: {e}")

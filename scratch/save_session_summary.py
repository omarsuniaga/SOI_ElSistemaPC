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
5. **Git Hygiene**: Committed changes to local branch `feat/acm-ruta-academica-mvp1` using conventional commits.

## Next Steps
- Implement the admin planning matrix panel in the Academics (ACM) Portal to assign these weekly schedules.
- Connect real Supabase tables for weekly schedules to production.

## Relevant Files
- `src/portal-maestros/components/studentProgressPanel.js`
- `src/portal-maestros/components/attendance/PlanificationCard.js`
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
    print("Session summary successfully recorded in Engram.")
except Exception as e:
    print(f"Error saving session summary: {e}")

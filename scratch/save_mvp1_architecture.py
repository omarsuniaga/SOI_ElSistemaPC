import sqlite3
import datetime
import uuid

db_file = r"C:\Users\omare\.engram\engram.db"
obs_topic = "sdd/SP-ACM-CURRICULUM-ROUTES-INGEST-V1/architecture"
obs_title = "Architectural Decision: DataAdapter decoupling & Weekly Semaphore UI"
project = "soi_elsistemapc"

content = """**Decision**: Decouple Supabase direct database calls from UI components and migrate to weekly semantic semaphore.

**Details**:
1. **DataAdapter Integration**: Replaced direct Supabase RPC calls (`ensure_session_and_save_evaluation`) and table selects on `indicators` and `indicator_attempts` inside `studentProgressPanel.js` with `weeklyPlanAdapter.js`.
2. **Weekly Card Navigator**: Refactored `PlanificationCard.js` to render an interactive, paginated schedule (weeks 1 to 6) containing class topics, objectives, and methodological strategies from OSPC Violin Guide V2.0, instead of a static indicator list.
3. **Semantic Semaphore Grid**: Migrated evaluation from numeric grades (0-5) to the 6-state semantic criteria (`not_started`, `worked`, `in_process`, `achieved`, `needs_reinforcement`, `failed`, `exceeded`) in the student progress panel and evaluation modals.

**Where**:
- `src/portal-maestros/components/attendance/PlanificationCard.js`
- `src/portal-maestros/components/studentProgressPanel.js`
- `src/modules/planificacion/api/weeklyPlanAdapter.js`
- `src/modules/planificacion/api/weeklyPlanMock.js`
- `src/modules/planificacion/api/weeklyPlanSupabase.js`"""

now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
new_sync_id = f"obs-{uuid.uuid4().hex[:16]}"
session_id = "ses_0fea2ce80ffeEGXnNpVoFlT2uF"

print(f"Connecting to engram DB: {db_file}...")

try:
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    # Clean previous if exists
    cursor.execute("DELETE FROM observations WHERE topic_key = ? AND project = ?;", (obs_topic, project))
    
    # Insert new
    cursor.execute("""
        INSERT INTO observations (type, title, topic_key, content, scope, project, sync_id, session_id, created_at, updated_at, last_seen_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, ("architecture", obs_title, obs_topic, content, "project", project, new_sync_id, session_id, now_str, now_str, now_str))
    
    conn.commit()
    conn.close()
    print("Architectural decision successfully recorded in Engram.")
except Exception as e:
    print(f"Error saving to Engram: {e}")

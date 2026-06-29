import sqlite3
import datetime
import uuid

db_file = r"C:\Users\omare\.engram\engram.db"
obs_topic = "sdd/SP-ACM-CURRICULUM-ROUTES-INGEST-V1/student-ctas"
obs_title = "Architectural Decision: Operational Student CTAs from Pedagogical Map"
project = "soi_elsistemapc"

content = """**Decision**: Add operational call-to-actions (CTAs) for individual students directly inside the Pedagogical Map traceability panel.

**Details**:
1. **Student Row Actions**: Injected 3 hover-revealed operational buttons for each student row in `mapaPedagogicoPanel.js`:
   - *Profile Link*: Redirects natively to `#/alumno/${studentId}` inside the teacher app.
   - *Interactive Evaluation*: Opens an `AppModal` with the 6-state semantic semaphore grid (`not_started`, `in_process`, `achieved`, `needs_reinforcement`, `failed`, `exceeded`) and saves attempts via `weeklyPlanAdapter`.
   - *Evidence Upload*: Opens a targeted modal to register evidence URLs and comments for the indicator.
2. **Reactiveness**: Triggers `reloadHierarchy()` immediately after modal operations to update aggregation stats and semaphore tone badges on save.
3. **Styles**: Injected premium action-button CSS layouts (`.pm-mapa-student-actions` and `.pm-mapa-action-btn`) with smooth transitions on row hover.

**Where**:
- `src/modules/planificacion/components/mapaPedagogicoPanel.js`"""

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
    """, ("architecture", obs_title, obs_topic, content, "project", project, new_sync_id, session_id, now_str, now_str, now_str))
    conn.commit()
    conn.close()
    print("Student CTAs decision successfully recorded in Engram.")
except Exception as e:
    print(f"Error saving to Engram: {e}")

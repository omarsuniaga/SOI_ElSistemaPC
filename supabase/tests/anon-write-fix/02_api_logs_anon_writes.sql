-- Run in: Supabase Dashboard > Logs > Logs Explorer (this queries the API LOG STORE, not your tables).
-- Purpose: BEFORE applying the migration, find out whether any real client writes to the eight tables
-- through the public API, and with which key. Anything legitimate that shows up here must be
-- re-checked against the new policies (see RUNBOOK, "Antes de aplicar").
-- Log field names can vary slightly between Supabase versions; adjust if the explorer rejects a column.
select
  timestamp,
  request.method      as method,
  request.path        as path,
  response.status_code as status,
  request.headers.user_agent as user_agent
from edge_logs
  cross join unnest(metadata) as m
  cross join unnest(m.request) as request
  cross join unnest(m.response) as response
where request.method in ('POST', 'PATCH', 'PUT', 'DELETE')
  and regexp_contains(
        request.path,
        r'/rest/v1/(programas|salones|horarios|class_events|class_event_methodology|homework_assignments|planned_content|notificaciones_asistencia)')
order by timestamp desc
limit 500;

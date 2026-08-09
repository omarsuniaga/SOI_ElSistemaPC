-- ============================================================================
-- periodos: garantizar a nivel de base de datos que nunca haya dos períodos
-- académicos activos a la vez
-- Fecha: 2026-08-09
--
-- Contexto: `fn_activar_periodo` (20260726_asistencia_docente_y_rls_periodos.sql)
-- ya hace la transición segura (desactiva el anterior, activa el nuevo, en
-- una sola transacción). Pero `crearPeriodo()` (periodosApi.js) permite
-- crear un período directamente con `activo = true` vía INSERT plano —
-- usado por el checkbox "Marcar como período activo" del modal de creación
-- (periodosView.js). Sin ningún constraint que lo impida, si ya había OTRO
-- período activo, la base terminaba con DOS filas `activo = true`
-- simultáneas. `getPeriodoActivo()` usa `.single()`, que lanza error apenas
-- hay más de una fila — el error se traga silenciosamente y se trata como
-- "sin período activo", por lo que cualquier pantalla que dependa del
-- período activo (historial del alumno, notificaciones, cumplimiento de
-- asistencia) deja de filtrar nada, sin ningún aviso.
--
-- El código cliente ya se corrigió para pasar siempre por
-- `activarPeriodoAtomico`, pero este índice es la protección real: hace que
-- CUALQUIER intento futuro de dejar dos períodos activos falle de forma
-- ruidosa e inmediata (23505 unique_violation) en vez de corromper el
-- estado en silencio, sin importar qué código lo intente.
-- ============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_periodos_unico_activo
  ON public.periodos ((activo))
  WHERE activo = true;

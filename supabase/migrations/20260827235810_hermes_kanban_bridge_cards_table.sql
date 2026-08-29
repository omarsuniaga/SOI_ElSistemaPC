-- Fase 1 del puente Hermes Kanban <-> portales SOI.
-- Tabla AISLADA de solo-espejo: la llena la edge fn hermes-kanban-ingest
-- (service_role) desde un poller que corre en la maquina Hermes; el portal
-- solo la LEE. No hay FK, ni trigger, ni relacion con tablas existentes.
-- Convencion RLS igual que tareas_institucionales / hermes_protocolos:
-- SELECT authenticated, escritura solo es_admin(), anon revocado.

CREATE TABLE IF NOT EXISTS public.hermes_kanban_cards (
  card_id            text PRIMARY KEY,
  board              text,
  title              text NOT NULL,
  status             text NOT NULL,
  assignee           text,
  priority           integer,
  summary            text,
  hermes_updated_at  timestamptz,
  synced_at          timestamptz NOT NULL DEFAULT now(),
  raw                jsonb
);

COMMENT ON TABLE public.hermes_kanban_cards IS
  'Espejo read-only de tarjetas del Kanban de Hermes (~/.hermes/kanban.db). Escrita por edge fn hermes-kanban-ingest via poller. Fase 1 puente Hermes<->SOI.';

CREATE INDEX IF NOT EXISTS idx_hermes_kanban_cards_status ON public.hermes_kanban_cards (status);
CREATE INDEX IF NOT EXISTS idx_hermes_kanban_cards_synced_at ON public.hermes_kanban_cards (synced_at DESC);

ALTER TABLE public.hermes_kanban_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY hermes_kanban_cards_auth_read ON public.hermes_kanban_cards
  FOR SELECT TO authenticated USING (true);
CREATE POLICY hermes_kanban_cards_admin_write ON public.hermes_kanban_cards
  FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());

REVOKE ALL ON public.hermes_kanban_cards FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hermes_kanban_cards TO authenticated;

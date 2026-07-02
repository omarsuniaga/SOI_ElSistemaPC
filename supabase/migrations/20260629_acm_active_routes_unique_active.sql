-- Hardening ACM active routes:
-- enforce exactly one active curricular route per class/group.

CREATE UNIQUE INDEX IF NOT EXISTS idx_acm_active_routes_one_active_per_group
ON public.acm_active_routes(group_id)
WHERE status = 'active';

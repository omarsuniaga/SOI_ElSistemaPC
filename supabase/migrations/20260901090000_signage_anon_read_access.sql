-- ═══════════════════════════════════════════════════════════════════════════
-- Signage — acceso de lectura ANÓNIMO
-- ═══════════════════════════════════════════════════════════════════════════
-- La señalética del vestíbulo corre en una Raspberry Pi Zero W: ARMv6, ~430 MB
-- RAM, sin Node. No puede mantener una sesión de auth de Supabase; lee con la
-- anon key. Todo el contenido signage_* es de exhibición pública (se muestra en
-- una pared del hall), así que se abre lectura anónima SOLO a estas
-- vistas/tablas y se hace público el bucket de medios.
-- Sigue sin tocar ninguna tabla ni política de SOI.
-- ═══════════════════════════════════════════════════════════════════════════

drop policy if exists signage_pantallas_anon_read on public.signage_pantallas;
drop policy if exists signage_media_anon_read     on public.signage_media;
create policy signage_pantallas_anon_read on public.signage_pantallas
  for select to anon using (true);
create policy signage_media_anon_read on public.signage_media
  for select to anon using (true);

grant select on public.signage_pantallas to anon;
grant select on public.signage_media     to anon;

grant select on
  public.signage_v_horario_semana,
  public.signage_v_horario_hoy,
  public.signage_v_horario_manana,
  public.signage_v_calendario_mes
to anon;

update storage.buckets set public = true where id = 'signage';

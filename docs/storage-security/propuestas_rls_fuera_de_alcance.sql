-- PROPUESTAS — NO se ejecutan automáticamente y NO forman parte de supabase/migrations.
-- Requieren revisión y autorización explícita antes de aplicarse en producción.
--
-- Origen: auditoría RLS del 2026-10-17 (ver AUDITORIA_Y_PLAN_DESPLIEGUE.md, sección 5).

-- ═══════════════════════════════════════════════════════════════════════════════════
-- A. CRÍTICO — Escritura anónima en 8 tablas (rol `public` con USING/CHECK true)
-- ═══════════════════════════════════════════════════════════════════════════════════
-- Hoy cualquiera con la clave pública (anon key, visible en el frontend) puede insertar,
-- modificar y borrar filas en estas tablas. El paso mínimo y reversible es limitar esas
-- políticas de ESCRITURA al rol `authenticated`, sin cambiar las de lectura (la cartelera
-- pública y las vistas anónimas siguen leyendo igual) y sin cambiar lo que ya pueden hacer
-- los usuarios con sesión. Un segundo paso (restringir por rol/propiedad) requiere decidir
-- quién puede escribir cada tabla.
--
-- Antes de aplicar: confirmar que ningún flujo SIN sesión escribe en estas tablas
-- (formularios públicos, cron con anon key, Raspberry Pi, edge functions con anon key).

begin;

alter policy "cem_delete_all"            on public.class_event_methodology to authenticated;
alter policy "cem_insert_all"            on public.class_event_methodology to authenticated;
alter policy "cem_update_all"            on public.class_event_methodology to authenticated;

alter policy "ce_delete_all"             on public.class_events to authenticated;
alter policy "ce_insert_all"             on public.class_events to authenticated;
alter policy "ce_update_all"             on public.class_events to authenticated;

alter policy "hw_delete_all"             on public.homework_assignments to authenticated;
alter policy "hw_insert_all"             on public.homework_assignments to authenticated;
alter policy "hw_update_all"             on public.homework_assignments to authenticated;

alter policy "Permitir actualizar horarios" on public.horarios to authenticated;
alter policy "Permitir crear horarios"      on public.horarios to authenticated;
alter policy "Permitir eliminar horarios"   on public.horarios to authenticated;

alter policy "planned_content_delete_all" on public.planned_content to authenticated;
alter policy "planned_content_insert_all" on public.planned_content to authenticated;
alter policy "planned_content_update_all" on public.planned_content to authenticated;

alter policy "Permitir actualizar programas" on public.programas to authenticated;
alter policy "Permitir crear programas"      on public.programas to authenticated;
alter policy "Permitir eliminar programas"   on public.programas to authenticated;

alter policy "Permitir actualizar salones" on public.salones to authenticated;
alter policy "Permitir crear salones"      on public.salones to authenticated;
alter policy "Permitir eliminar salones"   on public.salones to authenticated;

alter policy "hermes_update_notifications" on public.notificaciones_asistencia to authenticated;

-- Verificación posterior (debe devolver 0 filas):
--   select tablename, policyname from pg_policies
--   where schemaname = 'public' and roles::text ~ '(public|anon)'
--     and cmd in ('INSERT','UPDATE','DELETE','ALL') and (qual = 'true' or with_check = 'true');

commit;

-- Reversión de A: repetir cada ALTER POLICY con `to public`.

-- ═══════════════════════════════════════════════════════════════════════════════════
-- B. ALTO — tareas_institucionales: política `tareas_auth_all` (ALL, authenticated, true)
-- ═══════════════════════════════════════════════════════════════════════════════════
-- Cualquier usuario con sesión (incluidos roles alumno / representante) puede leer y
-- modificar todas las tareas institucionales. Se propone, tras confirmar con Hermes qué
-- roles operan tareas, algo como:
--
--   drop policy "tareas_auth_all" on public.tareas_institucionales;
--   create policy tareas_staff_all on public.tareas_institucionales for all to authenticated
--     using (public.es_admin_estricto()) with check (public.es_admin_estricto());
--
-- (requiere que la migración de Storage —que crea es_admin_estricto()— ya esté aplicada,
-- y ampliar a los roles que usan Hermes: p. ej. direccion, coordinacion_academica).
-- En total 51 tablas tienen 64 políticas de escritura para `authenticated` con `true` (cualquier usuario con sesión).

-- ═══════════════════════════════════════════════════════════════════════════════════
-- C. MEDIO — es_admin() y el rol 'inventarista'
-- ═══════════════════════════════════════════════════════════════════════════════════
-- Estado: es_admin() = rol IN ('admin','inventarista') y se usa en 194 políticas de 122
-- tablas. El CHECK de profiles.rol NO admite 'inventarista' (0 filas, no asignable), pero
-- el portal de inventario (src/portales/inventario/inventario.js) lo trata como rol válido.
-- Decisión necesaria — elegir UNA opción:
--
--  (1) 'inventarista' NO existirá: dejar es_admin() solo con 'admin'. Es un no-op hoy:
--
--        create or replace function public.es_admin() returns boolean
--        language plpgsql security definer set search_path = public, pg_temp as $$
--        declare v_role text;
--        begin
--          select p.rol into v_role from public.profiles p where p.id = auth.uid();
--          return coalesce(v_role = 'admin', false);
--        end $$;
--
--  (2) 'inventarista' SÍ existirá: añadirlo al CHECK y crear es_inventarista() acotada a las
--      tablas de inventario/luthería, dejando es_admin() solo para 'admin'. NO añadirlo al
--      CHECK mientras es_admin() lo incluya: heredaría 194 políticas (acceso a casi todo).
--
-- Mientras tanto, las políticas de Storage sensibles usan es_admin_estricto().

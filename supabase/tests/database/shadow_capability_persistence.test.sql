BEGIN;
SELECT plan(19);

SELECT has_table('public', 'shadow_capability_proposals');
SELECT has_table('public', 'shadow_capability_audit_events');
SELECT has_function('public', 'create_shadow_capability_proposal', ARRAY['jsonb', 'uuid']);
SELECT has_function('public', 'transition_shadow_capability_proposal', ARRAY['uuid', 'text', 'integer', 'uuid']);

INSERT INTO auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data)
VALUES
 ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@test.local', '{}', '{}'),
 ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'teacher@test.local', '{}', '{"rol":"admin"}'),
 ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'super@test.local', '{}', '{}')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, nombre_completo, rol, estado)
VALUES
 ('10000000-0000-0000-0000-000000000001', 'admin@test.local', 'Admin Test', 'admin', 'activo'),
 ('10000000-0000-0000-0000-000000000002', 'teacher@test.local', 'Teacher Test', 'maestro', 'activo'),
 ('10000000-0000-0000-0000-000000000003', 'super@test.local', 'Super Test', 'superadmin', 'activo')
ON CONFLICT (id) DO UPDATE SET rol = EXCLUDED.rol;

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claim.sub', '', true);
SELECT throws_ok($$ SELECT public.create_shadow_capability_proposal('{}', '20000000-0000-0000-0000-000000000000') $$, '42501');
SELECT throws_ok($$ INSERT INTO public.shadow_capability_proposals(change_id,portal_id,module_id,capability_id,operation,reason_code,created_by) VALUES ('shadow-anon','ACM','clases','read','propose-enable','catalog-owner','10000000-0000-0000-0000-000000000002') $$, '42501');
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.role', 'authenticated', true);
SELECT set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
SELECT throws_ok($$ SELECT public.create_shadow_capability_proposal('{}', '20000000-0000-0000-0000-000000000001') $$, '42501');
SELECT is((SELECT count(*) FROM public.shadow_capability_proposals), 0::bigint, 'metadata-only admin cannot read proposals');
SELECT throws_ok($$ INSERT INTO public.shadow_capability_proposals(change_id,portal_id,module_id,capability_id,operation,reason_code,created_by) VALUES ('shadow-direct','ACM','clases','read','propose-enable','catalog-owner','10000000-0000-0000-0000-000000000002') $$, '42501');

SELECT set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
SELECT lives_ok($$ SELECT public.create_shadow_capability_proposal('{"changeId":"shadow-local-test","portalId":"ACM","moduleId":"clases","capabilityId":"write","operation":"propose-enable","reasonCode":"catalog-owner","rollbackPlan":{"strategy":"discard-proposal","verification":"navigation-smoke"}}', '20000000-0000-0000-0000-000000000002') $$);
SELECT is((SELECT count(*) FROM public.shadow_capability_proposals WHERE change_id='shadow-local-test'), 1::bigint, 'admin creates one proposal');
SELECT lives_ok($$ SELECT public.create_shadow_capability_proposal('{"changeId":"shadow-local-test","portalId":"ACM","moduleId":"clases","capabilityId":"write","operation":"propose-enable","reasonCode":"catalog-owner","rollbackPlan":{"strategy":"discard-proposal","verification":"navigation-smoke"}}', '20000000-0000-0000-0000-000000000002') $$);
SELECT is((SELECT count(*) FROM public.shadow_capability_audit_events WHERE request_key='20000000-0000-0000-0000-000000000002'), 1::bigint, 'same request key is idempotent');
SELECT lives_ok($$ SELECT public.transition_shadow_capability_proposal((SELECT id FROM public.shadow_capability_proposals WHERE change_id='shadow-local-test'),'submit',1,'20000000-0000-0000-0000-000000000003') $$);
SELECT throws_ok($$ SELECT public.transition_shadow_capability_proposal((SELECT id FROM public.shadow_capability_proposals WHERE change_id='shadow-local-test'),'reject',1,'20000000-0000-0000-0000-000000000004') $$, '40001');
SELECT throws_ok($$ UPDATE public.shadow_capability_audit_events SET action='reject' WHERE request_key='20000000-0000-0000-0000-000000000003' $$, '42501');
SELECT throws_ok($$ DELETE FROM public.shadow_capability_audit_events WHERE request_key='20000000-0000-0000-0000-000000000003' $$, '42501');

SELECT set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
SELECT ok(public.is_admin(), 'superadmin is recognized by canonical helper');
SELECT lives_ok($$ SELECT public.create_shadow_capability_proposal('{"changeId":"shadow-super-test","portalId":"ADM","moduleId":"clases","capabilityId":"read","operation":"propose-enable","reasonCode":"operational-review"}', '20000000-0000-0000-0000-000000000005') $$);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;

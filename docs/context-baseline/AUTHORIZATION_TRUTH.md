# AUTHORIZATION TRUTH — Análisis de RLS, Roles y Brechas de Seguridad

> **Fuente:** Supabase `zmhmdvmyeyswunurcyow` (`policies.json`, `functions_triggers.json`, `security_advisors.json`)
> **Fecha:** 10 sep 2026

## 1. Resumen de Seguridad RLS

- **Total Políticas RLS Activas:** 591
- **Tablas con RLS Deshabilitada:** 0 (Todas las 216 tablas base tienen RLS habilitada formalmente)
- **Funciones `SECURITY DEFINER`:** 127 de 263 funciones

## 2. Hallazgos Críticos y Brechas de Autorización

### 2.1 Políticas Permisivas Inseguras (`USING (true)`)
Se detectaron tablas donde usuarios `authenticated` o incluso `public` tienen acceso total irrestricto:
- `conversaciones_whatsapp`: Política `allow_all_conversaciones` FOR ALL TO `public` USING `(true)` WITH CHECK `(true)`. **Riesgo:** Exposición total de mensajes de WhatsApp.
- `alertas_log`: Política `alertas_log_authenticated_all` FOR ALL TO `authenticated` USING `(true)`.
- `calendario_institucional`: Política `calendario_auth_all` FOR ALL TO `authenticated` USING `(true)`.
- `alumnos`: Política `alumnos_read_all` FOR SELECT TO `public` USING `(true)`. **Riesgo PII:** Cualquier usuario no autenticado o cliente anon puede leer el padrón completo de alumnos si conoce la URL de Supabase.

### 2.2 Dependencia Excesiva de `SECURITY DEFINER`
127 funciones corren como `SECURITY DEFINER` (con permisos de superusuario de base de datos), bypassando RLS. Si bien es necesario para operaciones transaccionales como `fn_fusionar_alumnos_duplicados` o `fn_registrar_pago_transaccional`, varias funciones no validan internamente `auth.uid()` ni el rol, delegando la seguridad al frontend.

### 2.3 Tablas con `service_role` Bypasses
Tablas como `hermes_inbox`, `soi_event_bus`, `applicant_events` están restringidas exclusivamente a `service_role`. Esto es correcto para colas internas, pero exige que los Webhooks y Edge Functions gestionen la clave de servicio de forma segura.

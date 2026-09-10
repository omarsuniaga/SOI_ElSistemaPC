# RESTORE SOP — Procedimiento Operativo Estándar para Respaldo y Recuperación ante Desastres (DR)

> **Fecha:** 10 de Septiembre de 2026  
> **Ámbito:** SOI v1.x LTS Operations  
> **Proyecto:** `SOI_DDBB_EL_SISTEMAPC` (`zmhmdvmyeyswunurcyow`)  
> **RPO Objetivo (Recovery Point Objective):** $\le$ 24 horas (diario)  
> **RTO Objetivo (Recovery Time Objective):** $\le$ 30 minutos  

---

## 1. Política de Respaldos (Backups)

1. **Backups Automáticos Gestionados por Supabase**:
   - Snapshot diario de PostgreSQL en la nube (Point-in-Time Recovery disponible en planes Pro/Enterprise).
2. **Backups Lógicos Periódicos (CLI / DDL)**:
   - DDL canónico congelado en el repositorio: `database/schema_reference_2026-09-10.sql`.
   - Snapshots de introspección de esquema en `docs/context-baseline/_raw/`.
3. **Respaldo de Datos Críticos (PII y Finanzas)**:
   - Tablas de resguardo prioritario: `alumnos`, `familias`, `representantes`, `asistencias`, `sesiones_clase`, `cuotas`, `pagos`, `inventario_activos`, `comodatos_activos`.

---

## 2. Procedimiento de Restauración Paso a Paso (Runbook)

En caso de incidente catastrófico (pérdida de datos, corrupción por migración errónea o indisponibilidad de instancia):

### Paso 1: Notificación y Congelación de Tráfico
1. Activar pantalla de mantenimiento o revocar temporalmente la URL en Netlify:
   ```bash
   # Vía Netlify CLI o variables de entorno
   netlify env:set VITE_MAINTENANCE_MODE true
   ```
2. Detener cron jobs en Supabase para evitar escrituras automáticas:
   ```sql
   SELECT cron.unschedule(jobname) FROM cron.job;
   ```

### Paso 2: Evaluación del Punto de Recuperación
- **Opción A (Dashboard de Supabase - Point in Time Recovery)**:
  1. Ingresar a https://supabase.com/dashboard/project/zmhmdvmyeyswunurcyow/database/backups.
  2. Seleccionar el snapshot previo a la hora del incidente.
  3. Ejecutar "Restore to this point".
- **Opción B (Restauración Lógica vía `psql`)**:
  Si se requiere restaurar una réplica limpia o ambiente de contingencia:
  ```bash
  # Restaurar el esquema base
  psql "$DATABASE_URL" -f database/schema_reference_2026-09-10.sql
  
  # Aplicar migraciones de hardening v1 LTS
  psql "$DATABASE_URL" -f supabase/migrations/20260910170000_harden_rls_and_security_definer_v1_lts.sql
  ```

### Paso 3: Verificación de Integridad Post-Restauración
Ejecutar la consulta de verificación de invariantes y conteos:
```sql
SELECT 
  (SELECT count(*) FROM public.alumnos) AS total_alumnos,
  (SELECT count(*) FROM public.asistencias) AS total_asistencias,
  (SELECT count(*) FROM public.clases) AS total_clases,
  (SELECT count(*) FROM public.cuotas) AS total_cuotas,
  (SELECT count(*) FROM public.inventario_activos) AS total_activos;
```
Los valores deben coincidir con la línea base conocida (~342 alumnos, ~2.812 asistencias, ~46 clases, ~324 activos).

### Paso 4: Reapertura y Reanudación de Servicios
1. Desactivar modo de mantenimiento en frontend.
2. Reactivar tareas programadas de `pg_cron`.
3. Informar al equipo de Dirección y Coordinación Académica.

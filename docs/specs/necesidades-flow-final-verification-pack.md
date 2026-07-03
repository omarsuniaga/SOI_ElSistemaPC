# Paquete operativo final — Cierre del flujo de necesidades

Fecha: 2026-07-02

Este documento reúne el orden exacto para ejecutar la verificación productiva y capturar evidencia de cierre.

## Orden de ejecución

### Paso 1 — Aplicar migraciones
Ejecutar en Supabase:
```bash
supabase db query --linked --file supabase/migrations/20260702_solicitudes_necesidades_flow.sql
supabase db query --linked --file supabase/migrations/20260702_solicitudes_necesidades_rls_hardening.sql
```

### Paso 2 — Verificar esquema
Consultar:
```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'solicitudes_necesidades'
order by ordinal_position;
```

Validar:
- `correlation_id`
- `link_tienda`
- `costo_estimado`
- `presupuesto`
- `departamento_actual`
- `pre_aprobada_por`
- `presupuestado_por`

### Paso 3 — Verificar trigger Hermes
Consultar:
```sql
select tgname
from pg_trigger
where tgrelid = 'public.solicitudes_necesidades'::regclass;
```

Validar que exista `trg_solicitudes_necesidades_open_case`.

### Paso 4 — Crear una solicitud de prueba
Desde el portal del maestro:
- crear una solicitud nueva,
- registrar el `id`,
- confirmar `estado = 'pendiente'`.

### Paso 5 — Verificar caso Hermes
Consultar la fila creada:
```sql
select id, estado, departamento_actual, correlation_id
from public.solicitudes_necesidades
where id = '<SOLICITUD_ID>';
```

Validar:
- `estado = 'pendiente'`
- `departamento_actual = 'ACM'`
- `correlation_id` no nulo si el trigger respondió correctamente

### Paso 6 — Validar ACM
Entrar como admin ACM y ejecutar:
- pre-aprobar,
- o rechazar,
- o escalar a FIN.

Consultar:
```sql
select id, estado, departamento_actual, pre_aprobada_por
from public.solicitudes_necesidades
where id = '<SOLICITUD_ID>';
```

### Paso 7 — Validar FIN
Entrar como usuario FIN y ejecutar:
- cargar presupuesto,
- resolver.

Consultar:
```sql
select id, estado, departamento_actual, presupuesto, costo_estimado, presupuestado_por
from public.solicitudes_necesidades
where id = '<SOLICITUD_ID>';
```

### Paso 8 — Validar maestro
Volver al portal del maestro y confirmar:
- badge de novedades,
- historial actualizado,
- botón de cancelar solo en `pendiente`.

## Evidencia de cierre
El feature puede declararse cerrado solo si:
- las migraciones aplican sin error,
- el trigger existe y funciona,
- el flujo Maestro → ACM → FIN se ejecuta,
- la fila queda consistente en cada transición,
- la UI refleja el estado final correctamente.

## Nota importante
Si alguno de estos pasos falla, el feature **no debe cerrarse** hasta corregir el problema y repetir la verificación.


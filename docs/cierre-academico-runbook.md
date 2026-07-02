# Runbook de producción — Cierre Académico ACM

Este procedimiento deja el cierre académico validado de punta a punta.

## Pre-requisitos
- Tener acceso al proyecto Supabase.
- Tener un período activo de prueba o de producción listo para cerrar.
- Confirmar que el portal compiló correctamente.

## 1) Aplicar la migración
Ejecutar en Supabase:

```sql
\i supabase/migrations/20260630_cierre_academico.sql
```

Si el entorno no admite `\i`, pegar el contenido completo de la migración en el SQL editor.

## 2) Verificar esquema
Ejecutar:

```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'periodos'
  and column_name in ('cerrado', 'cerrado_at', 'cerrado_por', 'observaciones_cierre');
```

```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'periodos_cierre_auditoria'
  and column_name in ('resumen', 'snapshot', 'created_at');
```

```sql
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'fn_cerrar_periodo_academico';
```

## 3) Ejecutar un cierre real
En el portal:
1. Abrir ACM.
2. Entrar a **Cierre Académico**.
3. Confirmar que el período activo es el esperado.
4. Abrir **Vista previa** y revisar el documento.
5. Cerrar el período.

## 4) Verificar resultado en Supabase
Ejecutar:

```sql
select id, nombre, activo, cerrado, cerrado_at, cerrado_por, observaciones_cierre
from public.periodos
order by updated_at desc nulls last
limit 10;
```

```sql
select periodo_id, fecha_inicio, fecha_fin, resumen, created_at
from public.periodos_cierre_auditoria
order by created_at desc
limit 10;
```

## 5) Verificar historial en el portal
1. Abrir **Historial de Cierres**.
2. Confirmar que el cierre recién creado aparece.
3. Confirmar que el resumen y observaciones coinciden con Supabase.

## 6) Verificar seguridad
- Intentar abrir `cierre-academico` con un usuario no autorizado.
- Confirmar acceso denegado.
- Confirmar que el cierre solo queda disponible para administración.

## Criterio de aceptación final
La implementación puede marcarse como cerrada cuando:
- la migración está aplicada,
- el período queda realmente cerrado,
- la auditoría queda insertada,
- el historial la muestra,
- el reporte exportable abre correctamente,
- y el acceso queda restringido.


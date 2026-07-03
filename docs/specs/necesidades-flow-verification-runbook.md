# Runbook de verificación — Flujo de solicitudes de necesidades

Fecha de corte: 2026-07-02

Este runbook existe para cerrar el feature con evidencia real.  
No sustituye la implementación; solo define cómo probarla de forma completa y auditable.

## Alcance
Verificar el flujo extremo a extremo:

1. Maestro crea una solicitud.
2. La solicitud abre un caso Hermes y queda en `pendiente`.
3. ACM la visualiza y la pre-aprueba o rechaza.
4. Si ACM la aprueba, se escala a FIN.
5. FIN carga presupuesto y resuelve.
6. El maestro ve el cambio reflejado en su historial/badge.

## Pre-requisitos
- Proyecto Supabase vinculado.
- Migraciones pendientes aplicadas.
- Usuarios de prueba disponibles para:
  - maestro,
  - admin ACM,
  - admin/cajero FIN.
- Hermes operativo.

## Verificaciones obligatorias

### 1) Migración
Comprobar que la migración existe y se aplicó:
- `supabase/migrations/20260702_solicitudes_necesidades_flow.sql`
- `supabase/migrations/20260702_solicitudes_necesidades_rls_hardening.sql`

Evidencia esperada:
- columnas nuevas presentes,
- constraint de estados actualizado,
- trigger `trg_solicitudes_necesidades_open_case` presente,
- policies RLS activas.

### 2) Inserción de solicitud
Crear una solicitud desde el portal del maestro.

Evidencia esperada:
- la fila aparece en `solicitudes_necesidades`,
- `estado = 'pendiente'`,
- `departamento_actual = 'ACM'`,
- `correlation_id` no es nulo si Hermes respondió.

### 3) ACM
Entrar como usuario ACM.

Evidencia esperada:
- la cola ACM muestra la solicitud,
- la acción de pre-aprobación cambia el estado a `pre_aprobada_acm`,
- la acción de escalado cambia `departamento_actual = 'FIN'`.

### 4) FIN
Entrar como usuario FIN.

Evidencia esperada:
- la cola FIN muestra la solicitud escalada,
- cargar presupuesto deja `estado = 'presupuestada'`,
- resolver deja `estado = 'aprobada'`, `rechazada`, `comprada` o `entregada` según la acción.

### 5) Maestro
Volver al portal del maestro.

Evidencia esperada:
- el historial refleja el nuevo estado,
- el badge de novedades cambia,
- el maestro puede cancelar solo si sigue en `pendiente`.

## Criterio para declarar cierre
Solo se puede cerrar el feature si las 5 verificaciones anteriores tienen evidencia real y no solo pruebas locales.

## Resultado esperado del runbook
Registrar uno de estos estados:
- `PASS` si todo funciona,
- `FAIL` si algún punto contradice el flujo esperado,
- `INCONCLUSIVE` si no se pudo ejecutar con usuarios o backend real.


# Checklist ejecutable — Validación productiva del flujo de necesidades

Fecha: 2026-07-02

Esta checklist está pensada para ejecutarse en el entorno real con Supabase/Hermes.
Su objetivo es producir evidencia inequívoca para poder cerrar el feature.

## 0. Confirmar entorno
- [ ] El proyecto Supabase apuntado es el correcto.
- [ ] Hermes está operativo.
- [ ] Existen usuarios de prueba:
  - [ ] maestro
  - [ ] admin ACM
  - [ ] admin/cajero FIN

## 1. Verificar migraciones
Ejecutar en Supabase:
- [ ] `20260702_solicitudes_necesidades_flow.sql`
- [ ] `20260702_solicitudes_necesidades_rls_hardening.sql`

Evidencia esperada:
- [ ] columnas nuevas presentes en `solicitudes_necesidades`
- [ ] constraint de estados actualizado
- [ ] trigger `trg_solicitudes_necesidades_open_case` activo
- [ ] policies RLS nuevas activas

## 2. Crear solicitud como maestro
Acción:
- [ ] Ingresar al portal como maestro.
- [ ] Crear una solicitud nueva.

Evidencia esperada:
- [ ] la fila se inserta correctamente
- [ ] `estado = 'pendiente'`
- [ ] `departamento_actual = 'ACM'`
- [ ] `correlation_id` se completa si Hermes responde

## 3. Validar ACM
Acción:
- [ ] Ingresar como admin ACM.
- [ ] Ver la solicitud en la cola.
- [ ] Pre-aprobar o rechazar.
- [ ] Si pre-aprueba, escalar a FIN.

Evidencia esperada:
- [ ] ACM ve solo lo que le corresponde
- [ ] el estado cambia según la acción
- [ ] `departamento_actual` pasa a `FIN` cuando corresponde

## 4. Validar FIN
Acción:
- [ ] Ingresar como usuario FIN.
- [ ] Ver la solicitud escalada.
- [ ] Cargar presupuesto.
- [ ] Resolver.

Evidencia esperada:
- [ ] FIN ve solo lo que le corresponde
- [ ] el presupuesto queda persistido
- [ ] el estado final queda en una de las salidas válidas

## 5. Validar maestro final
Acción:
- [ ] Volver al portal del maestro.

Evidencia esperada:
- [ ] el historial refleja el cambio
- [ ] el badge de novedades se actualiza
- [ ] la cancelación solo está disponible en `pendiente`

## 6. Criterio de cierre
Solo se puede declarar cerrado el feature cuando todos los puntos anteriores estén marcados y respaldados por evidencia real.


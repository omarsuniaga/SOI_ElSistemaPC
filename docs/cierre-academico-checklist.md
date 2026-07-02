# Checklist de Cierre Académico ACM

## Objetivo
Asegurar que el cierre académico quede completamente implementado, validado y listo para producción.

## Requisitos funcionales
- [x] La vista de cierre académico usa el período activo como fuente de verdad.
- [x] El cierre académico está protegido por control de acceso centralizado.
- [x] Existe un reporte institucional exportable del cierre.
- [x] Existe un historial auditable de cierres.

## Requisitos de base de datos
- [ ] Aplicar la migración `supabase/migrations/20260630_cierre_academico.sql`.
- [ ] Confirmar que `periodos` tiene los campos de cierre:
  - `cerrado`
  - `cerrado_at`
  - `cerrado_por`
  - `observaciones_cierre`
- [ ] Confirmar que `periodos_cierre_auditoria` existe y guarda:
  - `resumen`
  - `snapshot`
- [ ] Confirmar que la RPC `fn_cerrar_periodo_academico(...)` está publicada.

## Requisitos de validación
- [ ] Ejecutar el cierre sobre un período de prueba.
- [ ] Verificar que el período queda marcado como cerrado.
- [ ] Verificar que la auditoría recibe un registro nuevo.
- [ ] Verificar que el historial de cierres muestra el registro.
- [ ] Verificar que el reporte exportable abre/imprime correctamente.

## Requisitos de seguridad
- [ ] Confirmar que usuarios no autorizados no pueden entrar a `cierre-academico`.
- [ ] Confirmar que la ruta `cierre-academico` sigue restringida a administración.

## Requisitos de calidad
- [x] Build del portal pasa correctamente.
- [x] Pruebas de acceso y métricas relacionadas pasan correctamente.
- [ ] Agregar pruebas de integración de UI o verificación manual de la vista histórica si se cambia el esquema.

## Criterio para cerrar la implementación
La implementación puede considerarse cerrada cuando:
1. la migración esté aplicada en Supabase,
2. el cierre funcione en un entorno real,
3. el historial muestre el evento de cierre,
4. el reporte se genere sin errores,
5. y los permisos estén verificados.


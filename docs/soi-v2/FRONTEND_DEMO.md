# Avance: frontend y validación de seguridad

## Entorno de pruebas

Omar confirmó FUNEYCA PC y autorizó crear `soi-v2-security-staging` en `zmhmdvmyeyswunurcyow`. La herramienta devolvió US$0.01344/h y una confirmación de costo. La creación falló con `PaymentRequiredException: Branching is supported only on the Pro plan or above`.

No se creó la rama, no se cambió la suscripción y no se aplicó el parche en producción. El precio de la rama no incluye Pro. G1 sigue pendiente: un entorno Supabase aislado y el esquema completo restaurado. Crear una rama no demuestra que el historial reproduzca el catálogo actual.

La verificación de solo lectura en producción devolvió 4 postcondiciones verdaderas y 19 falsas de 23. Son comprobaciones de configuración previas al parche, no 19 explotaciones demostradas. Siete funciones principales coinciden por hash con los fixtures. Producción: PostgreSQL 17.6, 216 tablas públicas, 591 políticas y 95 triggers públicos de usuario. Última migración: `20260908052508`.

## Archivos del parche (PR #82)

- `supabase/migrations/20260911020424_f0_security_containment.sql`: permisos, RLS y funciones.
- `src/modules/metricas/api/metricsApi.js`: adaptador de cierre transaccional.
- `supabase/verify_f0_security.sql`: comprobaciones de instalación de solo lectura.
- `tools/security-regression/`: suite SQL/adaptador, fixtures, lockfile y resultados.
- `.github/workflows/f0-security.yml`: automatización de regresión.
- `docs/soi-v2/SEGURIDAD_F0.md`: alcance, despliegue coordinado y límites.
- `docs/soi-v2/baseline.json` y `advisors-before.json`: evidencias previas.

No ejecutar indiscriminadamente todas las migraciones pendientes. La antigua `20260910170000_harden_rls_and_security_definer_v1_lts.sql` requiere reconciliación. El adaptador y el parche SQL deben desplegarse coordinadamente después de validar.

## Frontend implementado

Se continúa con la alternativa autorizada: `apps/soi-v2`, React 19, TypeScript y Vite aislados de v1. Inicio académico, alumnos con búsqueda/filtros, ficha, clases/horarios y nóminas enlazadas. Paths del diseño aprobado. Menú móvil, enlaces nativos, historial, recuperación de rutas desconocidas y estados de carga/error/vacío.

DataAdapter de solo lectura con JSON ficticio. No hay llamadas a Supabase, credenciales, autenticación, edición, registro de asistencia ni sincronización. Las áreas futuras se identifican como pendientes. No está listo para uso institucional real.

Validación local: TypeScript y build correctos; cuatro contratos aprobados (activos sin clase, búsqueda/filtros, integridad de asignaciones/capacidad y rutas). Sin QA visual en navegador ni despliegue a producción. Los recorridos completos con Auth y PostgreSQL real siguen pendientes.

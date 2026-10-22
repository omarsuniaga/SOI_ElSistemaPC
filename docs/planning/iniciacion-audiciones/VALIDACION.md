# Evidencia y estado de entrega

Primera integración en rama `feat/initiation-audition-guests`, 22-10-2026.

- Investigación del esquema real: tablas, columnas, constraints y diferencias con el legacy; sin mutaciones en producción.
- Regresión relacionada: 207 pruebas aprobadas en 28 archivos (audiciones, Iniciación, clases y gestión de clases del maestro).
- PostgreSQL embebido: 13 casos de ciclo de vida, autorización y validación, usando roles reales de PostgreSQL sobre fixtures sintéticos. Se ejecuta la migración SQL completa. Las decisiones y valoraciones se prueban por sus funciones públicas.
- Recorrido de interfaz en DOM: notas → guardar → invitar → estado de revisión; prueba de preservación del formulario cuando faltan evidencias. Badge integrado en nómina docente, con test de integración.
- Compilación de producción y TypeScript aprobados. Lint de archivos modificados sin errores; cuatro advertencias de código previo.
- Control estructural mantiene las infracciones R1/R3 previas de master; ninguna tabla nueva queda sin escritor. Las cuatro exenciones R3 están expresas, con plan y bloqueo de multitenencia descritos en SPEC.
- Prueba visual con navegador pendiente: el runtime no tiene binario de Chromium utilizable y la descarga oficial no produjo un archivo válido. El navegador cloud no alcanza el servidor local (`ERR_CONNECTION_REFUSED`). No se certifica recorrido visual ni de red contra Supabase por esas pruebas de DOM/SQL.

No se creó ninguna convocatoria ni matrícula real. No se aplicó esta migración en Supabase. Para el piloto siguen pendientes: ensayo contra copia de producción con sus grants/RLS completos, navegador con tres perfiles, prueba concurrente por último cupo, criterios institucionales definitivos, marca de Iniciación de las clases origen y fecha de primeras filas reales.

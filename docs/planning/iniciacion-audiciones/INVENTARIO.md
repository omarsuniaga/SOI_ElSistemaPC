# Inventario comprobado — 22 de octubre de 2026

| Componente | Código | Base actual | Decisión |
|---|---|---|---|
| Portal Audiciones | `audiciones.html`, `src/portales/audiciones/audiciones.js` | Entrada protegida por sesión; rama antigua admite admin/jurado | Añadir entrada de Iniciación para los roles reales, sin abrir el portal legacy a maestros |
| Evaluador antiguo | `src/modules/audiciones/views/EvaluacionView.js` | Usa `usr-jurado-1` y adapter `students`; no existe `public.students` | No reutilizar esa persistencia ni inventar equivalencias |
| `evaluations` | Adapter Supabase y mock | Existe, vacía; `jurado_id` text, ocho criterios instrumentales; diferente de la migración de junio | Mantener; no importar ni alterar datos ni corregir todo el legacy en este proyecto |
| `audiciones` | Migración julio ACM-RUB-001 | Ausente; aparece en poda de septiembre | No asumir que existe ni restaurarla por accidente |
| Criterios / agregaciones | Tests de eligibility/aggregation y mapper | Lógica instrumental distinta de Iniciación | Conservar como regresión; rúbrica específica versionada |
| Alumnos / matrículas / clases | Adapters actuales | `alumnos`, `alumnos_clases`, `clases`; matrícula única por alumno/clase | Reutilizar las identidades y la matrícula; invitados se incluyen en asistencia normal |
| Iniciación | Datos de alumno y clase | `fecha_ingreso_iniciacion`, `requiere_iniciacion_musical`, `clases.es_clase_iniciacion` | Fuente principal para cohorte; no deducirla del instrumento |
| Períodos | `periodos` | Fechas y cierre; no equivale a una cohorte de ingreso | Referencia opcional, sin añadir otra tabla de semestre |
| Jurados | Legacy pide rol global `jurado` | Los roles operativos observados son admin/maestro | Asignación por convocatoria usando UUID autenticado, sin cambiar el rol global |
| Protocolo de audición | Hermes / calendario trimestral | Plantilla organizativa, no evaluaciones ni matrículas | No duplicar ni activar comunicaciones/automatizaciones |
| Instituciones | Núcleo académico actual | No hay catálogo `instituciones` ni membresías institucionales canónicas | Exención R3 explícita y acotada al despliegue actual; no fingir aislamiento multiinstitución |

Lecturas de producción: catálogo de tablas/columnas/constraints y conteo de `evaluations`. No se exportaron alumnos ni identidades reales a los fixtures. La investigación es de estructura y uso de código; no certifica el portal legacy mediante navegador.

Verificación adicional de datos: existen clases activas cuyo nombre contiene Iniciación pero no tienen `es_clase_iniciacion=true`. El selector usa la marca explícita; coordinación debe revisar la clasificación de los grupos que participarán. No se actualizan banderas basándose en coincidencias de nombre.

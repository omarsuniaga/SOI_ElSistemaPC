# Análisis y limpieza profesional del inventario

Archivo fuente: `INVENTARIOELSISTEMAPUNTACANA2026.xlsx`

El libro contiene **17 hojas**. Se generó un libro normalizado con **2760 registros de instrumentos**, **42 registros de materiales**, **26808 celdas no vacías archivadas** y **16 filas no parseadas pero conservadas**.

## Hojas de origen

| Hoja | Tipo | Dimensiones |
|---|---|---|
| ENERO 2026 | mensual/por período | 1024 × 28 |
| FEBRERO 2026 | mensual/por período | 1024 × 28 |
| MARZO 2026 | mensual/por período | 1028 × 28 |
| ABRIL 2026 | mensual/por período | 1028 × 28 |
| MAYO 2026 | mensual/por período | 1070 × 28 |
| JUNIO 2026 | mensual/por período | 1112 × 28 |
| AGOSTO 2026 | mensual/por período | 1132 × 28 |
| CODIGOS EL SISTEMA | auxiliar/general | 17 × 11 |
| FICHA DE ACTUALIZACIÓN | auxiliar/general | 31 × 1 |
| 2025 | mensual/por período | 1024 × 28 |
| ENE - SEP 2025 | mensual/por período | 1043 × 26 |
| OCTUBRE 2025 | mensual/por período | 1025 × 28 |
| NOVIEMBRE 2025 | mensual/por período | 1025 × 28 |
| NUEVAS ASIGNACIONES | auxiliar/general | 42 × 6 |
| NUEVOS | auxiliar/general | 34 × 9 |
| NO ASIGNADOS | auxiliar/general | 33 × 22 |
| INVENTARIO - ACTIVOS | auxiliar/general | 61 × 10 |

## Propiedades observadas en los bloques de instrumentos

| Propiedad original | Uso normalizado | Familias/hojas donde aparece |
|---|---|---|
| # | `` | cuerdas, maderas, materiales, metales, percusion, pianos |
| ASIGNADO | `asignado` | cuerdas, maderas, metales, percusion, pianos |
| CANTIDAD | `cantidad` | materiales |
| CODIGO | `codigo` | cuerdas, maderas, metales, percusion, pianos |
| DESCRIPCIÓN | `descripcion` | materiales |
| ESTADO | `estado` | maderas, metales, percusion, pianos |
| INTRUMENTO | `intrumento` | cuerdas, maderas, metales, percusion, pianos |
| MARCA | `marca` | cuerdas, maderas, materiales, metales, percusion, pianos |
| MATERIAL | `material` | materiales |
| MODELO | `modelo` | cuerdas, maderas, materiales, metales, percusion, pianos |
| OBSERVACIONES | `observaciones` | cuerdas |
| SERIAL | `serial` | cuerdas, maderas, metales, percusion, pianos |
| TAMAÑO | `tamano` | cuerdas, percusion, pianos |
| UBICACIÓN | `ubicacion` | cuerdas, maderas, metales, percusion, pianos |

## Clasificación

| Familia | Registros |
|---|---:|
| cuerdas | 1135 |
| maderas | 866 |
| metales | 318 |
| percusion | 377 |
| pianos | 64 |

## Separación por período fuente

| Período | Registros |
|---|---:|
| 2025 consolidado | 238 |
| abril 2026 | 244 |
| agosto 2026 | 315 |
| enero 2026 | 243 |
| enero-septiembre 2025 | 212 |
| febrero 2026 | 241 |
| junio 2026 | 297 |
| marzo 2026 | 245 |
| mayo 2026 | 273 |
| noviembre 2025 | 226 |
| octubre 2025 | 226 |

## Criterios de limpieza

1. Se estandarizaron nombres técnicos de columnas sin sobrescribir los valores de origen.
2. Cada registro conserva hoja y fila de origen, además de una representación JSON de la fila completa.
3. Se conservaron por separado `pianos` y `materiales` porque no pertenecen inequívocamente a las cuatro familias instrumentales solicitadas.
4. Los encabezados y valores atípicos, como fechas bajo la columna `TAMAÑO`, se reportan sin reinterpretación automática.
5. Las filas auxiliares no identificadas como registros numéricos permanecen en `filas_no_parseadas` y todas las celdas no vacías permanecen en `archivo_fuente_largo`.

## Estructura recomendada

> La tabla principal debe usar `codigo` como identificador operativo cuando exista, pero no se debe asumir unicidad hasta resolver duplicados y códigos repetidos. La clave técnica de trazabilidad es `id_registro` = hoja + fila.

## Observaciones de cobertura

Las hojas presentes incluyen enero, febrero, marzo, abril, mayo, junio y agosto de 2026; no aparece una hoja de julio de 2026. También aparecen hojas agregadas de 2025, enero-septiembre de 2025, octubre de 2025 y noviembre de 2025. No se inventaron meses ausentes.
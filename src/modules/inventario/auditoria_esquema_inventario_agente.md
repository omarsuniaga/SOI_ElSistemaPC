# Auditoría rápida del esquema de inventario del agente

## Veredicto

El diseño del agente es una buena base operativa para el módulo de inventario porque separa activos, comodatos, reparaciones, facturas, accesorios e historial. Es mejor como arquitectura final que una única tabla plana.

Sin embargo, antes de usarlo en producción conviene aplicar un parche de compatibilidad. Hay detalles que pueden romper las RPC o hacer que se pierdan datos del CSV normalizado.

## Hallazgos críticos

1. `comodatos_activos.updated_at` no existe en la tabla base, pero `intercambiar_instrumentos()` intenta actualizarlo.  
   Resultado: la función fallaría al ejecutarse.

2. `inventario_historial.tipo_evento` no permite los valores `intercambio` ni `renovacion`, pero las RPC los insertan.  
   Resultado: `intercambiar_instrumentos()` y `renovar_comodato()` pueden fallar por violación de CHECK.

3. El CSV normalizado contiene más información que la tabla `inventario_activos`: familia, tamaño, cantidad, asignado_a textual, donante, faltantes, banderas de revisión, alertas de calidad, arco, estuche, funda, etc.  
   Resultado: si se importa directo al esquema del agente, se perdería información importante.

4. `generar_contrato_pdf()` no genera realmente un PDF; solo devuelve una URL simulada si no existe una URL guardada.  
   Recomendación: dejar la generación real del PDF en la PWA o en Edge Functions/Storage.

5. `obtener_kpi_inventario()` usa `ociosos` como conteo de todos los comodatos activos. Eso no significa realmente instrumentos ociosos.  
   Recomendación: renombrar ese indicador o calcularlo desde `vw_activos_ociosos` filtrando alertas reales.

6. `intercambiar_instrumentos()` recibe `p_alumno_id`, pero no lo usa.  
   Recomendación: eliminar el parámetro o validar que corresponde al alumno esperado para evitar acciones ambiguas desde la interfaz.

## Orden sugerido de ejecución

1. `20260622_erp_finanzas_inventario.sql`
2. `20260622_inventario_profesional.sql`
3. `20260622_inventario_patch_compatibilidad.sql`
4. Crear/importar `inventario_import_staging`
5. Subir `inventario_supabase_import.csv` a `inventario_import_staging`
6. Ejecutar `20260622_inventario_import_mapping.sql`
7. Ejecutar `20260622_inventario_rpc_functions.sql`

## Decisión recomendada

Usar el esquema del agente como arquitectura final, pero no importar el CSV directamente a `inventario_activos` sin pasar por staging y mapping.  
El CSV debe entrar primero como inventario histórico/auditable, y luego normalizarse hacia activos, accesorios y comodatos.

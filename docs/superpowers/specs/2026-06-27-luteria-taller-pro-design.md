# Portal Profesional de Lutería — Design Spec

**Fecha:** 2026-06-27
**Estado:** Aprobado (Fase 1: Taller Básico Funcional)
**Módulo:** `luteria-taller`
**Dependencias:** `instrumentos` (tabla existente), `tareas_institucionales` (Hermes), `fn_reportar_instrumento_danado` (RPC existente)

---

## 1. Visión General

El Portal de Lutería es el centro técnico de salud instrumental de la institución. Funciona como un **taller profesional de reparación de instrumentos**, no como un módulo secundario de inventario. Cada instrumento dañado o en mantenimiento recibe una "historia clínica técnica" completa: recepción, diagnóstico, presupuesto, reparación, insumos, costos, evidencias, facturación y cierre.

### Principios Arquitectónicos

| Principio | Regla |
|-----------|-------|
| Namespacing | Todo recurso DB usa prefijo `lut_`. Todo código fuente vive en `src/modules/luteria-taller/`. |
| Mock First | Toda funcionalidad nueva funciona en modo demo (JSON mock) antes de tocar Supabase. |
| No tocar existente | Cero modificaciones a archivos, tablas o migraciones ya existentes. |
| DataAdapter | Capa de datos con dispatcher: `xApi.js` → `xMock.js` / `xSupabase.js`. |
| Hermes integration | Toda orden de reparación lleva `correlation_id` para enlazar al caso Hermes. |
| Segregación financiera | Lutería **no cobra directamente**. Deriva cargos a Finanzas. |
| Segregación comunicacional | Lutería **no envía mensajes directos**. Deriva a Comunicación. |

### División de Responsabilidades

```
LOG / Inventario → custodia, disponibilidad, asignación, trazabilidad del activo
LUT / Lutería    → diagnóstico, reparación, costos técnicos, insumos, cierre técnico
FIN              → cobro, factura, pago, compra, autorización financiera
COM              → contacto formal con representantes
ACM              → seguimiento del alumno, continuidad pedagógica
DIR              → supervisión, aprobación sensible, casos críticos
```

---

## 2. Alcance — Fase 1 (Taller Básico Funcional)

| # | Módulo | Prioridad | Dependencias |
|---|--------|-----------|-------------|
| 1 | Buscador de instrumentos conectado a inventario | P0 | `instrumentos` |
| 2 | Ficha técnica del instrumento con historial | P0 | `instrumentos`, `lut_ordenes_reparacion` |
| 3 | Crear orden de reparación + diagnóstico | P0 | `instrumentos`, `tareas_institucionales` |
| 4 | Estados de reparación + timeline visual | P0 | `lut_ordenes_reparacion` |
| 5 | Dashboard del taller (KPIs, casos abiertos) | P0 | `lut_ordenes_reparacion` |
| 6 | Adjuntar evidencias fotográficas | P1 | `lut_evidencias` |
| 7 | Conexión con Hermes (`correlation_id`) | P0 | `tareas_institucionales`, `fn_reportar_instrumento_danado` |
| 8 | Cambio de estado del instrumento en inventario | P0 | `instrumentos` |

**Fases posteriores** (fuera de este spec):
- **Fase 2:** Costos, presupuestos, gestión de insumos, solicitudes de compra
- **Fase 3:** Cargos a Finanzas, comunicación con representantes
- **Fase 4:** Inteligencia operativa, reportes, mantenimiento preventivo

---

## 3. Modelo de Datos

### 3.1 `lut_ordenes_reparacion` — Órdenes de reparación

Corazón del sistema. Cada orden representa un caso de reparación desde que se reporta el daño hasta que el instrumento vuelve al inventario.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `uuid PK` | Identificador único |
| `correlation_id` | `uuid` | Enlace al caso Hermes (tareas agrupadas) |
| `instrumento_id` | `uuid FK → instrumentos.id` | Instrumento asociado |
| `alumno_id` | `uuid` | Alumno que usaba el instrumento |
| `alumno_nombre` | `text` | Denormalizado para búsqueda rápida |
| `reportado_por` | `uuid` | ID del usuario que reportó |
| `reportado_por_nombre` | `text` | Nombre de quien reportó |
| `recibido_por` | `uuid` | ID del técnico que recibió en taller |
| `recibido_por_nombre` | `text` | Nombre del técnico |
| `tecnico_responsable` | `uuid` | ID del luthier/técnico asignado |
| `tecnico_responsable_nombre` | `text` | Nombre del técnico asignado |
| `departamento_origen` | `text` | Departamento que reportó |
| `estado` | `text` | Estado actual (ver §5) |
| `prioridad` | `text` | `baja`, `media`, `alta`, `critica` |
| `descripcion_inicial` | `text` | Reporte inicial del daño |
| `diagnostico_resumen` | `text` | Resumen del diagnóstico |
| `tipo_dano` | `text` | Clasificación del daño (ver §4) |
| `gravedad` | `text` | `leve`, `moderada`, `grave`, `critica` |
| `requiere_reemplazo` | `boolean` | Si necesita préstamo temporal |
| `requiere_cobro` | `boolean` | Si corresponde cargo al representante |
| `requiere_aprobacion_direccion` | `boolean` | Si requiere escalar a DIR |
| `costo_estimado` | `numeric(10,2)` | Costo estimado total |
| `costo_final` | `numeric(10,2)` | Costo real al cierre |
| `fecha_recepcion` | `timestamptz` | Cuándo entró al taller |
| `fecha_diagnostico` | `timestamptz` | Cuándo se diagnosticó |
| `fecha_inicio_reparacion` | `timestamptz` | Cuándo empezó la reparación |
| `fecha_estimada_entrega` | `timestamptz` | Fecha estimada de finalización |
| `fecha_entrega` | `timestamptz` | Fecha real de entrega |
| `created_at` | `timestamptz` | Fecha de creación |
| `updated_at` | `timestamptz` | Última actualización |

### 3.2 `lut_diagnosticos` — Diagnósticos técnicos

Diagnóstico formal realizado por el luthier. Una orden puede tener múltiples diagnósticos (evolución).

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `uuid PK` | |
| `orden_id` | `uuid FK → lut_ordenes_reparacion.id` | Orden asociada |
| `diagnostico_tecnico` | `text` | Descripción técnica del daño |
| `causa_probable` | `text` | Causa estimada |
| `tipo_dano` | `text` | Tipo de daño diagnosticado |
| `gravedad` | `text` | `leve`, `moderada`, `grave`, `critica` |
| `zona_afectada` | `text` | Parte del instrumento afectada |
| `reparacion_recomendada` | `text` | Acción recomendada |
| `materiales_requeridos` | `text` | Materiales/insumos necesarios |
| `tiempo_estimado_horas` | `numeric(5,1)` | Horas estimadas de trabajo |
| `costo_mano_obra` | `numeric(10,2)` | Costo estimado de mano de obra |
| `costo_materiales` | `numeric(10,2)` | Costo estimado de materiales |
| `requiere_servicio_externo` | `boolean` | Si necesita taller externo |
| `observaciones` | `text` | Observaciones adicionales |
| `diagnosticado_por` | `uuid` | ID del técnico que diagnosticó |
| `diagnosticado_por_nombre` | `text` | Nombre del técnico |
| `created_at` | `timestamptz` | |

### 3.3 `lut_presupuestos` — Presupuestos

Cada orden puede tener un presupuesto formal antes de autorizar la reparación.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `uuid PK` | |
| `orden_id` | `uuid FK → lut_ordenes_reparacion.id` | Orden asociada |
| `estado` | `text` | `borrador`, `enviado`, `aprobado`, `rechazado`, `cubierto_institucion` |
| `subtotal_mano_obra` | `numeric(10,2)` | |
| `subtotal_materiales` | `numeric(10,2)` | |
| `subtotal_servicios_externos` | `numeric(10,2)` | |
| `descuento` | `numeric(10,2)` | Descuento o subsidio |
| `monto_institucion` | `numeric(10,2)` | Monto asumido por la institución |
| `monto_representante` | `numeric(10,2)` | Monto a cobrar al representante |
| `total` | `numeric(10,2)` | Total calculado |
| `aprobado_por` | `uuid` | Quién aprobó |
| `aprobado_en` | `timestamptz` | Cuándo se aprobó |
| `observaciones` | `text` | Notas financieras |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

### 3.4 `lut_insumos` — Catálogo de insumos

Materiales y repuestos del taller.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `uuid PK` | |
| `nombre` | `text NOT NULL` | Nombre del insumo |
| `categoria` | `text` | Categoría (cuerdas, puentes, clavijas, ...) |
| `unidad` | `text` | Unidad de medida (unidad, par, juego, metro, ...) |
| `stock_actual` | `numeric(10,2) NOT NULL DEFAULT 0` | Stock disponible |
| `stock_minimo` | `numeric(10,2) NOT NULL DEFAULT 0` | Umbral de reorden |
| `costo_unitario` | `numeric(10,2)` | Costo por unidad |
| `proveedor_sugerido` | `text` | Proveedor habitual |
| `activo` | `boolean NOT NULL DEFAULT true` | Si está activo en catálogo |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

### 3.5 `lut_movimientos_insumos` — Movimientos de inventario de insumos

Control de entradas, salidas y ajustes de insumos.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `uuid PK` | |
| `insumo_id` | `uuid FK → lut_insumos.id` | Insumo afectado |
| `orden_id` | `uuid FK → lut_ordenes_reparacion.id` | Orden asociada (nullable) |
| `tipo_movimiento` | `text NOT NULL` | `entrada`, `consumo`, `ajuste`, `devolucion`, `perdida` |
| `cantidad` | `numeric(10,2) NOT NULL` | Cantidad del movimiento |
| `costo_unitario` | `numeric(10,2)` | Costo al momento del movimiento |
| `registrado_por` | `uuid` | Usuario que registró |
| `created_at` | `timestamptz` | |

### 3.6 `lut_solicitudes_compra` — Solicitudes de compra de insumos

Cuando el taller no tiene stock y necesita comprar.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `uuid PK` | |
| `orden_id` | `uuid FK → lut_ordenes_reparacion.id` | Orden asociada (nullable) |
| `insumo_id` | `uuid FK → lut_insumos.id` | Insumo solicitado |
| `cantidad_solicitada` | `numeric(10,2) NOT NULL` | |
| `justificacion` | `text` | Por qué se necesita |
| `urgencia` | `text` | `baja`, `media`, `alta`, `critica` |
| `costo_estimado` | `numeric(10,2)` | Costo estimado total |
| `proveedor_sugerido` | `text` | Proveedor sugerido |
| `estado` | `text NOT NULL DEFAULT 'pendiente'` | `pendiente`, `aprobada`, `rechazada`, `comprada`, `cancelada` |
| `solicitado_por` | `uuid` | Quién solicita |
| `aprobado_por` | `uuid` | Quién aprueba (Finanzas) |
| `fecha_requerida` | `date` | Fecha límite |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

### 3.7 `lut_evidencias` — Evidencias fotográficas y documentos

Archivos adjuntos a cada orden de reparación.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `uuid PK` | |
| `orden_id` | `uuid FK → lut_ordenes_reparacion.id` | Orden asociada |
| `tipo` | `text NOT NULL` | `foto_antes`, `foto_durante`, `foto_despues`, `documento`, `video`, `factura`, `informe` |
| `nombre` | `text` | Nombre original del archivo |
| `storage_path` | `text` | Ruta en storage |
| `descripcion` | `text` | Descripción de la evidencia |
| `visibilidad` | `text NOT NULL DEFAULT 'interno'` | `interno`, `finanzas`, `representante`, `publico` |
| `subido_por` | `uuid` | Usuario que subió |
| `subido_por_nombre` | `text` | Nombre del usuario |
| `created_at` | `timestamptz` | |

---

## 4. Catálogo de Tipos de Daño

```
cuerda_rota, puente_caido, puente_partido, alma_caida,
clavijas_defectuosas, diapason_despegado, mango_afectado,
tapa_abierta, grieta, golpe_estructural, barniz_daniado,
arco_daniado, estuche_daniado, accesorio_faltante,
dano_humedad, dano_mal_uso, mantenimiento_preventivo, otro
```

---

## 5. Estados de Orden de Reparación

```
reportado → recibido → pendiente_diagnostico → diagnosticado
           → presupuesto_pendiente → esperando_aprobacion
           → esperando_insumos → en_reparacion → en_prueba
           → listo_entrega → entregado → cerrado
           → cancelado (desde cualquier estado)
```

---

## 6. Integración con Hermes

### Regla 1 — Daño reportado desde clase
Cuando un maestro reporta daño de instrumento (vía `fn_reportar_instrumento_danado`):
- Hermes crea caso con `correlation_id`
- Crea tarea LUT: diagnosticar daño
- Crea tarea LOG: actualizar estado + evaluar reemplazo
- Crea tarea FIN: evaluar cargo
- Crea tarea ACM: seguimiento alumno
- Crea tarea COM: comunicar a representante
- El portal Lutería recibe la orden en estado `reportado`

### Regla 2 — Daño grave
Si el diagnóstico marca gravedad `grave` o `critica`:
- Marcar `requiere_aprobacion_direccion = true`
- Crear tarea DIR: aprobar caso
- Evidencia obligatoria

### Regla 3 — Requiere cobro
Si Lutería marca `requiere_cobro = true`:
- Hermes crea tarea FIN: generar cargo
- Hermes crea tarea COM: notificar al representante
- Bloquear cierre hasta confirmación FIN

### Regla 4 — Falta de insumos
Si diagnóstico requiere materiales sin stock:
- Crear `lut_solicitudes_compra`
- Hermes crea tarea FIN: aprobar compra
- Orden pasa a `esperando_insumos`

---

## 7. KPIs del Dashboard (Fase 1)

| Indicador | Fuente |
|-----------|--------|
| Recibidos hoy | `lut_ordenes_reparacion` WHERE `fecha_recepcion >= hoy` |
| Pendientes de diagnóstico | WHERE `estado = pendiente_diagnostico` |
| En reparación | WHERE `estado = en_reparacion` |
| Esperando insumos | WHERE `estado = esperando_insumos` |
| Listos para entrega | WHERE `estado = listo_entrega` |
| Abiertos total | WHERE `estado NOT IN (entregado, cerrado, cancelado)` |
| Tiempo promedio reparación | AVG(`fecha_entrega` - `fecha_inicio_reparacion`) |
| Costo estimado abierto | SUM(`costo_estimado`) WHERE abierto |

---

## 8. Escenarios de Prueba (Acceptance Criteria)

### Escenario 1: Reporte de daño desde clase
1. Maestro reporta daño vía RPC
2. Sistema crea `lut_ordenes_reparacion` con estado `reportado`
3. `correlation_id` enlaza la orden con las tareas Hermes
4. Instrumento cambia a estado `danado` en `instrumentos`
5. Lutería ve la orden en el dashboard

### Escenario 2: Diagnóstico completo
1. Lutería recibe orden en `pendiente_diagnostico`
2. Registra diagnóstico con tipo de daño, gravedad, costo estimado
3. Orden pasa a `diagnosticado`
4. Si gravedad es grave, se marca `requiere_aprobacion_direccion`

### Escenario 3: Flujo completo reparación
1. Orden creada → diagnosticada → presupuestada → aprobada
2. Insumos consumidos → stock actualizado
3. Reparación completada → orden pasa a `en_prueba`
4. Prueba ok → `listo_entrega`
5. Instrumento devuelto → `entregado` → `cerrado`
6. Instrumento vuelve a `disponible` o `asignado` en inventario

### Escenario 4: Evidencias fotográficas
1. Lutería adjunta 3 fotos a una orden (antes/durante/después)
2. Cada evidencia queda registrada con tipo, descripción y usuario
3. Evidencias se pueden visualizar desde la ficha de la orden

---

## 9. Seguridad

- **RLS**: Todas las tablas `lut_*` habilitan RLS con política `authenticated` (SELECT, INSERT, UPDATE para todo usuario autenticado)
- **REVOKE anon**: `REVOKE ALL ON ... FROM anon`
- **Sin DELETE público**: No se expone DELETE en RLS (baja lógica vía estado `cancelado`)
- **FK seguro**: `instrumento_id` referencias `public.instrumentos(id)` con `ON DELETE RESTRICT`

---

## 10. Mock Data (Fase 1)

El mock (`luteriaTallerMock.js`) incluye:
- 5 órdenes demo en distintos estados (reportado, diagnosticado, en_reparacion, listo_entrega, cerrado)
- 3 diagnósticos asociados
- 1 presupuesto aprobado
- 2 evidencias mock
- Instrumentos del mock existente referenciados por UUID

---

## 11. Glosario

| Término | Definición |
|---------|-----------|
| LUT | Código departamento Lutería (enumeración `soi_departamento`) |
| Orden de reparación | Caso completo de reparación de un instrumento |
| Historial técnico | Conjunto de todas las órdenes asociadas a un instrumento |
| correlation_id | UUID que agrupa todas las tareas Hermes de un mismo caso |
| Mock First | Toda feature funciona en modo demo (datos locales JSON/variables) antes de conexión a Supabase |

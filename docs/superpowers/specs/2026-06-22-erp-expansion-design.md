# Spec: Extensión ERP — Finanzas e Inventarios (SOI V9)
## `SIS-SPEC-ERP-V2` — Revisión técnica sobre propuesta original de ANTIGRAVITY

| Campo | Valor |
|---|---|
| **Identificador** | `SIS-SPEC-ERP-V2` |
| **Basado en** | `SIS-SPEC-ERP-V1` (ANTIGRAVITY, 2026-06-22) |
| **Revisión** | Claude Sonnet 4.6 — análisis de 7 gaps técnicos identificados |
| **Estado** | Listo para implementación (pendiente aprobación Omar) |
| **Fecha** | 2026-06-22 |
| **ENGRAM ref** | `erp-expansion/spec` (project: omedsunriv) |

---

## 1. Planteamiento de la Necesidad

Sin cambios respecto a V1. Dos problemas reales:

1. **Matrículas y Pagos:** pagos de RD$1,000 (inscripción) y RD$600/mes se controlan fuera del sistema. No hay validación de morosidad en el portal.
2. **Inventario y Comodatos:** los instrumentos se entregan sin trazabilidad en DB. Imposible automatizar alertas de activos ociosos (instrumento asignado a alumno que ya no asiste).

---

## 2. Scope y Features

### 2.1 Módulo Finanzas (`/finanzas`)

**Registro de Pagos**
- Formulario: `alumno_id`, `monto`, `concepto`, `metodo_pago`, `fecha_pago`, **`periodo_mes`** ← *nuevo campo obligatorio*
- `periodo_mes` = primer día del mes que cubre el pago (ej. `2026-06-01`)
- El sistema impide registrar dos pagos del mismo `concepto = 'mensualidad'` para el mismo alumno y el mismo `periodo_mes`

**Estado de Cuenta del Alumno**
- Clasificación basada en si el mes actual tiene pago registrado:
  - `verde` — pago del mes actual existe (o alumno marcado `exento_mensualidad = true`)
  - `amarillo` — mora entre 1 y 59 días (último mes pagado < mes actual)
  - `rojo` — mora ≥ 60 días (bloqueo operativo)
- Los alumnos con `exento_mensualidad = true` (becados, convenio institucional) son siempre `verde` — la función no evalúa mora para ellos

**Exportación**
- Resumen mensual CSV/Excel filtrable por periodo, concepto, método de pago

### 2.2 Módulo Inventario (`/inventario`)

**Control de Stock**
- Registro por: `tipo_instrumento`, `marca`, `modelo`, `numero_serie`, `codigo_inventario` (ej. `V8-VIO-001`)
- Dos estados separados en la tabla:
  - `estado_conservacion`: condición física (`excelente`, `bueno`, `regular`, `mantenimiento`, `de_baja`)
  - `estado_uso`: disponibilidad operativa (`disponible`, `prestado`, `en_mantenimiento`) ← *nuevo campo*
- Un instrumento en `estado_conservacion = 'mantenimiento'` tiene automáticamente `estado_uso = 'en_mantenimiento'`

**Asignación de Comodato**
- Vincula instrumento (`estado_uso = 'disponible'`) a alumno activo
- Al crear comodato: trigger cambia `estado_uso → 'prestado'`
- Al devolver: trigger cambia `estado_uso → 'disponible'`

**Generador de Contrato PDF**
- Botón "Generar Contrato" en el detalle del comodato
- Usa `jsPDF` (ya disponible en `src/modules/alumnos/views/pdfDemoView.js` — reusar infraestructura existente)
- Template: logo institución, datos del alumno + representante, datos del instrumento, términos de comodato, línea de firma física
- Flujo: genera PDF en browser → sube a Supabase Storage (`comodatos/{id}/contrato.pdf`) → guarda URL en `comodatos_activos.contrato_firmado_url`
- **Firma es física** (se imprime y se firma en papel). No hay firma digital en V1.

**Alertas de Activos Ociosos** ← *feature nuevo, cubre gap G2*
- Vista `alertasComodatosView.js` en el módulo inventario
- Muestra: comodatos `estado = 'activo'` donde el alumno tiene `estado = 'inactivo'` O no registra asistencia en los últimos 30 días
- Acción disponible: "Iniciar devolución" → abre flujo de devolución del comodato

---

## 3. Arquitectura

### 3.1 Estructura de módulos

```
src/modules/
├── finanzas/
│   ├── api/
│   │   └── finanzasApi.js          ← consultas a pagos_alumnos
│   ├── domain/
│   │   └── cobranza.js             ← calcularEstadoFinanciero() — lógica pura, testeable
│   ├── views/
│   │   ├── registroPagosView.js    ← formulario de cobros
│   │   └── balanceAlumnosView.js   ← estado de cuenta por alumno
│   ├── __tests__/
│   │   └── cobranza.test.js
│   └── finanzas.router.js
└── inventario/
    ├── api/
    │   └── inventarioApi.js        ← consultas a inventario_activos + comodatos_activos
    ├── domain/
    │   └── comodato.js             ← validaciones de disponibilidad, lógica PDF
    ├── views/
    │   ├── stockInstrumentosView.js
    │   ├── controlComodatosView.js
    │   └── alertasComodatosView.js ← activos ociosos (nuevo)
    ├── __tests__/
    │   └── comodato.test.js
    └── inventario.router.js
```

Registrar ambos en `src/main.js` → `MODULES_REGISTRY`.

### 3.2 Esquema de base de datos

```sql
-- ─────────────────────────────────────────
-- MÓDULO FINANZAS
-- ─────────────────────────────────────────

CREATE TABLE public.pagos_alumnos (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumno_id               UUID NOT NULL REFERENCES public.alumnos(id) ON DELETE RESTRICT,
    monto                   NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
    concepto                VARCHAR(100) NOT NULL
                              CHECK (concepto IN ('mensualidad', 'inscripcion', 'uniforme', 'otro')),
    periodo_mes             DATE NOT NULL,
    -- periodo_mes = primer día del mes: 2026-06-01
    -- Permite saber qué mes cubre el pago — crítico para calcular mora correctamente
    fecha_pago              DATE NOT NULL DEFAULT CURRENT_DATE,
    metodo_pago             VARCHAR(50) NOT NULL
                              CHECK (metodo_pago IN ('efectivo', 'transferencia', 'deposito', 'beca')),
    referencia_transaccion  VARCHAR(100),
    registrado_por          UUID REFERENCES auth.users(id),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Impide registrar mensualidad duplicada para el mismo alumno y mes
CREATE UNIQUE INDEX uix_pagos_mensualidad_mes
    ON public.pagos_alumnos (alumno_id, periodo_mes)
    WHERE concepto = 'mensualidad';

-- ─────────────────────────────────────────
-- MÓDULO INVENTARIO
-- ─────────────────────────────────────────

ALTER TABLE public.alumnos
    ADD COLUMN IF NOT EXISTS exento_mensualidad BOOLEAN NOT NULL DEFAULT FALSE;
-- exento_mensualidad = true → becados o alumnos bajo convenio institucional
-- calcularEstadoFinanciero() devuelve 'verde' sin evaluar mora para estos alumnos

CREATE TABLE public.inventario_activos (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_instrumento     VARCHAR(100) NOT NULL,
    marca                VARCHAR(100),
    modelo               VARCHAR(100),
    numero_serie         VARCHAR(100) UNIQUE,
    codigo_inventario    VARCHAR(50) UNIQUE NOT NULL,
    estado_conservacion  VARCHAR(50) NOT NULL
                           CHECK (estado_conservacion IN
                             ('excelente', 'bueno', 'regular', 'mantenimiento', 'de_baja')),
    estado_uso           VARCHAR(50) NOT NULL DEFAULT 'disponible'
                           CHECK (estado_uso IN ('disponible', 'prestado', 'en_mantenimiento')),
    -- estado_conservacion = condición física del instrumento
    -- estado_uso = disponibilidad operativa (derivada del comodato activo o mantenimiento)
    ubicacion            VARCHAR(100) NOT NULL DEFAULT 'Sede Principal',
    activo               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.comodatos_activos (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activo_id             UUID NOT NULL REFERENCES public.inventario_activos(id) ON DELETE RESTRICT,
    alumno_id             UUID NOT NULL REFERENCES public.alumnos(id) ON DELETE RESTRICT,
    fecha_entrega         DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_devolucion      DATE,
    estado                VARCHAR(50) NOT NULL DEFAULT 'activo'
                            CHECK (estado IN ('activo', 'devuelto', 'renovado')),
    contrato_firmado_url  VARCHAR(255),
    -- Supabase Storage path: comodatos/{id}/contrato.pdf
    observaciones         TEXT,
    registrado_por        UUID REFERENCES auth.users(id),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Solo un comodato activo por instrumento a la vez
CREATE UNIQUE INDEX uix_comodato_activo_por_instrumento
    ON public.comodatos_activos (activo_id)
    WHERE estado = 'activo';

-- ─────────────────────────────────────────
-- TRIGGERS — Estado de uso del instrumento
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_sync_estado_uso_activo()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.estado = 'activo' THEN
        UPDATE public.inventario_activos
           SET estado_uso = 'prestado'
         WHERE id = NEW.activo_id;

    ELSIF TG_OP = 'UPDATE'
      AND OLD.estado = 'activo'
      AND NEW.estado IN ('devuelto', 'renovado') THEN
        UPDATE public.inventario_activos
           SET estado_uso = 'disponible'
         WHERE id = NEW.activo_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_comodato_sync_estado_uso
AFTER INSERT OR UPDATE ON public.comodatos_activos
FOR EACH ROW EXECUTE FUNCTION fn_sync_estado_uso_activo();

-- ─────────────────────────────────────────
-- HERMES INBOX — Emisión de eventos de mora
-- (conecta con Task Contract V1 / FIN-P13)
-- ─────────────────────────────────────────

-- Esta tabla debe existir antes de activar el trigger.
-- Si ya existe de una implementación previa de HERMES, omitir CREATE.
CREATE TABLE IF NOT EXISTS public.hermes_inbox (
    id          BIGSERIAL PRIMARY KEY,
    canal       VARCHAR(50) NOT NULL DEFAULT 'db_trigger',
    categoria   VARCHAR(100) NOT NULL,
    summary     TEXT NOT NULL,
    raw_ref     UUID,
    processed   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION fn_emit_mora_event()
RETURNS TRIGGER AS $$
DECLARE
    v_estado TEXT;
    v_dias   INT;
    v_nombre TEXT;
BEGIN
    -- Calcular días desde último pago de mensualidad
    SELECT EXTRACT(DAY FROM (CURRENT_DATE - MAX(periodo_mes)))::INT
      INTO v_dias
      FROM public.pagos_alumnos
     WHERE alumno_id = NEW.alumno_id AND concepto = 'mensualidad';

    -- Resolver nombre del alumno
    SELECT nombre_completo INTO v_nombre
      FROM public.alumnos WHERE id = NEW.alumno_id;

    -- Solo emitir si cruza umbral de amarillo (30 días) o rojo (60 días)
    IF v_dias >= 60 THEN
        v_estado := 'rojo';
    ELSIF v_dias >= 30 THEN
        v_estado := 'amarillo';
    ELSE
        RETURN NEW;
    END IF;

    INSERT INTO public.hermes_inbox (canal, categoria, summary, raw_ref)
    VALUES (
        'db_trigger',
        'mora_pago',
        format('Alumno %s en estado financiero %s (%s días sin pago de mensualidad)',
               v_nombre, v_estado, v_dias),
        NEW.alumno_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mora_emit_hermes
AFTER INSERT ON public.pagos_alumnos
FOR EACH ROW EXECUTE FUNCTION fn_emit_mora_event();
-- Nota: el trigger se activa al registrar un pago y recalcula el estado.
-- HERMES lee hermes_inbox via cron y lo convierte en Task Contract (soi_policy_ref: FIN-P13).
```

---

## 4. Control de Acceso y RLS

El framework de RLS de este proyecto usa la función `es_admin()` definida en `docs/planning/DIAGNOSTICO_RLS_STRATEGY.md`. Usar ese helper — **no** verificar `maestros.es_admin` directamente.

```sql
-- Habilitar RLS en las tres tablas nuevas
ALTER TABLE public.pagos_alumnos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario_activos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comodatos_activos  ENABLE ROW LEVEL SECURITY;

-- ── pagos_alumnos ──────────────────────────────────────────────
-- Maestros: sin acceso (datos financieros son confidenciales)
-- Admin + Dirección: lectura y escritura total

CREATE POLICY "pagos_admin_read"
ON public.pagos_alumnos FOR SELECT TO authenticated
USING (es_admin());

CREATE POLICY "pagos_admin_write"
ON public.pagos_alumnos FOR INSERT TO authenticated
WITH CHECK (es_admin());

CREATE POLICY "pagos_admin_update"
ON public.pagos_alumnos FOR UPDATE TO authenticated
USING (es_admin());

-- ── inventario_activos ─────────────────────────────────────────
-- Maestros: lectura (ver stock disponible para su clase)
-- Admin: lectura + escritura + asignación

CREATE POLICY "inventario_maestro_read"
ON public.inventario_activos FOR SELECT TO authenticated
USING (TRUE);
-- Todos los autenticados ven el inventario (es información de trabajo)

CREATE POLICY "inventario_admin_write"
ON public.inventario_activos FOR INSERT TO authenticated
WITH CHECK (es_admin());

CREATE POLICY "inventario_admin_update"
ON public.inventario_activos FOR UPDATE TO authenticated
USING (es_admin());

-- ── comodatos_activos ──────────────────────────────────────────
-- Maestros: lectura (ver qué alumno tiene qué instrumento)
-- Admin: lectura + escritura + devolución

CREATE POLICY "comodatos_read_all"
ON public.comodatos_activos FOR SELECT TO authenticated
USING (TRUE);

CREATE POLICY "comodatos_admin_write"
ON public.comodatos_activos FOR INSERT TO authenticated
WITH CHECK (es_admin());

CREATE POLICY "comodatos_admin_update"
ON public.comodatos_activos FOR UPDATE TO authenticated
USING (es_admin());
```

**Tabla `hermes_inbox`**: acceso exclusivo `service_role`. No exponer a usuarios autenticados.

---

## 5. Plan de Pruebas TDD (Vitest)

Estructura: `src/modules/finanzas/__tests__/cobranza.test.js` y `src/modules/inventario/__tests__/comodato.test.js`.

### 5.1 Dominio: Finanzas (`domain/cobranza.js`)

```javascript
import { describe, test, expect } from 'vitest'
import { calcularEstadoFinanciero } from '../domain/cobranza.js'

describe('calcularEstadoFinanciero', () => {

  test('verde — pago del mes actual registrado', () => {
    const hoy = new Date('2026-06-22')
    const resultado = calcularEstadoFinanciero(
      { exento_mensualidad: false, ultimo_periodo_pagado: '2026-06-01' },
      hoy
    )
    expect(resultado.categoria).toBe('verde')
    expect(resultado.bloqueado).toBe(false)
  })

  test('amarillo — mora entre 1 y 59 días', () => {
    const hoy = new Date('2026-06-22')
    const resultado = calcularEstadoFinanciero(
      { exento_mensualidad: false, ultimo_periodo_pagado: '2026-05-01' },
      hoy
    )
    expect(resultado.categoria).toBe('amarillo')
    expect(resultado.bloqueado).toBe(false)
    expect(resultado.dias_mora).toBeGreaterThanOrEqual(1)
    expect(resultado.dias_mora).toBeLessThan(60)
  })

  test('rojo — mora >= 60 días', () => {
    const hoy = new Date('2026-06-22')
    const resultado = calcularEstadoFinanciero(
      { exento_mensualidad: false, ultimo_periodo_pagado: '2026-04-01' },
      hoy
    )
    expect(resultado.categoria).toBe('rojo')
    expect(resultado.bloqueado).toBe(true)
    expect(resultado.dias_mora).toBeGreaterThanOrEqual(60)
  })

  test('verde — alumno exento (becado), sin importar mora', () => {
    const hoy = new Date('2026-06-22')
    const resultado = calcularEstadoFinanciero(
      { exento_mensualidad: true, ultimo_periodo_pagado: '2026-01-01' },
      hoy
    )
    // Un alumno becado es siempre verde, independientemente del último pago
    expect(resultado.categoria).toBe('verde')
    expect(resultado.bloqueado).toBe(false)
  })

  test('rechaza monto <= 0', () => {
    expect(() => validarMontoPago(0)).toThrow()
    expect(() => validarMontoPago(-100)).toThrow()
  })
})
```

### 5.2 Dominio: Inventario (`domain/comodato.js`)

```javascript
import { describe, test, expect } from 'vitest'
import { puedeAsignarse } from '../domain/comodato.js'

describe('puedeAsignarse', () => {

  test('rechaza instrumento en mantenimiento', () => {
    expect(puedeAsignarse({ estado_conservacion: 'mantenimiento', estado_uso: 'en_mantenimiento' }))
      .toBe(false)
  })

  test('rechaza instrumento de baja', () => {
    expect(puedeAsignarse({ estado_conservacion: 'de_baja', estado_uso: 'disponible' }))
      .toBe(false)
  })

  test('rechaza instrumento ya prestado', () => {
    expect(puedeAsignarse({ estado_conservacion: 'bueno', estado_uso: 'prestado' }))
      .toBe(false)
  })

  test('acepta instrumento disponible y en buen estado', () => {
    expect(puedeAsignarse({ estado_conservacion: 'bueno', estado_uso: 'disponible' }))
      .toBe(true)
  })
})
```

### 5.3 Integración de base de datos

| Caso | Tabla | Verifica |
|---|---|---|
| Insertar pago mensualidad mes actual | `pagos_alumnos` | Registro asociado al UUID del alumno con `periodo_mes` correcto |
| Insertar segunda mensualidad mismo mes | `pagos_alumnos` | Viola `uix_pagos_mensualidad_mes` → error de constraint |
| Insertar comodato activo | `comodatos_activos` → trigger | `inventario_activos.estado_uso` cambia a `'prestado'` |
| Actualizar comodato a `devuelto` | `comodatos_activos` → trigger | `inventario_activos.estado_uso` cambia a `'disponible'` |
| Insertar pago cuando mora > 60 días | `pagos_alumnos` → trigger | Fila creada en `hermes_inbox` con `categoria = 'mora_pago'` |

---

## 6. Integración con HERMES (Task Contract V1)

Este módulo es la **fuente de eventos** que HERMES necesita para emitir Task Contracts financieros.

**Flujo de morosidad:**

```
pagos_alumnos INSERT
    ↓ fn_emit_mora_event() trigger
hermes_inbox (categoria: 'mora_pago')
    ↓ HERMES cron (AGT-P08 / analyze-risk.js)
read-soi-policy.js busca 'FIN-P13' (Gestión Mora y Cobranza)
    ↓
Task Contract emitido a assignee.role_code: 'FIN-ENC'
    (Encargado de Finanzas → Katherine Sánchez)
```

**Prerequisito**: la política `FIN-P13_Gestion_Mora_y_Cobranza` debe existir en el vault SOI con `status: vigente`. Está pendiente en Ola 3 del `VAULT_AUDIT_REPORT_V1.md`. Sin ese P##, HERMES devuelve `policy_gap` y el contrato no se emite.

**Flujo de activo ocioso:**

```
alertasComodatosView detecta instrumento prestado a alumno inactivo
    ↓ botón "Notificar a HERMES"
hermes_inbox (categoria: 'activo_ocioso')
    ↓ HERMES cron
Task Contract emitido a assignee.role_code: 'LOG-ENC'
    (acción: "Solicitar devolución de instrumento {codigo}")
```

---

## 7. Escalabilidad Futura (sin cambios respecto a V1)

1. **Matrícula Online**: integración con Azul o CardNet (RD) / Stripe — HERMES registra la transacción en `pagos_alumnos` automáticamente al confirmar pago.
2. **QR en instrumentos**: cámara del móvil escanea código QR del estuche → carga historial de comodatos + estado en < 2 segundos.
3. **Reporte de mora automatizado**: HERMES genera PDF de estado de cuenta por alumno los viernes (snapshot financiero) → adjunto en Telegram.

---

## 8. Resumen de cambios respecto a SIS-SPEC-ERP-V1

| Gap | Problema en V1 | Solución en V2 |
|---|---|---|
| G1 | `pagos_alumnos` sin `periodo_mes` — mora incalculable | Columna `periodo_mes DATE NOT NULL` + índice único parcial por `mensualidad` |
| G2 | "Activos ociosos" declarado en §1 pero sin feature en §2 | Vista `alertasComodatosView.js` + query JOIN comodatos × alumnos inactivos |
| G3 | RLS verificaba `maestros.es_admin` — falla si admin no es maestro | Usa `es_admin()` del framework RLS existente (JWT claim) |
| G4 | Trigger documentado en §5 pero DDL ausente en §3 | `fn_sync_estado_uso_activo()` + `trg_comodato_sync_estado_uso` incluidos en migración |
| G5 | Generador PDF sin spec técnico | `jsPDF` (ya en `pdfDemoView.js`) + Supabase Storage + firma física en papel |
| G6 | `acepta_pago_600` en tests sin regla documentada | `exento_mensualidad BOOLEAN` en `alumnos` + regla en `calcularEstadoFinanciero` |
| G7 | Sin conexión a HERMES / Task Contract | `fn_emit_mora_event()` + `hermes_inbox` + flujo documentado en §6 |

---

*Spec co-desarrollado: propuesta estructural ANTIGRAVITY (SIS-SPEC-ERP-V1) + revisión técnica Claude Sonnet 4.6 (SIS-SPEC-ERP-V2). Coordinación vía ENGRAM topic_key `erp-expansion/agent-coordination` (project: omedsunriv).*

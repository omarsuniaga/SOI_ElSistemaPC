# Diseño — Módulo Pedagógico: Perfil de Conocimiento del Alumno + Cockpit del Director

**Fecha:** 2026-06-08
**Estado:** Diseño aprobado en brainstorming (pendiente review final del usuario)
**Subsistema:** A (de 8) — columna vertebral del módulo Pedagógico

---

## 1. Contexto y problema de raíz

El módulo Pedagógico tiene mucho construido pero **tres mitades que no se hablan**:

1. **Entrada**: el maestro escribe observaciones por sesión en `observaciones_sesion`
   (16 filas reales, DSL/prosa). `contenido_parsed` está en `NULL` → no se parsean.
2. **Lectura de riesgo**: `detectObservationRisk`
   (`src/modules/pedagogico/services/studentRiskDetectorService.js:81`) consulta
   `observaciones_alumnos`, que tiene **0 filas**.
3. **Puente**: existe (`src/services/workers/observationPromotionCron.js`) pero es un
   `node-cron` que requiere un proceso Node corriendo. En una PWA estática **no corre nunca**.
   El puente está construido pero desenchufado.

**Consecuencia:** lo que el maestro escribe a diario cae en un cajón que nadie lee.
El riesgo se calcula solo con asistencias/justificaciones (lo menos pedagógico).

**La optimización central:** reconectar la tubería
`observación → extracción → perfil del alumno → vista del director`.

---

## 2. Inventario: qué se mantiene, qué se poda

### Mantener y potenciar (el 20% que importa)
- **Captura DSL** (`src/shared/utils/dslParser.js`): `#alumno [contenido] >OBJ-123 {tarea}
  (sugerencia) $medida 4/5`. Input bueno, baja fricción. Solo falta procesarlo.
- **Motor de reglas + casos + alertas**: `seguimiento_reglas` (4), `student_cases` (2),
  `student_case_alerts` (5). Esqueleto de "quién va mal → escalar".
- **Modales de acción**: `CaseLetterModal`, `CaseActionModal` → cartas de amonestación YA modeladas.
- **Currículo**: `routes→route_versions→blocks→levels→nodes→indicators` (4163 indicadores).
- **Cumplimiento de maestros**: `cumplimientoMaestrosWidget`, `analyticsFillingBehavior`
  (admin-dashboard) → responde "¿el maestro registra?".

### Podar o congelar (ruido / prematuro)
- Gamificación: `xp_log`, `rachas`, `logros`, `alumnos_logros` (todas 0 filas).
- DEPRECATED: `plan_clases`, `plan_niveles`, `plan_temas`, `plan_objetivos`, `plan_indicadores`.
- Estructuras vacías nunca usadas: `class_events`, `class_event_methodology`,
  `homework_assignments`, `planned_content`, `indicator_sessions`.
- `observaciones_alumnos` como tabla separada que nada llena (se reemplaza por el perfil).

---

## 3. Decisiones de diseño (cerradas en brainstorming)

| # | Decisión | Elección |
|---|----------|----------|
| 1 | Consumidor principal | **Ambos**: maestro (planifica) + director (evalúa). Un perfil, dos lentes. |
| 2 | Estructura del conocimiento | **Híbrido**: anclado al currículo (`indicators`) donde mapea + dimensiones abiertas extraídas por IA (escalas, repertorio, técnicas). |
| 3 | Confianza de la IA | **Confirmación por confianza**: alta confianza entra solo; lo dudoso queda "propuesto" y el maestro confirma. Cada dato guarda su evidencia (observación origen). |
| 4 | Madurez | **Niveles evolutivos + historial**: `introducido → en_progreso → dominado`, con timestamp de cada cambio. |
| 5 | Momento de extracción | **Near-real-time al guardar** (1 llamada LLM) + pre-fill determinístico de tokens DSL. |
| — | Motor | **Enfoque ①**: LLM con extracción estructurada + subconjunto curricular en el prompt + pre-fill DSL. |
| — | Alcance v1 | **Motor + reconectar tubería + Cockpit del Director** (reusa modales de amonestación). |

---

## 4. Modelo de datos

### 4.1 Nueva tabla: `perfil_conocimiento`
Aserciones de conocimiento por alumno (una fila = un ítem de conocimiento).

```
perfil_conocimiento
├─ id                uuid PK
├─ alumno_id         uuid FK → alumnos
├─ dimension         text  -- 'objetivo' | 'escala' | 'repertorio' | 'tecnica' | 'problema'
├─ item              text  -- "Escala de La mayor, 1 octava" | "Canzon" | etc.
├─ indicator_id      uuid FK → indicators (NULL si es dimensión abierta no curricular)
├─ madurez           text  -- 'introducido' | 'en_progreso' | 'dominado'
├─ confianza         numeric(3,2)  -- 0.00–1.00
├─ estado            text  -- 'propuesto' | 'confirmado' | 'descartado'
├─ origen_obs_id     uuid FK → observaciones_sesion  -- trazabilidad (evidencia)
├─ evidencia_texto   text  -- el span de prosa que justifica la aserción
├─ creado_por        text  -- 'ia' | 'dsl' | 'maestro'
├─ created_at        timestamptz
└─ updated_at        timestamptz
```

### 4.2 Nueva tabla: `perfil_conocimiento_historial`
Trayectoria de madurez (append-only).

```
perfil_conocimiento_historial
├─ id              uuid PK
├─ perfil_id       uuid FK → perfil_conocimiento
├─ madurez_old     text (NULL en alta)
├─ madurez_new     text
├─ origen_obs_id   uuid FK → observaciones_sesion
└─ created_at      timestamptz
```

### 4.3 Reutilización
- Riesgo por observación pasa a leer `perfil_conocimiento` (dimension='problema')
  en vez de `observaciones_alumnos` (corrige el bug del §1).
- Casos/alertas/amonestaciones siguen igual; el cockpit los dispara.

---

## 5. Pipeline de extracción (Enfoque ①)

```
Maestro guarda observación (es_borrador=false)
        │
        ▼
[1] Edge Function  extract-knowledge  (verify_jwt, service role)
        │
        ├─ a. Pre-fill DSL determinístico
        │     parseDSL(contenido_raw) → #alumnos, >OBJ-123, [contenido], 4/5
        │     → aserciones confianza=1.0, creado_por='dsl', estado='confirmado'
        │
        ├─ b. Cargar contexto curricular
        │     ruta/nivel/nodo de la clase de esa sesión
        │     → subconjunto de indicators (NO los 4163, solo los del nivel actual)
        │
        ├─ c. Llamada LLM (vía groq-proxy existente)
        │     prompt = prosa + lista alumnos + subconjunto indicators
        │     respuesta = JSON estricto:
        │       [{ alumno, dimension, item, indicator_id?, madurez, confianza, evidencia }]
        │
        ├─ d. Persistir en perfil_conocimiento
        │     confianza ≥ 0.85  → estado='confirmado'
        │     confianza <  0.85  → estado='propuesto'
        │     si cambia madurez de un ítem existente → fila en _historial
        │
        └─ e. Devolver propuestas al frontend
              → el maestro ve "N propuestas para confirmar" en el momento
```

**Costo:** 1 llamada LLM por guardado. **Fallback:** si el LLM falla, las aserciones
DSL (paso a) igual entran; el enriquecimiento IA se reintenta en un batch nocturno
(reusar `observationPromotionCron` migrado a pg_cron / edge cron).

---

## 6. Wireframes ASCII

### 6.1 Cockpit del Director  (`pedagogico-cockpit`)
Vista de evaluación: nivel de cada alumno sin conocerlo en persona + quién va mal + acción.

```
┌────────────────────────────────────────────────────────────────────────┐
│  COCKPIT PEDAGÓGICO — Director                      [Programa ▾][Clase ▾]│
├────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │ Alumnos  │ │ En riesgo│ │ Casos    │ │ Cobertura│   ← KPIs            │
│  │   87     │ │   12 ⚠   │ │ abiertos │ │ currículo│                     │
│  │          │ │          │ │    2     │ │   34%    │                     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                     │
├────────────────────────────────────────────────────────────────────────┤
│  Filtros: [Riesgo ▾] [Maestro ▾] [Buscar alumno...]                      │
├────────────────────────────────────────────────────────────────────────┤
│  ALUMNO              MAESTRO      NIVEL        PROGRESO   RIESGO  ACCIÓN  │
│  ─────────────────────────────────────────────────────────────────────  │
│  Dyakenson P.        J. Coltrane  Violín N2    ▓▓▓▓░ 72%   —      [Ver]   │
│  Yangel Jair M.      M. Davis     Violín N2    ▓▓░░░ 38%   alto   [Ver]   │
│                                                          ⚠ desfase solos  │
│                                                          [Amonestar ▾]    │
│  ...                                                                     │
└────────────────────────────────────────────────────────────────────────┘
  [Amonestar ▾] → reusa CaseActionModal / CaseLetterModal (carta PDF)
```

### 6.2 Perfil de Conocimiento del Alumno  (`pedagogico-perfil/:alumnoId`)
Mismo dato, lente del maestro (accionable) + lente del director (evaluable).

```
┌────────────────────────────────────────────────────────────────────────┐
│  ← Dyakenson Pierre — Violín, Nivel 2          Orquesta: 2da fila, atril 3│
├────────────────────────────────────────────────────────────────────────┤
│  PROGRESO GENERAL   ▓▓▓▓▓▓▓░░░ 72%        Última obs: 2026-06-05         │
├──────────────────────────────┬─────────────────────────────────────────┤
│  ESCALAS (3)                  │  REPERTORIO (2)                          │
│   ● La mayor 1 oct  dominado  │   ● Canzon          en_progreso          │
│   ● Re mayor 1 oct  en_prog.  │   ● Himno Nac.      dominado             │
│   ◐ Sol mayor       introd.   │                                          │
├──────────────────────────────┼─────────────────────────────────────────┤
│  TÉCNICAS (4)                 │  OBJETIVOS CURRICULARES                  │
│   ● Detaché      dominado     │   >VL-N2-12 afinación   ▓▓▓▓░ dominado   │
│   ● Legato       en_progreso  │   >VL-N2-15 posición    ▓▓░░░ en_prog.   │
│   ◐ Spiccato     introducido  │   ...                                    │
├──────────────────────────────┴─────────────────────────────────────────┤
│  ⚠ PROPUESTAS POR CONFIRMAR (2)                                          │
│   "domina vibrato lento"  evid: obs 2026-06-05   [Confirmar] [Descartar] │
│   "problema desfase solos" evid: obs 2026-06-05  [Confirmar] [Descartar] │
├────────────────────────────────────────────────────────────────────────┤
│  TRAYECTORIA  (historial de madurez)            [Descargar PDF]          │
│   La mayor:  introd.(04-12) → en_prog.(05-03) → dominado(06-05)          │
└────────────────────────────────────────────────────────────────────────┘
  ●=confirmado  ◐=propuesto      Leyenda madurez: introducido/en_progreso/dominado
```

---

## 7. Componentes (responsabilidad única)

| Unidad | Qué hace | Depende de |
|--------|----------|-----------|
| Edge Function `extract-knowledge` | prosa → aserciones JSON | groq-proxy, indicators, dslParser |
| `perfilConocimientoApi.js` | CRUD perfil + confirmar/descartar propuestas | supabase |
| `knowledgeExtractionService.js` (front) | dispara extracción al guardar obs, muestra propuestas | api |
| `cockpitDirectorView.js` | tablero director (KPIs + tabla + acción) | api, casesService, modales |
| `perfilAlumnoView.js` | perfil individual (2 lentes) | api |
| `perfilPdfExport.js` | genera PDF del perfil (reusa document_templates) | jsPDF/plantillas |

---

## 8. Checklist TDD (orden rojo→verde)

**Extracción (servicio puro, mockear LLM):**
- [ ] `parseDSL` pre-fill: `>VL-N2-12` → aserción dimension='objetivo', indicator_id resuelto, confianza=1.0
- [ ] `#alumno` mapea al alumno_id correcto de la sesión
- [ ] aserción IA confianza ≥0.85 → estado='confirmado'; <0.85 → 'propuesto'
- [ ] cambio de madurez de ítem existente → inserta fila en `_historial`
- [ ] LLM falla → aserciones DSL igual persisten (fallback)
- [ ] item duplicado (misma dimension+item+alumno) → upsert, no duplica

**API:**
- [ ] `confirmarPropuesta` → estado pasa a 'confirmado'
- [ ] `descartarPropuesta` → estado='descartado', no aparece en perfil
- [ ] `getPerfil(alumnoId)` agrupa por dimensión, excluye descartados
- [ ] riesgo por observación lee perfil (dimension='problema'), no `observaciones_alumnos`

**Vistas (smoke + acceso):**
- [ ] cockpit y perfil requieren rol admin/director (accessControl)
- [ ] cockpit lista alumnos con su nivel/progreso/riesgo
- [ ] botón Amonestar abre `CaseActionModal`

---

## 9. Roadmap (subsistemas B–H, después de A)

| # | Subsistema | Relación con A |
|---|-----------|----------------|
| B | Chatbot pedagógico | **Interfaz de entrada** al mismo motor de extracción (reusa `extract-knowledge`) |
| C | Alumnos en riesgo (detalle) | **Consume** perfil (dimension='problema') |
| D | Ruta de contenido / planificación por clase | **Alimenta** el contexto curricular del motor |
| E | Tracking de progreso del alumno | **Es** la trayectoria del perfil (`_historial`) |
| F | Tracking de clase | **Agrega** perfiles de la clase + asistencias |
| G | Reporte PDF detallado | **Consume** perfil (ya esbozado en §6.2) |
| H | Plantilla/guía de trabajo | `document_templates` + flujo de llenado |

Cada subsistema = su propio ciclo spec → plan → implementación.

---

## 10. Riesgos y mitigaciones

- **Calidad de extracción IA** → mitigar con subconjunto curricular acotado en prompt +
  confirmación por confianza + evidencia trazable. Medir % de propuestas confirmadas vs descartadas.
- **Costo LLM** → 1 llamada por guardado; pre-fill DSL reduce lo que la IA infiere.
- **Migración del cron roto** → mover `observationPromotionCron` a pg_cron o edge cron
  (el `node-cron` no corre en PWA estática).
- **Poda** → congelar (no borrar) gamificación y tablas deprecated hasta confirmar que nada las lee.
```

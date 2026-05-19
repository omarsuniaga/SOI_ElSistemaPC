# 📄 DOCUMENTO MAESTRO: SDD ausenciaModal v2
**Estado**: Listo para SDD completo
**Fecha creación**: 2026-05-18
**Tokens estimados**: ~400K (implementación completa con tests + verify + archive)

---

## 🎯 PROBLEMA Y VISIÓN

### Situación Actual
El archivo `src/portal-maestros/components/ausenciaModal.js` es un formulario para solicitar ausencias, pero tiene **errores lógicos y gráficos**:
- Captura datos (duracion_tipo, actividades, archivo) que **no persisten en BD**
- Sin búsqueda de disponibilidad de salones
- Sin notificación real al director
- Sin integración WhatsApp
- Fallback a localStorage en error (data loss)
- Schema mismatch entre form ↔ BD

### Visión Final
Sistema completo de solicitudes de ausencia donde maestro:
1. Solicita ausencia (qué, cuándo, por qué)
2. **Elige cobertura**: reprogramar en otro horario/salon O asignar a maestro suplente
3. Adjunta documento soporte (PDF/JPG)
4. **Genera mensaje WhatsApp** (copyable, sin API Twilio)
5. Director recibe notificación y aprueba/rechaza
6. Sistema actualiza estado y notifica al maestro

---

## ✅ DECISIONES TOMADAS (NO DISCUTIR)

| Decisión | Valor | Razón |
|----------|-------|-------|
| WhatsApp | Copiar/pegar manual (sin Twilio) | Sin API contratada |
| Disponibilidad salones | Cualquier horario/fecha | Máxima flexibilidad |
| Asignación maestro | Solo tutores/suplentes de esa clase | Minimizar fricción |
| File upload storage | Supabase Storage bucket `documentos` | Patrón existente en codebase |
| Notificación director | In-app + notificaciones table | Infraestructura lista |
| Modal base | AppModal singleton pattern | Patrón existente |

---

## 📊 ARQUITECTURA EN CAPAS

### 1️⃣ **Database Layer** (NEW Migration)
**File**: `supabase/migrations/20260520_extend_ausencias_schema.sql`

```sql
-- ALTER existing table
ALTER TABLE ausencias_maestros 
  ADD COLUMN IF NOT EXISTS duracion_tipo TEXT CHECK (duracion_tipo IN ('un_dia', 'varios_dias')),
  ADD COLUMN IF NOT EXISTS clase_emergente_id UUID REFERENCES clases(id),
  ADD COLUMN IF NOT EXISTS archivo_url TEXT,
  ADD COLUMN IF NOT EXISTS director_notificacion_id UUID REFERENCES notificaciones(id);

-- NEW junction table: which clases are affected
CREATE TABLE IF NOT EXISTS ausencias_clases_afectadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ausencia_id UUID NOT NULL REFERENCES ausencias_maestros(id) ON DELETE CASCADE,
  clase_id UUID NOT NULL REFERENCES clases(id),
  actividad_reemplazo TEXT NOT NULL, -- what student will do while teacher absent
  director_aprobacion TEXT,           -- director's notes/decision (if any)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- NEW tracking table: who was notified and when
CREATE TABLE IF NOT EXISTS ausencias_notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ausencia_id UUID NOT NULL REFERENCES ausencias_maestros(id) ON DELETE CASCADE,
  notificacion_id UUID REFERENCES notificaciones(id),
  tipo TEXT DEFAULT 'director_alert', -- director_alert | confirmation | etc
  estado TEXT DEFAULT 'pendiente',     -- pendiente | leida | actuado
  created_at TIMESTAMPTZ DEFAULT now(),
  leida_en TIMESTAMPTZ,
  actuado_en TIMESTAMPTZ
);

CREATE INDEX idx_ausencias_clases_afectadas_ausencia ON ausencias_clases_afectadas(ausencia_id);
CREATE INDEX idx_ausencias_notificaciones_ausencia ON ausencias_notificaciones(ausencia_id);
```

### 2️⃣ **Service Layer** (NEW files)

#### File: `src/portal-maestros/services/ausenciaService.js`
**Core business logic** (no Supabase imports in function bodies, injectable)

```javascript
// Key functions to implement:
export async function crearSolicitudAusencia(formData, supabase) {
  // formData = {
  //   maestro_id, tipo_ausencia, urgencia, duracion_tipo,
  //   fecha_inicio, fecha_fin, motivo,
  //   clases_afectadas: [{ claseId, actividadReemplazo }, ...],
  //   clase_emergente: { claseId?, fechaNueva?, horaNueva?, salonIdNuevo? },
  //   maestro_suplente: { maestroId?, claseId? },
  //   archivo_url: null | 'path/to/file',
  //   notificar_director: boolean
  // }
  
  // 1. Validate form data (use ausenciaValidator)
  // 2. Create ausencia_maestros row
  // 3. Create ausencias_clases_afectadas rows (one per affected class)
  // 4. If clase_emergente.activo, update clase to point to new horario/salon
  // 5. If maestro_suplente.activo, create notification for suplente
  // 6. If notificar_director, create notificaciones entry
  // 7. Return { id, estado: 'pendiente', notification_id }
}

export async function buscarSalonesDisponibles(fechas, supabase) {
  // fechas = [dateStart, dateEnd] or single date
  // Returns array of salons with availability per date/time
  // Query: salones JOIN reservas_salones to find conflicts
  // Filter to only free slots
}

export async function buscarMaestrosSuplentes(claseId, supabase) {
  // Returns tutores/maestros suplentes for that clase
  // Query: clases JOIN profile (maestro_principal, maestros_suplentes)
  // Return list with availability status
}

export function prepararMensajeWhatsApp(ausencia, clasesAfectadas) {
  // Returns formatted text string for WhatsApp copy/paste:
  // Solicitud de ausencia
  // Maestro: [nombre]
  // Tipo: [tipo_ausencia]
  // Urgencia: [urgencia]
  // Fechas: [fecha_inicio] - [fecha_fin]
  // Clases afectadas: [N classes]
  // Solución: [cobertura plan]
  // [Mensaje pedido del maestro]
  // --------
  // [Deep link to director approval portal]
}

export async function notificarDirector(ausenciaId, maestro, clasesAfectadas, supabase) {
  // Create notificaciones entry
  // Returns notification_id
}
```

#### File: `src/portal-maestros/services/ausenciaValidator.js`
**Validation rules** (pure functions, no DB calls)

```javascript
export function validarRangoFechas(fechaInicio, fechaFin) {
  // ✓ fechaInicio < fechaFin
  // ✓ fechaInicio >= today
  // ✓ No más de 30 días
}

export function validarMotivo(motivo) {
  // ✓ 10-500 caracteres
  // ✓ No empty
}

export function validarClasesAfectadas(clases) {
  // ✓ At least 1 class
  // ✓ Each has actividadReemplazo (non-empty)
}

export function validarCobertura(claseEmergente, maestroSuplente) {
  // ✓ If both active, error
  // ✓ If claseEmergente: must have fecha, hora, salon
  // ✓ If maestroSuplente: must have maestroId, claseId
}

export function validarArchivo(file) {
  // ✓ File size <= 5MB
  // ✓ File type in [pdf, jpg, jpeg, png]
}
```

### 3️⃣ **Component Layer** (REWRITE)

#### File: `src/portal-maestros/components/ausenciaModal.js`
**Completely rewritten** (keep AppModal pattern, improve state + form)

**Key improvements**:
1. Split form into 5 logical sections (not wall of HTML)
2. Add tab interface for coverage options (reprogramar vs asignar maestro)
3. Real-time availability filtering
4. WhatsApp message auto-generation
5. File upload with progress
6. Better error handling + validation feedback

**State structure**:
```javascript
state = {
  // Core form
  duracionTipo: 'un_dia' | 'varios_dias',
  fechaInicio: null,
  fechaFin: null,
  tipoAusencia: null,
  urgencia: 'media',
  motivo: '',
  
  // Affected classes
  clasesAfectadas: [
    { claseId, className, sessionDate, sessionTime, actividadReemplazo: '' }
  ],
  
  // Coverage option 1: Reschedule
  claseEmergente: {
    activo: false,
    claseId: null,
    fechaNueva: null,
    horaNueva: null,
    salonIdNuevo: null,
    salonesDisponibles: [],
    loadingSalones: false
  },
  
  // Coverage option 2: Assign substitute
  maestroSuplente: {
    activo: false,
    maestroId: null,
    claseId: null,
    maestrosDisponibles: [],
    loadingMaestros: false
  },
  
  // File upload
  archivo: {
    file: null,
    uploadedUrl: null,
    uploading: false,
    error: null
  },
  
  // WhatsApp
  whatsappText: '', // auto-generated
  
  // UI state
  validationErrors: {},
  submitting: false,
  notificarDirector: true
}
```

**Form HTML structure** (5 sections):
```
1. TIPO Y URGENCIA
   - Radio buttons: tipo_ausencia (5 options)
   - Dropdown: urgencia (3 options)

2. FECHAS Y DURACIÓN
   - Toggle: un_dia / varios_dias
   - Date input(s): fecha_inicio [, fecha_fin]
   - Live preview: "Del X al Y (N días)"

3. CLASES AFECTADAS
   - Auto-loaded list from sesiones table
   - Checkboxes to select which affected
   - Text input per class: "¿Qué harán los alumnos?"

4. COBERTURA (Tabbed section)
   Tab A: REPROGRAMAR CLASE
   - Date picker (shows availability)
   - Time picker (derived from clase original or free slots)
   - Salon selector (auto-filtered by date+time+size)
   - Preview: "Clase será el X a las Y en Salon Z"
   
   Tab B: ASIGNAR MAESTRO SUPLENTE
   - Dropdown: list of tutores/suplentes
   - Show availability badge
   - Message to teacher: "Se notificará a [maestro]"

5. DOCUMENTO SOPORTE
   - File input (PDF/JPG/PNG, 5MB max)
   - Upload progress bar
   - Success checkmark

6. MENSAJE WHATSAPP
   - Auto-generated readonly textarea
   - Copy button (copies to clipboard)
   - Send via WhatsApp button (opens WhatsApp web/app)

7. CONFIRMACIÓN
   - Checkbox: "Notificar al director automáticamente"
   - Shows director name
```

**Key event handlers**:
- `onDurationChange()` - toggle single/range date
- `onDateChange()` - trigger salon availability fetch
- `onTabChange()` - switch between reschedule/substitute
- `onSalonSelected()` - lock in salon
- `onMaestroChange()` - select substitute teacher
- `onFileSelect()` - handle file input, validate, upload
- `generateWhatsAppText()` - format copyable message
- `copyToClipboard()` - WhatsApp text copy
- `openWhatsApp()` - deep link to WhatsApp
- `handleSubmit()` - validate all, create ausencia, notify director

### 4️⃣ **Admin Portal Layer** (NEW - Director Approval)

#### File: `src/modules/admin-aprobacion/components/ausenciaAprobacionCard.js`
**Card showing single absence for director**

```javascript
// Shows:
// - Maestro name + photo
// - Tipo, urgencia, dates
// - Affected classes + count
// - Coverage plan summary
// - Approve / Reject buttons
// - Director notes textarea
// - File attachment preview (if any)
```

#### File: `src/modules/admin-aprobacion/views/ausenciasAdminView.js`
**Dashboard for director to manage absences**

```javascript
// Shows:
// - List of ausencias (pendiente, aprobada, rechazada)
// - Filter by status / date / teacher / urgencia
// - Bulk actions (approve multiple)
// - Click to see full details + approve/reject
// - Audit trail of decisions
```

---

## 🔄 IMPLEMENTATION PHASES (SDD CYCLE)

### PHASE 1: Database + Services
**Duration**: 1-2 hours | **Tests**: 12 | **Files**: 4 new, 1 migration

**Tasks**:
- T1: Create migration (`20260520_extend_ausencias_schema.sql`)
- T2: Create `ausenciaService.js` with 5 core functions
- T3: Create `ausenciaValidator.js` with 6 validation functions
- T4: Create `ausenciaAprobacionCard.js` (director UI)
- Tests: Coverage for all business logic + edge cases

**Deliverable**: PR-Ausencia-1 (DB + backend logic)

### PHASE 2: Component Rewrite
**Duration**: 2-3 hours | **Tests**: 8 | **Files**: 1 major rewrite

**Tasks**:
- T5: Rewrite `ausenciaModal.js` (5 form sections)
- T6: Integrate file upload (planningDocService pattern)
- T7: Implement salon availability search
- T8: Implement maestro suplente selection
- T9: Generate WhatsApp message + copy/share
- Tests: Form logic, state management, event handlers

**Deliverable**: PR-Ausencia-2 (Maestro-side form)

### PHASE 3: Director Approval Workflow
**Duration**: 1-2 hours | **Tests**: 4 | **Files**: 1 new

**Tasks**:
- T10: Create `ausenciasAdminView.js` (dashboard)
- T11: Implement approval/rejection handlers
- T12: Update ausencia state + notify maestro
- Tests: Approval workflow, state transitions

**Deliverable**: PR-Ausencia-3 (Director-side approval)

**Total**: 3 chained PRs, 24 tests, SDD cycle with verify + archive

---

## 🗄️ KEY EXISTING FILES TO REUSE

### Patterns to Follow
| Pattern | File | Notes |
|---------|------|-------|
| Modal base | `src/shared/components/AppModal.js` | Use singleton pattern |
| File upload | `src/portal-maestros/services/planningDocService.js` | Reuse uploadPlanningDoc() |
| Notifications | `src/portal-maestros/services/notificationService.js` | Create notificaciones table entries |
| Salon queries | `src/modules/salones/api/salonesApi.js` | Use obtenerSalones() |
| Conflict check | `src/modules/clases/api/clasesApi.js` | Reuse verificarSolapamiento() logic |
| Complex forms | `src/modules/planificacion/components/planificacionModal.js` | Inspiration for multi-section modal |

### Database Relations to Query
```
ausencias_maestros
  ├─ maestro (via maestro_id → profiles)
  ├─ ausencias_clases_afectadas (1:N)
  │   ├─ clase (via clase_id → clases)
  │   │   ├─ sesiones (via clase_id → sesiones)
  │   │   └─ maestro_principal (via maestro_principal_id → profiles)
  │   └─ maestro_suplente (if assigned)
  ├─ clase_emergente (if rescheduled, via clase_emergente_id → clases)
  ├─ salones (for availability query)
  ├─ reservas_salones (for conflict detection)
  └─ notificaciones (via director_notificacion_id)
```

---

## 🧪 TESTING STRATEGY

### Phase 1 Tests (12)
- **Service validation** (4): validate functions, edge cases, errors
- **Database queries** (4): salon availability, suplentes, classes affected
- **Notifications** (4): director notification creation, state transitions

### Phase 2 Tests (8)
- **Form logic** (3): state changes, validations, error handling
- **File upload** (2): success path, error handling
- **WhatsApp text** (2): formatting, copy/paste
- **Event handlers** (1): salon/maestro selection effects

### Phase 3 Tests (4)
- **Approval workflow** (2): approve, reject, state updates
- **Maestro notification** (1): after director acts
- **Audit trail** (1): decisions are logged

**Total**: 24 tests, all with strict TDD (tests first)

---

## 🔐 SECURITY / RLS CONSIDERATIONS

1. **RLS for ausencias_maestros**:
   - Maestro can only see/update own ausencias
   - Director can see all ausencias for their institution
   - Implement via RLS policies on ausencias_maestros table

2. **File upload**:
   - Only owner maestro can access their ausencia files
   - Use Supabase Storage policies + signed URLs if needed

3. **Notifications**:
   - Only director gets director_alert notifications
   - Use profiles(role) for authorization

4. **Input validation**:
   - Sanitize motivo text (XSS prevention)
   - Validate UUIDs before DB queries
   - Use parameterized queries (Supabase handles this)

---

## 📝 INSTRUCTIONS FOR NEXT AGENT

### Setup
1. Read this document completely
2. Confirm you understand: **phase 1 → phase 2 → phase 3** (sequential)
3. No parallel work (Phase 2 depends on Phase 1, etc.)
4. Strict TDD: Write tests FIRST, then implementation

### Execution
1. **Start with Phase 1**:
   - Create migration file
   - Create both service files
   - Write 12 tests (all RED)
   - Implement services (all GREEN)
   - Run tests, verify PASS

2. **Then Phase 2**:
   - Rewrite ausenciaModal.js
   - Integrate file upload + WhatsApp
   - Write 8 tests
   - Verify all tests PASS

3. **Then Phase 3**:
   - Create admin view + dashboard
   - Write 4 tests
   - Verify all tests PASS

### SDD Workflow
1. Launch **sdd-apply** with this document as context
2. Use **haiku** model (token optimization)
3. Each phase is 1 PR, chained: PR1 → PR2 → PR3
4. After apply, run **sdd-verify**
5. After verify, run **sdd-archive**

### Critical Success Criteria
- [ ] All 24 tests PASS
- [ ] File upload works end-to-end
- [ ] Salon availability search accurate
- [ ] WhatsApp text copyable + formatted
- [ ] Director receives notification
- [ ] Approval workflow complete
- [ ] Zero regressions in existing tests
- [ ] Schema changes idempotent

### Blockers / Fallbacks
- **If migration fails**: Check RLS policies on existing ausencias_maestros
- **If file upload fails**: Verify Supabase Storage bucket `documentos` exists
- **If salon search slow**: Add index on clase_horarios(fecha, hora)
- **If director not notified**: Check notificationService.js integration

---

## 📞 HANDOFF CHECKLIST

**Before next agent starts**:
- [ ] This document is in codebase: `AUSENCIA_MODAL_SDD_MAESTRO.md`
- [ ] Plan file exists: `.claude/plans/twinkling-popping-hamster.md`
- [ ] Current branch has latest code
- [ ] Supabase project is accessible
- [ ] Agent understands: 3 phases, chained PRs, strict TDD

**Next agent will**:
1. Read this document
2. Create tasks via TaskCreate (12 tasks total)
3. Execute Phase 1 completely with tests
4. Mark tasks complete as they go
5. Run sdd-verify after Phase 3
6. Run sdd-archive to close

---

**Generated**: 2026-05-18 UTC
**Status**: ✅ Ready for SDD execution by next agent
**Tokens estimated for SDD completion**: ~400K
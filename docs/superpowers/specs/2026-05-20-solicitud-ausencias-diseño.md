# Sistema Profesional de Solicitud de Ausencias

**Fecha:** 2026-05-20  
**Status:** Design Phase - Ready for Review  
**Scope:** Rediseño completo del sistema de solicitud de ausencias con flujo escalado (Maestro → Director → Admin)

---

## 1. Visión General

Sistema profesional de solicitud de ausencias con flujo de aprobación escalado que simplifica la experiencia del maestro (3 pasos vs 5 actuales), proporciona transparencia al director sobre cobertura de clases, y da control centralizado al admin para auditoria y registros.

**Stakeholders:**
- **Maestros:** Solicitan ausencias
- **Directores:** Revisan y aprueban (validación de cobertura)
- **Admin/Recursos Humanos:** Aprobación final y auditoría
- **Sistema:** Validaciones automáticas, notificaciones, tracking

---

## 2. Problemas Actuales

| Problema | Impacto | Solución |
|----------|---------|----------|
| Modal con 5 pasos | Experiencia compleja, alta fricción | Reducir a 3 pasos |
| `AppModal.updateBody()` no existe | Error en runtime al cambiar opciones | Rerender completo simple |
| Sin panel director | No hay revisión intermedia | Crear panel con revisión |
| Sin aprobación multi-nivel | Control débil | Flujo: Solicitada → En Revisión → Pendiente Admin → Aprobada |
| Sin auditoría | No hay registro de quién decidió qué | Tabla de auditoría (quién, cuándo, notas) |
| Sin validaciones | Solicitudes inválidas llegan al admin | Validar: 48h anticipación, documentación, fechas |

---

## 3. Arquitectura

```
PORTAL MAESTROS (Frontend)
├── ausenciaModal.js (REDISEÑADO - 3 pasos)
│   ├── Paso 1: Fechas & Tipo
│   ├── Paso 2: Clases Afectadas (previsualización)
│   └── Paso 3: Revisar & Enviar
├── ausenciasPanel.js (Panel lateral - sin cambios)
└── ausenciaHistorial.js (Mejorado - mostrar estado)

ADMIN APROBACION (Frontend)
├── ausenciasDirectorView.js (NUEVO)
│   └── Panel director: revisar solicitudes
└── ausenciasAdminView.js (MEJORADO)
    └── Panel admin: aprobar/rechazar final

BACKEND (API + Validaciones)
├── ausenciasApi.js (MEJORADO)
│   ├── POST /ausencias (crear)
│   ├── GET /ausencias/pendientes (director)
│   ├── PUT /ausencias/:id/revisar (director)
│   ├── PUT /ausencias/:id/aprobar (admin)
│   └── PUT /ausencias/:id/rechazar (admin)
├── ausenciaValidator.js (AMPLIADO)
│   ├── Validar 48h anticipación
│   ├── Validar documentación requerida
│   └── Validar fechas pasadas
└── ausenciaService.js (SIN CAMBIOS PRINCIPALES)

DATABASE
├── ausencias_maestros (AMPLIADO - nuevas columnas)
├── ausencias_auditoria (NUEVA - histórico decisiones)
└── ausencias_validaciones (NUEVA - configuración por tipo)
```

---

## 4. Flujo de Estados

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO COMPLETO                           │
└─────────────────────────────────────────────────────────────┘

PASO 1: MAESTRO SOLICITA
  maestro_id: UUID
  estado: "solicitada"
  fecha_solicitud: timestamp
  ↓
  [Sistema valida]
  - 48h anticipación ✓
  - Fechas no pasadas ✓
  - Documentación requerida ✓

PASO 2: DIRECTOR REVISA
  estado: "en_revision"
  revisado_por: director_id (NULL hasta que revisa)
  revision_notas: text
  revision_en: timestamp
  ↓
  [Director puede]
  - Ver clases afectadas + cobertura
  - Agregar comentarios
  - Aprobar → "pendiente_admin"
  - Rechazar → "rechazada" (FIN)
  - Solicitar más info → vuelve a "solicitada"

PASO 3: ADMIN APRUEBA (FINAL)
  estado: "pendiente_admin"
  aprobado_por: admin_id (NULL hasta que aprueba)
  decision_notas: text
  decidido_en: timestamp
  ↓
  [Admin puede]
  - Ver solicitud + revisión director
  - Aprobar → "aprobada" (FIN - registrada)
  - Rechazar → "rechazada" (FIN)

ESTADO FINAL
  - "aprobada": Ausencia registrada, clases cubiertas
  - "rechazada": Notificar maestro con razón
  - "solicitada": Esperando director (timeout si >7 días)
```

---

## 5. Componentes Frontend

### 5.1 ausenciaModal.js (REDISEÑADO)

**3 Pasos (vs 5 actuales)**

**Paso 1: Fechas & Tipo Ausencia**
```
- Tipo duración: Un día / Rango de fechas
- Si "un día": input fecha única
- Si "rango": inputs fecha inicio + fin
- Tipo ausencia: Médica / Personal / Capacitación / Vacaciones / Otro
- Validar: 48h anticipación, no fechas pasadas
```

**Paso 2: Clases Afectadas & Cobertura**
```
- Mostrar automáticamente clases afectadas
- Para cada clase, opción de cobertura:
  A) Maestro suplente (búsqueda)
  B) Actividad alternativa en sala
  C) Sin cobertura (requiere director aprobar)
- Preview de horarios conflictivos
```

**Paso 3: Revisar & Enviar**
```
- Resumen: tipos, fechas, clases, cobertura
- Documento (optional): comprobante médico
  - Requerido para "Médica"
  - Opcional para otras
- Checkbox: "Notificar al director de recursos"
- Botón: Enviar solicitud
- En success: mostrar ticket # y estado
```

**Validaciones en Tiempo Real:**
```javascript
✓ 48h anticipación desde hoy
✓ No fechas pasadas
✓ Rango válido (inicio ≤ fin)
✓ Documentación: si tipo === "médica" → obligatorio
✓ Al menos 1 clase debe tener cobertura válida
```

### 5.2 ausenciasDirectorView.js (NUEVO)

**Panel: "Mis Solicitudes para Revisar"**
```
Tabla/List:
- Maestro (nombre)
- Fechas (inicio - fin)
- Tipo ausencia
- Urgencia
- Estado: "EN REVISIÓN"
- Clases afectadas (#)
- Cobertura (estado)
- Botón: [Revisar]

Al hacer click "Revisar":
  - Modal abre mostrando:
    * Detalles de solicitud
    * Clases afectadas (lista con horarios)
    * Documento adjunto (si existe)
    * Cobertura propuesta
    * Input: "Mis comentarios/validación"
    * Botones: [✓ Enviar a aprobación] [← Solicitar info]
    
Si "Solicitar info":
  - Vuelve a "solicitada"
  - Maestro recibe notificación: "Director solicita más información"
  
Si "Enviar a aprobación":
  - Estado → "pendiente_admin"
  - Admin notificado
  - Maestro no recibe notificación (sigue en "en_revision")
```

### 5.3 ausenciasAdminView.js (MEJORADO)

**Panel: "Solicitudes para Aprobar"**
```
Tabla/List:
- Maestro (nombre)
- Fechas
- Tipo
- Revisado por: director (nombre)
- Estado: "PENDIENTE APROBACIÓN"
- Botón: [Revisar]

Al hacer click "Revisar":
  - Modal abre mostrando:
    * Detalles de solicitud
    * Clases + cobertura
    * Documento (si existe)
    * ✅ Revisión del director (comentarios)
    * Estadísticas rápidas (ausencias del maestro este mes)
    * Input: "Mi decisión final"
    * Botones: [✓ APROBAR] [✗ RECHAZAR]
    
Si "APROBAR":
  - Estado → "aprobada"
  - Registrar en ausencias_auditoria
  - Maestro recibe notificación: "✓ Ausencia aprobada"
  
Si "RECHAZAR":
  - Estado → "rechazada"
  - Registrar en ausencias_auditoria
  - Maestro recibe notificación: "✗ Ausencia rechazada: [razón]"
```

---

## 6. Backend & API

### 6.1 Cambios en ausencias_maestros (tabla existente)

**Nuevas columnas:**
```sql
-- Para revisión director
revisado_por UUID REFERENCES auth.users(id)
revision_notas TEXT
revision_en TIMESTAMP

-- Para aprobación admin
aprobado_por UUID REFERENCES auth.users(id) 
aprobado_en TIMESTAMP

-- Para auditoría
rechazado_por UUID REFERENCES auth.users(id)
rechazado_en TIMESTAMP
razon_rechazo TEXT

-- Tracking
intentos_solicitud INT DEFAULT 1
fecha_solicitud_original TIMESTAMP DEFAULT NOW()
```

### 6.2 Nueva tabla: ausencias_auditoria

```sql
CREATE TABLE ausencias_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ausencia_id UUID REFERENCES ausencias_maestros(id),
  actor_id UUID REFERENCES auth.users(id),
  accion TEXT NOT NULL, -- 'solicitada', 'revisada', 'aprobada', 'rechazada', 'info_solicitada'
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 6.3 Endpoints API (Mejorados)

```
POST /api/ausencias/crear
  Body:
    tipo_ausencia: string
    fecha_inicio: date
    fecha_fin: date
    clases_afectadas: array
    cobertura: array (maestro_id o "actividad_alternativa")
    documento_url: string (opcional)
    motivo: string (opcional)
  
  Response:
    { id, estado: "solicitada", ticket: "AUS-2026-001", ... }

GET /api/ausencias/director/pendientes
  Response: Array de ausencias en estado "en_revision"

PUT /api/ausencias/:id/revisar (Director)
  Body:
    accion: "aprobar" | "rechazar" | "solicitar_info"
    notas: string
  
  Response: { id, estado: "pendiente_admin" | "solicitada" | "rechazada", ... }

PUT /api/ausencias/:id/aprobar (Admin)
  Body:
    notas: string
  
  Response: { id, estado: "aprobada", ... }

PUT /api/ausencias/:id/rechazar (Admin)
  Body:
    razon: string
  
  Response: { id, estado: "rechazada", razon, ... }

GET /api/ausencias/:id/auditoria
  Response: Array de ausencias_auditoria entries
```

### 6.4 Validaciones (ausenciaValidator.js)

```javascript
export function validarSolicitud(data) {
  const errors = [];

  // 1. Validar 48h anticipación
  const horasSalida = (new Date(data.fecha_inicio) - new Date()) / (1000 * 60 * 60);
  if (horasSalida < 48) {
    errors.push("Debe solicitar con 48 horas de anticipación");
  }

  // 2. Validar no fechas pasadas
  if (new Date(data.fecha_inicio) < new Date().setHours(0,0,0,0)) {
    errors.push("No se pueden solicitar ausencias para fechas pasadas");
  }

  // 3. Validar rango válido
  if (new Date(data.fecha_inicio) > new Date(data.fecha_fin)) {
    errors.push("Fecha inicio debe ser anterior a fecha fin");
  }

  // 4. Validar documentación
  if (data.tipo_ausencia === "médica" && !data.documento_url) {
    errors.push("Ausencia médica requiere comprobante");
  }

  // 5. Validar cobertura
  const tieneCobertura = data.cobertura?.some(c => c.maestro_id || c.actividad);
  if (!tieneCobertura) {
    errors.push("Al menos una clase debe tener cobertura");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## 7. Notificaciones (Portal Only)

### 7.1 Cuándo se notifica

| Evento | Destinatario | Mensaje |
|--------|--------------|---------|
| Solicitud creada | Director | "Nueva solicitud de ausencia: {maestro} ({fechas})" |
| Director rechaza | Maestro | "Tu solicitud de ausencia fue rechazada: {razón}" |
| Info solicitada | Maestro | "Director solicita más información sobre tu ausencia" |
| Aprobada | Maestro | "✓ Tu ausencia fue aprobada" |
| Rechazada por admin | Maestro | "✗ Tu solicitud no fue aprobada: {razón}" |

### 7.2 Implementación

```javascript
// En ausenciasApi.js
async function crearNotificacion(perfil_id, tipo, data) {
  await supabase.from('notificaciones').insert({
    profile_id: perfil_id,
    tipo: 'sistema',
    titulo: 'Solicitud de Ausencia',
    mensaje: data.mensaje,
    deep_link: '/ausencias',
    estado: 'pendiente'
  });
}
```

---

## 8. Validaciones y Restricciones

### 8.1 Reglas de Negocio

```javascript
// 1. Anticipación mínima
const ANTICIPACION_MINIMA_HORAS = 48;
const EXCEPCIONES = ["médica_emergencia"]; // Estas pueden ser < 48h

// 2. Documentación requerida
const DOC_REQUERIDA = {
  "médica": true,
  "personal": false,
  "capacitacion": false,
  "vacaciones": false,
  "otro": false
};

// 3. Sin límite de ausencias (director decide)

// 4. Fechas pasadas NO permitidas
const HOY = new Date().setHours(0, 0, 0, 0);
```

---

## 9. Datos y Estado

### 9.1 Estados Posibles

```
"solicitada"        → Esperando revisión director
"en_revision"       → Director está revisando
"pendiente_admin"   → Esperando aprobación admin
"aprobada"          → FINAL - Registrada
"rechazada"         → FINAL - Rechazada
```

### 9.2 Flujo de Estado (Máquina de Estados)

```
solicitada ─────→ en_revision ──┐
                                ├─→ pendiente_admin ──┐
                                │                    ├─→ aprobada [FIN]
solicitada ←─────┤ info_solicitada
                                ├─→ rechazada [FIN]
                ─────────────────┘
```

---

## 10. Testing Strategy

### 10.1 Unit Tests

```javascript
// ausenciaValidator.test.js
✓ Validar 48h anticipación
✓ Validar no fechas pasadas
✓ Validar documentación requerida
✓ Validar rango de fechas válido

// ausenciaService.test.js
✓ Crear solicitud exitosa
✓ Rechazar por validación fallida
✓ Buscar clases afectadas
```

### 10.2 Integration Tests

```javascript
// Flujo completo: Maestro → Director → Admin → Aprobada
✓ Maestro solicita ausencia
✓ Director puede ver en su panel
✓ Director aprueba y envía a admin
✓ Admin puede ver con contexto director
✓ Admin aprueba → estado "aprobada"
✓ Maestro recibe notificación

// Flujo rechazo
✓ Director rechaza → maestro notificado
✓ Maestro recibe razón
```

### 10.3 E2E Tests

```javascript
// Desde UI completa
✓ Maestro completa modal (3 pasos)
✓ Validaciones se muestran
✓ Director ve panel actualizado
✓ Admin ve panel actualizado
✓ Estados se actualizan en tiempo real
```

---

## 11. Detalles de Implementación

### 11.1 Cambios Mínimos a Archivos Existentes

| Archivo | Cambios |
|---------|---------|
| `ausenciaModal.js` | Reducir a 3 pasos, quitar `AppModal.updateBody()` |
| `ausenciasPanel.js` | Sin cambios (sigue siendo entrada) |
| `ausenciasApi.js` | Agregar endpoints para director/admin |
| `ausenciaValidator.js` | Agregar validaciones (48h, doc, fechas) |
| `ausenciaService.js` | Sin cambios principales |

### 11.2 Archivos Nuevos

| Archivo | Propósito |
|---------|-----------|
| `ausenciasDirectorView.js` | Panel del director |
| `ausenciasAdminView.js` (enhance) | Mejorar panel admin existente |
| `ausencias-auditoria.sql` | Migración base de datos |

---

## 12. Criterios de Aceptación

- ✅ Modal reduce de 5 a 3 pasos
- ✅ Sin errores de `AppModal.updateBody()`
- ✅ Director tiene panel dedicado para revisar
- ✅ Admin tiene panel dedicado para aprobar
- ✅ Validaciones: 48h, documentación, fechas
- ✅ Auditoría completa (quién decidió qué, cuándo)
- ✅ Notificaciones solo en portal
- ✅ Estados se actualicen correctamente
- ✅ 100% de tests pasando

---

## 13. Timeline Estimado

- **Frontend (Modal + Paneles):** 4-5 días
- **Backend (API + Validaciones):** 2-3 días
- **Database (Migraciones):** 1 día
- **Testing:** 2-3 días
- **Total:** ~10-12 días

---

## 14. Próximos Pasos

1. ✅ Revisión del diseño (user approval)
2. 📋 Crear plan de implementación detallado
3. 🔨 Implementación (frontend + backend en paralelo)
4. ✓ Testing integral
5. 🚀 Deploy
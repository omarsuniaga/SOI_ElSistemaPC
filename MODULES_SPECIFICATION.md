# 📋 Especificación de Módulos - Sistema Académico PWA

**Fecha:** 2026-05-02  
**Estado:** DRAFT - Para revisión  
**Autor:** SDD Analysis  

---

## 🎯 Visión General

Este documento especifica los 8 módulos del sistema académico:
1. **Alumnos** - Gestión de estudiantes
2. **Maestros** - Gestión de docentes
3. **Clases** - Gestión de clases/cursos
4. **Salones** - Gestión de espacios de clase
5. **Asistencias** - Control de asistencia por clase
6. **Planificación** - Planificación pedagógica de clases
7. **Progresos** - Calificaciones y progreso académico
8. **Observaciones** - Anotaciones sobre estudiantes

---

## 📊 ENTIDADES Y ESQUEMA

### 1️⃣ ALUMNOS (students)

**Tabla Existente:** `public.students`

**Campos:**
```
id: UUID (PK)
name: TEXT
section: TEXT (instrumento/sección)
ensemble_id: UUID (FK → ensembles)
ensemble_section: TEXT
atril: INTEGER
posicion_atril: TEXT
parent_email: TEXT
parent_phone: TEXT
acudiente: TEXT
created_at: TIMESTAMP
```

**Campos a Agregar (opcional mejorado):**
```
email: TEXT UNIQUE
cedula: TEXT UNIQUE
fecha_nacimiento: DATE
genero: CHAR(1)
direccion: TEXT
es_activo: BOOLEAN DEFAULT true
updated_at: TIMESTAMP
```

**CRUD:**
- **CREATE:** POST /api/alumnos
- **READ:** GET /api/alumnos, GET /api/alumnos/:id
- **UPDATE:** PUT /api/alumnos/:id
- **DELETE:** DELETE /api/alumnos/:id (lógico)

---

### 2️⃣ MAESTROS (maestros)

**Tabla Existente:** `public.maestros`

**Campos:**
```
id: UUID (PK)
user_id: UUID (FK → auth.users)
nombre: TEXT
email: TEXT UNIQUE
telefono: TEXT
instrumento: TEXT
especialidad: TEXT
bio: TEXT
is_active: BOOLEAN
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

**Campos a Agregar (opcional):**
```
cedula: TEXT UNIQUE
fecha_contrato: DATE
departamento: TEXT
profesion_titulo: TEXT
horario_disponible: TEXT[]
```

**CRUD:**
- **CREATE:** POST /api/maestros
- **READ:** GET /api/maestros, GET /api/maestros/:id
- **UPDATE:** PUT /api/maestros/:id
- **DELETE:** DELETE /api/maestros/:id (lógico)

---

### 3️⃣ CLASES (clases)

**Tabla Existente:** `public.clases`

**Campos:**
```
id: UUID (PK)
nombre: TEXT
maestro_id: UUID (FK → maestros)
salon_id: UUID (FK → salones)
instrumento: TEXT
dias: TEXT[] (ej: ['lunes', 'miércoles'])
hora_inicio: TIME
hora_fin: TIME
max_alumnos: INTEGER
estado: ENUM ('activa', 'suspendida', 'finalizada')
notas_pedagogicas: TEXT
planificacion_id: UUID (FK → planificaciones) [NUEVO]
programa_id: UUID (FK → programas) [NUEVO - opcional]
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

**Campos a Agregar:**
```
codigo: TEXT UNIQUE
descripcion: TEXT
objetivos: TEXT
evaluacion_tipo: TEXT (ej: 'continua', 'final', 'mixta')
creditos: INTEGER
```

**CRUD:**
- **CREATE:** POST /api/clases
- **READ:** GET /api/clases, GET /api/clases/:id, GET /api/clases?maestro_id=X
- **UPDATE:** PUT /api/clases/:id
- **DELETE:** DELETE /api/clases/:id (lógico)

---

### 4️⃣ SALONES (salones)

**Tabla Existente:** `public.salones`

**Campos:**
```
id: UUID (PK)
nombre: TEXT UNIQUE
capacidad: INTEGER
ubicacion: TEXT
is_active: BOOLEAN
created_at: TIMESTAMP
updated_at: TIMESTAMP [AGREGAR]
```

**Campos a Agregar:**
```
piso: INTEGER
codigo_salon: TEXT UNIQUE
equipamiento: TEXT[] (ej: ['proyector', 'pizarra', 'audio'])
condicion_fisica: ENUM ('excelente', 'buena', 'regular', 'mala')
responsable_id: UUID (FK → maestros) [opcional]
```

**CRUD:**
- **CREATE:** POST /api/salones
- **READ:** GET /api/salones, GET /api/salones/:id
- **UPDATE:** PUT /api/salones/:id
- **DELETE:** DELETE /api/salones/:id (lógico)

---

### 5️⃣ ASISTENCIAS (asistencias)

**Tabla Existente:** `public.asistencias`

**Campos:**
```
id: UUID (PK)
clase_id: UUID (FK → clases)
student_id: UUID (FK → students)
fecha: DATE
estado: ENUM ('P' = presente, 'A' = ausente, 'J' = justificado)
justificacion_texto: TEXT
justificacion_archivo: TEXT (URL)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

**Campos a Agregar:**
```
registrado_por_id: UUID (FK → maestros)
observaciones: TEXT
```

**CRUD:**
- **CREATE:** POST /api/asistencias
- **READ:** GET /api/asistencias, GET /api/asistencias?clase_id=X&fecha=YYYY-MM-DD
- **UPDATE:** PUT /api/asistencias/:id
- **DELETE:** DELETE /api/asistencias/:id (lógico)
- **BULK:** POST /api/asistencias/bulk (registrar múltiples en una clase)

---

### 6️⃣ PLANIFICACIONES (planificaciones) **[NUEVA TABLA]**

**Nueva Tabla:** `public.planificaciones`

**Campos:**
```
id: UUID (PK)
clase_id: UUID (FK → clases) NOT NULL
maestro_id: UUID (FK → maestros)
fecha_inicio: DATE
tema: TEXT NOT NULL
objetivos: TEXT
contenido: TEXT
recursos: TEXT[]
evaluacion_metodo: TEXT
observaciones: TEXT
estado: ENUM ('planificado', 'ejecutado', 'revisado')
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

**Índices:**
- clase_id + fecha_inicio (para búsquedas rápidas)

**CRUD:**
- **CREATE:** POST /api/planificaciones
- **READ:** GET /api/planificaciones, GET /api/planificaciones?clase_id=X
- **UPDATE:** PUT /api/planificaciones/:id
- **DELETE:** DELETE /api/planificaciones/:id (lógico)

---

### 7️⃣ PROGRESOS (progresos_academicos) **[NUEVA TABLA]**

**Nueva Tabla:** `public.progresos_academicos`

**Campos:**
```
id: UUID (PK)
alumno_id: UUID (FK → students) NOT NULL
clase_id: UUID (FK → clases) NOT NULL
maestro_id: UUID (FK → maestros)
fecha_evaluacion: DATE
tipo_evaluacion: ENUM ('parcial', 'final', 'continua')
calificacion: DECIMAL(4,2) (rango: 0.00 - 5.00 o similar)
observaciones: TEXT
estado: ENUM ('en_progreso', 'completado', 'pendiente')
UNIQUE(alumno_id, clase_id, tipo_evaluacion)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

**Índices:**
- alumno_id + clase_id (evaluaciones de un alumno en una clase)
- fecha_evaluacion (reportes)

**CRUD:**
- **CREATE:** POST /api/progresos
- **READ:** GET /api/progresos, GET /api/progresos?alumno_id=X, GET /api/progresos?clase_id=X
- **UPDATE:** PUT /api/progresos/:id
- **DELETE:** DELETE /api/progresos/:id (lógico)

---

### 8️⃣ OBSERVACIONES (observaciones) **[NUEVA TABLA]**

**Nueva Tabla:** `public.observaciones`

**Campos:**
```
id: UUID (PK)
alumno_id: UUID (FK → students) NOT NULL
maestro_id: UUID (FK → maestros)
tipo: ENUM ('comportamiento', 'academico', 'social', 'disciplina')
titulo: TEXT NOT NULL
descripcion: TEXT NOT NULL
prioridad: ENUM ('baja', 'media', 'alta')
estado: ENUM ('abierta', 'resuelta', 'seguimiento')
fecha_observacion: DATE
seguimiento_fecha: DATE [nullable]
seguimiento_observacion: TEXT [nullable]
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

**Índices:**
- alumno_id + estado (observaciones activas)
- fecha_observacion (reporte histórico)

**CRUD:**
- **CREATE:** POST /api/observaciones
- **READ:** GET /api/observaciones, GET /api/observaciones?alumno_id=X, GET /api/observaciones?tipo=X
- **UPDATE:** PUT /api/observaciones/:id (actualizar estado/seguimiento)
- **DELETE:** DELETE /api/observaciones/:id (lógico)

---

## 🔗 RELACIONES Y DEPENDENCIAS

```
maestros
├─ clases (1:N)
│  ├─ asistencias (1:N)
│  ├─ planificaciones (1:N)
│  └─ progresos_academicos (1:N)
│
├─ observaciones (1:N)

students (alumnos)
├─ alumno_clases (N:N) → clases
├─ asistencias (1:N)
├─ progresos_academicos (1:N)
└─ observaciones (1:N)

salones
└─ clases (1:N)

clases
├─ asistencias
├─ planificaciones
├─ progresos_academicos
└─ alumno_clases
```

---

## 📋 OPERACIONES PRINCIPALES POR MÓDULO

### ALUMNOS
- Listar estudiantes activos
- Buscar alumno por cédula/nombre
- Registrar nuevo alumno
- Actualizar información
- Dar de baja (lógica)
- Filtrar por clase/sección

### MAESTROS
- Listar maestros disponibles
- Asignar maestro a clase
- Ver clases asignadas
- Actualizar especialidad/disponibilidad
- Dar de baja (lógica)

### CLASES
- Crear clase (maestro + salon + horario)
- Asignar estudiantes
- Ver estudiantes inscritos
- Cambiar estado (activa/suspendida)
- Consultar clases por maestro

### SALONES
- Crear/registrar salón
- Ver disponibilidad
- Actualizar equipamiento
- Marcar como disponible/no disponible

### ASISTENCIAS
- Registrar asistencia de estudiante
- Registrar asistencia masiva (clase completa)
- Justificar ausencias
- Generar reportes de asistencia
- Ver histórico por estudiante

### PLANIFICACIÓN
- Crear plan de clase
- Actualizar contenido
- Registrar ejecución
- Generar reportes de cobertura
- Ver plan por clase

### PROGRESOS
- Registrar calificación
- Ver progreso de alumno
- Generar boletín
- Identificar estudiantes en riesgo
- Generar reportes de rendimiento

### OBSERVACIONES
- Registrar comportamiento
- Registrar logros
- Agregar seguimiento
- Generar reportes disciplinarios
- Notificar a padres

---

## ⚙️ VALIDACIONES POR MÓDULO

### ALUMNOS
- nombre: requerido, 3-100 caracteres
- email: formato válido, único
- cedula: único, formato según país
- fecha_nacimiento: no mayor a hoy

### MAESTROS
- nombre: requerido, 3-100 caracteres
- email: formato válido, único
- instrumento: selección de lista predefinida
- is_active: requerido

### CLASES
- nombre: requerido, 5-200 caracteres
- maestro_id: requerido, debe existir
- salon_id: requerido, debe estar disponible
- hora_inicio < hora_fin
- max_alumnos: > 0
- dias: al menos 1 día

### ASISTENCIAS
- clase_id: requerido, debe existir
- student_id: requerido, debe estar inscrito
- fecha: no futura, no antes del inicio de clase
- estado: enum válido
- if estado = 'J': justificacion_texto requerida

### PLANIFICACIÓN
- clase_id: requerido
- tema: requerido, mínimo 10 caracteres
- fecha_inicio: no futura

### PROGRESOS
- alumno_id + clase_id: combinación única por tipo_evaluacion
- calificacion: entre 0 y 5 (o escala definida)
- fecha_evaluacion: no futura

### OBSERVACIONES
- alumno_id: requerido
- titulo: requerido, 5-100 caracteres
- descripcion: requerido, 20-1000 caracteres
- tipo: enum válido

---

## 🚀 PRÓXIMAS FASES

1. **Phase 1 (SDD):** Crear migraciones SQL para nuevas tablas
2. **Phase 2:** Implementar APIs (maestrosApi, alumnosApi, etc.)
3. **Phase 3:** Crear vistas y componentes UI
4. **Phase 4:** Testing y validaciones
5. **Phase 5:** Reportes y dashboards


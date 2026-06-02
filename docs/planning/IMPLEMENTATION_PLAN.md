# 🚀 Plan de Implementación - Módulos Académicos

**Basado en:** MODULES_SPECIFICATION.md  
**Migraciones:** migrations/001_create_tables.sql  

---

## 📂 ESTRUCTURA DE ARCHIVOS A CREAR

```
src/
├── modules/
│   ├── alumnos/
│   │   ├── api/
│   │   │   └── alumnosApi.js          ✅ CRUD de alumnos
│   │   ├── models/
│   │   │   └── alumno.model.js        ✅ Validaciones y tipos
│   │   ├── views/
│   │   │   └── alumnosView.js         ✅ Tabla, crear, editar
│   │   ├── components/
│   │   │   ├── alumnoCard.js          ✅ Card de alumno
│   │   │   └── alumnoModal.js         ✅ Modal crear/editar
│   │   ├── utils/
│   │   │   └── alumnosUtils.js        ✅ Utilidades
│   │   ├── hooks/
│   │   │   └── useAlumnos.js          ✅ Lógica compartida
│   │   ├── alumnos.router.js          ✅ Registro de rutas
│   │   └── index.js                   ✅ Exporta API pública
│   │
│   ├── maestros/                       ✅ YA EXISTE
│   │   └── [similar structure]
│   │
│   ├── clases/
│   │   ├── api/
│   │   │   └── clasesApi.js           ✅ CRUD de clases
│   │   ├── models/
│   │   │   └── clase.model.js
│   │   ├── views/
│   │   │   └── clasesView.js
│   │   ├── components/
│   │   │   ├── claseCard.js
│   │   │   ├── claseModal.js
│   │   │   └── alumnoInscripcionModal.js
│   │   ├── utils/
│   │   │   └── clasesUtils.js
│   │   ├── hooks/
│   │   │   └── useClases.js
│   │   ├── clases.router.js
│   │   └── index.js
│   │
│   ├── salones/
│   │   ├── api/
│   │   │   └── salonesApi.js          ✅ CRUD de salones
│   │   ├── models/
│   │   │   └── salon.model.js
│   │   ├── views/
│   │   │   └── salonesView.js
│   │   ├── components/
│   │   │   ├── salonCard.js
│   │   │   └── salonModal.js
│   │   ├── utils/
│   │   │   └── salonesUtils.js
│   │   ├── hooks/
│   │   │   └── useSalones.js
│   │   ├── salones.router.js
│   │   └── index.js
│   │
│   ├── asistencias/
│   │   ├── api/
│   │   │   └── asistenciasApi.js      ✅ CRUD + bulk
│   │   ├── models/
│   │   │   └── asistencia.model.js
│   │   ├── views/
│   │   │   └── asistenciasView.js
│   │   ├── components/
│   │   │   ├── asistenciaTable.js
│   │   │   ├── asistenciaModal.js
│   │   │   └── registroBulkModal.js
│   │   ├── utils/
│   │   │   └── asistenciasUtils.js
│   │   ├── hooks/
│   │   │   └── useAsistencias.js
│   │   ├── asistencias.router.js
│   │   └── index.js
│   │
│   ├── planificacion/
│   │   ├── api/
│   │   │   └── planificacionApi.js    ✅ CRUD de planes
│   │   ├── models/
│   │   │   └── planificacion.model.js
│   │   ├── views/
│   │   │   └── planificacionView.js
│   │   ├── components/
│   │   │   ├── planificacionCard.js
│   │   │   └── planificacionModal.js
│   │   ├── utils/
│   │   │   └── planificacionUtils.js
│   │   ├── hooks/
│   │   │   └── usePlanificacion.js
│   │   ├── planificacion.router.js
│   │   └── index.js
│   │
│   ├── progresos/
│   │   ├── api/
│   │   │   └── progresosApi.js        ✅ CRUD calificaciones
│   │   ├── models/
│   │   │   └── progreso.model.js
│   │   ├── views/
│   │   │   └── progresosView.js
│   │   ├── components/
│   │   │   ├── progresosTable.js
│   │   │   ├── calificacionModal.js
│   │   │   └── reporteBoletinCard.js
│   │   ├── utils/
│   │   │   └── progresosUtils.js
│   │   ├── hooks/
│   │   │   └── useProgresos.js
│   │   ├── progresos.router.js
│   │   └── index.js
│   │
│   └── observaciones/
│       ├── api/
│       │   └── observacionesApi.js    ✅ CRUD observaciones
│       ├── models/
│       │   └── observacion.model.js
│       ├── views/
│       │   └── observacionesView.js
│       ├── components/
│       │   ├── observacionCard.js
│       │   ├── observacionModal.js
│       │   └── seguimientoModal.js
│       ├── utils/
│       │   └── observacionesUtils.js
│       ├── hooks/
│       │   └── useObservaciones.js
│       ├── observaciones.router.js
│       └── index.js
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### FASE 1: SETUP BASE
- [ ] Ejecutar migraciones SQL en Supabase
- [ ] Verificar que tablas se crearon correctamente
- [ ] Actualizar main.js con nuevos módulos

### FASE 2: ALUMNOS (1-2 horas)
- [ ] alumnosApi.js (obtenerAlumnos, crearAlumno, actualizarAlumno, eliminarAlumno)
- [ ] alumno.model.js (validaciones)
- [ ] alumnosView.js (tabla + búsqueda)
- [ ] alumnoModal.js (crear/editar)
- [ ] alumnoCard.js (vista card)
- [ ] alumnos.router.js
- [ ] alumnos/index.js
- [ ] Registrar en main.js

### FASE 3: MAESTROS (0.5-1 hora)
- [ ] Completar maestrosApi.js si falta
- [ ] maestrosView.js mejorada
- [ ] maestroModal.js (crear/editar)
- [ ] maestros.router.js
- [ ] Registrar en main.js

### FASE 4: SALONES (0.5-1 hora)
- [ ] salonesApi.js
- [ ] salonesView.js
- [ ] salonModal.js
- [ ] salones.router.js
- [ ] Registrar en main.js

### FASE 5: CLASES (1-2 horas)
- [ ] clasesApi.js
- [ ] claseModal.js
- [ ] alumnoInscripcionModal.js (asignar alumnos)
- [ ] clasesView.js
- [ ] clases.router.js
- [ ] Registrar en main.js

### FASE 6: ASISTENCIAS (1-2 horas)
- [ ] asistenciasApi.js (incluyendo bulk)
- [ ] asistenciaTable.js (registro por clase)
- [ ] registroBulkModal.js
- [ ] asistenciasView.js
- [ ] asistencias.router.js
- [ ] Registrar en main.js

### FASE 7: PLANIFICACIÓN (1-1.5 horas)
- [ ] planificacionApi.js
- [ ] planificacionModal.js
- [ ] planificacionView.js
- [ ] planificacion.router.js
- [ ] Registrar en main.js

### FASE 8: PROGRESOS (1-2 horas)
- [ ] progresosApi.js
- [ ] calificacionModal.js
- [ ] progresosTable.js
- [ ] reporteBoletinCard.js (mostrar progreso)
- [ ] progresos.router.js
- [ ] Registrar en main.js

### FASE 9: OBSERVACIONES (1-1.5 horas)
- [ ] observacionesApi.js
- [ ] observacionModal.js (crear)
- [ ] seguimientoModal.js (agregar seguimiento)
- [ ] observacionesView.js
- [ ] observaciones.router.js
- [ ] Registrar en main.js

### FASE 10: TESTING Y REFINAMIENTO (1-2 horas)
- [ ] Probar cada módulo
- [ ] Validaciones funcionando
- [ ] Mensajes de error claros
- [ ] Estilos Bootstrap aplicados
- [ ] Responsividad en móvil

---

## ⏱️ ESTIMACIÓN TOTAL
- **Base:** 1 hora (setup + migraciones)
- **Implementación:** 10-15 horas (8 módulos)
- **Testing:** 1-2 horas
- **TOTAL:** 12-18 horas de desarrollo

---

## 🎯 PRIORIDAD RECOMENDADA

1. **CRÍTICO (Día 1):**
   - Setup migraciones
   - Alumnos
   - Maestros
   - Clases

2. **IMPORTANTE (Día 2):**
   - Asistencias
   - Progresos

3. **COMPLEMENTARIO (Día 3):**
   - Salones
   - Planificación
   - Observaciones

---

## 📌 NOTAS

- Cada módulo sigue el patrón: API → Model → View → Modal → Router → Index
- Los componentes reutilizables van en `shared/components/`
- Las validaciones van en `*.model.js`
- Usar `ModalManager` para modales (ya existe)
- Usar `router.navigate()` para navegación entre módulos

---


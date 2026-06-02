# Quick Start - Módulo Alumnos

## 1. Ejecutar Migraciones (PRIMER PASO)

Antes de usar el módulo, ejecuta las migraciones en Supabase:

1. Abre [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** → **New Query**
4. Copia TODO el contenido de `migrations/001_create_tables.sql`
5. Pégalo en el editor
6. Haz clic en **Run** (o Ctrl+Enter)
7. Verifica que aparece "Success"

Ver detalles completos en: `migrations/README.md`

## 2. Acceder al Módulo Alumnos

Una vez compilado el proyecto:

1. Abre la aplicación
2. Verás un botón "Alumnos" en la navbar
3. Haz clic para acceder al módulo

## 3. Funcionalidades Disponibles

### Vista Tabla
- **Búsqueda en tiempo real:** Busca por nombre, email, cédula, acudiente
- **Filtros:** Activos/Inactivos
- **Ordenamiento:** Por nombre (automático)
- **Información:** Ver detalles de cada alumno

### Crear Alumno
1. Haz clic en el botón **"+ Nuevo"**
2. Completa los campos (obligatorio: nombre)
3. Validaciones en tiempo real
4. Haz clic en **"Guardar"**

### Editar Alumno
1. En la tabla, haz clic en el ícono de **lápiz** (edit)
2. Modifica los campos
3. Haz clic en **"Guardar cambios"**

### Ver Detalles
1. En la tabla, haz clic en el ícono de **ojo** (view)
2. Se abrirá un modal con toda la información

### Eliminar Alumno
1. En la tabla, haz clic en el ícono de **basura** (delete)
2. Confirma en el modal que aparece
3. El alumno se eliminará

## 4. Campos del Alumno

### Obligatorios
- **Nombre** (3-100 caracteres)

### Opcionales
- **Email** (formato válido, debe ser único)
- **Cédula** (5-20 caracteres, debe ser única)
- **Fecha de Nacimiento** (no futura, edad 3-100 años)
- **Género** (M: Masculino, F: Femenino, O: Otro, N: No binario)
- **Sección/Instrumento** (ej: Violín, Voz)
- **Acudiente** (3-100 caracteres)
- **Teléfono Acudiente** (máximo 20 caracteres)
- **Email Acudiente** (formato válido)
- **Dirección** (máximo 255 caracteres)
- **Estado** (Activo/Inactivo)

## 5. Mensajes de Error

El módulo proporciona mensajes claros:

| Error | Causa |
|-------|-------|
| "El nombre es obligatorio" | No completaste el campo nombre |
| "El formato del email no es válido" | Email mal formado |
| "El email ya está registrado" | Email duplicado |
| "La cédula ya está registrada" | Cédula duplicada |
| "La fecha de nacimiento no puede ser futura" | Fecha inválida |
| "El alumno debe tener mínimo 3 años" | Menor de 3 años |
| "El género debe ser: M, F, O o N" | Género inválido |

## 6. Tema Oscuro/Claro

Haz clic en el ícono de **luna/sol** en la navbar para cambiar de tema.
Se guarda automáticamente en el navegador.

## 7. Rutas del Módulo

```
src/modules/alumnos/
├── api/alumnosApi.js          # CRUD operations
├── models/alumno.model.js     # Validaciones
├── views/alumnosView.js       # Interfaz principal
├── components/alumnoCard.js   # Componente reutilizable
├── utils/alumnosUtils.js      # Funciones helper
├── hooks/useAlumnos.js        # Estado compartido
├── alumnos.router.js          # Rutas
└── index.js                   # Exporta API pública
```

## 8. Estructura de Datos (Supabase)

Tabla: `public.students`

```javascript
{
  id: UUID,                        // Auto-generated
  name: TEXT,                      // Requerido
  email: TEXT,                     // Único, opcional
  cedula: TEXT,                    // Único, opcional
  fecha_nacimiento: DATE,          // Opcional
  genero: CHAR(1),                 // M, F, O, N
  section: TEXT,                   // Ej: Violín
  acudiente: TEXT,                 // Responsable
  parent_phone: TEXT,              // Teléfono acudiente
  parent_email: TEXT,              // Email acudiente
  direccion: TEXT,                 // Dirección
  es_activo: BOOLEAN,              // true/false
  created_at: TIMESTAMP,           // Auto
  updated_at: TIMESTAMP            // Auto
}
```

## 9. Componentes Reutilizables

### Para otros módulos:

```javascript
// Card de alumno
import { createAlumnoCard } from './modules/alumnos/components/alumnoCard.js'

const card = createAlumnoCard(alumno, true, onEdit, onDelete)
container.appendChild(card)

// List item
import { createAlumnoListItem } from './modules/alumnos/components/alumnoCard.js'

const li = createAlumnoListItem(alumno)
list.appendChild(li)
```

## 10. Hook Compartido

```javascript
import { useAlumnos } from './modules/alumnos/hooks/useAlumnos.js'

const hook = useAlumnos()

// Cargar todos
await hook.fetchAlumnos()

// Buscar
const resultados = hook.search('Juan')

// Filtrar
const activos = hook.filterByActivos()

// Suscribirse a cambios
const unsubscribe = hook.subscribe((state) => {
  console.log('Alumnos actualizados:', state.alumnos)
})
```

## 11. Documentación Adicional

- `IMPLEMENTATION_PLAN.md` - Plan completo de implementación
- `MODULES_SPECIFICATION.md` - Especificación de módulos
- `IMPLEMENTATION_SUMMARY.md` - Detalles de implementación
- `PHASE_COMPLETION_CHECKLIST.md` - Checklist de completitud

## 12. Próximos Pasos

Después de este módulo, implementar:

**FASE 3:** Completar módulo Maestros  
**FASE 4:** Salones  
**FASE 5:** Clases  
**FASE 6:** Asistencias  
**FASE 7:** Planificación  
**FASE 8:** Progresos  
**FASE 9:** Observaciones  

---

**Última actualización:** 2026-05-02  
**Módulo:** Alumnos  
**Estado:** 100% Operativo ✅

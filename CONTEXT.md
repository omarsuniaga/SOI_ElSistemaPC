# CONTEXT.md — Ubiquitous Language & Domain Model
**Sistema de Orquestas Infantil y Juvenil de Punta Cana (SOI / El Sistema PC)**

Este documento establece el **Lenguaje Ubicuo (Domain-Driven Design)** para desarrolladores y agentes de Inteligencia Artificial. Todos los términos aquí definidos deben usarse con precisión estricta en nombres de variables, funciones, endpoints, interfaces de usuario y documentación.

---

## 1. Dominio Académico y Musical

### Alumno / Estudiante
* **Definición:** Joven o niño matriculado en el programa formativo orquestal o coral.
* **Términos canónicos:** `alumno` (código/bd), `estudiante` (sinónimo UI). *Evitar:* usuario, cliente, escolar.
* **Atributos clave:** `instrumento_principal`, `etapa`/`nivel`, `representante` (tutor legal), `estado` (`activo`, `inactivo`, `postulado`).

### Maestro / Docente
* **Definición:** Músico o instructor pedagógico responsable de impartir cátedras y clases.
* **Términos canónicos:** `maestro` (código/bd), `docente` (sinónimo pedagógico). *Evitar:* profesor particular, empleado, trainer.
* **Métricas asociadas:** `asistencia`, `solvencia docente` (cumplimiento de horas planificadas vs impartidas), `disponibilidad horaria`.

### Cátedra
* **Definición:** Especialidad técnica e instrumental a la que pertenece un maestro o contenido formativo (ej. Cátedra de Violín, Cátedra de Trompeta, Cátedra de Iniciación Musical).
* **Término canónico:** `catedra`. *Evitar:* materia, asignatura, curso.

### Familia Instrumental
* **Definición:** Agrupación orquestal de instrumentos afines según la acústica y organología.
* **Términos canónicos:** `familia_instrumental` con valores estrictos:
  * `cuerdas` (Violín, Viola, Violonchelo, Contrabajo)
  * `maderas` (Flauta, Clarinete, Oboe, Fagot)
  * `metales` (Trompeta, Trompa, Trombón, Tuba)
  * `percusion` (Timbales, Platos, Xilófono, Batería, Accesorios)
  * `coral_iniciacion` (Coro infantil/juvenil, Iniciación musical, Kinder musical)
  * `general` (Teoría, Ensamble orquestal completo)

### Clase
* **Definición:** Unidad horaria y pedagógica concreta donde uno o varios alumnos reciben formación en un día, horario y salón determinado con un maestro titular.
* **Término canónico:** `clase`. *Evitar:* lección, sesión, turno.
* **Tipos de Clase:** `individual`, `grupal`, `seccional`, `orquestal`, `teorica`.

### Nómina de Clase
* **Definición:** El conjunto oficial de alumnos inscritos en una clase específica, sujeto a la capacidad máxima del salón y de la clase.
* **Término canónico:** `nomina_alumnos` o `inscripciones_clase`.

### Conflictos y Solapamientos
* **Definición:** Colisión horaria detectada automáticamente por el motor de validación.
* **Tipos:**
  * `solapamiento_maestro`: El mismo maestro tiene dos clases programadas a la misma hora en distintos salones.
  * `solapamiento_salon`: Dos clases distintas pretenden usar el mismo salón físico en la misma franja horaria.
  * `sobrecupo`: La nómina supera la capacidad física del salón asignado.

---

## 2. Dominio de Infraestructura y Activos

### Salón / Espacio
* **Definición:** Espacio físico dentro de las instalaciones donde se llevan a cabo los ensayos y clases.
* **Término canónico:** `salon`. *Evitar:* aula, habitación, cuarto.
* **Atributos:** `piso` (`0` para Planta Baja, `1`, `2`...), `capacidad` (aforo máximo de personas), `condicion` (`excelente`, `buena`, `regular`, `mala`), `equipamiento` (instrumentos fijos, atriles, pizarras).

### Instrumento e Inventario
* **Definición:** Bien patrimonial asignado a la institución o prestado a un alumno/maestro.
* **Término canónico:** `instrumento`, `inventario`.
* **Atributos:** `codigo_patrimonial`, `numero_serie`, `estado_condicion`, `asignado_a`.

---

## 3. Dominio Arquitectónico y Técnico

### DataAdapter Pattern
* **Definición:** Capa de abstracción obligatoria entre la interfaz de usuario (views/components) y la fuente de persistencia.
* **Regla estricta:** La UI interactúa con el `DataAdapter`. Este decide si resuelve mediante `Supabase` (Modo Real) o mediante archivos JSON locales (Modo Demo).

### Modo Demo vs Modo Real
* **Modo Demo (JSON First):** Permite ejecutar y probar toda la aplicación localmente sin credenciales de red, leyendo y simulando mutaciones sobre `src/assets/data/mocks/*.json`.
* **Modo Real (Supabase):** Persistencia sobre PostgreSQL gestionado en Supabase con Row-Level Security (RLS).

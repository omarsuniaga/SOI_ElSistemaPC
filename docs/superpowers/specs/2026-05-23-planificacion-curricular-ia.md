# Planificación Curricular con Asistente IA — Design Spec

**Fecha:** 2026-05-23  
**Estado:** Aprobado para implementación  
**Módulo:** Planificación

---

## Resumen

Sistema que permite al administrador proponer una guía curricular por instrumento y nivel, que sirve como referencia para los maestros. Los maestros planifican libremente pero la IA compara su trabajo real con el currículo, identifica brechas por alumno, sugiere el próximo plan y da retroalimentación cualitativa sobre el enfoque pedagógico.

No incluye: transcripción de audio (Whisper), planificación obligatoria, asignación curricular por maestro individual.

---

## Modelo de datos

### Tablas nuevas en Supabase

```sql
-- Currículo de referencia por instrumento + nivel
CREATE TABLE curriculos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instrumento text NOT NULL,
  nivel       text NOT NULL,         -- 'inicial' | 'intermedio' | 'avanzado' | '1' | '2' ...
  descripcion text,
  activo      boolean DEFAULT true,
  created_by  uuid REFERENCES maestros(id),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (instrumento, nivel)        -- un solo currículo activo por instrumento+nivel
);

-- Pilares dentro de un currículo
CREATE TABLE curriculo_pilares (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculo_id uuid REFERENCES curriculos(id) ON DELETE CASCADE,
  nombre      text NOT NULL,         -- 'técnica' | 'repertorio' | 'teoría' | 'otro'
  orden       int  NOT NULL DEFAULT 0
);

-- Objetivos dentro de un pilar
CREATE TABLE curriculo_objetivos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pilar_id    uuid REFERENCES curriculo_pilares(id) ON DELETE CASCADE,
  descripcion text NOT NULL,         -- "Escala Do Mayor en 1 octava"
  orden       int  NOT NULL DEFAULT 0
);

-- Cobertura individual por alumno y objetivo
CREATE TABLE cobertura_alumno_objetivo (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id    uuid REFERENCES alumnos(id) ON DELETE CASCADE,
  objetivo_id  uuid REFERENCES curriculo_objetivos(id) ON DELETE CASCADE,
  plan_id      uuid REFERENCES planificaciones(id) ON DELETE SET NULL,
  maestro_id   uuid REFERENCES maestros(id),
  fecha        date NOT NULL DEFAULT CURRENT_DATE,
  confirmado   boolean DEFAULT false,  -- false = sugerido por IA, true = confirmado por maestro
  nivel        text DEFAULT 'en_proceso', -- 'iniciando' | 'en_proceso' | 'logrado'
  created_at   timestamptz DEFAULT now(),
  UNIQUE (alumno_id, objetivo_id)       -- un solo registro por alumno+objetivo (upsert en nivel)
);
```

### Relación con datos existentes

- `curriculos.instrumento` se cruza con `clases.instrumento` para que la IA sepa qué currículo aplica a cada clase
- `curriculos.nivel` se cruza con `clases.plan_estudio` (nivel de la clase)
- `cobertura_alumno_objetivo.plan_id` traza qué plan generó cada cobertura
- Los alumnos se identifican en los planes por los tags `#nombre` del DSL existente

---

## Flujo del Administrador

### Dónde vive
Planificación → tab "Currículo" (visible solo para admin)

### Acciones disponibles
1. **Listar curriculos** — tabla con instrumento, nivel, cantidad de objetivos, estado (activo/inactivo)
2. **Crear currículo** — modal con campos: instrumento, nivel, descripción
3. **Editar currículo** — mismo modal, más gestión de pilares y objetivos dentro
4. **Gestionar pilares** — dentro del modal: agregar, renombrar, reordenar (drag o flechas)
5. **Gestionar objetivos por pilar** — lista editable: agregar, editar texto, reordenar, eliminar
6. **Activar/desactivar** — toggle en la tabla

### Restricciones
- Solo puede haber un currículo activo por combinación instrumento+nivel
- Si se desactiva un currículo, la cobertura existente de los alumnos se preserva
- El admin no asigna curriculos a maestros individuales — se aplica automáticamente

---

## Flujo del Maestro (Portal Admin — vista Maestro)

### Al crear o editar un plan

En el modal de planificación aparece un panel colapsado en el lateral derecho: **"Guía curricular"**. Al expandir:
- Muestra los pilares y objetivos del currículo activo para el instrumento+nivel de la clase seleccionada
- Solo lectura — es referencia e inspiración
- Si no hay currículo para ese instrumento/nivel, el panel muestra "Sin guía curricular definida"

### Al marcar un plan como "ejecutado"

En lugar de cambiar el estado directamente, se abre el **modal de Cobertura** (paso intermedio):

1. La IA analiza: `tema + objetivos + contenido + notas_dsl` del plan
2. Obtiene la lista de alumnos mencionados con `#nombre` en el DSL
3. Compara el contenido del plan contra los objetivos del currículo
4. Pre-checkea los objetivos que probablemente se cubrieron (con nivel sugerido)
5. El maestro ve una lista por alumno con checkboxes:
   - ✓ pre-marcados por IA (confirmado=false inicialmente)
   - El maestro puede marcar/desmarcar/cambiar nivel
   - Botón "Confirmar y ejecutar" → guarda cobertura con `confirmado=true` y cambia estado del plan a 'ejecutado'
6. Botón "Saltar" disponible — ejecuta el plan sin registrar cobertura (para clases sin currículo o cuando el maestro no quiere usar el sistema)

---

## Panel Asistente IA

### Ubicación
Planificación → tab "Asistente IA" (en el sidebar, visible para maestros)

### Bloque 1: Análisis de brechas por alumno

- Selector de alumno (filtrado a alumnos del maestro)
- Al seleccionar: tabla con todos los objetivos del currículo de referencia del instrumento del alumno
- Columnas: Pilar | Objetivo | Estado | Nivel | Última vez trabajado
- Estados: `logrado ✓` / `en proceso ⟳` / `no iniciado ○` / `sugerido por IA (sin confirmar) ~`
- Badge resumen: "7/14 objetivos logrados · 4 en proceso · 3 no iniciados"
- Si el alumno no tiene currículo asociado: mensaje explicativo

### Bloque 2: Sugerencia para próxima clase

- Botón "Generar borrador para [nombre alumno]"
- La IA recibe:
  - Objetivos no cubiertos o en proceso del alumno
  - Últimos 3 planes ejecutados del maestro (para no repetir)
  - Instrumento + nivel del alumno
- La IA devuelve: `{ tema, objetivos, contenido, recursos_sugeridos }`
- Se muestra como borrador editable inline
- Botón "Guardar como plan" → abre el modal de planificación pre-cargado con ese borrador

### Bloque 3: Retroalimentación al maestro

- Botón "Analizar mi enfoque pedagógico"
- La IA recibe:
  - Todos los planes ejecutados del maestro (últimas 8 semanas)
  - El currículo de referencia por instrumento
  - Los datos de cobertura confirmada
- La IA devuelve un párrafo cualitativo narrativo:
  - Fortalezas detectadas en el enfoque
  - Áreas del currículo sub-representadas
  - Sugerencias concretas para las próximas semanas
- Se muestra en una card con opción de "Regenerar análisis"
- No se guarda en BD — es un análisis on-demand

---

## Prompts de IA (GROQ)

### Extracción de cobertura (al ejecutar plan)

```
Eres un asistente pedagógico musical. Dado el contenido de un plan de clase y una lista de objetivos curriculares, identifica cuáles objetivos probablemente se cubrieron.

Plan de clase:
- Tema: {tema}
- Objetivos escritos por el maestro: {objetivos}
- Contenido: {contenido}
- Notas DSL: {notas_dsl}

Alumnos mencionados: {lista_alumnos}

Objetivos curriculares a evaluar:
{lista_objetivos_con_id}

Responde en JSON:
{
  "coberturas": [
    { "alumno": "nombre", "objetivo_id": "uuid", "nivel": "iniciando|en_proceso|logrado", "razon": "breve justificación" }
  ]
}
Solo incluye objetivos que tengan evidencia real en el plan. No inventes coberturas.
```

### Sugerencia de próxima clase

```
Eres un asistente pedagógico musical. Genera un borrador de plan de clase personalizado.

Alumno: {nombre}, instrumento: {instrumento}, nivel: {nivel}

Objetivos pendientes del currículo (priorizar estos):
{objetivos_no_cubiertos}

Últimas clases trabajadas (no repetir):
{ultimos_temas}

Responde en JSON:
{
  "tema": "...",
  "objetivos": "...",
  "contenido": "...",
  "recursos": ["..."]
}
Sé específico y pedagógicamente relevante para el instrumento y nivel.
```

### Retroalimentación cualitativa

```
Eres un mentor pedagógico musical. Analiza el trabajo de un maestro y da retroalimentación constructiva.

Instrumento principal: {instrumento}
Currículo de referencia: {curriculo_completo}
Planes ejecutados (últimas 8 semanas): {planes_con_temas_y_contenido}
Cobertura de objetivos actual: {resumen_cobertura}

Escribe 2-3 párrafos:
1. Fortalezas del enfoque actual
2. Áreas del currículo que podrían reforzarse
3. Sugerencias concretas para próximas semanas

Tono: colega experto, respetuoso, propositivo. Sin tecnicismos innecesarios.
```

---

## Arquitectura de archivos

### Crear (nuevos)
```
src/modules/planificacion/
  api/
    curriculoApi.js          — CRUD curriculos, pilares, objetivos
    coberturaApi.js          — CRUD cobertura_alumno_objetivo (upsert, query por alumno)
    asistentePedagogicoService.js — 3 funciones: extraerCobertura(), sugerirPlan(), analizarEnfoque()
  components/
    curriculoModal.js        — admin: crear/editar currículo con pilares y objetivos
    coberturaModal.js        — maestro: confirmar cobertura al ejecutar un plan
    asistentePedagogicoPanel.js — panel IA completo (3 bloques)
```

### Modificar (existentes)
```
src/modules/planificacion/
  views/planificacionView.js      — agregar tab "Asistente IA", tab "Currículo" (admin)
  components/planificacionModal.js — trigger coberturaModal al cambiar estado a 'ejecutado'
  api/groqService.js              — agregar extraerCobertura(), sugerirPlan(), analizarEnfoque()
```

### Base de datos (migraciones)
```
supabase/migrations/
  YYYYMMDD_curriculos.sql
  YYYYMMDD_curriculo_pilares.sql
  YYYYMMDD_curriculo_objetivos.sql
  YYYYMMDD_cobertura_alumno_objetivo.sql
  YYYYMMDD_rls_curriculos.sql     — admin puede escribir, maestros solo leer curriculos activos
```

---

## RLS (Row Level Security)

- `curriculos`: SELECT para todos los autenticados, INSERT/UPDATE/DELETE solo admin
- `curriculo_pilares` y `curriculo_objetivos`: ídem
- `cobertura_alumno_objetivo`: SELECT/INSERT/UPDATE para maestro_id = auth user, SELECT también para admin

---

## Lo que NO incluye esta versión

- Whisper / transcripción de audio (excluido explícitamente)
- Planificación obligatoria (el currículo es referencia, no requisito)
- Portal del maestro (se trabaja desde el portal Admin con vista de maestro)
- Notificaciones push o alertas automáticas de brechas
- Exportación de reportes curriculares (puede ser una iteración futura)

---

## Criterios de éxito

1. El admin puede crear un currículo con pilares y objetivos para "Guitarra — Nivel Inicial" en menos de 5 minutos
2. Al ejecutar un plan, la IA pre-completa el modal de cobertura con al menos 70% de precisión (objetivos relevantes pre-marcados)
3. El maestro puede ver el análisis de brechas de cualquier alumno en menos de 3 segundos
4. El borrador de próxima clase generado por la IA es editable y guardable directamente como plan
5. La retroalimentación cualitativa es específica al instrumento y nivel, no genérica

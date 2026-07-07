# DSL Parser — Lenguaje de Registro Pedagógico

## Overview

El `dslParser.js` es el motor de parsing para el **DSL Pedagógico** del Portal Maestros. Traduce texto libre escrito por el maestro en una estructura estructurada que el sistema puede entender, mostrar y guardar.

---

## Sintaxis del DSL

```
#Alumno [contenido] (sugerencia) {tarea} >NIVEL-10 >NODO:ARCO 3/5

:::CAPA: TECNICA
  #Alumno [ejercicio] (nota)
:::CAPA: CORE
  #Alumno [concepto]
```

## Tokens

| Token | Patrón | Descripción | Ejemplo |
|-------|--------|-------------|---------|
| **Alumno** | `#nombre` | Referencia a un alumno | `#AnaPerez` |
| **Contenido** | `[texto]` | Contenido trabajado en clase | `[Detaché en semicorcheas]` |
| **Sugerencia** | `(texto)` | Sugerencia para practicar | `(Con metrónomo a 60)` |
| **Tarea** | `{texto}` | Tarea asignada | `{Estudiar compases 1-8}` |
| **Medida** | `$codigo` | Código de medida o estándar | `$AFIN-01` |
| **Objetivo** | `>CODIGO` | Código de objetivo curricular | `>TEC-A1-2.3` |
| **Nivel** | `>NIVEL-N` | Nivel de la ruta | `>NIVEL-10` |
| **Nodo** | `>NODO:NOMBRE` | Nodo específico | `>NODO:ARCO` |
| **Capa** | `:::CAPA:NOMBRE` | Bloque estructurado por capa | `:::CAPA:CORE` |
| **Calificación** | `X/5` | Nota sobre 5 | `4/5` |

---

## API del Parser

### `parseDSL(text: string): ParsedResult`

```js
import { parseDSL } from './utils/dslParser.js';

const result = parseDSL('#Ana [Escalas] (Practicar #G minor) >NIVEL-3 >NODO:TECNICA');

// result:
{
  alumnos: ['Ana'],
  contenido: ['Escalas'],
  sugerencias: ['Practicar #G minor'],
  tareas: [],
  medidas: [],
  calificacion: null,
  objetivos: [],
  niveles: ['3'],
  nodos: ['TECNICA'],
  capas: [],
  por_capas: {}
}
```

### `highlightDSL(text: string): string`

Convierte texto plano en HTML con tokens resaltados por colores.

```js
const html = highlightDSL('#Ana [Detaché] (práctica) 4/5');
// Retorna HTML con <span class="dsl-token dsl-alumno">#Ana</span> etc.
```

### `getTokenSummary(parsed): string`

```js
const summary = getTokenSummary(parsed);
// "2 alumno(s), 1 contenido(s), 1 sugerencia(s), calificación: 4/5"
```

### `validateDsl(text): { valid: boolean, errors: string[] }`

Valida el texto DSL y retorna errores si los hay.

---

## Capas Estructurales

El sistema soporta separación por capas para organizar la planificación:

```js
CAPA_MAP = {
  TECNICA:    ['Escalas', 'Arpegios y patrones', 'Mano izquierda', 'Arco'],
  CORE:       ['Sonido', 'Afinación'],
  REPERTORIO: ['Estudios técnicos', 'Repertorio / Obra-hito'],
}
```

---

## Ejemplos Completos

### Registro de Clase
```
#AnaPerez [Detaché en semicorcheas] (Con metrónomo a 60 bpm) {Estudiar compases 1-8} >NIVEL-10 >NODO:ARCO
```

### Planificación por Capas
```
:::CAPA: TECNICA
  #Ana [Escalas G major]
  #Carlos [Arpegios Am]
  
:::CAPA: CORE
  #Ana [Trabajo de sonido en tercera posición]
  
:::CAPA: REPERTORIO
  #Ana [Vivaldi, movimiento 1, compases 1-16]
```

### Evaluación
```
#Ana [Nodo Arco] → Indicador: Detaché claro → 4/5 (Mejorar cambio de cuerda)
```

---

## Configuración de Colores

```js
TOKEN_COLORS = {
  alumnos:      '#0d6efd',   // Azul
  contenido:    '#198754',   // Verde
  sugerencias:  '#fd7e14',   // Naranja
  tareas:       '#9333ea',   // Púrpura
  medidas:      '#6dd5ed',   // Cyan
  calificacion: '#dc3545',   // Rojo
  objetivos:    '#6c757d',   // Gris
  niveles:      '#5856d6',   // Indigo
  nodos:        '#af52de',   // Violeta
  capas:        '#ff9500',   // Amber
}
```

---

## Errores Comunes

- Calificación fuera de rango (debe ser 0-5/5)
- Texto excede 10KB
- Nombres de alumno incompletos (no separar con espacios)

---

## Próximas Mejoras

1. Soporte para múltiples alumnos: `#Ana #Carlos [trabajo]`
2. Ranges de niveles: `>NIVEL-3-5`
3. Duración estimada: `[Escalas] ~15min`
4. Link a video/evidencia: `{tarea} [video:url]`
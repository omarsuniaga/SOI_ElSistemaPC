# Planificación Completa — Ruta Integral de Violín por Nodos

**Versión:** 1.0.0  
**Instrumento:** Violín  
**Modelo:** Niveles → Nodos → Indicadores → Evaluación del maestro  
**Uso previsto:** Módulo de planificación académica dentro de la PWA del maestro, integrado con asistencia, observaciones y eventos de clase.

> **Regla central:** El maestro decide. El sistema guía. El alumno progresa por dominio.

## 1. Corrección pedagógica aplicada

Esta versión organiza las obras-hito como **desbloqueos progresivos**, no como equivalencias rígidas. Vivaldi en La menor aparece como hito del Bloque I, pero el Nivel 10 queda como **Boss de fundación técnica** para cerrar la primera gran etapa y preparar el salto hacia Bach, Accolay y posteriormente Mendelssohn.

## 2. Estados de evaluación

| Estado | Uso |
|---|---|
| `pending` / Pendiente | Todavía no trabajado o no evaluado. |
| `in_progress` / En proceso | El alumno trabaja el dominio correcto, pero aún no puede avanzar. |
| `approved` / Aprobado | El maestro valida que cumple estándar. |
| `failed` / Reprobado | Debe repetirse el nodo o indicador. |
| `locked` / Bloqueado | No disponible hasta aprobar requisitos previos. |

**Importante:** `En proceso` es positivo, pero **no desbloquea el siguiente nivel**. Solo `Aprobado` desbloquea.

## 3. Nodos oficiales por nivel

| # | Nodo | Tipo | Crítico |
|---:|---|---|---|
| 1 | Escalas | technical | No |
| 2 | Arpegios y patrones | technical | No |
| 3 | Mano izquierda | technical | No |
| 4 | Arco | technical | No |
| 5 | Sonido | core | Sí |
| 6 | Afinación | core | Sí |
| 7 | Estudios técnicos | application | No |
| 8 | Repertorio / Obra-hito | integration | No |

## 4. Resumen de los 40 niveles

| Nivel | Bloque | Nombre | Obra-hito / foco | Objetivo resumido |
|---:|---|---|---|---|
| 1 | Fundación técnica y musical | Inicio corporal y sonoro | Cuerdas al aire y canciones de una cuerda | Establecer postura corporal, colocación del violín, agarre del arco y primera emisión de sonido. |
| 2 | Fundación técnica y musical | Primer patrón de dedos | Suzuki inicial / canciones con dedos 1-2-3 | Coordinar arco con los primeros dedos en primera posición. |
| 3 | Fundación técnica y musical | Coordinación básica de ambas manos | Seitz preparatorio / repertorio Suzuki I-II | Consolidar coordinación entre mano izquierda y arco. |
| 4 | Fundación técnica y musical | Estabilidad de primera posición | Seitz / Suzuki II | Asegurar primera posición, lectura funcional y control inicial de dinámica. |
| 5 | Fundación técnica y musical | Expansión tonal y fraseo inicial | Küchler / Concertino inicial | Ampliar tonalidades, introducir fraseo básico y fortalecer el control del arco. |
| 6 | Fundación técnica y musical | Articulación inicial y control rítmico | Küchler avanzado / Rieding preparatorio | Clarificar articulaciones, fortalecer ritmo interno y preparar pasajes activos. |
| 7 | Fundación técnica y musical | Introducción a tercera posición | Rieding / Vivaldi preparación | Iniciar cambios de posición y ampliar registro sin perder afinación ni sonido. |
| 8 | Fundación técnica y musical | Hito Vivaldi inicial | Vivaldi Concierto en La menor Op. 3 No. 6, I | Integrar primera y tercera posición, semicorcheas, cambios de cuerda y articulación barroca inicial. |
| 9 | Fundación técnica y musical | Pre-concierto intermedio | Bach A minor / Accolay preparación | Elevar la base hacia repertorio intermedio con vibrato inicial, cambios y escalas ampliadas. |
| 10 | Fundación técnica y musical | Boss de fundación técnica | Accolay / Bach A minor / Vivaldi consolidado | Cerrar la base fundacional: escalas ampliadas, vibrato funcional, posiciones hasta quinta, sonido y afinación confiables. |
| 11 | Entrada al repertorio serio | Post-fundación barroca | Bach Concierto en La menor | Consolidar articulación, fraseo barroco y control de secuencias. |
| 12 | Entrada al repertorio serio | Forma de concierto intermedio | Accolay Concierto en La menor | Trabajar obra de mayor forma con expresividad y control escénico. |
| 13 | Entrada al repertorio serio | Clasicismo y elegancia técnica | Mozart 3 / Viotti 22 preparación | Introducir claridad clásica, estilo y articulación elegante. |
| 14 | Entrada al repertorio serio | Puente romántico | Bruch/Mendelssohn preparación | Preparar fraseo romántico, vibrato maduro y escalas completas. |
| 15 | Entrada al repertorio serio | Mendelssohn entrada | Mendelssohn Concierto en Mi menor - fragmentos | Descomponer Mendelssohn en capas: Mi menor, spiccato, cambios, semicorcheas y fraseo. |
| 16 | Entrada al repertorio serio | Mendelssohn integración | Mendelssohn Concierto en Mi menor - I | Integrar fragmentos de Mendelssohn con continuidad, fraseo y resistencia. |
| 17 | Entrada al repertorio serio | Concierto romántico I | Bruch entrada / Mendelssohn consolidado | Desarrollar sonido romántico amplio, conducción armónica y resistencia. |
| 18 | Entrada al repertorio serio | Concierto romántico II | Bruch Concierto en Sol menor - I/II | Consolidar lenguaje romántico, arco sostenido y registro alto. |
| 19 | Entrada al repertorio serio | Virtuosismo inicial serio | Saint-Saëns 3 / Wieniawski 2 preparación | Iniciar brillantez técnica, velocidad, cromatismos y resistencia. |
| 20 | Entrada al repertorio serio | Gateway de virtuosismo | Saint-Saëns 3 / Wieniawski 2 / Bruch completo | Certificar entrada al repertorio virtuoso serio con control técnico, musical y escénico. |
| 21 | Virtuosismo intermedio-alto | Color y carácter virtuoso | Lalo Symphonie Espagnole - entrada | Trabajar carácter, ritmos de danza, brillantez y color. |
| 22 | Virtuosismo intermedio-alto | Lalo integración | Lalo Symphonie Espagnole - movimientos | Integrar virtuosismo con estilo, forma y resistencia. |
| 23 | Virtuosismo intermedio-alto | Tchaikovsky preparación | Tchaikovsky Concierto - entrada | Preparar sonido amplio, frase larga, resistencia y pasajes exigentes. |
| 24 | Virtuosismo intermedio-alto | Tchaikovsky integración | Tchaikovsky Concierto - movimiento | Integrar resistencia, lirismo y virtuosismo. |
| 25 | Virtuosismo intermedio-alto | Sibelius preparación | Sibelius Concierto - entrada | Preparar registro alto, tensión controlada, ritmo y color oscuro. |
| 26 | Virtuosismo intermedio-alto | Sibelius integración | Sibelius Concierto - I | Integrar tensión musical, precisión y registro alto. |
| 27 | Virtuosismo intermedio-alto | Paganini inicial | Paganini Caprices iniciales / Moto Perpetuo | Entrar al virtuosismo explícito: velocidad, elasticidad y patrones caprichosos. |
| 28 | Virtuosismo intermedio-alto | Paganini controlado | Paganini Caprices seleccionados | Consolidar mecanismos virtuosos sin sacrificar sonido ni afinación. |
| 29 | Virtuosismo intermedio-alto | Ysaÿe preparación | Ysaÿe Sonatas - entrada | Preparar polifonía, independencia, lenguaje moderno y estructura. |
| 30 | Virtuosismo intermedio-alto | Top 20 gateway | Ysaÿe / Paganini 24 entrada | Certificar entrada al repertorio top 20 con polifonía y virtuosismo. |
| 31 | Virtuosismo superior y élite | Wieniawski/Sarasate entrada | Wieniawski 1 / Sarasate avanzado | Desarrollar virtuosismo brillante, elegancia y técnica extrema controlada. |
| 32 | Virtuosismo superior y élite | Sarasate/Wieniawski integración | Zigeunerweisen / Wieniawski selección | Integrar virtuosismo brillante con rubato, carácter y escena. |
| 33 | Virtuosismo superior y élite | Paganini avanzado I | Paganini Caprices avanzados | Abordar caprichos de alta dificultad con claridad y resistencia. |
| 34 | Virtuosismo superior y élite | Paganini avanzado II | Paganini Caprices / Concierto 1 preparación | Consolidar virtuosismo sostenido en forma larga. |
| 35 | Virtuosismo superior y élite | Ernst/Sarasate extremo entrada | Ernst / Sarasate extremo | Entrar al repertorio extremo con polifonía, armónicos y narrativa. |
| 36 | Virtuosismo superior y élite | Polifonía extrema | Ernst Last Rose / Bach solo avanzado | Consolidar independencia de voces, acordes y arquitectura. |
| 37 | Virtuosismo superior y élite | Repertorio moderno extremo | Bartók / Prokofiev / Shostakovich selección | Dominar complejidad rítmica, armónica y sonora moderna. |
| 38 | Virtuosismo superior y élite | Concierto élite | Brahms / Sibelius / Tchaikovsky / Bartók completo | Integrar técnica extrema con gran forma y madurez profesional. |
| 39 | Virtuosismo superior y élite | Top 10 preparación | Ernst Erlkönig / Paganini 24 avanzado | Preparar obra top 10 con diagnóstico técnico completo. |
| 40 | Virtuosismo superior y élite | Capstone élite internacional | Obra final top 10: Ernst Erlkönig / Paganini 24 / equivalente | Certificar dominio integral mediante una obra de élite internacional. |

---

# 5. Planificación detallada nivel por nivel

---

## Nivel 01 — Inicio corporal y sonoro

**Bloque:** Fundación técnica y musical  
**Obra-hito / foco:** Cuerdas al aire y canciones de una cuerda  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Establecer postura corporal, colocación del violín, agarre del arco y primera emisión de sonido.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar cuerdas al aire y patrones rítmicos básicos como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta cuerdas al aire y patrones rítmicos básicos de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 50 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar patrones abiertos I-V-I con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta patrones abiertos I-V-I con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar mano relajada y dedos preparados.

- [ ] **Indicador 1:** Demuestra mano relajada y dedos preparados en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar arco recto en cuerdas al aire, detaché largo.

- [ ] **Indicador 1:** Ejecuta arco recto en cuerdas al aire, detaché largo en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar sonido limpio sin presión excesiva.

- [ ] **Indicador 1:** Produce sonido limpio sin presión excesiva de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr reconocimiento auditivo de cuerdas.

- [ ] **Indicador 1:** Demuestra reconocimiento auditivo de cuerdas en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar ejercicios de arco en cuerdas al aire como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de ejercicios de arco en cuerdas al aire.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: canciones simples en una cuerda.

- [ ] **Indicador 1:** Prepara canciones simples en una cuerda según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 02 — Primer patrón de dedos

**Bloque:** Fundación técnica y musical  
**Obra-hito / foco:** Suzuki inicial / canciones con dedos 1-2-3  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Coordinar arco con los primeros dedos en primera posición.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar Re Mayor a una octava como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta Re Mayor a una octava de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 56 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegio de Re Mayor con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegio de Re Mayor con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar dedos 1, 2 y 3 estables.

- [ ] **Indicador 1:** Demuestra dedos 1, 2 y 3 estables en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar detaché simple y cambios básicos de cuerda.

- [ ] **Indicador 1:** Ejecuta detaché simple y cambios básicos de cuerda en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar contacto estable y sonido continuo.

- [ ] **Indicador 1:** Produce contacto estable y sonido continuo de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr patrón tonal de Re Mayor.

- [ ] **Indicador 1:** Demuestra patrón tonal de Re Mayor en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar ejercicios básicos de primera posición como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de ejercicios básicos de primera posición.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: canciones simples con dedos.

- [ ] **Indicador 1:** Prepara canciones simples con dedos según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 03 — Coordinación básica de ambas manos

**Bloque:** Fundación técnica y musical  
**Obra-hito / foco:** Seitz preparatorio / repertorio Suzuki I-II  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Consolidar coordinación entre mano izquierda y arco.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar Sol Mayor y Re Mayor a una octava como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta Sol Mayor y Re Mayor a una octava de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 60 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios de Sol y Re con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios de Sol y Re con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar independencia de dedos 1-4.

- [ ] **Indicador 1:** Demuestra independencia de dedos 1-4 en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar detaché estable y legato de dos notas.

- [ ] **Indicador 1:** Ejecuta detaché estable y legato de dos notas en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar sonido parejo entre cuerdas vecinas.

- [ ] **Indicador 1:** Produce sonido parejo entre cuerdas vecinas de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr estabilidad de patrones mayores.

- [ ] **Indicador 1:** Demuestra estabilidad de patrones mayores en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar estudios breves de coordinación mano-arco como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de estudios breves de coordinación mano-arco.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: pieza formativa tipo Seitz inicial.

- [ ] **Indicador 1:** Prepara pieza formativa tipo Seitz inicial según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 04 — Estabilidad de primera posición

**Bloque:** Fundación técnica y musical  
**Obra-hito / foco:** Seitz / Suzuki II  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Asegurar primera posición, lectura funcional y control inicial de dinámica.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar Sol, Re y La Mayor; introducción a dos octavas como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta Sol, Re y La Mayor; introducción a dos octavas de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 66 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios mayores básicos con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios mayores básicos con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar cuarto dedo y patrones tono/semitono.

- [ ] **Indicador 1:** Demuestra cuarto dedo y patrones tono/semitono en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar distribución del arco, detaché y legato 2-4 notas.

- [ ] **Indicador 1:** Ejecuta distribución del arco, detaché y legato 2-4 notas en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar piano y forte diferenciados.

- [ ] **Indicador 1:** Produce piano y forte diferenciados de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr afinación consistente en primera posición.

- [ ] **Indicador 1:** Demuestra afinación consistente en primera posición en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar estudios de primera posición como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de estudios de primera posición.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Seitz o equivalente.

- [ ] **Indicador 1:** Prepara Seitz o equivalente según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 05 — Expansión tonal y fraseo inicial

**Bloque:** Fundación técnica y musical  
**Obra-hito / foco:** Küchler / Concertino inicial  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Ampliar tonalidades, introducir fraseo básico y fortalecer el control del arco.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar La Mayor, Mi menor y Re menor como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta La Mayor, Mi menor y Re menor de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 72 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios de La Mayor, Mi menor y Re menor con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios de La Mayor, Mi menor y Re menor con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar dedo 4 firme y extensiones simples.

- [ ] **Indicador 1:** Demuestra dedo 4 firme y extensiones simples en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar martelé básico y detaché con pulso estable.

- [ ] **Indicador 1:** Ejecuta martelé básico y detaché con pulso estable en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar contraste piano/forte y dirección de frase.

- [ ] **Indicador 1:** Produce contraste piano/forte y dirección de frase de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr afinación en cambios de cuerda y tonalidades menores.

- [ ] **Indicador 1:** Demuestra afinación en cambios de cuerda y tonalidades menores en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar estudios de articulación básica como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de estudios de articulación básica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Küchler o concertino inicial.

- [ ] **Indicador 1:** Prepara Küchler o concertino inicial según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 06 — Articulación inicial y control rítmico

**Bloque:** Fundación técnica y musical  
**Obra-hito / foco:** Küchler avanzado / Rieding preparatorio  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Clarificar articulaciones, fortalecer ritmo interno y preparar pasajes activos.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar Sol Mayor, La Mayor y Re menor a dos octavas como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta Sol Mayor, La Mayor y Re menor a dos octavas de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 76 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios mayores y menores relacionados con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios mayores y menores relacionados con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar semicorcheas lentas e independencia moderada.

- [ ] **Indicador 1:** Demuestra semicorcheas lentas e independencia moderada en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar martelé, detaché activo y spiccato preparado.

- [ ] **Indicador 1:** Ejecuta martelé, detaché activo y spiccato preparado en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar limpieza en articulaciones cortas.

- [ ] **Indicador 1:** Produce limpieza en articulaciones cortas de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr estabilidad en tonalidades menores.

- [ ] **Indicador 1:** Demuestra estabilidad en tonalidades menores en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar estudios de martelé y cambios de cuerda como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de estudios de martelé y cambios de cuerda.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: concertino con articulación clara.

- [ ] **Indicador 1:** Prepara concertino con articulación clara según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 07 — Introducción a tercera posición

**Bloque:** Fundación técnica y musical  
**Obra-hito / foco:** Rieding / Vivaldi preparación  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Iniciar cambios de posición y ampliar registro sin perder afinación ni sonido.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar Sol Mayor y La Mayor a dos octavas con tercera posición como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta Sol Mayor y La Mayor a dos octavas con tercera posición de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 80 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios a dos octavas con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios a dos octavas con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar cambio primera-tercera con guía auditiva.

- [ ] **Indicador 1:** Demuestra cambio primera-tercera con guía auditiva en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar detaché y legato controlado.

- [ ] **Indicador 1:** Ejecuta detaché y legato controlado en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar sonido estable durante cambios.

- [ ] **Indicador 1:** Produce sonido estable durante cambios de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr afinación en tercera posición.

- [ ] **Indicador 1:** Demuestra afinación en tercera posición en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar ejercicios de cambio de posición como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de ejercicios de cambio de posición.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Rieding inicial o Vivaldi preparatorio.

- [ ] **Indicador 1:** Prepara Rieding inicial o Vivaldi preparatorio según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 08 — Hito Vivaldi inicial

**Bloque:** Fundación técnica y musical  
**Obra-hito / foco:** Vivaldi Concierto en La menor Op. 3 No. 6, I  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Integrar primera y tercera posición, semicorcheas, cambios de cuerda y articulación barroca inicial.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar La menor, Do Mayor y Sol Mayor a dos octavas como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta La menor, Do Mayor y Sol Mayor a dos octavas de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 84 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar La menor, Do Mayor y dominante de Mi con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta La menor, Do Mayor y dominante de Mi con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar semicorcheas limpias y cambios simples.

- [ ] **Indicador 1:** Demuestra semicorcheas limpias y cambios simples en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar detaché claro, cambios rápidos y spiccato básico.

- [ ] **Indicador 1:** Ejecuta detaché claro, cambios rápidos y spiccato básico en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar claridad y resonancia en pasajes rápidos.

- [ ] **Indicador 1:** Produce claridad y resonancia en pasajes rápidos de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr estabilidad en La menor.

- [ ] **Indicador 1:** Demuestra estabilidad en La menor en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar estudios de semicorcheas y secuencias como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de estudios de semicorcheas y secuencias.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Vivaldi La menor: fragmentos o movimiento.

- [ ] **Indicador 1:** Prepara Vivaldi La menor: fragmentos o movimiento según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 09 — Pre-concierto intermedio

**Bloque:** Fundación técnica y musical  
**Obra-hito / foco:** Bach A minor / Accolay preparación  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Elevar la base hacia repertorio intermedio con vibrato inicial, cambios y escalas ampliadas.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar Sol Mayor, La menor, Do Mayor y Re Mayor; tres octavas iniciales como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta Sol Mayor, La menor, Do Mayor y Re Mayor; tres octavas iniciales de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 88 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios a dos octavas y dominantes con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios a dos octavas y dominantes con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar primera-tercera-quinta y vibrato inicial.

- [ ] **Indicador 1:** Demuestra primera-tercera-quinta y vibrato inicial en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar legato de 4, detaché sostenido y martelé.

- [ ] **Indicador 1:** Ejecuta legato de 4, detaché sostenido y martelé en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar fraseo cantabile y resonancia.

- [ ] **Indicador 1:** Produce fraseo cantabile y resonancia de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr afinación entre posiciones.

- [ ] **Indicador 1:** Demuestra afinación entre posiciones en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Kayser, Wohlfahrt avanzado o Ševčík como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Kayser, Wohlfahrt avanzado o Ševčík.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: fragmentos de Bach A minor o Accolay.

- [ ] **Indicador 1:** Prepara fragmentos de Bach A minor o Accolay según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 10 — Boss de fundación técnica

**Bloque:** Fundación técnica y musical  
**Obra-hito / foco:** Accolay / Bach A minor / Vivaldi consolidado  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Cerrar la base fundacional: escalas ampliadas, vibrato funcional, posiciones hasta quinta, sonido y afinación confiables.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar Sol, La menor, Do, Re y La a dos/tres octavas como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta Sol, La menor, Do, Re y La a dos/tres octavas de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 92 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios mayores, menores y dominantes con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios mayores, menores y dominantes con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar primera, tercera y quinta con vibrato funcional.

- [ ] **Indicador 1:** Demuestra primera, tercera y quinta con vibrato funcional en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar detaché, martelé, legato y spiccato básico.

- [ ] **Indicador 1:** Ejecuta detaché, martelé, legato y spiccato básico en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar sonido proyectado y con dirección.

- [ ] **Indicador 1:** Produce sonido proyectado y con dirección de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr afinación estable sin dependencia total.

- [ ] **Indicador 1:** Demuestra afinación estable sin dependencia total en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Kayser, Mazas inicial, Ševčík o Hrimaly como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Kayser, Mazas inicial, Ševčík o Hrimaly.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Accolay, Bach A minor o Vivaldi consolidado.

- [ ] **Indicador 1:** Prepara Accolay, Bach A minor o Vivaldi consolidado según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 11 — Post-fundación barroca

**Bloque:** Entrada al repertorio serio  
**Obra-hito / foco:** Bach Concierto en La menor  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Consolidar articulación, fraseo barroco y control de secuencias.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar La menor, Do, Mi menor y Sol a tres octavas progresivas como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta La menor, Do, Mi menor y Sol a tres octavas progresivas de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 96 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios y dominantes de La menor/Mi con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios y dominantes de La menor/Mi con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar cambios primera-tercera-quinta.

- [ ] **Indicador 1:** Demuestra cambios primera-tercera-quinta en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar articulación barroca y detaché activo.

- [ ] **Indicador 1:** Ejecuta articulación barroca y detaché activo en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar sonido claro y no pesado.

- [ ] **Indicador 1:** Produce sonido claro y no pesado de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr afinación por función armónica.

- [ ] **Indicador 1:** Demuestra afinación por función armónica en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Kreutzer inicial, Kayser avanzado como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Kreutzer inicial, Kayser avanzado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Bach A minor: movimiento o secciones.

- [ ] **Indicador 1:** Prepara Bach A minor: movimiento o secciones según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 12 — Forma de concierto intermedio

**Bloque:** Entrada al repertorio serio  
**Obra-hito / foco:** Accolay Concierto en La menor  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Trabajar obra de mayor forma con expresividad y control escénico.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar La menor, La Mayor, Do y Mi a tres octavas como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta La menor, La Mayor, Do y Mi a tres octavas de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 100 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar triadas y séptima dominante de Mi con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta triadas y séptima dominante de Mi con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar vibrato estable y cambios expresivos.

- [ ] **Indicador 1:** Demuestra vibrato estable y cambios expresivos en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar cantabile y martelé expresivo.

- [ ] **Indicador 1:** Ejecuta cantabile y martelé expresivo en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar sonido romántico inicial.

- [ ] **Indicador 1:** Produce sonido romántico inicial de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr afinación en cambios expresivos.

- [ ] **Indicador 1:** Demuestra afinación en cambios expresivos en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Mazas inicial, Kreutzer, vibrato como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Mazas inicial, Kreutzer, vibrato.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Accolay completo o secciones.

- [ ] **Indicador 1:** Prepara Accolay completo o secciones según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 13 — Clasicismo y elegancia técnica

**Bloque:** Entrada al repertorio serio  
**Obra-hito / foco:** Mozart 3 / Viotti 22 preparación  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Introducir claridad clásica, estilo y articulación elegante.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar Sol, Re, La y Mi menor a tres octavas como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta Sol, Re, La y Mi menor a tres octavas de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 104 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios y dominantes clásicas con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios y dominantes clásicas con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar trinos iniciales y cambios limpios.

- [ ] **Indicador 1:** Demuestra trinos iniciales y cambios limpios en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar spiccato ligero y detaché elegante.

- [ ] **Indicador 1:** Ejecuta spiccato ligero y detaché elegante en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar sonido transparente y proporcionado.

- [ ] **Indicador 1:** Produce sonido transparente y proporcionado de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr afinación expuesta en claridad clásica.

- [ ] **Indicador 1:** Demuestra afinación expuesta en claridad clásica en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Kreutzer, Ševčík y ornamentación como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Kreutzer, Ševčík y ornamentación.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Mozart 3, Viotti 22 o equivalente.

- [ ] **Indicador 1:** Prepara Mozart 3, Viotti 22 o equivalente según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 14 — Puente romántico

**Bloque:** Entrada al repertorio serio  
**Obra-hito / foco:** Bruch/Mendelssohn preparación  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Preparar fraseo romántico, vibrato maduro y escalas completas.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar Mi menor, Sol, Re, Si menor y La a tres octavas como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta Mi menor, Sol, Re, Si menor y La a tres octavas de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 108 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios, dominantes y disminuidos iniciales con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios, dominantes y disminuidos iniciales con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar cambios hasta quinta/séptima y vibrato flexible.

- [ ] **Indicador 1:** Demuestra cambios hasta quinta/séptima y vibrato flexible en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar legato sostenido, detaché brillante y spiccato.

- [ ] **Indicador 1:** Ejecuta legato sostenido, detaché brillante y spiccato en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar frase larga y cambio de color.

- [ ] **Indicador 1:** Produce frase larga y cambio de color de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr registro alto y dobles cuerdas simples.

- [ ] **Indicador 1:** Demuestra registro alto y dobles cuerdas simples en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Kreutzer medio, Dont 37 inicial como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Kreutzer medio, Dont 37 inicial.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: fragmentos de Bruch y Mendelssohn.

- [ ] **Indicador 1:** Prepara fragmentos de Bruch y Mendelssohn según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 15 — Mendelssohn entrada

**Bloque:** Entrada al repertorio serio  
**Obra-hito / foco:** Mendelssohn Concierto en Mi menor - fragmentos  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Descomponer Mendelssohn en capas: Mi menor, spiccato, cambios, semicorcheas y fraseo.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar Mi menor, Sol, Si menor y Re a tres octavas como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta Mi menor, Sol, Si menor y Re a tres octavas de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 112 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar Mi menor, Sol, Si menor, dominantes y disminuidos con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta Mi menor, Sol, Si menor, dominantes y disminuidos con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar cambios rápidos, cromatismos y registro alto.

- [ ] **Indicador 1:** Demuestra cambios rápidos, cromatismos y registro alto en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar spiccato ligero, detaché rápido y legato.

- [ ] **Indicador 1:** Ejecuta spiccato ligero, detaché rápido y legato en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar cantabile romántico sin tensión.

- [ ] **Indicador 1:** Produce cantabile romántico sin tensión de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr notas de llegada en cambios amplios.

- [ ] **Indicador 1:** Demuestra notas de llegada en cambios amplios en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Kreutzer, Dont 37, Ševčík analítico como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Kreutzer, Dont 37, Ševčík analítico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Mendelssohn: exposición y pasajes.

- [ ] **Indicador 1:** Prepara Mendelssohn: exposición y pasajes según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 16 — Mendelssohn integración

**Bloque:** Entrada al repertorio serio  
**Obra-hito / foco:** Mendelssohn Concierto en Mi menor - I  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Integrar fragmentos de Mendelssohn con continuidad, fraseo y resistencia.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar Mi menor, Sol, Re, Si menor y cromáticas como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta Mi menor, Sol, Re, Si menor y cromáticas de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 116 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios y séptimas de Mi menor con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios y séptimas de Mi menor con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar semicorcheas, extensiones y shifts.

- [ ] **Indicador 1:** Demuestra semicorcheas, extensiones y shifts en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar spiccato estable y cambios rápidos.

- [ ] **Indicador 1:** Ejecuta spiccato estable y cambios rápidos en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar fraseo romántico con color.

- [ ] **Indicador 1:** Produce fraseo romántico con color de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr afinación bajo presión de tempo.

- [ ] **Indicador 1:** Demuestra afinación bajo presión de tempo en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Dont 37, Kreutzer avanzados como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Dont 37, Kreutzer avanzados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Mendelssohn I parcial/completo.

- [ ] **Indicador 1:** Prepara Mendelssohn I parcial/completo según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 17 — Concierto romántico I

**Bloque:** Entrada al repertorio serio  
**Obra-hito / foco:** Bruch entrada / Mendelssohn consolidado  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Desarrollar sonido romántico amplio, conducción armónica y resistencia.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar Sol menor, Sib, Re, Mi menor y Sol como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta Sol menor, Sib, Re, Mi menor y Sol de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 116 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar Sol menor, Sib, Re dominante y disminuidos con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta Sol menor, Sib, Re dominante y disminuidos con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar vibrato expresivo y octavas preparatorias.

- [ ] **Indicador 1:** Demuestra vibrato expresivo y octavas preparatorias en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar legato amplio y martelé expresivo.

- [ ] **Indicador 1:** Ejecuta legato amplio y martelé expresivo en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar proyección cálida y profunda.

- [ ] **Indicador 1:** Produce proyección cálida y profunda de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr intervalos expresivos y dobles cuerdas.

- [ ] **Indicador 1:** Demuestra intervalos expresivos y dobles cuerdas en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Kreutzer dobles cuerdas, Mazas como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Kreutzer dobles cuerdas, Mazas.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Bruch I fragmentos o Mendelssohn consolidado.

- [ ] **Indicador 1:** Prepara Bruch I fragmentos o Mendelssohn consolidado según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 18 — Concierto romántico II

**Bloque:** Entrada al repertorio serio  
**Obra-hito / foco:** Bruch Concierto en Sol menor - I/II  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Consolidar lenguaje romántico, arco sostenido y registro alto.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar Sol menor, Re, Mib y Sib a tres octavas como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta Sol menor, Re, Mib y Sib a tres octavas de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 120 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar dominantes, disminuidos y arpegios altos con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta dominantes, disminuidos y arpegios altos con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar registro alto, extensiones y octavas.

- [ ] **Indicador 1:** Demuestra registro alto, extensiones y octavas en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar arco sostenido y presión/velocidad expresiva.

- [ ] **Indicador 1:** Ejecuta arco sostenido y presión/velocidad expresiva en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar sonido amplio sin rigidez.

- [ ] **Indicador 1:** Produce sonido amplio sin rigidez de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr frases largas y cambios expresivos.

- [ ] **Indicador 1:** Demuestra frases largas y cambios expresivos en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Kreutzer, Fiorillo inicial como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Kreutzer, Fiorillo inicial.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Bruch movimiento seleccionado.

- [ ] **Indicador 1:** Prepara Bruch movimiento seleccionado según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 19 — Virtuosismo inicial serio

**Bloque:** Entrada al repertorio serio  
**Obra-hito / foco:** Saint-Saëns 3 / Wieniawski 2 preparación  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Iniciar brillantez técnica, velocidad, cromatismos y resistencia.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar Si menor, Re, Sol menor, La y Mi a tres octavas como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta Si menor, Re, Sol menor, La y Mi a tres octavas de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 124 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios, dominantes, disminuidos y cromáticas rápidas con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios, dominantes, disminuidos y cromáticas rápidas con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar velocidad, trinos, cambios y extensiones.

- [ ] **Indicador 1:** Demuestra velocidad, trinos, cambios y extensiones en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar spiccato, sautillé inicial y detaché brillante.

- [ ] **Indicador 1:** Ejecuta spiccato, sautillé inicial y detaché brillante en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar brillo sin dureza.

- [ ] **Indicador 1:** Produce brillo sin dureza de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr afinación en velocidad y registro alto.

- [ ] **Indicador 1:** Demuestra afinación en velocidad y registro alto en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Dont 35 inicial, Rode inicial como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Dont 35 inicial, Rode inicial.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: fragmentos de Saint-Saëns 3 o Wieniawski 2.

- [ ] **Indicador 1:** Prepara fragmentos de Saint-Saëns 3 o Wieniawski 2 según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 20 — Gateway de virtuosismo

**Bloque:** Entrada al repertorio serio  
**Obra-hito / foco:** Saint-Saëns 3 / Wieniawski 2 / Bruch completo  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Certificar entrada al repertorio virtuoso serio con control técnico, musical y escénico.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar mayores y menores frecuentes a tres octavas, cromáticas y dobles cuerdas iniciales como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta mayores y menores frecuentes a tres octavas, cromáticas y dobles cuerdas iniciales de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 128 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios, dominantes y disminuidos del repertorio con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios, dominantes y disminuidos del repertorio con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar posiciones altas, trinos, extensiones y octavas.

- [ ] **Indicador 1:** Demuestra posiciones altas, trinos, extensiones y octavas en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar spiccato, sautillé inicial, legato y detaché virtuoso.

- [ ] **Indicador 1:** Ejecuta spiccato, sautillé inicial, legato y detaché virtuoso en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar sonido de concierto con madurez.

- [ ] **Indicador 1:** Produce sonido de concierto con madurez de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr afinación bajo presión de tempo y registro.

- [ ] **Indicador 1:** Demuestra afinación bajo presión de tempo y registro en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Dont 35, Rode, Kreutzer avanzado como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Dont 35, Rode, Kreutzer avanzado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: obra gateway: Saint-Saëns 3, Wieniawski 2 o Bruch.

- [ ] **Indicador 1:** Prepara obra gateway: Saint-Saëns 3, Wieniawski 2 o Bruch según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 21 — Color y carácter virtuoso

**Bloque:** Virtuosismo intermedio-alto  
**Obra-hito / foco:** Lalo Symphonie Espagnole - entrada  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Trabajar carácter, ritmos de danza, brillantez y color.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar Re menor, Fa, La, Sol menor y Mi menor como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta Re menor, Fa, La, Sol menor y Mi menor de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 128 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios y dominantes con carácter rítmico con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios y dominantes con carácter rítmico con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar saltos y cambios estilísticos.

- [ ] **Indicador 1:** Demuestra saltos y cambios estilísticos en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar articulaciones de danza y acentos.

- [ ] **Indicador 1:** Ejecuta articulaciones de danza y acentos en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar colores contrastantes.

- [ ] **Indicador 1:** Produce colores contrastantes de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr afinación en cambios rápidos.

- [ ] **Indicador 1:** Demuestra afinación en cambios rápidos en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Rode, Dont 35 y acentos como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Rode, Dont 35 y acentos.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Lalo fragmentos o movimientos.

- [ ] **Indicador 1:** Prepara Lalo fragmentos o movimientos según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 22 — Lalo integración

**Bloque:** Virtuosismo intermedio-alto  
**Obra-hito / foco:** Lalo Symphonie Espagnole - movimientos  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Integrar virtuosismo con estilo, forma y resistencia.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar Re menor, La, Sol menor, Sib y cromáticas como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta Re menor, La, Sol menor, Sib y cromáticas de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 132 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar dominantes, disminuidos y articulación variada con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta dominantes, disminuidos y articulación variada con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar registro alto y dobles cuerdas funcionales.

- [ ] **Indicador 1:** Demuestra registro alto y dobles cuerdas funcionales en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar spiccato, sautillé, acentos y legato.

- [ ] **Indicador 1:** Ejecuta spiccato, sautillé, acentos y legato en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar brillo con elegancia.

- [ ] **Indicador 1:** Produce brillo con elegancia de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr saltos y articulación intensa.

- [ ] **Indicador 1:** Demuestra saltos y articulación intensa en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Rode, Fiorillo, Dont 35 como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Rode, Fiorillo, Dont 35.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Lalo movimientos integrados.

- [ ] **Indicador 1:** Prepara Lalo movimientos integrados según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 23 — Tchaikovsky preparación

**Bloque:** Virtuosismo intermedio-alto  
**Obra-hito / foco:** Tchaikovsky Concierto - entrada  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Preparar sonido amplio, frase larga, resistencia y pasajes exigentes.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar Re, Si menor, Sol, La y Mi menor como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta Re, Si menor, Sol, La y Mi menor de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 132 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios amplios y disminuidos con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios amplios y disminuidos con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar registro alto, escalas rápidas y octavas preparatorias.

- [ ] **Indicador 1:** Demuestra registro alto, escalas rápidas y octavas preparatorias en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar legato expansivo y detaché brillante.

- [ ] **Indicador 1:** Ejecuta legato expansivo y detaché brillante en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar sonido grande y lírico.

- [ ] **Indicador 1:** Produce sonido grande y lírico de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr frases extensas y velocidad.

- [ ] **Indicador 1:** Demuestra frases extensas y velocidad en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Rode, Dont 35, Ševčík como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Rode, Dont 35, Ševčík.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Tchaikovsky exposición/canzonetta/pasajes.

- [ ] **Indicador 1:** Prepara Tchaikovsky exposición/canzonetta/pasajes según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 24 — Tchaikovsky integración

**Bloque:** Virtuosismo intermedio-alto  
**Obra-hito / foco:** Tchaikovsky Concierto - movimiento  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Integrar resistencia, lirismo y virtuosismo.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar Re, Si menor, Sol, La y cromáticas avanzadas como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta Re, Si menor, Sol, La y cromáticas avanzadas de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 136 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar dominantes/disminuidos a alta velocidad con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta dominantes/disminuidos a alta velocidad con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar registro alto, octavas, trinos y shifts amplios.

- [ ] **Indicador 1:** Demuestra registro alto, octavas, trinos y shifts amplios en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar arco amplio, spiccato/sautillé.

- [ ] **Indicador 1:** Ejecuta arco amplio, spiccato/sautillé en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar sonido sostenido de concierto.

- [ ] **Indicador 1:** Produce sonido sostenido de concierto de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr alta exigencia física y musical.

- [ ] **Indicador 1:** Demuestra alta exigencia física y musical en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Rode avanzado, Gavinies inicial como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Rode avanzado, Gavinies inicial.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Tchaikovsky movimiento o secciones.

- [ ] **Indicador 1:** Prepara Tchaikovsky movimiento o secciones según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 25 — Sibelius preparación

**Bloque:** Virtuosismo intermedio-alto  
**Obra-hito / foco:** Sibelius Concierto - entrada  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Preparar registro alto, tensión controlada, ritmo y color oscuro.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar Re menor, Fa, La menor, Sib y cromáticas como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta Re menor, Fa, La menor, Sib y cromáticas de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 132 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar Re menor, dominantes y disminuidos con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta Re menor, dominantes y disminuidos con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar registro alto sostenido y dobles cuerdas iniciales.

- [ ] **Indicador 1:** Demuestra registro alto sostenido y dobles cuerdas iniciales en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar tremolo controlado, legato tenso y spiccato frío.

- [ ] **Indicador 1:** Ejecuta tremolo controlado, legato tenso y spiccato frío en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar color oscuro concentrado.

- [ ] **Indicador 1:** Produce color oscuro concentrado de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr registro alto y centros inestables.

- [ ] **Indicador 1:** Demuestra registro alto y centros inestables en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Rode avanzado, Gavinies como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Rode avanzado, Gavinies.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Sibelius entrada/cadencia/pasajes.

- [ ] **Indicador 1:** Prepara Sibelius entrada/cadencia/pasajes según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 26 — Sibelius integración

**Bloque:** Virtuosismo intermedio-alto  
**Obra-hito / foco:** Sibelius Concierto - I  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Integrar tensión musical, precisión y registro alto.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar Re menor, Fa, La menor y cromáticas/dobles cuerdas como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta Re menor, Fa, La menor y cromáticas/dobles cuerdas de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 136 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios y disminuidos con cambios amplios con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios y disminuidos con cambios amplios con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar registro extremo, dobles cuerdas y extensiones.

- [ ] **Indicador 1:** Demuestra registro extremo, dobles cuerdas y extensiones en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar spiccato seco, legato intenso y dinámica extrema.

- [ ] **Indicador 1:** Ejecuta spiccato seco, legato intenso y dinámica extrema en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar sonido oscuro proyectado.

- [ ] **Indicador 1:** Produce sonido oscuro proyectado de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr armonía compleja y alta precisión.

- [ ] **Indicador 1:** Demuestra armonía compleja y alta precisión en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Gavinies, Dont 35 avanzado como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Gavinies, Dont 35 avanzado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Sibelius I parcial/completo.

- [ ] **Indicador 1:** Prepara Sibelius I parcial/completo según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 27 — Paganini inicial

**Bloque:** Virtuosismo intermedio-alto  
**Obra-hito / foco:** Paganini Caprices iniciales / Moto Perpetuo  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Entrar al virtuosismo explícito: velocidad, elasticidad y patrones caprichosos.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar todas las escalas frecuentes a tres octavas con velocidad como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta todas las escalas frecuentes a tres octavas con velocidad de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 140 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios extendidos y secuenciales con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios extendidos y secuenciales con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar velocidad, extensiones, trinos y saltos.

- [ ] **Indicador 1:** Demuestra velocidad, extensiones, trinos y saltos en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar sautillé, ricochet inicial y detaché extremo.

- [ ] **Indicador 1:** Ejecuta sautillé, ricochet inicial y detaché extremo en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar claridad en velocidad.

- [ ] **Indicador 1:** Produce claridad en velocidad de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr alta densidad y cambios veloces.

- [ ] **Indicador 1:** Demuestra alta densidad y cambios veloces en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Paganini preparatorio, Gavinies como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Paganini preparatorio, Gavinies.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Caprices iniciales o Moto Perpetuo.

- [ ] **Indicador 1:** Prepara Caprices iniciales o Moto Perpetuo según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 28 — Paganini controlado

**Bloque:** Virtuosismo intermedio-alto  
**Obra-hito / foco:** Paganini Caprices seleccionados  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Consolidar mecanismos virtuosos sin sacrificar sonido ni afinación.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar escalas con articulaciones y dobles cuerdas básicas como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta escalas con articulaciones y dobles cuerdas básicas de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 144 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios saltados y quebrados con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios saltados y quebrados con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar extensiones, saltos, octavas iniciales.

- [ ] **Indicador 1:** Demuestra extensiones, saltos, octavas iniciales en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar ricochet, sautillé y cambios extremos.

- [ ] **Indicador 1:** Ejecuta ricochet, sautillé y cambios extremos en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar sonido claro en virtuosismo.

- [ ] **Indicador 1:** Produce sonido claro en virtuosismo de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr dobles cuerdas y patrones rápidos.

- [ ] **Indicador 1:** Demuestra dobles cuerdas y patrones rápidos en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Paganini, Gavinies, Fiorillo avanzado como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Paganini, Gavinies, Fiorillo avanzado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Paganini caprice seleccionado.

- [ ] **Indicador 1:** Prepara Paganini caprice seleccionado según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 29 — Ysaÿe preparación

**Bloque:** Virtuosismo intermedio-alto  
**Obra-hito / foco:** Ysaÿe Sonatas - entrada  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Preparar polifonía, independencia, lenguaje moderno y estructura.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar modos, cromáticas y tonalidades de Ysaÿe como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta modos, cromáticas y tonalidades de Ysaÿe de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 136 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar acordes quebrados y patrones polifónicos con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta acordes quebrados y patrones polifónicos con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar dobles cuerdas, acordes y extensiones.

- [ ] **Indicador 1:** Demuestra dobles cuerdas, acordes y extensiones en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar acordes, bariolage y legato polifónico.

- [ ] **Indicador 1:** Ejecuta acordes, bariolage y legato polifónico en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar capas sonoras diferenciadas.

- [ ] **Indicador 1:** Produce capas sonoras diferenciadas de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr afinación vertical en acordes.

- [ ] **Indicador 1:** Demuestra afinación vertical en acordes en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Bach solo, Dont/Gavinies como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Bach solo, Dont/Gavinies.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Ysaÿe fragmentos/movimientos.

- [ ] **Indicador 1:** Prepara Ysaÿe fragmentos/movimientos según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 30 — Top 20 gateway

**Bloque:** Virtuosismo intermedio-alto  
**Obra-hito / foco:** Ysaÿe / Paganini 24 entrada  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Certificar entrada al repertorio top 20 con polifonía y virtuosismo.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar todas las escalas, cromáticas y dobles cuerdas principales como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta todas las escalas, cromáticas y dobles cuerdas principales de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 148 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar dominantes, disminuidos y acordes quebrados con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta dominantes, disminuidos y acordes quebrados con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar octavas, décimas iniciales, acordes y velocidad.

- [ ] **Indicador 1:** Demuestra octavas, décimas iniciales, acordes y velocidad en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar ricochet, sautillé, acordes y bariolage.

- [ ] **Indicador 1:** Ejecuta ricochet, sautillé, acordes y bariolage en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar diferenciación de voces.

- [ ] **Indicador 1:** Produce diferenciación de voces de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr afinación vertical/horizontal avanzada.

- [ ] **Indicador 1:** Demuestra afinación vertical/horizontal avanzada en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Paganini, Gavinies, Bach solo como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Paganini, Gavinies, Bach solo.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Ysaÿe o Paganini 24 entrada.

- [ ] **Indicador 1:** Prepara Ysaÿe o Paganini 24 entrada según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 31 — Wieniawski/Sarasate entrada

**Bloque:** Virtuosismo superior y élite  
**Obra-hito / foco:** Wieniawski 1 / Sarasate avanzado  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Desarrollar virtuosismo brillante, elegancia y técnica extrema controlada.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar tonalidades brillantes con dobles cuerdas y cromáticas como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta tonalidades brillantes con dobles cuerdas y cromáticas de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 148 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios extendidos y saltados con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios extendidos y saltados con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar octavas, trinos, extensiones y cambios extremos.

- [ ] **Indicador 1:** Demuestra octavas, trinos, extensiones y cambios extremos en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar sautillé brillante, ricochet y spiccato.

- [ ] **Indicador 1:** Ejecuta sautillé brillante, ricochet y spiccato en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar brillo y proyección.

- [ ] **Indicador 1:** Produce brillo y proyección de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr registro alto virtuoso.

- [ ] **Indicador 1:** Demuestra registro alto virtuoso en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Wieniawski études-caprices, Paganini como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Wieniawski études-caprices, Paganini.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Wieniawski/Sarasate fragmentos.

- [ ] **Indicador 1:** Prepara Wieniawski/Sarasate fragmentos según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 32 — Sarasate/Wieniawski integración

**Bloque:** Virtuosismo superior y élite  
**Obra-hito / foco:** Zigeunerweisen / Wieniawski selección  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Integrar virtuosismo brillante con rubato, carácter y escena.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar escalas con rubato, dobles cuerdas y velocidad como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta escalas con rubato, dobles cuerdas y velocidad de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 152 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios de carácter y patrones de salón con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios de carácter y patrones de salón con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar glissandi, octavas y trinos rápidos.

- [ ] **Indicador 1:** Demuestra glissandi, octavas y trinos rápidos en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar ricochet, spiccato, sautillé y acentos.

- [ ] **Indicador 1:** Ejecuta ricochet, spiccato, sautillé y acentos en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar paleta tímbrica amplia.

- [ ] **Indicador 1:** Produce paleta tímbrica amplia de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr rubato y ornamentación afinada.

- [ ] **Indicador 1:** Demuestra rubato y ornamentación afinada en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Wieniawski, Paganini, Sarasate como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Wieniawski, Paganini, Sarasate.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Zigeunerweisen o Wieniawski.

- [ ] **Indicador 1:** Prepara Zigeunerweisen o Wieniawski según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 33 — Paganini avanzado I

**Bloque:** Virtuosismo superior y élite  
**Obra-hito / foco:** Paganini Caprices avanzados  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Abordar caprichos de alta dificultad con claridad y resistencia.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar terceras, sextas, octavas y cromáticas como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta terceras, sextas, octavas y cromáticas de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 152 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios saltados y acordes rápidos con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios saltados y acordes rápidos con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar octavas, décimas preparatorias y trinos dobles.

- [ ] **Indicador 1:** Demuestra octavas, décimas preparatorias y trinos dobles en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar ricochet avanzado, sautillé extremo y bariolage.

- [ ] **Indicador 1:** Ejecuta ricochet avanzado, sautillé extremo y bariolage en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar sonido enfocado en mecanismos extremos.

- [ ] **Indicador 1:** Produce sonido enfocado en mecanismos extremos de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr doble cuerda y saltos.

- [ ] **Indicador 1:** Demuestra doble cuerda y saltos en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Paganini, Locatelli, Wieniawski como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Paganini, Locatelli, Wieniawski.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Paganini caprice avanzado.

- [ ] **Indicador 1:** Prepara Paganini caprice avanzado según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 34 — Paganini avanzado II

**Bloque:** Virtuosismo superior y élite  
**Obra-hito / foco:** Paganini Caprices / Concierto 1 preparación  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Consolidar virtuosismo sostenido en forma larga.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar escalas rápidas, dobles cuerdas y patrones de concierto como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta escalas rápidas, dobles cuerdas y patrones de concierto de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 156 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios extendidos y saltos altos con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios extendidos y saltos altos con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar décimas iniciales, armónicos y registro extremo.

- [ ] **Indicador 1:** Demuestra décimas iniciales, armónicos y registro extremo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar spiccato/ricochet sostenido y fatiga.

- [ ] **Indicador 1:** Ejecuta spiccato/ricochet sostenido y fatiga en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar proyección virtuosa sin dureza.

- [ ] **Indicador 1:** Produce proyección virtuosa sin dureza de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr pasajes largos extremos.

- [ ] **Indicador 1:** Demuestra pasajes largos extremos en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Paganini, Wieniawski, Dont/Gavinies como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Paganini, Wieniawski, Dont/Gavinies.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Paganini avanzado o Concierto 1.

- [ ] **Indicador 1:** Prepara Paganini avanzado o Concierto 1 según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 35 — Ernst/Sarasate extremo entrada

**Bloque:** Virtuosismo superior y élite  
**Obra-hito / foco:** Ernst / Sarasate extremo  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Entrar al repertorio extremo con polifonía, armónicos y narrativa.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar dobles cuerdas avanzadas, cromáticas y armónicos como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta dobles cuerdas avanzadas, cromáticas y armónicos de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 148 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar acordes quebrados y polifónicos con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta acordes quebrados y polifónicos con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar acordes, armónicos, octavas/décimas.

- [ ] **Indicador 1:** Demuestra acordes, armónicos, octavas/décimas en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar acordes, bariolage, ricochet y golpes combinados.

- [ ] **Indicador 1:** Ejecuta acordes, bariolage, ricochet y golpes combinados en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar varias voces claras.

- [ ] **Indicador 1:** Produce varias voces claras de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr acordes complejos afinados.

- [ ] **Indicador 1:** Demuestra acordes complejos afinados en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Ernst polifónicos, Paganini, Bach como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Ernst polifónicos, Paganini, Bach.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Ernst/Sarasate extremo fragmentos.

- [ ] **Indicador 1:** Prepara Ernst/Sarasate extremo fragmentos según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 36 — Polifonía extrema

**Bloque:** Virtuosismo superior y élite  
**Obra-hito / foco:** Ernst Last Rose / Bach solo avanzado  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Consolidar independencia de voces, acordes y arquitectura.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar terceras, sextas, octavas y décimas preparatorias como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta terceras, sextas, octavas y décimas preparatorias de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 144 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar acordes quebrados y progresiones polifónicas con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta acordes quebrados y progresiones polifónicas con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar dobles cuerdas avanzadas y acordes 3/4 notas.

- [ ] **Indicador 1:** Demuestra dobles cuerdas avanzadas y acordes 3/4 notas en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar distribución de acordes y legato polifónico.

- [ ] **Indicador 1:** Ejecuta distribución de acordes y legato polifónico en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar voz principal y acompañamiento diferenciados.

- [ ] **Indicador 1:** Produce voz principal y acompañamiento diferenciados de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr afinación vertical exacta.

- [ ] **Indicador 1:** Demuestra afinación vertical exacta en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Ernst, Bach fugas, Paganini como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Ernst, Bach fugas, Paganini.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: Ernst Last Rose o Bach avanzado.

- [ ] **Indicador 1:** Prepara Ernst Last Rose o Bach avanzado según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 37 — Repertorio moderno extremo

**Bloque:** Virtuosismo superior y élite  
**Obra-hito / foco:** Bartók / Prokofiev / Shostakovich selección  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Dominar complejidad rítmica, armónica y sonora moderna.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar modos, cromatismos y escalas simétricas como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta modos, cromatismos y escalas simétricas de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 140 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar acordes extendidos e intervalos aumentados/disminuidos con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta acordes extendidos e intervalos aumentados/disminuidos con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar intervalos incómodos y dobles disonantes.

- [ ] **Indicador 1:** Demuestra intervalos incómodos y dobles disonantes en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar colores modernos y dinámicas extremas.

- [ ] **Indicador 1:** Ejecuta colores modernos y dinámicas extremas en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar timbres múltiples y claridad.

- [ ] **Indicador 1:** Produce timbres múltiples y claridad de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr lenguaje armónico complejo.

- [ ] **Indicador 1:** Demuestra lenguaje armónico complejo en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar estudios modernos, Bartók, Ysaÿe como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de estudios modernos, Bartók, Ysaÿe.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: obra moderna extrema.

- [ ] **Indicador 1:** Prepara obra moderna extrema según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 38 — Concierto élite

**Bloque:** Virtuosismo superior y élite  
**Obra-hito / foco:** Brahms / Sibelius / Tchaikovsky / Bartók completo  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Integrar técnica extrema con gran forma y madurez profesional.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar revisión total según concierto elegido como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta revisión total según concierto elegido de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 148 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar material armónico del concierto elegido con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta material armónico del concierto elegido con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar registro extremo, dobles, octavas y resistencia.

- [ ] **Indicador 1:** Demuestra registro extremo, dobles, octavas y resistencia en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar control total de arco y frase larga.

- [ ] **Indicador 1:** Ejecuta control total de arco y frase larga en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar identidad sonora madura.

- [ ] **Indicador 1:** Produce identidad sonora madura de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr afinación sostenida en gran formato.

- [ ] **Indicador 1:** Demuestra afinación sostenida en gran formato en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar estudios específicos + Paganini/Ysaÿe/Bach como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de estudios específicos + Paganini/Ysaÿe/Bach.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: concierto mayor completo o movimientos.

- [ ] **Indicador 1:** Prepara concierto mayor completo o movimientos según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 39 — Top 10 preparación

**Bloque:** Virtuosismo superior y élite  
**Obra-hito / foco:** Ernst Erlkönig / Paganini 24 avanzado  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Preparar obra top 10 con diagnóstico técnico completo.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar material técnico completo de la obra top 10 como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta material técnico completo de la obra top 10 de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 152 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar arpegios, acordes y patrones derivados con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta arpegios, acordes y patrones derivados con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar octavas, décimas, armónicos, acordes y saltos.

- [ ] **Indicador 1:** Demuestra octavas, décimas, armónicos, acordes y saltos en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar ricochet, bariolage, acordes y combinaciones.

- [ ] **Indicador 1:** Ejecuta ricochet, bariolage, acordes y combinaciones en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar claridad extrema y narrativa.

- [ ] **Indicador 1:** Produce claridad extrema y narrativa de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr recursos límite y polifonía.

- [ ] **Indicador 1:** Demuestra recursos límite y polifonía en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar Ernst, Paganini, Wieniawski, Ysaÿe como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de Ernst, Paganini, Wieniawski, Ysaÿe.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: fragmentos principales top 10.

- [ ] **Indicador 1:** Prepara fragmentos principales top 10 según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

## Nivel 40 — Capstone élite internacional

**Bloque:** Virtuosismo superior y élite  
**Obra-hito / foco:** Obra final top 10: Ernst Erlkönig / Paganini 24 / equivalente  
**Duración sugerida:** 1 semestre flexible  
**Objetivo del nivel:** Certificar dominio integral mediante una obra de élite internacional.  
**Condición de avance:** aprobar los 8 nodos, con Sonido y Afinación obligatoriamente aprobados. El estado `En proceso` permite continuar trabajando, pero no desbloquea el siguiente nivel.

### Nodo 1: Escalas

**Objetivo:** Dominar dominio total de escalas, dobles, cromáticas y armónicos como base técnica del nivel.

- [ ] **Indicador 1:** Ejecuta dominio total de escalas, dobles, cromáticas y armónicos de memoria o con guía según etapa, sin detenerse.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene pulso mínimo aproximado de negra = 156 o tempo equivalente adaptado al patrón.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Conserva sonido parejo, distribución de arco estable y postura funcional durante toda la escala.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 2: Arpegios y patrones

**Objetivo:** Consolidar dominio total de arpegios, acordes y progresiones con control de mano izquierda, arco y pulso.

- [ ] **Indicador 1:** Ejecuta dominio total de arpegios, acordes y progresiones con dirección tonal clara.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Mantiene afinación en notas estructurales: tónica, tercera, quinta y resolución cuando aplique.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Coordina cambios de cuerda y cambios de posición sin interrumpir el pulso.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 3: Mano izquierda

**Objetivo:** Desarrollar dominio total de mano izquierda extrema.

- [ ] **Indicador 1:** Demuestra dominio total de mano izquierda extrema en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Transfiere la habilidad de mano izquierda a un fragmento musical del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Evita tensión excesiva en pulgar, muñeca, dedos y hombro durante la ejecución.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 4: Arco

**Objetivo:** Aplicar dominio total de arco extremo.

- [ ] **Indicador 1:** Ejecuta dominio total de arco extremo en ejercicio técnico controlado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Aplica la articulación del nivel en escala, estudio y fragmento de repertorio.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene punto de contacto, velocidad y peso de arco adecuados al carácter.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 5: Sonido ⭐ Crítico

**Objetivo:** Consolidar sonido profesional, personal y flexible.

- [ ] **Indicador 1:** Produce sonido profesional, personal y flexible de forma consistente.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Diferencia al menos dos colores o dinámicas según el nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** No sacrifica calidad de sonido al aumentar dificultad técnica.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 6: Afinación ⭐ Crítico

**Objetivo:** Lograr afinación profesional en repertorio límite.

- [ ] **Indicador 1:** Demuestra afinación profesional en repertorio límite en escala y ejercicio técnico.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Detecta y corrige desviaciones de afinación con intervención mínima del maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Mantiene afinación aceptable en contexto de repertorio, no solo en ejercicios aislados.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 7: Estudios técnicos

**Objetivo:** Trabajar plan de mantenimiento: Paganini, Ernst, Ysaÿe, Bach como puente entre técnica y repertorio.

- [ ] **Indicador 1:** Trabaja al menos un estudio o ejercicio de plan de mantenimiento: Paganini, Ernst, Ysaÿe, Bach.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Presenta el estudio con ritmo, articulación y objetivo técnico reconocible.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Explica qué problema técnico del repertorio resuelve el estudio asignado.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Nodo 8: Repertorio / Obra-hito

**Objetivo:** Integrar el repertorio/hito del nivel: obra capstone top 10 completa.

- [ ] **Indicador 1:** Prepara obra capstone top 10 completa según el alcance definido por el maestro.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 2:** Conecta el repertorio con escalas, arpegios, arco, sonido y afinación del nivel.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  
- [ ] **Indicador 3:** Presenta un fragmento o ejecución integradora con continuidad y criterio musical.  
  - Estados permitidos: Pendiente / En proceso / Aprobado / Reprobado.  

### Boss / Evaluación integradora del nivel

- Ejecutar una escala o patrón técnico del nivel seleccionado por el maestro.
- Ejecutar un estudio o ejercicio vinculado al problema técnico principal.
- Presentar un fragmento o sección de la obra-hito/foco del nivel.
- Registrar observación del maestro y decisión final: `Aprobado`, `En proceso` o `Reprobado`.

---

# 6. Flujo operativo en la PWA del maestro

```txt
1. El maestro selecciona la clase del día.
2. Registra asistencia.
3. La app carga la planificación activa del alumno o grupo.
4. El maestro selecciona los nodos que trabajará en la clase.
5. La planificación genera un evento académico del día.
6. El maestro evalúa indicadores: Pendiente, En proceso, Aprobado o Reprobado.
7. El maestro registra observaciones y tarea.
8. El sistema actualiza progreso del alumno.
9. Si todos los nodos requeridos están aprobados, se habilita el Boss del nivel.
10. Si el Boss es aprobado por el maestro, se desbloquea el siguiente nivel.
```

# 7. Reglas de avance

1. No se avanza por asistencia ni por tiempo, sino por dominio.
2. `En proceso` registra progreso, pero no desbloquea niveles.
3. Sonido y Afinación son críticos en todos los niveles.
4. Si un nodo se reprueba, se repite el nodo, no todo el nivel.
5. El maestro puede adaptar repertorio equivalente, pero debe conservar el objetivo técnico del nivel.
6. El área académica debe ver nivel, nodos, indicadores, asistencia, observaciones, tareas y estado.
7. La IA puede sugerir, completar o revisar, pero no aprobar al alumno.

# 8. Implementación inicial recomendada

Cargar primero los niveles 1–10 en Supabase y validar el flujo real de clase: asistencia → evento académico → nodos trabajados → evaluación → observación → tarea → actualización del progreso. Luego expandir a niveles 11–20 y activar IA.

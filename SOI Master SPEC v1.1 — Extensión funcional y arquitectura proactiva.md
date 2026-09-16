# SOI MASTER SPEC v1.1
## Extensión funcional, inteligencia institucional y operación proactiva

**Estado:** actualización del Master SPEC v1.0  
**Objetivo:** incorporar formalmente Inteligencia Institucional, CRM de Relaciones, Comunicaciones Omnicanal, operación académica avanzada, pedagogía estructurada, repertorio visual, postulaciones, lutería-finanzas, portal público, auditoría y mecanismos proactivos.

---

# 1. NUEVA DEFINICIÓN DEL SOI

El SOI debe evolucionar desde:

> Sistema que registra y coordina operaciones institucionales.

hacia:

> **Sistema Operativo Institucional activo, reactivo y proactivo, capaz de observar tanto el interior como el exterior de la institución, detectar situaciones relevantes, convertirlas en oportunidades, alertas, casos, relaciones, tareas y decisiones, y acompañar su seguimiento hasta obtener un resultado.**

Modelo:

```text
                 MUNDO EXTERIOR
                      │
       convocatorias · empresas
       fundaciones · instituciones
       festivales · alianzas
       oportunidades · contactos
                      │
                      ▼
             RADAR INSTITUCIONAL
                      │
                      ▼
┌────────────────────────────────────────────┐
│                    SOI                     │
│                                            │
│ Personas · Academia · Finanzas · Activos   │
│ Comunicaciones · Relaciones · Eventos      │
│ Casos · Tareas · Repertorio · Reportes     │
└───────────────────┬────────────────────────┘
                    │
                    ▼
                 HERMES
                    │
        detectar · relacionar · recomendar
        investigar · preparar · seguir
                    │
                    ▼
              ACCIÓN HUMANA
```

---

# 2. TRES MODOS OPERATIVOS

## 2.1 Reactivo

SOI responde cuando ocurre algo.

```text
Alumno faltó
→ registrar ausencia
→ actualizar métricas
```

## 2.2 Activo

SOI interpreta el estado y provoca una acción.

```text
Alumno alcanzó 3 ausencias
→ abrir seguimiento
→ preparar comunicación
→ notificar coordinación
```

## 2.3 Proactivo

SOI busca información que todavía no existe dentro de la institución.

```text
Hermes detecta una convocatoria internacional
        ↓
analiza elegibilidad
        ↓
relaciona convocatoria con FUNEYCA
        ↓
identifica fecha límite
        ↓
crea oportunidad
        ↓
propone responsable
        ↓
genera tareas
        ↓
hace seguimiento
```

Este tercer nivel pasa a ser una característica fundamental del producto.

---

# 3. MAPA DEFINITIVO DE PORTALES

```text
SOI
│
├── Dirección
│
├── Administrativo
│
├── Académico
│
├── Maestros
│
├── Finanzas Familiares
│
├── Lutería
│
├── Inventario / Tiendita
│
├── Comunicaciones y Relaciones
│
├── Inteligencia Institucional
│
├── Eventos y Agenda
│
├── Postulaciones e Inscripciones
│
├── Reportes
│
├── Portal Público / Pantallas
│
└── Hermes
```

Hermes es transversal a todos ellos.

---

# 4. PORTAL DE INTELIGENCIA INSTITUCIONAL

Nuevo bounded context:

```text
Institutional Intelligence
```

Este módulo funcionará como un **radar de oportunidades externas**.

Debe investigar de manera programada:

```text
fundaciones
ONG
empresas
embajadas
institutos culturales
organizaciones musicales
universidades
festivales
programas juveniles
programas de cooperación
fabricantes de instrumentos
convocatorias
becas
concursos
grants
patrocinios
RSE / ESG
programas educativos
```

---

# 5. RADAR DE OPORTUNIDADES

Flujo:

```text
BÚSQUEDA WEB
    ↓
DESCUBRIMIENTO
    ↓
EXTRACCIÓN
    ↓
CLASIFICACIÓN
    ↓
DEDUPLICACIÓN
    ↓
MATCH CON FUNEYCA
    ↓
SCORING
    ↓
OPORTUNIDAD
    ↓
SEGUIMIENTO
```

Ejemplo:

```text
D'Addario Foundation

Tipo:
Donación / Music Education

Compatibilidad SOI:
94 %

Por qué:
✓ educación musical
✓ programas juveniles
✓ instrumentos/accesorios
✓ nonprofit

Relación:
Ya existe contacto

Última interacción:
06 Sep 2026

Próxima acción:
Enviar listado definitivo

Responsable:
Omar

Estado:
Seguimiento
```

---

# 6. MODELO DE DATOS DE INTELIGENCIA

```sql
external_organizations
----------------------
id
name
organization_type
country
website
mission
description
focus_areas jsonb
social_links jsonb
relationship_status
created_at
updated_at
```

```sql
opportunities
-------------
id
external_organization_id
type
title
description
source_url
eligibility
benefits
deadline
estimated_value
currency
fit_score
status
owner_id
next_action_at
created_at
```

Tipos:

```text
grant
sponsorship
partnership
donation
festival
scholarship
training
instrument_donation
exchange
competition
technical_cooperation
```

---

# 7. WATCHLIST

Una organización podrá añadirse a:

```text
⭐ Seguimiento
```

SOI podrá revisar periódicamente:

```text
cambios en convocatoria
nuevos programas
nuevas fechas
nuevos grants
anuncios
actividades
oportunidades
```

Ejemplo:

```text
Goethe-Institut
----------------
Seguimiento activo

Nueva convocatoria detectada
8 Sep 2026

Posible aplicación:
Cooperación Cultural Internacional

Compatibilidad: 88%
```

---

# 8. SCORING DE OPORTUNIDADES

Nunca exclusivamente AI.

Combinar reglas + IA.

```text
Mission fit           20%
Program fit           20%
Geography             10%
Eligibility           15%
Funding potential     10%
Existing relationship 10%
Deadline feasibility  10%
Strategic value        5%
```

Resultado:

```text
Opportunity Fit: 87/100
```

Hermes explica el resultado.

---

# 9. CRM INSTITUCIONAL

Comunicaciones se convierte también en un verdadero:

> **Institutional Relationship Management System**

No solamente mensajes.

Debe saber:

```text
con quién hablamos
quién conoce a quién
qué hablamos
qué prometieron
qué prometimos
qué propuesta enviamos
qué documentos intercambiamos
qué acuerdo existe
cuándo debemos volver a contactar
qué oportunidades surgieron
```

---

# 10. CONTACTOS

```sql
contacts
--------
id
person_id
external_organization_id
job_title
department
phone
email
whatsapp
instagram
linkedin
relationship_strength
relationship_owner
notes
```

Ejemplo:

```text
Kalani
│
├── D'Addario Foundation
├── Email
├── WhatsApp
├── Última conversación
├── Propuestas relacionadas
├── Tareas abiertas
└── Historial completo
```

---

# 11. RELACIONES ENTRE PERSONAS

Debe poder almacenarse:

```text
Omar conoce a X
Romina conoce a Y
Y presentó a Z
Z pertenece a empresa A
Empresa A financia programa B
```

Modelo futuro de grafo:

```text
Person
 ─knows→ Person

Person
 ─works_at→ Organization

Organization
 ─supports→ Program

Contact
 ─introduced_by→ Contact
```

Esto crea un **grafo institucional de relaciones**.

---

# 12. HILOS Y CONVERSACIONES

```sql
conversation_threads
--------------------
id
subject
external_organization_id
contact_id
opportunity_id
status
owner_id
last_activity_at
```

Dentro:

```text
Emails
WhatsApp
Notas
Reuniones
Llamadas
Propuestas
Documentos
Acuerdos
Tareas
```

Vista:

```text
D'ADDARIO FOUNDATION
────────────────────────

5 Sep
Email recibido

6 Sep
Discusión interna

7 Sep
Lista preliminar

10 Sep
Pendiente aprobación

NEXT ACTION
Enviar solicitud definitiva
```

---

# 13. PROPUESTAS

```sql
proposals
---------
id
organization_id
opportunity_id
title
version
status
estimated_value
submitted_at
response_due_at
owner_id
document_url
```

Estados:

```text
idea
draft
internal_review
ready
submitted
follow_up
accepted
rejected
archived
```

---

# 14. ACUERDOS

```sql
agreements
----------
id
external_organization_id
title
type
start_date
end_date
status
responsible_user
commitments_us jsonb
commitments_them jsonb
documents jsonb
```

SOI debe recordar:

```text
qué debemos entregar
qué deben entregar ellos
cuándo
quién responde
```

---

# 15. FOLLOW-UP ENGINE

Ejemplo:

```text
Propuesta enviada
      ↓
7 días sin respuesta
      ↓
Hermes:
"Conviene hacer seguimiento."
      ↓
prepara correo
      ↓
usuario aprueba
```

La IA puede recomendar y preparar.

No debe acosar contactos automáticamente.

---

# 16. PORTAL COMUNICACIONES

Ahora tendrá cinco grandes áreas:

```text
Conversaciones
Contactos
Campañas
Relaciones
Solicitudes internas
```

---

# 17. WHATSAPP INSTITUCIONAL

Arquitectura:

```text
SOI
 ↓
Communication Service
 ↓
Approved Provider/API
 ↓
WhatsApp
```

Debe soportar:

```text
mensajes individuales
plantillas
recordatorios
segmentación
campañas
seguimientos
respuestas
historial
```

Con:

```text
consentimiento
opt-out
rate limits
auditoría
permisos
plantillas aprobadas cuando corresponda
```

---

# 18. COMUNICACIONES MASIVAS

Campaign Composer:

```text
Crear campaña
      ↓
Seleccionar audiencia
      ↓
Crear contenido
      ↓
Seleccionar canales
      ↓
Preview
      ↓
Aprobación
      ↓
Programar
      ↓
Enviar/publicar
      ↓
Resultados
```

Canales:

```text
WhatsApp
Instagram
Facebook
Email
Portal público
Pantallas institucionales
```

---

# 19. GENERADOR DE FLYERS

Nuevo servicio:

```text
Creative Studio
```

Flujo:

```text
EVENTO SOI
     ↓
datos oficiales
     ↓
Hermes
     ↓
Creative Brief
     ↓
Prompt profesional
     ↓
modelo generativo de imagen
     ↓
Flyer
     ↓
revisión humana
     ↓
publicación
```

El prompt debe incluir automáticamente:

```text
nombre del evento
fecha
hora
lugar
branding
logos
programa
tipo de público
proporción de imagen
canal de publicación
```

Generar variantes:

```text
Instagram Post
Story
Facebook
WhatsApp
Pantalla 16:9
Impresión
```

---

# 20. AGENDA INSTITUCIONAL INTELIGENTE

Eventos externos e internos:

```text
conciertos
reuniones
actividades
representación institucional
visitas
ensayos
festivales
fechas límite
propuestas
reuniones con patrocinadores
```

Hermes puede detectar:

```text
conflictos
viajes
preparación insuficiente
documentos pendientes
representantes requeridos
```

---

# 21. COMUNICACIÓN INTERDEPARTAMENTAL

Este mecanismo pasa a ser **Core del SOI**.

Ejemplo:

```text
ACADÉMICO
Necesito solvencia financiera de Juan
             ↓
         SOI REQUEST
             ↓
FINANZAS 🔴 1
             ↓
Responde
             ↓
ACADÉMICO recibe resultado
```

Tabla:

```sql
department_requests
-------------------
id
requesting_department
target_department
request_type
resource_type
resource_id
description
priority
status
assigned_to
due_at
correlation_id
created_at
resolved_at
```

Estados:

```text
requested
seen
in_progress
waiting
resolved
cancelled
```

Todo queda auditado.

---

# 22. PORTAL FINANZAS: NUEVO LÍMITE

Finanzas SOI **NO será contabilidad empresarial**.

Fuera de alcance:

```text
nómina
impuestos
contabilidad general
balances contables
estados financieros fiscales
seguridad social
```

Su propósito será:

> **gestionar la relación económica entre las familias y la institución.**

Incluye:

```text
mensualidades
inscripciones
uniformes
accesorios
materiales
reparaciones
otros cargos al representante
becas
descuentos
pagos
saldos
recordatorios
```

---

# 23. CUENTA DE FAMILIA

```text
Familia Suniaga
────────────────────

Mensualidad        RD$600
Cuerdas            RD$900
Reparación         RD$450

Total            RD$1,950

Pagado           RD$1,500

Pendiente          RD$450
```

---

# 24. COMPORTAMIENTO DE PAGO

No utilizaría el término técnico “salud del padre”.

Nombre recomendado:

> **Perfil de Comportamiento de Pago**

El sistema aprende:

```text
día promedio de pago
desviación promedio
pagos puntuales
pagos tardíos
deuda histórica
recordatorios necesarios
tendencia
```

Ejemplo:

```text
Familia Pérez

Comportamiento:
Generalmente paga entre 25–30

Puntualidad:
82%

Retraso promedio:
3.2 días

Tendencia:
Estable
```

Nunca debe convertirse en una puntuación secreta utilizada automáticamente para expulsiones o decisiones discriminatorias.

---

# 25. RECORDATORIOS ADAPTATIVOS

En lugar de:

```text
día 1 → mensaje para todos
```

SOI aprende la ventana habitual.

Ejemplo:

```text
Padre normalmente paga:
26–29

SOI evita molestarlo:
día 5
día 10
día 15

Recordatorio:
día 26
```

---

# 26. ESCALAMIENTO DE COBRANZA

Configuración:

```text
cada 3 días
```

Nivel 1:

```text
Recordatorio cordial
```

Nivel 2:

```text
Recordatorio institucional
```

Nivel 3:

```text
Aviso formal de saldo pendiente
```

Nivel 4:

```text
Solicitud de comunicación con Administración
```

Los textos serán parametrizables.

---

# 27. DETECCIÓN DE DUPLICADOS

Core Data Quality.

Detectar combinaciones:

```text
nombre
apellido
teléfono
representante
nacimiento
email
dirección
```

Resultado:

```text
POSIBLE DUPLICADO 94%

Ana Pérez
Ana M. Pérez

[Comparar]
```

Nunca fusionar automáticamente.

---

# 28. ALUMNOS SIN CLASE

Regla:

```text
active_student
AND
no_active_class_assignment
```

Debe aparecer en:

```text
Administrativo
Académico
Dirección
Hermes
```

---

# 29. AUSENTISMO

Configuración institucional:

```text
3 ausencias consecutivas

o

3 ausencias injustificadas / mes

o

25% ausencias en periodo
```

Cada programa puede tener reglas diferentes.

---

# 30. MAESTROS SIN ASISTENCIA REGISTRADA

Regla configurable:

```text
sesión terminó
AND
attendance_status != completed
AND
elapsed_time > configured_threshold
```

Ejemplo:

```text
sábado 18:00

4 maestros pendientes
```

SOI genera:

```text
push
badge
recordatorio
```

---

# 31. PORTAL MAESTROS

El Portal Maestros deja de ser solamente una interfaz de asistencia.

Home:

```text
HOY

14:00 Violín N1
16:00 Violín N2

⚠ Asistencia pendiente: sábado

🎯 Planificación
Unidad 2 · Objetivo 3

🎼 Repertorio
Beethoven 5
Trabajar compases 24–40

📩 Solicitudes
1 pendiente
```

---

# 32. BIOGRAFÍA DEL MAESTRO

Puede mantener:

```text
foto
biografía
instrumentos
especialidad
formación
experiencia
programas
```

Campos institucionales sensibles permanecen separados.

---

# 33. SOLICITUDES DEL MAESTRO

Tipos:

```text
permiso
ausencia
materiales
accesorios
cambio horario
salón
instrumentos
soporte
```

Destino:

```text
Académico
Administración
Lutería
Inventario
```

según categoría.

---

# 34. PLANIFICACIÓN PEDAGÓGICA

Jerarquía definitiva:

```text
PLAN
  │
  ├── Unidad 1
  │     ├── Objetivo 1
  │     │      ├── Indicador 1
  │     │      ├── Indicador 2
  │     │      └── Indicador 3
  │     └── Objetivo 2
  │
  ├── Unidad 2
  ├── Unidad 3
  ├── Unidad 4
  ├── Unidad 5
  └── Unidad 6
```

Por defecto seis unidades, pero configurable.

---

# 35. MODELO PEDAGÓGICO

```sql
learning_plans
learning_units
learning_objectives
learning_indicators
indicator_dependencies
student_indicator_progress
class_indicator_progress
```

---

# 36. INDICADORES

Cada indicador tiene:

```text
nombre
descripción
criterio
orden
tipo
peso
prerrequisitos
```

Estado:

```text
locked
pending
introduced
developing
achieved
```

---

# 37. PRERREQUISITOS

Ejemplo:

```text
Indicador A
    ↓
Indicador B
    ↓
Indicador C
```

Si C depende de B:

```text
B no alcanzado
→ C bloqueado
```

Pero indicadores independientes pueden avanzar aunque existan deudas anteriores.

---

# 38. DEUDA PEDAGÓGICA

Cuando un alumno:

```text
faltó
no estudió
no logró el indicador
```

puede quedar:

```text
Indicador pendiente
```

El maestro verá:

```text
Ana
████████░░ 80%

Pendientes:
• afinación escala Re
• lectura ejercicio 14
```

---

# 39. RUTA DEL ALUMNO

Estilo Duolingo:

```text
Unidad 1 ✅
    │
Unidad 2 ✅
    │
Unidad 3
 ├─ Obj 1 ✅
 ├─ Obj 2
 │   ├─ I1 ✅
 │   ├─ I2 🟡
 │   └─ I3 🔒
```

---

# 40. EVALUACIÓN DE CADA CLASE

La planificación define lo esperado.

La sesión registra:

```text
qué indicadores se trabajaron
qué alumnos estuvieron
qué resultado logró cada alumno
observaciones
contenido adicional
```

Esto evita tener dos mundos separados:

```text
planificación
vs
lo que ocurrió
```

---

# 41. MÉTRICAS MUSICALES

Cada alumno podrá mostrar tendencias en:

```text
Afinación
Pulso interno
Técnica
Sonido
Agilidad
Lectura
Ritmo
Musicalidad
Repertorio
```

Cada dimensión puede alimentarse de múltiples indicadores.

---

# 42. PERFIL MUSICAL 360

```text
ANA PÉREZ
Violín N2

Afinación        78%
Pulso            84%
Técnica          69%
Agilidad         73%
Lectura          81%

Escalas
Do ✅
Sol ✅
Re 🟡
La 🟡

Métodos
Wohlfahrt 1–20
Suzuki Vol. 2

Repertorio
Rieding — progreso 72%
```

---

# 43. IMPORTADOR DE PLANIFICACIONES

Pipeline:

```text
PDF / DOCX / FOTO / SCAN
          ↓
Vision / Parser
          ↓
AI extraction
          ↓
Unidades
          ↓
Objetivos
          ↓
Indicadores
          ↓
Dependencias sugeridas
          ↓
PREVIEW
          ↓
MAESTRO/COORDINADOR APRUEBA
          ↓
DATABASE
```

Nunca guardar directamente una interpretación de IA sin preview.

---

# 44. CLASES

Entidad conceptual:

```text
Class
```

define:

```text
programa
nivel
maestro
alumnos
horario
salón
planificación
```

Pero cada encuentro real es:

```text
ClassSession
```

---

# 45. CLASE EMERGENTE

```text
session_type:

scheduled
emergency
makeup
extra
rehearsal
masterclass
```

Una clase emergente no modifica necesariamente el horario permanente.

---

# 46. EL MAESTRO NO CREA CLASES POR DEFECTO

Permiso base:

```text
teacher:
  class.create = false
```

Académico puede conceder:

```text
teacher:
  class.edit_students
  class.create_extra_session
  class.adjust_schedule
```

por:

```text
persona
clase
periodo
programa
```

---

# 47. DEPURACIÓN DE CLASES

Académico podrá detectar:

```text
alumnos que ya no asisten
alumnos sin clase
clases vacías
duplicados
maestros sin alumnos
horarios inválidos
```

---

# 48. POSTULACIONES

Nuevo funnel:

```text
INTERESADO
   ↓
LEAD
   ↓
PRE-REGISTRO
   ↓
INFORMACIÓN
   ↓
CITA
   ↓
EVALUACIÓN
   ↓
INSCRIPCIÓN
   ↓
ALUMNO
```

---

# 49. BOT DE POSTULACIONES

WhatsApp:

```text
Hola 👋

Gracias por tu interés en
El Sistema Punta Cana.

Puedo ayudarte con:

1. Programas disponibles
2. Edades
3. Requisitos
4. Fechas de inscripción
5. Ubicación
6. Solicitar una cita
```

El bot responde únicamente información institucional aprobada.

---

# 50. INTERESADO

```sql
prospects
---------
id
first_name
last_name
birth_date
guardian_name
phone
email
instrument_interest
program_interest
status
source
created_at
```

---

# 51. CITA DE INSCRIPCIÓN

SOI puede:

```text
detectar apertura próxima
→ invitar
→ ofrecer horarios
→ reservar cita
→ enviar requisitos
→ recordatorio T-1 día
```

La cita aparece en Administrativo.

---

# 52. INSCRIPCIÓN

El formulario puede recopilar un perfil completo:

```text
identificación
familia
escolaridad
contacto
experiencia musical
aspiraciones
gustos
disponibilidad
transporte
condiciones socioeconómicas
información médica relevante
emergencias
autorizaciones
```

La información médica/social/económica debe tener:

```text
consentimiento explícito
acceso restringido
minimización
retención definida
auditoría
```

No debe utilizarse indiscriminadamente en algoritmos disciplinarios o financieros.

---

# 53. PORTAL ACADÉMICO — COMMAND CENTER

Debe responder:

```text
¿Qué ocurre hoy?
```

Ejemplo:

```text
JUEVES

14 clases
11 maestros
143 alumnos previstos

2 maestros ausentes
5 alumnos justificados

⚠ 3 clases requieren atención
```

---

# 54. JUSTIFICACIONES

```sql
attendance_excuses
------------------
student_id
start_date
end_date
reason
submitted_by
approved_by
status
```

Al abrir la asistencia:

```text
Ana Pérez       JUSTIFICADA
Carlos Gómez    PRESENTE
Luis Díaz       —
```

---

# 55. SEGUIMIENTO DEL ALUMNO

Botón:

```text
[Activar seguimiento]
```

genera un `student_case`.

Entonces SOI solicita automáticamente la información necesaria a diferentes dominios.

---

# 56. ESTADO 360

Los cuatro ejes propuestos deben expresarse cuidadosamente como:

```text
1. Situación financiera familiar
2. Asistencia
3. Progreso pedagógico
4. Responsabilidad patrimonial
```

El cuarto mide especialmente obligaciones relacionadas con instrumentos institucionales cuando existan.

No penaliza a quien posea instrumento propio.

---

# 57. COMMITMENT REVIEW

Ejemplo:

```text
ANA

Finanzas       ⚠
Asistencia     🔴
Progreso       🔴
Patrimonio     ✅
```

Si existen múltiples señales críticas:

```text
SOI recomienda:
Revisión de compromiso
```

No:

```text
SOI expulsa automáticamente.
```

---

# 58. DECISIONES SENSIBLES

Acciones como:

```text
retirar alumno
retirar beca
retener instrumento
suspender
```

requieren siempre:

```text
revisión humana
justificación
registro
responsable
auditoría
```

---

# 59. ESCALAMIENTO DE AUSENCIAS

Configurable.

Ejemplo:

### Falta 1

Tono amable.

```text
Notamos que Ana no pudo asistir hoy.

Recuerde notificarnos previamente cuando
no pueda participar. La constancia es una
parte fundamental de su progreso musical.
```

### Falta 2

Tono institucional.

```text
Ana registra dos ausencias injustificadas
durante el periodo actual.

La continuidad de las clases es esencial
para mantener su proceso pedagógico y el
trabajo colectivo.
```

### Falta 3

Caso formal.

```text
Se abre revisión de compromiso.

Requiere:
representante
alumno
coordinación
```

Las medidas sobre instrumentos o permanencia serán configurables y necesitarán aprobación humana.

---

# 60. PLANIFICACIÓN DE MAESTROS

Académico verá:

```text
Maestro          Asistencia   Planificación
──────────────────────────────────────────
Camilo              ✅             ✅
Pedro               ⚠              ✅
Ana                  ✅             🔴
```

Puede enviar:

```text
push
mensaje
tarea
```

---

# 61. HORARIOS Y CONFLICTOS

Conflict Engine:

```text
RoomConflict
TeacherConflict
StudentConflict
InstrumentConflict
```

Ejemplo:

```text
Salón 3

Violín N2   15:00–16:00
Coro        15:30–17:00

CONFLICTO
```

---

# 62. ALUMNO EN DOS PROGRAMAS

No todo solapamiento debe considerarse error.

Puede existir:

```text
SPLIT ATTENDANCE AGREEMENT
```

Ejemplo:

```text
15:00–15:30 Violín
15:30–16:30 Coro
```

---

# 63. ACUERDO ENTRE MAESTROS

```sql
schedule_agreements
-------------------
student_id
class_a_id
class_b_id
effective_from
effective_to
agreement jsonb
approved_by
```

El sistema entiende entonces que el conflicto está resuelto.

---

# 64. MÓDULO REPERTORIO

Dentro de Académico:

```text
Programa
   ↓
Temporada
   ↓
Repertorio
   ↓
Obra
```

Ejemplo:

```text
Orquesta Sinfónica

Temporada Navidad

Beethoven
Sinfonía No. 5

Inicio:
10 Sep

Estreno objetivo:
15 Dec

Semanas:
14
```

---

# 65. MAPA DE CALOR DEL REPERTORIO

Cada compás posee estado.

```text
🟥 Sin leer
🟧 Leído
🟨 En proceso
🟩 Con dificultad superable / avanzado
🟦 Listo
⬜ Silencio
```

Conviene definir seis estados semánticos y después asociar los colores exactamente en el Design System.

No depender únicamente del color.

---

# 66. MEASURE MODEL

```sql
work_measures
-------------
id
work_id
measure_number
rehearsal_mark
row_number
position_in_row
```

Ejemplo:

```text
        A
1  2  3  4  5  6  7  8
9 10 11 12 13 14 15 16
                      B
```

---

# 67. FILAS CONFIGURABLES

```text
measures_per_row = 8
```

o:

```text
4
6
10
```

según la partichela.

---

# 68. ESTADO POR COMPÁS

```sql
measure_progress
----------------
work_id
measure_id
subject_type
subject_id
status
evaluated_by
evaluated_at
```

`subject_type`:

```text
student
class
instrument
section
family
ensemble
```

---

# 69. CAPAS

Coordinador puede seleccionar:

```text
Alumno
Clase
Instrumento
Fila
Familia
Orquesta completa
```

Ejemplo:

```text
BEETHOVEN 5

[Cuerdas]
██████████████

[Maderas]
██████░░░░░░░░

[Metales]
██████████░░░░

[Percusión]
████░░░░░░░░░░
```

---

# 70. PROMEDIO DE COMPASES

El score general no contará instrumentos que estén en silencio.

Ejemplo:

```text
Compás 12

Violines     Listo
Violas       Listo
Cellos       Listo
Trompetas    En proceso
Trombones    Listo
Flautas      Leído
Percusión    Silencio
```

El promedio considera solamente partes activas.

---

# 71. SILENCIOS

Modo:

```text
[Marcar silencios]
```

Selección múltiple.

Resultado:

```text
⬜ 12
⬜ 13
⬜ 14
```

---

# 72. UX DEL MAPA DE CALOR

Modo rápido:

```text
tap:
Sin leer
→ Leído
→ En proceso
→ ...
→ Listo
```

Modo selección:

```text
Mantener presionado
      ↓
Selection Mode
      ↓
arrastrar / seleccionar
      ↓
[Asignar estado]
      ↓
Listo
```

Debe funcionar especialmente bien en tablet.

---

# 73. INFO

Botón:

```text
ⓘ Cómo usar el mapa
```

explica:

```text
colores
estados
selección
silencios
capas
estadísticas
```

---

# 74. REPERTORIO INDIVIDUAL

El maestro podrá evaluar:

```text
Orquesta
  ↓
Violín N1
  ↓
Ana
```

y ver exactamente qué compases domina Ana.

---

# 75. REPERTORIO PROACTIVO

Hermes analiza:

```text
fecha del concierto
avance
secciones débiles
ensayos restantes
```

Ejemplo:

```text
Beethoven 5

Progreso global: 64%
Tiempo restante: 4 semanas

Riesgo:
Maderas compases 81–112

Recomendación:
Trabajar pasaje durante
las próximas dos clases.
```

El maestro recibe:

```text
🔴 PRIORIDAD DE REPERTORIO
Compases 81–112
```

---

# 76. LUTERÍA INTERDEPARTAMENTAL

Workflow:

```text
Instrumento dañado
      ↓
LUTERÍA
diagnóstico
      ↓
presupuesto
      ↓
ADMINISTRACIÓN
contacta representante
      ↓
esperando aprobación
      ↓
representante OK
      ↓
LUTERÍA
reparación
      ↓
FINANZAS
cargo
      ↓
cuenta familiar
```

Todo comparte:

```text
correlation_id
```

---

# 77. PRESUPUESTO DE REPARACIÓN

```sql
repair_quotes
-------------
repair_order_id
amount
currency
description
valid_until
status
guardian_approval_at
```

Estados:

```text
draft
sent
waiting_approval
approved
rejected
expired
```

---

# 78. CARGO FINANCIERO

Al aprobar:

```text
RepairApproved
      ↓
Finance
      ↓
ChargeCreated
```

Concepto:

```text
Reparación instrumento VLN-0047
RD$...
```

---

# 79. TIENDITA / PROCUREMENT CATALOG

Vista compartida por:

```text
Finanzas
Lutería
Inventario
```

No es comercio electrónico propio.

Es un:

> **Catálogo institucional de reposición y compras.**

---

# 80. PRODUCT CARD

```text
┌────────────────────────┐
│      [imagen]          │
│                        │
│ D'Addario Prelude      │
│ Viola Strings          │
│                        │
│ RD$ / USD ...          │
│                        │
│ Amazon / Thomann/...   │
│                        │
│ [Ver tienda]           │
│ [Solicitar compra]     │
└────────────────────────┘
```

---

# 81. URL PRODUCT IMPORT

Usuario pega:

```text
https://...
```

Extractor intenta obtener:

```text
OpenGraph image
nombre
marca
precio
moneda
descripción
especificaciones
vendor
URL
```

La extracción debe respetar las condiciones del proveedor y utilizar metadata pública/API cuando exista, evitando mecanismos de scraping prohibidos.

---

# 82. PROCUREMENT REQUEST

```sql
purchase_requests
-----------------
id
product_id
quantity
department
reason
priority
requested_by
status
approved_by
created_at
```

---

# 83. STOCK

Al comprar:

```text
Purchase
 ↓
InventoryReceipt
 ↓
Stock +
```

Al vender accesorio:

```text
Family purchase
 ↓
Stock -
 ↓
Family charge
```

---

# 84. DESERCIÓN

Académico debe registrar salida mediante:

```sql
student_exits
-------------
student_id
exit_date
exit_type
primary_reason
secondary_reasons
notes
recorded_by
```

---

# 85. MOTIVOS

Configurable:

```text
transporte
económico
horario escolar
mudanza
pérdida de interés
experiencia académica
salud
cambio de institución
conflicto de horario
otro
```

---

# 86. RETENCIÓN

Dashboard:

```text
Ingresaron       180
Activos          163
Retirados         10
Desertaron         7

Retención:
90.5%
```

---

# 87. ANÁLISIS DE CAUSAS

Hermes puede responder:

```text
La principal causa de salida
durante el semestre fue transporte.

Representa:
31% de las salidas.
```

Esto puede orientar decisiones institucionales.

---

# 88. PORTAL PÚBLICO

Ruta posible:

```text
/public
```

o dominio independiente.

Completamente read-only.

Nunca muestra:

```text
datos personales
pagos
asistencia individual
teléfonos
información interna
```

---

# 89. DIGITAL SIGNAGE

Pantallas:

```text
Smart TV
Raspberry Pi
PC
Tablet
Navegador
```

Abren un URL.

---

# 90. ESTRUCTURA VISUAL

Sidebar:

```text
HOY
Jueves 10

14:00 Violín N1
15:00 Coro
16:00 Viola
```

Contenido:

```text
Slide 1
Concierto

Slide 2
Reunión de padres

Slide 3
Información institucional

Slide 4
Horario de mañana
```

Loop automático.

---

# 91. SCREEN PLAYLISTS

```sql
public_playlists
public_slides
public_screen_assignments
```

Permite que:

```text
Recepción
Salón Principal
Segundo Núcleo
```

usen contenido diferente.

---

# 92. PUBLICACIÓN

Un usuario autorizado puede convertir:

```text
Evento
→ anuncio público
→ flyer
→ pantalla
→ redes
```

sin volver a introducir la información.

---

# 93. BACKUP

Debe existir una estrategia formal.

Capas:

```text
1. Database backups
2. Storage backups
3. Migration history
4. Configuration backup
5. Document backup
6. Disaster recovery
```

---

# 94. EXPORTACIONES

Permitir según permisos:

```text
CSV
XLSX
JSON
SQL
Markdown
PDF
```

SQL completo únicamente para administradores con privilegios apropiados.

---

# 95. PORTABLE INSTITUTIONAL BACKUP

Idealmente:

```text
SOI Backup Package
│
├── database.sql
├── exports/
│   ├── students.csv
│   ├── attendance.csv
│   └── ...
├── files/
├── schema/
├── configuration/
└── manifest.json
```

---

# 96. AUDITORÍA

Dos sistemas separados.

## Business Audit Log

Registra:

```text
quién
qué hizo
sobre qué
antes
después
cuándo
por qué
```

Debe ser prácticamente inmutable.

## Technical Observability

Registra:

```text
API calls
database timing
external services
AI tools
errors
traces
performance
```

Esto evita convertir cada SELECT interno en millones de registros de auditoría empresarial.

---

# 97. AI AUDIT

Cada operación Hermes:

```sql
ai_runs
-------
id
model
purpose
actor
input_reference
output_reference
tools_used
tokens
latency
result
correlation_id
created_at
```

Y:

```sql
ai_tool_calls
-------------
ai_run_id
tool
arguments_hash
authorization_result
result
duration
```

---

# 98. HERMES — NUEVA DEFINICIÓN

Hermes tendrá cuatro capacidades.

```text
OBSERVE
REASON
RESEARCH
ACT
```

---

# 99. OBSERVE

Observa:

```text
SOI Events
deadlines
metrics
cases
payments
attendance
planning
inventory
repertoire
relationships
```

---

# 100. RESEARCH

Observa el mundo exterior:

```text
web
convocatorias
organizaciones
fundaciones
empresas
festivales
programas
```

---

# 101. REASON

Relaciona:

```text
información externa
+
estado institucional
+
histórico
+
objetivos
```

Ejemplo:

```text
Empresa X
financia educación juvenil.

FUN\-EYCA necesita instrumentos.

Empresa X opera en República Dominicana.

No existe contacto actual.

↓

OPORTUNIDAD ALTA
```

---

# 102. ACT

Según nivel de riesgo:

```text
crear oportunidad
crear tarea
preparar propuesta
preparar mensaje
recomendar contacto
calendarizar seguimiento
```

Pero acciones externas sensibles:

```text
enviar propuesta
publicar
contactar patrocinador
aceptar acuerdo
```

requieren autorización humana.

---

# 103. SOI PROACTIVE LOOP

Este es uno de los elementos centrales de la arquitectura futura:

```text
        OBSERVAR
           │
           ▼
        DETECTAR
           │
           ▼
        ENTENDER
           │
           ▼
        PRIORIZAR
           │
           ▼
         PLANEAR
           │
           ▼
         ACTUAR
           │
           ▼
       VERIFICAR
           │
           ▼
        APRENDER
           │
           └────────► OBSERVAR
```

---

# 104. EVENT SUBSTRATE

Prácticamente todo lo descrito puede conectarse mediante eventos.

Ejemplos:

```text
StudentAbsent
ThirdAbsenceDetected

TeacherAttendanceMissing

RepairQuoteCreated
RepairApproved

FamilyPaymentOverdue

OpportunityDetected
ProposalSubmitted

PurchaseRequested

RepertoireProgressUpdated

ProspectAppointmentScheduled
```

---

# 105. TASK SUBSTRATE

Y estos eventos pueden producir tareas:

```text
Event
 ↓
Rule
 ↓
Task
 ↓
Owner
 ↓
Deadline
 ↓
Follow-up
 ↓
Resolution
```

Este Task Substrate continúa siendo uno de los componentes más importantes de SOI Core.

---

# 106. PRIVACIDAD Y DATOS SENSIBLES

SOI manejará datos especialmente delicados:

```text
menores
salud
situación familiar
información económica
comunicaciones
evaluaciones educativas
```

Por tanto:

```text
least privilege
field-level restrictions
RLS
audit
consent
encryption
data retention
purpose limitation
```

deben formar parte de la arquitectura desde el inicio.

---

# 107. NO MEZCLAR PERFILES

Especialmente:

```text
información médica
situación económica
conducta financiera
rendimiento académico
```

no deben mezclarse automáticamente para crear una puntuación oculta de un niño o familia.

Las decisiones institucionales importantes deben mostrar al humano **los hechos individuales**, no una caja negra.

---

# 108. COMMAND CENTER DE DIRECCIÓN

Con toda esta arquitectura, Dirección podría ver:

```text
SOI
10 SEP 2026

INSTITUCIÓN
163 alumnos activos
7 sin clase
11 seguimientos
4 maestros pendientes

PEDAGOGÍA
82% planificación al día
84% asistencia
13 alumnos con deuda pedagógica

FINANZAS
18 familias pendientes
92% recaudación

ACTIVOS
7 reparaciones
3 esperando aprobación
2 stocks críticos

REPERTORIO
Beethoven 5          64%
Navidad Coral        81%

RELACIONES
4 propuestas activas
7 organizaciones en seguimiento

OPORTUNIDADES
3 nuevas detectadas
1 urgente

EVENTOS
Concierto Navidad
68% preparación

───────────────────

HERMES

5 asuntos requieren atención.
```

---

# 109. ARQUITECTURA FUNCIONAL DEFINITIVA

```text
                         INTERNET
                            │
                     RADAR / RESEARCH
                            │
                            ▼
                ┌──────────────────────┐
                │ INTELIGENCIA EXTERNA │
                └──────────┬───────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                       SOI CORE                         │
│                                                        │
│ Identity │ People │ Events │ Tasks │ Cases │ Audit     │
│ Rules │ Permissions │ Notifications │ Organizations    │
└───────────────────────┬────────────────────────────────┘
                        │
     ┌──────────────────┼─────────────────────┐
     │                  │                     │
     ▼                  ▼                     ▼
ADMINISTRATIVO      ACADÉMICO              FINANZAS
     │                  │                     │
     │              MAESTROS                  │
     │                  │                     │
     │              REPERTORIO                │
     │                                        │
     ├────────────── LUTERÍA ─────────────────┤
     │                  │                     │
     └──────────── INVENTARIO ────────────────┘
                        │
                        ▼
               COMUNICACIONES / CRM
                        │
               ┌────────┼─────────┐
               ▼        ▼         ▼
           WhatsApp   Redes     Email
                        │
                        ▼
                 EVENTOS / AGENDA
                        │
                        ▼
                    REPORTES
                        │
                        ▼
                    DIRECCIÓN

================================================

                     HERMES

       atraviesa horizontalmente todo el SOI
```

---

# 110. NUEVO POSICIONAMIENTO DEL PRODUCTO

SOI ya no debería presentarse únicamente como:

> software de gestión para una escuela de música.

La propuesta es bastante más potente:

> **Una plataforma operacional inteligente para organizaciones educativas y culturales que integra gestión académica, relaciones institucionales, familias, activos, comunicaciones, oportunidades, eventos y procesos internos, y utiliza IA para detectar riesgos, coordinar acciones y descubrir oportunidades externas.**

---

# 111. CARACTERÍSTICA DIFERENCIADORA

Muchos sistemas pueden registrar:

```text
alumnos
pagos
asistencia
```

La diferenciación de SOI sería:

```text
registrar
+
observar
+
relacionar
+
detectar
+
investigar
+
priorizar
+
coordinar
+
dar seguimiento
+
proponer
```

Eso cambia completamente la categoría del producto.

---

# 112. PRINCIPIO CENTRAL

El SOI no debe esperar permanentemente a que Omar, Romina, un coordinador o un maestro descubran algo.

Debe poder decir:

> **“Esto está ocurriendo.”**

> **“Esto debería estar ocurriendo y no está ocurriendo.”**

> **“Esto podría ocurrir y representa una oportunidad.”**

> **“Esta persona necesita hacer algo.”**

> **“Esto quedó pendiente.”**

> **“Esta organización podría ser relevante para nosotros.”**

> **“Esta convocatoria coincide con nuestras necesidades.”**

> **“Este alumno requiere atención.”**

> **“Este maestro tiene tareas académicas pendientes.”**

> **“Esta obra no llegará preparada a tiempo manteniendo el ritmo actual.”**

Ese es el verdadero salto conceptual del SOI.

---

# 113. VISIÓN FINAL

SOI debe evolucionar hacia una plataforma que posea cuatro formas de memoria:

```text
MEMORIA OPERACIONAL
¿Qué ocurre?

MEMORIA HISTÓRICA
¿Qué ocurrió?

MEMORIA RELACIONAL
¿Con quién hemos trabajado?

MEMORIA ESTRATÉGICA
¿Qué oportunidades existen?
```

Hermes trabaja sobre esas cuatro memorias para producir:

```text
CONOCIMIENTO
      ↓
DECISIONES
      ↓
ACCIONES
      ↓
SEGUIMIENTO
```

El resultado final no es simplemente una aplicación.

Es una **representación digital viva de la institución y de su relación con el mundo exterior**.
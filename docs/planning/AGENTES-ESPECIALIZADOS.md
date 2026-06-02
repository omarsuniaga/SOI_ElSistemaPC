# AGENTES-ESPECIALIZADOS.md — Sistema de Agentes para Proyectos Grandes

**Versión:** 1.0  
**Última actualización:** Mayo 2026  
**Audiencia:** Agentes de IA especializados + Orquestador central  
**Aplica a:** Proyectos > 5000 líneas de código  

---

## 📋 Índice

1. [Visión General](#visión-general)
2. [Los 7 Agentes Especializados](#los-7-agentes-especializados)
3. [Matriz de Decisión](#matriz-de-decisión)
4. [Flujo de Trabajo Completo](#flujo-de-trabajo-completo)
5. [Handoffs Entre Agentes](#handoffs-entre-agentes)
6. [Validaciones y Checkpoints](#validaciones-y-checkpoints)
7. [Fallback y Errores](#fallback-y-errores)

---

## Visión General

### Arquitectura de Agentes

```
                    ┌─────────────────────┐
                    │  ORQUESTRADOR       │
                    │  (Claude Sonnet)    │
                    │  - Divide tareas    │
                    │  - Valida entradas  │
                    │  - Coordina cambios │
                    │  - Reporte final    │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
    ┌────────────┐      ┌──────────────┐      ┌──────────────┐
    │ SPEC       │      │ CODE         │      │ TEST         │
    │ AGENT      │      │ AGENT        │      │ AGENT        │
    │ (Claude)   │      │ (DeepSeek/   │      │ (Claude)     │
    │            │      │  Gemini)     │      │              │
    └────────────┘      └──────────────┘      └──────────────┘
        │                      │                      │
        │ PRD + Tipos          │ Código               │ Tests
        │ + API Contracts      │ + Estructura         │ + Coverage
        │                      │ + Comentarios        │ + Reports
        │
        ├──────────────────────────────────────────────┐
        │                                              │
        ▼                                              ▼
    ┌────────────┐      ┌──────────────┐      ┌──────────────┐
    │ DB         │      │ LINT/FORMAT  │      │ UI/UX        │
    │ AGENT      │      │ AGENT        │      │ AGENT        │
    │ (Claude)   │      │ (Haiku)      │      │ (Claude)     │
    │            │      │              │      │              │
    └────────────┘      └──────────────┘      └──────────────┘
        │                      │                      │
        │ Schema               │ Clean Code           │ Design
        │ + Migrations         │ + Types Safe         │ + Components
        │ + Fixtures           │ + Formatted          │ + Accesible
        │
        │
        ▼
    ┌────────────────────────────────────┐
    │ DOCS AGENT                         │
    │ (Haiku)                            │
    │ - README actualizado               │
    │ - JSDoc/Types documentados         │
    │ - CHANGELOG                        │
    │ - Guía de contribución             │
    └────────────────────────────────────┘
        │
        ▼
    ┌────────────────────────────────────┐
    │ GIT AGENT                          │
    │ (Haiku)                            │
    │ - Commits automáticos              │
    │ - PRs creados                      │
    │ - CHANGELOG actualizado            │
    │ - Ready para review                │
    └────────────────────────────────────┘
        │
        ▼
    ┌────────────────────────────────────┐
    │ GITHUB VALIDATOR (Actions)         │
    │ - Tests pasan                      │
    │ - Build exitoso                    │
    │ - Lint sin errores                 │
    │ - Coverage ≥ 70%                   │
    └────────────────────────────────────┘
```

---

## Los 7 Agentes Especializados

### 1️⃣ **SPEC AGENT** (Arquitecto)
**Modelo:** Claude Sonnet 4 (caro pero necesario)  
**Costo:** ~$0.003-0.005 / feature  
**Responsabilidad:** Diseño, especificación, tipos TypeScript

#### Tareas
- [ ] Analizar requerimiento de feature
- [ ] Crear PRD (Product Requirements Document)
- [ ] Definir tipos TypeScript (interfaces, enums)
- [ ] Especificar API contracts (input/output)
- [ ] Identificar dependencias (otras features, librerías)
- [ ] Crear diagrama de flujo de datos
- [ ] Validar alineación con AGENTS.md

#### Entrada
```typescript
{
  featureName: "Gestionar Ensayos",
  descripcion: "CRUD completo para ensayos orquestales",
  context: "Proyecto El Sistema PC, 4000+ líneas",
  constraints: ["Modo invitado + Producción", "Tests obligatorios"],
  dependenciasExistentes: ["servicioEstudiantes", "MockAdapter"]
}
```

#### Salida
```typescript
{
  prd: "# PRD: Gestionar Ensayos\n...",
  tipos: `
    interface Ensayo {
      id: string;
      nombre: string;
      fecha: Date;
      horarioInicio: string;
      horarioFin: string;
      estudiantes: string[]; // IDs
      estado: 'planeado' | 'en-curso' | 'completado' | 'cancelado';
    }
  `,
  apiContracts: {
    crearEnsayo: {
      input: "CreateEnsayoDTO",
      output: "Ensayo",
      errores: ["ValidationError", "DuplicateError"]
    }
  },
  dependenciasNuevas: ["@mui/date-pickers"],
  diagramaDatos: "```mermaid\ngraph TD\n...```",
  validacionAGENTS: "✅ Cumple AGENTS.md v1.0"
}
```

#### Cuando Llamarlo
- Al inicio de una feature nueva
- Cuando hay cambios de requerimientos
- Para refactorings mayores (v2.0+)

---

### 2️⃣ **CODE AGENT** (Programador)
**Modelo:** DeepSeek v3 o Gemini 2.0 Flash (barato)  
**Costo:** ~$0.0005-0.001 / feature  
**Responsabilidad:** Escribir código, seguir spec, estructura limpia

#### Tareas
- [ ] Leer PRD y tipos del SPEC AGENT
- [ ] Crear servicios (adapters, business logic)
- [ ] Crear componentes (React/Vue)
- [ ] Implementar Mock + Production adapters
- [ ] Agregar comentarios (en español, claridad)
- [ ] Seguir estructura AGENTS.md
- [ ] No hacer tests (eso es del TEST AGENT)

#### Entrada
```typescript
{
  spec: PRD + tipos del SPEC AGENT,
  estructura: "AGENTS.md",
  archivosRelacionados: ["servicioEstudiantes.ts", "MockAdapter.ts"],
  restricciones: ["No escribas tests", "Sin console.log", "TypeScript strict"]
}
```

#### Salida
```
src/
├── services/
│   └── servicioEnsayos.ts (150-300 líneas)
├── components/
│   ├── FormularioEnsayo.tsx
│   ├── ListaEnsayos.tsx
│   └── DetalleEnsayo.tsx
├── types/
│   └── ensayo.ts (ya creado por SPEC)
├── adapters/
│   ├── MockAdapter.ts (actualizado)
│   ├── FirebaseAdapter.ts (actualizado)
│   └── SupabaseAdapter.ts (actualizado)
└── hooks/
    └── useEnsayos.ts
```

#### Cuando Llamarlo
- Después que SPEC AGENT cree el PRD
- Para refactorings
- Para bugfixes

---

### 3️⃣ **TEST AGENT** (QA Automatizado)
**Modelo:** Claude Sonnet (tests necesitan atención)  
**Costo:** ~$0.002-0.004 / feature  
**Responsabilidad:** Escribir tests, cobertura, validar comportamiento

#### Tareas
- [ ] Leer código del CODE AGENT
- [ ] Crear unit tests (servicios, utils)
- [ ] Crear integration tests (flujos)
- [ ] Crear E2E tests (usuario invitado + autenticado)
- [ ] Alcanzar ≥ 70% cobertura
- [ ] Validar que tests usen MockAdapter
- [ ] Crear fixtures de datos de prueba

#### Entrada
```typescript
{
  codigo: "servicioEnsayos.ts + componentes",
  spec: PRD del SPEC AGENT,
  adaptador: "MockAdapter con seed.json",
  metaCobertura: 70
}
```

#### Salida
```
tests/
├── unit/
│   └── servicios/
│       └── servicioEnsayos.test.ts (100+ líneas)
├── integration/
│   └── flujoCrearEnsayo.test.ts
├── e2e/
│   └── ensayoCRUD.cy.ts
├── fixtures/
│   └── ensayosFixture.ts
└── coverage-report.json
```

#### Cuando Llamarlo
- Después que CODE AGENT escribe código
- Cuando hay bugs (crea test que reproduzca el bug)
- Antes de release

---

### 4️⃣ **DB AGENT** (Administrador de Datos)
**Modelo:** Claude Sonnet (acceso MCP Supabase)  
**Costo:** ~$0.001-0.003 / feature  
**Responsabilidad:** Schema, migrations, fixtures, data integrity

#### Tareas
- [ ] Analizar tipos TypeScript del SPEC AGENT
- [ ] Crear/actualizar schema en Supabase
- [ ] Generar migrations (si aplica)
- [ ] Crear índices y constraints
- [ ] Generar fixtures (datos de prueba)
- [ ] Actualizar seed.json para MockAdapter
- [ ] Validar integridad de datos

#### Entrada
```typescript
{
  tipos: Ensayo interface del SPEC AGENT,
  bdActual: "Supabase PostgreSQL actual",
  mockData: "seed.json actual",
  requiereAprobacion: false // Excepto DELETE
}
```

#### Salida
```
migrations/
├── 20260515_create_ensayos_table.sql
├── 20260515_add_indices.sql
└── 20260515_seed_ensayos.sql

seed.json (actualizado)
├── estudiantes: [...]
└── ensayos: [...]

SCHEMA-CHANGES.md (documentación)
```

#### MCP Requerido
```json
{
  "type": "mcp_server",
  "url": "https://mcp.supabase.com/mcp",
  "name": "supabase-mcp"
}
```

#### Cuando Llamarlo
- Después que SPEC AGENT define tipos
- Antes que CODE AGENT escriba código
- Para actualizaciones de schema

---

### 5️⃣ **LINT/FORMAT AGENT** (Calidad de Código)
**Modelo:** Claude Haiku (rápido, barato)  
**Costo:** ~$0.0001-0.0003 / feature  
**Responsabilidad:** Formato, tipos seguros, linting

#### Tareas
- [ ] Ejecutar ESLint
- [ ] Ejecutar Prettier
- [ ] Verificar TypeScript strict
- [ ] Verificar imports (sin ciclos)
- [ ] Revisar nomenclatura (AGENTS.md)
- [ ] Verificar que no haya `console.log()`
- [ ] Verificar que no haya secretos (regex)

#### Entrada
```typescript
{
  codigo: "todos los archivos modificados",
  config: ".eslintrc.cjs + tsconfig.json",
  reglas: "AGENTS.md convenciones"
}
```

#### Salida
```typescript
{
  status: "✅ PASS" | "❌ FAIL",
  errores: [
    { archivo: "servicioEnsayos.ts", línea: 42, error: "console.log sin remover" }
  ],
  warnings: [...],
  tiempo: "0.8s",
  codigoFormateado: true,
  tiposValidos: true
}
```

#### CLI
```bash
npm run lint --fix
npm run format
npx tsc --noEmit
```

#### Cuando Llamarlo
- Después que CODE AGENT escribe código
- Antes que GIT AGENT haga commit
- En cada PR

---

### 6️⃣ **UI/UX AGENT** (Diseño y Accesibilidad)
**Modelo:** Claude Sonnet (visión para componentes)  
**Costo:** ~$0.002-0.004 / feature  
**Responsabilidad:** Diseño, accesibilidad WCAG, experiencia de usuario

#### Tareas
- [ ] Revisar componentes (React/Vue)
- [ ] Validar WCAG AA (colores, contraste)
- [ ] Verificar navegación por teclado
- [ ] Verificar ARIA labels
- [ ] Sugerir mejoras UX
- [ ] Validar responsive design
- [ ] Verificar consistencia de diseño

#### Entrada
```typescript
{
  componentes: ["FormularioEnsayo.tsx", "ListaEnsayos.tsx"],
  spec: PRD del SPEC AGENT,
  wcagLevel: "AA",
  disenoTokens: "Tailwind config"
}
```

#### Salida
```typescript
{
  wcagAudits: {
    colorContrast: "✅ PASS",
    ariaLabels: "⚠️ 2 falta (form inputs)",
    keyboardNav: "✅ PASS",
    responsive: "✅ PASS"
  },
  sugerencias: [
    "Input 'nombre' necesita aria-describedby para validación",
    "Modal necesita focus trap"
  ],
  componentes: {
    FormularioEnsayo: "✅ Bien",
    ListaEnsayos: "⚠️ Revisar"
  }
}
```

#### Herramientas
```bash
npm run accessibility-check
# Usa axe DevTools, WAVE, Lighthouse
```

#### Cuando Llamarlo
- Después que CODE AGENT escribe componentes
- Para refactorings visuales
- Antes de release en producción

---

### 7️⃣ **DOCS AGENT** (Documentación)
**Modelo:** Claude Haiku (rápido, barato)  
**Costo:** ~$0.0001-0.0002 / feature  
**Responsabilidad:** README, JSDoc, CHANGELOG, guías

#### Tareas
- [ ] Actualizar README.md con nueva feature
- [ ] Agregar JSDoc a funciones públicas
- [ ] Actualizar CHANGELOG.md
- [ ] Crear ejemplos de uso
- [ ] Actualizar estructura de carpetas si cambió
- [ ] Generar diagrama de arquitectura (si es complejo)

#### Entrada
```typescript
{
  codigo: "servicioEnsayos.ts + componentes",
  spec: PRD del SPEC AGENT,
  versionAnterior: "1.2.0",
  versionNueva: "1.3.0"
}
```

#### Salida
```
README.md (actualizado)
├── Sección de features actualizada
├── Sección de API actualizada
└── Ejemplos de uso nuevos

servicioEnsayos.ts
├── JSDoc en cada función
├── @param documentados
├── @returns documentados
└── @throws documentados

CHANGELOG.md
├── ## [1.3.0] — 2026-05-15
├── ### Added
├── ### Fixed
└── ### Changed

EJEMPLOS.md (nuevo)
└── Cómo usar servicioEnsayos, FormularioEnsayo, etc.
```

#### Cuando Llamarlo
- Después que TEST AGENT valida tests
- Antes que GIT AGENT hace commit
- Para releases

---

### 8️⃣ **GIT AGENT** (Versionado)
**Modelo:** Claude Haiku (rápido, barato)  
**Costo:** ~$0.0001 / feature  
**Responsabilidad:** Commits, PRs, branches, versioning

#### Tareas
- [ ] Crear rama feature si no existe
- [ ] Hacer commits con mensaje Conventional
- [ ] Actualizar package.json (versionado semántico)
- [ ] Crear PR con template
- [ ] Escribir descripción de cambios
- [ ] Tagear versión (vX.Y.Z)
- [ ] Preparar para merge a develop

#### Entrada
```typescript
{
  archivosModificados: ["servicioEnsayos.ts", "..."],
  tipoChange: "feat" | "fix" | "refactor",
  featureName: "Gestionar Ensayos",
  versionAnterior: "1.2.0",
  breakingChanges: false
}
```

#### Salida
```bash
# Rama
git checkout -b feature/gestionar-ensayos

# Commits
git commit -m "feat: agregar servicio y componentes para gestión de ensayos"
git commit -m "test: cobertura completa para servicioEnsayos"
git commit -m "docs: actualizar README y CHANGELOG"

# Tag
git tag v1.3.0

# PR creado (GitHub MCP)
pull_request: {
  title: "feat: Gestionar Ensayos",
  descripcion: "...",
  base: "develop",
  head: "feature/gestionar-ensayos"
}
```

#### Cuando Llamarlo
- Después que DOCS AGENT documenta todo
- Antes de revisión humana
- Cuando todo está listo para merge

---

### 🎯 **ORQUESTRADOR** (Maestro de Ceremonias)
**Modelo:** Claude Sonnet 4  
**Responsabilidad:** Coordinar a todos los agentes

#### Tareas
- [ ] Recibir solicitud de feature
- [ ] Llamar SPEC AGENT → obtener PRD
- [ ] Validar PRD con usuario
- [ ] Llamar CODE AGENT → obtener código
- [ ] Llamar DB AGENT → crear schema
- [ ] Llamar TEST AGENT → obtener tests
- [ ] Llamar LINT AGENT → validar código
- [ ] Llamar UI/UX AGENT → validar accesibilidad
- [ ] Llamar DOCS AGENT → actualizar documentación
- [ ] Llamar GIT AGENT → crear PR
- [ ] Crear reporte final

#### Flujo
```
Usuario: "Quiero agregar gestión de ensayos"
         ↓
Orquestador: "Entendido. Iniciando feature..."
         ↓
[Llamadas secuenciales a cada agente]
         ↓
Reporte: "✅ Feature lista. PR #123 creada."
```

---

## Matriz de Decisión

### ¿Cuándo Llamar Cada Agente?

| Evento | Agentes | Orden |
|--------|---------|-------|
| Feature Nueva | Spec → Code → DB → Test → Lint → UI → Docs → Git | Secuencial |
| Bugfix | Spec → Code → Test → Lint → Docs (opcional) → Git | Secuencial |
| Refactor | Spec → Code → Lint → Docs → Git | Secuencial |
| Performance Improvement | Code → Test → Lint → Git | Secuencial |
| Security Patch | Spec → Code → Test → Lint → Git | Rápido |
| Documentation Only | Docs → Git | Ultra-rápido |
| Schema Only | Spec → DB → Docs → Git | 5 min |

---

## Flujo de Trabajo Completo

### Ejemplo: Feature "Gestionar Ensayos"

```
═══════════════════════════════════════════════════════════════

INICIO: Usuario solicita feature
├─ Nombre: "Gestionar Ensayos"
├─ Descripción: "CRUD completo para ensayos orquestales"
└─ Contexto: "El Sistema PC, estudiantes necesitan ver ensayos"

═══════════════════════════════════════════════════════════════

FASE 1: ESPECIFICACIÓN (15 min)
├─ Orquestador llama SPEC AGENT
├─ SPEC AGENT crea:
│  ├─ PRD completo
│  ├─ Tipos TypeScript (Ensayo, EnsayoDTO, etc.)
│  ├─ API contracts (crearEnsayo(), obtenerEnsayos(), etc.)
│  ├─ Diagrama de flujo
│  └─ ✅ Validación AGENTS.md
├─ Orquestador presenta al usuario
└─ Usuario aprueba (o pide cambios)

═══════════════════════════════════════════════════════════════

FASE 2: DATABASE (10 min)
├─ Orquestador llama DB AGENT
├─ DB AGENT accede Supabase MCP y crea:
│  ├─ Tabla "ensayos" en PostgreSQL
│  ├─ Índices (id, fecha, estado)
│  ├─ Constraints (NOT NULL, UNIQUE, FK)
│  ├─ Migration SQL
│  ├─ Fixture para seed.json
│  └─ ✅ Integridad validada
└─ Base de datos lista

═══════════════════════════════════════════════════════════════

FASE 3: CÓDIGO (30-45 min)
├─ Orquestador llama CODE AGENT
├─ CODE AGENT lee PRD + tipos + DB schema
├─ CODE AGENT crea:
│  ├─ servicioEnsayos.ts (MockAdapter + FirebaseAdapter + SupabaseAdapter)
│  ├─ FormularioEnsayo.tsx
│  ├─ ListaEnsayos.tsx
│  ├─ DetalleEnsayo.tsx
│  ├─ useEnsayos.ts hook
│  └─ Comentarios claros en español
├─ Código sigue estructura AGENTS.md
└─ ✅ Sin tests, sin console.log

═══════════════════════════════════════════════════════════════

FASE 4: TESTING (20-30 min)
├─ Orquestador llama TEST AGENT
├─ TEST AGENT crea:
│  ├─ servicioEnsayos.test.ts (unit tests)
│  ├─ flujoCrearEnsayo.test.ts (integration)
│  ├─ ensayoCRUD.cy.ts (E2E Cypress)
│  ├─ ensayosFixture.ts
│  └─ Coverage report (70%+ ✅)
├─ Todos los tests pasan en modo invitado
└─ ✅ Validado con MockAdapter

═══════════════════════════════════════════════════════════════

FASE 5: CALIDAD (5-10 min)
├─ Orquestador llama LINT AGENT
├─ LINT AGENT ejecuta:
│  ├─ npm run lint --fix
│  ├─ npm run format
│  ├─ npx tsc --noEmit
│  ├─ Verifica sin console.log
│  ├─ Verifica sin secretos
│  └─ ✅ Todo PASS
└─ Código listo para producción

═══════════════════════════════════════════════════════════════

FASE 6: ACCESIBILIDAD (10-15 min)
├─ Orquestador llama UI/UX AGENT
├─ UI/UX AGENT revisa:
│  ├─ Contraste de colores (WCAG AA)
│  ├─ ARIA labels en inputs
│  ├─ Navegación por teclado
│  ├─ Responsive design
│  └─ ✅ Todo cumple WCAG AA
└─ Componentes accesibles

═══════════════════════════════════════════════════════════════

FASE 7: DOCUMENTACIÓN (10 min)
├─ Orquestador llama DOCS AGENT
├─ DOCS AGENT actualiza:
│  ├─ README.md (nueva sección Ensayos)
│  ├─ JSDoc en servicioEnsayos.ts
│  ├─ CHANGELOG.md (v1.3.0)
│  ├─ EJEMPLOS.md (cómo usar)
│  └─ Diagrama de arquitectura
└─ Documentación completa

═══════════════════════════════════════════════════════════════

FASE 8: GIT & PR (5 min)
├─ Orquestador llama GIT AGENT
├─ GIT AGENT:
│  ├─ git checkout -b feature/gestionar-ensayos
│  ├─ git add .
│  ├─ git commit -m "feat: agregar gestión de ensayos completa"
│  ├─ git tag v1.3.0
│  ├─ Crea PR a develop (GitHub MCP)
│  └─ Descripción con checklist
└─ PR #123 lista para review

═══════════════════════════════════════════════════════════════

FASE 9: VALIDACIÓN GITHUB (2-5 min)
├─ GitHub Actions:
│  ├─ npm test → ✅ PASS
│  ├─ npm run build → ✅ PASS
│  ├─ npm run lint → ✅ PASS
│  ├─ Coverage ≥ 70% → ✅ PASS
│  └─ Lighthouse > 85 → ✅ PASS
└─ Todos los checks en verde

═══════════════════════════════════════════════════════════════

REPORTE FINAL (Orquestador)
├─ ✅ Feature completada: "Gestionar Ensayos"
├─ ✅ 7 archivos creados/modificados
├─ ✅ 150+ líneas de código
├─ ✅ 50+ líneas de tests
├─ ✅ 100% WCAG compliant
├─ ✅ Documentación completa
├─ ✅ PR #123 lista para revisar
├─ Tiempo total: ~2-3 horas
└─ Esperando aprobación humana para mergear a main

═══════════════════════════════════════════════════════════════
```

---

## Handoffs Entre Agentes

### Protocolo de Handoff

Cada agente al terminar genera:

```typescript
{
  estado: "✅ COMPLETADO" | "❌ ERROR",
  archivosGenerados: string[],
  archivosModificados: string[],
  dependenciasNuevas?: string[],
  warnings?: string[],
  validacionesRealizadas: string[],
  proximoAgente: "TEST AGENT" | "LINT AGENT" | etc,
  contextoParaProximo: {
    // Lo que el próximo agente necesita saber
  }
}
```

### Ejemplo Handoff: CODE AGENT → TEST AGENT

```json
{
  "estado": "✅ COMPLETADO",
  "archivosGenerados": [
    "src/services/servicioEnsayos.ts",
    "src/components/FormularioEnsayo.tsx",
    "src/components/ListaEnsayos.tsx",
    "src/hooks/useEnsayos.ts"
  ],
  "validacionesRealizadas": [
    "✅ Estructura AGENTS.md",
    "✅ Sin console.log",
    "✅ Comentarios en español",
    "✅ Tipos alineados con SPEC"
  ],
  "contextoParaProximo": {
    "serviciosNuevos": ["servicioEnsayos.obtener", "servicioEnsayos.crear"],
    "componentesNuevos": ["FormularioEnsayo", "ListaEnsayos"],
    "casosDeUso": [
      "Usuario invitado ve lista (MockAdapter)",
      "Usuario autenticado crea ensayo (FirebaseAdapter)",
      "Usuario invitado crea ensayo (localStorage)"
    ],
    "metaCobertura": 70
  },
  "proximoAgente": "TEST AGENT"
}
```

---

## Validaciones y Checkpoints

### Checkpoint 1: Post-SPEC
```
[ ] PRD está claro y específico
[ ] Tipos TypeScript son válidos
[ ] API contracts cubren todos los casos
[ ] Diagrama de flujo es correcto
[ ] No hay ambigüedades
→ USER APPROVAL REQUERIDA antes de continuar
```

### Checkpoint 2: Post-DB
```
[ ] Schema está en Supabase
[ ] Índices están creados
[ ] Migrations son reversibles
[ ] seed.json está actualizado
[ ] Integridad de datos validada
→ AUTOMÁTICO si todo está bien
```

### Checkpoint 3: Post-CODE
```
[ ] Código existe y funciona
[ ] Estructura es AGENTS.md compliant
[ ] Comentarios están en español
[ ] No hay lógica de tests aquí
→ AUTOMÁTICO antes de TEST AGENT
```

### Checkpoint 4: Post-TEST
```
[ ] Todos los tests pasan
[ ] Cobertura ≥ 70%
[ ] E2E tests funcionales
[ ] Fixtures de datos válidas
→ AUTOMÁTICO antes de LINT AGENT
```

### Checkpoint 5: Post-LINT
```
[ ] ESLint sin errores
[ ] Prettier formateado
[ ] TypeScript strict válido
[ ] Sin console.log
[ ] Sin secretos
→ AUTOMÁTICO antes de UI AGENT
```

### Checkpoint 6: Post-UI
```
[ ] WCAG AA compliant
[ ] Navegación por teclado OK
[ ] ARIA labels presentes
[ ] Responsive en móvil/desktop
→ AUTOMÁTICO antes de DOCS AGENT
```

### Checkpoint 7: Post-DOCS
```
[ ] README actualizado
[ ] JSDoc en funciones públicas
[ ] CHANGELOG actualizado
[ ] Ejemplos de uso incluidos
→ AUTOMÁTICO antes de GIT AGENT
```

### Checkpoint 8: Post-GIT
```
[ ] Commits Conventional válidos
[ ] PR creada y abierta
[ ] Descripción completa
→ AUTOMÁTICO, esperando GITHUB ACTIONS
```

### Checkpoint 9: GitHub Actions
```
[ ] npm test PASS
[ ] npm run build PASS
[ ] npm run lint PASS
[ ] Coverage ≥ 70%
[ ] Lighthouse > 85
→ USER APPROVAL REQUERIDA para mergear a main
```

---

## Fallback y Errores

### Si CODE AGENT Falla
```
1. Orquestador detecta error en código
2. Llama CODE AGENT de nuevo con contexto del error
3. Si falla 2 veces: escala a SPEC AGENT (Claude Sonnet)
4. Si falla 3 veces: requiere intervención humana
```

### Si TEST AGENT No Alcanza 70% Cobertura
```
1. Reporte indica qué funciones no están cubiertas
2. TEST AGENT intenta agregar más tests
3. Si llega a 70%: continúa
4. Si no: requiere aprobación humana para continuar (waiver)
```

### Si LINT AGENT Encuentra Problemas
```
1. Genera lista de issues
2. Intenta arreglarlos automáticamente (--fix)
3. Si quedan issues: detiene el flujo
4. Requiere revisión humana
```

### Si UI/UX Falla WCAG
```
1. Especifica qué no cumple
2. Sugiere correcciones
3. Si son simples: intenta arregladas automáticamente
4. Si son complejas: requiere revisión humana
```

### Si GIT AGENT Encuentra Conflictos
```
1. Detecta que develop ha avanzado
2. Hace rebase automático
3. Si hay conflictos: requiere resolución humana
4. No mergea automáticamente (siempre requiere aprobación)
```

---

## Costos Estimados

### Por Feature

| Agente | Modelo | Costo/Feature | Tiempo |
|--------|--------|---------------|--------|
| SPEC | Claude Sonnet | $0.005 | 15 min |
| CODE | DeepSeek v3 | $0.001 | 30 min |
| DB | Claude Sonnet | $0.002 | 10 min |
| TEST | Claude Sonnet | $0.003 | 25 min |
| LINT | Claude Haiku | $0.0001 | 5 min |
| UI | Claude Sonnet | $0.003 | 10 min |
| DOCS | Claude Haiku | $0.0001 | 10 min |
| GIT | Claude Haiku | $0.0001 | 5 min |
| ORQUESTRADOR | Claude Sonnet | $0.002 | Coordinación |
| **TOTAL** | — | **~$0.017** | **~2 horas** |

**Por 50 features/año:** ~$0.85 en costos de IA (muy barato comparado con devs humanos)

---

## Configuración Necesaria

### Modelos Disponibles
```bash
SPEC_AGENT_MODEL=claude-sonnet-4-20250514
CODE_AGENT_MODEL=deepseek-v3
TEST_AGENT_MODEL=claude-sonnet-4-20250514
DB_AGENT_MODEL=claude-sonnet-4-20250514
LINT_AGENT_MODEL=claude-haiku-3-5
UI_AGENT_MODEL=claude-sonnet-4-20250514
DOCS_AGENT_MODEL=claude-haiku-3-5
GIT_AGENT_MODEL=claude-haiku-3-5
ORCHESTRATOR_MODEL=claude-sonnet-4-20250514
```

### MCPs Requeridas
```json
[
  {
    "type": "mcp",
    "name": "supabase",
    "url": "https://mcp.supabase.com/mcp"
  },
  {
    "type": "mcp",
    "name": "github",
    "url": "https://mcp.github.com/mcp"
  }
]
```

---

## Próximos Documentos

1. **ORQUESTRADOR.md** — Cómo coordinarlos (lógica, decisiones)
2. **PROMPTS-BASE/** — Prompts optimizados para cada agente
3. **GITHUB-WORKFLOW.md** — Integración con GitHub Actions


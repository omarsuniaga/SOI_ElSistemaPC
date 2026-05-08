# ORQUESTRADOR.md — Sistema de Coordinación de Agentes

**Versión:** 1.0  
**Última actualización:** Mayo 2026  
**Para:** Agente Orquestrador Central (Claude Sonnet 4)  

---

## 📋 Índice

1. [Responsabilidades del Orquestrador](#responsabilidades-del-orquestrador)
2. [Flujo de Toma de Decisiones](#flujo-de-toma-de-decisiones)
3. [Patrones de Orquestación](#patrones-de-orquestación)
4. [Manejo de Errores y Fallbacks](#manejo-de-errores-y-fallbacks)
5. [Interfaz con Usuario](#interfaz-con-usuario)
6. [Reportes y Trazabilidad](#reportes-y-trazabilidad)
7. [Optimizaciones de Costo](#optimizaciones-de-costo)

---

## Responsabilidades del Orquestrador

### 1. **Receptor de Solicitudes**
El Orquestador es el punto de entrada único para todas las solicitudes.

```
Usuario solicita: "Agregar autenticación con Google"
         ↓
Orquestador recibe y parsea
```

**Tareas:**
- [ ] Parsear intención del usuario
- [ ] Extraer información (feature name, descripción, contexto)
- [ ] Validar que la solicitud es clara
- [ ] Si es ambigua: hacer preguntas

### 2. **Planificador de Tareas**
Decide qué agentes llamar y en qué orden.

```
Solicitud → Orquestador → {
  ¿Qué tipo de tarea?
  ├─ Feature nueva → [Spec, Code, DB, Test, Lint, UI, Docs, Git]
  ├─ Bugfix → [Spec, Code, Test, Lint, Docs, Git]
  ├─ Refactor → [Spec, Code, Lint, Docs, Git]
  ├─ Schema only → [Spec, DB, Docs, Git]
  └─ Docs only → [Docs, Git]
}
```

### 3. **Coordinador de Agentes**
Asegura que cada agente tenga lo que necesita y que se comuniquen correctamente.

```
Orquestrador → SPEC AGENT → {obtiene PRD}
            ↓
Orquestrador → CODE AGENT → {lee PRD, escribe código}
            ↓
Orquestrador → DB AGENT → {lee types, crea schema}
            ↓
... (continúa)
```

### 4. **Validador de Calidad**
Verifica que checkpoints se cumplan entre fases.

```
Post-CODE checkpoint:
├─ ¿Código existe?
├─ ¿Sigue AGENTS.md?
├─ ¿Sin console.log?
└─ Si NO → Llamar CODE AGENT de nuevo
```

### 5. **Generador de Reportes**
Documenta todo el proceso.

```
Reporte Final:
├─ Feature: Autenticación Google
├─ Status: ✅ COMPLETADA
├─ Archivos: 8 creados/modificados
├─ Tests: 45 nuevos (70% cobertura)
├─ Tiempo: 2h 15m
└─ PR: #456 lista para revisar
```

---

## Flujo de Toma de Decisiones

### Decisión 1: ¿Cuál es el Tipo de Solicitud?

```typescript
interface SolicitudOrquestrador {
  tipo: 'feature' | 'bugfix' | 'refactor' | 'schema' | 'docs' | 'security_patch';
  nombre: string;
  descripcion: string;
  prioridad?: 'urgente' | 'normal' | 'baja';
  requiereAprobacionHumana?: boolean;
  restricciones?: string[];
}
```

**Lógica:**

```python
def obtenerPipelineAgentes(solicitud):
    pipelines = {
        'feature': [SPEC, CODE, DB, TEST, LINT, UI, DOCS, GIT],
        'bugfix': [SPEC, CODE, TEST, LINT, DOCS, GIT],
        'refactor': [SPEC, CODE, LINT, DOCS, GIT],
        'schema': [SPEC, DB, DOCS, GIT],
        'docs': [DOCS, GIT],
        'security_patch': [SPEC, CODE, TEST, LINT, GIT],
    }
    
    return pipelines.get(solicitud.tipo, [SPEC, CODE, TEST, LINT, GIT])
```

### Decisión 2: ¿Necesita Aprobación Humana?

```python
def requiereAprobacion(solicitud, fase):
    """Determina si una fase requiere aprobación humana"""
    
    # SIEMPRE requiere aprobación humana:
    aprobacionObligatoria = {
        'spec_approval': True,  # Antes de CODE
        'database_delete': True,  # Borrar datos
        'merge_to_main': True,  # Siempre
        'production_deploy': True,  # Siempre
    }
    
    # Depende de contexto:
    if solicitud.prioridad == 'urgente':
        return False  # Menos checkpoints
    
    if 'breaking_change' in solicitud.restricciones:
        return True  # Más cuidado
    
    return False
```

### Decisión 3: ¿Usar Modelo Caro o Barato?

**Regla general:**
- **Modelo caro (Claude Sonnet):** Cuando requiere razonamiento complejo
- **Modelo barato (DeepSeek/Haiku):** Cuando es tarea mecánica

```python
def elegirModelo(agente, complejidad='media'):
    """Elige modelo basado en agente y complejidad"""
    
    modelos_baratos = {
        'CODE': 'deepseek-v3',  # Tarea mecánica
        'LINT': 'claude-haiku',
        'DOCS': 'claude-haiku',
        'GIT': 'claude-haiku',
    }
    
    modelos_caros = {
        'SPEC': 'claude-sonnet-4',  # Requiere diseño
        'TEST': 'claude-sonnet-4',  # Requiere creatividad
        'DB': 'claude-sonnet-4',  # Requiere validación
        'UI': 'claude-sonnet-4',  # Requiere criterio
    }
    
    if agente in modelos_baratos and complejidad == 'simple':
        return modelos_baratos[agente]
    
    return modelos_caros.get(agente, 'claude-sonnet-4')
```

### Decisión 4: ¿Paralelizar o Secuencial?

**Algunos agentes pueden correr en paralelo:**

```
PATRÓN 1: Totalmente Secuencial (Más seguro)
SPEC → CODE → DB → TEST → LINT → UI → DOCS → GIT
 ↓      ↓    ↓    ↓     ↓    ↓    ↓    ↓
 →      →    →    →     →    →    →    →

PATRÓN 2: Parcialmente Paralelo (Más rápido)
SPEC → [CODE + DB] → TEST → [LINT + UI] → DOCS → GIT
 ↓      ↓          ↓        ↓             ↓      ↓
       (en paralelo)      (en paralelo)

PATRÓN 3: Mini-features (Solo lo necesario)
SPEC → CODE → LINT → DOCS → GIT
 (para documentación o pequeños bugfixes)
```

**Lógica:**

```python
def puede_paralelizar(agente1, agente2):
    """¿Pueden ejecutar simultáneamente sin conflictos?"""
    
    # CODE y DB pueden correr en paralelo (no dependen una de otra)
    if {agente1, agente2} == {'CODE', 'DB'}:
        return True
    
    # LINT y UI pueden correr en paralelo
    if {agente1, agente2} == {'LINT', 'UI'}:
        return True
    
    # En general: secuencial es más seguro
    return False

def elegir_patron(solicitud):
    if solicitud.prioridad == 'urgente':
        return PARALELO  # Más rápido
    
    if solicitud.tipo == 'feature':
        return PARCIALMENTE_PARALELO  # Balance
    
    if solicitud.tipo == 'bugfix':
        return SECUENCIAL_SIMPLE  # Más cuidado
    
    return SECUENCIAL  # Default seguro
```

---

## Patrones de Orquestación

### Patrón 1: Feature Grande (4000+ líneas)

**Ejemplo:** Autenticación completa con Google

```
INICIAR FEATURE
├─ Recibir solicitud
├─ Validar que sea clara
├─ USER APPROVAL: "¿Este es el PRD correcto?"
│  ├─ SÍ → continuar
│  └─ NO → iterar con SPEC AGENT
│
├─ LLAMAR SPEC AGENT
│  ├─ Crea PRD detallado
│  ├─ Define tipos TypeScript
│  ├─ Especifica API contracts
│  └─ ✅ Retorna contexto
│
├─ USER APPROVAL: "¿Está claro para proceder?"
│  ├─ SÍ → continuar
│  └─ NO → volver a SPEC AGENT
│
├─ PARALELO:
│  ├─ LLAMAR CODE AGENT
│  │  ├─ Lee PRD, tipos, estructura
│  │  ├─ Crea servicios, componentes
│  │  └─ ✅ Retorna código
│  │
│  └─ LLAMAR DB AGENT
│     ├─ Lee tipos, crea schema
│     ├─ Genera migrations
│     └─ ✅ Retorna schema + fixtures
│
├─ ESPERAR a ambos
│
├─ LLAMAR TEST AGENT
│  ├─ Lee código, schema
│  ├─ Crea unit + integration + E2E
│  ├─ ✅ Alcanza 70% cobertura
│  └─ ✅ Retorna tests
│
├─ PARALELIZAR:
│  ├─ LLAMAR LINT AGENT
│  │  ├─ npm run lint --fix
│  │  ├─ npm run format
│  │  ├─ TypeScript check
│  │  └─ ✅ Retorna código limpio
│  │
│  └─ LLAMAR UI AGENT
│     ├─ Revisa componentes
│     ├─ Valida WCAG AA
│     └─ ✅ Retorna sugerencias
│
├─ APLICAR sugerencias de UI
│
├─ LLAMAR DOCS AGENT
│  ├─ Actualiza README
│  ├─ Agrega JSDoc
│  ├─ Actualiza CHANGELOG
│  └─ ✅ Retorna docs
│
├─ LLAMAR GIT AGENT
│  ├─ Crea rama
│  ├─ Hace commits Conventional
│  ├─ Crea PR
│  └─ ✅ Retorna PR link
│
├─ GITHUB ACTIONS (automático)
│  ├─ npm test → PASS ✅
│  ├─ npm run build → PASS ✅
│  ├─ npm run lint → PASS ✅
│  └─ Lighthouse > 85 → PASS ✅
│
├─ GENERAR REPORTE FINAL
│  ├─ Resumen de cambios
│  ├─ PR link
│  ├─ Checklist final
│  └─ Recomendación de merge
│
└─ USER APPROVAL: "¿Mergear a main?"
   ├─ SÍ → Mergear (requiere permisos GitHub)
   └─ NO → Esperar feedback
```

### Patrón 2: Bugfix Rápido (< 200 líneas)

**Ejemplo:** Corregir cálculo de promedio

```
INICIAR BUGFIX
├─ Recibir solicitud
├─ SPEC AGENT (5 min)
│  ├─ Describe el bug
│  ├─ Identifica causa raíz
│  └─ Propone solución
│
├─ CODE AGENT (10 min)
│  ├─ Implementa fix
│  └─ Retorna código
│
├─ TEST AGENT (10 min)
│  ├─ Crea test que reproduza bug
│  ├─ Valida que fix lo resuelve
│  └─ Retorna test
│
├─ LINT AGENT (3 min)
│  ├─ Formatea código
│  └─ TypeScript check
│
├─ GIT AGENT (5 min)
│  ├─ git commit -m "fix: descripción"
│  ├─ Crea PR
│  └─ Retorna PR link
│
└─ USER APPROVAL: "¿Mergear?"
```

### Patrón 3: Documentación Solo

**Ejemplo:** Actualizar README porque cambió UI

```
INICIAR DOCS-ONLY
├─ DOCS AGENT (10 min)
│  ├─ Lee código actual
│  ├─ Actualiza README
│  └─ Retorna docs
│
├─ GIT AGENT (3 min)
│  ├─ git commit -m "docs: actualizar README"
│  └─ Retorna PR
│
└─ USER APPROVAL: "¿Mergear?"
```

### Patrón 4: Schema Only (Database)

**Ejemplo:** Agregar campo a tabla estudiantes

```
INICIAR SCHEMA-CHANGE
├─ USER APPROVAL: "¿Confirmas cambio de schema?" 
│  └─ SÍ → continuar
│
├─ SPEC AGENT (5 min)
│  ├─ Define nuevo campo
│  ├─ Determina tipo, constraints
│  └─ Retorna spec
│
├─ DB AGENT (10 min)
│  ├─ Crea migration SQL
│  ├─ Actualiza seed.json
│  └─ Retorna script
│
├─ GIT AGENT (3 min)
│  ├─ git commit -m "feat: agregar campo a estudiantes"
│  └─ Retorna PR
│
└─ USER APPROVAL: "¿Aplicar migración a producción?"
   └─ SÍ → ejecutar migration
```

---

## Manejo de Errores y Fallbacks

### Nivel 1: Error en Agente Individual

```python
def manejar_error_agente(agente, error, reintento=1):
    """Maneja errores de un agente específico"""
    
    if reintento <= 2:
        # Reintenta una vez
        print(f"⚠️ {agente} falló. Reintentando...")
        return llamar_agente(agente, reintento + 1)
    
    if reintento == 3:
        # Escala a agente más poderoso
        print(f"⚠️ {agente} falló 2 veces. Escalando a Claude Sonnet...")
        return llamar_agente(agente, modelo='claude-sonnet-4')
    
    # Requiere intervención
    print(f"❌ {agente} falló 3 veces. Requiere intervención humana.")
    return requiere_intervencion_humana(agente, error)
```

### Nivel 2: Error en Validación

```python
def validar_checkpoint(fase, resultados):
    """Valida que un checkpoint se cumpla"""
    
    checkpoints = {
        'post_code': [
            'archivo_existe',
            'sin_console_log',
            'tipos_validos',
            'sigue_agents_md'
        ],
        'post_test': [
            'todos_tests_pasan',
            'cobertura_70_plus',
            'e2e_funcional'
        ],
        'post_lint': [
            'eslint_pass',
            'prettier_formateado',
            'tsc_pass',
            'sin_secretos'
        ]
    }
    
    for check in checkpoints.get(fase, []):
        if not resultados.get(check):
            return {
                'status': 'FAIL',
                'checkpoint': check,
                'accion': 'reintenta_fase_anterior'
            }
    
    return {'status': 'PASS'}
```

### Nivel 3: Escalado a Usuario

```python
def escalar_a_usuario(agente, fase, razon):
    """Escala problema a usuario"""
    
    mensaje = f"""
    ❌ NO PUEDO CONTINUAR AUTOMÁTICAMENTE
    
    Agente: {agente}
    Fase: {fase}
    Razón: {razon}
    
    OPCIONES:
    1. Proporciona más contexto
    2. Aprueba waiver (continuar sin validación)
    3. Vuelve atrás y redefine requerimientos
    4. Cancela y empieza de nuevo
    """
    
    return mostrar_a_usuario(mensaje)
```

---

## Interfaz con Usuario

### Entrada: Formato de Solicitud

El usuario puede solicitar de varias formas:

```
FORMA 1: Casual
"Quiero agregar autenticación con Google"

FORMA 2: Específica
"Feature: Autenticación Google
 - OAuth 2.0
 - Logout
 - Refresh token"

FORMA 3: Referencia a issue
"Implementar #123 (Autenticación Google)"

FORMA 4: De PR existente
"Refactorizar PR #456 (mejorar rendimiento)"
```

### Parseo de Solicitud

```python
def parsear_solicitud(texto_usuario):
    """Convierte entrada de usuario a SolicitudOrquestrador"""
    
    return {
        'tipo': detectar_tipo(texto_usuario),
        'nombre': extraer_nombre(texto_usuario),
        'descripcion': extraer_descripcion(texto_usuario),
        'prioridad': extraer_prioridad(texto_usuario),
        'restricciones': extraer_restricciones(texto_usuario),
    }

def detectar_tipo(texto):
    """Detecta tipo de solicitud automáticamente"""
    palabras_clave = {
        'feature': ['agregar', 'crear', 'nueva', 'nueva funcionalidad'],
        'bugfix': ['corregir', 'bug', 'error', 'no funciona'],
        'refactor': ['refactorizar', 'mejorar', 'limpiar', 'optimizar'],
        'docs': ['documentar', 'readme', 'actualizar docs'],
        'security': ['seguridad', 'vulnerabilidad', 'exploit'],
    }
    
    for tipo, palabras in palabras_clave.items():
        if any(p in texto.lower() for p in palabras):
            return tipo
    
    return 'feature'  # Default
```

### Salida: Reporte Final

```
╔════════════════════════════════════════════════════════════════╗
║                      REPORTE DE FEATURE                        ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║ Feature: Autenticación con Google                              ║
║ Status: ✅ COMPLETADA                                         ║
║ Tiempo Total: 2h 15m                                           ║
║ Costo IA: $0.025                                              ║
║                                                                ║
├─ SPEC PHASE ──────────────────────────────────────────────────┤
│ Status: ✅ Completado (15 min)                               │
│ Outputs:                                                       │
│ • PRD: 250 líneas                                              │
│ • Tipos: 8 interfaces                                          │
│ • API Contracts: 5 endpoints                                   │
├─ CODE PHASE ──────────────────────────────────────────────────┤
│ Status: ✅ Completado (35 min)                               │
│ Files Created/Modified: 8                                      │
│ Lines: 450 (servicios + componentes)                           │
├─ DB PHASE ────────────────────────────────────────────────────┤
│ Status: ✅ Completado (10 min)                               │
│ Migrations: 2                                                  │
│ Schema: oauth_users table                                      │
├─ TEST PHASE ──────────────────────────────────────────────────┤
│ Status: ✅ Completado (25 min)                               │
│ Tests: 45 nuevos                                              │
│ Coverage: 72% (+2%)                                           │
├─ LINT PHASE ──────────────────────────────────────────────────┤
│ Status: ✅ Completado (5 min)                                │
│ Errors: 0                                                     │
│ Warnings: 0                                                   │
├─ UI/ACCESIBILITY ────────────────────────────────────────────┤
│ Status: ✅ Completado (12 min)                               │
│ WCAG AA: ✅ Compliant                                        │
│ Keyboard Nav: ✅ OK                                          │
├─ DOCS PHASE ──────────────────────────────────────────────────┤
│ Status: ✅ Completado (8 min)                                │
│ Updated: README.md, CHANGELOG.md, JSDoc                       │
├─ GIT PHASE ───────────────────────────────────────────────────┤
│ Status: ✅ Completado (5 min)                                │
│ PR: #456                                                      │
│ Branch: feature/oauth-google                                   │
├─ GITHUB ACTIONS ──────────────────────────────────────────────┤
│ Status: ✅ Todos los checks en verde                         │
│ • npm test: PASS                                              │
│ • npm run build: PASS                                         │
│ • npm run lint: PASS                                          │
│ • Lighthouse: 87/100                                          │
│                                                                ║
├─ SIGUIENTE PASO ──────────────────────────────────────────────┤
│ ❓ ¿Deseas mergear a main?                                   │
│   → Sí (requiere aprobación manual en GitHub)                │
│   → No (continúa en develop)                                 │
│   → Revisar cambios primero                                  │
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

## Reportes y Trazabilidad

### Log de Ejecución

```json
{
  "feature_id": "feat_oauth_google_001",
  "timestamp_inicio": "2026-05-15T10:00:00Z",
  "solicitud_original": "Agregar autenticación con Google",
  "fases": [
    {
      "agente": "SPEC_AGENT",
      "modelo": "claude-sonnet-4-20250514",
      "timestamp_inicio": "2026-05-15T10:05:00Z",
      "timestamp_fin": "2026-05-15T10:20:00Z",
      "duracion_minutos": 15,
      "costo_usd": 0.005,
      "status": "✅ SUCCESS",
      "outputs": [
        "prd.md",
        "tipos/oauth.ts",
        "api-contracts.json"
      ],
      "validaciones": {
        "tiene_prd": true,
        "tipos_validos": true,
        "api_contracts_completos": true
      }
    },
    {
      "agente": "CODE_AGENT",
      "modelo": "deepseek-v3",
      "timestamp_inicio": "2026-05-15T10:20:00Z",
      "timestamp_fin": "2026-05-15T10:55:00Z",
      "duracion_minutos": 35,
      "costo_usd": 0.001,
      "status": "✅ SUCCESS",
      "outputs": [
        "services/servicioOAuth.ts",
        "components/BotónLoginGoogle.tsx",
        "hooks/useOAuth.ts",
        "adapters/MockAdapter.ts (actualizado)",
        "adapters/FirebaseAdapter.ts (actualizado)"
      ],
      "validaciones": {
        "codigo_existe": true,
        "sin_console_log": true,
        "sigue_agents_md": true,
        "tipos_alineados": true
      }
    },
    // ... más fases
  ],
  "timestamp_fin": "2026-05-15T13:15:00Z",
  "duracion_total_minutos": 195,
  "costo_total_usd": 0.025,
  "archivos_creados": 8,
  "archivos_modificados": 5,
  "tests_nuevos": 45,
  "cobertura_antes": 0.70,
  "cobertura_despues": 0.72,
  "pr_url": "https://github.com/omar/proyecto/pull/456",
  "commits": [
    "feat: agregar autenticación OAuth con Google",
    "test: cobertura completa para OAuth",
    "docs: actualizar README con instrucciones OAuth"
  ],
  "estado_final": "✅ LISTA PARA MERGEAR",
  "aprobaciones_humanas_requeridas": [
    "User approval: PRD correcto?",
    "GitHub: Mergear a main?"
  ]
}
```

### Métricas de Performance

```python
def calcular_metricas(log_ejecucion):
    """Calcula métricas de eficiencia"""
    
    metricas = {
        'duracion_total': log['timestamp_fin'] - log['timestamp_inicio'],
        'costo_total': sum(f['costo_usd'] for f in log['fases']),
        'costo_por_linea_codigo': log['costo_total'] / log['lineas_codigo'],
        'costo_por_test': log['costo_total'] / log['tests_nuevos'],
        'cobertura_ganada': log['cobertura_despues'] - log['cobertura_antes'],
        'agentes_exitosos': sum(1 for f in log['fases'] if f['status'] == '✅'),
        'reintentes_necesarios': sum(f.get('reintentes', 0) for f in log['fases']),
    }
    
    return metricas
```

---

## Optimizaciones de Costo

### 1. Usar Modelos Baratos Primero

```python
# ❌ Ineficiente
for cada_tarea in tareas:
    usar(claude_sonnet_4)  # Caro siempre

# ✅ Eficiente
for cada_tarea in tareas:
    if es_tarea_simple(cada_tarea):
        usar(deepseek_v3)  # Barato
    else:
        usar(claude_sonnet_4)  # Caro solo si es necesario
```

### 2. Cachear Resultados

```python
# Si la solicitud es idéntica a una anterior
if hash(solicitud) == hash(solicitud_anterior):
    return resultados_cacheados
else:
    return ejecutar_agentes()
```

### 3. Paralelizar Cuando Sea Posible

```
Secuencial:
A → B → C → D
Tiempo: 40 minutos
Costo: $0.025

Paralelo (cuando se puede):
A → [B || C] → D
Tiempo: 25 minutos (-38%)
Costo: $0.025 (igual costo, menos tiempo)
```

### 4. Fallback a Modelos Baratos en Ciertos Errores

```python
if error_es_simple(error):
    # Intenta arreglarlo con modelo barato primero
    return reintenta_con(deepseek_v3)
else:
    # Escala a caro si es complejo
    return reintenta_con(claude_sonnet_4)
```

---

## Próximos Pasos

1. **PROMPTS-BASE/** — Prompts optimizados para cada agente
2. **GITHUB-WORKFLOW.md** — Integración con GitHub Actions  
3. **TESTING-AGENTES.md** — Cómo validar que los agentes funcionan bien


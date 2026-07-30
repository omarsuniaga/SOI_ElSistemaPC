# Especificación e Arquitectura del Módulo: Rutas Pedagógicas, Evaluación 1-5 Estrellas, Gobernanza de Asistencia y Coordinación ACM

## 1. Visión General del Módulo

Este documento establece la especificación técnica, pedagógica y arquitectónica del motor de **Diseño Curricular Institucional en Pantalla Completa, Ruta Pedagógica SVG Interactiva en Portal Maestros, Detección Automática de Horarios por Clase, Evaluación 1-5 Estrellas en Tiempo Real por Nodo, Protocolo de Escalabilidad por Ausentismo (1-4 Faltas) y Gobernanza ACM**.

---

## 2. Arquitectura de Dominio (Clean / Hexagonal Architecture)

### 2.1 Capas del Dominio

```mermaid
graph TD
    subgraph Adaptadores de Entrada (Vistas de Pantalla Completa & Portal Maestros)
        DisenadorView[DisenadorCurricularView.js - Pantalla Completa ACM]
        RutaView[RutaPedagogicaView.js - Pantalla Completa SVG]
        PortalMaestros[planificacionView.js - Portal Maestros con Tab Ruta SVG]
        SVG[MapaContenidoSVG.js - Componente Grafo Vectorial SVG]
        AcmView[AcmAprobacionView.js - Gobernanza y Co-Autoría]
        SkillTree[PasaporteHabilidadesView.js - Árbol Gamificado]
    end

    subgraph Casos de Uso (Application Layer)
        UC1[EvaluarAlumnoEnNodoUseCase]
        UC2[AplicarProtocoloAusentismoUseCase]
        UC3[CalcularVelocidadCurricularUseCase]
        UC4[GenerarSugerenciaIAUseCase]
        UC5[DetectarFrecuenciaHorarioUseCase]
    end

    subgraph Dominio Puro (Domain Core)
        D1[IndicadorLogro.js - Entidad Atómica]
        D2[PrerrequisitoValidator.js - Validador DAG]
        D3[CalculadorSaludPerfil.js - Algoritmo IDIA]
        D4[CalculadorVelocidadCurricular.js - Diagnóstico Desfase]
    end

    subgraph Adaptadores e Infraestructura
        Groq[groqService.js / GROQ Proxy Edge Function]
        Offline[offlineSyncAdapter.js / IndexedDB Queue]
        Supabase[Supabase & DataAdapter]
    end

    DisenadorView --> UC5 & UC4
    RutaView --> UC1
    PortalMaestros --> UC1 & SVG
    AcmView --> UC3

    UC1 --> D1 & D2 & D3
    UC2 --> D3
    UC3 --> D4
    UC4 --> Groq

    UC1 --> Offline
    Offline --> Supabase
```

---

## 3. Especificación de Vistas y Componentes

### 3.1 Integración en Portal de Maestros (`planificacionView.js` / Vista `/planificacion`)
- **Acceso Directo desde el Banner:** Se integraron botones ejecutivos `🎨 Diseñador Curricular (ACM)` y `🗺️ Ver Ruta Pedagógica SVG` en la cabecera principal del Portal de Maestros.
- **Pestaña `🗺️ Ruta SVG` en el Detalle de Clase:** Al seleccionar cualquier clase en "Mis Clases", el modal incluye la 5ª pestaña `🗺️ Ruta SVG` con el **Grafo Vectorial SVG de Nodos**.
- **Evaluación 1-Tap por Nodo:** Al presionar un nodo pedagógico en el mapa SVG dentro del modal o la vista principal del maestro, se despliega la lista con los **alumnos reales** del grupo para ciclar sus calificaciones 1-5★ con persistencia offline inmediata.

### 3.2 Vistas de Pantalla Completa (Full-Page Views)
- **`DisenadorCurricularView.js` (`#planificacion-disenador`)**:
  - Vista completa (sin modales) para el Coordinador ACM y Docentes Especialistas.
  - **Detección Automática de Horarios:** Botón `[⚡ Auto]` que lee el horario y los días de la clase (`clases.diasSemana` / `clases.horario`) para calcular automáticamente cuántas clases se imparten a la semana (ej. 2 clases/sem $\rightarrow$ 48 clases en 6 meses / 24 semanas).
  - Estructuración jerárquica en 3 niveles: **Nivel Técnico (Mundo) ➔ Unidades / Objetivos ➔ 1 Indicador Evaluables por Clase**.

- **`RutaPedagogicaView.js` (`#planificacion-ruta`)**:
  - Vista vectorial completa del **Grafo SVG de Nodos Pedagógicos**.
  - **Interacción al Tocar Nodo:** Al hacer clic en cualquier nodo (Clase $N$), se despliega en la misma pantalla la lista completa de **alumnos reales** de la clase.
  - Muestra la calificación de **1 a 5 Estrellas**, o **0 Estrellas (Sin Registrar)** para clases aún no impartidas.
  - Permite ciclar la evaluación alumno por alumno con 1-Tap (`0 → 1 → 2 → 3 → 4 → 5 → 0`).

### 3.3 Entidades y Protocolos
- **`IndicadorLogro.js`**: Entidad del indicador atómico evaluable (1 por Clase Real). Umbral de aprobación: $\ge 3$ estrellas.
- **`CalculadorSaludPerfil.js` (IDIA)**:
  $$\text{IDIA} = \text{Avance Curricular Puro (\%)} - (\text{Inasistencias Injustificadas} \times 4\%) - (\text{Inasistencias Justificadas} \times 1.5\%)$$
- **`protocoloAusentismoService.js`**:
  - `1ª Falta`: Registro silencioso en bitácora.
  - `2ª Falta`: Notificación exploratoria al representante.
  - `3ª Falta`: Carta formal + **Retención de Instrumento**.
  - `4ª Falta`: **Bloqueo de Asistencia + Cita Obligatoria** con Coordinación.

---

## 4. Estado de Verificación y Pruebas Unitarias

Todas las unidades cuentan con cobertura de pruebas automatizadas en Vitest:
- `src/modules/planificacion/__tests__/`
- **Total:** 33 archivos de prueba pasados / **350 pruebas unitarias aprobadas (100% de éxito)**.

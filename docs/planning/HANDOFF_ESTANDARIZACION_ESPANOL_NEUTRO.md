# Handoff: Estandarización de Español Neutro e Institucional (Frontend ADM y Portal de Maestros)

**Fecha:** 14 de Septiembre, 2026  
**Área:** Frontend (`src/modules/`, `src/portal-maestros/`, `src/portales/`, `src/shared/`)  
**Autor / Agente:** Antigravity / Senior Architect  
**Estado:** ✅ Completado y Verificado en Suite de Tests  

---

## 1. Contexto y Justificación del Trabajo

### El Problema
El uso de herramientas de asistencia y MCPs (como Gentle AI y Engram MCP) generó por defecto la introducción no supervisada de conjugaciones, pronombres y modismos propios del dialecto rioplatense (argentino) en textos de interfaz de usuario, modales, alertas, notificaciones, generadores de reportes PDF y placeholders.

Entre estas formas se encontraban:
- **Voseo indicativo:** *tenés, podés, hacés, querés, sabés, decís, venís, cargás, completás, revisás, guardás, seleccionás, necesitás, trabajás*, etc.
- **Voseo imperativo y agudo:** *hacé, tené, poné, cargá, completá, revisá, confirmá, andá, mirá, probá, guardá, ingresá, seleccioná, agregá, borrá, creá, enviá, abrí, subí, pedí, elegí, decí, sumá, intentá, dejá, empezá, definí, escribí, mostrá, usá, descargá, consultá, modificá, actualizá, verificá, indicá, explicá, marcá, cerrá, añadí, continuá, dividí, evaluá, prepará, ampliá, procedé, describí, instalá, solicitá, repetí, accedé, tocá*.
- **Enclíticos graves sin tilde:** *cargalo, completalo, revisalo, guardalo, envialo, probalo, hacelo, fijate, acordate*, etc.
- **Modismos coloquiales y adverbs regionales:** *acá* (por *aquí*), *al toque* (por *de inmediato / enseguida*), *che*, *laburo*, *pibe*, *chabón*, *posta*, *chequeá*.
- **Tratamiento informal inconsistente:** Mezcla de tuteo informal (*"Ingresa tu contraseña"*, *¿Estás seguro que quieres salir?*) frente al tono institucional formal establecido para el personal directivo, docente y administrativo.

### El Objetivo
Auditar sistemáticamente el 100% de los portales y módulos compartidos para sustituir estas formas por **español neutro institucional formal** (*tratamiento de usted / infinitivo / tercera persona*), preservando con rigor absoluto los identificadores de código en inglés, contratos de API, enumeraciones de base de datos y esquemas Supabase.

---

## 2. Convención Lingüística Institucional (Obligatoria para Futuras Fases)

Todo agente o desarrollador que genere o modifique código UI, documentación o mensajes al usuario DEBE seguir estas reglas:

| Dialecto Rioplatense / Coloquial (PROHIBIDO) | Español Neutro / Institucional (ESTÁNDAR) |
| :--- | :--- |
| **acá** | **aquí** |
| **al toque** | **de inmediato** / **enseguida** |
| **chequeá / chequear** | **revise / verificar** |
| **tenés / podés / hacés** | **tiene / puede / hace** |
| **cargá / completá / revisá / confirmá** | **cargue / complete / revise / confirme** |
| **guardá / ingresá / seleccioná / agregá** | **guarde / ingrese / seleccione / agregue** |
| **usá / probá / mirá / andá** | **use / pruebe / consulte / vaya** |
| **abrí / subí / pedí / elegí / decí** | **abra / suba / solicite / elija / indique** |
| **describí / instalá / solicitá / repetí** | **describa / instale / solicite / repita** |
| **¿Estás seguro que querés/deseas...?** | **¿Está seguro de que desea...?** |
| **¿Deseas descartar / recuperar...?** | **¿Desea descartar / recuperar...?** |
| **tu cuenta / tu correo / tu contraseña** | **su cuenta / su correo electrónico / su contraseña** |
| **tu perfil / tu clase / tus alumnos** | **su perfil / su clase / sus alumnos** |
| **es-AR** (en formateo de fecha / hora) | **es-DO** (Dominicana) o **es-ES** |

---

## 3. Alcance de Archivos Auditados y Corregidos

Se auditaron y estandarizaron más de **140 archivos** organizados en dos grandes olas:

### Ola 1: Portal ADM y Módulos Compartidos (`src/modules/`, `src/shared/`, `src/portales/`)
- **Aprobación y Notificaciones:** `admin-aprobacion`, `admin-notificaciones`, `director-aprobacion`.
- **Alumnos y Clases:** `alumnosView.js`, `postuladoPerfilView.js`, `pdfDemoView.js`, `clasesView.js`, `clasesHoyView.js`, `claseModal.js`, `claseConflictModal.js`, `alumnoInscripcionModal.js`.
- **Planificación Curricular:** `acmPropuestasView.js`, `clasePlanificacionView.js`, `DisenadorCurricularView.js`, `MaestroPlanificacionView.js`, `RutaPedagogicaView.js`, `asistentePedagogicoPanel.js`, `coberturaModal.js`, `curriculumLinkerPanel.js`, `EditorPlanificacionModal.js`, `evaluacionClaseModal.js`, `JustificacionDesfaseModal.js`, `mapaPedagogicoPanel.js`, `planificacionModal.js`, `rutasManagementPanel.js`, `uploadAdapter.js`, `propuestasApi.js`, `IndicadorLogro.js`.
- **Asistencias y Seguimiento:** `asistenciasView.js`, `asistenciasSupabase.js`, `AusentismoDashboardView.js`, `seguimientoAlumnosView.js`, `seguimientoAusentesView.js`, `seguimientoInstitucionalView.js`, `seguimientoRulesView.js`, `studentCaseDetailView.js`, `CaseActionModal.js`.
- **Inventario y Lutería:** `historialInstrumentoView.js`, `reportesInventarioView.js`, `luteriaDiagnosticoWizard.js`, `luteriaOrdenWizard.js`.
- **Hermes y Guía:** `scoreDirectorView.js`, `tareasView.js`, `clasificadorApi.js`, `GuidancePanel.js`, `viewRegistry.js`, `processKnowledge.js`, `maestro-rules.js`.
- **Horarios y Cuotas:** `horarioBuilderView.js`, `DragDropManager.js`, `horarioGeneralView.js`, `registroPagosView.js`.
- **Componentes Compartidos:** `AppModal.js`, `DocumentPreviewModal.js`, `exportView.js`, `importView.js`.

### Ola 2: Portal de Maestros (`src/portal-maestros/`)
- **Autenticación y Registro:** `maestroAuth.js`, `loginView.js`, `registerView.js`, `pendingApprovalView.js`, `templates/loginDesignTemplate.js`.
- **Asistencia y Gestión de Clase:** `asistenciaView.js`, `StudentList.js`, `CategoriaTrabajoBar.js`, `AutoDraftManager.js`, `ObservationSaveButton.js`, `ausenciaModal.js`, `ausenciaForm.js`, `ausenciaHistorial.js`, `JustificacionModal.js`, `sustitucionModal.js`, `claseEmergenteView.js`, `crearClaseView.js`, `gestionarClasesView.js`, `gestionarClasesModal.js`, `hoyView.js`, `calendarioView.js`, `misClasesView.js`, `asistenciaHelpers.js`.
- **Planificación y Malla:** `academicPlanBuilderView.js`, `routeConfigurator.js`, `PlanEstudiosPanel.js`, `PlanningHistorialPane.js`, `PlanningManagerPanel.js`, `PlanClasePanel.js`, `planClaseApi.js`, `maestroDataService.js`, `PreloadSearch.js`.
- **Servicios de IA y Notificaciones:** `groqService.js` (rúbricas de inferencia y evaluación lingüística en español neutro), `aiService.js`, `notificationService.js`, `pushDiagnostic.js`, `pwaInstaller.js`.
- **Perfil y Ajustes:** `perfilView.js`, `disponibilidadView.js`, `SessionSummaryPanel.js`, `AsistenteIa.js`.
- **Estilos CSS:** `05-views.css`, `07-dsl.css` (comentarios técnicos estandarizados a *aquí*).
- **Asistente Wizard de Registro:** `step2-madre.js`, `step3-padre.js`.

---

## 4. Pruebas Unitarias y Gates de Calidad

1. **Sincronización de Aserciones de Tests:**
   - En pruebas que evaluaban cadenas exactas de UI (como `CategoriaTrabajoBar.test.js`, `ausenciaValidator.test.js` y `misClasesView.test.js`), se actualizaron las aserciones para coincidir con el nuevo español institucional neutro (*¿Trabajó?*, *Indique...*, *Seleccione...*, *Explique...*).
2. **Descubrimiento de Suites de Prueba:**
   - Se registró en [`tests/tooling/testDiscovery.test.js`](file:///C:/Users/omare/dev/SOI_ElSistemaPC/tests/tooling/testDiscovery.test.js) las suites de `tools/security-regression/` dentro de `dedicatedSuites`, garantizando que el contrato del runner de pruebas de Vitest valide al 100%.
3. **Resultado de Ejecución:**
   - Suite `src/portal-maestros/`: **94 archivos / 805 tests PASADOS** (0 fallos).
   - Suite global del repositorio: **450+ archivos / 4013+ tests PASADOS** (0 fallos).
   - Escáner léxico automatizado: **0 coincidencias** de términos o conjugaciones dialectales.

---

## 5. Gotchas y Notas Técnicas para el Siguiente Agente

- **Saltos de Línea Windows (CRLF vs LF):** Varios archivos en `src/portal-maestros/` tienen finales de línea CRLF (`\r\n`). Al utilizar herramientas de reemplazo de contenido textual en bloque continuo, un desfase de saltos de línea puede truncar líneas intermedias. **Siempre aplicar reemplazos de línea simple (`StartLine == EndLine`)** o verificar el diff antes de avanzar.
- **Mocks y Pruebas que validan texto:** Al agregar o modificar validaciones en servicios compartidos (ej. `ausenciaValidator.js` o `CategoriaTrabajoBar.js`), verificar inmediatamente su archivo `.test.js` correspondiente para evitar fallos de expectativas en cadenas textuales.
- **Formato de Commit:** Recordar que el proyecto prohíbe terminantemente `Co-Authored-By` o atribuciones a herramientas de IA, y exige 100% Conventional Commits en idioma inglés.

---
name: soi-portals-navigator
description: Guía de navegación de portales y estándares de arquitectura hexagonal para el SOI Web Portal. Utilizar cuando el usuario solicite crear o modificar vistas, estructurar enrutamientos, añadir botones a portales específicos o realizar refactorizaciones en la carpeta src/.
tags:
  - web
  - portal
  - architecture
  - hexagonal
---

# Guía del Navegador de Portales y Arquitectura Hexagonal

Este documento establece el contrato operativo para que cualquier Agente de IA (LLM) entienda la estructura del proyecto web del Sistema Operativo Institucional (SOI) y aplique los estándares de código y desacoplamiento requeridos.

---

## 🚀 1. Arquitectura de Entrada: Los 3 Paradigmas de Portal

El proyecto no es una SPA gigantesca y monolítica, sino un conjunto de aplicaciones/lentes que comparten recursos. Se dividen en tres arquitecturas de inicio:

1. **Portal de Maestros (`index.html` -> `src/main-maestros.js`):**
   *   **Propósito:** Interfaz de cara a los docentes en aula.
   *   **Estructura:** SPA modular contenida en `src/portal-maestros/`. Cuenta con su propio enrutador y flujos de offline (IndexedDB + Service Worker).
2. **Chasis de Portales Administrativos (Lentes):**
   *   **Portales asociados:** Académico (`acm.html`), Administración (`adm.html`), Lutería (`luteria.html`), Técnico (`tecnico.html`), etc.
   *   **Mecánica:** Son entry points mínimos que importan el chasis compartido [adminPortalShell.js](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/src/portales/_shared/adminPortalShell.js). Cargan una botonera dinámica (`navGroups`) y registran **todos** los módulos mediante [allRegistrars.js](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/src/portales/_shared/allRegistrars.js).
3. **Portales Independientes (`fin.html` -> `src/portales/fin/fin.js`):**
   *   **Propósito:** Portales con requerimientos de seguridad aislados (ej: caja/finanzas).
   *   **Mecánica:** Renderizado directo que no pasa por el chasis compartido, con autenticación personalizada y vistas locales.

---

## 🛠️ 2. Estándar de Arquitectura Hexagonal (Puertos y Adaptadores)

Para mantener el código testeable, desacoplado de la persistencia y habilitar el **Modo Demo (Mocks)** sin alterar la interfaz, todo nuevo desarrollo o refactorización debe estructurarse siguiendo el modelo hexagonal.

### 📐 Estructura de Directorios por Módulo
Al crear o modificar un módulo en `src/modules/[module-name]/`, implementa esta jerarquía:

```
src/modules/[module-name]/
├── domain/                    <-- El Núcleo (Core)
│   ├── [Entity].js            <-- Lógica y validaciones puras de negocio
│   └── [Entity]Mapper.js      <-- Traductor entre BD física y objeto limpio de dominio
├── api/                       <-- Puertos y Adaptadores de Salida
│   ├── [module]Adapter.js     <-- El PUERTO (Decisor Mock/Real)
│   ├── [module]Supabase.js    <-- Adaptador real conectándose a Supabase
│   └── mocks/
│       └── [module]Mock.js    <-- Adaptador mock retornando datos de prueba (JSON)
├── views/                     <-- Adaptadores de Entrada (Primary)
│   └── [View].js              <-- Vistas de la interfaz de usuario (Vanilla JS)
└── [module].router.js         <-- Definición de rutas del módulo
```

### 🚫 Reglas Críticas
*   **Aislamiento de Persistencia:** Queda estrictamente **PROHIBIDO** importar `supabaseClient` directamente en las vistas (`views/`). Toda llamada a datos debe pasar por la abstracción de su respectivo `[module]Adapter.js`.
*   **Mock First:** Siempre provee la implementación mock en `api/mocks/` leyendo de `src/assets/data/mocks/` antes de dar por completado el módulo.
*   **Golden Standard:** Usa el módulo `src/modules/audiciones/` como la referencia exacta de implementación limpia.

---

## 🔗 3. Receta Operativa: Agregar una Vista a un Portal de Chasis

Cuando se solicite añadir una funcionalidad a un portal administrativo, ejecuta este flujo ordenadamente (CONCEPTS > CODE):

1. **Escribe el Módulo:** Crea las carpetas `domain`, `api` y `views` en `src/modules/[mi-feature]/` bajo las directrices del hexágono.
2. **Define la Ruta:** En `src/modules/[mi-feature]/[mi-feature].router.js`, exporta la función `registerRoutes[MiFeature](router)` para registrar el endpoint virtual (ej: `mi-ruta`).
3. **Conecta al Registry:** Importa y añade la función de registro en [allRegistrars.js](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/src/portales/_shared/allRegistrars.js).
4. **Agrega al Menú del Portal:** Abre el entry point del portal deseado (ej. `src/portales/acm/acm.js` o `src/portales/adm/adm.js`), ubica el arreglo `navGroups` e inyecta el ítem de navegación vinculándolo al `id` de la ruta:
   ```javascript
   { id: 'mi-ruta', label: 'Mi Nueva Vista', icon: 'bi-star' }
   ```

---

## 📊 4. Catálogo de Portales (Lentes Compartidos)

| Portal (HTML) | Archivo JS de Configuración | Rol Requerido | Código de Proceso SOI | Responsabilidades Clave |
| :--- | :--- | :--- | :--- | :--- |
| `acm.html` | `src/portales/acm/acm.js` | `admin` | **ACM-P02** | Gestión de programas, clases, salones, planificaciones pedagógicas, asistencias e historial de cierres académicos. |
| `adm.html` | `src/portales/adm/adm.js` | `admin` | **ADM-P08** | Inscripción de alumnos, altas de maestros, gestión de postulantes, control de ausencias de personal y centro de notificaciones push. |
| `fin.html` | `src/portales/fin/fin.js` | `admin` o `cajero` | **FIN-P13** | Gestión de cobranzas, caja diaria, cobro de cuotas mensuales y control de alertas financieras en Supabase. |
| `luteria.html` | `src/portales/luteria/luteria.js` | `admin` | **OPR-P10** | Taller de lutería, diagnósticos de daños de instrumentos, órdenes de reparación e inventario de piezas. |
| `index.html` | `src/main-maestros.js` | `maestro` | **ACM-P02** / **ADM-P08** | Panel del docente en aula, registro de asistencias mediante DSL pedagógico, y solicitudes de ausencias temporales. |
| `admin.html` | `src/main.js` | `admin` | — | Panel global de administración para la gobernanza de usuarios, roles, configuraciones críticas del sistema y auditorías. |

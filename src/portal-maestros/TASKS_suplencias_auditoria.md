# Tasks — Suplencias de Clase y Auditoría Administrativa

**Change:** `suplencias-auditoria`  
**Fecha:** 2026-08-14

---

## Fase 1: Modelo y bitácora

### 1.1 [DB/API] Definir el contrato de auditoría de suplencias

**Objetivo:** Establecer la estructura mínima para registrar acciones del suplente sin alterar la titularidad de la clase.

**Cambios esperados:**
- Definir la entidad de auditoría para suplencias.
- Incluir referencia a clase, sesión o fecha, titular, suplente, acción, resultado y resumen del payload.
- Mantener la clase como fuente de verdad académica.

**Verificar:** El contrato permite distinguir quién ejecutó la acción y sobre qué clase ocurrió.

---

### 1.2 [DB/API] Persistir eventos de suplencia desde las mutaciones de clase

**Objetivo:** Registrar cambios cuando se asigna o modifica el suplente de una clase.

**Cambios esperados:**
- Emitir evento al guardar `maestro_suplente_id`.
- Registrar alta, cambio o eliminación de suplente.
- Asociar el evento a la clase y al actor que hizo la modificación.

**Verificar:** Crear/editar una clase con suplente deja rastro auditable.

---

### 1.3 [DB/API] Registrar acciones del suplente sobre asistencia y contenido

**Objetivo:** Capturar cada operación relevante que haga el suplente dentro de la clase asignada.

**Cambios esperados:**
- Guardar evento al registrar asistencia.
- Guardar evento al registrar o editar contenido de clase.
- Guardar evento si se corrige una sesión permitida.

**Verificar:** Las acciones del suplente quedan ligadas a la clase del titular y al actor real.

---

## Fase 2: Consumo en el portal de maestro

### 2.1 [UI/API] Exponer claramente las clases suplidas en el calendario

**Objetivo:** Que el suplente vea en su agenda las clases que debe atender como suplente.

**Cambios esperados:**
- Mostrar la clase en el calendario del maestro cuando figure como suplente.
- Distinguir visualmente clases titulares vs. suplidas.
- Mantener el calendario del titular intacto.

**Verificar:** El suplente ve su carga real de trabajo y el titular no pierde su representación.

---

### 2.2 [UI/API] Permitir registrar asistencia y contenido como suplente

**Objetivo:** Que el suplente pueda operar la clase con permisos funcionales completos dentro de su asignación.

**Cambios esperados:**
- Confirmar que el suplente puede abrir la clase asignada.
- Permitir guardar asistencia.
- Permitir guardar contenido de clase.
- Rechazar acciones fuera de sus clases asignadas.

**Verificar:** El suplente opera solo donde corresponde.

---

## Fase 3: Consulta administrativa

### 3.1 [UI] Crear vista de auditoría de suplencias para administración

**Objetivo:** Permitir que administración consulte qué hizo cada suplente.

**Cambios esperados:**
- Crear una vista de log consultable desde el área administrativa.
- Mostrar clase, titular, suplente, acción, fecha y resumen.
- Incluir filtros por suplente, clase, fecha y tipo de acción.

**Verificar:** El administrador puede leer el historial sin entrar al portal de maestro.

---

### 3.2 [UI] Integrar la vista en ACM o ADM

**Objetivo:** Hacer visible la auditoría sin duplicar el módulo completo de Maestros.

**Cambios esperados:**
- Agregar acceso visible a la consulta de suplencias en el portal administrativo elegido.
- Evitar exponer edición innecesaria.
- Mantener el acceso consistente con el resto del portal.

**Verificar:** La auditoría queda accesible para administración con una entrada clara.

---

## Fase 4: Seguridad y contratos

### 4.1 [Auth/RLS] Restringir el alcance del suplente

**Objetivo:** Evitar que el suplente opere clases ajenas.

**Cambios esperados:**
- Validar que solo pueda actuar en clases donde figura como titular o suplente.
- Bloquear escritura fuera de su alcance.
- Mantener lectura segura según el flujo ya existente.

**Verificar:** Un suplente no puede modificar una clase no asignada.

---

### 4.2 [Auth/RLS] Proteger la bitácora administrativa

**Objetivo:** Permitir consulta administrativa sin abrir la bitácora al resto de roles.

**Cambios esperados:**
- Restringir lectura completa a perfiles administrativos.
- Preservar trazabilidad de actor y clase.
- Evitar exposición pública de la bitácora.

**Verificar:** Solo administración puede consultar el historial completo.

---

## Fase 5: Pruebas

### 5.1 [Test] Cubrir la asignación y visualización del suplente

**Objetivo:** Asegurar que el modelo y la UI reconocen correctamente la suplencia.

**Casos mínimos:**
- clase con suplente asignado;
- clase sin suplente;
- suplente visible en calendario;
- titularidad preservada.

**Verificar:** El comportamiento esperado no se rompe por regresiones.

---

### 5.2 [Test] Cubrir asistencia y contenido registrados por suplente

**Objetivo:** Validar que el suplente puede operar la clase y que los datos quedan asociados al titular.

**Casos mínimos:**
- guardar asistencia como suplente;
- guardar contenido como suplente;
- bloquear operación fuera de asignación.

**Verificar:** La ejecución queda auditada y la clase sigue perteneciendo al titular.

---

### 5.3 [Test] Cubrir la vista administrativa de auditoría

**Objetivo:** Confirmar que el log se puede consultar y filtrar.

**Casos mínimos:**
- filtro por suplente;
- filtro por clase;
- filtro por fecha;
- filtro por tipo de acción.

**Verificar:** La administración obtiene seguimiento real y no solo datos sueltos.

---

## Puertas de calidad

Una fase no avanza si falla cualquiera de estas puertas:

1. El contrato de datos queda ambiguo.
2. El suplente puede escribir fuera de su asignación.
3. La bitácora no identifica actor, clase y fecha.
4. La administración no puede consultar el historial.
5. Las pruebas no cubren el flujo titular/suplente completo.

---

## Resultado esperado

Al completar estas tareas:

- el suplente opera clases asignadas;
- la clase sigue perteneciendo al titular;
- administración puede auditar quién hizo qué y cuándo;
- el sistema queda listo para endurecer permisos o ampliar trazabilidad después.


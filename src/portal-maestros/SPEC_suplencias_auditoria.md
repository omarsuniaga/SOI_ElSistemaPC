# SPEC TÉCNICA Y FUNCIONAL
# Suplencias de Clase y Auditoría Administrativa en el Portal de Maestros

## 1. Propósito

Definir cómo un maestro suplente puede operar una clase asignada sin tomar la titularidad académica de esa clase, dejando un rastro auditable de sus acciones para administración.

## 2. Contexto actual

Ya existe soporte para asignar `maestro_suplente_id` a una clase. El portal de maestro ya puede recuperar clases donde el usuario aparece como titular o suplente. Lo que falta es:

- una bitácora específica de acciones del suplente;
- una vista administrativa para consultar ese historial;
- reglas claras de atribución y seguridad.

## 3. Alcance

### Incluye

- Asignación de suplente al crear o editar una clase.
- Visualización de clases suplidas en el portal del maestro.
- Registro de asistencia por el suplente.
- Registro de contenido de clase por el suplente.
- Persistencia de esos datos sobre la clase del titular.
- Registro auditable de la acción realizada por el suplente.
- Vista administrativa para consultar el log.

### No incluye

- Cambio de titularidad de la clase.
- Clonar el módulo completo de Maestros dentro de ACM.
- Reescribir el motor de clases o asistencia.
- Cambiar la lógica de permisos ya existente salvo lo necesario para esta función.

## 4. Reglas funcionales

### 4.1 Asignación

- Una clase puede tener suplente.
- La asignación se guarda en la clase, no en el usuario.
- Si no hay suplente, no hay capacidades de suplencia para esa clase.

### 4.2 Acceso del suplente

- El suplente inicia sesión normal en el portal de maestro.
- El sistema debe mostrarle las clases donde aparece como suplente.
- Puede operar solo dentro de esas clases asignadas.

### 4.3 Titularidad académica

- La clase sigue perteneciendo al maestro titular.
- La asistencia y el contenido registrados por el suplente se guardan en la clase del titular.
- El sistema debe conservar trazabilidad del actor que ejecutó la acción.

### 4.4 Calendario del suplente

- El calendario debe mostrar las clases asignadas como suplente.
- La UI debe distinguir entre clases propias y suplidas.

### 4.5 Seguimiento académico

- El seguimiento principal pertenece al titular.
- El suplente queda registrado como ejecutor temporal.
- El sistema no debe atribuir al suplente la propiedad académica permanente.

## 5. Bitácora administrativa

### 5.1 Objetivo

Permitir que administración vea qué hizo un suplente, sobre qué clase, cuándo y con qué resultado.

### 5.2 Eventos mínimos

- alta o cambio de suplente en una clase;
- entrada del suplente a una clase;
- registro de asistencia;
- creación o edición de contenido;
- cualquier corrección permitida sobre la sesión.

### 5.3 Campos mínimos

Cada registro debe guardar:

- `id`
- `clase_id`
- `sesion_id` o `fecha`
- `maestro_titular_id`
- `maestro_suplente_id`
- `accion`
- `resultado`
- `payload_resumen`
- `created_at`
- `created_by`

### 5.4 Reglas del log

- Registrar siempre el actor real.
- No sustituir el dato académico, solo complementarlo.
- Permitir filtros por suplente, clase, fecha y tipo de acción.
- Ser legible desde administración sin depender de la consola del navegador.

## 6. Seguridad y permisos

### Suplente

- Puede actuar solo en clases asignadas.
- No puede operar clases ajenas.
- No puede cambiar la titularidad.

### Titular

- Sigue siendo el dueño funcional de la clase.
- Puede revisar lo ocurrido en su clase.

### Administración

- Debe poder consultar la bitácora completa.
- Debe identificar actor, clase y fecha.

## 7. Modelo de datos recomendado

La solución debe apoyarse en una tabla de auditoría específica para suplencias o una extensión clara del esquema de auditoría existente.

La bitácora debe poder vincular:

- clase;
- sesión o fecha;
- maestro titular;
- maestro suplente;
- tipo de acción;
- resumen de la operación.

La bitácora no reemplaza:

- `asistencia`
- `contenidos`
- `sesiones_clase`
- `clases`

Solo agrega trazabilidad.

## 8. Puntos de integración

### 8.1 Alta y edición de clase

Cuando se asigna o cambia un suplente:

- se guarda `maestro_suplente_id`;
- se registra el cambio en la bitácora.

### 8.2 Registro de asistencia

Cuando el suplente guarda asistencia:

- se persiste la asistencia sobre la sesión correspondiente;
- se registra el evento de suplencia.

### 8.3 Registro de contenido

Cuando el suplente registra contenido:

- se persiste el contenido en la clase del titular;
- se registra el evento de suplencia.

### 8.4 Consulta administrativa

La vista de administración debe mostrar:

- clase;
- titular;
- suplente;
- acción;
- fecha y hora;
- resumen.

## 9. UX esperada

### Portal del maestro

- El suplente debe ver las clases asignadas.
- Las clases suplidas deben distinguirse visualmente.
- El calendario debe reflejar la carga operativa real.

### Administración

- Debe existir una vista tipo tabla o timeline.
- Debe poder filtrar por suplente, clase y fecha.

## 10. Casos de uso

### Clase con suplente

1. Un administrador asigna suplente a una clase.
2. El suplente entra al portal.
3. El sistema muestra la clase.
4. El suplente registra asistencia y contenido.
5. El sistema guarda los datos en la clase del titular.
6. El sistema escribe un evento auditable.

### Suplente no asignado

1. Un maestro intenta abrir una clase donde no figura como titular ni suplente.
2. El sistema bloquea el acceso.

### Auditoría administrativa

1. Un administrador consulta la bitácora.
2. Puede ver qué hizo el suplente, en qué clase y cuándo.

## 11. Criterios de aceptación

- Una clase puede tener suplente asignado.
- El suplente puede ver y operar sus clases asignadas.
- La asistencia y el contenido del suplente quedan asociados a la clase del titular.
- El sistema registra un evento auditable por cada acción relevante.
- Administración puede consultar ese historial por clase, suplente y fecha.
- No se rompe la separación entre titularidad académica y ejecución operativa.

## 12. Riesgos

- Confundir visibilidad con autoridad real.
- Registrar el evento sin el actor correcto.
- Exponer permisos demasiado amplios al suplente.
- Implementar el log como texto genérico sin contexto suficiente.

## 13. Decisión arquitectónica

Tratar al suplente como actor operativo temporal sobre una clase del titular.

El titular conserva la propiedad académica.
El suplente conserva trazabilidad de sus acciones.
La administración obtiene visibilidad histórica.

## 14. Siguiente paso técnico

Implementar primero la bitácora y los puntos de escritura, luego la vista administrativa de consulta, y al final los tests de regresión del flujo de suplencia.


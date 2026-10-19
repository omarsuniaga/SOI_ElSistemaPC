# Navegación opcional a la clase en curso

## Historia
Como maestro, quiero decidir si la aplicación abre mi clase en curso y poder
seleccionar cualquier otra clase sin que una redirección reemplace mi elección.

## Alcance y aceptación
- En Perfil → Navegación, mostrar el switch «Abrir automáticamente la clase en curso».
- Apagado por defecto; guardar por maestro en este navegador/dispositivo,
  también en modo Demo. No requiere tablas ni migraciones.
- Encendido: conservar el aviso cancelable de tres segundos para la primera
  clase en curso sin registrar. Como máximo un intento por maestro y carga
  de la aplicación; volver a Hoy no reinicia el automatismo.
- Apagado: no programar cuenta regresiva ni redirección; conservar las tarjetas
  y los indicadores de clase en curso.
- Cualquier navegación o selección manual cancela el retardo inicial y la
  cuenta regresiva, retira el aviso y tiene prioridad sobre el automatismo.
- Una carga de datos que termine después de cambiar de pantalla no puede
  iniciar una redirección. Tampoco puede hacerlo al cambiar de cuenta.
- Mantener el criterio actual: clases de hoy, en horario y sin registrar;
  no redirigir a clases pasadas pendientes ni a clases ya registradas.

## Tareas
- [x] Reproducir la redirección tardía con reloj controlado.
- [x] Encapsular preferencia y temporizadores; integrar cancelación con el router.
- [x] Añadir switch accesible en Perfil con guardado inmediato.
- [x] Verificar apagado/encendido, cancelación, persistencia y aislamiento.
- [ ] Ejecutar verificaciones y abrir PR para revisión.

## Validación
- 13 pruebas nuevas: reproducción previa en rojo y corrección en verde.
- 88 pruebas del área en verde (router, calendario, shell, Hoy y preferencias).
- Compilación, lint general y typecheck correctos.
- El control estructural R1/R3 ya falla en master: salida idéntica en el
  worktree base y en esta rama. No se modifica esquema ni baseline.
- Seguimiento: reconciliar esas deudas estructurales en una tarea separada
  antes de cualquier nueva migración; este arreglo no crea tablas.

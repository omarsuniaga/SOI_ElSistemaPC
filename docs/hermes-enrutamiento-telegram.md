# Enrutamiento inteligente de solicitudes (Hermes / Telegram)

Hermes recibe una solicitud en texto libre por Telegram, identifica el **departamento**
responsable y crea una **tarea institucional**. La tarea aparece automáticamente en el
portal del departamento y, si es `alta`/`critica`, dispara un aviso de WhatsApp
(trigger `fn_trigger_hermes_task_wa_alert`).

La lógica de clasificación es la misma que usa la web (`src/modules/hermes/api/clasificadorApi.js`).

## 1. Instrucción de clasificación (prompt para Gemini/Hermes)

> Sos el clasificador de solicitudes de "El Sistema Punta Cana". Dada una solicitud en
> texto libre, identificá qué DEPARTAMENTO debe atenderla y resumí la tarea.
>
> - **DIR** Dirección — decisiones ejecutivas, protocolo, alianzas, invitaciones.
> - **ACM** Académica — clases, repertorio, ensayos, pedagogía, progresos.
> - **ADM** Administración — inscripciones, datos de alumnos/maestros, personal.
> - **FIN** Financiero — pagos, cobros, presupuesto, relaciones de pago, viáticos, aranceles.
> - **LOG** Logística — instrumentos, inventario, comodatos, transporte, montaje.
> - **COM** Comunicaciones — difusión, prensa, redes, correos, piezas gráficas.
> - **TECNICO** Técnico — sonido, escenario, soporte técnico, mantenimiento.
>
> Devolvé SOLO un JSON: `{"departamento","titulo","descripcion","prioridad","confianza"}`
> con `prioridad ∈ baja|media|alta|critica`.

Ejemplo: *"necesito que me manden la relación de pago del mes de febrero"* → `FIN`.

## 2. Crear la tarea (Supabase MCP)

Una vez clasificado, Hermes inserta la tarea. El INSERT dispara el aviso de WhatsApp
para `alta`/`critica`. NO hay que tocar nada más: el portal del departamento ya la muestra.

```sql
insert into public.tareas_institucionales
  (titulo, descripcion, departamento, estado, prioridad)
values
  ('Enviar relación de pago de febrero',
   'Solicitud recibida por Telegram: relación de pago del mes de febrero.',
   'FIN', 'pendiente', 'alta');
```

`departamento` ∈ `DIR|ACM|ADM|FIN|LOG|COM|TECNICO` (enum `soi_departamento`).
`prioridad` ∈ `baja|media|alta|critica`. `estado` arranca en `pendiente`.

## 3. Resultado

- La tarea aparece en el portal del departamento (`renderTareasView({ departamento })`).
- Si es `alta`/`critica`, se encola un aviso de WhatsApp al encargado.
- El responsable y el correo del departamento se gestionan en **Portal ADM → Correos Departamentos**.

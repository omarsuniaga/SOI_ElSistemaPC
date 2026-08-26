# Testing - Dashboard Alertas de Asistencia

## PARTE A: Testing con Mock Data (Demo Mode)

### 1. Activar Demo Mode

En la consola del navegador (F12):
```javascript
localStorage.setItem('demo_mode', 'true')
```

O en `.env`:
```
VITE_DEMO_MODE=true
```

### 2. Navegar al Dashboard

1. Login en `/admin`
2. Ir a **Análisis → Dashboard Métricas**
3. Seleccionar tab **"Operaciones"**
4. Scroll down para ver la nueva sección **"Alertas de Asistencia"**

### 3. Testing Manual

#### Alumnos con Faltas
- [ ] Se cargan 3 alumnos con datos mock
- [ ] Filtro de período funciona (7/14/30/60 días)
- [ ] Columnas: Alumno | Faltas período | Total histórico | Clases | [Alertar]
- [ ] Click en [Alertar] abre modal de aprobación
- [ ] Preview de mensaje muestra correctamente
- [ ] Botón "Enviar por WhatsApp" funciona (muestra confirmación)

#### Clases sin Asistencia
- [ ] Se cargan 2 sesiones incompletas
- [ ] Columnas: Maestro | Clase | Fecha | Hora | [Recordar]
- [ ] Click en [Recordar] abre modal
- [ ] Preview de mensaje personalizado
- [ ] Envío simula correctamente

#### Integración HERMES
- [ ] Mensaje de confirmación dice: "HERMES procesa el envío en background"
- [ ] No hay errores en consola (F12)

---

## PARTE B: Después (Con BD Real)

Una vez creada la tabla `notificaciones_asistencia` en Supabase:

1. Desactivar demo mode: `localStorage.removeItem('demo_mode')`
2. HERMES polling leerá `notificaciones_asistencia` donde `estado='pendiente'`
3. Enviará WhatsApp realmente
4. Actualizará `estado='enviado'` y `fecha_envio`

---

## Datos Mock Incluidos

**Alumnos:**
- Juan García López: 3 faltas (Violines 1B)
- María Rodríguez: 2 faltas (Clarinete 2A)
- Carlos Martínez: 1 falta (Coro)

**Maestros:**
- Omar Suniaga (Violines 1B) - Viernes 15 ago
- María López (Clarinete 3A) - Jueves 14 ago

---

## Notas de Desarrollo

- Widget usa `attendanceAlertsWidget()` function
- Façade API en `metricasApi.js` maneja mock/real automáticamente
- Servicio `attendanceNotificationService.js` lista para HERMES
- Table `notificaciones_asistencia` será creada vía migration SQL

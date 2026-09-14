# SPEC: RLS y Permisos (Qué Puede Ver/Hacer Cada Rol)

## Código interno del cambio
`rls-permisos`

## Estado: PROPUESTA (Aprobación Requerida)

---

# 1. Descripción de Capacidad

El sistema debe garantizar que cada usuario (Maestro, ACM, ADM) pueda ver y hacer solo lo que su rol permite:

- **Maestros**: Ven confirmaciones que les aplican (por alcance). Pueden confirmar actividades. No pueden editar decisiones de otros o creadas por ACM.
- **ACM (Coordinador Académico)**: Ven todas las confirmaciones, pueden crear actividades, validar "no_sé", ver reporte agregado.
- **ADM (Administrador)**: Acceso de lectura a datos auditables. No modifican decisiones académicas sin autorización explícita.

Se implementan mediante **RLS policies** en Supabase sin usar `service_role` en frontend (siempre vía RPC con permisos expl­ícitos).

---

# 2. Roles y Permisos

| Rol | Tabla | SELECT | INSERT | UPDATE | DELETE | Notas |
|-----|-------|--------|--------|--------|--------|-------|
| **Maestro** | sesiones_clase | Propia | No | Sí (solo si confirmador) | No | Puede registrar asistencias, ver su emergente_id |
| | confirmaciones_emergentes | Aplica (por alcance) | Sí (propia) | Sí (propia) | No | Una confirmación por maestro+actividad |
| | registros_pendientes | Propia | No | Lectura | No | Bandeja de notificaciones |
| **ACM** | sesiones_clase | Todas | Sí (raíz) | Sí (auditar) | No | Crear actividades, no modificar clases |
| | confirmaciones_emergentes | Todas | No (RPC) | Sí (validar) | No | Valida "no_sé", cierra pendientes |
| | registros_pendientes | Todas | Sí (escalas) | Sí (estado) | No | Gestiona flujo de notificaciones |
| **ADM** | sesiones_clase | Todas | No | No | No | Lectura solo; auditoría |
| | confirmaciones_emergentes | Todas | No | No | No | Lectura solo; auditoría |
| | registros_pendientes | Todas | No | No | No | Lectura solo; auditoría |

---

# 3. Requisitos Funcionales

### R1: RLS Policy en `sesiones_clase`
- **SELECT**: Maestro ve solo sus propias sesiones (`maestro_id = auth.uid()`). ACM/ADM ven todas.
- **INSERT**: ACM puede insertar raíces (clase_id IS NULL). Maestros no pueden insertar raíces.
- **UPDATE**: Maestro puede actualizar sus propias sesiones (asistencias, estado). ACM puede auditar. ADM no actualiza.
- **DELETE**: Solo auditoría (SET NULL en foreign keys, no cascade).

### R2: RLS Policy en `confirmaciones_emergentes`
- **SELECT**: 
  - Maestro ve sus propias confirmaciones + confirmaciones donde `alcance` lo incluye (si la actividad aún no confirmó).
  - ACM ve todas.
  - ADM ve todas (lectura).
- **INSERT**: RPC `fn_confirmar_actividad_emergente()` ejecuta con permisos expl­ícitos; maestro no inserta directamente.
- **UPDATE**: 
  - Maestro puede actualizar su propia confirmación si aún está en estado 'pendiente'.
  - ACM puede validar ("no_se" → "validado" o "rechazado").
  - ADM no actualiza.
- **DELETE**: Nunca (auditoría).

### R3: RPC con Permisos Explícitos
- **`fn_confirmar_actividad_emergente(p_actividad_id, p_maestro_id, p_fecha, p_respuesta, p_observaciones)`**
  - Validaciones: Maestro solo puede confirmar sus propias actividades (check `auth.uid() = p_maestro_id`).
  - UPSERT idempotente en confirmaciones_emergentes.
  - Auditoría: Registra `respondido_por = auth.uid()`.

- **`fn_difundir_actividad_por_alcance(p_actividad_id, p_alcance_tipo, p_alcance_config, p_fecha)`**
  - Validación: Solo ACM puede ejecutar (check `auth.role = 'acm'` o `has_role('coordinador_academico')`).
  - Crea registros en registros_pendientes para maestros en alcance.

- **`fn_validar_confirmacion_acm(p_confirmacion_id, p_estado_validacion, p_observaciones)`**
  - Validación: Solo ACM puede ejecutar.
  - Actualiza estado_validacion de confirmación.

### R4: No `service_role` en Frontend
- Todas las escrituras usan RPC con políticas de RLS.
- Frontend conecta con `anon` o `authenticated` role (según sea público/privado).
- Never expone `service_role` en JavaScript.

---

# 4. Escenarios de Aceptación

### ESCENARIO 1: Maestro Solo Ve Sus Confirmaciones
```gherkin
Given maestro M1 autenticado
  And existe actividad A1 con alcance_tipo='institucion' (aplica a todos)
  And M2 confirmó "si" a A1
When M1 consulta confirmaciones_emergentes
Then SELECT devuelve:
  - Confirmación de M1 para A1 (si existe)
  - NO devuelve confirmación de M2 (no es su maestro_id)
And si intenta UPDATE de confirmación de M2:
  - RLS policy rechaza: "You can only update your own confirmations"
```

### ESCENARIO 2: ACM Ve Todas las Confirmaciones
```gherkin
Given ACM autenticado
When ACM consulta confirmaciones_emergentes
Then SELECT devuelve:
  - Todas las confirmaciones de todos los maestros
  - Incluyendo estado, observaciones, respondido_por, etc.
And puede ejecutar UPDATE:
  - ACTUALIZAR estado_validacion de una confirmación 'no_se' a 'validado'
  - ACTUALIZAR observaciones de auditoría
```

### ESCENARIO 3: ADM Solo Lee (Sin Escribir)
```gherkin
Given ADM autenticado
When ADM consulta confirmaciones_emergentes
Then SELECT devuelve todas las filas
And intenta INSERT:
  - RLS policy rechaza: "No INSERT permission for role 'admin'"
And intenta UPDATE:
  - RLS policy rechaza: "No UPDATE permission for role 'admin'"
And intenta DELETE:
  - RLS policy rechaza: "No DELETE permission for role 'admin'"
```

### ESCENARIO 4: Maestro Usa RPC Para Confirmar (No INSERT Directo)
```gherkin
Given maestro M1
When M1 intenta INSERT directo en confirmaciones_emergentes:
  - INSERT (actividad_id, maestro_id, fecha, respuesta, ...) VALUES (...)
Then RLS policy rechaza el INSERT
And M1 debe usar RPC:
  - SELECT fn_confirmar_actividad_emergente(p_actividad_id, p_maestro_id, p_fecha, 'si', null)
Then RPC válida:
  - auth.uid() = p_maestro_id (el maestro confirma sus propias actividades)
  - UPSERT ejecuta exitosamente
  - respondido_por = auth.uid() (automático)
```

### ESCENARIO 5: Maestro No Puede Crear Actividades Raíz
```gherkin
Given maestro M1 (no es ACM)
When M1 intenta INSERT en sesiones_clase con clase_id=NULL:
  - INSERT (clase_id, maestro_id, fecha, lugar, alcance_tipo, ...) 
    VALUES (NULL, M1.id, '2026-09-15', 'Teatro', 'institucion', ...)
Then RLS policy rechaza:
  - "Only ACM role can insert root sessions"
And solo ACM puede crear actividades raíz (clase_id IS NULL)
```

### ESCENARIO 6: ACM Puede Crear Actividad Raíz, Difundir, Validar
```gherkin
Given ACM autenticado
When ACM ejecuta en secuencia:
  1. INSERT en sesiones_clase (clase_id=NULL) → crea actividad raíz
  2. SELECT fn_difundir_actividad_por_alcance(...) → notifica maestros
  3. SELECT fn_validar_confirmacion_acm(confirmacion_id, 'validado', obs) → cierra "no_se"
Then:
  - Paso 1: RLS permite (ACM role)
  - Paso 2: RPC ejecuta con validación "ACM only" (auth.role = 'coordinador_academico')
  - Paso 3: RPC ejecuta con validación "ACM only"
```

### ESCENARIO 7: Maestro No Puede Validar Confirmaciones "No Sé"
```gherkin
Given maestro M1
  And existe confirmación CE1 con respuesta='no_se', estado_validacion='pendiente'
When M1 intenta:
  - SELECT fn_validar_confirmacion_acm(CE1.id, 'validado', 'Ok')
Then RPC rechaza:
  - "Only ACM role can validate"
And solo ACM puede cambiar estado_validacion a 'validado'
```

### ESCENARIO 8: Maestro No Puede Modificar Sesión de Otro Maestro
```gherkin
Given maestro M1 y M2
  And sesión SC1 de M2 (maestro_id = M2.id)
When M1 intenta UPDATE en SC1:
  - UPDATE sesiones_clase SET estado='registrada' WHERE id=SC1.id
Then RLS policy rechaza:
  - "You can only update sessions where maestro_id = your_id"
```

---

# 5. Políticas RLS Detalladas

### Policy: `sesiones_clase` - SELECT

```sql
CREATE POLICY "Maestro ve sus sesiones, ACM/ADM ve todas"
  ON sesiones_clase
  FOR SELECT
  USING (
    auth.uid() = maestro_id  -- Maestro ve sus propias
    OR auth.jwt()->'app_metadata'->>'role' IN ('coordinador_academico', 'admin')  -- ACM/ADM ven todas
  );
```

### Policy: `sesiones_clase` - INSERT

```sql
CREATE POLICY "Solo ACM crea sesiones raíz"
  ON sesiones_clase
  FOR INSERT
  WITH CHECK (
    auth.jwt()->'app_metadata'->>'role' = 'coordinador_academico'
    AND clase_id IS NULL  -- Solo raíces
  );
```

### Policy: `sesiones_clase` - UPDATE

```sql
CREATE POLICY "Maestro actualiza sus sesiones, ACM audita"
  ON sesiones_clase
  FOR UPDATE
  USING (
    auth.uid() = maestro_id  -- Maestro sus propias
    OR auth.jwt()->'app_metadata'->>'role' = 'coordinador_academico'  -- ACM audita
  )
  WITH CHECK (
    auth.uid() = maestro_id  -- Maestro sus propias
    OR auth.jwt()->'app_metadata'->>'role' = 'coordinador_academico'  -- ACM audita
  );
```

### Policy: `confirmaciones_emergentes` - SELECT

```sql
CREATE POLICY "Maestro ve sus confirmaciones + en-alcance, ACM/ADM ven todas"
  ON confirmaciones_emergentes
  FOR SELECT
  USING (
    auth.uid() = maestro_id  -- Maestro ve sus confirmaciones
    OR auth.jwt()->'app_metadata'->>'role' IN ('coordinador_academico', 'admin')  -- ACM/ADM ven todas
    OR (  -- Maestro ve actividades no confirmadas que le aplican por alcance
      EXISTS (
        SELECT 1 FROM sesiones_clase sc
        WHERE sc.id = actividad_id
          AND sc.maestro_id != auth.uid()  -- No es su actividad
          AND NOT EXISTS (
            SELECT 1 FROM confirmaciones_emergentes ce2
            WHERE ce2.actividad_id = sc.id
              AND ce2.maestro_id = auth.uid()
          )  -- Aún no confirmó
          AND sc.alcance_tipo = 'institucion'  -- Aplica por institución
      )
    )
  );
```

### Policy: `confirmaciones_emergentes` - INSERT (via RPC solo)

```sql
CREATE POLICY "No INSERT directo; solo via RPC"
  ON confirmaciones_emergentes
  FOR INSERT
  WITH CHECK (false);  -- Rechaza todo INSERT directo
```

### Policy: `confirmaciones_emergentes` - UPDATE

```sql
CREATE POLICY "Maestro actualiza sus confirmaciones pendientes, ACM valida"
  ON confirmaciones_emergentes
  FOR UPDATE
  USING (
    (auth.uid() = maestro_id AND estado_validacion = 'pendiente')  -- Maestro cambia su respuesta si está pendiente
    OR auth.jwt()->'app_metadata'->>'role' = 'coordinador_academico'  -- ACM valida estado_validacion
  )
  WITH CHECK (
    (auth.uid() = maestro_id AND estado_validacion = 'pendiente')
    OR auth.jwt()->'app_metadata'->>'role' = 'coordinador_academico'
  );
```

### Policy: `confirmaciones_emergentes` - DELETE

```sql
CREATE POLICY "Nunca DELETE directo; solo auditoría"
  ON confirmaciones_emergentes
  FOR DELETE
  USING (false);  -- Rechaza todo DELETE
```

---

# 6. RPC Protegidas

### RPC: `fn_confirmar_actividad_emergente`

```sql
CREATE OR REPLACE FUNCTION fn_confirmar_actividad_emergente(
  p_actividad_id UUID,
  p_maestro_id UUID,
  p_fecha DATE,
  p_respuesta TEXT,
  p_observaciones TEXT DEFAULT NULL
)
RETURNS confirmaciones_emergentes AS $$
DECLARE
  v_confirmed_row confirmaciones_emergentes;
BEGIN
  -- Validación: Maestro solo confirma sus propias actividades
  IF auth.uid() != p_maestro_id THEN
    RAISE EXCEPTION 'No permission to confirm for another maestro';
  END IF;

  -- Validación: Respuesta válida
  IF p_respuesta NOT IN ('si', 'no', 'no_aplica', 'no_se') THEN
    RAISE EXCEPTION 'Invalid respuesta value: %', p_respuesta;
  END IF;

  -- UPSERT (idempotente)
  INSERT INTO confirmaciones_emergentes (actividad_id, maestro_id, fecha, respuesta, estado_validacion, respondido_por, respondido_at, observaciones)
  VALUES (p_actividad_id, p_maestro_id, p_fecha, p_respuesta, 'pendiente', auth.uid(), NOW(), p_observaciones)
  ON CONFLICT (actividad_id, maestro_id, fecha) 
  DO UPDATE SET 
    respuesta = p_respuesta,
    respondido_at = NOW(),
    observaciones = p_observaciones
  RETURNING * INTO v_confirmed_row;

  RETURN v_confirmed_row;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### RPC: `fn_difundir_actividad_por_alcance`

```sql
CREATE OR REPLACE FUNCTION fn_difundir_actividad_por_alcance(
  p_actividad_id UUID,
  p_alcance_tipo TEXT,
  p_alcance_config JSONB,
  p_fecha DATE
)
RETURNS TABLE (maestro_ids UUID[]) AS $$
DECLARE
  v_expanded_maestros UUID[];
BEGIN
  -- Validación: Solo ACM puede ejecutar
  IF auth.jwt()->>'app_metadata'->>'role' != 'coordinador_academico' THEN
    RAISE EXCEPTION 'Only ACM role can execute this function';
  END IF;

  -- Lógica de expansión (delegada a SPEC-02 activity-scope-filtering)
  -- Retorna array de maestro_ids a notificar
  SELECT array_agg(DISTINCT maestro_id) INTO v_expanded_maestros
  FROM (
    SELECT DISTINCT maestro_id FROM sesiones_clase
    WHERE fecha = p_fecha
      AND clase_id IS NOT NULL
      -- ... aplicar lógica de alcance (ver SPEC-02)
  ) exp;

  -- Crear registros en registros_pendientes para cada maestro
  INSERT INTO registros_pendientes (maestro_id, tipo, estado, notification_state, ...)
  SELECT m, 'confirmacion_actividad_requerida', 'pendiente', 'AMARILLO', ...
  FROM UNNEST(v_expanded_maestros) m
  ON CONFLICT DO NOTHING;

  RETURN QUERY SELECT v_expanded_maestros;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### RPC: `fn_validar_confirmacion_acm`

```sql
CREATE OR REPLACE FUNCTION fn_validar_confirmacion_acm(
  p_confirmacion_id UUID,
  p_estado_validacion TEXT,
  p_observaciones TEXT DEFAULT NULL
)
RETURNS confirmaciones_emergentes AS $$
DECLARE
  v_updated_row confirmaciones_emergentes;
BEGIN
  -- Validación: Solo ACM puede ejecutar
  IF auth.jwt()->>'app_metadata'->>'role' != 'coordinador_academico' THEN
    RAISE EXCEPTION 'Only ACM role can validate confirmations';
  END IF;

  -- Validación: Estado válido
  IF p_estado_validacion NOT IN ('pendiente', 'validado', 'rechazado') THEN
    RAISE EXCEPTION 'Invalid estado_validacion: %', p_estado_validacion;
  END IF;

  -- UPDATE con auditoría
  UPDATE confirmaciones_emergentes
  SET 
    estado_validacion = p_estado_validacion,
    observaciones = COALESCE(p_observaciones, observaciones),
    updated_at = NOW()
  WHERE id = p_confirmacion_id
  RETURNING * INTO v_updated_row;

  IF v_updated_row IS NULL THEN
    RAISE EXCEPTION 'Confirmation not found: %', p_confirmacion_id;
  END IF;

  RETURN v_updated_row;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

# 7. Validación y Auditoría

### V1: Role Válido
- Roles permitidos: 'maestro', 'coordinador_academico', 'admin'.
- Otros roles: Acceso denegado.

### V2: Metadata Consistente
- `auth.jwt()->>'app_metadata'->>'role'` debe coincidir con tabla `users.role`.
- Si diverge, log WARN y valida contra tabla.

### V3: Auditoría de Cambios
- Cada UPDATE en confirmaciones_emergentes registra: `updated_at`, `updated_by` (implícito en JWT).
- Histórico de cambios: Usar trigger para copia en tabla `confirmaciones_emergentes_audit` (fuera del scope de este spec).

---

# 8. No Alcances

- Roles personalizados por institución (se define centralmente).
- Permisos granulares por grupo/programa (futura extensión).
- Audit logging en tabla separada (implementado en fase design/apply si es necesario).

---

# 9. Dependencias

- Supabase Auth (auth.uid(), auth.jwt()).
- Tabla `users` con columna `role` (ya existe).
- Tabla `confirmaciones_emergentes` (SPEC-01).
- Tabla `sesiones_clase` con nuevas columnas (SPEC-01).
- Tabla `registros_pendientes` (ya existe; usado para notificaciones).
- RPC `fn_difundir_actividad_por_alcance()` (SPEC-02).

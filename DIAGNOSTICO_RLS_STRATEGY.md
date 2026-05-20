# Estrategia de Resolución de RLS en Panel Admin

## 📊 Auditoría Actual (2026-05-19)

### Tablas con RLS Problémática (Bloquean Admin)
- **asistencias** - 2 policies (Maestros ✓, Admin ✓ pero incompleta)
- **sesiones_clase** - 5 policies (Maestros ✓, Admin ✓ pero para READ solo)
- **observaciones_alumnos** - 0 policies ⚠️ (SIN RLS)
- **justificaciones** - 1 policy (Maestros solo)
- **contenidos_sesion** - 2 policies (Maestros solo)
- **permisos_maestros** - 1 policy (Maestros solo)

### Tablas SIN RLS (Riesgo de Seguridad)
- catalogos
- historial_estado_alumno
- observaciones_alumnos ⚠️
- periodos
- planificacion_nodos
- route_versions

---

## 🔴 Problema Raíz

Las políticas están diseñadas para **maestros** (`maestro_actual()` / `maestro_en_clase()`), NO para **admin**.

**Flujo actual:**
```
Panel Admin → Usuario autenticado → Rol "authenticated"
            ↓
        RLS verifica: ¿maestro? NO → BLOQUEADO
```

---

## ✅ Solución: Framework de RLS para Admin

### Paso 1: Crear función helper para detectar admin
```sql
CREATE OR REPLACE FUNCTION es_admin() 
RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt()->>'role' = 'admin' OR 
          auth.jwt()->>'user_role' = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Paso 2: Patrón estándar de RLS por tabla

Para CADA tabla sensible en admin:

```sql
-- READ: Admin lee todo
CREATE POLICY "{tabla}_admin_read"
  ON {tabla}
  FOR SELECT
  USING (es_admin() OR {condición_maestro_existente});

-- UPDATE: Admin actualiza todo
CREATE POLICY "{tabla}_admin_update"
  ON {tabla}
  FOR UPDATE
  USING (es_admin() OR {condición_maestro_existente})
  WITH CHECK (es_admin() OR {condición_maestro_existente});

-- DELETE: Admin elimina todo
CREATE POLICY "{tabla}_admin_delete"
  ON {tabla}
  FOR DELETE
  USING (es_admin() OR {condición_maestro_existente});
```

### Paso 3: Enable RLS en tablas sin RLS

```sql
-- Habilitar RLS
ALTER TABLE observaciones_alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE periodos ENABLE ROW LEVEL SECURITY;
-- ... etc

-- Agregar policies básicas
CREATE POLICY "obs_alumnos_admin_all" 
  ON observaciones_alumnos FOR ALL USING (es_admin());
```

---

## 🎯 Plan de Ejecución

### Fase 1: Crítica (HOY)
Tablas bloqueando panel admin ahora:
1. ✅ asistencias
2. ✅ sesiones_clase  
3. ⏳ observaciones_alumnos
4. ⏳ justificaciones
5. ⏳ contenidos_sesion

**SQL a ejecutar:**
```sql
-- 1. Crear función helper
CREATE OR REPLACE FUNCTION es_admin() 
RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt()->>'role' = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Asistencias
DROP POLICY IF EXISTS "Admin reads all asistencias" ON asistencias;
CREATE POLICY "asistencias_admin_all" 
  ON asistencias FOR ALL 
  USING (es_admin() OR EXISTS(SELECT 1 FROM sesiones_clase s WHERE s.id = sesion_clase_id AND (s.maestro_id = maestro_actual() OR maestro_en_clase(s.clase_id))));

-- 3. Sesiones Clase
DROP POLICY IF EXISTS "Admin reads all sesiones" ON sesiones_clase;
CREATE POLICY "sesiones_admin_all"
  ON sesiones_clase FOR ALL
  USING (es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id));

-- 4. Observaciones Alumnos
ALTER TABLE observaciones_alumnos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "obs_admin_all"
  ON observaciones_alumnos FOR ALL
  USING (es_admin());

-- 5. Justificaciones
CREATE POLICY IF NOT EXISTS "justificaciones_admin_all"
  ON justificaciones FOR ALL
  USING (es_admin() OR maestro_en_clase(clase_id));

-- 6. Contenidos Sesion
CREATE POLICY IF NOT EXISTS "contenidos_admin_all"
  ON contenidos_sesion FOR ALL
  USING (es_admin());
```

### Fase 2: Preventiva (Next Sprint)
Auditar y agregar admin-read a TODAS las tablas:
- [ ] Crear checklist de 60+ tablas
- [ ] Generar SQL automático para cada una
- [ ] Ejecutar por categoría (asistencias, planificación, etc)
- [ ] Verificar en staging

### Fase 3: Documentación
- [ ] Crear README: "RLS Policies by Module"
- [ ] Template SQL para nuevas tablas
- [ ] Runbook: "Cuando aparezca error RLS..."

---

## 🚨 Detección: Cómo saber si es error RLS

```
Error pattern: "No rows returned" pero datos existen
Síntomas:
- Vista admin vacía pero datos en DB
- Logs: SELECT * FROM tabla → 0 rows
- Maestro ve su data, pero admin no
- getReporteCompleto() trae {}, pero query directa trae datos

Solución: Revisar pg_policies para la tabla
```

---

## 📋 Checklist por Módulo

### ASISTENCIAS
- [x] asistencias - Policy agregada
- [ ] observaciones_alumnos - Habilitar RLS
- [ ] justificaciones - Agregar admin policy
- [ ] contenidos_sesion - Agregar admin policy

### PLANIFICACIÓN
- [ ] planificacion - Revisar
- [ ] plan_clases - Revisar
- [ ] plan_temas - Revisar

### RUTAS
- [ ] routes - Revisar
- [ ] blocks - Revisar
- [ ] nodes - Revisar
- [ ] levels - Revisar

---

## 💡 Próximo Paso

Ejecutar **Fase 1** ahora para desbloquear panel asistencias admin.

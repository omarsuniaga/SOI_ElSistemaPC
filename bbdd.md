## Table `planificacion`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `programa_id` | `uuid` |  |
| `nivel` | `int4` |  |
| `titulo` | `text` |  |
| `contenidos` | `jsonb` |  Nullable |
| `tecnicas` | `jsonb` |  Nullable |
| `obras` | `jsonb` |  Nullable |
| `escalas_arpegios` | `jsonb` |  Nullable |
| `evaluaciones` | `jsonb` |  Nullable |
| `fecha_inicio` | `date` |  |
| `fecha_fin` | `date` |  Nullable |
| `activo` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `ausencias`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `maestro_id` | `uuid` |  |
| `fecha_ausencia` | `date` |  |
| `motivo` | `text` |  |
| `reemplazo_maestro_id` | `uuid` |  Nullable |
| `clase_alternativa` | `text` |  Nullable |
| `notificacion_enviada` | `bool` |  Nullable |
| `estado` | `text` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `email` | `text` |  |
| `nombre_completo` | `text` |  Nullable |
| `rol` | `text` |  |
| `avatar_url` | `text` |  Nullable |
| `activo` | `bool` |  Nullable |
| `estado` | `text` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `solicitud_instrumento` | `text` |  Nullable |
| `solicitud_resena` | `text` |  Nullable |

## Table `programas`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `nombre` | `text` |  Unique |
| `descripcion` | `text` |  Nullable |
| `activo` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `nivel` | `text` |  Nullable |
| `codigo` | `text` |  Nullable Unique |
| `duracion_anios` | `numeric` |  Nullable |

## Table `niveles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `programa_id` | `uuid` |  |
| `nombre` | `text` |  |
| `descripcion` | `text` |  Nullable |
| `orden` | `int4` |  |
| `duracion_estimada_meses` | `int4` |  Nullable |
| `criterios_promocion` | `jsonb` |  Nullable |
| `activo` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `salones`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `nombre` | `text` |  Unique |
| `ubicacion` | `text` |  Nullable |
| `descripcion` | `text` |  Nullable |
| `activo` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `capacidad` | `int4` |  Nullable |
| `codigo_salon` | `text` |  Nullable Unique |
| `piso` | `int4` |  Nullable |
| `condicion_fisica` | `text` |  Nullable |
| `equipamiento` | `jsonb` |  Nullable |
| `responsable_id` | `uuid` |  Nullable |
| `is_active` | `bool` |  Nullable |

## Table `maestros`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Nullable Unique |
| `nombre_completo` | `text` |  |
| `especialidad` | `text` |  |
| `tipo_maestro` | `text` |  Nullable |
| `habilidades` | `_text` |  Nullable |
| `disponibilidad` | `jsonb` |  |
| `tlf` | `text` |  Nullable |
| `correo` | `text` |  Unique |
| `resena` | `text` |  Nullable |
| `puede_ser_suplente` | `bool` |  Nullable |
| `activo` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `especialidades` | `_text` |  Nullable |
| `es_admin` | `bool` |  Nullable |

## Table `alumnos`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Nullable Unique |
| `nombre_completo` | `text` |  |
| `fecha_nacimiento` | `date` |  Nullable |
| `instrumento_principal` | `text` |  Nullable |
| `nivel_actual` | `int4` |  Nullable |
| `fecha_ingreso` | `date` |  Nullable |
| `padre_nombre` | `text` |  Nullable |
| `madre_nombre` | `text` |  Nullable |
| `representante_nombre` | `text` |  Nullable |
| `representante_cedula` | `text` |  Nullable |
| `representante_tlf` | `text` |  Nullable |
| `correo_representante` | `text` |  Nullable |
| `tlf_alumno` | `text` |  Nullable |
| `direccion` | `text` |  Nullable |
| `foto_url` | `text` |  Nullable |
| `observaciones_generales` | `text` |  Nullable |
| `activo` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `nivel` | `text` |  |
| `condiciones_medicas` | `text` |  Nullable |
| `alergias` | `text` |  Nullable |
| `medicamentos` | `text` |  Nullable |
| `contacto_emergencia_nombre` | `text` |  Nullable |
| `contacto_emergencia_telefono` | `text` |  Nullable |
| `contacto_emergencia_parentesco` | `text` |  Nullable |
| `familiar_nombre` | `text` |  Nullable |
| `familiar_telefono` | `text` |  Nullable |
| `familiar_parentesco` | `text` |  Nullable |
| `sabe_leer` | `bool` |  Nullable |
| `sabe_escribir` | `bool` |  Nullable |
| `nacionalidad` | `text` |  Nullable |
| `tiene_pasaporte` | `bool` |  Nullable |
| `como_se_entero` | `text` |  Nullable |
| `ubicacion_maps_url` | `text` |  Nullable |
| `municipio_residencia` | `text` |  Nullable |
| `sector_calle_numero` | `text` |  Nullable |
| `madre_cedula` | `text` |  Nullable |
| `madre_tlf_whatsapp` | `text` |  Nullable |
| `padre_cedula` | `text` |  Nullable |
| `padre_tlf_whatsapp` | `text` |  Nullable |
| `otro_responsable_nombre` | `text` |  Nullable |
| `otro_responsable_cedula` | `text` |  Nullable |
| `otro_responsable_tlf` | `text` |  Nullable |
| `contacto_emergencia_2_nombre` | `text` |  Nullable |
| `contacto_emergencia_2_telefono` | `text` |  Nullable |
| `familia_monoparental` | `bool` |  Nullable |
| `beneficiario_subsidio_estado` | `bool` |  Nullable |
| `subsidio_descripcion` | `text` |  Nullable |
| `apoyo_actividades` | `text` |  Nullable |
| `tiene_conocimientos_musicales` | `bool` |  Nullable |
| `instrumento_previo` | `text` |  Nullable |
| `nivel_lectura_musical` | `text` |  Nullable |
| `interes_musical` | `text` |  Nullable |
| `instrumento_interes` | `text` |  Nullable |
| `requiere_iniciacion_musical` | `bool` |  Nullable |
| `fecha_ingreso_iniciacion` | `date` |  Nullable |
| `por_que_unirse` | `text` |  Nullable |
| `sentimiento_musica_clasica` | `text` |  Nullable |
| `sentimiento_aprender_instrumento` | `text` |  Nullable |
| `aspiracion_instrumento` | `text` |  Nullable |
| `musico_favorito` | `text` |  Nullable |
| `preferencia_aprendizaje_musical` | `text` |  Nullable |
| `tiene_alergias` | `bool` |  Nullable |
| `alergias_descripcion` | `text` |  Nullable |
| `tiene_condicion_transmisible` | `bool` |  Nullable |
| `condicion_transmisible_desc` | `text` |  Nullable |
| `tiene_alergia_medicamento` | `bool` |  Nullable |
| `alergia_medicamento_desc` | `text` |  Nullable |
| `impedimento_social` | `bool` |  Nullable |
| `problemas_conducta` | `text` |  Nullable |
| `centro_estudios` | `text` |  Nullable |
| `grado_nivel` | `text` |  Nullable |
| `padres_en_vida` | `text` |  Nullable |
| `acepta_beca_4500` | `bool` |  Nullable |
| `fecha_aceptacion_beca` | `timestamptz` |  Nullable |
| `acepta_pago_600` | `bool` |  Nullable |
| `fecha_aceptacion_pago` | `timestamptz` |  Nullable |
| `autoriza_fotos_redes` | `bool` |  Nullable |
| `representante_parentesco` | `text` |  Nullable |
| `exento_mensualidad` | `bool` |  |
| `familia_id` | `uuid` |  Nullable |
| `mora_flag` | `bool` |  |
| `bloqueo_certificado` | `bool` |  |
| `bloqueo_evento` | `bool` |  |
| `abandono_score` | `numeric` |  Nullable |
| `genero` | `text` |  Nullable |
| `promedio_notas` | `numeric` |  Nullable |

## Table `clases`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `nombre` | `text` |  |
| `programa_id` | `uuid` |  Nullable |
| `nivel_id` | `uuid` |  Nullable |
| `maestro_principal_id` | `uuid` |  Nullable |
| `maestro_suplente_id` | `uuid` |  Nullable |
| `tipo_clase` | `text` |  Nullable |
| `instrumento` | `text` |  Nullable |
| `descripcion` | `text` |  Nullable |
| `capacidad_maxima` | `int4` |  Nullable |
| `activo` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `estado` | `varchar` |  Nullable |
| `maestro_id` | `uuid` |  Nullable |
| `plan_estudio` | `text` |  Nullable |
| `modalidad` | `text` |  Nullable |
| `salon` | `text` |  Nullable |
| `route_version_id` | `uuid` |  Nullable |
| `maestro_auxiliar_id` | `uuid` |  Nullable |
| `ruta_id` | `uuid` |  Nullable |
| `whatsapp_group_jid` | `text` |  Nullable |
| `es_clase_iniciacion` | `bool` |  |
| `necesita_revision` | `bool` |  |
| `revision_motivo` | `text` |  Nullable |

## Table `horarios`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clase_id` | `uuid` |  |
| `maestro_id` | `uuid` |  |
| `salon_id` | `uuid` |  |
| `dia_semana` | `int4` |  |
| `hora_inicio` | `time` |  |
| `hora_fin` | `time` |  |
| `activo` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `alumnos_programas`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `alumno_id` | `uuid` |  |
| `programa_id` | `uuid` |  |
| `fecha_inscripcion` | `date` |  Nullable |
| `activo` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `periodo_id` | `uuid` |  Nullable |
| `calificacion` | `numeric` |  Nullable |
| `estado` | `text` |  |
| `fuente` | `text` |  Nullable |
| `requiere_verificacion` | `bool` |  |

## Table `alumnos_clases`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `alumno_id` | `uuid` |  |
| `clase_id` | `uuid` |  |
| `fecha_inscripcion` | `date` |  Nullable |
| `activo` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `hora_inicio` | `time` |  Nullable |
| `hora_fin` | `time` |  Nullable |
| `dia` | `text` |  Nullable |

## Table `sesiones_clase`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clase_id` | `uuid` |  Nullable |
| `horario_id` | `uuid` |  Nullable |
| `maestro_id` | `uuid` |  |
| `salon_id` | `uuid` |  Nullable |
| `fecha` | `date` |  |
| `hora_inicio` | `time` |  Nullable |
| `hora_fin` | `time` |  Nullable |
| `tema_principal` | `text` |  Nullable |
| `contenidos_trabajados` | `jsonb` |  Nullable |
| `observaciones_generales` | `text` |  Nullable |
| `estado` | `text` |  |
| `cerrada_en` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `borrador` | `bool` |  Nullable |
| `contenido` | `text` |  Nullable |
| `contenido_dsl` | `text` |  Nullable |
| `asistencia` | `jsonb` |  Nullable |
| `es_codocencia` | `bool` |  Nullable |
| `actividad` | `text` |  Nullable |
| `maestro_auxiliar_id` | `uuid` |  Nullable |
| `motivo` | `text` |  Nullable |
| `emergente_id` | `uuid` |  Nullable |
| `node_id` | `uuid` |  Nullable |
| `node_origen` | `text` |  Nullable |
| `node_codigo` | `text` |  Nullable |

## Table `modulos`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `programa_id` | `uuid` |  |
| `nivel_id` | `uuid` |  |
| `nombre` | `text` |  |
| `descripcion` | `text` |  Nullable |
| `orden` | `int4` |  |
| `duracion_estimada_semanas` | `int4` |  Nullable |
| `requisito_modulo_id` | `uuid` |  Nullable |
| `porcentaje_aprobacion` | `numeric` |  Nullable |
| `activo` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `unidades`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `modulo_id` | `uuid` |  |
| `nombre` | `text` |  |
| `descripcion` | `text` |  Nullable |
| `orden` | `int4` |  |
| `activo` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `ejercicios`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `unidad_id` | `uuid` |  |
| `nombre` | `text` |  |
| `descripcion` | `text` |  Nullable |
| `tipo_ejercicio` | `text` |  |
| `dificultad` | `int4` |  Nullable |
| `instrucciones` | `text` |  Nullable |
| `criterios_evaluacion` | `jsonb` |  Nullable |
| `contenido` | `jsonb` |  Nullable |
| `puntaje_maximo` | `numeric` |  Nullable |
| `puntaje_aprobacion` | `numeric` |  Nullable |
| `requiere_evidencia` | `bool` |  Nullable |
| `puntos_xp` | `int4` |  Nullable |
| `orden` | `int4` |  |
| `activo` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `alumnos_rutas`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `alumno_id` | `uuid` |  |
| `programa_id` | `uuid` |  |
| `nivel_id` | `uuid` |  |
| `fecha_inicio` | `date` |  Nullable |
| `fecha_fin_estimada` | `date` |  Nullable |
| `fecha_completado` | `date` |  Nullable |
| `estado` | `text` |  |
| `progreso_porcentaje` | `numeric` |  Nullable |
| `activo` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `alumnos_modulos`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `alumno_id` | `uuid` |  |
| `modulo_id` | `uuid` |  |
| `estado` | `text` |  |
| `porcentaje_completado` | `numeric` |  Nullable |
| `fecha_inicio` | `date` |  Nullable |
| `fecha_completado` | `date` |  Nullable |
| `intentos_totales` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `alumnos_ejercicios`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `alumno_id` | `uuid` |  |
| `ejercicio_id` | `uuid` |  |
| `estado` | `text` |  |
| `puntaje_actual` | `numeric` |  Nullable |
| `mejor_puntaje` | `numeric` |  Nullable |
| `intentos` | `int4` |  Nullable |
| `aprobado` | `bool` |  Nullable |
| `fecha_ultimo_intento` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `intentos_ejercicios`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `alumno_id` | `uuid` |  |
| `ejercicio_id` | `uuid` |  |
| `maestro_id` | `uuid` |  Nullable |
| `clase_id` | `uuid` |  Nullable |
| `sesion_clase_id` | `uuid` |  Nullable |
| `fecha` | `timestamptz` |  Nullable |
| `puntaje` | `numeric` |  |
| `aprobado` | `bool` |  Nullable |
| `rubrica` | `jsonb` |  Nullable |
| `observaciones` | `text` |  Nullable |
| `evidencia_url` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `planificaciones`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `programa_id` | `uuid` |  Nullable |
| `nivel_id` | `uuid` |  Nullable |
| `clase_id` | `uuid` |  |
| `maestro_id` | `uuid` |  |
| `titulo` | `text` |  |
| `descripcion` | `text` |  Nullable |
| `periodo_nombre` | `text` |  Nullable |
| `fecha_inicio` | `date` |  |
| `fecha_fin` | `date` |  Nullable |
| `contenidos` | `jsonb` |  Nullable |
| `tecnicas` | `jsonb` |  Nullable |
| `obras` | `jsonb` |  Nullable |
| `escalas_arpegios` | `jsonb` |  Nullable |
| `evaluaciones` | `jsonb` |  Nullable |
| `estado` | `text` |  Nullable |
| `activo` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `instrumento` | `text` |  Nullable |
| `objetivos_estructurados` | `jsonb` |  |
| `frecuencia_semanal` | `numeric` |  Nullable |
| `semanas_totales` | `int4` |  Nullable |
| `nivel_texto` | `text` |  Nullable |

## Table `contenidos_sesion`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `sesion_clase_id` | `uuid` |  |
| `planificacion_id` | `uuid` |  Nullable |
| `modulo_id` | `uuid` |  Nullable |
| `unidad_id` | `uuid` |  Nullable |
| `ejercicio_id` | `uuid` |  Nullable |
| `descripcion` | `text` |  Nullable |
| `nivel_logro` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `asistencias`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `sesion_clase_id` | `uuid` |  |
| `clase_id` | `uuid` |  |
| `alumno_id` | `uuid` |  |
| `fecha` | `date` |  |
| `estado` | `text` |  |
| `justificacion_texto` | `text` |  Nullable |
| `observaciones` | `text` |  Nullable |
| `registrado_por` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `periodo_id` | `uuid` |  Nullable |
| `marked_at` | `timestamptz` |  Nullable |

## Table `progresos`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `alumno_id` | `uuid` |  |
| `clase_id` | `uuid` |  |
| `sesion_clase_id` | `uuid` |  Nullable |
| `asistencia_id` | `uuid` |  Nullable |
| `ejercicio_id` | `uuid` |  Nullable |
| `maestro_id` | `uuid` |  Nullable |
| `fecha_evaluacion` | `date` |  |
| `indicadores` | `jsonb` |  |
| `estado_cualitativo` | `text` |  Nullable |
| `calificacion` | `numeric` |  Nullable |
| `evaluacion_tipo` | `text` |  Nullable |
| `observaciones` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `periodo_id` | `uuid` |  Nullable |
| `contenido_dsl` | `text` |  Nullable |
| `objetivo_id` | `uuid` |  Nullable |

## Table `observaciones_alumnos`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `alumno_id` | `uuid` |  |
| `maestro_id` | `uuid` |  Nullable |
| `clase_id` | `uuid` |  Nullable |
| `sesion_clase_id` | `uuid` |  Nullable |
| `tipo` | `text` |  Nullable |
| `observacion` | `text` |  |
| `requiere_seguimiento` | `bool` |  Nullable |
| `fecha` | `date` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `titulo` | `text` |  Nullable |
| `descripcion` | `text` |  Nullable |
| `prioridad` | `text` |  |
| `estado` | `text` |  |
| `fecha_observacion` | `date` |  Nullable |
| `seguimiento_fecha` | `date` |  Nullable |
| `seguimiento_observacion` | `text` |  Nullable |

## Table `xp_log`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `alumno_id` | `uuid` |  |
| `cantidad` | `int4` |  |
| `concepto` | `text` |  |
| `referencia_tipo` | `text` |  Nullable |
| `referencia_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `rachas`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `alumno_id` | `uuid` | Primary |
| `racha_actual` | `int4` |  Nullable |
| `racha_maxima` | `int4` |  Nullable |
| `ultima_fecha_activa` | `date` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `logros`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `nombre` | `text` |  Unique |
| `descripcion` | `text` |  Nullable |
| `criterio` | `jsonb` |  Nullable |
| `icono` | `text` |  Nullable |
| `activo` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `alumnos_logros`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `alumno_id` | `uuid` | Primary |
| `logro_id` | `uuid` | Primary |
| `obtenido_en` | `timestamptz` |  Nullable |

## Table `registros_pendientes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `maestro_id` | `uuid` |  |
| `sesion_clase_id` | `uuid` |  Nullable |
| `tipo` | `text` |  |
| `prioridad` | `text` |  Nullable |
| `estado` | `text` |  Nullable |
| `fecha_limite` | `timestamptz` |  Nullable |
| `mensaje` | `text` |  |
| `deep_link` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `resuelto_at` | `timestamptz` |  Nullable |
| `last_notified_at` | `timestamptz` |  Nullable |
| `notif_count` | `int4` |  Nullable |
| `notification_state` | `text` |  Nullable |

## Table `notificaciones`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `profile_id` | `uuid` |  Nullable |
| `registro_pendiente_id` | `uuid` |  Nullable |
| `tipo` | `text` |  Nullable |
| `titulo` | `text` |  |
| `mensaje` | `text` |  |
| `deep_link` | `text` |  Nullable |
| `estado` | `text` |  Nullable |
| `enviada_en` | `timestamptz` |  Nullable |
| `leida_en` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `escalation_level` | `int4` |  Nullable |
| `scheduled_for` | `timestamptz` |  Nullable |
| `dedup_key` | `text` |  Nullable |
| `clase_id` | `uuid` |  Nullable |

## Table `configuracion_recordatorios`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `profile_id` | `uuid` |  Unique |
| `recordatorios_activos` | `bool` |  Nullable |
| `push_activo` | `bool` |  Nullable |
| `email_activo` | `bool` |  Nullable |
| `hora_resumen_diario` | `time` |  Nullable |
| `dia_resumen_semanal` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `min_antes_clase` | `int4` |  Nullable |
| `min_post_clase_sin_registro` | `int4` |  Nullable |
| `horas_recordatorio_dia1` | `int4` |  Nullable |
| `horas_recordatorio_dia2` | `int4` |  Nullable |
| `alerta_pre_clase` | `bool` |  Nullable |
| `alerta_post_clase` | `bool` |  Nullable |
| `alerta_24h` | `bool` |  Nullable |
| `alerta_48h` | `bool` |  Nullable |

## Table `push_subscriptions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `profile_id` | `uuid` |  |
| `endpoint` | `text` |  Unique |
| `p256dh` | `text` |  |
| `auth` | `text` |  |
| `user_agent` | `text` |  Nullable |
| `activo` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `periodos`

Períodos académicos del año (ej: Trimestre I 2025)

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `nombre` | `text` |  |
| `fecha_inicio` | `date` |  |
| `fecha_fin` | `date` |  |
| `activo` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `cerrado` | `bool` |  |
| `cerrado_at` | `timestamptz` |  Nullable |
| `cerrado_por` | `uuid` |  Nullable |
| `observaciones_cierre` | `text` |  Nullable |

## Table `historial_estado_alumno`

Tracking de altas, bajas y reactivaciones de alumnos

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `alumno_id` | `uuid` |  |
| `estado` | `text` |  |
| `motivo` | `text` |  Nullable |
| `registrado_por` | `uuid` |  Nullable |
| `fecha` | `date` |  |
| `created_at` | `timestamptz` |  |

## Table `clase_horarios`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clase_id` | `uuid` |  |
| `dia` | `text` |  |
| `hora_inicio` | `time` |  |
| `hora_fin` | `time` |  |
| `salon_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `maestro_id` | `uuid` |  Nullable |

## Table `system_config`

Tabla de configuración del sistema - API keys, settings globales

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `key` | `varchar` | Primary |
| `value` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `clases_emergentes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `maestro_id` | `uuid` |  |
| `fecha` | `date` |  |
| `hora_inicio` | `time` |  Nullable |
| `hora_fin` | `time` |  Nullable |
| `clase_id` | `uuid` |  Nullable |
| `nombre_clase` | `text` |  Nullable |
| `motivo` | `text` |  Nullable |
| `contenido` | `text` |  Nullable |
| `observaciones` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `salon` | `text` |  Nullable |
| `grupo` | `text` |  Nullable |
| `instrumento` | `text` |  Nullable |
| `tipo` | `text` |  Nullable |
| `estado` | `text` |  Nullable |

## Table `maestro_tareas`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `maestro_id` | `uuid` |  |
| `alumno_id` | `uuid` |  Nullable |
| `sesion_id` | `uuid` |  Nullable |
| `tarea` | `text` |  |
| `fecha_recordatorio` | `date` |  Nullable |
| `completada` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `solicitudes_ausencia`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `maestro_id` | `uuid` |  |
| `fecha_ausencia` | `date` |  |
| `motivo` | `text` |  Nullable |
| `contenido_reemplazo` | `text` |  Nullable |
| `suplente_id` | `uuid` |  Nullable |
| `dinamica_trabajo` | `text` |  Nullable |
| `estado` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `clase_acceso_temporal`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clase_id` | `uuid` |  Nullable |
| `maestro_suplente_id` | `uuid` |  |
| `fecha_inicio` | `date` |  |
| `fecha_fin` | `date` |  |
| `activo` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `planificacion_nodos`

DEPRECATED: usar routes hierarchy

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `maestro_id` | `uuid` |  |
| `programa_id` | `uuid` |  Nullable |
| `codigo` | `text` |  Nullable |
| `nombre` | `text` |  Nullable |
| `descripcion` | `text` |  Nullable |
| `nivel` | `int4` |  Nullable |
| `bloque` | `int4` |  Nullable |
| `ponderacion` | `numeric` |  Nullable |
| `padre_id` | `uuid` |  Nullable |
| `estado` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `catalogos`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tipo` | `text` |  |
| `nombre` | `text` |  |
| `descripcion` | `text` |  Nullable |
| `codigo` | `text` |  Nullable |
| `categoria` | `text` |  Nullable |
| `orden` | `int4` |  Nullable |
| `activo` | `bool` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `routes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `instrument` | `text` |  |
| `description` | `text` |  Nullable |
| `status` | `route_status` |  |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `route_versions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `route_id` | `uuid` |  |
| `version` | `text` |  |
| `status` | `route_status` |  |
| `notes` | `text` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `published_at` | `timestamptz` |  Nullable |

## Table `blocks`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `route_version_id` | `uuid` |  |
| `name` | `text` |  |
| `level_from` | `int4` |  |
| `level_to` | `int4` |  |
| `objective` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `order_index` | `int4` |  |

## Table `levels`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `block_id` | `uuid` |  Nullable |
| `route_version_id` | `uuid` |  |
| `level_number` | `int4` |  |
| `name` | `text` |  |
| `main_objective` | `text` |  Nullable |
| `suggested_duration_value` | `int4` |  Nullable |
| `suggested_duration_unit` | `text` |  Nullable |
| `is_flexible_duration` | `bool` |  |
| `target_work` | `jsonb` |  Nullable |
| `unlock_criteria` | `jsonb` |  Nullable |
| `order_index` | `int4` |  |

## Table `nodes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `level_id` | `uuid` |  |
| `route_version_id` | `uuid` |  |
| `name` | `text` |  |
| `type` | `text` |  |
| `is_critical` | `bool` |  |
| `is_required` | `bool` |  |
| `objective` | `text` |  Nullable |
| `order_index` | `int4` |  |
| `codigo` | `text` |  Nullable |

## Table `indicators`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `node_id` | `uuid` |  Nullable |
| `description` | `text` |  |
| `minimum_criteria` | `jsonb` |  Nullable |
| `is_required` | `bool` |  |
| `order_index` | `int4` |  |
| `nombre` | `text` |  Nullable |
| `activo` | `bool` |  |
| `objetivo_id` | `uuid` |  Nullable |

## Table `ausencias_maestros`

Registro de ausencias y solicitudes de permisos de los docentes

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `maestro_id` | `uuid` |  |
| `tipo_ausencia` | `text` |  |
| `fecha_inicio` | `date` |  |
| `fecha_fin` | `date` |  |
| `motivo` | `text` |  Nullable |
| `estado` | `text` |  Nullable |
| `urgencia` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `duracion_tipo` | `text` |  Nullable |
| `archivo_url` | `text` |  Nullable |
| `maestro_suplente_id` | `uuid` |  Nullable |
| `notificar_director` | `bool` |  Nullable |
| `director_notificacion_id` | `uuid` |  Nullable |
| `aprobado_por` | `uuid` |  Nullable |
| `decision_notas` | `text` |  Nullable |
| `decidido_en` | `timestamptz` |  Nullable |
| `revisado_por` | `uuid` |  Nullable |
| `revision_notas` | `text` |  Nullable |
| `revision_en` | `timestamptz` |  Nullable |
| `aprobado_en` | `timestamptz` |  Nullable |
| `rechazado_por` | `uuid` |  Nullable |
| `rechazado_en` | `timestamptz` |  Nullable |
| `razon_rechazo` | `text` |  Nullable |
| `intentos_solicitud` | `int4` |  Nullable |
| `fecha_solicitud_original` | `date` |  Nullable |

## Table `academic_plans`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `student_id` | `uuid` |  Nullable |
| `programa_id` | `uuid` |  Nullable |
| `status` | `text` |  Nullable |
| `started_at` | `timestamptz` |  Nullable |
| `completed_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `class_session_content_snapshots`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `session_id` | `uuid` |  |
| `node_id` | `uuid` |  Nullable |
| `indicator_id` | `uuid` |  Nullable |
| `node_name` | `text` |  Nullable |
| `indicator_description` | `text` |  Nullable |
| `is_critical` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `indicator_attempts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `student_id` | `uuid` |  |
| `indicator_id` | `uuid` |  |
| `session_id` | `uuid` |  Nullable |
| `result` | `text` |  Nullable |
| `observations` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `node_id` | `uuid` |  Nullable |
| `status` | `text` |  Nullable |
| `nota` | `int2` |  Nullable |
| `tarea` | `text` |  Nullable |
| `covered_date` | `date` |  Nullable |
| `covered_by_clase_id` | `uuid` |  Nullable |
| `created_by` | `uuid` |  |
| `updated_at` | `timestamptz` |  Nullable |

## Table `observaciones_sesion`

Raw DSL observations per session. es_borrador=true for auto-drafts, false for confirmed saves.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `sesion_id` | `uuid` |  |
| `maestro_id` | `uuid` |  |
| `contenido_raw` | `text` |  |
| `contenido_parsed` | `jsonb` |  Nullable |
| `es_borrador` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `contenido_ia_dsl` | `text` |  Nullable |
| `first_note_at` | `timestamptz` |  Nullable |
| `last_note_at` | `timestamptz` |  Nullable |
| `ai_fill_at` | `timestamptz` |  Nullable |

## Table `class_events`

Explicit class event record per session+student, linking academic plan, level, and methodology.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `teacher_id` | `uuid` |  |
| `student_id` | `uuid` |  |
| `academic_plan_id` | `uuid` |  Nullable |
| `session_id` | `uuid` |  Nullable |
| `level_id` | `uuid` |  Nullable |
| `event_date` | `date` |  |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `class_event_methodology`

Structured methodology notes for a class event (warmup, focus areas, repertoire, etc).

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `class_event_id` | `uuid` |  |
| `warmup` | `text` |  Nullable |
| `sound_focus` | `text` |  Nullable |
| `intonation_focus` | `text` |  Nullable |
| `main_node_id` | `uuid` |  Nullable |
| `technical_focus` | `text` |  Nullable |
| `study_used` | `text` |  Nullable |
| `repertoire_used` | `text` |  Nullable |
| `sight_reading_work` | `text` |  Nullable |
| `ear_training_work` | `text` |  Nullable |
| `closing_observation` | `text` |  Nullable |
| `homework_text` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `homework_assignments`

Formal homework assignments with optional node link and due date.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `class_event_id` | `uuid` |  |
| `student_id` | `uuid` |  |
| `teacher_id` | `uuid` |  |
| `node_id` | `uuid` |  Nullable |
| `description` | `text` |  |
| `due_date` | `date` |  Nullable |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `planning_documents`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `maestro_id` | `uuid` |  |
| `clase_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `file_name` | `text` |  |
| `file_url` | `text` |  |
| `file_type` | `text` |  Nullable |
| `file_size` | `int8` |  Nullable |
| `description` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `planned_content`

Teachers' daily planning of content to cover in each class session

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `maestro_id` | `uuid` |  |
| `clase_id` | `uuid` |  |
| `node_id` | `uuid` |  |
| `planned_date` | `date` |  Nullable |
| `covered` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `plan_clases`

DEPRECATED: usar routes/route_versions/blocks/levels/nodes/indicators

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `created_at` | `timestamptz` |  Nullable |
| `nombre` | `text` |  |
| `descripcion` | `text` |  Nullable |
| `activo` | `bool` |  Nullable |
| `maestro_id` | `uuid` |  Nullable |
| `clase_id` | `uuid` |  Nullable |

## Table `plan_niveles`

DEPRECATED: usar levels

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clase_id` | `uuid` |  Nullable |
| `nombre` | `text` |  |
| `numero_nivel` | `int4` |  |
| `objetivo_general` | `text` |  Nullable |
| `orden_index` | `int4` |  Nullable |

## Table `plan_temas`

DEPRECATED: usar nodes

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `nivel_id` | `uuid` |  Nullable |
| `nombre` | `text` |  |
| `tipo` | `text` |  Nullable |
| `es_critico` | `bool` |  Nullable |
| `orden_index` | `int4` |  Nullable |

## Table `plan_objetivos`

DEPRECATED: usar indicators

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tema_id` | `uuid` |  Nullable |
| `nombre` | `text` |  |
| `orden_index` | `int4` |  Nullable |

## Table `plan_indicadores`

DEPRECATED: usar indicators

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `objetivo_id` | `uuid` |  Nullable |
| `descripcion` | `text` |  |
| `es_requerido` | `bool` |  Nullable |
| `orden_index` | `int4` |  Nullable |

## Table `justificaciones`

Registro de justificaciones de inasistencias de alumnos

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `sesion_id` | `uuid` |  Nullable |
| `alumno_id` | `uuid` |  |
| `clase_id` | `uuid` |  |
| `fecha` | `date` |  |
| `motivo` | `text` |  |
| `evidencia_url` | `text` |  Nullable |
| `evidencia_base64` | `text` |  Nullable |
| `creado_por` | `uuid` |  Nullable |
| `estado` | `text` |  |
| `revisado_por` | `uuid` |  Nullable |
| `fecha_revision` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `categoria` | `text` |  Nullable |

## Table `permisos_maestros`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `maestro_id` | `uuid` |  Unique |
| `puede_registrar_alumnos` | `bool` |  Nullable |
| `puede_inscribir_clases` | `bool` |  Nullable |
| `concedido_por` | `uuid` |  Nullable |
| `creado_en` | `timestamptz` |  Nullable |
| `actualizado_en` | `timestamptz` |  Nullable |
| `permisos` | `_text` |  |
| `solicitudes` | `_text` |  |
| `fecha_inicio` | `date` |  |
| `fecha_fin` | `date` |  Nullable |
| `puede_crear_clases` | `bool` |  Nullable |

## Table `ausencias_clases_afectadas`

Junction table: tracks which classes are affected by an absence and replacement activities

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `ausencia_id` | `uuid` |  |
| `clase_id` | `uuid` |  |
| `actividad_reemplazo` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `ausencias_notificaciones`

Tracks notifications sent to directors about absence requests

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `ausencia_id` | `uuid` |  |
| `director_id` | `uuid` |  |
| `tipo` | `text` |  Nullable |
| `estado` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `leida_en` | `timestamptz` |  Nullable |
| `actuado_en` | `timestamptz` |  Nullable |

## Table `notification_trigger_logs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `execution_time` | `timestamp` |  Nullable |
| `status` | `text` |  |
| `maestros_processed` | `int4` |  Nullable |
| `notifications_created` | `int4` |  Nullable |
| `errors_count` | `int4` |  Nullable |
| `error_message` | `text` |  Nullable |
| `context` | `text` |  Nullable |
| `created_at` | `timestamp` |  Nullable |

## Table `ausencias_auditoria`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `ausencia_id` | `uuid` |  |
| `actor_id` | `uuid` |  |
| `accion` | `text` |  |
| `notas` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `solicitudes_permisos`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `maestro_id` | `uuid` |  |
| `tipos` | `jsonb` |  |
| `estado` | `text` |  Nullable |
| `creado_en` | `timestamptz` |  Nullable |
| `aprobado_en` | `timestamptz` |  Nullable |
| `aprobado_por` | `uuid` |  Nullable |
| `solicita_alumnos` | `bool` |  Nullable |
| `solicita_clases` | `bool` |  Nullable |
| `motivo_rechazo` | `text` |  Nullable |

## Table `curriculos`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `instrumento` | `text` |  |
| `nivel` | `text` |  |
| `descripcion` | `text` |  Nullable |
| `activo` | `bool` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `curriculo_pilares`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `curriculo_id` | `uuid` |  Nullable |
| `nombre` | `text` |  |
| `orden` | `int4` |  |

## Table `curriculo_objetivos`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `pilar_id` | `uuid` |  Nullable |
| `descripcion` | `text` |  |
| `orden` | `int4` |  |

## Table `cobertura_alumno_objetivo`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `alumno_id` | `uuid` |  Nullable |
| `objetivo_id` | `uuid` |  Nullable |
| `plan_id` | `uuid` |  Nullable |
| `maestro_id` | `uuid` |  Nullable |
| `fecha` | `date` |  |
| `confirmado` | `bool` |  Nullable |
| `nivel` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `schedule_runs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `periodo` | `text` |  Nullable |
| `config` | `jsonb` |  Nullable |
| `resultado` | `jsonb` |  Nullable |
| `metricas` | `jsonb` |  Nullable |
| `estado` | `text` |  |
| `applied_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `schedule_run_feedback`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `run_id` | `uuid` |  |
| `usuario_id` | `uuid` |  |
| `comentario` | `text` |  |
| `tipo` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `alumno_plan_entradas`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `alumno_id` | `uuid` |  |
| `maestro_id` | `uuid` |  |
| `tipo` | `text` |  |
| `titulo` | `text` |  |
| `descripcion` | `text` |  Nullable |
| `objetivo_id` | `uuid` |  Nullable |
| `nivel_referencia` | `text` |  Nullable |
| `sesion_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `postulantes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `nombre_completo` | `text` |  |
| `fecha_nacimiento` | `date` |  Nullable |
| `telefono_alumno` | `text` |  Nullable |
| `correo` | `text` |  Nullable |
| `nacionalidad` | `text` |  Nullable |
| `sector_calle_numero` | `text` |  Nullable |
| `madre_nombre` | `text` |  Nullable |
| `madre_tlf_whatsapp` | `text` |  Nullable |
| `padre_nombre` | `text` |  Nullable |
| `padre_tlf_whatsapp` | `text` |  Nullable |
| `representante_parentesco` | `text` |  Nullable |
| `acepta_pago_600` | `bool` |  |
| `autoriza_fotos_redes` | `bool` |  |
| `religion_limita` | `bool` |  |
| `disponibilidad_tiempo` | `text` |  Nullable |
| `tiene_transporte` | `bool` |  |
| `representantes_apoyan` | `bool` |  |
| `copia_cedula` | `bool` |  |
| `sincronizado_en` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `estado` | `text` |  |
| `alumno_id` | `uuid` |  Nullable |
| `fecha_postulacion` | `timestamptz` |  Nullable |
| `fecha_contacto` | `timestamptz` |  Nullable |
| `fecha_cita` | `timestamptz` |  Nullable |
| `notas_seguimiento` | `text` |  Nullable |
| `instrumento` | `text` |  Nullable |

## Table `rutas_contenido`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `instrumento` | `text` |  |
| `nivel` | `text` |  |
| `nombre` | `text` |  |
| `tipo` | `text` |  |
| `estado` | `text` |  |
| `descripcion` | `text` |  Nullable |
| `ruta_base_id` | `uuid` |  Nullable |
| `duracion_semanas` | `int4` |  |
| `creada_por` | `uuid` |  Nullable |
| `aprobada_por` | `uuid` |  Nullable |
| `fecha_aprobacion` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `ruta_contenido_objetivos`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `ruta_id` | `uuid` |  |
| `objetivo_id` | `uuid` |  Nullable |
| `descripcion` | `text` |  |
| `semana_inicio` | `int4` |  |
| `semana_fin` | `int4` |  |
| `orden` | `int4` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `indicator_sessions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `maestro_id` | `uuid` |  |
| `clase_id` | `uuid` |  |
| `fecha` | `date` |  |
| `descripcion` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `objetivo_id` | `uuid` |  |

## Table `indicator_session_students`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `indicator_session_id` | `uuid` |  |
| `alumno_id` | `uuid` |  |
| `nota_cualitativa` | `varchar` |  |
| `observaciones_individuales` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `asistencias_emergentes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `clase_emergente_id` | `uuid` |  |
| `alumno_id` | `uuid` |  Nullable |
| `alumno_nombre` | `text` |  |
| `estado` | `text` |  |
| `justificacion` | `text` |  Nullable |
| `observacion` | `text` |  Nullable |
| `fecha` | `date` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `solicitudes_necesidades`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `maestro_id` | `uuid` |  |
| `maestro_nombre` | `text` |  Nullable |
| `tipo_necesidad` | `text` |  |
| `categoria` | `text` |  Nullable |
| `titulo` | `text` |  |
| `descripcion` | `text` |  |
| `prioridad` | `text` |  |
| `cantidad` | `int4` |  Nullable |
| `area` | `text` |  Nullable |
| `observaciones` | `text` |  Nullable |
| `estado` | `text` |  |
| `respuesta_admin` | `text` |  Nullable |
| `fecha_solicitud` | `date` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `correlation_id` | `uuid` |  Nullable |
| `link_tienda` | `text` |  Nullable |
| `costo_estimado` | `numeric` |  Nullable |
| `presupuesto` | `numeric` |  Nullable |
| `departamento_actual` | `text` |  Nullable |
| `pre_aprobada_por` | `uuid` |  Nullable |
| `presupuestado_por` | `uuid` |  Nullable |

## Table `alumno_escolaridad`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `alumno_id` | `uuid` |  |
| `centro_estudios` | `text` |  Nullable |
| `grado_nivel` | `text` |  Nullable |
| `seccion` | `text` |  Nullable |
| `anio_escolar` | `text` |  Nullable |
| `director_institucion` | `text` |  Nullable |
| `cargo_director` | `text` |  Nullable |
| `telefono_centro` | `text` |  Nullable |
| `correo_centro` | `text` |  Nullable |
| `direccion_centro` | `text` |  Nullable |
| `activo` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `document_templates`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `nombre` | `text` |  |
| `tipo` | `text` |  |
| `descripcion` | `text` |  Nullable |
| `contenido` | `text` |  |
| `variables` | `_text` |  Nullable |
| `estado` | `text` |  |
| `version` | `int4` |  |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `document_batches`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tipo` | `text` |  |
| `titulo` | `text` |  |
| `grupo_tipo` | `text` |  Nullable |
| `grupo_id` | `uuid` |  Nullable |
| `grupo_nombre` | `text` |  Nullable |
| `actividad_nombre` | `text` |  Nullable |
| `fecha_actividad` | `date` |  Nullable |
| `lugar_actividad` | `text` |  Nullable |
| `total_alumnos` | `int4` |  Nullable |
| `total_generados` | `int4` |  Nullable |
| `total_con_advertencias` | `int4` |  Nullable |
| `total_excluidos` | `int4` |  Nullable |
| `estado` | `text` |  |
| `generado_por` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `generated_at` | `timestamptz` |  Nullable |

## Table `generated_documents`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `batch_id` | `uuid` |  Nullable |
| `template_id` | `uuid` |  Nullable |
| `tipo` | `text` |  |
| `titulo` | `text` |  |
| `alumno_id` | `uuid` |  Nullable |
| `alumno_nombre` | `text` |  Nullable |
| `grupo_nombre` | `text` |  Nullable |
| `actividad_nombre` | `text` |  Nullable |
| `contenido_final` | `text` |  |
| `variables_usadas` | `jsonb` |  Nullable |
| `variables_faltantes` | `jsonb` |  Nullable |
| `advertencias` | `jsonb` |  Nullable |
| `pdf_url` | `text` |  Nullable |
| `estado` | `text` |  |
| `generado_por` | `uuid` |  Nullable |
| `generated_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `seguimiento_reglas`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `nombre` | `text` |  |
| `tipo` | `text` |  |
| `descripcion` | `text` |  Nullable |
| `config` | `jsonb` |  |
| `activo` | `bool` |  Nullable |
| `prioridad` | `int4` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `student_cases`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `alumno_id` | `uuid` |  Nullable |
| `alumno_nombre` | `text` |  Nullable |
| `tipo` | `text` |  |
| `titulo` | `text` |  |
| `descripcion` | `text` |  Nullable |
| `nivel_riesgo` | `text` |  |
| `estado` | `text` |  |
| `origen` | `text` |  |
| `responsable_id` | `uuid` |  Nullable |
| `fecha_apertura` | `date` |  Nullable |
| `fecha_cierre` | `date` |  Nullable |
| `resumen_actual` | `text` |  Nullable |
| `proxima_accion` | `text` |  Nullable |
| `proxima_accion_fecha` | `date` |  Nullable |
| `ultimo_contacto_en` | `timestamptz` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `student_case_alerts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `alumno_id` | `uuid` |  Nullable |
| `alumno_nombre` | `text` |  Nullable |
| `case_id` | `uuid` |  Nullable |
| `tipo` | `text` |  |
| `nivel_riesgo` | `text` |  |
| `titulo` | `text` |  |
| `descripcion` | `text` |  Nullable |
| `evidencia` | `jsonb` |  Nullable |
| `estado` | `text` |  |
| `detectada_en` | `timestamptz` |  Nullable |
| `revisada_por` | `uuid` |  Nullable |
| `revisada_en` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `student_case_events`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `case_id` | `uuid` |  |
| `tipo` | `text` |  |
| `titulo` | `text` |  |
| `descripcion` | `text` |  Nullable |
| `metadata` | `jsonb` |  Nullable |
| `actor_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `student_case_actions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `case_id` | `uuid` |  |
| `alumno_id` | `uuid` |  Nullable |
| `tipo` | `text` |  |
| `titulo` | `text` |  |
| `descripcion` | `text` |  Nullable |
| `resultado` | `text` |  Nullable |
| `fecha_accion` | `timestamptz` |  Nullable |
| `proxima_accion` | `text` |  Nullable |
| `proxima_accion_fecha` | `date` |  Nullable |
| `documento_id` | `uuid` |  Nullable |
| `registrado_por` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `pagos_alumnos`

Registro de pagos por alumno. periodo_mes es el mes cubierto, no la fecha de pago.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `alumno_id` | `uuid` |  |
| `monto` | `numeric` |  |
| `concepto` | `varchar` |  |
| `periodo_mes` | `date` |  |
| `fecha_pago` | `date` |  |
| `metodo_pago` | `varchar` |  |
| `referencia_transaccion` | `varchar` |  Nullable |
| `registrado_por` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `inventario_activos`

Catálogo de instrumentos. estado_uso lo gestiona el trigger trg_comodato_sync_estado_uso.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tipo_instrumento` | `varchar` |  |
| `marca` | `varchar` |  Nullable |
| `modelo` | `varchar` |  Nullable |
| `numero_serie` | `varchar` |  Nullable |
| `codigo_inventario` | `varchar` |  Unique |
| `estado_conservacion` | `varchar` |  |
| `estado_uso` | `varchar` |  |
| `ubicacion` | `varchar` |  |
| `activo` | `bool` |  |
| `notas` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `fecha_adquisicion` | `date` |  Nullable |
| `valor_adquisicion` | `numeric` |  Nullable |
| `fecha_baja` | `date` |  Nullable |
| `motivo_baja` | `text` |  Nullable |
| `foto_url` | `varchar` |  Nullable |
| `proveedor` | `varchar` |  Nullable |
| `familia` | `text` |  Nullable |
| `nombre_normalizado` | `text` |  Nullable |
| `tamano` | `text` |  Nullable |
| `cantidad` | `numeric` |  Nullable |
| `unidad` | `text` |  Nullable |
| `estado_asignacion_original` | `text` |  Nullable |
| `asignado_a_texto` | `text` |  Nullable |
| `requiere_mantenimiento` | `bool` |  Nullable |
| `tiene_arco` | `bool` |  Nullable |
| `tiene_estuche` | `bool` |  Nullable |
| `tiene_funda` | `bool` |  Nullable |
| `tiene_hombrera_almohadilla` | `bool` |  Nullable |
| `faltantes_detectados` | `text` |  Nullable |
| `donante_inferido` | `text` |  Nullable |
| `codigo_donante` | `text` |  Nullable |
| `fuente_importacion` | `text` |  Nullable |
| `numero_original` | `text` |  Nullable |
| `fila_origen_csv` | `int4` |  Nullable |
| `revisar` | `bool` |  Nullable |
| `alertas_calidad` | `text` |  Nullable |
| `import_metadata` | `jsonb` |  |

## Table `comodatos_activos`

Préstamos de instrumentos. El trigger trg_comodato_sync_estado_uso sincroniza inventario_activos.estado_uso.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `activo_id` | `uuid` |  |
| `alumno_id` | `uuid` |  |
| `fecha_entrega` | `date` |  |
| `fecha_devolucion` | `date` |  Nullable |
| `estado` | `varchar` |  |
| `contrato_firmado_url` | `varchar` |  Nullable |
| `observaciones` | `text` |  Nullable |
| `registrado_por` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `fecha_vencimiento` | `date` |  Nullable |
| `tipo_comodato` | `varchar` |  Nullable |
| `instrumento_propio_id` | `uuid` |  Nullable |
| `renovado_de_id` | `uuid` |  Nullable |
| `intercambiado_con_id` | `uuid` |  Nullable |
| `updated_at` | `timestamptz` |  |

## Table `hermes_inbox`

Bus de eventos para HERMES. Leída por analyze-risk.js y cron jobs. Solo service_role.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary |
| `canal` | `varchar` |  |
| `categoria` | `varchar` |  |
| `summary` | `text` |  |
| `raw_ref` | `uuid` |  Nullable |
| `processed` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `telegram_user_id` | `int8` |  Nullable |

## Table `inventario_accesorios`

Accesorios asociados a instrumentos (fundas, arcos, cuerdas, etc.)

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `activo_id` | `uuid` |  Nullable |
| `tipo` | `varchar` |  |
| `marca` | `varchar` |  Nullable |
| `cantidad` | `int4` |  |
| `estado` | `varchar` |  |
| `fecha_asignacion` | `date` |  Nullable |
| `observaciones` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `inventario_historial`

Historial de eventos de instrumentos. Se inserta automáticamente via triggers.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `activo_id` | `uuid` |  |
| `tipo_evento` | `varchar` |  |
| `descripcion` | `text` |  |
| `fecha` | `timestamptz` |  |
| `usuario_id` | `uuid` |  Nullable |
| `metadata` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  |

## Custom Types / Enums

### `route_status`

`draft` | `published` | `archived`

### `progress_status`

`pending` | `in_process` | `approved` | `failed`

### `attempt_result`

`in_process` | `approved` | `failed`

### `cuota_estado`

`pendiente` | `pagada` | `vencida` | `en_mora` | `exonerada` | `becada` | `pre_pagada`

### `metodo_pago`

`efectivo` | `transferencia` | `pago_movil` | `tarjeta` | `mixto` | `tercero` | `link_externo`

### `wallet_tipo`

`credito` | `debito`

### `wallet_origen`

`pago` | `patrocinio` | `beca` | `accesorio` | `ajuste`

### `wallet_modo`

`solo_accesorios` | `solo_cuotas` | `mixto`

### `exoneracion_tipo`

`total` | `parcial`

### `asignacion_estado`

`pendiente` | `aprobado` | `rechazado` | `cobrado`

### `notif_tipo`

`mora_recordatorio` | `mora_compromiso` | `mora_escalada` | `accesorio_asignado` | `accesorio_aprobacion` | `stock_bajo` | `comodato_riesgo` | `campana_pago` | `mensaje_interno` | `tarea_asignada` | `minuta_nueva`

### `notif_canal`

`whatsapp` | `portal` | `ambos`

### `notif_prioridad`

`baja` | `media` | `alta` | `critica`

### `notif_estado_wa`

`pendiente` | `enviada` | `leida` | `respondida` | `fallida` | `no_aplica`

### `notif_estado_portal`

`no_leida` | `leida` | `archivada`

### `tarea_tipo`

`seguimiento_pago` | `revision_instrumento` | `reposicion_stock` | `recordatorio_compromiso` | `otro`

### `tarea_estado`

`pendiente` | `en_progreso` | `completada` | `cancelada` | `vencida`

### `tarea_prioridad`

`baja` | `media` | `alta` | `critica`

### `patrocinante_tipo`

`persona` | `empresa`

### `patrocinio_cubre`

`cuotas` | `wallet` | `accesorios` | `todo`

### `mensaje_tipo`

`general` | `urgente` | `consulta` | `aprobacion_requerida`

### `minuta_visibilidad`

`cajero` | `admin` | `todos`

### `cierre_caja_estado`

`borrador` | `cerrado` | `auditado`

### `wallet_status`

`operativa` | `congelada` | `devuelta`

### `event_categoria`

`concierto` | `ensayo` | `reunion` | `patrocinio` | `pago` | `corte` | `inscripcion` | `auditoria` | `otro` | `aniversario` | `audicion_trimestral` | `ensayo_intensivo`

### `soi_departamento`

`DIR` | `ACM` | `ADM` | `FIN` | `LOG` | `COM` | `TECNICO` | `LUT`

### `tarea_institucional_estado`

`pendiente` | `en_progreso` | `completada` | `bloqueada` | `cancelada` | `observada` | `bloqueada_por_dependencia`

### `tarea_institucional_prioridad`

`baja` | `media` | `alta` | `critica`

### `sim_canal`

`whatsapp` | `email`

### `sim_outbox_estado`

`pendiente` | `enviado` | `fallido`

### `sim_run_estado`

`creado` | `corriendo` | `pausado` | `finalizado` | `error`

### `sim_actor_tipo`

`postulante` | `alumno` | `maestro` | `representante`

### `sim_estado_pago`

`solvente` | `moroso` | `no_aplica`

### `resultado_audicion`

`PROMOVIDO` | `PERMANECE` | `NO_PROMOVIDO`

### `nivel_estudiante`

`Nivel 1` | `Nivel 2` | `Nivel 3` | `Nivel 4` | `Nivel 5`

## RLS Policies

### `observaciones_alumnos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `obs_admin_all` | ALL | public | PERMISSIVE | `es_admin()` | — |
| `obs_alumnos_delete` | DELETE | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |
| `obs_alumnos_insert` | INSERT | public | PERMISSIVE | — | `(auth.role() = 'authenticated'::text)` |
| `obs_alumnos_select` | SELECT | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |
| `obs_alumnos_update` | UPDATE | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |

### `familias`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `familias_all_admin` | ALL | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | `(get_user_role() = 'admin'::text)` |
| `familias_select_cajero_admin` | SELECT | public | PERMISSIVE | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` | — |
| `familias_select_representante` | SELECT | public | PERMISSIVE | `((get_user_role() = 'representante'::text) AND (id = get_user_familia_id()))` | — |

### `repertoire_fragments`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow admin modify repertoire_fragments` | ALL | authenticated | PERMISSIVE | `is_app_admin()` | `is_app_admin()` |
| `Allow public read repertoire_fragments` | SELECT | public | PERMISSIVE | `true` | — |

### `historial_estado_alumno`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `historial_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |

### `observaciones_sesion`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `obs_delete_drafts` | DELETE | public | PERMISSIVE | `(es_borrador = true)` | — |
| `obs_insert_all` | INSERT | public | PERMISSIVE | — | `true` |
| `obs_select_all` | SELECT | public | PERMISSIVE | `true` | — |
| `obs_update_all` | UPDATE | public | PERMISSIVE | `true` | — |
| `observaciones_sesion_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |

### `academic_plans`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Authenticated users can insert academic plans` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Authenticated users can read academic plans` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `academic_plans_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |

### `class_events`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `ce_delete_all` | DELETE | public | PERMISSIVE | `true` | — |
| `ce_insert_all` | INSERT | public | PERMISSIVE | — | `true` |
| `ce_select_all` | SELECT | public | PERMISSIVE | `true` | — |
| `ce_update_all` | UPDATE | public | PERMISSIVE | `true` | — |
| `class_events_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |

### `class_event_methodology`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `cem_delete_all` | DELETE | public | PERMISSIVE | `true` | — |
| `cem_insert_all` | INSERT | public | PERMISSIVE | — | `true` |
| `cem_select_all` | SELECT | public | PERMISSIVE | `true` | — |
| `cem_update_all` | UPDATE | public | PERMISSIVE | `true` | — |
| `class_event_methodology_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |

### `clase_horarios`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Permitir actualizar clase_horarios` | UPDATE | public | PERMISSIVE | `true` | `true` |
| `Permitir crear clase_horarios` | INSERT | public | PERMISSIVE | — | `true` |
| `Permitir eliminar clase_horarios` | DELETE | public | PERMISSIVE | `true` | — |
| `clase_horarios_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `clase_horarios_delete` | DELETE | authenticated | PERMISSIVE | `maestro_en_clase(clase_id)` | — |
| `clase_horarios_insert` | INSERT | authenticated | PERMISSIVE | — | `maestro_en_clase(clase_id)` |
| `clase_horarios_select` | SELECT | authenticated | PERMISSIVE | `maestro_en_clase(clase_id)` | — |
| `clase_horarios_update` | UPDATE | authenticated | PERMISSIVE | `maestro_en_clase(clase_id)` | `maestro_en_clase(clase_id)` |

### `class_session_content_snapshots`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Authenticated can insert content snapshots` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Authenticated can read content snapshots` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `class_session_content_snapshots_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |

### `homework_assignments`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `homework_assignments_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `hw_delete_all` | DELETE | public | PERMISSIVE | `true` | — |
| `hw_insert_all` | INSERT | public | PERMISSIVE | — | `true` |
| `hw_select_all` | SELECT | public | PERMISSIVE | `true` | — |
| `hw_update_all` | UPDATE | public | PERMISSIVE | `true` | — |

### `indicator_attempts`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin_read_all_indicator_attempts` | SELECT | authenticated | PERMISSIVE | `es_admin()` | — |
| `auth_read_class_indicator_attempts` | SELECT | authenticated | PERMISSIVE | `(covered_by_clase_id IN ( SELECT c.id    FROM clases c   WHERE ((c.maestro_principal_id = maestro_actual()) OR (c.maestro_suplente_id = maestro_actual()))))` | — |
| `indicator_attempts_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `teacher_delete_own_attempts` | DELETE | authenticated | PERMISSIVE | `(created_by IN ( SELECT maestros.id    FROM maestros   WHERE (maestros.user_id = auth.uid())))` | — |
| `teacher_insert_attempts` | INSERT | authenticated | PERMISSIVE | — | `(created_by IN ( SELECT maestros.id    FROM maestros   WHERE (maestros.user_id = auth.uid())))` |
| `teacher_read_own_attempts` | SELECT | authenticated | PERMISSIVE | `(created_by IN ( SELECT maestros.id    FROM maestros   WHERE (maestros.user_id = auth.uid())))` | — |
| `teacher_update_own_attempts` | UPDATE | authenticated | PERMISSIVE | `(created_by IN ( SELECT maestros.id    FROM maestros   WHERE (maestros.user_id = auth.uid())))` | `(created_by IN ( SELECT maestros.id    FROM maestros   WHERE (maestros.user_id = auth.uid())))` |

### `ruta_contenido_objetivos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `ruta_contenido_objetivos_insert` | INSERT | public | PERMISSIVE | — | `(EXISTS ( SELECT 1    FROM rutas_contenido   WHERE ((rutas_contenido.id = ruta_contenido_objetivos.ruta_id) AND (auth.uid() = rutas_contenido.creada_por))))` |
| `ruta_contenido_objetivos_select_all` | SELECT | public | PERMISSIVE | `true` | — |
| `ruta_contenido_objetivos_update` | UPDATE | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM rutas_contenido   WHERE ((rutas_contenido.id = ruta_contenido_objetivos.ruta_id) AND (auth.uid() = rutas_contenido.creada_por))))` | — |

### `plan_temas`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `plan_temas_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `plan_temas_delete` | DELETE | authenticated | PERMISSIVE | `true` | — |
| `plan_temas_insert` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `plan_temas_select` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `plan_temas_update` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |

### `permisos_maestros`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Maestro ve sus propios permisos` | SELECT | authenticated | PERMISSIVE | `(maestro_id = maestro_actual())` | — |
| `Permitir actualizar sus propios permisos o por admin` | UPDATE | authenticated | PERMISSIVE | `(es_admin() OR (maestro_id IN ( SELECT m.id    FROM maestros m   WHERE (m.user_id = auth.uid()))))` | `(es_admin() OR (maestro_id IN ( SELECT m.id    FROM maestros m   WHERE (m.user_id = auth.uid()))))` |
| `Permitir insertar sus propios permisos o por admin` | INSERT | authenticated | PERMISSIVE | — | `(es_admin() OR (maestro_id IN ( SELECT m.id    FROM maestros m   WHERE (m.user_id = auth.uid()))))` |
| `Todos pueden leer permisos` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `permisos_maestros_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |

### `clases`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Maestros ven sus clases` | SELECT | authenticated | PERMISSIVE | `((maestro_principal_id = maestro_actual()) OR (maestro_suplente_id = maestro_actual()))` | — |
| `Permitir actualizar clases` | UPDATE | public | PERMISSIVE | `true` | `true` |
| `Permitir crear clases` | INSERT | public | PERMISSIVE | — | `true` |
| `Permitir eliminar clases` | DELETE | public | PERMISSIVE | `true` | — |
| `Permitir leer todas las clases` | SELECT | public | PERMISSIVE | `true` | — |
| `clases_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |

### `soi_analisis_semanal`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `soi_analisis_semanal_auth_select` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `soi_analisis_semanal_service_all` | ALL | service_role | PERMISSIVE | `true` | `true` |

### `rutas_contenido`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `rutas_contenido_insert_maestro` | INSERT | public | PERMISSIVE | — | `(auth.uid() = creada_por)` |
| `rutas_contenido_select_all` | SELECT | public | PERMISSIVE | `true` | — |
| `rutas_contenido_update_maestro` | UPDATE | public | PERMISSIVE | `((auth.uid() = creada_por) OR (auth.uid() = aprobada_por))` | — |

### `planning_documents`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `plandocs_delete` | DELETE | authenticated | PERMISSIVE | `(maestro_id = maestro_actual())` | — |
| `plandocs_insert` | INSERT | authenticated | PERMISSIVE | — | `(maestro_id = maestro_actual())` |
| `plandocs_select` | SELECT | authenticated | PERMISSIVE | `(maestro_id = maestro_actual())` | — |
| `plandocs_update` | UPDATE | authenticated | PERMISSIVE | `(maestro_id = maestro_actual())` | `(maestro_id = maestro_actual())` |
| `planning_documents_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |

### `indicators`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Maestros pueden leer indicadores` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `indicators_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `maestros_write_own_draft_indicators` | ALL | public | PERMISSIVE | `(node_id IN ( SELECT n.id    FROM (nodes n      JOIN route_versions rv ON ((rv.id = n.route_version_id)))   WHERE ((rv.created_by = auth.uid()) AND (rv.status = 'draft'::route_status))))` | `(node_id IN ( SELECT n.id    FROM (nodes n      JOIN route_versions rv ON ((rv.id = n.route_version_id)))   WHERE ((rv.created_by = auth.uid()) AND (rv.status = 'draft'::route_status))))` |

### `route_versions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `maestros_delete_own_draft_versions` | DELETE | public | PERMISSIVE | `((created_by = auth.uid()) AND (status = 'draft'::route_status))` | — |
| `maestros_select_own_draft_versions` | SELECT | public | PERMISSIVE | `((created_by = auth.uid()) AND (status = 'draft'::route_status))` | — |
| `maestros_update_own_draft_versions` | UPDATE | public | PERMISSIVE | `((created_by = auth.uid()) AND (status = 'draft'::route_status))` | — |
| `route_versions_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |

### `nodes`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Maestros pueden leer nodos` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `maestros_write_own_draft_nodes` | ALL | public | PERMISSIVE | `(route_version_id IN ( SELECT route_versions.id    FROM route_versions   WHERE ((route_versions.created_by = auth.uid()) AND (route_versions.status = 'draft'::route_status))))` | `(route_version_id IN ( SELECT route_versions.id    FROM route_versions   WHERE ((route_versions.created_by = auth.uid()) AND (route_versions.status = 'draft'::route_status))))` |
| `nodes_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |

### `blocks`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Maestros pueden leer bloques de rutas` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `blocks_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `maestros_write_own_draft_blocks` | ALL | public | PERMISSIVE | `(route_version_id IN ( SELECT route_versions.id    FROM route_versions   WHERE ((route_versions.created_by = auth.uid()) AND (route_versions.status = 'draft'::route_status))))` | `(route_version_id IN ( SELECT route_versions.id    FROM route_versions   WHERE ((route_versions.created_by = auth.uid()) AND (route_versions.status = 'draft'::route_status))))` |

### `routes`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Maestros pueden leer rutas` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `routes_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |

### `levels`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Maestros pueden leer niveles` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `levels_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `maestros_write_own_draft_levels` | ALL | public | PERMISSIVE | `(route_version_id IN ( SELECT route_versions.id    FROM route_versions   WHERE ((route_versions.created_by = auth.uid()) AND (route_versions.status = 'draft'::route_status))))` | `(route_version_id IN ( SELECT route_versions.id    FROM route_versions   WHERE ((route_versions.created_by = auth.uid()) AND (route_versions.status = 'draft'::route_status))))` |

### `inventario_activos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `inventario_admin_insert` | INSERT | authenticated | PERMISSIVE | — | `es_admin()` |
| `inventario_admin_update` | UPDATE | authenticated | PERMISSIVE | `es_admin()` | — |
| `inventario_authenticated_select` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `configuracion_recordatorios`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `configuracion_recordatorios_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `configuracion_recordatorios_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `plan_niveles`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `plan_niveles_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `plan_niveles_delete` | DELETE | authenticated | PERMISSIVE | `true` | — |
| `plan_niveles_insert` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `plan_niveles_select` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `plan_niveles_update` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |

### `planificacion`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Planificacion is viewable by everyone` | SELECT | public | PERMISSIVE | `true` | — |
| `Service role has full access to planificacion` | ALL | public | PERMISSIVE | `(auth.role() = 'service_role'::text)` | `(auth.role() = 'service_role'::text)` |
| `planificacion_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |

### `plan_clases`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `plan_clases_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `plan_clases_delete` | DELETE | authenticated | PERMISSIVE | `true` | — |
| `plan_clases_insert` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `plan_clases_select` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `plan_clases_update` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |

### `plan_objetivos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `plan_objetivos_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `plan_objetivos_delete` | DELETE | authenticated | PERMISSIVE | `true` | — |
| `plan_objetivos_insert` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `plan_objetivos_select` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `plan_objetivos_update` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |

### `plan_indicadores`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `plan_indicadores_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `plan_indicadores_delete` | DELETE | authenticated | PERMISSIVE | `true` | — |
| `plan_indicadores_insert` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `plan_indicadores_select` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `plan_indicadores_update` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |

### `ausencias`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Authenticated users can view ausencias` | SELECT | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |
| `Maestros gestionan sus ausencias` | ALL | authenticated | PERMISSIVE | `(maestro_id = maestro_actual())` | — |
| `Service role has full access to ausencias` | ALL | public | PERMISSIVE | `(auth.role() = 'service_role'::text)` | `(auth.role() = 'service_role'::text)` |
| `ausencias_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |

### `asistencia_maestros`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `asistencia_maestros_admin_all` | ALL | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |
| `asistencia_maestros_self_read` | SELECT | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM maestros m   WHERE ((m.id = asistencia_maestros.maestro_id) AND (m.user_id = auth.uid()))))` | — |

### `clases_emergentes`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `clases_emergentes_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `clases_emergentes_delete` | DELETE | authenticated | PERMISSIVE | `(maestro_id = maestro_actual())` | — |
| `clases_emergentes_insert` | INSERT | authenticated | PERMISSIVE | — | `(maestro_id = maestro_actual())` |
| `clases_emergentes_select` | SELECT | authenticated | PERMISSIVE | `((maestro_id = maestro_actual()) OR maestro_en_clase(clase_id))` | — |
| `clases_emergentes_update` | UPDATE | authenticated | PERMISSIVE | `(maestro_id = maestro_actual())` | `(maestro_id = maestro_actual())` |

### `asistencias_emergentes`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow authenticated insert asistencias_emergentes` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Allow authenticated read asistencias_emergentes` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `Allow authenticated update asistencias_emergentes` | UPDATE | authenticated | PERMISSIVE | `true` | — |

### `aplicaciones_pago`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `aplicaciones_pago_select_cajero_admin` | SELECT | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.rol = ANY (ARRAY['admin'::text, 'cajero'::text])))))` | — |

### `system_config`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin_read_system_config` | SELECT | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND (p.rol = 'admin'::text) AND (p.estado = 'activo'::text))))` | — |
| `admin_write_system_config` | ALL | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND (p.rol = 'admin'::text) AND (p.estado = 'activo'::text))))` | `(EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND (p.rol = 'admin'::text) AND (p.estado = 'activo'::text))))` |
| `system_config_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `system_config_public_keys_read` | SELECT | authenticated | PERMISSIVE | `((key)::text <> ALL ((ARRAY['groq_api_key'::character varying, 'openrouter_api_key'::character varying, 'vapid_private_key'::character varying, 'admin_invite_code'::character varying, 'telegram_monitor_healthcheck_secret'::character varying])::text[]))` | — |

### `catalogos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `catalogos_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |

### `soi_rule_effectiveness`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `soi_rule_effectiveness_auth_select` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `soi_rule_effectiveness_service_all` | ALL | service_role | PERMISSIVE | `true` | `true` |

### `planificacion_nodos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `planificacion_nodos_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |

### `planned_content`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `planned_content_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `planned_content_delete_all` | DELETE | public | PERMISSIVE | `true` | — |
| `planned_content_insert_all` | INSERT | public | PERMISSIVE | — | `true` |
| `planned_content_select_all` | SELECT | public | PERMISSIVE | `true` | — |
| `planned_content_update_all` | UPDATE | public | PERMISSIVE | `true` | — |

### `clase_acceso_temporal`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `clase_acceso_temporal_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `clase_acceso_temporal_delete` | DELETE | authenticated | PERMISSIVE | `maestro_en_clase(clase_id)` | — |
| `clase_acceso_temporal_insert` | INSERT | authenticated | PERMISSIVE | — | `maestro_en_clase(clase_id)` |
| `clase_acceso_temporal_select` | SELECT | authenticated | PERMISSIVE | `((maestro_suplente_id = maestro_actual()) OR maestro_en_clase(clase_id))` | — |
| `clase_acceso_temporal_update` | UPDATE | authenticated | PERMISSIVE | `maestro_en_clase(clase_id)` | `maestro_en_clase(clase_id)` |

### `maestro_tareas`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `maestro_tareas_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `maestro_tareas_own` | ALL | authenticated | PERMISSIVE | `(maestro_id = maestro_actual())` | `(maestro_id = maestro_actual())` |

### `solicitudes_ausencia`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `solicitudes_ausencia_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `solicitudes_ausencia_own` | ALL | authenticated | PERMISSIVE | `(maestro_id = maestro_actual())` | `(maestro_id = maestro_actual())` |

### `justificaciones`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `justificaciones_admin_all` | ALL | public | PERMISSIVE | `(es_admin() OR maestro_en_clase(clase_id))` | — |
| `teacher_manage_justificaciones` | ALL | authenticated | PERMISSIVE | `(creado_por IN ( SELECT maestros.id    FROM maestros   WHERE (maestros.user_id = auth.uid())))` | `(creado_por IN ( SELECT maestros.id    FROM maestros   WHERE (maestros.user_id = auth.uid())))` |

### `salones`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Permitir actualizar salones` | UPDATE | public | PERMISSIVE | `true` | `true` |
| `Permitir crear salones` | INSERT | public | PERMISSIVE | — | `true` |
| `Permitir eliminar salones` | DELETE | public | PERMISSIVE | `true` | — |
| `salones_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `salones_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `maestros`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Admin puede hacer cualquier cosa con maestros` | ALL | public | PERMISSIVE | `true` | `true` |
| `maestros_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |

### `programas`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Permitir actualizar programas` | UPDATE | public | PERMISSIVE | `true` | `true` |
| `Permitir crear programas` | INSERT | public | PERMISSIVE | — | `true` |
| `Permitir eliminar programas` | DELETE | public | PERMISSIVE | `true` | — |
| `programas_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `programas_anon_read` | SELECT | anon | PERMISSIVE | `true` | — |
| `programas_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `niveles`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `niveles_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `niveles_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `alumno_escolaridad`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `rls_alumno_escolaridad_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `document_templates`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `rls_document_templates_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `document_batches`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `rls_document_batches_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `profiles`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Usuarios ven su propio perfil` | SELECT | authenticated | PERMISSIVE | `(id = auth.uid())` | — |
| `profiles_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `profiles_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `horarios`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Permitir actualizar horarios` | UPDATE | public | PERMISSIVE | `true` | `true` |
| `Permitir crear horarios` | INSERT | public | PERMISSIVE | — | `true` |
| `Permitir eliminar horarios` | DELETE | public | PERMISSIVE | `true` | — |
| `horarios_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `horarios_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `modulos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `modulos_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `modulos_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `unidades`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `unidades_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `unidades_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `ejercicios`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `ejercicios_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `ejercicios_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `alumnos_modulos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `alumnos_modulos_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `alumnos_modulos_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `alumnos_ejercicios`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `alumnos_ejercicios_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `alumnos_ejercicios_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `intentos_ejercicios`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `intentos_ejercicios_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `intentos_ejercicios_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `contenidos_sesion`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Maestros gestionan contenidos de sus sesiones` | ALL | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM sesiones_clase s   WHERE ((s.id = contenidos_sesion.sesion_clase_id) AND ((s.maestro_id = maestro_actual()) OR maestro_en_clase(s.clase_id)))))` | — |
| `contenidos_admin_all` | ALL | public | PERMISSIVE | `es_admin()` | — |
| `contenidos_sesion_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `xp_log`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `xp_log_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `xp_log_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `rachas`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `rachas_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `rachas_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `logros`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `logros_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `logros_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `alumnos_logros`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `alumnos_logros_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `alumnos_logros_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `alumnos_clases`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Maestros ven sus inscripciones` | SELECT | authenticated | PERMISSIVE | `maestro_en_clase(clase_id)` | — |
| `alumnos_clases_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `alumnos_clases_delete` | DELETE | authenticated | PERMISSIVE | `((( SELECT is_admin() AS is_admin) = true) OR ((( SELECT profile_is_active() AS profile_is_active) = true) AND ((( SELECT is_teacher() AS is_teacher) = true) AND tiene_permiso('clases:enroll'::text) AND maestro_en_clase(clase_id))))` | — |
| `alumnos_clases_insert` | INSERT | authenticated | PERMISSIVE | — | `((( SELECT is_admin() AS is_admin) = true) OR ((( SELECT profile_is_active() AS profile_is_active) = true) AND ((( SELECT is_teacher() AS is_teacher) = true) AND tiene_permiso('clases:enroll'::text) AND maestro_en_clase(clase_id))))` |
| `alumnos_clases_read_all` | SELECT | public | PERMISSIVE | `true` | — |
| `alumnos_clases_update` | UPDATE | authenticated | PERMISSIVE | `((( SELECT is_admin() AS is_admin) = true) OR ((( SELECT profile_is_active() AS profile_is_active) = true) AND ((( SELECT is_teacher() AS is_teacher) = true) AND tiene_permiso('clases:enroll'::text) AND maestro_en_clase(clase_id))))` | `((( SELECT is_admin() AS is_admin) = true) OR ((( SELECT profile_is_active() AS profile_is_active) = true) AND ((( SELECT is_teacher() AS is_teacher) = true) AND tiene_permiso('clases:enroll'::text) AND maestro_en_clase(clase_id))))` |

### `notificaciones`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `notificaciones_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `notificaciones_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `registros_pendientes`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `registros_pendientes_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `registros_pendientes_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `progresos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `progresos_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `progresos_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |
| `progresos_delete` | DELETE | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |
| `progresos_insert` | INSERT | public | PERMISSIVE | — | `(auth.role() = 'authenticated'::text)` |
| `progresos_select` | SELECT | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |
| `progresos_update` | UPDATE | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |

### `alumnos_rutas`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `alumnos_rutas_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `alumnos_rutas_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `planificaciones`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `planificaciones_delete_propia` | DELETE | authenticated | PERMISSIVE | `(es_admin() OR (maestro_id = maestro_actual()))` | — |
| `planificaciones_insert_propia` | INSERT | authenticated | PERMISSIVE | — | `(es_admin() OR ((maestro_id = maestro_actual()) AND ((clase_id IS NULL) OR maestro_en_clase(clase_id))))` |
| `planificaciones_read` | SELECT | authenticated | PERMISSIVE | `(es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id))` | — |
| `planificaciones_update_propia` | UPDATE | authenticated | PERMISSIVE | `(es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id))` | `(es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id))` |

### `asistencias`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Maestros gestionan sus asistencias` | ALL | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM sesiones_clase s   WHERE ((s.id = asistencias.sesion_clase_id) AND ((s.maestro_id = maestro_actual()) OR maestro_en_clase(s.clase_id)))))` | `(tiene_permiso('asistencias:write'::text) AND (EXISTS ( SELECT 1    FROM sesiones_clase s   WHERE ((s.id = asistencias.sesion_clase_id) AND ((s.maestro_id = maestro_actual()) OR maestro_en_clase(s.clase_id))))))` |
| `asistencias_admin_all` | ALL | public | PERMISSIVE | `(es_admin() OR (EXISTS ( SELECT 1    FROM sesiones_clase s   WHERE ((s.id = asistencias.sesion_clase_id) AND ((s.maestro_id = maestro_actual()) OR maestro_en_clase(s.clase_id))))))` | — |

### `generated_documents`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `rls_generated_documents_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `inventario_historial`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `historial_admin_delete` | DELETE | authenticated | PERMISSIVE | `es_admin()` | — |
| `historial_admin_insert` | INSERT | authenticated | PERMISSIVE | — | `es_admin()` |
| `historial_authenticated_select` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `inventario_accesorios`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `accesorios_admin_delete` | DELETE | authenticated | PERMISSIVE | `es_admin()` | — |
| `accesorios_admin_insert` | INSERT | authenticated | PERMISSIVE | — | `es_admin()` |
| `accesorios_admin_update` | UPDATE | authenticated | PERMISSIVE | `es_admin()` | — |
| `accesorios_authenticated_select` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `inventario_reparaciones`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `reparaciones_admin_delete` | DELETE | authenticated | PERMISSIVE | `es_admin()` | — |
| `reparaciones_admin_insert` | INSERT | authenticated | PERMISSIVE | — | `es_admin()` |
| `reparaciones_admin_update` | UPDATE | authenticated | PERMISSIVE | `es_admin()` | — |
| `reparaciones_authenticated_select` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `facturas_reparacion`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `facturas_admin_delete` | DELETE | authenticated | PERMISSIVE | `es_admin()` | — |
| `facturas_admin_insert` | INSERT | authenticated | PERMISSIVE | — | `es_admin()` |
| `facturas_admin_update` | UPDATE | authenticated | PERMISSIVE | `es_admin()` | — |
| `facturas_authenticated_select` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `periodo_excepciones`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `periodo_excepciones_admin_write` | ALL | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |
| `periodo_excepciones_read` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `ausencias_clases_afectadas`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `ausencias_clases_afectadas_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `maestro_can_insert_own_clase_afectada` | INSERT | authenticated | PERMISSIVE | — | `(ausencia_id IN ( SELECT ausencias_maestros.id    FROM ausencias_maestros   WHERE (ausencias_maestros.maestro_id = auth.uid())))` |
| `maestro_can_read_own_clase_afectada` | SELECT | authenticated | PERMISSIVE | `((ausencia_id IN ( SELECT ausencias_maestros.id    FROM ausencias_maestros   WHERE (ausencias_maestros.maestro_id = auth.uid()))) OR (clase_id IN ( SELECT clases.id    FROM clases   WHERE ((clases.maestro_principal_id = auth.uid()) OR (clases.maestro_suplente_id = auth.uid())))))` | — |

### `ausencias_notificaciones`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin_can_insert_notifications` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `ausencias_notificaciones_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `director_can_read_own_notifications` | SELECT | authenticated | PERMISSIVE | `(director_id = auth.uid())` | — |

### `student_case_actions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `rls_student_case_actions_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `maestro_access_credentials`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `maestro_access_credentials_service_role` | ALL | service_role | PERMISSIVE | `true` | `true` |

### `seguimiento_reglas`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `rls_seguimiento_reglas_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `student_cases`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `rls_student_cases_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `student_case_alerts`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `rls_student_case_alerts_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `student_case_events`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `rls_student_case_events_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `indicator_sessions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `bitacora_indicator_sessions_insert` | INSERT | authenticated | PERMISSIVE | — | `((maestro_id = maestro_actual()) AND maestro_en_clase(clase_id))` |
| `bitacora_indicator_sessions_select` | SELECT | authenticated | PERMISSIVE | `(maestro_id = maestro_actual())` | — |
| `bitacora_indicator_sessions_update` | UPDATE | authenticated | PERMISSIVE | `(maestro_id = maestro_actual())` | `((maestro_id = maestro_actual()) AND maestro_en_clase(clase_id))` |

### `sesiones_clase`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Maestros pueden actualizar sus propias sesiones` | UPDATE | authenticated | PERMISSIVE | `(maestro_id = maestro_actual())` | `(maestro_id = maestro_actual())` |
| `Maestros pueden crear sesiones de sus clases` | INSERT | authenticated | PERMISSIVE | — | `(maestro_en_clase(clase_id) AND (maestro_id = maestro_actual()))` |
| `Maestros ven sus sesiones` | SELECT | authenticated | PERMISSIVE | `((maestro_id = maestro_actual()) OR maestro_en_clase(clase_id))` | — |
| `sesiones_admin_all` | ALL | public | PERMISSIVE | `(es_admin() OR (maestro_id = maestro_actual()) OR maestro_en_clase(clase_id))` | — |
| `sesiones_clase_delete` | DELETE | authenticated | PERMISSIVE | `(maestro_id = maestro_actual())` | — |

### `ausencias_maestros`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Maestros pueden crear sus propias solicitudes` | INSERT | public | PERMISSIVE | — | `(auth.uid() = maestro_id)` |
| `Maestros pueden ver sus propias ausencias` | SELECT | public | PERMISSIVE | `(auth.uid() = maestro_id)` | — |
| `ausencias_maestros_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |

### `ausencias_auditoria`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `ausencias_auditoria_insert` | INSERT | authenticated | PERMISSIVE | — | `(actor_id = auth.uid())` |
| `ausencias_auditoria_select` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `solicitudes_permisos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Admin puede ver y actualizar todas` | ALL | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |
| `Maestro puede crear su solicitud` | INSERT | authenticated | PERMISSIVE | — | `(maestro_id IN ( SELECT m.id    FROM maestros m   WHERE (m.user_id = auth.uid())))` |
| `Maestro puede ver su solicitud` | SELECT | authenticated | PERMISSIVE | `((maestro_id IN ( SELECT m.id    FROM maestros m   WHERE (m.user_id = auth.uid()))) OR es_admin())` | — |

### `notification_trigger_logs`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `solo admins` | ALL | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text))))` | — |

### `indicator_session_students`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `bitacora_session_students_insert` | INSERT | authenticated | PERMISSIVE | — | `(EXISTS ( SELECT 1    FROM indicator_sessions s   WHERE ((s.id = indicator_session_students.indicator_session_id) AND (s.maestro_id = maestro_actual()))))` |
| `bitacora_session_students_select` | SELECT | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM indicator_sessions s   WHERE ((s.id = indicator_session_students.indicator_session_id) AND (s.maestro_id = maestro_actual()))))` | — |

### `wallet_config`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `wallet_config_all_cajero_admin` | ALL | public | PERMISSIVE | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` |

### `cuotas`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `cuotas_insert_cajero_admin` | INSERT | public | PERMISSIVE | — | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` |
| `cuotas_select_cajero_admin` | SELECT | public | PERMISSIVE | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` | — |
| `cuotas_select_representante` | SELECT | public | PERMISSIVE | `((get_user_role() = 'representante'::text) AND (familia_id = get_user_familia_id()))` | — |
| `cuotas_update_admin` | UPDATE | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | `(get_user_role() = 'admin'::text)` |

### `becas`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `becas_all_admin` | ALL | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | `(get_user_role() = 'admin'::text)` |
| `becas_select_cajero_admin` | SELECT | public | PERMISSIVE | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` | — |

### `exoneraciones`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `exoneraciones_all_admin` | ALL | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | `(get_user_role() = 'admin'::text)` |
| `exoneraciones_select_cajero_admin` | SELECT | public | PERMISSIVE | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` | — |

### `representantes`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `representantes_all_admin` | ALL | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | `(get_user_role() = 'admin'::text)` |
| `representantes_select_cajero_admin` | SELECT | public | PERMISSIVE | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` | — |
| `representantes_select_representante` | SELECT | public | PERMISSIVE | `((get_user_role() = 'representante'::text) AND (familia_id = get_user_familia_id()))` | — |

### `accesorios`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `accesorios_insert_delete_admin` | ALL | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | `(get_user_role() = 'admin'::text)` |
| `accesorios_select_cajero_admin` | SELECT | public | PERMISSIVE | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` | — |
| `accesorios_update_cajero_admin` | UPDATE | public | PERMISSIVE | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` |

### `curriculos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `curriculos_delete` | DELETE | authenticated | PERMISSIVE | `es_admin()` | — |
| `curriculos_insert` | INSERT | authenticated | PERMISSIVE | — | `es_admin()` |
| `curriculos_select` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `curriculos_update` | UPDATE | authenticated | PERMISSIVE | `es_admin()` | — |

### `curriculo_pilares`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `pilares_delete` | DELETE | authenticated | PERMISSIVE | `es_admin()` | — |
| `pilares_insert` | INSERT | authenticated | PERMISSIVE | — | `es_admin()` |
| `pilares_select` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `pilares_update` | UPDATE | authenticated | PERMISSIVE | `es_admin()` | — |

### `curriculo_objetivos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `objetivos_delete` | DELETE | authenticated | PERMISSIVE | `es_admin()` | — |
| `objetivos_insert` | INSERT | authenticated | PERMISSIVE | — | `es_admin()` |
| `objetivos_select` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `objetivos_update` | UPDATE | authenticated | PERMISSIVE | `es_admin()` | — |

### `cobertura_alumno_objetivo`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `cobertura_insert` | INSERT | authenticated | PERMISSIVE | — | `(maestro_id = maestro_actual())` |
| `cobertura_select_maestro` | SELECT | authenticated | PERMISSIVE | `((maestro_id = maestro_actual()) OR es_admin())` | — |
| `cobertura_update` | UPDATE | authenticated | PERMISSIVE | `(maestro_id = maestro_actual())` | — |

### `accesorio_asignaciones`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `aa_all_admin` | ALL | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | `(get_user_role() = 'admin'::text)` |
| `aa_insert_cajero_admin` | INSERT | public | PERMISSIVE | — | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` |
| `aa_select_cajero_admin` | SELECT | public | PERMISSIVE | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` | — |

### `autorizaciones_accesorio`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `autorizaciones_all_admin` | ALL | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | `(get_user_role() = 'admin'::text)` |
| `autorizaciones_select_cajero` | SELECT | public | PERMISSIVE | `(get_user_role() = 'cajero'::text)` | — |

### `pagos_alumnos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `pagos_admin_insert` | INSERT | authenticated | PERMISSIVE | — | `es_admin()` |
| `pagos_admin_select` | SELECT | authenticated | PERMISSIVE | `es_admin()` | — |
| `pagos_admin_update` | UPDATE | authenticated | PERMISSIVE | `es_admin()` | — |

### `minutas`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `minutas_insert_cajero_admin` | INSERT | public | PERMISSIVE | — | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` |
| `minutas_select_admin` | SELECT | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | — |
| `minutas_select_cajero` | SELECT | public | PERMISSIVE | `((get_user_role() = 'cajero'::text) AND (visibilidad = ANY (ARRAY['cajero'::minuta_visibilidad, 'todos'::minuta_visibilidad])))` | — |
| `minutas_update_admin` | UPDATE | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | `(get_user_role() = 'admin'::text)` |

### `hilos_mensajes`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `hilos_all_admin` | ALL | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | `(get_user_role() = 'admin'::text)` |
| `hilos_insert_cajero_admin` | INSERT | public | PERMISSIVE | — | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` |
| `hilos_select_cajero_admin` | SELECT | public | PERMISSIVE | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` | — |

### `mensajes_internos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `mensajes_insert_cajero_admin` | INSERT | public | PERMISSIVE | — | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` |
| `mensajes_select_cajero_admin` | SELECT | public | PERMISSIVE | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` | — |

### `campanas_pago`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `campanas_all_admin` | ALL | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | `(get_user_role() = 'admin'::text)` |
| `campanas_select_activa_cajero` | SELECT | public | PERMISSIVE | `((get_user_role() = 'cajero'::text) AND (activa = true))` | — |

### `push_subscriptions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `push_own_user` | ALL | public | PERMISSIVE | `(profile_id = auth.uid())` | `(profile_id = auth.uid())` |
| `push_subscriptions_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `push_subscriptions_own` | ALL | authenticated | PERMISSIVE | `(profile_id = auth.uid())` | `(profile_id = auth.uid())` |

### `score_compromiso`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `score_select_admin_only` | SELECT | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | — |

### `compromisos_pago`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `compromisos_all_admin` | ALL | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | `(get_user_role() = 'admin'::text)` |
| `compromisos_select_cajero_admin` | SELECT | public | PERMISSIVE | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` | — |

### `campana_participaciones`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `campana_part_all_admin` | ALL | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | `(get_user_role() = 'admin'::text)` |
| `campana_part_insert_cajero_admin` | INSERT | public | PERMISSIVE | — | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` |
| `campana_part_select_cajero_admin` | SELECT | public | PERMISSIVE | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` | — |

### `patrocinantes`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `patrocinantes_all_admin` | ALL | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | `(get_user_role() = 'admin'::text)` |
| `patrocinantes_select_cajero_admin` | SELECT | public | PERMISSIVE | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` | — |

### `patrocinios`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `patrocinios_all_admin` | ALL | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | `(get_user_role() = 'admin'::text)` |
| `patrocinios_select_cajero_admin` | SELECT | public | PERMISSIVE | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` | — |

### `notificaciones_caja`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `notif_all_admin` | ALL | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | `(get_user_role() = 'admin'::text)` |
| `notif_insert_cajero_admin` | INSERT | public | PERMISSIVE | — | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` |
| `notif_select_cajero_admin` | SELECT | public | PERMISSIVE | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` | — |
| `notif_select_representante` | SELECT | public | PERMISSIVE | `((get_user_role() = 'representante'::text) AND (familia_id = get_user_familia_id()))` | — |
| `notif_update_cajero` | UPDATE | public | PERMISSIVE | `(get_user_role() = 'cajero'::text)` | `(get_user_role() = 'cajero'::text)` |

### `tareas_caja`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `tareas_all_admin` | ALL | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | `(get_user_role() = 'admin'::text)` |
| `tareas_insert_cajero_admin` | INSERT | public | PERMISSIVE | — | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` |
| `tareas_select_own_cajero` | SELECT | public | PERMISSIVE | `((get_user_role() = 'cajero'::text) AND (asignado_a = auth.uid()))` | — |
| `tareas_update_own_cajero` | UPDATE | public | PERMISSIVE | `((get_user_role() = 'cajero'::text) AND (asignado_a = auth.uid()))` | `((get_user_role() = 'cajero'::text) AND (asignado_a = auth.uid()))` |

### `comodatos_activos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `comodatos_admin_insert` | INSERT | authenticated | PERMISSIVE | — | `es_admin()` |
| `comodatos_admin_update` | UPDATE | authenticated | PERMISSIVE | `es_admin()` | — |
| `comodatos_authenticated_select` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `schedule_runs`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `authenticated_all_runs` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `schedule_run_feedback`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admins_all_feedback` | ALL | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM maestros   WHERE ((maestros.user_id = auth.uid()) AND (maestros.es_admin = true))))` | — |
| `authenticated_insert_feedback` | INSERT | authenticated | PERMISSIVE | — | `(usuario_id = auth.uid())` |
| `authenticated_select_feedback` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `cierres_caja`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `cierres_caja_insert_cajero_admin` | INSERT | public | PERMISSIVE | — | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` |
| `cierres_caja_select_cajero_admin` | SELECT | public | PERMISSIVE | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` | — |
| `cierres_caja_update_admin` | UPDATE | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | — |

### `alumno_plan_entradas`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `maestro_delete_plan_entradas` | DELETE | public | PERMISSIVE | `(maestro_id IN ( SELECT maestros.id    FROM maestros   WHERE (maestros.user_id = auth.uid())))` | — |
| `maestro_insert_plan_entradas` | INSERT | public | PERMISSIVE | — | `((maestro_id IN ( SELECT maestros.id    FROM maestros   WHERE (maestros.user_id = auth.uid()))) AND (EXISTS ( SELECT 1    FROM (alumnos_clases ac      JOIN clases c ON ((c.id = ac.clase_id)))   WHERE ((ac.alumno_id = alumno_plan_entradas.alumno_id) AND (c.maestro_id = alumno_plan_entradas.maestro_id) AND (ac.activo = true)))))` |
| `maestro_select_plan_entradas` | SELECT | public | PERMISSIVE | `((EXISTS ( SELECT 1    FROM ((alumnos_clases ac      JOIN clases c ON ((c.id = ac.clase_id)))      JOIN maestros m ON ((m.id = c.maestro_id)))   WHERE ((ac.alumno_id = alumno_plan_entradas.alumno_id) AND (m.user_id = auth.uid())))) OR (maestro_id IN ( SELECT maestros.id    FROM maestros   WHERE (maestros.user_id = auth.uid()))))` | — |
| `maestro_update_plan_entradas` | UPDATE | public | PERMISSIVE | `(maestro_id IN ( SELECT maestros.id    FROM maestros   WHERE (maestros.user_id = auth.uid())))` | — |

### `maestro_routes`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `maestro_routes_delete` | DELETE | authenticated | PERMISSIVE | `(es_admin() OR es_coordinador_acm() OR (maestro_id IN ( SELECT maestros.id    FROM maestros   WHERE (maestros.user_id = auth.uid()))))` | — |
| `maestro_routes_insert` | INSERT | authenticated | PERMISSIVE | — | `(es_admin() OR es_coordinador_acm() OR (maestro_id IN ( SELECT maestros.id    FROM maestros   WHERE (maestros.user_id = auth.uid()))))` |
| `maestro_routes_select` | SELECT | authenticated | PERMISSIVE | `(es_admin() OR es_coordinador_acm() OR (maestro_id IN ( SELECT maestros.id    FROM maestros   WHERE (maestros.user_id = auth.uid()))))` | — |
| `maestro_routes_update` | UPDATE | authenticated | PERMISSIVE | `(es_admin() OR es_coordinador_acm() OR (maestro_id IN ( SELECT maestros.id    FROM maestros   WHERE (maestros.user_id = auth.uid()))))` | `(es_admin() OR es_coordinador_acm() OR (maestro_id IN ( SELECT maestros.id    FROM maestros   WHERE (maestros.user_id = auth.uid()))))` |

### `postulantes`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `postulantes_delete_authenticated` | DELETE | authenticated | PERMISSIVE | `true` | — |
| `postulantes_delete_service_role` | DELETE | service_role | PERMISSIVE | `true` | — |
| `postulantes_insert_service_role` | INSERT | service_role | PERMISSIVE | — | `true` |
| `postulantes_select_authenticated` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `postulantes_update_authenticated` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |
| `postulantes_update_service_role` | UPDATE | service_role | PERMISSIVE | `true` | `true` |

### `maestro_unidades`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `maestro_unidades_delete` | DELETE | authenticated | PERMISSIVE | `(es_admin() OR es_coordinador_acm() OR (ruta_id IN ( SELECT maestro_routes.id    FROM maestro_routes   WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id            FROM maestros           WHERE (maestros.user_id = auth.uid()))))))` | — |
| `maestro_unidades_select` | SELECT | authenticated | PERMISSIVE | `(es_admin() OR es_coordinador_acm() OR (ruta_id IN ( SELECT maestro_routes.id    FROM maestro_routes   WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id            FROM maestros           WHERE (maestros.user_id = auth.uid()))))))` | — |
| `maestro_unidades_update` | UPDATE | authenticated | PERMISSIVE | `(es_admin() OR es_coordinador_acm() OR (ruta_id IN ( SELECT maestro_routes.id    FROM maestro_routes   WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id            FROM maestros           WHERE (maestros.user_id = auth.uid()))))))` | `(es_admin() OR es_coordinador_acm() OR (ruta_id IN ( SELECT maestro_routes.id    FROM maestro_routes   WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id            FROM maestros           WHERE (maestros.user_id = auth.uid()))))))` |
| `maestro_unidades_write` | INSERT | authenticated | PERMISSIVE | — | `(es_admin() OR es_coordinador_acm() OR (ruta_id IN ( SELECT maestro_routes.id    FROM maestro_routes   WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id            FROM maestros           WHERE (maestros.user_id = auth.uid()))))))` |

### `maestro_objetivos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `maestro_objetivos_delete` | DELETE | authenticated | PERMISSIVE | `(es_admin() OR es_coordinador_acm() OR (unidad_id IN ( SELECT maestro_unidades.id    FROM maestro_unidades   WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id            FROM maestro_routes           WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id                    FROM maestros                   WHERE (maestros.user_id = auth.uid()))))))))` | — |
| `maestro_objetivos_select` | SELECT | authenticated | PERMISSIVE | `(es_admin() OR es_coordinador_acm() OR (unidad_id IN ( SELECT maestro_unidades.id    FROM maestro_unidades   WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id            FROM maestro_routes           WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id                    FROM maestros                   WHERE (maestros.user_id = auth.uid()))))))))` | — |
| `maestro_objetivos_update` | UPDATE | authenticated | PERMISSIVE | `(es_admin() OR es_coordinador_acm() OR (unidad_id IN ( SELECT maestro_unidades.id    FROM maestro_unidades   WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id            FROM maestro_routes           WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id                    FROM maestros                   WHERE (maestros.user_id = auth.uid()))))))))` | `(es_admin() OR es_coordinador_acm() OR (unidad_id IN ( SELECT maestro_unidades.id    FROM maestro_unidades   WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id            FROM maestro_routes           WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id                    FROM maestros                   WHERE (maestros.user_id = auth.uid()))))))))` |
| `maestro_objetivos_write` | INSERT | authenticated | PERMISSIVE | — | `(es_admin() OR es_coordinador_acm() OR (unidad_id IN ( SELECT maestro_unidades.id    FROM maestro_unidades   WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id            FROM maestro_routes           WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id                    FROM maestros                   WHERE (maestros.user_id = auth.uid()))))))))` |

### `maestro_indicadores`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `maestro_indicadores_delete` | DELETE | authenticated | PERMISSIVE | `(es_admin() OR es_coordinador_acm() OR (objetivo_id IN ( SELECT maestro_objetivos.id    FROM maestro_objetivos   WHERE (maestro_objetivos.unidad_id IN ( SELECT maestro_unidades.id            FROM maestro_unidades           WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id                    FROM maestro_routes                   WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id                            FROM maestros                           WHERE (maestros.user_id = auth.uid()))))))))))` | — |
| `maestro_indicadores_select` | SELECT | authenticated | PERMISSIVE | `(es_admin() OR es_coordinador_acm() OR (objetivo_id IN ( SELECT maestro_objetivos.id    FROM maestro_objetivos   WHERE (maestro_objetivos.unidad_id IN ( SELECT maestro_unidades.id            FROM maestro_unidades           WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id                    FROM maestro_routes                   WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id                            FROM maestros                           WHERE (maestros.user_id = auth.uid()))))))))))` | — |
| `maestro_indicadores_update` | UPDATE | authenticated | PERMISSIVE | `(es_admin() OR es_coordinador_acm() OR (objetivo_id IN ( SELECT maestro_objetivos.id    FROM maestro_objetivos   WHERE (maestro_objetivos.unidad_id IN ( SELECT maestro_unidades.id            FROM maestro_unidades           WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id                    FROM maestro_routes                   WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id                            FROM maestros                           WHERE (maestros.user_id = auth.uid()))))))))))` | `(es_admin() OR es_coordinador_acm() OR (objetivo_id IN ( SELECT maestro_objetivos.id    FROM maestro_objetivos   WHERE (maestro_objetivos.unidad_id IN ( SELECT maestro_unidades.id            FROM maestro_unidades           WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id                    FROM maestro_routes                   WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id                            FROM maestros                           WHERE (maestros.user_id = auth.uid()))))))))))` |
| `maestro_indicadores_write` | INSERT | authenticated | PERMISSIVE | — | `(es_admin() OR es_coordinador_acm() OR (objetivo_id IN ( SELECT maestro_objetivos.id    FROM maestro_objetivos   WHERE (maestro_objetivos.unidad_id IN ( SELECT maestro_unidades.id            FROM maestro_unidades           WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id                    FROM maestro_routes                   WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id                            FROM maestros                           WHERE (maestros.user_id = auth.uid()))))))))))` |

### `indicador_prerequisito`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `indicador_prerequisito_delete` | DELETE | authenticated | PERMISSIVE | `(es_admin() OR es_coordinador_acm() OR (indicador_id IN ( SELECT maestro_indicadores.id    FROM maestro_indicadores   WHERE (maestro_indicadores.objetivo_id IN ( SELECT maestro_objetivos.id            FROM maestro_objetivos           WHERE (maestro_objetivos.unidad_id IN ( SELECT maestro_unidades.id                    FROM maestro_unidades                   WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id                            FROM maestro_routes                           WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id                                    FROM maestros                                   WHERE (maestros.user_id = auth.uid()))))))))))))` | — |
| `indicador_prerequisito_select` | SELECT | authenticated | PERMISSIVE | `(es_admin() OR es_coordinador_acm() OR (indicador_id IN ( SELECT maestro_indicadores.id    FROM maestro_indicadores   WHERE (maestro_indicadores.objetivo_id IN ( SELECT maestro_objetivos.id            FROM maestro_objetivos           WHERE (maestro_objetivos.unidad_id IN ( SELECT maestro_unidades.id                    FROM maestro_unidades                   WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id                            FROM maestro_routes                           WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id                                    FROM maestros                                   WHERE (maestros.user_id = auth.uid()))))))))))))` | — |
| `indicador_prerequisito_write` | INSERT | authenticated | PERMISSIVE | — | `(es_admin() OR es_coordinador_acm() OR (indicador_id IN ( SELECT maestro_indicadores.id    FROM maestro_indicadores   WHERE (maestro_indicadores.objetivo_id IN ( SELECT maestro_objetivos.id            FROM maestro_objetivos           WHERE (maestro_objetivos.unidad_id IN ( SELECT maestro_unidades.id                    FROM maestro_unidades                   WHERE (maestro_unidades.ruta_id IN ( SELECT maestro_routes.id                            FROM maestro_routes                           WHERE (maestro_routes.maestro_id IN ( SELECT maestros.id                                    FROM maestros                                   WHERE (maestros.user_id = auth.uid()))))))))))))` |

### `alumnos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Maestros ven alumnos de sus clases` | SELECT | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM alumnos_clases ac   WHERE ((ac.alumno_id = alumnos.id) AND maestro_en_clase(ac.clase_id))))` | — |
| `alumnos_admin_delete` | DELETE | authenticated | PERMISSIVE | `(( SELECT is_admin() AS is_admin) = true)` | — |
| `alumnos_admin_insert` | INSERT | authenticated | PERMISSIVE | — | `(( SELECT is_admin() AS is_admin) = true)` |
| `alumnos_admin_read` | SELECT | authenticated | PERMISSIVE | `(es_admin() OR (EXISTS ( SELECT 1    FROM (alumnos_clases ac      JOIN clases c ON ((c.id = ac.clase_id)))   WHERE ((ac.alumno_id = alumnos.id) AND (c.maestro_principal_id = auth.uid())))))` | — |
| `alumnos_admin_update` | UPDATE | authenticated | PERMISSIVE | `(( SELECT is_admin() AS is_admin) = true)` | `(( SELECT is_admin() AS is_admin) = true)` |
| `alumnos_delete_admin` | DELETE | authenticated | PERMISSIVE | `es_admin()` | — |
| `alumnos_insert_authenticated` | INSERT | authenticated | PERMISSIVE | — | `(maestro_actual() IS NOT NULL)` |
| `alumnos_read_all` | SELECT | public | PERMISSIVE | `true` | — |
| `alumnos_teacher_insert` | INSERT | authenticated | PERMISSIVE | — | `(( SELECT teacher_can_create_students() AS teacher_can_create_students) = true)` |
| `alumnos_update_own` | UPDATE | authenticated | PERMISSIVE | `(es_admin() OR (EXISTS ( SELECT 1    FROM (alumnos_clases ac      JOIN clases c ON ((c.id = ac.clase_id)))   WHERE ((ac.alumno_id = alumnos.id) AND (c.maestro_principal_id = auth.uid())))))` | — |

### `finanzas_politica_cobranza`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `finanzas_politica_cobranza_authenticated_read` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `tareas_institucionales`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `tareas_auth_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `calendario_institucional`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `calendario_auth_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `hermes_protocolos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `protocolos_admin_write` | ALL | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |
| `protocolos_auth_read` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `evaluations`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Evaluations delete policy` | DELETE | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM app_users au   WHERE ((au.id = auth.uid()) AND ((au.role = 'admin'::text) OR ((au.role = 'jurado'::text) AND (au.jurado_id = evaluations.jurado_id))))))` | — |
| `Evaluations insert policy` | INSERT | authenticated | PERMISSIVE | — | `(EXISTS ( SELECT 1    FROM app_users au   WHERE ((au.id = auth.uid()) AND ((au.role = 'admin'::text) OR ((au.role = 'jurado'::text) AND (au.jurado_id = evaluations.jurado_id))))))` |
| `Evaluations read policy` | SELECT | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM app_users au   WHERE ((au.id = auth.uid()) AND ((au.role = 'admin'::text) OR ((au.role = 'jurado'::text) AND (au.jurado_id = evaluations.jurado_id))))))` | — |
| `Evaluations update policy` | UPDATE | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM app_users au   WHERE ((au.id = auth.uid()) AND ((au.role = 'admin'::text) OR ((au.role = 'jurado'::text) AND (au.jurado_id = evaluations.jurado_id))))))` | `(EXISTS ( SELECT 1    FROM app_users au   WHERE ((au.id = auth.uid()) AND ((au.role = 'admin'::text) OR ((au.role = 'jurado'::text) AND (au.jurado_id = evaluations.jurado_id))))))` |

### `sections`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow admin modify sections` | ALL | authenticated | PERMISSIVE | `is_app_admin()` | `is_app_admin()` |
| `Allow public read sections` | SELECT | public | PERMISSIVE | `true` | — |

### `repertoire_items`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow admin modify repertoire_items` | ALL | authenticated | PERMISSIVE | `is_app_admin()` | `is_app_admin()` |
| `Allow public read repertoire_items` | SELECT | public | PERMISSIVE | `true` | — |

### `app_users`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `App users admin modify policy` | ALL | authenticated | PERMISSIVE | `is_app_admin()` | `is_app_admin()` |
| `App users select policy` | SELECT | public | PERMISSIVE | `true` | — |
| `App users self insert policy` | INSERT | authenticated | PERMISSIVE | — | `(id = auth.uid())` |
| `App users self update policy` | UPDATE | authenticated | PERMISSIVE | `(id = auth.uid())` | `(id = auth.uid())` |

### `calendario`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `calendario_admin_all` | ALL | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | — |
| `calendario_insert_own_dept` | INSERT | public | PERMISSIVE | — | `((departamento_id IN ( SELECT usuario_departamentos.departamento_id    FROM usuario_departamentos   WHERE (usuario_departamentos.user_id = auth.uid()))) AND (created_by = auth.uid()))` |
| `calendario_select_own_dept` | SELECT | public | PERMISSIVE | `(departamento_id IN ( SELECT usuario_departamentos.departamento_id    FROM usuario_departamentos   WHERE (usuario_departamentos.user_id = auth.uid())))` | — |
| `calendario_update_own_dept` | UPDATE | public | PERMISSIVE | `(departamento_id IN ( SELECT usuario_departamentos.departamento_id    FROM usuario_departamentos   WHERE (usuario_departamentos.user_id = auth.uid())))` | — |

### `tareas_calendario`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `tareas_admin_all` | ALL | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | — |
| `tareas_select_own_dept` | SELECT | public | PERMISSIVE | `((departamento_id IN ( SELECT usuario_departamentos.departamento_id    FROM usuario_departamentos   WHERE (usuario_departamentos.user_id = auth.uid()))) OR (asignado_a = auth.uid()))` | — |
| `tareas_update_own` | UPDATE | public | PERMISSIVE | `((asignado_a = auth.uid()) OR (departamento_id IN ( SELECT usuario_departamentos.departamento_id    FROM usuario_departamentos   WHERE ((usuario_departamentos.user_id = auth.uid()) AND (usuario_departamentos.rol = 'jefe'::text)))))` | — |

### `tarea_logs`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `logs_admin` | SELECT | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | — |
| `logs_own_tarea` | SELECT | public | PERMISSIVE | `(tarea_id IN ( SELECT tareas_calendario.id    FROM tareas_calendario   WHERE (tareas_calendario.departamento_id IN ( SELECT usuario_departamentos.departamento_id            FROM usuario_departamentos           WHERE (usuario_departamentos.user_id = auth.uid())))))` | — |

### `usuario_departamentos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `user_dept_admin` | ALL | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | — |
| `user_dept_own` | SELECT | public | PERMISSIVE | `(user_id = auth.uid())` | — |

### `protocolos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `protocolos_admin` | ALL | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | — |
| `protocolos_select` | SELECT | public | PERMISSIVE | `(activo = true)` | — |

### `evaluacion_indicador`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin_all_ei` | ALL | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |
| `ei_owner` | ALL | authenticated | PERMISSIVE | `(es_admin() OR es_maestro_de_clase(clase_id))` | `(es_maestro_de_clase(clase_id) AND (evaluado_por = maestro_actual()))` |
| `teacher_delete_own_ei` | DELETE | authenticated | PERMISSIVE | `((evaluado_por = auth.uid()) OR es_admin())` | — |
| `teacher_insert_ei` | INSERT | authenticated | PERMISSIVE | — | `((evaluado_por = auth.uid()) OR (evaluado_por IS NULL) OR es_admin())` |
| `teacher_read_own_ei` | SELECT | authenticated | PERMISSIVE | `((evaluado_por = auth.uid()) OR (evaluado_por IS NULL) OR es_admin())` | — |
| `teacher_update_own_ei` | UPDATE | authenticated | PERMISSIVE | `((evaluado_por = auth.uid()) OR (evaluado_por IS NULL) OR es_admin())` | `((evaluado_por = auth.uid()) OR (evaluado_por IS NULL) OR es_admin())` |

### `alertas_log`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `alertas_log_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `departamentos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `departamentos_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `hermes_acciones`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `hermes_acciones_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `hermes_evaluaciones`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `hermes_evaluaciones_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `hermes_notificaciones`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `hermes_notificaciones_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `tareas_portales`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `tareas_portales_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `comunicaciones_seguimiento`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `com_seg_delete_authenticated` | DELETE | authenticated | PERMISSIVE | `true` | — |
| `com_seg_insert_authenticated` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `com_seg_select_authenticated` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `com_seg_update_authenticated` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |

### `hermes_feedback`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `hermes_feedback_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `conversaciones_whatsapp`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `allow_all_conversaciones` | ALL | public | PERMISSIVE | `true` | `true` |

### `whatsapp_webhook_log`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `webhook_log_admin_read` | SELECT | authenticated | PERMISSIVE | `es_admin()` | — |
| `webhook_log_service_role_all` | ALL | service_role | PERMISSIVE | `true` | `true` |

### `node_resources`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Full access for admins` | ALL | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text))))` | — |
| `Public read for authenticated users` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `instituciones`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `camp_instituciones_delete_authenticated` | DELETE | authenticated | PERMISSIVE | `true` | — |
| `camp_instituciones_insert_authenticated` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `camp_instituciones_select_authenticated` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `camp_instituciones_update_authenticated` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |

### `campanias_marketing`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `camp_campanias_delete_authenticated` | DELETE | authenticated | PERMISSIVE | `true` | — |
| `camp_campanias_insert_authenticated` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `camp_campanias_select_authenticated` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `camp_campanias_update_authenticated` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |

### `campanias_destinatarios`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `camp_destinatarios_delete_authenticated` | DELETE | authenticated | PERMISSIVE | `true` | — |
| `camp_destinatarios_insert_authenticated` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `camp_destinatarios_select_authenticated` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `camp_destinatarios_update_authenticated` | UPDATE | authenticated | PERMISSIVE | `true` | `true` |

### `prospeccion_log`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `camp_prospeccion_insert_authenticated` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `camp_prospeccion_select_authenticated` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `campania_envios`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `ce_admin_all` | ALL | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |

### `whatsapp_optout`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `wo_admin_all` | ALL | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |

### `whatsapp_consentimientos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `wc_admin_all` | ALL | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |

### `campanias_periodo`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `cp_admin_all` | ALL | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |

### `hermes_whatsapp_queue`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `wa_queue_read_authenticated` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `wa_queue_service_role_all` | ALL | service_role | PERMISSIVE | `true` | `true` |

### `hermes_whatsapp_config`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `wa_config_admin_all` | ALL | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |
| `wa_config_service_role_all` | ALL | service_role | PERMISSIVE | `true` | `true` |

### `tarea_comentarios`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `tc_auth_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `tarea_historial`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `th_auth_read` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `instrumentos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `instrumentos_auth_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `lut_diagnosticos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `lut_diagnosticos_auth_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `soi_process_contracts`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `soi_process_contracts_auth_read` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `soi_process_contracts_auth_write` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `hermes_process_cases`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `hermes_process_cases_auth_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `lut_ordenes_reparacion`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `lut_ordenes_auth_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `lut_presupuestos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `lut_presupuestos_auth_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `lut_insumos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `lut_insumos_auth_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `lut_movimientos_insumos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `lut_movimientos_auth_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `lut_solicitudes_compra`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `lut_solicitudes_auth_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `lut_evidencias`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `lut_evidencias_auth_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `clase_mapa_indicadores`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `clase_mapa_indicadores_owner` | ALL | authenticated | PERMISSIVE | `(es_admin() OR es_coordinador_acm() OR es_maestro_titular_de_clase(clase_id))` | `(es_admin() OR es_coordinador_acm() OR es_maestro_titular_de_clase(clase_id))` |

### `clase_mapa_objetivos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `clase_mapa_objetivos_owner` | ALL | authenticated | PERMISSIVE | `(es_admin() OR es_coordinador_acm() OR es_maestro_titular_de_clase(clase_id))` | `(es_admin() OR es_coordinador_acm() OR es_maestro_titular_de_clase(clase_id))` |

### `periodos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `periodos_admin_delete` | DELETE | authenticated | PERMISSIVE | `(es_admin() AND (cerrado IS NOT TRUE))` | — |
| `periodos_admin_insert` | INSERT | authenticated | PERMISSIVE | — | `es_admin()` |
| `periodos_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `periodos_admin_update` | UPDATE | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |

### `telegram_messages_raw`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `deny_anon` | ALL | anon | PERMISSIVE | `false` | `false` |
| `deny_authenticated` | ALL | authenticated | PERMISSIVE | `false` | `false` |
| `service_role_all` | ALL | service_role | PERMISSIVE | `true` | `true` |

### `hermes_inbox`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `hermes_inbox_service_only` | ALL | service_role | PERMISSIVE | `true` | `true` |

### `periodos_cierre_auditoria`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `periodos_cierre_auditoria_admin_read` | SELECT | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND (p.rol = 'admin'::text) AND (p.estado = 'activo'::text))))` | — |
| `periodos_cierre_auditoria_service_only` | ALL | service_role | PERMISSIVE | `true` | `true` |

### `telegram_allowed_users`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `authenticated_read_own` | SELECT | authenticated | PERMISSIVE | `((created_by = auth.uid()) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text)))))` | — |
| `service_role_all` | ALL | service_role | PERMISSIVE | `true` | `true` |

### `acm_weekly_plan_items`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `acm_weekly_plan_items_admin_write` | ALL | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |
| `acm_weekly_plan_items_read` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `solicitudes_necesidades`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `solic_insert_own` | INSERT | authenticated | PERMISSIVE | — | `(maestro_id IN ( SELECT maestros.id    FROM maestros   WHERE (maestros.user_id = auth.uid())))` |
| `solic_select_owner_acm_fin_admin` | SELECT | authenticated | PERMISSIVE | `((maestro_id IN ( SELECT maestros.id    FROM maestros   WHERE (maestros.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text)))) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'cajero'::text)))))` | — |
| `solic_update_acm_admin_stage` | UPDATE | authenticated | PERMISSIVE | `((estado = 'pendiente'::text) AND (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text)))))` | `((estado = ANY (ARRAY['pre_aprobada_acm'::text, 'rechazada_acm'::text, 'en_presupuesto'::text])) AND (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text)))))` |
| `solic_update_admin_override` | UPDATE | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text))))` | `(EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text))))` |
| `solic_update_fin_admin_cajero_stage` | UPDATE | authenticated | PERMISSIVE | `((estado = ANY (ARRAY['en_presupuesto'::text, 'presupuestada'::text])) AND (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.rol = ANY (ARRAY['admin'::text, 'cajero'::text]))))))` | `((estado = ANY (ARRAY['presupuestada'::text, 'aprobada'::text, 'rechazada'::text, 'comprada'::text, 'entregada'::text])) AND (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.rol = ANY (ARRAY['admin'::text, 'cajero'::text]))))))` |
| `solic_update_owner_cancel` | UPDATE | authenticated | PERMISSIVE | `((estado = 'pendiente'::text) AND (maestro_id IN ( SELECT maestros.id    FROM maestros   WHERE (maestros.user_id = auth.uid()))))` | `((estado = 'cancelada'::text) AND (maestro_id IN ( SELECT maestros.id    FROM maestros   WHERE (maestros.user_id = auth.uid()))))` |

### `programas_prerrequisitos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `prerrequisitos_select_authenticated` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `alumnos_programas`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Enable read access for all users` | SELECT | public | PERMISSIVE | `true` | — |
| `alumnos_programas_admin_read` | SELECT | public | PERMISSIVE | `es_admin()` | — |
| `alumnos_programas_authenticated_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `contactos_alianzas`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `contactos_alianzas_autenticados` | ALL | public | PERMISSIVE | `(auth.role() = 'authenticated'::text)` | — |

### `sim_runs`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `sim_runs_auth_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `pagos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `pagos_insert_cajero_admin` | INSERT | public | PERMISSIVE | — | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` |
| `pagos_select_cajero_admin` | SELECT | public | PERMISSIVE | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` | — |
| `pagos_select_representante` | SELECT | public | PERMISSIVE | `((get_user_role() = 'representante'::text) AND (familia_id = get_user_familia_id()))` | — |
| `pagos_update_admin` | UPDATE | public | PERMISSIVE | `(get_user_role() = 'admin'::text)` | `(get_user_role() = 'admin'::text)` |

### `mapa_plantillas`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `plantillas_admin` | ALL | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |
| `plantillas_read` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `sim_calendario`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `sim_calendario_auth_all` | ALL | authenticated | PERMISSIVE | `true` | `true` |

### `sim_tareas`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `sim_tareas_admin_write` | ALL | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |
| `sim_tareas_auth_read` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `sim_outbox`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `sim_outbox_admin_write` | ALL | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |
| `sim_outbox_auth_read` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `sim_config`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `sim_config_admin_write` | ALL | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |
| `sim_config_auth_read` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `sim_actores`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `sim_actores_admin_write` | ALL | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |
| `sim_actores_auth_read` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `sim_log`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `sim_log_admin_write` | INSERT | authenticated | PERMISSIVE | — | `es_admin()` |
| `sim_log_auth_read` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `acm_curriculum_sources`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `acm_curriculum_sources_admin_write` | ALL | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |
| `acm_curriculum_sources_read` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `acm_curriculum_versions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `acm_curriculum_versions_admin_write` | ALL | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |
| `acm_curriculum_versions_read` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `acm_weekly_plans`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `acm_weekly_plans_admin_write` | ALL | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |
| `acm_weekly_plans_read` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `sesion_bitacora`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `bitacora_acm_read` | SELECT | authenticated | PERMISSIVE | `es_coordinador_acm()` | — |
| `bitacora_owner` | ALL | authenticated | PERMISSIVE | `(es_maestro_de_clase(clase_id) AND (maestro_id = maestro_actual()))` | `(es_maestro_de_clase(clase_id) AND (maestro_id = maestro_actual()))` |

### `wallet_movimientos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `wallet_mov_select_cajero_admin` | SELECT | public | PERMISSIVE | `(get_user_role() = ANY (ARRAY['cajero'::text, 'admin'::text]))` | — |
| `wallet_mov_select_representante` | SELECT | public | PERMISSIVE | `((get_user_role() = 'representante'::text) AND (familia_id = get_user_familia_id()))` | — |

### `acm_active_routes`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `acm_active_routes_owner` | ALL | authenticated | PERMISSIVE | `(es_admin() OR (teacher_id = maestro_actual()))` | `(es_admin() OR (teacher_id = maestro_actual()))` |

### `teacher_class_sessions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `teacher_class_sessions_owner` | ALL | authenticated | PERMISSIVE | `(es_admin() OR (teacher_id = maestro_actual()))` | `(es_admin() OR (teacher_id = maestro_actual()))` |

### `teacher_session_indicators`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `teacher_session_indicators_owner` | ALL | authenticated | PERMISSIVE | `(es_admin() OR (EXISTS ( SELECT 1    FROM teacher_class_sessions s   WHERE ((s.id = teacher_session_indicators.session_id) AND (s.teacher_id = maestro_actual())))))` | `(es_admin() OR (EXISTS ( SELECT 1    FROM teacher_class_sessions s   WHERE ((s.id = teacher_session_indicators.session_id) AND (s.teacher_id = maestro_actual())))))` |

### `student_indicator_progress`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `student_indicator_progress_scoped` | ALL | authenticated | PERMISSIVE | `(es_admin() OR (EXISTS ( SELECT 1    FROM teacher_class_sessions s   WHERE ((s.id = student_indicator_progress.session_id) AND (s.teacher_id = maestro_actual())))))` | `(es_admin() OR (EXISTS ( SELECT 1    FROM teacher_class_sessions s   WHERE ((s.id = student_indicator_progress.session_id) AND (s.teacher_id = maestro_actual())))))` |

### `acm_evidence_files`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `acm_evidence_files_scoped` | ALL | authenticated | PERMISSIVE | `(es_admin() OR (uploaded_by = auth.uid()) OR (EXISTS ( SELECT 1    FROM teacher_class_sessions s   WHERE ((s.id = acm_evidence_files.session_id) AND (s.teacher_id = maestro_actual())))))` | `(es_admin() OR (uploaded_by = auth.uid()) OR (EXISTS ( SELECT 1    FROM teacher_class_sessions s   WHERE ((s.id = acm_evidence_files.session_id) AND (s.teacher_id = maestro_actual())))))` |

### `acm_teacher_week_adjustments`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `acm_teacher_week_adjustments_owner` | ALL | authenticated | PERMISSIVE | `(es_admin() OR (teacher_id = maestro_actual()))` | `(es_admin() OR (teacher_id = maestro_actual()))` |

### `maestro_desempeno`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admin_read_md` | SELECT | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.rol = 'admin'::text))))` | — |
| `system_update_md` | UPDATE | service_role | PERMISSIVE | `true` | `true` |
| `system_write_md` | INSERT | service_role | PERMISSIVE | — | `true` |

### `soi_event_bus`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `soi_event_bus_service_only` | ALL | service_role | PERMISSIVE | `true` | `true` |

### `objetivos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `teacher_read_objetivos` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `audiciones`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Permitir escritura solo a jurado y administradores` | INSERT | authenticated | PERMISSIVE | — | `((auth.role() = 'service_role'::text) OR ((auth.jwt() ->> 'role'::text) = ANY (ARRAY['jurado'::text, 'admin'::text])) OR ((auth.jwt() ->> 'email'::text) = 'jurado1@test.com'::text))` |
| `Permitir lectura para usuarios autenticados` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `soi_eventos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `soi_eventos_acm_select` | SELECT | public | PERMISSIVE | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ACM'::text) AND (entidad_tipo = ANY (ARRAY['sesiones_clase'::text, 'asistencias'::text, 'periodos'::text])))` | — |
| `soi_eventos_adm_select` | SELECT | public | PERMISSIVE | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ADM'::text) AND (entidad_tipo = ANY (ARRAY['justificaciones'::text, 'periodos'::text])))` | — |
| `soi_eventos_dir_select` | SELECT | public | PERMISSIVE | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'DIR'::text))` | — |
| `soi_eventos_fin_select` | SELECT | public | PERMISSIVE | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'FIN'::text) AND false)` | — |
| `soi_eventos_immutable_delete` | DELETE | public | PERMISSIVE | `false` | — |
| `soi_eventos_immutable_update` | UPDATE | public | PERMISSIVE | `false` | `false` |
| `soi_eventos_log_select` | SELECT | public | PERMISSIVE | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'LOG'::text) AND (entidad_tipo = 'tareas_institucionales'::text))` | — |
| `soi_eventos_service_role_all` | ALL | public | PERMISSIVE | `(auth.role() = 'service_role'::text)` | `(auth.role() = 'service_role'::text)` |
| `soi_eventos_tecnico_select` | SELECT | public | PERMISSIVE | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'TECNICO'::text) AND false)` | — |

### `catalogo_niveles`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `catalogo_niveles_admin` | ALL | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |
| `catalogo_niveles_read` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `catalogo_objetivos_generales`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `catalogo_objetivos_generales_admin` | ALL | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |
| `catalogo_objetivos_generales_read` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `catalogo_objetivos_especificos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `catalogo_objetivos_especificos_admin` | ALL | authenticated | PERMISSIVE | `es_admin()` | `es_admin()` |
| `catalogo_objetivos_especificos_read` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `hermes_reactive_rules`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `hermes_rules_acm_select` | SELECT | public | PERMISSIVE | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ACM'::text) AND (departamento = 'ACM'::text))` | — |
| `hermes_rules_acm_update` | UPDATE | public | PERMISSIVE | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ACM'::text) AND (departamento = 'ACM'::text))` | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ACM'::text) AND (departamento = 'ACM'::text))` |
| `hermes_rules_adm_select` | SELECT | public | PERMISSIVE | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ADM'::text) AND (departamento = 'ADM'::text))` | — |
| `hermes_rules_adm_update` | UPDATE | public | PERMISSIVE | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ADM'::text) AND (departamento = 'ADM'::text))` | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'ADM'::text) AND (departamento = 'ADM'::text))` |
| `hermes_rules_com_select` | SELECT | public | PERMISSIVE | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'COM'::text) AND (departamento = 'COM'::text))` | — |
| `hermes_rules_dir_insert` | INSERT | public | PERMISSIVE | — | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'DIR'::text))` |
| `hermes_rules_dir_select` | SELECT | public | PERMISSIVE | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'DIR'::text))` | — |
| `hermes_rules_dir_update` | UPDATE | public | PERMISSIVE | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'DIR'::text))` | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'DIR'::text))` |
| `hermes_rules_fin_select` | SELECT | public | PERMISSIVE | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'FIN'::text) AND (departamento = 'FIN'::text))` | — |
| `hermes_rules_log_select` | SELECT | public | PERMISSIVE | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'LOG'::text) AND (departamento = 'LOG'::text))` | — |
| `hermes_rules_log_update` | UPDATE | public | PERMISSIVE | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'LOG'::text) AND (departamento = 'LOG'::text))` | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'LOG'::text) AND (departamento = 'LOG'::text))` |
| `hermes_rules_lut_select` | SELECT | public | PERMISSIVE | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'LUT'::text) AND (departamento = 'LUT'::text))` | — |
| `hermes_rules_service_role_all` | ALL | public | PERMISSIVE | `(auth.role() = 'service_role'::text)` | `(auth.role() = 'service_role'::text)` |
| `hermes_rules_tecnico_select` | SELECT | public | PERMISSIVE | `((auth.role() = 'authenticated'::text) AND (get_user_department() = 'TECNICO'::text) AND (departamento = 'TECNICO'::text))` | — |

### `notificaciones_asistencia`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `hermes_update_notifications` | UPDATE | public | PERMISSIVE | `true` | `true` |
| `portal_insert_notifications` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `portal_read_own_notifications` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `pulso_score_history`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `pulso_score_history_auth_select` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `pulso_score_history_service_all` | ALL | service_role | PERMISSIVE | `true` | `true` |


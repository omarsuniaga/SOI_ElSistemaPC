// Mock de Observabilidad para Modo Demo
const inMemoryLogs = [
  // --- INFO logs ---
  {
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    level: 'INFO',
    module: 'PWA',
    message: 'Core Web Vitals: FID: 12ms, LCP: 950ms, CLS: 0.01.',
    network: 'Online',
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 36).toISOString(),
    level: 'INFO',
    module: 'SyncManager',
    message: 'Network online detected. Synchronizing queue of 3 records.',
    network: 'Online',
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    level: 'INFO',
    module: 'ServiceWorker',
    message: 'SW cached all static assets successfully. Version 2.1.0.',
    network: 'Online',
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    level: 'INFO',
    module: 'PWA',
    message:
      'Core Web Vitals: FID: 11ms (Excelente), LCP: 980ms (Excelente), CLS: 0.012 (Excelente).',
    network: 'Online',
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    level: 'INFO',
    module: 'AuthModule',
    message: 'User session validated successfully. Token refreshed.',
    network: 'Online',
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    level: 'INFO',
    module: 'IndexedDB',
    message: 'Offline store initialized with 12 pending records.',
    network: 'Offline',
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    level: 'INFO',
    module: 'SyncManager',
    message: 'Background sync completed: 8 records pushed to server.',
    network: 'Online',
  },

  // --- WARNING logs ---
  {
    timestamp: new Date(Date.now() - 3600000 * 30).toISOString(),
    level: 'WARNING',
    module: 'SyncManager',
    message: 'Network offline detected. Queuing 3 pending academic attendance records locally.',
    network: 'Offline',
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
    level: 'WARNING',
    module: 'HTTPClient',
    message:
      'Request timed out for endpoint /rpc/get_institutional_radar. Falling back to offline fallback state.',
    stack: 'TimeoutException: Request took longer than 5000ms',
    network: 'Online',
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
    level: 'WARNING',
    module: 'SupabaseClient',
    message: 'Rate limit approaching: 85/100 requests in current window.',
    network: 'Online',
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    level: 'WARNING',
    module: 'CacheAPI',
    message: 'Cache storage nearly full (42MB / 50MB). Consider clearing old entries.',
    network: 'Online',
  },

  // --- ERROR logs ---
  {
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    level: 'ERROR',
    module: 'SupabaseClient',
    message: 'Failed to query public.ausencias_auditoria due to temporary connection timeout.',
    network: 'Online',
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    level: 'ERROR',
    module: 'AuthModule',
    message:
      'Policy check violation for non-admin user trying to access logs. Terminating session gracefully.',
    network: 'Online',
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    level: 'ERROR',
    module: 'SyncManager',
    message: 'Failed to push 2 attendance records: 409 Conflict — record already exists.',
    network: 'Online',
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    level: 'ERROR',
    module: 'ServiceWorker',
    message: 'Unhandled promise rejection: TypeError: Failed to fetch dynamically imported module.',
    stack: 'TypeError: Failed to fetch\n  at HTMLScriptElement.onerror (serviceWorker.js:42)',
    network: 'Online',
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    level: 'ERROR',
    module: 'IndexedDB',
    message: 'Transaction aborted: QuotaExceededError when attempting to store log batch.',
    network: 'Online',
  },
]

const mockAuditLogs = [
  // --- Original entries (3) ---
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    usuario_id: 'admin@gentleai.com',
    usuario_nombre: 'Administrador Principal',
    accion: 'APROBACION_FINAL',
    notas: 'Ausencia aprobada automáticamente por cumplimiento de documentos adjuntos.',
    creado_a: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
    detalles: {
      motivo: 'Médico',
      maestro: 'Carlos Gómez',
      duracion: '3 días',
    },
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a23',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a34',
    usuario_id: 'director@gentleai.com',
    usuario_nombre: 'Juan Director',
    accion: 'CREACION',
    notas: 'Registro inicial de solicitud de ausencia por comisión de servicios.',
    creado_a: new Date(Date.now() - 3600000 * 24 * 28).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 28).toISOString(),
    detalles: {
      motivo: 'Capacitación externa',
      maestro: 'María Luz',
      duracion: '1 día',
    },
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a24',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a34',
    usuario_id: 'coordinador@gentleai.com',
    usuario_nombre: 'Sofía Coordinadora',
    accion: 'RECHAZO',
    notas: 'Rechazada por falta de justificativo médico oficial impreso.',
    creado_a: new Date(Date.now() - 3600000 * 24 * 25).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 25).toISOString(),
    detalles: {
      motivo: 'Asuntos personales',
      maestro: 'Pedro Almonte',
      duracion: '2 días',
    },
  },

  // --- ausencia_creada entries (5) ---
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a25',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a35',
    usuario_id: 'maestro.violin@gentleai.com',
    usuario_nombre: 'Lucía Mendoza',
    accion: 'ausencia_creada',
    notas: 'Solicitud de ausencia por participación en festival regional de cuerdas.',
    creado_a: new Date(Date.now() - 3600000 * 24 * 22).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 22).toISOString(),
    detalles: {
      motivo: 'Comisión oficial',
      maestro: 'Lucía Mendoza',
      duracion: '2 días',
    },
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a26',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a36',
    usuario_id: 'maestro.piano@gentleai.com',
    usuario_nombre: 'Roberto Díaz',
    accion: 'ausencia_creada',
    notas: 'Incapacidad médica por laringitis diagnosticada.',
    creado_a: new Date(Date.now() - 3600000 * 24 * 20).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 20).toISOString(),
    detalles: {
      motivo: 'Médico',
      maestro: 'Roberto Díaz',
      duracion: '5 días',
    },
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a27',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a37',
    usuario_id: 'maestro.percusion@gentleai.com',
    usuario_nombre: 'Ana Martínez',
    accion: 'ausencia_creada',
    notas: 'Solicitud por duelo familiar (fallecimiento de familiar directo).',
    creado_a: new Date(Date.now() - 3600000 * 24 * 18).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 18).toISOString(),
    detalles: {
      motivo: 'Duelo',
      maestro: 'Ana Martínez',
      duracion: '3 días',
    },
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a28',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a38',
    usuario_id: 'maestro.cuerdas@gentleai.com',
    usuario_nombre: 'Pedro Castillo',
    accion: 'ausencia_creada',
    notas: 'Ausencia por capacitación pedagógica en el extranjero.',
    creado_a: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
    detalles: {
      motivo: 'Capacitación',
      maestro: 'Pedro Castillo',
      duracion: '7 días',
    },
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a29',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a39',
    usuario_id: 'maestro.vientos@gentleai.com',
    usuario_nombre: 'Carmen Rivas',
    accion: 'ausencia_creada',
    notas: 'Solicitud por emergencia familiar de último momento.',
    creado_a: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
    detalles: {
      motivo: 'Emergencia familiar',
      maestro: 'Carmen Rivas',
      duracion: '1 día',
    },
  },

  // --- estado_modificado entries (5) ---
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a30',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a40',
    usuario_id: 'admin@gentleai.com',
    usuario_nombre: 'Administrador Principal',
    accion: 'estado_modificado',
    notas: 'Cambio de estado: pendiente → aprobada. Documentación completa.',
    creado_a: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    detalles: {
      estado_anterior: 'pendiente',
      estado_nuevo: 'aprobada',
      motivo_cambio: 'Documentación completa',
    },
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a31',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a41',
    usuario_id: 'coordinador@gentleai.com',
    usuario_nombre: 'Sofía Coordinadora',
    accion: 'estado_modificado',
    notas: 'Cambio de estado: aprobada → rechazada. Se detectó inconsistencia en fechas.',
    creado_a: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
    detalles: {
      estado_anterior: 'aprobada',
      estado_nuevo: 'rechazada',
      motivo_cambio: 'Inconsistencia en fechas',
    },
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a32',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a42',
    usuario_id: 'director@gentleai.com',
    usuario_nombre: 'Juan Director',
    accion: 'estado_modificado',
    notas: 'Cambio de estado: pendiente → en_revision. Se solicitaron documentos adicionales.',
    creado_a: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
    detalles: {
      estado_anterior: 'pendiente',
      estado_nuevo: 'en_revision',
      motivo_cambio: 'Documentos adicionales requeridos',
    },
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a43',
    usuario_id: 'admin@gentleai.com',
    usuario_nombre: 'Administrador Principal',
    accion: 'estado_modificado',
    notas: 'Cambio de estado: en_revision → aprobada. Todo en orden.',
    creado_a: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    detalles: {
      estado_anterior: 'en_revision',
      estado_nuevo: 'aprobada',
      motivo_cambio: 'Documentación verificada',
    },
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a34',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    usuario_id: 'admin@gentleai.com',
    usuario_nombre: 'Administrador Principal',
    accion: 'estado_modificado',
    notas: 'Cambio de estado: aprobada → cancelada. El maestro solicitó cancelación.',
    creado_a: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    detalles: {
      estado_anterior: 'aprobada',
      estado_nuevo: 'cancelada',
      motivo_cambio: 'Solicitud del maestro',
    },
  },

  // --- permiso_aprobado entries (5) ---
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a35',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a45',
    usuario_id: 'admin@gentleai.com',
    usuario_nombre: 'Administrador Principal',
    accion: 'permiso_aprobado',
    notas: 'Permiso especial aprobado para asistir a congreso de educación musical.',
    creado_a: new Date(Date.now() - 3600000 * 24 * 21).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 21).toISOString(),
    detalles: {
      tipo_permiso: 'Congreso',
      maestro: 'Santiago Ortiz',
      duracion: '3 días',
    },
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a36',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a46',
    usuario_id: 'director@gentleai.com',
    usuario_nombre: 'Juan Director',
    accion: 'permiso_aprobado',
    notas: 'Permiso por medio día para trámite personal urgente.',
    creado_a: new Date(Date.now() - 3600000 * 24 * 17).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 17).toISOString(),
    detalles: {
      tipo_permiso: 'Personal',
      maestro: 'Valentina Suárez',
      duracion: '0.5 días',
    },
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a37',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a47',
    usuario_id: 'admin@gentleai.com',
    usuario_nombre: 'Administrador Principal',
    accion: 'permiso_aprobado',
    notas: 'Permiso sindical aprobado según convenio colectivo.',
    creado_a: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
    detalles: {
      tipo_permiso: 'Sindical',
      maestro: 'Ricardo Peña',
      duracion: '1 día',
    },
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a38',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a48',
    usuario_id: 'coordinador@gentleai.com',
    usuario_nombre: 'Sofía Coordinadora',
    accion: 'permiso_aprobado',
    notas: 'Permiso académico aprobado para rendir examen de posgrado.',
    creado_a: new Date(Date.now() - 3600000 * 24 * 9).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 9).toISOString(),
    detalles: {
      tipo_permiso: 'Académico',
      maestro: 'Daniela Ríos',
      duracion: '1 día',
    },
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a39',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a49',
    usuario_id: 'admin@gentleai.com',
    usuario_nombre: 'Administrador Principal',
    accion: 'permiso_aprobado',
    notas: 'Permiso especial aprobado para donación de sangre (beneficio institucional).',
    creado_a: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    detalles: {
      tipo_permiso: 'Beneficio institucional',
      maestro: 'Fernando Mora',
      duracion: '1 día',
    },
  },

  // --- Additional entries (5 more to reach 28 total) ---
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a29',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a40',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a50',
    usuario_id: 'maestro.vientos@gentleai.com',
    usuario_nombre: 'Miguel Ángel',
    accion: 'ausencia_creada',
    notas: 'Solicitud por enfermedad repentina. Adjunta certificado médico.',
    creado_a: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    detalles: {
      motivo: 'Enfermedad',
      maestro: 'Miguel Ángel',
      duracion: '2 días',
    },
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a41',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a51',
    usuario_id: 'admin@gentleai.com',
    usuario_nombre: 'Administrador Principal',
    accion: 'APROBACION_FINAL',
    notas: 'Aprobación final de ausencia por maternidad. Sustitución asignada.',
    creado_a: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    detalles: {
      motivo: 'Maternidad',
      maestro: 'Gabriela Torres',
      duracion: '90 días',
      sustituto: 'María Fernández',
    },
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a42',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a52',
    usuario_id: 'coordinador@gentleai.com',
    usuario_nombre: 'Sofía Coordinadora',
    accion: 'CREACION',
    notas: 'Registro de ausencia preventiva por brote de gripe en el aula.',
    creado_a: new Date(Date.now() - 3600000 * 12).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    detalles: {
      motivo: 'Preventivo',
      maestro: 'Varios',
      duracion: '2 días',
    },
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a43',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a53',
    usuario_id: 'director@gentleai.com',
    usuario_nombre: 'Juan Director',
    accion: 'RECHAZO',
    notas: 'Rechazada por superar el límite de días permitidos sin justificación.',
    creado_a: new Date(Date.now() - 3600000 * 6).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    detalles: {
      motivo: 'Exceso de días',
      maestro: 'Laura Jiménez',
      duracion: '15 días',
    },
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    ausencia_id: 'b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    actor_id: 'c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a54',
    usuario_id: 'admin@gentleai.com',
    usuario_nombre: 'Administrador Principal',
    accion: 'permiso_aprobado',
    notas: 'Permiso de cuidado familiar aprobado según normativa institucional.',
    creado_a: new Date(Date.now() - 3600000 * 3).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    detalles: {
      tipo_permiso: 'Cuidado familiar',
      maestro: 'Andrea Vega',
      duracion: '2 días',
    },
  },
]

const mockOperaciones = [
  {
    id: 'op-001',
    tipo: 'sincronizacion',
    descripcion: 'Sincronización masiva de asistencias del período',
    estado: 'completado',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    detalles: { registros_sincronizados: 234, duracion_ms: 3450 },
  },
  {
    id: 'op-002',
    tipo: 'reporte',
    descripcion: 'Generación de reporte mensual de rendimiento',
    estado: 'completado',
    timestamp: new Date(Date.now() - 3600000 * 36).toISOString(),
    detalles: { tipo_reporte: 'rendimiento', alumnos_incluidos: 120 },
  },
  {
    id: 'op-003',
    tipo: 'sincronizacion',
    descripcion: 'Respaldo de base de datos local a la nube',
    estado: 'fallido',
    timestamp: new Date(Date.now() - 3600000 * 30).toISOString(),
    detalles: { error: 'Conexión interrumpida durante la transferencia', tamano_mb: 256 },
  },
  {
    id: 'op-004',
    tipo: 'mantenimiento',
    descripcion: 'Limpieza de registros huérfanos en ausencias_auditoria',
    estado: 'completado',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    detalles: { registros_eliminados: 15 },
  },
  {
    id: 'op-005',
    tipo: 'reporte',
    descripcion: 'Exportación de estadísticas a Excel para dirección académica',
    estado: 'completado',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    detalles: { formato: 'xlsx', tamano_kb: 450 },
  },
  {
    id: 'op-006',
    tipo: 'sincronizacion',
    descripcion: 'Sincronización de perfiles de nuevos maestros',
    estado: 'completado',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    detalles: { maestros_sincronizados: 3, duracion_ms: 1200 },
  },
  {
    id: 'op-007',
    tipo: 'mantenimiento',
    descripcion: 'Actualización de índices de base de datos',
    estado: 'en_progreso',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    detalles: { tablas_afectadas: 5, progreso: '65%' },
  },
  {
    id: 'op-008',
    tipo: 'reporte',
    descripcion: 'Generación de alertas tempranas de abandono',
    estado: 'fallido',
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    detalles: { error: 'Timeout en consulta a vw_riesgo_abandono', duracion_ms: 15000 },
  },
  {
    id: 'op-009',
    tipo: 'sincronizacion',
    descripcion: 'Carga de planificación curricular del nuevo período',
    estado: 'pendiente',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    detalles: { periodo: '2026-02', archivos_pendientes: 8 },
  },
  {
    id: 'op-010',
    tipo: 'mantenimiento',
    descripcion: 'Compactación de almacenamiento offline (IndexedDB)',
    estado: 'completado',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    detalles: { espacio_liberado_mb: 12, registros_compactados: 340 },
  },
  {
    id: 'op-011',
    tipo: 'reporte',
    descripcion: 'Reporte de cumplimiento docente semanal',
    estado: 'completado',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    detalles: { tipo_reporte: 'cumplimiento', maestros_evaluados: 45 },
  },
]

/**
 * Obtiene los logs de excepciones técnicas del cliente (con latencia simulada)
 */
export async function getSystemLogs() {
  await new Promise((resolve) => setTimeout(resolve, 250)) // Simular latencia
  return [...inMemoryLogs]
}

/**
 * Obtiene el trail de auditorías transaccionales del sistema
 */
export async function getAuditLogs() {
  await new Promise((resolve) => setTimeout(resolve, 300)) // Simular latencia
  return [...mockAuditLogs]
}

/**
 * Registra una excepción técnica ocurrida en el cliente
 */
export async function recordSystemLog(logEntry) {
  await new Promise((resolve) => setTimeout(resolve, 50))
  const newLog = {
    timestamp: new Date().toISOString(),
    level: logEntry.level || 'INFO',
    module: logEntry.module || 'Client',
    message: logEntry.message || 'Sin mensaje de error especificado',
    network: navigator.onLine ? 'Online' : 'Offline',
    stack: logEntry.stack || '',
  }
  inMemoryLogs.unshift(newLog) // Añadir al inicio
  console.log('Mock: System Log registrado', newLog)
  return newLog
}

/**
 * Obtiene el registro de operaciones del sistema (sincronización, reportes, mantenimiento)
 */
export async function getOperaciones() {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return [...mockOperaciones]
}

/**
 * Compila el Payload DSL en modo Demo: retorna datos de prueba simulados
 * @param {string} _tipo - Tipo de reporte (no usado en demo, todos retornan datos simulados)
 * @returns {Promise<{radarData: Array, nodeDifficulty: Array, complianceData: Array}>}
 */
export async function callDslRpc(_tipo) {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return {
    radarData: [
      { id: '1', health_status: 'active', days_inactive: 2 },
      { id: '2', health_status: 'stagnant', days_inactive: 15 },
      { id: '3', health_status: 'stagnant', days_inactive: 20 },
      { id: '4', health_status: 'active', days_inactive: 0 },
      { id: '5', health_status: 'not_started', days_inactive: 30 },
    ],
    nodeDifficulty: [
      { node_name: 'Posición de Mano Izquierda (Violín)', failure_percentage: 75 },
      { node_name: 'Postura de Arco (Violín)', failure_percentage: 60 },
      { node_name: 'Afinación Básica', failure_percentage: 45 },
    ],
    complianceData: [
      { nombre: 'Carlos Gómez', categoria: 'negligente', sesiones_rojo: 8 },
      { nombre: 'María Luz', categoria: 'regular', sesiones_rojo: 3 },
      { nombre: 'Pedro Almonte', categoria: 'responsable', sesiones_rojo: 0 },
    ],
  }
}

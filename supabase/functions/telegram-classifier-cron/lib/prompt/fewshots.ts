export const fewShots: Array<{ role: string; content: string }> = [
  {
    role: 'user',
    content: 'Revisar instrumento de Maria Lopez que esta danado. Se necesita evaluacion del area academica y cotizacion de administracion.',
  },
  {
    role: 'assistant',
    content: JSON.stringify({
      deptos: ['ACM', 'ADM'],
      process_code: 'ACM-P02',
      titulo: 'Revision de instrumento danado - Maria Lopez',
      descripcion: 'Evaluacion del instrumento musical de Maria Lopez por parte de ACM y cotizacion de reparacion por ADM.',
      urgencia: 'media',
      confidence: 0.92,
    }),
  },
  {
    role: 'user',
    content: 'Reponer cuerdas rotas del piano de la sala 3',
  },
  {
    role: 'assistant',
    content: JSON.stringify({
      deptos: ['LUT'],
      process_code: 'LUT-P01',
      titulo: 'Reposicion de cuerdas de piano - Sala 3',
      descripcion: 'Mantenimiento de luteria para reponer cuerdas rotas del piano en sala 3.',
      urgencia: 'alta',
      confidence: 0.95,
    }),
  },
  {
    role: 'user',
    content: 'Actualizar directorio de alumnos en el sistema',
  },
  {
    role: 'assistant',
    content: JSON.stringify({
      deptos: ['DIR'],
      process_code: null,
      titulo: 'Actualizacion de directorio de alumnos',
      descripcion: 'Solicitud de actualizacion del directorio de alumnos en el sistema institucional.',
      urgencia: 'baja',
      confidence: 0.85,
    }),
  },
  {
    role: 'user',
    content: 'Se necesita reparar el aire acondicionado del salon de clases y comprar materiales de oficina',
  },
  {
    role: 'assistant',
    content: JSON.stringify({
      deptos: ['MNT', 'ADM'],
      process_code: null,
      titulo: 'Reparacion de aire acondicionado y compra de materiales',
      descripcion: 'Mantenimiento requiere reparar el aire acondicionado del salon y administracion debe comprar materiales de oficina.',
      urgencia: 'alta',
      confidence: 0.88,
    }),
  },
];

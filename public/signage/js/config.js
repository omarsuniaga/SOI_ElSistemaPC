/* Configuración de la pantalla. */
window.SIGNAGE_CONFIG = {
  supabaseUrl: 'https://zmhmdvmyeyswunurcyow.supabase.co',
  supabaseAnonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptaG1kdm15ZXlzd3VudXJjeW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMzI3MjEsImV4cCI6MjA5MjkwODcyMX0.ZEPI2FuJ-apwZYR20PAjAOLRUNIpfknG1LHDCUUwMRs',
  screenSlug: 'punta-cana-vestibulo',
  timezone: 'America/Santo_Domingo',

  poll: { horario: 180000, media: 180000, calendario: 900000, pantalla: 900000 },

  slideDefaultSeconds: 12,
  videoMaxSeconds: 240,
  eventoRotaSeconds: 10,
  enableYouTube: false,
  dailyReloadHour: 4,

  /* Identidad por defecto (la BD la sobreescribe). */
  marca: { institucion: 'El Sistema Punta Cana', siglas: 'FUNEYCA-PC' },

  /* Layout por defecto (signage_pantallas.layout lo sobreescribe zona a zona). */
  defaultLayout: {
    cabecera: { visible: true, marca: true, reloj: true, fecha: true, evento: true },
    visualizador: { visible: true, ajuste: 'contain', pie: true, pieTexto: '' },
    horario: { visible: true, anchoPct: 27.5, hoy: true, manana: true, instrumento: false, meta: false },
  },
};

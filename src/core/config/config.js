export const config = {
  version: '1.0.0',
  environment: import.meta.env.MODE || 'development',
  // Modo Demo: Se activa si la variable de entorno está presente o si hay un flag en localStorage
  isDemoMode: import.meta.env.VITE_DEMO_MODE === 'true' || localStorage.getItem('demo_mode') === 'true',
  // GROQ (IA) Configuration
  groq: {
    // ChatGroq API - https://console.groq.com
    apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
    model: import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-8b-instant',
    // whisper API (audio transcription)
    whisperModel: import.meta.env.VITE_WHISPER_MODEL || 'whisper-large-v3',
    endpoint: 'https://api.groq.com/openai/v1',
    maxTokens: 1024,
    temperature: 0.3,
  },
  // Sistema de tareas de maestro
  tareas: {
    localStorageKey: 'maestro_tarea',
    diasVencimientoDefault: 7,
  },
}

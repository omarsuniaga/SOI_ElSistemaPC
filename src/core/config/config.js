export const config = {
  version: '1.0.0',
  environment: import.meta.env.MODE || 'development',
  // Modo Demo: Se activa si la variable de entorno está presente o si hay un flag en localStorage
  isDemoMode: import.meta.env.VITE_DEMO_MODE === 'true' || localStorage.getItem('demo_mode') === 'true',
  // GROQ (IA) Configuration
  groq: {
    model: import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-8b-instant',
    // whisper API (audio transcription)
    whisperModel: import.meta.env.VITE_WHISPER_MODEL || 'whisper-large-v3',
    endpoint: 'https://api.groq.com/openai/v1',
    maxTokens: 1024,
    temperature: 0.3,
  },
  // Proveedor de chat IA: 'groq' (proxy Supabase, default) u 'ollama' (local, solo dev)
  ai: {
    provider: import.meta.env.VITE_AI_PROVIDER || 'groq',
    ollamaUrl: import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434',
    ollamaModel: import.meta.env.VITE_OLLAMA_MODEL || 'qwen2.5-coder:7b',
  },
  // Sistema de tareas de maestro
  tareas: {
    localStorageKey: 'maestro_tarea',
    diasVencimientoDefault: 7,
  },
  // Feature flags — per-phase rollout
  FEATURES: {
    UPLOAD_PARSER: import.meta.env.VITE_FEATURE_UPLOAD_PARSER === 'true' || import.meta.env.MODE === 'development',
    GEAR_GRADING: import.meta.env.VITE_FEATURE_GEAR_GRADING === 'true' || false,
  },
}

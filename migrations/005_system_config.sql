-- Migration: Create system_config table for storing system settings
-- Includes GROQ and OpenRouter API keys for AI features

CREATE TABLE IF NOT EXISTS system_config (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial configs for AI services
INSERT INTO system_config (key, value, description) VALUES
  ('groq_api_key', '', 'API key for GROQ AI service'),
  ('openrouter_api_key', '', 'API key for OpenRouter (free models)'),
  ('preferred_ai_model', 'google/gemini-2.0-flash-exp', 'Preferred AI model (free by default)')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read system_config (for reading API keys in the app)
CREATE POLICY "Allow read system_config" ON system_config
    FOR SELECT TO authenticated
    USING (true);

-- Allow all authenticated users to update system_config (demo mode)
-- In production, restrict to admins only
CREATE POLICY "Allow update system_config" ON system_config
    FOR UPDATE TO authenticated
    USING (true);

COMMENT ON TABLE system_config IS 'Tabla de configuración del sistema (API keys, settings globales)';
COMMENT ON COLUMN system_config.key IS 'Clave de configuración (ej: groq_api_key, openrouter_api_key)';
COMMENT ON COLUMN system_config.value IS 'Valor de la configuración (ej: gsk_xxxx, sk-or-xxxx)';
COMMENT ON COLUMN system_config.description IS 'Descripción de la configuración';
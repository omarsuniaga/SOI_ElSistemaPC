-- Migration: Add whatsapp_group_jid column to clases table
-- Date: 2026-06-20
-- Module: Communications / WhatsApp Integration

-- 1. Add whatsapp_group_jid column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clases' AND column_name = 'whatsapp_group_jid') THEN
        ALTER TABLE public.clases ADD COLUMN whatsapp_group_jid TEXT;
        COMMENT ON COLUMN public.clases.whatsapp_group_jid IS 'The WhatsApp Group JID (e.g. 120363023912389@g.us) for class-wide announcements.';
    END IF;
END $$;

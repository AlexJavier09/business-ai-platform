-- ============================================================
-- Migration: Add unique constraint for conversations upsert
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add unique constraint on (contact_id, channel) for N8N upsert to work
-- This ensures only ONE active conversation per contact per channel
ALTER TABLE conversations
ADD CONSTRAINT conversations_contact_id_channel_key
UNIQUE (contact_id, channel);

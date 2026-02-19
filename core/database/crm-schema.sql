-- ============================================================
-- CRM Schema: contacts, conversations, messages
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Contacts table (one record per person regardless of channel)
CREATE TABLE IF NOT EXISTS contacts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    name            TEXT NOT NULL,
    email           TEXT,
    phone           TEXT,
    channel         TEXT NOT NULL CHECK (channel IN ('whatsapp', 'instagram', 'messenger')),
    external_id     TEXT NOT NULL,  -- ManyChat subscriber ID
    avatar_url      TEXT,
    tags            JSONB DEFAULT '[]',
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, external_id, channel)
);

-- 2. Conversations table (one thread per contact)
CREATE TABLE IF NOT EXISTS conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    contact_id      UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    channel         TEXT NOT NULL CHECK (channel IN ('whatsapp', 'instagram', 'messenger')),
    status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'pending')),
    last_message    TEXT,
    unread_count    INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Messages table (individual messages in a conversation)
CREATE TABLE IF NOT EXISTS messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    direction       TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    content         TEXT,
    media_url       TEXT,
    sent_at         TIMESTAMPTZ DEFAULT NOW(),
    read_at         TIMESTAMPTZ
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_contacts_tenant    ON contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_external  ON contacts(external_id, channel);
CREATE INDEX IF NOT EXISTS idx_conversations_contact ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant  ON conversations(tenant_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, sent_at);

-- ── RLS Policies ──
ALTER TABLE contacts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;

-- Allow anon key (dashboard reads)
CREATE POLICY "contacts_anon_read"      ON contacts      FOR SELECT USING (true);
CREATE POLICY "contacts_anon_insert"    ON contacts      FOR INSERT WITH CHECK (true);
CREATE POLICY "contacts_anon_update"    ON contacts      FOR UPDATE USING (true);

CREATE POLICY "conversations_anon_read"   ON conversations FOR SELECT USING (true);
CREATE POLICY "conversations_anon_insert" ON conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "conversations_anon_update" ON conversations FOR UPDATE USING (true);

CREATE POLICY "messages_anon_read"   ON messages FOR SELECT USING (true);
CREATE POLICY "messages_anon_insert" ON messages FOR INSERT WITH CHECK (true);

-- ── Auto-update conversations.updated_at on new message ──
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET
        last_message  = NEW.content,
        unread_count  = unread_count + CASE WHEN NEW.direction = 'inbound' THEN 1 ELSE 0 END,
        updated_at    = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_conversation ON messages;
CREATE TRIGGER trg_update_conversation
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

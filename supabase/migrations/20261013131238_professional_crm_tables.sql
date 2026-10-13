-- Professional CRM (people, interactions, opportunities).
-- Vendored from OB1 extensions/professional-crm/schema.sql so its MCP function works unmodified.
-- Hardening vs. upstream: auth.uid() wrapped in subselects, search_path pinned,
-- contact_id FK index, explicit service_role grants, RPCs locked to service_role.
--
-- Extension 5: Professional CRM
-- Schema for tracking professional contacts, interactions, and opportunities

-- Table: professional_contacts
-- People in your professional network
CREATE TABLE IF NOT EXISTS professional_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    company TEXT,
    title TEXT,
    email TEXT,
    phone TEXT,
    linkedin_url TEXT,
    how_we_met TEXT,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    last_contacted TIMESTAMPTZ,
    follow_up_date DATE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Table: contact_interactions
-- Log of every touchpoint with contacts
CREATE TABLE IF NOT EXISTS contact_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES professional_contacts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('meeting', 'email', 'call', 'coffee', 'event', 'linkedin', 'other')),
    occurred_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    summary TEXT NOT NULL,
    follow_up_needed BOOLEAN DEFAULT false,
    follow_up_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Table: opportunities
-- Deals, projects, or potential collaborations
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    contact_id UUID REFERENCES professional_contacts(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    stage TEXT DEFAULT 'identified' CHECK (stage IN ('identified', 'in_conversation', 'proposal', 'negotiation', 'won', 'lost')),
    value DECIMAL(12,2),
    expected_close_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_professional_contacts_user_last_contacted
    ON professional_contacts(user_id, last_contacted);

CREATE INDEX IF NOT EXISTS idx_professional_contacts_follow_up
    ON professional_contacts(user_id, follow_up_date)
    WHERE follow_up_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contact_interactions_contact_occurred
    ON contact_interactions(contact_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_opportunities_user_stage
    ON opportunities(user_id, stage);

-- Row Level Security (RLS)
ALTER TABLE professional_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY professional_contacts_user_policy ON professional_contacts
    FOR ALL
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY contact_interactions_user_policy ON contact_interactions
    FOR ALL
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY opportunities_user_policy ON opportunities
    FOR ALL
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- Personal-OS additions (table part)
CREATE INDEX IF NOT EXISTS idx_opportunities_contact ON opportunities(contact_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.professional_contacts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.contact_interactions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.opportunities TO service_role;

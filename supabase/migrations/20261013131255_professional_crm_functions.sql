-- Professional CRM, part 2: triggers, full-text search, RPC lockdown.

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers to update updated_at columns
DROP TRIGGER IF EXISTS update_professional_contacts_updated_at ON professional_contacts;
CREATE TRIGGER update_professional_contacts_updated_at
    BEFORE UPDATE ON professional_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_opportunities_updated_at ON opportunities;
CREATE TRIGGER update_opportunities_updated_at
    BEFORE UPDATE ON opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-update last_contacted when an interaction is logged
CREATE OR REPLACE FUNCTION update_last_contacted()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE professional_contacts
    SET last_contacted = NEW.occurred_at
    WHERE id = NEW.contact_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to update last_contacted on new interactions
DROP TRIGGER IF EXISTS update_contact_last_contacted ON contact_interactions;
CREATE TRIGGER update_contact_last_contacted
    AFTER INSERT ON contact_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_last_contacted();

-- Full-text search: GIN index on contacts for fast FTS queries
ALTER TABLE professional_contacts ADD COLUMN IF NOT EXISTS fts tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english',
            coalesce(name, '') || ' ' ||
            coalesce(company, '') || ' ' ||
            coalesce(title, '') || ' ' ||
            coalesce(notes, '') || ' ' ||
            coalesce(how_we_met, '')
        )
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_professional_contacts_fts
    ON professional_contacts USING GIN (fts);

-- Full-text search: GIN index on interactions for searching summaries
ALTER TABLE contact_interactions ADD COLUMN IF NOT EXISTS fts tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(summary, ''))
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_contact_interactions_fts
    ON contact_interactions USING GIN (fts);

-- RPC function for full-text search with ranking (called by crm_search_contacts)
CREATE OR REPLACE FUNCTION crm_search_contacts_fts(
    search_query TEXT,
    search_user_id UUID,
    search_tags TEXT[] DEFAULT NULL,
    max_results INT DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    name TEXT,
    company TEXT,
    title TEXT,
    email TEXT,
    phone TEXT,
    linkedin_url TEXT,
    how_we_met TEXT,
    tags TEXT[],
    notes TEXT,
    last_contacted TIMESTAMPTZ,
    follow_up_date DATE,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pc.id, pc.user_id, pc.name, pc.company, pc.title, pc.email,
        pc.phone, pc.linkedin_url, pc.how_we_met, pc.tags, pc.notes,
        pc.last_contacted, pc.follow_up_date, pc.created_at, pc.updated_at,
        ts_rank(pc.fts, to_tsquery('english', search_query)) AS rank
    FROM professional_contacts pc
    WHERE pc.user_id = search_user_id
      AND pc.fts @@ to_tsquery('english', search_query)
      AND (search_tags IS NULL OR pc.tags @> search_tags)
    ORDER BY rank DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

REVOKE ALL ON FUNCTION public.crm_search_contacts_fts(text, uuid, text[], int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.crm_search_contacts_fts(text, uuid, text[], int) TO service_role;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_last_contacted() FROM PUBLIC, anon, authenticated;

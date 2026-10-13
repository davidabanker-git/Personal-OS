-- Vendored from OB1 recipes/ob-graph/schema.sql so its MCP function works unmodified.
-- Hardening vs. upstream: auth.uid() wrapped in subselects, search_path pinned,
-- single-column FK indexes, thought_id FK to thoughts.
--
-- OB-Graph: Knowledge Graph Layer for Open Brain
-- Adds graph database functionality on top of PostgreSQL using a nodes + edges
-- pattern. traverse_graph uses a recursive CTE (enumerates acyclic paths);
-- find_shortest_path uses an iterative plpgsql BFS (one row per reachable
-- node along the shortest path). Integrates with the core thoughts table
-- without modifying it.

-- ============================================================================
-- Table: graph_nodes
-- Represents entities in the knowledge graph. Nodes can optionally link to an
-- existing thought via thought_id, letting you layer graph structure over your
-- existing Open Brain data.
-- ============================================================================
CREATE TABLE IF NOT EXISTS graph_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    label TEXT NOT NULL,                     -- Human-readable name (e.g. "Supabase", "Project Alpha")
    node_type TEXT NOT NULL DEFAULT 'entity', -- Classification (e.g. "person", "project", "concept", "place", "tool")
    properties JSONB DEFAULT '{}',           -- Flexible metadata (tags, scores, urls, etc.)
    thought_id UUID REFERENCES thoughts(id) ON DELETE SET NULL, -- Optional link to a thought
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================================
-- Table: graph_edges
-- Directed relationships between nodes. Each edge has a type (e.g. "works_on",
-- "depends_on", "knows") and optional weight + metadata.
-- ============================================================================
CREATE TABLE IF NOT EXISTS graph_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    source_node_id UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
    target_node_id UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL,          -- e.g. "works_on", "depends_on", "related_to"
    weight REAL DEFAULT 1.0,                 -- Strength/confidence of relationship (0.0–1.0+)
    properties JSONB DEFAULT '{}',           -- Flexible edge metadata
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    -- Prevent duplicate edges of the same type between the same pair of nodes
    CONSTRAINT unique_edge UNIQUE (user_id, source_node_id, target_node_id, relationship_type)
);

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_graph_nodes_user_type
    ON graph_nodes(user_id, node_type);

CREATE INDEX IF NOT EXISTS idx_graph_nodes_user_label
    ON graph_nodes(user_id, label);

CREATE INDEX IF NOT EXISTS idx_graph_nodes_thought
    ON graph_nodes(thought_id);

CREATE INDEX IF NOT EXISTS idx_graph_edges_source
    ON graph_edges(user_id, source_node_id);

CREATE INDEX IF NOT EXISTS idx_graph_edges_target
    ON graph_edges(user_id, target_node_id);

CREATE INDEX IF NOT EXISTS idx_graph_edges_type
    ON graph_edges(user_id, relationship_type);

-- ============================================================================
-- Row Level Security
-- ============================================================================
ALTER TABLE graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY graph_nodes_user_policy ON graph_nodes
    FOR ALL
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY graph_edges_user_policy ON graph_edges
    FOR ALL
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- Trigger reuses update_updated_at_column() from the CRM migration.
DROP TRIGGER IF EXISTS update_graph_nodes_updated_at ON graph_nodes;
CREATE TRIGGER update_graph_nodes_updated_at
    BEFORE UPDATE ON graph_nodes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Grant permissions to service_role (required on newer Supabase projects)
-- ============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.graph_nodes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.graph_edges TO service_role;

-- ============================================================================
-- Personal-OS additions
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_graph_edges_source_node ON graph_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_graph_edges_target_node ON graph_edges(target_node_id);

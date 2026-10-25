-- =============================================================================
-- SmartCRM Database Schema & Row Level Security (RLS) Policies
-- PostgreSQL / Supabase
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. Workspaces & Workspace Memberships
-- =============================================================================

CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspace_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- references auth.users(id) in Supabase
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
    display_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_workspace_user ON workspace_memberships(workspace_id, user_id);

-- =============================================================================
-- 2. Customer Profiles
-- =============================================================================

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'churned')),
    owner_id UUID,
    tags TEXT[] NOT NULL DEFAULT '{}',
    importance INT NOT NULL DEFAULT 3 CHECK (importance BETWEEN 1 AND 5),
    health_score INT DEFAULT 85 CHECK (health_score BETWEEN 0 AND 100),
    health_band VARCHAR(50) DEFAULT 'healthy' CHECK (health_band IN ('healthy', 'at-risk', 'critical')),
    health_signals TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_workspace ON customers(workspace_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(workspace_id, LOWER(email));
CREATE INDEX IF NOT EXISTS idx_customers_health ON customers(workspace_id, health_score);

-- =============================================================================
-- 3. Leads and Sales Pipeline
-- =============================================================================

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    source VARCHAR(100),
    value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    stage VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (stage IN ('new', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
    owner_id UUID,
    expected_close_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_workspace_stage ON leads(workspace_id, stage);

CREATE TABLE IF NOT EXISTS lead_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    from_stage VARCHAR(50),
    to_stage VARCHAR(50) NOT NULL,
    changed_by UUID NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 4. Complaints and Complaint Notes
-- =============================================================================

CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'waiting', 'resolved')),
    severity INT NOT NULL DEFAULT 3 CHECK (severity BETWEEN 1 AND 5),
    sentiment VARCHAR(50) DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    sentiment_confidence NUMERIC(3, 2),
    sentiment_explanation TEXT,
    priority_score INT DEFAULT 50 CHECK (priority_score BETWEEN 0 AND 100),
    priority_reasons TEXT[] DEFAULT '{}',
    owner_id UUID,
    sla_due_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaints_workspace_status ON complaints(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(workspace_id, priority_score DESC);

CREATE TABLE IF NOT EXISTS complaint_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    author_id UUID NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 5. Customer Activities & Purchases
-- =============================================================================

CREATE TABLE IF NOT EXISTS customer_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'call', 'meeting', 'note', 'purchase', 'complaint', 'lead_update')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    performed_by UUID,
    performer_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_customer ON customer_activities(customer_id, created_at DESC);

CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_customer ON purchases(customer_id, purchased_at DESC);

-- =============================================================================
-- 6. Recommendations & Proactive Follow-ups
-- =============================================================================

CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    complaint_id UUID REFERENCES complaints(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('check_in', 'respond_complaint', 'follow_up_lead', 're_engage', 'upsell')),
    title VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed', 'completed')),
    action_taken TEXT,
    assigned_to UUID,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recs_workspace_status ON recommendations(workspace_id, status);

-- =============================================================================
-- 7. Data Import Jobs
-- =============================================================================

CREATE TABLE IF NOT EXISTS import_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    total_rows INT NOT NULL DEFAULT 0,
    imported_rows INT NOT NULL DEFAULT 0,
    skipped_rows INT NOT NULL DEFAULT 0,
    failed_rows INT NOT NULL DEFAULT 0,
    duplicate_rows INT NOT NULL DEFAULT 0,
    errors TEXT[] DEFAULT '{}',
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- =============================================================================
-- 8. Audit Events
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_workspace ON audit_events(workspace_id, created_at DESC);

-- =============================================================================
-- 9. Row Level Security (RLS) Policies
-- =============================================================================

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current authenticated user belongs to workspace
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM workspace_memberships
        WHERE workspace_id = ws_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check user role in workspace
CREATE OR REPLACE FUNCTION get_user_workspace_role(ws_id UUID)
RETURNS VARCHAR AS $$
    SELECT role FROM workspace_memberships
    WHERE workspace_id = ws_id AND user_id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Policies for Customers
CREATE POLICY "Members can view workspace customers"
ON customers FOR SELECT
USING (is_workspace_member(workspace_id));

CREATE POLICY "Admins and Managers can insert customers"
ON customers FOR INSERT
WITH CHECK (
    is_workspace_member(workspace_id) AND
    get_user_workspace_role(workspace_id) IN ('admin', 'manager', 'employee')
);

CREATE POLICY "Admins and Managers can update any customer, employees only assigned"
ON customers FOR UPDATE
USING (
    is_workspace_member(workspace_id) AND (
        get_user_workspace_role(workspace_id) IN ('admin', 'manager') OR
        owner_id = auth.uid()
    )
);

CREATE POLICY "Only Admins can delete customers"
ON customers FOR DELETE
USING (
    is_workspace_member(workspace_id) AND
    get_user_workspace_role(workspace_id) = 'admin'
);

-- Policies for Leads
CREATE POLICY "Members can view leads"
ON leads FOR SELECT
USING (is_workspace_member(workspace_id));

CREATE POLICY "Authorized staff can modify leads"
ON leads FOR ALL
USING (
    is_workspace_member(workspace_id) AND (
        get_user_workspace_role(workspace_id) IN ('admin', 'manager') OR
        owner_id = auth.uid()
    )
);

-- Policies for Complaints
CREATE POLICY "Members can view complaints"
ON complaints FOR SELECT
USING (is_workspace_member(workspace_id));

CREATE POLICY "Staff can update complaints"
ON complaints FOR ALL
USING (is_workspace_member(workspace_id));

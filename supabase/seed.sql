-- =============================================================================
-- SmartCRM Seed Data (Clean 2-Company Dataset)
-- =============================================================================

-- Workspace
INSERT INTO workspaces (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Apex Retail Solutions', 'apex-retail')
ON CONFLICT (id) DO NOTHING;

-- Members (Admin, Manager, Employee)
INSERT INTO workspace_memberships (id, workspace_id, user_id, role, display_name, email)
VALUES
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'admin', 'Sarah Chen', 'sarah@apexsolutions.io'),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'manager', 'Marcus Vance', 'marcus@apexsolutions.io'),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'employee', 'Elena Rostova', 'elena@apexsolutions.io')
ON CONFLICT (id) DO NOTHING;

-- Customers (2 Companies: Horizon Logistics Group & BlueSky Media Lab)
INSERT INTO customers (id, workspace_id, name, email, phone, company, status, importance, health_score, health_band, health_signals, notes)
VALUES
    ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Paul Zimmerman', 'pzimmerman@horizonlogistics.com', '+1 (555) 234-5678', 'Horizon Logistics Group', 'active', 5, 92, 'healthy', ARRAY['Consistent recurring software subscription', 'Executive review completed 2 days ago', 'No open complaints'], 'VP of Supply Chain at Horizon Logistics. Discussing Midwest warehouse rollout.'),
    ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Marcus Brody', 'mbrody@blueskymedia.co', '+1 (555) 345-6789', 'BlueSky Media Lab', 'active', 4, 34, 'critical', ARRAY['Active high-severity billing dispute', 'Negative sentiment detected on latest support ticket'], 'Operations Director. Pausing contract upgrade pending resolution of overage fees.'),
    ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Rachel Green', 'rachel@blueskymedia.co', '+1 (555) 345-6790', 'BlueSky Media Lab', 'active', 3, 52, 'at-risk', ARRAY['Waiting on invoice credit memo approval'], 'Head of Accounts at BlueSky Media.')
ON CONFLICT (id) DO NOTHING;

-- Leads
INSERT INTO leads (id, workspace_id, customer_id, contact_name, contact_email, company, source, value, stage, notes)
VALUES
    ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Paul Zimmerman', 'pzimmerman@horizonlogistics.com', 'Horizon Logistics Group', 'Expansion / Cross-sell', 45000.00, 'proposal', 'Enterprise expansion proposal to outfit 4 additional Midwest regional distribution hubs.'),
    ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Marcus Brody', 'mbrody@blueskymedia.co', 'BlueSky Media Lab', 'Direct SDR Outreach', 18500.00, 'negotiation', 'Video rendering cloud add-on. Final contract signing pending full resolution of current billing ticket.')
ON CONFLICT (id) DO NOTHING;

-- Complaints
INSERT INTO complaints (id, workspace_id, customer_id, title, description, status, severity, sentiment, sentiment_confidence, sentiment_explanation, priority_score, priority_reasons)
VALUES
    ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Recurring monthly overage charge for API bandwidth', 'We were charged $1,400 extra for data bandwidth that was specifically waived under Section 4.2 of our signed contract. This is the second month in a row. It is completely unacceptable and we are pausing our contract upgrade until this is credited.', 'in_progress', 5, 'negative', 0.94, 'Detected high-frustration indicators with direct churn risk.', 95, ARRAY['Critical Severity (5/5)', 'Strong negative sentiment detected', 'SLA due within 2 hours', 'Account holds pending $18,500 expansion deal']),
    ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'SSO certificate renewal coordination', 'Our security team is rotating our corporate SAML SSL certificate this coming Saturday at 10 PM EST. Please confirm your engineering on-call will be available for a brief smoke test.', 'resolved', 2, 'positive', 0.91, 'Proactive, collaborative tone coordinating routine maintenance.', 25, ARRAY['Low Severity (2/5)', 'Cooperative customer sentiment', 'Maintenance scheduled and verified'])
ON CONFLICT (id) DO NOTHING;

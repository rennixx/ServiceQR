-- =====================================================
-- ServiceQR - Database Schema for Supabase/PostgreSQL
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- Service request types
CREATE TYPE service_request_type AS ENUM ('waiter', 'water', 'bill');

-- Service request statuses
CREATE TYPE service_request_status AS ENUM ('pending', 'done');

-- =====================================================
-- RESTAURANTS TABLE
-- =====================================================

CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    theme_config JSONB DEFAULT '{
        "primary_color": "#475569",
        "secondary_color": "#64748b",
        "primary_hover": "#334155",
        "primary_light": "#94a3b8",
        "background_color": "#f8fafc",
        "foreground_color": "#0f172a",
        "font_family": "system-ui",
        "button_style": "rounded"
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLES TABLE (Restaurant Tables)
-- =====================================================

CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL,
    qr_code_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(restaurant_id, table_number)
);

-- =====================================================
-- SERVICE REQUESTS TABLE
-- =====================================================

CREATE TABLE service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    type service_request_type NOT NULL,
    status service_request_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Index for fast restaurant lookups by slug
CREATE INDEX idx_restaurants_slug ON restaurants(slug);

-- Index for table lookups by restaurant
CREATE INDEX idx_tables_restaurant_id ON tables(restaurant_id);

-- Index for QR code lookups
CREATE INDEX idx_tables_qr_code_id ON tables(qr_code_id);

-- Index for service requests by table
CREATE INDEX idx_service_requests_table_id ON service_requests(table_id);

-- Composite index for dashboard queries
CREATE INDEX idx_service_requests_status_table ON service_requests(status, table_id);

-- Index for time-based queries
CREATE INDEX idx_service_requests_created_at ON service_requests(created_at DESC);

-- =====================================================
-- TRIGGERS (Auto-update timestamps)
-- =====================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for restaurants table
CREATE TRIGGER update_restaurants_updated_at
    BEFORE UPDATE ON restaurants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for service_requests table
CREATE TRIGGER update_service_requests_updated_at
    BEFORE UPDATE ON service_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR RESTAURANTS
-- =====================================================

-- Public can view restaurants
CREATE POLICY "Public can view restaurants"
    ON restaurants
    FOR SELECT
    USING (true);

-- =====================================================
-- RLS POLICIES FOR TABLES
-- =====================================================

-- Public can view tables
CREATE POLICY "Public can view tables"
    ON tables
    FOR SELECT
    USING (true);

-- =====================================================
-- RLS POLICIES FOR SERVICE REQUESTS
-- =====================================================

-- Public can insert service requests (no authentication required)
CREATE POLICY "Public can insert service requests"
    ON service_requests
    FOR INSERT
    WITH CHECK (true);

-- Public can view service requests (for now, open access)
CREATE POLICY "Public can view service requests"
    ON service_requests
    FOR SELECT
    USING (true);

-- =====================================================
-- REAL-TIME SETUP
-- =====================================================

-- Enable Real-time on service_requests table
ALTER PUBLICATION supabase_realtime ADD TABLE service_requests;

-- =====================================================
-- HELPER VIEWS
-- =====================================================

-- View for dashboard: Service requests with restaurant context
CREATE VIEW service_requests_dashboard AS
SELECT
    sr.id,
    sr.type,
    sr.status,
    sr.created_at,
    sr.updated_at,
    t.id AS table_id,
    t.table_number,
    t.qr_code_id,
    t.restaurant_id,
    r.name AS restaurant_name,
    r.slug AS restaurant_slug
FROM service_requests sr
JOIN tables t ON t.id = sr.table_id
JOIN restaurants r ON r.id = t.restaurant_id;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE restaurants IS 'Multi-tenant restaurant configuration with theme customization';
COMMENT ON COLUMN restaurants.theme_config IS 'JSONB storing UI theme: primary_color, secondary_color, font_family, button_style';
COMMENT ON COLUMN restaurants.slug IS 'URL-friendly unique identifier for restaurant';

COMMENT ON TABLE tables IS 'Physical tables in restaurants with QR codes';
COMMENT ON COLUMN tables.qr_code_id IS 'Unique identifier encoded in QR code';

COMMENT ON TABLE service_requests IS 'Customer service requests (waiter, water, bill)';
COMMENT ON TABLE service_requests IS 'Real-time enabled for instant dashboard updates';

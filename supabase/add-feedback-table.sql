-- =====================================================
-- Create feedback table for customer ratings
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  service_request_id UUID REFERENCES service_requests(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique feedback per service request
  UNIQUE(service_request_id)
);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for customers)
CREATE POLICY "Public can insert feedback"
  ON feedback
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public reads (for staff dashboard)
CREATE POLICY "Public can view feedback"
  ON feedback
  FOR SELECT
  TO public
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_table_id ON feedback(table_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- Create view for feedback with table and restaurant info
CREATE OR REPLACE VIEW feedback_dashboard AS
SELECT
  f.id,
  f.rating,
  f.comment,
  f.created_at,
  f.table_id,
  t.table_number,
  t.restaurant_id,
  r.name AS restaurant_name,
  r.slug AS restaurant_slug,
  sr.type AS service_type
FROM feedback f
JOIN tables t ON f.table_id = t.id
JOIN restaurants r ON t.restaurant_id = r.id
LEFT JOIN service_requests sr ON f.service_request_id = sr.id;

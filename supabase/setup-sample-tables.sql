-- =====================================================
-- ServiceQR - Sample Tables Setup
-- Run this in your Supabase SQL Editor after inserting restaurants
-- =====================================================

-- Get restaurant IDs (you'll need these for the inserts)
-- Run this first to see your restaurant IDs:
SELECT id, name, slug FROM restaurants;

-- Insert tables for Mario's Bistro
-- Replace 'mario-restaurant-id' with the actual UUID from above
INSERT INTO tables (restaurant_id, table_number, qr_code_id)
VALUES
  ('mario-restaurant-id', '1', 'mario-table-1'),
  ('mario-restaurant-id', '2', 'mario-table-2'),
  ('mario-restaurant-id', '3', 'mario-table-3'),
  ('mario-restaurant-id', '4', 'mario-table-4'),
  ('mario-restaurant-id', '5', 'mario-table-5')
ON CONFLICT (qr_code_id) DO NOTHING;

-- Insert tables for Sakura Sushi
-- Replace 'sakura-restaurant-id' with the actual UUID from above
INSERT INTO tables (restaurant_id, table_number, qr_code_id)
VALUES
  ('sakura-restaurant-id', '1', 'sakura-table-1'),
  ('sakura-restaurant-id', '2', 'sakura-table-2'),
  ('sakura-restaurant-id', '3', 'sakura-table-3'),
  ('sakura-restaurant-id', '4', 'sakura-table-4')
ON CONFLICT (qr_code_id) DO NOTHING;

-- Insert tables for The Grill
-- Replace 'grill-restaurant-id' with the actual UUID from above
INSERT INTO tables (restaurant_id, table_number, qr_code_id)
VALUES
  ('grill-restaurant-id', '1', 'grill-table-1'),
  ('grill-restaurant-id', '2', 'grill-table-2'),
  ('grill-restaurant-id', '3', 'grill-table-3'),
  ('grill-restaurant-id', '4', 'grill-table-4'),
  ('grill-restaurant-id', '5', 'grill-table-5'),
  ('grill-restaurant-id', '6', 'grill-table-6')
ON CONFLICT (qr_code_id) DO NOTHING;

-- Insert tables for Ocean Breeze
-- Replace 'ocean-restaurant-id' with the actual UUID from above
INSERT INTO tables (restaurant_id, table_number, qr_code_id)
VALUES
  ('ocean-restaurant-id', '1', 'ocean-table-1'),
  ('ocean-restaurant-id', '2', 'ocean-table-2'),
  ('ocean-restaurant-id', '3', 'ocean-table-3')
ON CONFLICT (qr_code_id) DO NOTHING;

-- Verify the inserts
SELECT
  t.table_number,
  t.qr_code_id,
  r.name as restaurant_name,
  r.slug as restaurant_slug
FROM tables t
JOIN restaurants r ON t.restaurant_id = r.id
ORDER BY r.name, t.table_number;

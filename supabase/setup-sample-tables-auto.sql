-- =====================================================
-- ServiceQR - Sample Tables Setup (Automatic)
-- This script automatically gets restaurant IDs and inserts tables
-- =====================================================

-- Insert tables for Mario's Bistro
DO $$
DECLARE
    restaurant_id UUID;
BEGIN
    SELECT id INTO restaurant_id FROM restaurants WHERE slug = 'mario-bistro';

    IF restaurant_id IS NOT NULL THEN
        INSERT INTO tables (restaurant_id, table_number, qr_code_id)
        VALUES
            (restaurant_id, '1', 'mario-table-1'),
            (restaurant_id, '2', 'mario-table-2'),
            (restaurant_id, '3', 'mario-table-3'),
            (restaurant_id, '4', 'mario-table-4'),
            (restaurant_id, '5', 'mario-table-5')
        ON CONFLICT (qr_code_id) DO NOTHING;

        RAISE NOTICE 'Inserted tables for Mario''s Bistro';
    ELSE
        RAISE NOTICE 'Mario''s Bistro not found. Please run setup-sample-restaurants.sql first.';
    END IF;
END $$;

-- Insert tables for Sakura Sushi
DO $$
DECLARE
    restaurant_id UUID;
BEGIN
    SELECT id INTO restaurant_id FROM restaurants WHERE slug = 'sakura-sushi';

    IF restaurant_id IS NOT NULL THEN
        INSERT INTO tables (restaurant_id, table_number, qr_code_id)
        VALUES
            (restaurant_id, '1', 'sakura-table-1'),
            (restaurant_id, '2', 'sakura-table-2'),
            (restaurant_id, '3', 'sakura-table-3'),
            (restaurant_id, '4', 'sakura-table-4')
        ON CONFLICT (qr_code_id) DO NOTHING;

        RAISE NOTICE 'Inserted tables for Sakura Sushi';
    ELSE
        RAISE NOTICE 'Sakura Sushi not found. Please run setup-sample-restaurants.sql first.';
    END IF;
END $$;

-- Insert tables for The Grill
DO $$
DECLARE
    restaurant_id UUID;
BEGIN
    SELECT id INTO restaurant_id FROM restaurants WHERE slug = 'the-grill';

    IF restaurant_id IS NOT NULL THEN
        INSERT INTO tables (restaurant_id, table_number, qr_code_id)
        VALUES
            (restaurant_id, '1', 'grill-table-1'),
            (restaurant_id, '2', 'grill-table-2'),
            (restaurant_id, '3', 'grill-table-3'),
            (restaurant_id, '4', 'grill-table-4'),
            (restaurant_id, '5', 'grill-table-5'),
            (restaurant_id, '6', 'grill-table-6')
        ON CONFLICT (qr_code_id) DO NOTHING;

        RAISE NOTICE 'Inserted tables for The Grill';
    ELSE
        RAISE NOTICE 'The Grill not found. Please run setup-sample-restaurants.sql first.';
    END IF;
END $$;

-- Insert tables for Ocean Breeze
DO $$
DECLARE
    restaurant_id UUID;
BEGIN
    SELECT id INTO restaurant_id FROM restaurants WHERE slug = 'ocean-breeze';

    IF restaurant_id IS NOT NULL THEN
        INSERT INTO tables (restaurant_id, table_number, qr_code_id)
        VALUES
            (restaurant_id, '1', 'ocean-table-1'),
            (restaurant_id, '2', 'ocean-table-2'),
            (restaurant_id, '3', 'ocean-table-3')
        ON CONFLICT (qr_code_id) DO NOTHING;

        RAISE NOTICE 'Inserted tables for Ocean Breeze';
    ELSE
        RAISE NOTICE 'Ocean Breeze not found. Please run setup-sample-restaurants.sql first.';
    END IF;
END $$;

-- Verify the inserts
SELECT
    t.table_number,
    t.qr_code_id,
    r.name as restaurant_name,
    r.slug as restaurant_slug
FROM tables t
JOIN restaurants r ON t.restaurant_id = r.id
ORDER BY r.name, t.table_number;

-- =====================================================
-- Fix RLS Policies for ServiceQR
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Public can view restaurants" ON restaurants;
DROP POLICY IF EXISTS "Managers can view their restaurant" ON restaurants;
DROP POLICY IF EXISTS "Managers can update their restaurant" ON restaurants;

-- Create new permissive policies for restaurants table
CREATE POLICY "Allow public select on restaurants"
    ON restaurants
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on restaurants"
    ON restaurants
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update on restaurants"
    ON restaurants
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Drop existing restrictive policies on tables
DROP POLICY IF EXISTS "Public can view tables" ON tables;
DROP POLICY IF EXISTS "Managers can view their tables" ON tables;
DROP POLICY IF EXISTS "Managers can insert tables" ON tables;

-- Create new permissive policies for tables table
CREATE POLICY "Allow public select on tables"
    ON tables
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on tables"
    ON tables
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update on tables"
    ON tables
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Verify the policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('restaurants', 'tables', 'service_requests')
ORDER BY tablename, policyname;

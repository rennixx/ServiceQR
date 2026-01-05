-- =====================================================
-- Fix: Allow UPDATE on restaurants table
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Drop existing update policies if they exist
DROP POLICY IF EXISTS "Managers can update their restaurant" ON restaurants;

-- Create a permissive update policy
CREATE POLICY "Allow public update on restaurants"
    ON restaurants
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Verify the policies
SELECT
    tablename,
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'restaurants'
  AND cmd IN ('UPDATE', 'INSERT', 'SELECT')
ORDER BY policyname;

-- =====================================================
-- Fix: Allow UPDATE on service_requests table
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Public can update service_requests" ON service_requests;

-- Create a permissive update policy
CREATE POLICY "Allow public update on service_requests"
    ON service_requests
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Verify the policy
SELECT
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'service_requests'
  AND cmd = 'UPDATE';

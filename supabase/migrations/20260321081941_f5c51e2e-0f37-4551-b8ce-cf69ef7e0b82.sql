
-- Fix 1: Drop the broken "Admins can access all profiles" policy that uses USING(true)
DROP POLICY IF EXISTS "Admins can access all profiles" ON public.profiles;

-- Fix 2: Drop user UPDATE policy on quote_payments to prevent self-upgrade
DROP POLICY IF EXISTS "Users can update their own quote payments" ON public.quote_payments;

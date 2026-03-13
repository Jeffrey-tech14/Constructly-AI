-- Create quote_payments table to track per-quote payments
CREATE TABLE IF NOT EXISTS public.quote_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ksh NUMERIC NOT NULL DEFAULT 1000,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  payment_reference VARCHAR(255),
  transaction_id VARCHAR(255),
  payment_method VARCHAR(50), -- card, mpesa, etc
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_quote_payment UNIQUE(quote_id)
);

-- Add payment_status column to quotes table if it doesn't exist
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'unpaid';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_quote_payments_user_id ON public.quote_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_quote_payments_quote_id ON public.quote_payments(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_payments_status ON public.quote_payments(payment_status);

-- Update profiles table: remove tier-related columns (optional, can keep for backwards compatibility)
-- These can be kept but won't be used anymore
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS tier CASCADE;
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS subscription_status CASCADE;

-- Enable RLS on quote_payments table
ALTER TABLE public.quote_payments ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own quote payments
CREATE POLICY "Users can view their own quote payments"
ON public.quote_payments
FOR SELECT
USING (
  auth.uid() = user_id
);

-- Policy 2: Users can create quote payments for their own quotes
CREATE POLICY "Users can create quote payments for their own quotes"
ON public.quote_payments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.quotes
    WHERE id = quote_id AND user_id = auth.uid()
  )
);

-- Policy 3: Users can update their own quote payments
CREATE POLICY "Users can update their own quote payments"
ON public.quote_payments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Admins can view all quote payments
CREATE POLICY "Admins can view all quote payments"
ON public.quote_payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Policy 5: Admins can update any quote payment
CREATE POLICY "Admins can update any quote payment"
ON public.quote_payments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

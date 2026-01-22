-- Add usage_unit column to user_equipment table if it doesn't exist
ALTER TABLE public.user_equipment
ADD COLUMN IF NOT EXISTS usage_unit VARCHAR(50) DEFAULT 'day';

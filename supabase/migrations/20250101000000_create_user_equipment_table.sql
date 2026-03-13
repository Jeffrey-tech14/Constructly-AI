-- Create user_equipment table
CREATE TABLE IF NOT EXISTS public.user_equipment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  equipment_name VARCHAR(255) NOT NULL,
  daily_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  hourly_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  usage_unit VARCHAR(50) DEFAULT 'day',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_equipment_name UNIQUE (user_id, equipment_name)
);

-- Create index for better query performance
CREATE INDEX idx_user_equipment_user_id ON public.user_equipment(user_id);
CREATE INDEX idx_user_equipment_created_at ON public.user_equipment(created_at);

-- Enable RLS
ALTER TABLE public.user_equipment ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own equipment
CREATE POLICY "Users can view own equipment"
  ON public.user_equipment
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own equipment
CREATE POLICY "Users can insert own equipment"
  ON public.user_equipment
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own equipment
CREATE POLICY "Users can update own equipment"
  ON public.user_equipment
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own equipment
CREATE POLICY "Users can delete own equipment"
  ON public.user_equipment
  FOR DELETE
  USING (auth.uid() = user_id);

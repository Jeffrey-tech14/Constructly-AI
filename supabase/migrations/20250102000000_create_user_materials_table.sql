-- Create user_materials table
CREATE TABLE IF NOT EXISTS public.user_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_name VARCHAR(255) NOT NULL,
  price_per_unit DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL DEFAULT 'unit',
  category VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_material_name UNIQUE (user_id, material_name)
);

-- Create index for better query performance
CREATE INDEX idx_user_materials_user_id ON public.user_materials(user_id);
CREATE INDEX idx_user_materials_created_at ON public.user_materials(created_at);
CREATE INDEX idx_user_materials_category ON public.user_materials(category);

-- Enable RLS
ALTER TABLE public.user_materials ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own materials
CREATE POLICY "Users can view own materials"
  ON public.user_materials
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own materials
CREATE POLICY "Users can insert own materials"
  ON public.user_materials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own materials
CREATE POLICY "Users can update own materials"
  ON public.user_materials
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own materials
CREATE POLICY "Users can delete own materials"
  ON public.user_materials
  FOR DELETE
  USING (auth.uid() = user_id);

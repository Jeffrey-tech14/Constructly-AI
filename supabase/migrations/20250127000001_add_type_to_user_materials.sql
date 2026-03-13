-- Add type column (JSONB) to user_materials table for complex material specifications
ALTER TABLE public.user_materials 
ADD COLUMN IF NOT EXISTS type JSONB DEFAULT NULL;

-- Create index for better query performance on type column
CREATE INDEX IF NOT EXISTS idx_user_materials_type ON public.user_materials USING GIN (type);

-- Add comment to document the column
COMMENT ON COLUMN public.user_materials.type IS 'JSONB data for complex material specifications (e.g., thickness_mm, color, finish, origin for tiles)';

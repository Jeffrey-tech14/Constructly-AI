-- Create storage buckets for plans and BBS files if they don't exist

-- Plans Bucket
INSERT INTO storage.buckets (id, name, owner, public)
VALUES ('plans', 'plans', NULL, true)
ON CONFLICT (id) DO NOTHING;

-- BBS Bucket  
INSERT INTO storage.buckets (id, name, owner, public)
VALUES ('bbs', 'bbs', NULL, true)
ON CONFLICT (id) DO NOTHING;

-- Note: RLS is automatically enabled on storage.objects by Supabase
-- We just need to create the policies below

-- Plans Bucket Policies

-- Policy: Users can upload plan files to plans bucket
CREATE POLICY "Users can upload plan files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'plans' 
  AND auth.role() = 'authenticated'
);

-- Policy: Users can read plan files
CREATE POLICY "Users can read plan files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'plans');

-- Policy: Users can delete their own plan files
CREATE POLICY "Users can delete own plan files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'plans'
  AND auth.uid() = owner
);

-- BBS Bucket Policies

-- Policy: Users can upload BBS files
CREATE POLICY "Users can upload BBS files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'bbs'
  AND auth.role() = 'authenticated'
);

-- Policy: Users can read BBS files
CREATE POLICY "Users can read BBS files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'bbs');

-- Policy: Users can delete their own BBS files
CREATE POLICY "Users can delete own BBS files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'bbs'
  AND auth.uid() = owner
);

-- Admins can delete any plan file
CREATE POLICY "Admins can delete any plan file"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'plans'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Admins can delete any BBS file
CREATE POLICY "Admins can delete any BBS file"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'bbs'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

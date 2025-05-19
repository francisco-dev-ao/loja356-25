
-- Drop existing policies for bank-logos
DROP POLICY IF EXISTS "Allow bank-logos uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow bank-logos view" ON storage.objects;

-- Create specific policy for bank-logos folder in public bucket
CREATE POLICY "Allow bank-logos uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'public' 
  AND (storage.foldername(name))[1] = 'bank-logos'
);

-- Allow public viewing of bank logos
CREATE POLICY "Allow bank-logos view"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'public' 
  AND (storage.foldername(name))[1] = 'bank-logos'
);

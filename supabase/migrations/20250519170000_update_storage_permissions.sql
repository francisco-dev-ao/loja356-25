-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to upload files to public bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their files in public bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view files in public bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow bank-logos uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow bank-logos view" ON storage.objects;

-- Ensure uploads bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for uploads bucket
CREATE POLICY "Allow authenticated users to upload to uploads bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Allow authenticated users to update their files in uploads bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads' AND auth.uid() = owner);

CREATE POLICY "Allow public to view files in uploads bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'uploads');

-- Add specific policy for bank-logos folder
CREATE POLICY "Allow bank-logos management"
ON storage.objects
TO authenticated
USING (
  bucket_id = 'uploads' 
  AND (storage.foldername(name))[1] = 'bank-logos'
)
WITH CHECK (
  bucket_id = 'uploads' 
  AND (storage.foldername(name))[1] = 'bank-logos'
);

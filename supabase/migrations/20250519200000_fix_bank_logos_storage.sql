-- Remover políticas antigas
DROP POLICY IF EXISTS "Allow bank-logos management" ON storage.objects;
DROP POLICY IF EXISTS "Allow bank-logos uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow bank-logos view" ON storage.objects;

-- Criar o bucket bank-logos se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('bank-logos', 'bank-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Permitir que usuários autenticados façam upload
CREATE POLICY "Allow authenticated users to upload bank logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'bank-logos');

-- Permitir que usuários autenticados atualizem seus arquivos
CREATE POLICY "Allow authenticated users to update bank logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'bank-logos' AND auth.uid() = owner);

-- Permitir que usuários autenticados deletem seus arquivos
CREATE POLICY "Allow authenticated users to delete bank logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'bank-logos' AND auth.uid() = owner);

-- Permitir que qualquer pessoa visualize os logos
CREATE POLICY "Allow anyone to view bank logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'bank-logos');

-- Garantir que a coluna smtp_secure existe
ALTER TABLE settings 
  ADD COLUMN IF NOT EXISTS smtp_secure boolean DEFAULT true;

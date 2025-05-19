-- Remover políticas antigas
DROP POLICY IF EXISTS "Allow bank-logos management" ON storage.objects;

-- Criar o bucket bank-logos se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('bank-logos', 'bank-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir upload por usuários autenticados
CREATE POLICY "Allow bank logos upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'bank-logos');

-- Política para permitir atualização por usuários autenticados
CREATE POLICY "Allow bank logos update"
ON storage.objects
FOR UPDATE 
TO authenticated
USING (bucket_id = 'bank-logos' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'bank-logos');

-- Política para permitir visualização pública
CREATE POLICY "Allow bank logos view"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'bank-logos');

-- Política para permitir deleção por usuários autenticados
CREATE POLICY "Allow bank logos delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'bank-logos' AND auth.uid() = owner);

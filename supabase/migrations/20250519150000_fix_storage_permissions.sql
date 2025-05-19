-- Garantir permissões de storage para usuários autenticados
CREATE POLICY "Allow authenticated users to upload files to public bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'public');

-- Permitir que usuários autenticados atualizem seus próprios arquivos
CREATE POLICY "Allow authenticated users to update their files in public bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'public' AND auth.uid() = owner);

-- Permitir que qualquer pessoa visualize arquivos públicos
CREATE POLICY "Allow public to view files in public bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'public');

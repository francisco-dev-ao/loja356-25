-- Verificar se a coluna role já existe, se não existir, criar
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 
    FROM information_schema.columns 
    WHERE table_name='profiles' AND column_name='role') 
  THEN
    ALTER TABLE profiles ADD COLUMN role TEXT CHECK (role IN ('admin', 'customer')) DEFAULT 'customer';
  END IF;
END $$;

-- Criar índice para pesquisas por role
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 
    FROM pg_indexes 
    WHERE tablename = 'profiles' AND indexname = 'idx_profiles_role') 
  THEN
    CREATE INDEX idx_profiles_role ON profiles(role);
  END IF;
END $$;

-- Criar função para verificar se um usuário é admin
CREATE OR REPLACE FUNCTION is_admin(user_id text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

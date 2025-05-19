-- Adiciona coluna smtp_secure e outras configurações SMTP necessárias
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS smtp_secure boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS smtp_host text,
ADD COLUMN IF NOT EXISTS smtp_port integer DEFAULT 587,
ADD COLUMN IF NOT EXISTS smtp_user text,
ADD COLUMN IF NOT EXISTS smtp_pass text,
ADD COLUMN IF NOT EXISTS smtp_from text;

-- Atualiza as configurações existentes com valores padrão
UPDATE settings 
SET 
  smtp_secure = true,
  smtp_port = 587
WHERE id = 'company-settings';

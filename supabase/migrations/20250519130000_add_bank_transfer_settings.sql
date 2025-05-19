-- Adicionar campos de configuração de transferência bancária na tabela settings
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_holder TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_iban TEXT,
  ADD COLUMN IF NOT EXISTS bank_logo_url TEXT;

COMMENT ON COLUMN settings.bank_name IS 'Nome do banco para transferências';
COMMENT ON COLUMN settings.bank_account_holder IS 'Nome do titular da conta bancária';
COMMENT ON COLUMN settings.bank_account_number IS 'Número da conta bancária';
COMMENT ON COLUMN settings.bank_iban IS 'Número IBAN da conta bancária';
COMMENT ON COLUMN settings.bank_logo_url IS 'URL do logotipo do banco';

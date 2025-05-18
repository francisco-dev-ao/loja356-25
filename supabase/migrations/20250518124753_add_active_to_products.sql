-- Adiciona a coluna active na tabela products
ALTER TABLE public.products ADD COLUMN active boolean DEFAULT true NOT NULL;
-- Script para ativar o método de pagamento Multicaixa Express
-- Execute este script no seu banco de dados Supabase

-- 1. Criar as tabelas necessárias (se não existirem)
CREATE TABLE IF NOT EXISTS public.multicaixa_express_config (
    id SERIAL PRIMARY KEY,
    frame_token TEXT NOT NULL,
    callback_url TEXT NOT NULL,
    success_url TEXT NOT NULL,
    error_url TEXT NOT NULL,
    css_url TEXT,
    commission_rate DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.multicaixa_express_payments (
    id SERIAL PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    reference TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    payment_method TEXT DEFAULT 'multicaixa_express',
    emis_token TEXT,
    emis_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.multicaixa_express_callbacks (
    id SERIAL PRIMARY KEY,
    raw_data TEXT NOT NULL,
    payment_reference TEXT,
    amount DECIMAL(10,2),
    status TEXT,
    ip_address INET,
    processed_successfully BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_multicaixa_payments_order_id ON public.multicaixa_express_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_multicaixa_payments_reference ON public.multicaixa_express_payments(reference);
CREATE INDEX IF NOT EXISTS idx_multicaixa_payments_status ON public.multicaixa_express_payments(status);
CREATE INDEX IF NOT EXISTS idx_multicaixa_callbacks_reference ON public.multicaixa_express_callbacks(payment_reference);
CREATE INDEX IF NOT EXISTS idx_multicaixa_callbacks_created_at ON public.multicaixa_express_callbacks(created_at);

-- 3. Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- 4. Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_multicaixa_express_config_updated_at ON public.multicaixa_express_config;
CREATE TRIGGER update_multicaixa_express_config_updated_at
    BEFORE UPDATE ON public.multicaixa_express_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Inserir configuração padrão do Multicaixa Express (ATIVO)
INSERT INTO public.multicaixa_express_config (
    frame_token,
    callback_url,
    success_url,
    error_url,
    css_url,
    commission_rate,
    is_active
) VALUES (
    'a53787fd-b49e-4469-a6ab-fa6acf19db48',
    'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback',
    'https://angohost.co.ao/pay/successful',
    'https://angohost.co.ao/pay/unsuccessful',
    NULL,
    0,
    true
) ON CONFLICT DO NOTHING;

-- 6. Habilitar RLS (Row Level Security)
ALTER TABLE public.multicaixa_express_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multicaixa_express_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multicaixa_express_callbacks ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas de segurança
DROP POLICY IF EXISTS "Admins can manage multicaixa config" ON public.multicaixa_express_config;
CREATE POLICY "Admins can manage multicaixa config" ON public.multicaixa_express_config
    FOR ALL USING (auth.role() = 'authenticated' AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "All users can view multicaixa config" ON public.multicaixa_express_config;
CREATE POLICY "All users can view multicaixa config" ON public.multicaixa_express_config
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view their own payments" ON public.multicaixa_express_payments;
CREATE POLICY "Users can view their own payments" ON public.multicaixa_express_payments
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        order_id IN (
            SELECT id FROM public.orders WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can manage all payments" ON public.multicaixa_express_payments;
CREATE POLICY "Admins can manage all payments" ON public.multicaixa_express_payments
    FOR ALL USING (auth.role() = 'authenticated' AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage callbacks" ON public.multicaixa_express_callbacks;
CREATE POLICY "Admins can manage callbacks" ON public.multicaixa_express_callbacks
    FOR ALL USING (auth.role() = 'authenticated' AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "System can insert callbacks" ON public.multicaixa_express_callbacks;
CREATE POLICY "System can insert callbacks" ON public.multicaixa_express_callbacks
    FOR INSERT WITH CHECK (true);

-- 8. Verificar se o método de pagamento Multicaixa Express existe na tabela payment_methods
INSERT INTO public.payment_methods (name, description, is_active)
VALUES ('Multicaixa Express', 'Pagamento via Multicaixa Express Online', true)
ON CONFLICT (name) DO UPDATE SET 
    description = EXCLUDED.description,
    is_active = true;

-- 9. Mostrar status da ativação
SELECT 
    'Multicaixa Express Status' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.multicaixa_express_config WHERE is_active = true) 
        THEN '✅ ATIVO' 
        ELSE '❌ INATIVO' 
    END as status;

-- 10. Mostrar configuração atual
SELECT 
    id,
    frame_token,
    callback_url,
    success_url,
    error_url,
    commission_rate,
    is_active,
    created_at
FROM public.multicaixa_express_config
WHERE is_active = true; 
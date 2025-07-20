-- Criar tabelas para Multicaixa Express
-- Esta migração cria as tabelas necessárias para integrar o módulo Multicaixa Express

-- Tabela de configuração do Multicaixa Express
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

-- Tabela de pagamentos Multicaixa Express
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

-- Tabela de callbacks do Multicaixa Express
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

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_multicaixa_payments_order_id ON public.multicaixa_express_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_multicaixa_payments_reference ON public.multicaixa_express_payments(reference);
CREATE INDEX IF NOT EXISTS idx_multicaixa_payments_status ON public.multicaixa_express_payments(status);
CREATE INDEX IF NOT EXISTS idx_multicaixa_callbacks_reference ON public.multicaixa_express_callbacks(payment_reference);
CREATE INDEX IF NOT EXISTS idx_multicaixa_callbacks_created_at ON public.multicaixa_express_callbacks(created_at);

-- Trigger para atualizar updated_at na tabela de configuração
CREATE TRIGGER update_multicaixa_express_config_updated_at
    BEFORE UPDATE ON public.multicaixa_express_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configuração padrão do Multicaixa Express
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

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.multicaixa_express_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multicaixa_express_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multicaixa_express_callbacks ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para multicaixa_express_config
CREATE POLICY "Admins can manage multicaixa config" ON public.multicaixa_express_config
    FOR ALL USING (auth.role() = 'authenticated' AND public.is_admin(auth.uid()));

CREATE POLICY "All users can view multicaixa config" ON public.multicaixa_express_config
    FOR SELECT USING (true);

-- Políticas de segurança para multicaixa_express_payments
CREATE POLICY "Users can view their own payments" ON public.multicaixa_express_payments
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        order_id IN (
            SELECT id FROM public.orders WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all payments" ON public.multicaixa_express_payments
    FOR ALL USING (auth.role() = 'authenticated' AND public.is_admin(auth.uid()));

-- Políticas de segurança para multicaixa_express_callbacks
CREATE POLICY "Admins can manage callbacks" ON public.multicaixa_express_callbacks
    FOR ALL USING (auth.role() = 'authenticated' AND public.is_admin(auth.uid()));

CREATE POLICY "System can insert callbacks" ON public.multicaixa_express_callbacks
    FOR INSERT WITH CHECK (true); 
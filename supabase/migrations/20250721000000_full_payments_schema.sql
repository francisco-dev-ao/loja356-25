-- MIGRATION: FULL PAYMENTS SCHEMA (EMIS, ORDERS, PRODUCTS, ETC)
-- Data: 2025-07-21

-- 1. Pagamentos Multicaixa Express
CREATE TABLE IF NOT EXISTS public.emis_payments (
    id SERIAL PRIMARY KEY,
    reference VARCHAR(32) UNIQUE NOT NULL,
    token_id VARCHAR(64) UNIQUE NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    payment_url TEXT,
    raw_request JSONB,
    raw_response JSONB
);

-- 2. Callbacks
CREATE TABLE IF NOT EXISTS public.emis_callbacks (
    id SERIAL PRIMARY KEY,
    payment_reference VARCHAR(32) NOT NULL,
    callback_data JSONB NOT NULL,
    status VARCHAR(16),
    transaction_number VARCHAR(64),
    amount DECIMAL(18,2),
    received_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Logs de Webhook (opcional)
CREATE TABLE IF NOT EXISTS public.emis_webhook_logs (
    id SERIAL PRIMARY KEY,
    event_type TEXT,
    payload JSONB NOT NULL,
    received_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Pedidos (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL,
    payment_method TEXT,
    payment_reference TEXT,
    payment_status TEXT,
    reference_mcx TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    coupon_code TEXT,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- 5. Clientes
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    nif TEXT NOT NULL,
    address TEXT,
    city TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Produtos
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    base_price DECIMAL(10,2),
    discount_type TEXT,
    discount_value DECIMAL(10,2),
    image TEXT,
    category TEXT,
    stock INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Cupons
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Faturas (Invoices)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id),
    invoice_number SERIAL NOT NULL UNIQUE,
    company_id UUID,
    customer_id UUID,
    issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    payment_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Relacionamentos e Índices
ALTER TABLE emis_callbacks
ADD CONSTRAINT IF NOT EXISTS fk_emis_payment
FOREIGN KEY (payment_reference)
REFERENCES emis_payments(reference);

CREATE INDEX IF NOT EXISTS idx_emis_callbacks_reference ON emis_callbacks(payment_reference);
CREATE INDEX IF NOT EXISTS idx_emis_payments_status ON emis_payments(status); 
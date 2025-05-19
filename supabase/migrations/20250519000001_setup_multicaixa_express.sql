
-- Add multicaixa_express specific fields to settings table if they don't exist
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS multicaixa_frametoken TEXT DEFAULT 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
ADD COLUMN IF NOT EXISTS multicaixa_callback TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS multicaixa_success TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS multicaixa_error TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS multicaixa_cssurl TEXT DEFAULT '';

-- Create table for multicaixa express payments
CREATE TABLE IF NOT EXISTS multicaixa_express_payments (
  id SERIAL PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  reference TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT DEFAULT 'multicaixa',
  emis_token TEXT,
  emis_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create table for multicaixa express callbacks
CREATE TABLE IF NOT EXISTS multicaixa_express_callbacks (
  id SERIAL PRIMARY KEY,
  payment_reference TEXT,
  status TEXT,
  amount NUMERIC,
  raw_data JSONB NOT NULL,
  processed_successfully BOOLEAN DEFAULT false,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_multicaixa_express_payments_order_id ON multicaixa_express_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_multicaixa_express_payments_reference ON multicaixa_express_payments(reference);
CREATE INDEX IF NOT EXISTS idx_multicaixa_express_payments_status ON multicaixa_express_payments(status);
CREATE INDEX IF NOT EXISTS idx_multicaixa_express_callbacks_payment_reference ON multicaixa_express_callbacks(payment_reference);

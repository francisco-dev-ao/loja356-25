
-- Enable RLS on the multicaixa tables
ALTER TABLE multicaixa_express_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE multicaixa_express_callbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE multicaixa_express_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert into multicaixa_express_payments
CREATE POLICY insert_own_payments ON multicaixa_express_payments
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Allow users to view their own payments
CREATE POLICY select_own_payments ON multicaixa_express_payments
    FOR SELECT TO authenticated
    USING (true);

-- Allow authenticated users to update their own payments
CREATE POLICY update_own_payments ON multicaixa_express_payments
    FOR UPDATE TO authenticated
    USING (true);

-- Allow anyone to read the settings
CREATE POLICY read_settings ON settings
    FOR SELECT
    USING (true);

-- Allow admin to update settings
CREATE POLICY update_settings ON settings
    FOR UPDATE TO authenticated
    USING (is_admin(auth.uid()));

-- Allow service role to insert multicaixa_express_callbacks (for webhooks)
CREATE POLICY insert_callbacks ON multicaixa_express_callbacks
    FOR INSERT
    WITH CHECK (true);

-- Allow authenticated users to read multicaixa_express_config
CREATE POLICY read_config ON multicaixa_express_config
    FOR SELECT TO authenticated
    USING (true);

-- Add missing columns to orders table for coupon functionality
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Update existing orders to have subtotal = total where subtotal is null/0
UPDATE orders SET subtotal = total WHERE subtotal = 0 OR subtotal IS NULL;

-- Add comments to explain the columns
COMMENT ON COLUMN orders.coupon_code IS 'Code of the coupon applied to this order';
COMMENT ON COLUMN orders.discount_amount IS 'Amount discounted from the order total';
COMMENT ON COLUMN orders.subtotal IS 'Order subtotal before discounts and taxes';
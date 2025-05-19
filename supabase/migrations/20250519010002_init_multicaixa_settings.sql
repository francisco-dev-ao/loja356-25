
-- Ensure we have the proper settings for Multicaixa Express

-- First, check if we have any settings record
INSERT INTO settings (id, multicaixa_frametoken, multicaixa_callback, multicaixa_success, multicaixa_error, multicaixa_cssurl)
SELECT 'company-settings', 'a53787fd-b49e-4469-a6ab-fa6acf19db48', 
       CONCAT(current_setting('request.headers')::json->>'origin', '/api/payment-callback'),
       CONCAT(current_setting('request.headers')::json->>'origin', '/checkout/success'), 
       CONCAT(current_setting('request.headers')::json->>'origin', '/checkout/failed'),
       CONCAT(current_setting('request.headers')::json->>'origin', '/multicaixa-express.css')
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE id = 'company-settings');

-- Update settings if they already exist but multicaixa fields are null
UPDATE settings 
SET 
  multicaixa_frametoken = COALESCE(multicaixa_frametoken, 'a53787fd-b49e-4469-a6ab-fa6acf19db48'),
  multicaixa_callback = COALESCE(multicaixa_callback, CONCAT(current_setting('request.headers')::json->>'origin', '/api/payment-callback')),
  multicaixa_success = COALESCE(multicaixa_success, CONCAT(current_setting('request.headers')::json->>'origin', '/checkout/success')),
  multicaixa_error = COALESCE(multicaixa_error, CONCAT(current_setting('request.headers')::json->>'origin', '/checkout/failed')),
  multicaixa_cssurl = COALESCE(multicaixa_cssurl, CONCAT(current_setting('request.headers')::json->>'origin', '/multicaixa-express.css'))
WHERE id = 'company-settings';

-- Add initial config to multicaixa_express_config if it doesn't exist
INSERT INTO multicaixa_express_config (frame_token, callback_url, success_url, error_url, css_url, is_active)
SELECT 
  'a53787fd-b49e-4469-a6ab-fa6acf19db48',
  CONCAT(current_setting('request.headers')::json->>'origin', '/api/payment-callback'),
  CONCAT(current_setting('request.headers')::json->>'origin', '/checkout/success'),
  CONCAT(current_setting('request.headers')::json->>'origin', '/checkout/failed'),
  CONCAT(current_setting('request.headers')::json->>'origin', '/multicaixa-express.css'),
  true
WHERE NOT EXISTS (SELECT 1 FROM multicaixa_express_config);

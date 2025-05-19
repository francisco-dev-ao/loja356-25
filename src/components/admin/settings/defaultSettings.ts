
import { CompanySettings } from './types';

// Default company settings
export const defaultSettings: CompanySettings = {
  id: 'company-settings',
  name: '',
  address: '',
  nif: '',
  phone: '',
  email: '',
  website: '',
  smtp_host: '',
  smtp_port: '',
  smtp_user: '',
  smtp_password: '',
  smtp_from_email: '',
  smtp_from_name: '',
  smtp_secure: false,
  currency_locale: 'pt-AO',
  currency_code: 'AOA',
  currency_min_digits: 2,
  currency_max_digits: 2,
  email_template_order: '',
  // New Multicaixa Express fields
  multicaixa_frametoken: null,
  multicaixa_callback: null,
  multicaixa_success: null,
  multicaixa_error: null,
  multicaixa_cssurl: null,
};

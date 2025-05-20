
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
  // Multicaixa Express fields
  multicaixa_frametoken: null,
  multicaixa_callback: null,
  multicaixa_success: null,
  multicaixa_error: null,
  multicaixa_cssurl: null,
  bank_name: '',
  bank_account_holder: '',
  bank_account_number: '',
  bank_iban: ' AO06 0055 0000 3795713510103',
  bank_logo_url: null,
};

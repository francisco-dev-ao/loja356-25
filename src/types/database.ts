
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  base_price: number | null;
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number | null;
  image: string;
  category: string;
  stock: number;
  active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type MulticaixaPayment = {
  id: number;
  order_id: string;
  reference: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  emis_token?: string;
  emis_response?: any;
  created_at?: string;
  completed_at?: string;
};

export type MulticaixaConfig = {
  id: number;
  frame_token: string;
  callback_url: string;
  success_url: string;
  error_url: string;
  css_url?: string;
  commission_rate?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Settings = {
  id: string;
  name?: string;
  address?: string;
  nif?: string;
  phone?: string;
  email?: string;
  website?: string;
  multicaixa_frametoken?: string;
  multicaixa_callback?: string;
  multicaixa_success?: string;
  multicaixa_error?: string;
  multicaixa_cssurl?: string;
  currency_locale?: string;
  currency_code?: string;
  currency_min_digits?: number;
  currency_max_digits?: number;
  smtp_host?: string;
  smtp_port?: string;
  smtp_user?: string;
  smtp_password?: string;
  smtp_from_email?: string;
  smtp_from_name?: string;
  smtp_secure?: boolean;
  email_template_order?: string;
};

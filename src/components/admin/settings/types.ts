
// Define types for the company settings that match our database structure
export type CompanySettings = {
  id: string;
  name: string | null;
  address: string | null;
  nif: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  smtp_host: string | null;
  smtp_port: string | null;
  smtp_user: string | null;
  smtp_password: string | null;
  smtp_from_email: string | null;
  smtp_from_name: string | null;
  smtp_secure: boolean | null;
  currency_locale: string;
  currency_code: string;
  currency_min_digits: number;
  currency_max_digits: number;
  email_template_order: string;
  // Add Multicaixa Express fields  multicaixa_frametoken: string | null;
  multicaixa_callback: string | null;
  multicaixa_success: string | null;
  multicaixa_error: string | null;
  multicaixa_cssurl: string | null;
  bank_name: string | null;
  bank_account_holder: string | null;
  bank_account_number: string | null;
  bank_iban: string | null;
  bank_logo_url: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type SettingsContextType = {
  settings: CompanySettings;
  setSettings: React.Dispatch<React.SetStateAction<CompanySettings>>;
  loading: boolean;
  saving: boolean;
  testingSmtp: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleNumberInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSaveSettings: () => Promise<void>;
  handleTestSmtp: () => Promise<void>;
};

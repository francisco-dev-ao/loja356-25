export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      coupons: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          discount_type: string
          discount_value: number
          id: string
          max_uses: number | null
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          discount_type: string
          discount_value: number
          id?: string
          max_uses?: number | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          discount_type?: string
          discount_value?: number
          id?: string
          max_uses?: number | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      multicaixa_express_callbacks: {
        Row: {
          amount: number | null
          created_at: string | null
          id: number
          ip_address: string | null
          payment_reference: string | null
          processed_successfully: boolean | null
          raw_data: string
          status: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: number
          ip_address?: string | null
          payment_reference?: string | null
          processed_successfully?: boolean | null
          raw_data: string
          status?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: number
          ip_address?: string | null
          payment_reference?: string | null
          processed_successfully?: boolean | null
          raw_data?: string
          status?: string | null
        }
        Relationships: []
      }
      multicaixa_express_config: {
        Row: {
          callback_url: string
          commission_rate: number | null
          created_at: string | null
          css_url: string | null
          error_url: string
          frame_token: string
          id: number
          is_active: boolean | null
          success_url: string
          updated_at: string | null
        }
        Insert: {
          callback_url: string
          commission_rate?: number | null
          created_at?: string | null
          css_url?: string | null
          error_url: string
          frame_token: string
          id?: number
          is_active?: boolean | null
          success_url: string
          updated_at?: string | null
        }
        Update: {
          callback_url?: string
          commission_rate?: number | null
          created_at?: string | null
          css_url?: string | null
          error_url?: string
          frame_token?: string
          id?: number
          is_active?: boolean | null
          success_url?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      multicaixa_express_payments: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          emis_response: string | null
          emis_token: string | null
          id: number
          order_id: string
          payment_method: string | null
          reference: string
          status: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          emis_response?: string | null
          emis_token?: string | null
          id?: number
          order_id: string
          payment_method?: string | null
          reference: string
          status?: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          emis_response?: string | null
          emis_token?: string | null
          id?: number
          order_id?: string
          payment_method?: string | null
          reference?: string
          status?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          id: string
          payment_method: string
          payment_reference: string | null
          payment_status: string
          reference_mcx: string | null
          status: string
          total: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          payment_method: string
          payment_reference?: string | null
          payment_status?: string
          reference_mcx?: string | null
          status?: string
          total: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_method?: string
          payment_reference?: string | null
          payment_status?: string
          reference_mcx?: string | null
          status?: string
          total?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          order_id: string
          payment_data: Json | null
          payment_method: string
          reference: string
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          order_id: string
          payment_data?: Json | null
          payment_method?: string
          reference: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          order_id?: string
          payment_data?: Json | null
          payment_method?: string
          reference?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          base_price: number | null
          category: string
          created_at: string | null
          description: string
          discount_type: string | null
          discount_value: number | null
          id: string
          image: string
          name: string
          price: number
          stock: number
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          base_price?: number | null
          category: string
          created_at?: string | null
          description: string
          discount_type?: string | null
          discount_value?: number | null
          id: string
          image: string
          name: string
          price: number
          stock?: number
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          base_price?: number | null
          category?: string
          created_at?: string | null
          description?: string
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          image?: string
          name?: string
          price?: number
          stock?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          nif: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          nif?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          nif?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          address: string | null
          bank_account_holder: string | null
          bank_account_number: string | null
          bank_iban: string | null
          bank_logo_url: string | null
          bank_name: string | null
          created_at: string | null
          currency_code: string | null
          currency_locale: string | null
          currency_max_digits: number | null
          currency_min_digits: number | null
          email: string | null
          email_template_order: string | null
          id: string
          multicaixa_callback: string | null
          multicaixa_cssurl: string | null
          multicaixa_error: string | null
          multicaixa_frametoken: string | null
          multicaixa_success: string | null
          name: string | null
          nif: string | null
          phone: string | null
          smtp_from_email: string | null
          smtp_from_name: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: string | null
          smtp_secure: boolean | null
          smtp_user: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_iban?: string | null
          bank_logo_url?: string | null
          bank_name?: string | null
          created_at?: string | null
          currency_code?: string | null
          currency_locale?: string | null
          currency_max_digits?: number | null
          currency_min_digits?: number | null
          email?: string | null
          email_template_order?: string | null
          id: string
          multicaixa_callback?: string | null
          multicaixa_cssurl?: string | null
          multicaixa_error?: string | null
          multicaixa_frametoken?: string | null
          multicaixa_success?: string | null
          name?: string | null
          nif?: string | null
          phone?: string | null
          smtp_from_email?: string | null
          smtp_from_name?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: string | null
          smtp_secure?: boolean | null
          smtp_user?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_iban?: string | null
          bank_logo_url?: string | null
          bank_name?: string | null
          created_at?: string | null
          currency_code?: string | null
          currency_locale?: string | null
          currency_max_digits?: number | null
          currency_min_digits?: number | null
          email?: string | null
          email_template_order?: string | null
          id?: string
          multicaixa_callback?: string | null
          multicaixa_cssurl?: string | null
          multicaixa_error?: string | null
          multicaixa_frametoken?: string | null
          multicaixa_success?: string | null
          name?: string | null
          nif?: string | null
          phone?: string | null
          smtp_from_email?: string | null
          smtp_from_name?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: string | null
          smtp_secure?: boolean | null
          smtp_user?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      user_carts: {
        Row: {
          cart_data: Json
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cart_data?: Json
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cart_data?: Json
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

const API_BASE_URL = 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Erro na requisição' };
      }

      return { data };
    } catch (error: any) {
      return { error: error.message || 'Erro de conexão' };
    }
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async updateProfile(data: { name: string }) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Products
  async getProducts() {
    return this.request('/products');
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async createProduct(product: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, product: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async getOrders() {
    return this.request('/orders');
  }

  async getAllOrders() {
    return this.request('/orders/admin/all');
  }

  async createOrder(order: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async updateOrderPaymentReference(orderId: string, paymentReference: string) {
    return this.request(`/orders/${orderId}/payment-reference`, {
      method: 'PUT',
      body: JSON.stringify({ payment_reference: paymentReference }),
    });
  }

  // Cart
  async getCart() {
    return this.request('/cart');
  }

  async saveCart(cartData: any) {
    return this.request('/cart', {
      method: 'POST',
      body: JSON.stringify(cartData),
    });
  }

  async clearCart() {
    return this.request('/cart', {
      method: 'DELETE',
    });
  }

  // Settings
  async getSettings() {
    return this.request('/settings');
  }

  async saveSettings(settings: any) {
    return this.request('/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  async getMulticaixaExpressConfig() {
    return this.request('/settings/multicaixa-express');
  }

  async saveMulticaixaExpressConfig(config: any) {
    return this.request('/settings/multicaixa-express', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  // Email
  async sendOrderConfirmation(data: {
    orderId: string;
    customerEmail: string;
    customerName: string;
  }) {
    return this.request('/email/send-order-confirmation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async testSmtp(smtp: any) {
    return this.request('/email/test-smtp', {
      method: 'POST',
      body: JSON.stringify({ smtp }),
    });
  }
}

export const apiClient = new ApiClient();
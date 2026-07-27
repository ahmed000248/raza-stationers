export interface APIClientOptions {
  baseUrl: string;
  authToken?: string;
}

export class RazaAPIClient {
  private baseUrl: string;
  private authToken?: string;

  constructor(options: APIClientOptions) {
    this.baseUrl = options.baseUrl;
    this.authToken = options.authToken;
  }

  public setAuthToken(token: string) {
    this.authToken = token;
  }

  // Auth
  async login(mobileNumber: string, password: string) {
    return this.post("/auth/login", { mobileNumber, password });
  }

  async register(data: { name: string; mobileNumber: string; password: string }) {
    return this.post("/auth/register", data);
  }

  // Profile
  async getProfile() {
    return this.get("/users/me");
  }

  // Catalogue
  async getProducts(params?: { page?: number; limit?: number; search?: string; categorySlug?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.categorySlug) searchParams.set("categorySlug", params.categorySlug);
    const qs = searchParams.toString();
    return this.get(`/products${qs ? `?${qs}` : ""}`);
  }

  async getProduct(sku: string) {
    return this.get(`/products/${sku}`);
  }

  async getCategories() {
    return this.get("/categories");
  }

  // Pricing
  async getResolvedPrice(sku: string, clientBusinessId?: string) {
    const qs = clientBusinessId ? `?clientBusinessId=${clientBusinessId}` : "";
    return this.get(`/pricing/resolve/${sku}${qs}`);
  }

  // Orders
  async createOrder(data: {
    clientBusinessId: string;
    items: Array<{ productPackagingId: string; quantity: number }>;
    recipientName: string;
    mobile: string;
    address: string;
    city: string;
  }) {
    return this.post("/orders", data);
  }

  async getOrders(params?: { page?: number; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.status) searchParams.set("status", params.status);
    const qs = searchParams.toString();
    return this.get(`/orders${qs ? `?${qs}` : ""}`);
  }

  async getOrder(id: string) {
    return this.get(`/orders/${id}`);
  }

  // Clients
  async registerClient(data: {
    businessName: string;
    businessType: string;
    contactPerson: string;
    mobileNumber: string;
    address: string;
    city: string;
  }) {
    return this.post("/clients", data);
  }

  async getClient(id: string) {
    return this.get(`/clients/${id}`);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.put(`/orders/${id}/status`, { status });
  }

  // Dashboard
  async getDashboardStats() {
    return this.get("/dashboard/stats");
  }

  // Clients (admin)
  async listClients(params?: { page?: number; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.status) searchParams.set("status", params.status);
    const qs = searchParams.toString();
    return this.get(`/clients${qs ? `?${qs}` : ""}`);
  }

  async approveClient(id: string) {
    return this.put(`/clients/${id}/approve`, {});
  }

  // Stock
  async getAllStock(params?: { page?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    const qs = searchParams.toString();
    return this.get(`/stock${qs ? `?${qs}` : ""}`);
  }

  async getStock(sku: string) {
    return this.get(`/stock/${sku}`);
  }

  // Delivery
  async getAllDeliveries(params?: { page?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    const qs = searchParams.toString();
    return this.get(`/deliveries${qs ? `?${qs}` : ""}`);
  }

  async getProductById(id: string) {
    return this.get(`/products/id/${id}`);
  }

  async updateClientCredit(id: string, data: { creditLimit: number; creditDays?: number }) {
    return this.put(`/clients/${id}/credit`, data);
  }

  // Invoices
  async getInvoice(id: string) {
    return this.get(`/invoices/${id}`);
  }

  async getClientInvoices(clientBusinessId: string) {
    return this.get(`/client-invoices/${clientBusinessId}`);
  }

  // Auth
  async changePassword(currentPassword: string, newPassword: string) {
    return this.put("/auth/change-password", { currentPassword, newPassword });
  }

  // Notification subscriptions
  async getNotificationSubscriptions() {
    return this.get("/notifications/subscriptions");
  }

  async subscribeToNotifications(data: { scope: string; productId?: string; categoryId?: string }) {
    return this.post("/notifications/subscriptions", data);
  }

  async removeNotificationSubscription(id: string) {
    return this.delete(`/notifications/subscriptions/${id}`);
  }

  // Audit
  async getAuditLogs(params?: { page?: number; limit?: number; entityType?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.entityType) searchParams.set("entityType", params.entityType);
    const qs = searchParams.toString();
    return this.get(`/audit-logs${qs ? `?${qs}` : ""}`);
  }

  // Notifications
  async getNotifications() {
    return this.get("/notifications");
  }

  async markNotificationRead(id: string) {
    return this.put(`/notifications/${id}/read`, {});
  }

  async post(path: string, body?: unknown) {
    return this.postMethod(path, body);
  }

  private async get(path: string) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const error = await res.text().catch(() => "Unknown error");
      throw new Error(`${res.status} ${error}`);
    }
    return res.json();
  }

  private async delete(path: string) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const error = await res.text().catch(() => "Unknown error");
      throw new Error(`${res.status} ${error}`);
    }
    return res.json();
  }

  private async put(path: string, body: unknown) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const error = await res.text().catch(() => "Unknown error");
      throw new Error(`${res.status} ${error}`);
    }
    return res.json();
  }

  private async postMethod(path: string, body?: unknown) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const error = await res.text().catch(() => "Unknown error");
      throw new Error(`${res.status} ${error}`);
    }
    return res.json();
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.authToken) headers["Authorization"] = `Bearer ${this.authToken}`;
    return headers;
  }
}

export const createAPIClient = (options: APIClientOptions) => new RazaAPIClient(options);

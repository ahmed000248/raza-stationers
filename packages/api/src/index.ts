import { createAuthClient } from "better-auth/client";
import { twoFactorClient } from "better-auth/client/plugins";
import { sentinelClient } from "@better-auth/infra/client";

export class APIError extends Error {
  public status: number;
  public endpoint?: string;

  constructor(message: string, status: number, endpoint?: string) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.endpoint = endpoint;
  }
}

export interface APIClientOptions {
  baseUrl: string;
  authToken?: string;
  onUnauthorized?: () => void;
}

export function createBetterAuthClient(baseUrl: string) {
  return createAuthClient({
    baseURL: `${baseUrl}/auth/api`,
    plugins: [twoFactorClient()],
    fetchOptions: {
      credentials: "include",
    },
  });
}

export class RazaAPIClient {
  private baseUrl: string;
  private authToken?: string;
  private onUnauthorized?: () => void;

  constructor(options: APIClientOptions) {
    this.baseUrl = options.baseUrl;
    this.authToken = options.authToken;
    this.onUnauthorized = options.onUnauthorized;
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

  async getBootstrapStatus() {
    return this.get("/auth/bootstrap-status");
  }

  // Catalogue
  async getProducts(params?: { page?: number; limit?: number; search?: string; categorySlug?: string; saleType?: "individual" | "bulk"; unit?: string; stock?: "updating" | "out_of_stock" | "low_stock" | "in_stock"; minPrice?: number; maxPrice?: number; sort?: "name_asc" | "name_desc" | "newest"; signal?: AbortSignal }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.categorySlug) searchParams.set("categorySlug", params.categorySlug);
    if (params?.saleType) searchParams.set("saleType", params.saleType);
    if (params?.unit) searchParams.set("unit", params.unit);
    if (params?.stock) searchParams.set("stock", params.stock);
    if (params?.minPrice !== undefined) searchParams.set("minPrice", String(params.minPrice));
    if (params?.maxPrice !== undefined) searchParams.set("maxPrice", String(params.maxPrice));
    if (params?.sort) searchParams.set("sort", params.sort);
    const qs = searchParams.toString();
    return this.get(`/products${qs ? `?${qs}` : ""}`, params?.signal);
  }

  async getProduct(sku: string) {
    return this.get(`/products/${sku}`);
  }

  async getCategories() {
    return this.get("/categories");
  }

  async getCatalogueFilterOptions() {
    return this.get("/catalogue/filter-options");
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
    address?: string;
    city?: string;
    deliveryNotes?: string;
    paymentMethod?: string;
    fulfilmentMethod: "delivery" | "pickup";
    idempotencyKey: string;
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

  async getMyClient() {
    return this.get("/clients/me");
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
  async getAllStock(params?: { page?: number; limit?: number; search?: string; stockState?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.stockState) searchParams.set("stockState", params.stockState);
    const qs = searchParams.toString();
    return this.get(`/stock${qs ? `?${qs}` : ""}`);
  }

  async getStock(sku: string) {
    return this.get(`/stock/${sku}`);
  }

  async recordOpeningStock(data: { productId: string; stockLocationId: string; quantityBase: number; reason: string }) { return this.post("/stock/opening", data); }
  async adjustStock(data: { productId: string; stockLocationId: string; quantityDelta: number; reason: string }) { return this.post("/stock/adjustments", data); }
  async getStockLocations() { return this.get("/stock-locations"); }

  // Delivery
  async getAllDeliveries(params?: { page?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    const qs = searchParams.toString();
    return this.get(`/deliveries${qs ? `?${qs}` : ""}`);
  }
  async createDelivery(orderId: string) { return this.post("/deliveries", { orderId }); }
  async getDelivery(id: string) { return this.get(`/deliveries/${id}`); }
  async getDeliveryByOrder(orderId: string) { return this.get(`/deliveries/order/${orderId}`); }

  // Returns
  async requestReturn(data: { orderId: string; invoiceId: string; reason: string }) { return this.post("/returns", data); }
  async getReturn(id: string) { return this.get(`/returns/${id}`); }
  async getReturnsByOrder(orderId: string) { return this.get(`/returns/order/${orderId}`); }

  // Admin catalogue
  async getAdminProducts(params?: { page?: number; limit?: number; status?: string; categorySlug?: string }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set("page", String(params.page));
    if (params?.limit) sp.set("limit", String(params.limit));
    if (params?.status) sp.set("status", params.status);
    if (params?.categorySlug) sp.set("categorySlug", params.categorySlug);
    return this.get(`/admin/products${sp.toString() ? `?${sp.toString()}` : ""}`);
  }

  async createProduct(data: { name: string; categoryId: string; purchaseType?: string; shopName?: string; description?: string; wholesalePrice?: number }) {
    return this.post("/products", data);
  }

  async updateProduct(id: string, data: { name?: string; categoryId?: string; shopName?: string; description?: string; purchaseType?: string }) {
    return this.put(`/products/${id}`, data);
  }

  async updateProductStatus(id: string, status: string) {
    return this.put(`/products/${id}/status`, { status });
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

  // Staff
  async listStaff() { return this.get("/staff"); }
  async createStaff(data: { name: string; email: string; mobileNumber: string; role: "admin" | "packing" | "delivery" }) { return this.post("/staff", data); }
  async toggleStaffActive(id: string) { return this.put(`/staff/${id}/toggle-active`, {}); }
  async changeStaffRole(id: string, role: string) { return this.put(`/staff/${id}/change-role`, { role }); }

  // Accounting
  async getAccountingSummary() { return this.get("/accounting/summary"); }
  async getAccountingRevenue() { return this.get("/accounting/revenue"); }
  async getAccountingExpenses() { return this.get("/accounting/expenses"); }
  async createExpense(data: { amount: number; category: string; description: string }) { return this.post("/accounting/expenses", data); }
  async getOutstandingClients() { return this.get("/accounting/outstanding"); }

  // Settings
  async getSettings() { return this.get("/settings"); }
  async updateSettings(data: { businessName?: string; contactPhone?: string; requireApproval?: boolean; stockAlert?: boolean; packingView?: boolean; pickupLocation?: string | null; pickupInstructions?: string | null }) { return this.put("/settings", data); }

  async getFulfilmentOptions() { return this.get("/orders/fulfilment-options"); }

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

  private async handleErrorResponse(res: Response, path?: string): Promise<never> {
    if (res.status === 401 && this.onUnauthorized) {
      try {
        this.onUnauthorized();
      } catch {}
    }
    const text = await res.text().catch(() => "Unknown error");
    let message = text;
    try {
      const parsed = JSON.parse(text);
      if (parsed.message) {
        message = Array.isArray(parsed.message) ? parsed.message.join(", ") : parsed.message;
      }
    } catch {}
    throw new APIError(message, res.status, path);
  }

  private async get(path: string, signal?: AbortSignal) {
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        headers: this.getHeaders(),
        credentials: "include",
        signal,
      });
      if (!res.ok) await this.handleErrorResponse(res, path);
      return res.json();
    } catch (err: any) {
      if (err.name === "AbortError") throw err;
      if (err instanceof TypeError && err.message.includes("fetch")) {
        throw new APIError("Unable to connect to server. Please check your internet connection.", 0, path);
      }
      throw err;
    }
  }

  private async delete(path: string) {
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: "DELETE",
        headers: this.getHeaders(),
        credentials: "include",
      });
      if (!res.ok) await this.handleErrorResponse(res, path);
      return res.json();
    } catch (err: any) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        throw new APIError("Unable to connect to server. Please check your internet connection.", 0, path);
      }
      throw err;
    }
  }

  private async put(path: string, body: unknown) {
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: "PUT",
        headers: this.getHeaders(),
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) await this.handleErrorResponse(res, path);
      return res.json();
    } catch (err: any) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        throw new APIError("Unable to connect to server. Please check your internet connection.", 0, path);
      }
      throw err;
    }
  }

  private async postMethod(path: string, body?: unknown) {
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: this.getHeaders(),
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) await this.handleErrorResponse(res, path);
      return res.json();
    } catch (err: any) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        throw new APIError("Unable to connect to server. Please check your internet connection.", 0, path);
      }
      throw err;
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.authToken) headers["Authorization"] = `Bearer ${this.authToken}`;
    return headers;
  }
}

export const createAPIClient = (options: APIClientOptions) => new RazaAPIClient(options);

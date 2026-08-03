/**
 * Shared Domain Models & Types — Raza Stationers
 *
 * Mirrors TRD v1.2 §6 (Database Schema) entity-for-entity, so this package stays
 * the single source of truth for `apps/web`, `apps/admin`, `apps/mobile`, and
 * `packages/api` / `packages/db`. Field lists follow the TRD table exactly;
 * TypeScript fields are camelCase, the eventual Prisma/Postgres columns are
 * snake_case (e.g. `clientBusinessId` here ↔ `client_business_id` in the DB).
 *
 * Every interface below is tagged with the FRD requirement(s) it implements.
 * If a field doesn't trace back to the TRD/FRD/BRD, it doesn't belong here —
 * add it to the docs first, then to this file.
 */

// ---------------------------------------------------------------------------
// Users & Staff — FR-AUTH, FR-STF, TRD §6 (User, StaffProfile)
// ---------------------------------------------------------------------------

/**
 * Site-level role. Guests are not persisted as a User (BRD §5) — they only
 * exist as an unauthenticated request. 'business_user' covers both the
 * Client Business primary contact and additional linked staff; which one
 * they are is determined by their BusinessUserLink.businessRole, not here.
 */
export type UserRole = 'owner' | 'admin' | 'packing' | 'delivery' | 'business_user';

/** Subset of UserRole that can hold a StaffProfile (FR-STF-01). */
export type StaffRole = 'admin' | 'packing' | 'delivery';

export interface User {
  id: string;
  mobileNumber: string;
  /** Never sent to the client — included here only because it's a DB column. */
  passwordHash: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

/** Public-safe projection of User for API responses (FR-SEC-01: never leak passwordHash). */
export type PublicUser = Omit<User, 'passwordHash'>;

/** FR-STF-04 — basic staff profile info, independent of business linkage. */
export interface StaffProfile {
  id: string;
  userId: string;
  staffRole: StaffRole;
  joinDate: string;
}

// ---------------------------------------------------------------------------
// Client Business Management (core feature) — BRD §15 (CB-01–CB-08), FR-CB-*
// ---------------------------------------------------------------------------

export type BusinessType =
  | 'stationery_shop'
  | 'school'
  | 'bookstore'
  | 'office'
  | 'distributor'
  | 'other';

/** CB-06 / FR-CB-02, FR-CB-03: approval workflow status. */
export type ClientBusinessAccountStatus = 'pending' | 'active' | 'suspended' | 'blocked';

/** PY-01 / FR-PAY-01, FR-PAY-04: credit privileges, distinct from account status. */
export type CreditStatus = 'active' | 'suspended' | 'blocked';

/**
 * The wholesale customer record. BRD CB-07: "the client business is the
 * primary wholesale customer record" — individual Users are just people
 * authorized to act on its behalf via BusinessUserLink. This replaces the
 * old flat `CustomerProfile` type, which incorrectly modeled a business
 * customer as a single individual (discountPercentage, credit fields, etc.
 * all lived on a per-user record instead of per-business).
 */
export interface ClientBusiness {
  id: string;
  businessName: string;
  ownerName: string;
  contactPerson: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  city: string;
  businessType: BusinessType;
  /** BRD CB-01: relationship length drives tier/relationship decisions, not just discount %. */
  relationshipStartDate?: string;
  /** CD-01/CD-02 default account-wide discount; never shown to the customer directly (CD-04). */
  discountPercent: number;
  /** PY-01: Owner-only to set/change. */
  creditLimit: number;
  /** Derived/cached from CreditTransaction sum — never edited directly (TRD §11). */
  outstandingBalance: number;
  creditStatus: CreditStatus;
  accountStatus: ClientBusinessAccountStatus;
  internalNotes?: string;
  createdAt: string;
}

/** FR-CB-05/FR-CB-06 — role of a linked user within their client business. */
export type BusinessUserRole = 'owner' | 'manager' | 'purchase_officer' | 'branch_employee';

/**
 * Many-to-many link between a User and the ClientBusiness they order on
 * behalf of. Pricing, credit, and order history all belong to the
 * ClientBusiness, never to the individual User (BRD CB-05).
 */
export interface BusinessUserLink {
  id: string;
  userId: string;
  clientBusinessId: string;
  businessRole: BusinessUserRole;
}

/**
 * Composed read-model for the frontend (NOT a database entity) — what a
 * logged-in business user sees about their own account: their identity plus
 * their linked business's pricing/credit/approval state. Assembled by the
 * API from User + BusinessUserLink + ClientBusiness.
 */
export interface CustomerProfileView {
  user: PublicUser;
  businessRole: BusinessUserRole;
  clientBusiness: ClientBusiness;
}

// ---------------------------------------------------------------------------
// Catalogue — FR-CAT-*, FR-STK-*, TRD §6 (Category, Product, ProductUnit, StockLevel, StockMovement)
// ---------------------------------------------------------------------------

export interface Category {
  id: string;
  name: string;
  nameUrdu?: string;
  parentCategoryId?: string;
}

/**
 * 'individual' | 'bulk' | 'both' — the design system's Individual/Bulk
 * purchase-type toggle (Catalogue.dc.html, reviewed design). This field is
 * NOT yet in the FRD/TRD text; it was decided during the design phase after
 * both documents were last revised. Flagging: FRD FR-CAT and TRD §6's
 * Product row should be updated to mention this explicitly — tracked as a
 * docs follow-up, not silently assumed.
 */
export type ProductPurchaseType = 'individual' | 'bulk' | 'both';

/**
 * No `imageUrl` field — the catalogue is description-based only per the
 * finalized design system (no product photography anywhere; an icon block
 * represents each product). TRD §6's Product row already reflects this
 * (it never listed an image field); FRD FR-CAT-01's prose still says
 * "including ... images", which is a stale artifact from before that
 * design decision — see docs fix applied alongside this file.
 */
export interface Product {
  id: string;
  name: string;
  nameUrdu?: string;
  /** NA-03: commonly-used local/shop name, also searchable (FR-LNG-02). */
  shopName?: string;
  categoryId: string;
  description: string;
  /**
   * Three independently-set prices — decided during database design once the
   * real 2,156-item rate list showed each is a genuinely observed number, not
   * a formula derived from the others. BRD CD-01/PR-01 and FRD §8 updated to
   * match (v1.5):
   * - `retailPrice` is FRD §8's "standard selling price" — what guests,
   *   walk-ins, and unapproved accounts see (BRD CD-01 "Standard Customer").
   * - `wholesalePrice` is the default price for an approved "Regular
   *   Wholesale Customer" account (BRD CD-01) with no extra negotiated
   *   discount. Previously this tier had no distinct price and silently fell
   *   through to retailPrice — this field closes that gap.
   * - `buyingPrice` is cost from the supplier — Owner-only, accounting/margin
   *   use only (FR-ACC), never included in a customer-facing API response.
   * `wholesalePrice` is required (the source rate list always has it);
   * `retailPrice`/`buyingPrice` are optional until the business supplies them
   * (tracked follow-up: make required once every product has real values).
   */
  buyingPrice?: number;
  wholesalePrice: number;
  retailPrice?: number;
  sku: string;
  barcode?: string;
  isArchived: boolean;
  purchaseType: ProductPurchaseType;
  createdAt: string;
  updatedAt: string;
}

/** FR-CAT-03/PR-02 — unit of sale with conversion to the tracked base unit. */
export interface ProductUnit {
  id: string;
  productId: string;
  unitName: 'piece' | 'dozen' | 'carton' | string;
  conversionToBase: number;
}

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

/** FR-STK-01 to 04 — current level lives here; StockStatus is derived, not stored. */
export interface StockLevel {
  id: string;
  productId: string;
  currentQuantity: number;
  lowStockThreshold: number;
}

/** Derives FR-CAT-05's live stock label from a StockLevel row. */
export function deriveStockStatus(level: Pick<StockLevel, 'currentQuantity' | 'lowStockThreshold'>): StockStatus {
  if (level.currentQuantity <= 0) return 'OUT_OF_STOCK';
  if (level.currentQuantity <= level.lowStockThreshold) return 'LOW_STOCK';
  return 'IN_STOCK';
}

/**
 * Read-model for catalogue/search API responses — a Product joined with its
 * live stock status. Not a database entity.
 */
export type ProductCatalogueView = Product & {
  stockStatus: StockStatus;
  currentQuantity: number;
};

/** SK-01/FR-STK-01: routine restock. SK-01+FR-STK-07: owner-only correction/adjustment. */
export type StockMovementType = 'restock' | 'sale' | 'adjustment';

export interface StockMovement {
  id: string;
  productId: string;
  quantityChange: number;
  movementType: StockMovementType;
  supplier?: string;
  purchasePrice?: number;
  invoiceNumber?: string;
  /** Required by FR-STK-07 when movementType === 'adjustment'; enforced at the API/validation layer. */
  reason?: string;
  enteredByUserId: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Pricing & Discounts — FR-PRC-*, TRD §6 (DiscountRule, DiscountChangeLog), TRD §9
// ---------------------------------------------------------------------------

export type DiscountScope = 'account_wide' | 'category' | 'product';

/** FR-PRC-02/03 — a category- or product-level override for one client business. */
export interface DiscountRule {
  id: string;
  clientBusinessId: string;
  scope: DiscountScope;
  categoryId?: string;
  productId?: string;
  discountPercent?: number;
  fixedPrice?: number;
  isActive: boolean;
}

/** FR-PRC-05 — immutable change log, reason required. */
export interface DiscountChangeLog {
  id: string;
  clientBusinessId: string;
  previousValue: string;
  newValue: string;
  changedByUserId: string;
  reason: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Orders — FR-ORD-*, FR-CRT-*, TRD §6 (Order, OrderItem, OrderStatusHistory), TRD §7/§10
// ---------------------------------------------------------------------------

/**
 * Full internal state machine — FRD §7. Only the transitions listed there
 * are valid; enforcement lives in the backend OrderStateMachine service, not
 * in this type.
 */
export type OrderStatus =
  | 'pending_review'
  | 'confirmed'
  | 'rejected'
  | 'pending_owner_approval'
  | 'change_requested'
  | 'packed'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed_delivery'
  | 'cancelled';

/**
 * FRD §7 closing note: "Customers see a simplified version of this state
 * machine (Placed → Confirmed → Preparing → Out for Delivery → Delivered)".
 * 'cancelled' and 'rejected' are added here too — the FRD's simplified list
 * only describes the happy path, but a customer whose order was rejected or
 * who cancelled it still needs to see that outcome.
 */
export type CustomerFacingOrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'rejected';

/** Maps every internal status to what the customer sees, per FRD §7. */
export const ORDER_STATUS_CUSTOMER_VIEW: Record<OrderStatus, CustomerFacingOrderStatus> = {
  pending_review: 'placed',
  pending_owner_approval: 'placed',
  confirmed: 'confirmed',
  change_requested: 'confirmed',
  packed: 'preparing',
  out_for_delivery: 'out_for_delivery',
  failed_delivery: 'out_for_delivery',
  delivered: 'delivered',
  cancelled: 'cancelled',
  rejected: 'rejected',
};

export type PaymentMethod =
  | 'ONLINE_EASYPAISA'
  | 'ONLINE_JAZZCASH'
  | 'ONLINE_NAYAPAY'
  | 'ONLINE_BANK_TRANSFER'
  | 'CASH_ON_DELIVERY'
  | 'PAY_LATER_CREDIT';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  /** Denormalized for display convenience in API responses/slips — not a DB column. */
  productName: string;
  unit: string;
  quantity: number;
  /** FR-PRC-06: the resolved final price at the moment of order — never a discount %. */
  unitPriceAtOrder: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientBusinessId: string;
  placedByUserId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  deliveryAddress: string;
  items: OrderItem[];
  createdAt: string;
  confirmedAt?: string;
}

/** FR-ORD-06/§7 — every transition writes a row here, which also feeds AuditLog. */
export interface OrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedByUserId: string;
  reason?: string;
  createdAt: string;
}

/** FR-DLV-* — dispatch/delivery accountability record (ST-02). */
export interface DeliveryAssignment {
  id: string;
  orderId: string;
  deliveryWorkerId: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  deliveryStatus: 'assigned' | 'dispatched' | 'delivered' | 'failed';
  cashCollected?: number;
  failedReason?: string;
  returnedItems?: string;
}

// ---------------------------------------------------------------------------
// Payments & Credit — FR-PAY-*, TRD §6 (Payment, CreditTransaction), TRD §11/§15
// ---------------------------------------------------------------------------

/** TRD §15: manual/mock flow in the demo; the same states extend to live gateway callbacks later. */
export type PaymentStatus = 'pending' | 'submitted' | 'verified' | 'rejected';

export interface Payment {
  id: string;
  orderId: string;
  clientBusinessId: string;
  amount: number;
  method: 'online' | 'cash' | 'credit' | 'partial';
  status: PaymentStatus;
  transactionReference?: string;
  receiptUrl?: string;
  verifiedByUserId?: string;
  createdAt: string;
}

export type CreditTransactionType = 'charge' | 'payment' | 'adjustment';

/** TRD §11 — ClientBusiness.outstandingBalance is derived from the sum of these rows. */
export interface CreditTransaction {
  id: string;
  clientBusinessId: string;
  orderId?: string;
  amount: number;
  type: CreditTransactionType;
  balanceAfter: number;
  note?: string;
  createdAt: string;
}

/** Legacy pay-later summary view kept for reporting convenience — not a DB entity; derive from CreditTransaction. */
export interface PayLaterSummary {
  clientBusinessId: string;
  creditLimit: number;
  outstandingBalance: number;
  availableCredit: number;
  creditStatus: CreditStatus;
}

// ---------------------------------------------------------------------------
// Accounting — FR-ACC-*, TRD §6 (ExpenseEntry), Owner-only per BRD §5/AC-02
// ---------------------------------------------------------------------------

export type ExpenseCategory =
  | 'restocking'
  | 'salaries'
  | 'rent'
  | 'utilities'
  | 'fuel'
  | 'vehicle_maintenance'
  | 'packaging'
  | 'gateway_fees'
  | 'returns_refunds'
  | 'damaged_stock'
  | 'taxes'
  | 'other';

export interface ExpenseEntry {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  enteredByUserId: string;
  expenseDate: string;
}

// ---------------------------------------------------------------------------
// Notifications — FR-NTF-*, TRD §6 (NotificationSubscription, Notification), TRD §13
// ---------------------------------------------------------------------------

/** FR-NTF-01 — opt-in, targeted subscriptions (never blanket-broadcast). */
export interface NotificationSubscription {
  id: string;
  userId: string;
  scope: 'product' | 'category' | 'brand';
  targetId: string;
}

export type NotificationType =
  | 'restock'
  | 'order_status'
  | 'payment_reminder'
  | 'credit_status'
  | 'account_status'
  | 'announcement';

/** FR-NTF-06 — the notification feed itself, distinct from NotificationSubscription (preferences). */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Audit Log — FR-SEC-02/03, TRD §6 (AuditLog), Owner-only per BRD §5
// ---------------------------------------------------------------------------

export interface AuditLog {
  id: string;
  actorUserId: string;
  actionType: string;
  entityType: string;
  entityId: string;
  previousValue?: unknown;
  newValue?: unknown;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Provider-Neutral Authentication Contracts — FR-AUTH
// ---------------------------------------------------------------------------

export const AUTH_PROVIDER_NOT_CONFIGURED = "Authentication service is not configured yet.";
export interface AuthIdentity {
  id: string;
  email: string;
  displayName?: string;
  emailVerified?: boolean;
  provider?: string;
  createdAt?: string;
}

export interface AuthSession {
  identity: AuthIdentity;
  accessToken?: string;
  expiresAt?: number;
}

export type AccountStatus =
  | 'loading'
  | 'guest'
  | 'authenticated_unregistered'
  | 'pending'
  | 'approved'
  | 'unconfigured'
  | 'auth_error';

export interface AuthProviderAdapter {
  initialize(): Promise<void>;
  signIn(credentials: { email: string; password: string }): Promise<{ success: boolean; error?: string }>;
  signUp(details: { email: string; password: string; name?: string; mobileNumber?: string }): Promise<{ success: boolean; error?: string }>;
  signInWithGoogle(returnTo?: string): Promise<void>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  getAccessToken(): Promise<string | null>;
  subscribe(listener: (session: AuthSession | null) => void): () => void;
  requestPasswordReset?(email: string): Promise<{ success: boolean; error?: string }>;
}

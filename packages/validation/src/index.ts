import { z } from "zod"

/**
 * OF-04: Supported Delivery Zone Cities
 * Primary logistics coverage in Karachi and major Punjab cities.
 */
export const SUPPORTED_DELIVERY_CITIES = [
  "Wah Cantt",
  "Hassan Abdal",
  "Taxila",
  "Rawalpindi",
] as const

export type SupportedCity = (typeof SUPPORTED_DELIVERY_CITIES)[number]

/**
 * Convert accepted Pakistani mobile presentations to the owner-approved local
 * storage/display form: 03XXXXXXXXX. Returns null for landlines, malformed or
 * non-Pakistani numbers so callers cannot silently rewrite an identity.
 */
export function normalizePakistaniMobile(value: string): string | null {
  const compact = value.trim().replace(/[\s()-]/g, "")
  let digits = compact.replace(/^\+/, "")
  if (digits.startsWith("0092")) digits = digits.slice(2)
  if (digits.startsWith("92")) digits = `0${digits.slice(2)}`
  if (/^3\d{9}$/.test(digits)) digits = `0${digits}`
  return /^03\d{9}$/.test(digits) ? digits : null
}

export const pakistaniMobileSchema = z.string().transform((value, context) => {
  const normalized = normalizePakistaniMobile(value)
  if (!normalized) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a Pakistani mobile number in 03XXXXXXXXX format" })
    return z.NEVER
  }
  return normalized
})

/**
 * Check if a city string is in our delivery zones (OF-04)
 */
export function isCityInDeliveryZone(city: string): boolean {
  if (!city) return false
  const normalized = city.trim().toLowerCase()
  return SUPPORTED_DELIVERY_CITIES.some((c) => c.toLowerCase() === normalized)
}

/**
 * Delivery address validation schema (OF-04)
 */
export const deliveryAddressSchema = z.object({
  recipientName: z.string().min(2, "Recipient name must be at least 2 characters"),
  phone: pakistaniMobileSchema,
  city: z
    .string()
    .min(1, "Please select or enter your city")
    .refine((val) => isCityInDeliveryZone(val), {
      message: "This city is outside our delivery zones. Delivery is currently available in Wah Cantt, Hassan Abdal, Taxila, and Rawalpindi.",
    }),
  address: z.string().min(10, "Complete shop/office street address is required"),
  deliveryNotes: z.string().optional(),
})

export type DeliveryAddressFormData = z.infer<typeof deliveryAddressSchema>

/**
 * Payment methods validation schema (FR-CRT-02 to 07)
 */
export const paymentMethodSchema = z.enum([
  "ONLINE_EASYPAISA",
  "ONLINE_JAZZCASH",
  "ONLINE_NAYAPAY",
  "ONLINE_BANK_TRANSFER",
  "CASH_ON_DELIVERY",
  "PAY_LATER_CREDIT",
])

export type PaymentMethodType = z.infer<typeof paymentMethodSchema>

/**
 * Checkout Form Schema (OF-01, OF-04, FR-CRT-02)
 */
export const checkoutFormSchema = deliveryAddressSchema.extend({
  paymentMethod: paymentMethodSchema,
  receiptUploaded: z.boolean().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the wholesale delivery terms to submit your order",
  }),
})

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>

/**
 * Sign In Form Validation Schema (FR-AUTH-01)
 */
export const signInSchema = z.object({
  identifier: z.string().min(3, "Please enter your registered mobile number or email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export type SignInFormData = z.infer<typeof signInSchema>

/**
 * Wholesale Business Registration Form Schema (FR-AUTH-01/02)
 */
export const wholesaleRegistrationSchema = z.object({
  shopName: z.string().min(3, "Shop / Business name must be at least 3 characters"),
  ownerName: z.string().min(2, "Owner / Primary contact name is required"),
  mobile: pakistaniMobileSchema,
  email: z.string().email("Valid business email address is required"),
  city: z
    .string()
    .min(1, "Please select or enter your city")
    .refine((val) => isCityInDeliveryZone(val), {
      message: "This city is outside our delivery zones. Delivery is currently available in Wah Cantt, Hassan Abdal, Taxila, and Rawalpindi.",
    }),
  address: z.string().min(10, "Complete shop/market street address is required"),
  ntnCnic: z.string().min(5, "Valid NTN number or 13-digit CNIC is required for wholesale registration"),
  documentAttached: z.boolean().optional(),
})

export type WholesaleRegistrationFormData = z.infer<typeof wholesaleRegistrationSchema>

/**
 * Stock Manual Adjustment Validation Schema (FR-STK-07)
 * Mandatory reason string required for stock corrections/adjustments.
 */
export const stockAdjustmentSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  quantityChange: z.number().refine((val) => val !== 0, {
    message: "Quantity change must be non-zero",
  }),
  reason: z.string().min(5, "Mandatory reason required for stock adjustments (e.g. damaged stock, audit correction)"),
})

export type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>

/**
 * Discount Rule Override & Log Validation Schema (FR-PRC-05)
 * Mandatory change reason string required for discount overrides.
 */
export const discountRuleSchema = z.object({
  clientBusinessId: z.string().min(1, "Please select a client business"),
  discountPercent: z.number().min(0).max(50, "Discount percentage cannot exceed 50%"),
  reason: z.string().min(5, "Mandatory reason required for discount override changes (FR-PRC-05)"),
})

export type DiscountRuleFormData = z.infer<typeof discountRuleSchema>

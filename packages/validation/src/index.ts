import { z } from "zod"

/**
 * OF-04: Supported Delivery Zone Cities
 * Primary logistics coverage in Karachi and major Punjab cities.
 */
export const SUPPORTED_DELIVERY_CITIES = [
  "Karachi",
  "Lahore",
  "Faisalabad",
  "Rawalpindi",
  "Multan",
  "Islamabad",
] as const

export type SupportedCity = (typeof SUPPORTED_DELIVERY_CITIES)[number]

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
  phone: z
    .string()
    .min(10, "Please enter a valid phone number (+92 300 1234567)")
    .regex(/^(\+92|0)?3[0-9]{9}$/, "Must be a valid Pakistani mobile number"),
  city: z
    .string()
    .min(1, "Please select or enter your city")
    .refine((val) => isCityInDeliveryZone(val), {
      message: "This city is outside our delivery zones. Delivery is currently available in Karachi & major Punjab cities.",
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
  mobile: z
    .string()
    .min(10, "Please enter a valid Pakistani mobile number (+92 300 1234567)")
    .regex(/^(\+92|0)?3[0-9]{9}$/, "Must be a valid Pakistani mobile number"),
  email: z.string().email("Valid business email address is required"),
  city: z
    .string()
    .min(1, "Please select or enter your city")
    .refine((val) => isCityInDeliveryZone(val), {
      message: "This city is outside our delivery zones. Delivery is currently available in Karachi & major Punjab cities.",
    }),
  address: z.string().min(10, "Complete shop/market street address is required"),
  ntnCnic: z.string().min(5, "Valid NTN number or 13-digit CNIC is required for wholesale registration"),
  documentAttached: z.boolean().optional(),
})

export type WholesaleRegistrationFormData = z.infer<typeof wholesaleRegistrationSchema>

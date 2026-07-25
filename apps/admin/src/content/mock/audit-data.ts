export interface AuditLogEntry {
  id: string
  action: string
  detail: string
  user: string
  at: string
}

export const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: "aud-1",
    action: "Approved Wholesale Account",
    detail: "Approved Al-Madina Stationers for Tier B discount and Rs 200,000 credit limit.",
    user: "Rehan Raza",
    at: "2026-07-25T14:30:00Z",
  },
  {
    id: "aud-2",
    action: "Recorded Stock Correction",
    detail: "Adjusted Piano Fountain Ink 60ml Blue (-5 bottles). Reason: Damaged in warehouse leak.",
    user: "Rehan Raza",
    at: "2026-07-24T16:15:00Z",
  },
  {
    id: "aud-3",
    action: "Updated Client Credit Limit",
    detail: "Increased credit limit for Crown Traders from Rs 100,000 to Rs 150,000.",
    user: "Rehan Raza",
    at: "2026-07-24T10:00:00Z",
  },
  {
    id: "aud-4",
    action: "Updated Discount Tiers",
    detail: "Changed Tier A discount percentage from 12% to 15%.",
    user: "Sana Malik",
    at: "2026-07-23T11:45:00Z",
  },
  {
    id: "aud-5",
    action: "Deactivated Staff Account",
    detail: "Deactivated staff member Tariq Aziz (Delivery Worker).",
    user: "Rehan Raza",
    at: "2026-07-20T16:00:00Z",
  },
  {
    id: "aud-6",
    action: "Recorded Routine Stock Restock",
    detail: "Added 100 reams of A4 Photocopy Paper 70gsm from Paper One Distributors.",
    user: "Sana Malik",
    at: "2026-07-21T09:30:00Z",
  },
]

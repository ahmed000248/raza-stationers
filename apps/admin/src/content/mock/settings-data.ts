export interface BusinessSettings {
  businessName: string
  contactPhone: string
  requireApproval: boolean
  stockAlert: boolean
  packingView: boolean
}

export const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: "Raza Stationers",
  contactPhone: "042-35678901",
  requireApproval: true,
  stockAlert: true,
  packingView: true,
}

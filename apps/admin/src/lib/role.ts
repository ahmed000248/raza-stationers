export type AdminRole = "owner" | "admin" | "packing" | "delivery"

export interface RoleOption {
  key: AdminRole
  label: string
  roleLabel: string
}

export const ROLE_OPTIONS: RoleOption[] = [
  { key: "owner", label: "Owner", roleLabel: "Store Owner" },
  { key: "admin", label: "Admin / Computer Operator", roleLabel: "Admin / Operator" },
  { key: "packing", label: "Packing Staff", roleLabel: "Packing Team" },
  { key: "delivery", label: "Delivery Worker", roleLabel: "Delivery Fleet" },
]

export const OWNER_ONLY_ROUTES = ["/staff", "/accounting", "/audit-log", "/settings"]

export function isOwner(role: AdminRole): boolean {
  return role === "owner"
}

export function isAdminOperator(role: AdminRole): boolean {
  return role === "admin" || role === "owner"
}

export function canAccessRoute(role: AdminRole, route: string): boolean {
  if (OWNER_ONLY_ROUTES.includes(route)) {
    return isOwner(role)
  }
  return true
}

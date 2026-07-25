/**
 * @raza-stationers/ui — shared, non-domain-specific components for
 * apps/web and apps/admin. Domain components (ProductCard, AdminNav,
 * CartSummary, StaffManagementTable, etc.) stay in their own app — only
 * generic primitives and cross-cutting patterns live here.
 */

export { Button, buttonVariants } from "./button"
export { Input } from "./input"
export { Badge, badgeVariants, type BadgeProps } from "./badge"
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card"
export { Skeleton } from "./skeleton"
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs"
export {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./dialog"
export {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "./sheet"
export { Bilingual } from "./bilingual"
export { EmptyState } from "./empty-state"
export { ToastContainer, type ToastItem, type ToastVariant } from "./toast"
export { FadeIn } from "./motion/fade-in"
export { StaggerList } from "./motion/stagger-list"
export { SkeletonBlock } from "./motion/skeleton-block"
export { cn } from "./lib/utils"

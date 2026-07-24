import * as React from "react"
import { LucideIcon, Package, BookOpen, PenTool, Scissors, Layers, Bookmark, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductIconBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  category?: "paper" | "pens" | "office" | "files" | "cutting" | "art" | "general"
  size?: "sm" | "md" | "lg" | "xl"
  aspectRatio?: "square" | "video" | "auto"
}

const categoryIconMap: Record<string, LucideIcon> = {
  paper: BookOpen,
  pens: PenTool,
  office: Package,
  files: Layers,
  cutting: Scissors,
  art: Bookmark,
  general: FileText,
}

const sizeClasses = {
  sm: "p-3 [&_svg]:size-5",
  md: "p-4 [&_svg]:size-8",
  lg: "p-6 [&_svg]:size-12",
  xl: "p-8 [&_svg]:size-16",
}

const aspectClasses = {
  square: "aspect-square",
  video: "aspect-video",
  auto: "",
}

/**
 * FR-CAT-01: Solid-Evergreen Geometric Icon Block
 * Represents products without product photography using clean brand geometry.
 */
function ProductIconBlock({
  icon,
  category = "general",
  size = "md",
  aspectRatio = "square",
  className,
  ...props
}: ProductIconBlockProps) {
  const IconComponent = icon || categoryIconMap[category] || FileText

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-lg bg-[var(--color-evergreen-600)] text-white shadow-xs transition-transform duration-200 hover:scale-[1.02]",
        sizeClasses[size],
        aspectClasses[aspectRatio],
        className
      )}
      {...props}
    >
      {/* Decorative subtle background pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-4 -right-4 size-20 rounded-full bg-white/5 pointer-events-none" />
      
      <IconComponent className="relative z-10 opacity-95 transition-transform duration-200 group-hover:scale-110" />
    </div>
  )
}

export { ProductIconBlock }

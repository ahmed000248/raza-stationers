"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastVariant = "success" | "error" | "info"

export interface ToastItem {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

const variantIconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const variantStyles = {
  success: "border-[var(--color-evergreen-600)]/30 bg-[var(--color-evergreen-600)]/10 text-[var(--color-ink-900)]",
  error: "border-destructive/30 bg-destructive/10 text-destructive",
  info: "border-[var(--color-blue-500)]/30 bg-[var(--color-blue-500)]/10 text-[var(--color-ink-900)]",
}

function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none p-4"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = variantIconMap[toast.variant || "info"]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-md bg-background/95",
                variantStyles[toast.variant || "info"]
              )}
            >
              <Icon className="size-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-semibold leading-tight">{toast.title}</h5>
                {toast.description && (
                  <p className="mt-1 text-xs opacity-90">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 rounded-md opacity-60 hover:opacity-100 transition-opacity p-0.5"
                aria-label="Dismiss notification"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export { ToastContainer }

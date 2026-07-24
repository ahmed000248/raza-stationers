"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Check, Settings, PackageCheck, AlertTriangle, CreditCard, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface NotificationItem {
  id: string
  title: string
  message: string
  timestamp: string
  read: boolean
  type: "order" | "stock" | "credit" | "system"
}

const mockNotifications: NotificationItem[] = [
  {
    id: "ntf-1",
    title: "Order #RS-8842 Confirmed",
    message: "Your wholesale stationery order has been reviewed and confirmed for dispatch.",
    timestamp: "10m ago",
    read: false,
    type: "order",
  },
  {
    id: "ntf-2",
    title: "Restock Alert: A4 Photocopy Paper",
    message: "Evergreen 80gsm A4 rims are back in stock.",
    timestamp: "1h ago",
    read: false,
    type: "stock",
  },
  {
    id: "ntf-3",
    title: "Credit Balance Update",
    message: "Your monthly credit limit has been adjusted for Q3.",
    timestamp: "1d ago",
    read: true,
    type: "credit",
  },
]

const typeIconMap = {
  order: PackageCheck,
  stock: Sparkles,
  credit: CreditCard,
  system: AlertTriangle,
}

export function NotificationDropdown() {
  const [open, setOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(mockNotifications)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  // Close dropdown on outside click or Escape key
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "relative flex size-9 items-center justify-center rounded-full text-foreground/80 transition-all hover:bg-black/5 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
          open && "bg-black/10 text-foreground"
        )}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-amber-500)] opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-[var(--color-amber-500)]" />
          </span>
        )}
      </button>

      {/* Glass Panel Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="glass absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-[var(--glass-border)] p-4 shadow-xl text-[var(--color-ink-900)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <h4 className="font-heading text-sm font-semibold">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-[var(--color-evergreen-600)] px-2 py-0.5 text-[10px] font-bold text-white">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Check className="size-3" /> Mark all read
                </button>
              )}
            </div>

            {/* Feed List */}
            <div className="mt-2 max-h-72 overflow-y-auto space-y-1 pr-1">
              {notifications.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">No notifications yet</p>
              ) : (
                notifications.map((item) => {
                  const IconComponent = typeIconMap[item.type]
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleRead(item.id)}
                      className={cn(
                        "group relative flex items-start gap-3 rounded-xl p-2.5 transition-colors cursor-pointer",
                        item.read ? "opacity-75 hover:bg-black/5" : "bg-[var(--color-mist-100)]/40 hover:bg-[var(--color-mist-100)]/70 font-medium"
                      )}
                    >
                      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-evergreen-600)]/10 text-[var(--color-evergreen-600)]">
                        <IconComponent className="size-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold leading-snug truncate">{item.title}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0">{item.timestamp}</span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer — FR-NTF-06 Distinction: Feed vs Preferences */}
            <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2.5">
              <span className="text-[11px] text-muted-foreground">Notification Feed</span>
              <Link
                href="/account?tab=preferences"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-evergreen-600)] hover:underline"
              >
                <Settings className="size-3" /> Manage Preferences
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

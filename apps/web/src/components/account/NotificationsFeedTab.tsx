"use client"

import * as React from "react"
import { Notification } from "@raza-stationers/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCheck, Info, PackageCheck, Sparkles } from "lucide-react"

const mockNotifications: Notification[] = [
  {
    id: "ntf-01",
    userId: "user-101",
    type: "order_status",
    message: "Order #ORD-2026-8841 has been confirmed and is being packed.",
    isRead: false,
    createdAt: "2026-07-25T10:30:00Z",
  },
  {
    id: "ntf-02",
    userId: "user-101",
    type: "restock",
    message: "A4 Photocopy Paper Rims (80gsm) are back in stock! (500 units available)",
    isRead: false,
    createdAt: "2026-07-24T14:15:00Z",
  },
  {
    id: "ntf-03",
    userId: "user-101",
    type: "credit_status",
    message: "Monthly wholesale credit statement for July 2026 is available.",
    isRead: true,
    createdAt: "2026-07-20T09:00:00Z",
  },
  {
    id: "ntf-04",
    userId: "user-101",
    type: "announcement",
    message: "Special monsoon discounts added to accounting registers & registers collection.",
    isRead: true,
    createdAt: "2026-07-15T12:00:00Z",
  },
]

export function NotificationsFeedTab() {
  const [notifications, setNotifications] = React.useState<Notification[]>(mockNotifications)
  const [filter, setFilter] = React.useState<"all" | "unread">("all")

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    )
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const displayed = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "order_status":
        return <PackageCheck className="size-4 text-[var(--color-evergreen-600)]" />
      case "restock":
        return <Sparkles className="size-4 text-amber-600" />
      case "credit_status":
        return <Info className="size-4 text-blue-600" />
      default:
        return <Bell className="size-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-lg text-[var(--color-ink-900)]">
                Notifications Feed
              </h3>
              {unreadCount > 0 && (
                <Badge variant="evergreen" className="text-xs">
                  {unreadCount} Unread
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              FR-NTF-06 Real-time chronological activity and account alerts feed
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border text-xs">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  filter === "all"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  filter === "unread"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <Button size="sm" variant="outline" onClick={markAllRead} className="rounded-xl gap-1.5 text-xs">
                <CheckCheck className="size-3.5" />
                <span>Mark all as read</span>
              </Button>
            )}
          </div>
        </div>

        {displayed.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Bell className="size-8 text-muted-foreground/50 mx-auto" />
            <p className="text-xs text-muted-foreground">No notifications to show</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {displayed.map((n) => (
              <div
                key={n.id}
                onClick={() => toggleRead(n.id)}
                className={`py-3.5 px-3 rounded-xl transition-all cursor-pointer flex items-start gap-3.5 ${
                  !n.isRead ? "bg-[var(--color-evergreen-600)]/5 font-medium" : "hover:bg-muted/40"
                }`}
              >
                <div className="p-2 rounded-xl bg-card border border-border shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-[var(--color-ink-900)]">
                      {n.message}
                    </p>
                    {!n.isRead && (
                      <span className="size-2 rounded-full bg-[var(--color-evergreen-600)] shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

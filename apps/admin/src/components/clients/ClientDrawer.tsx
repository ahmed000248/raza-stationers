"use client"

import * as React from "react"
import { Button, Badge } from "@raza-stationers/ui"
import { DetailedClientBusiness } from "@/content/mock/client-data"
import { isOwner } from "@/lib/role"
import { useAdminShell } from "@/components/shell/AdminShell"
import { X } from "lucide-react"

interface ClientDrawerProps {
  client: DetailedClientBusiness | null
  onClose: () => void
  onUpdateClient: (updatedClient: DetailedClientBusiness) => void
}

const TIER_OPTIONS = ["Tier A", "Tier B", "Tier C", "Standard"]

export function ClientDrawer({ client, onClose, onUpdateClient }: ClientDrawerProps) {
  const { role, addToast } = useAdminShell()
  const userIsOwner = isOwner(role)

  const [selectedTier, setSelectedTier] = React.useState<string>("")

  React.useEffect(() => {
    if (client) {
      setSelectedTier(client.discountTier)
    }
  }, [client])

  if (!client) return null

  const isPending = client.accountStatus === "pending"

  const handleApprove = () => {
    const updated: DetailedClientBusiness = {
      ...client,
      accountStatus: "active",
    }
    onUpdateClient(updated)
    addToast({
      title: "Wholesale Account Approved",
      description: `${client.businessName} has been approved — written to audit log.`,
      type: "success",
    })
  }

  const handleReject = () => {
    const updated: DetailedClientBusiness = {
      ...client,
      accountStatus: "blocked",
    }
    onUpdateClient(updated)
    addToast({
      title: "Wholesale Account Rejected",
      description: `${client.businessName} application rejected — written to audit log.`,
      type: "warning",
    })
  }

  const handleApplyTier = () => {
    const pct = selectedTier === "Tier A" ? 15 : selectedTier === "Tier B" ? 10 : selectedTier === "Tier C" ? 5 : 0
    const updated: DetailedClientBusiness = {
      ...client,
      discountTier: selectedTier,
      discountPercent: pct,
    }
    onUpdateClient(updated)
    addToast({
      title: "Discount Tier Updated",
      description: `${client.businessName} updated to ${selectedTier} (${pct}%) — written to audit log.`,
      type: "success",
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#051F20]/35 z-[300] transition-opacity"
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed top-0 right-0 h-screen w-full max-w-[460px] bg-white z-[301] shadow-2xl overflow-y-auto p-7 flex flex-col font-sans border-l border-[var(--border-subtle)]">
        {/* Drawer Header */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="font-heading text-[19px] font-semibold text-[var(--ink-900)]">
              {client.businessName}
            </h2>
            <div className="text-[12.5px] text-[var(--text-muted)] mt-0.5">
              {client.city} · {client.phone} · client since {client.since}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="text-[var(--text-muted)] hover:text-[var(--ink-900)] p-1 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Badge */}
        <div className="my-3">
          {client.accountStatus === "pending" ? (
            <Badge variant="secondary" className="bg-[var(--amber-tint)] text-[var(--amber-ink)] border-transparent font-medium">
              Pending Approval
            </Badge>
          ) : client.accountStatus === "blocked" ? (
            <Badge variant="outline" className="bg-[var(--red-tint)] text-[var(--red-ink)] border-transparent font-medium">
              Blocked / Rejected
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-[var(--mist-100)] text-[var(--evergreen-600)] border-transparent font-medium">
              Active Account
            </Badge>
          )}
        </div>

        {/* SECTION 1: Account Approval (Section-Level Gate) */}
        {isPending && (
          <div className="mb-5">
            {userIsOwner ? (
              <div className="bg-[var(--mist-100)] rounded-[12px] p-4 border border-[var(--border-subtle)]">
                <div className="text-[11px] font-bold text-[var(--forest-700)] mb-1.5 flex items-center gap-1">
                  🔒 OWNER ONLY
                </div>
                <div className="text-[13px] text-[var(--ink-900)] mb-3">
                  New wholesale account awaiting approval.
                </div>
                <div className="flex gap-2.5">
                  <Button
                    onClick={handleApprove}
                    className="bg-[var(--evergreen-600)] hover:bg-[var(--forest-700)] text-white text-xs h-10 px-4"
                  >
                    Approve account
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReject}
                    className="border-[var(--red-500)] text-[var(--red-ink)] hover:bg-[var(--red-tint)] text-xs h-10 px-4"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-[var(--canvas)] border border-[var(--border-subtle)] rounded-[12px] p-4 text-[12.5px] text-[var(--text-muted)]">
                🔒 Account approval is owner only. Ask the business owner to review this pending account.
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: Discount / Pricing Tier (Open to Owner & Admin) */}
        <div className="mb-5">
          <div className="text-[12px] text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-2">
            Discount / Pricing Tier
          </div>
          <div className="flex gap-2.5 items-center">
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="flex-1 h-11 rounded-full border border-[var(--mist-100)] px-4 text-xs text-[var(--ink-900)] bg-white focus:outline-none focus:ring-1 focus:ring-[var(--sage-400)] cursor-pointer"
            >
              {TIER_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <Button
              variant="secondary"
              onClick={handleApplyTier}
              className="bg-[var(--sage-400)] text-[var(--ink-900)] hover:bg-[var(--evergreen-600)] hover:text-white text-xs h-11 px-5 rounded-full"
            >
              Apply
            </Button>
          </div>
        </div>

        {/* SECTION 3: Credit Limit & Balance (Section-Level Gate) */}
        <div className="mb-5">
          <div className="flex gap-2 items-center mb-2">
            <div className="text-[12px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
              Credit limit & balance
            </div>
            <span className="text-[9.5px] font-bold text-[var(--forest-700)] bg-[var(--mist-100)] px-2 py-0.5 rounded-full">
              🔒 OWNER ONLY
            </span>
          </div>

          {userIsOwner ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--canvas)] rounded-[12px] p-3.5 border border-[var(--border-subtle)]">
                <div className="text-[11px] text-[var(--text-muted)]">Credit limit</div>
                <div className="text-[16px] font-bold text-[var(--ink-900)] mt-1">
                  Rs {client.creditLimit.toLocaleString()}
                </div>
              </div>
              <div className="bg-[var(--canvas)] rounded-[12px] p-3.5 border border-[var(--border-subtle)]">
                <div className="text-[11px] text-[var(--text-muted)]">Outstanding</div>
                <div
                  className={`text-[16px] font-bold mt-1 ${
                    client.outstandingBalance > 60000 ? "text-[var(--red-ink)]" : "text-[var(--ink-900)]"
                  }`}
                >
                  Rs {client.outstandingBalance.toLocaleString()}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--canvas)] border border-[var(--border-subtle)] rounded-[12px] p-3.5 text-[12.5px] text-[var(--text-muted)]">
              🔒 Credit limit and balance details are restricted to Store Owner role.
            </div>
          )}
        </div>

        {/* SECTION 4: Order History */}
        <div className="mb-5">
          <div className="text-[12px] text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-2">
            Order history
          </div>
          {client.orders.length > 0 ? (
            <div className="divide-y divide-[var(--border-subtle)]">
              {client.orders.map((o) => (
                <div key={o.id} className="flex justify-between py-2 text-[13px]">
                  <span className="text-[var(--ink-900)]">
                    <span className="font-semibold">{o.id}</span> · {o.ago}
                  </span>
                  <span className="font-semibold text-[var(--ink-900)]">{o.totalFmt}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[12.5px] text-[var(--text-muted)] py-2">No orders yet.</div>
          )}
        </div>

        {/* SECTION 5: Payment History (Section-Level Gate) */}
        <div className="mb-2">
          <div className="flex gap-2 items-center mb-2">
            <div className="text-[12px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
              Payment history
            </div>
            <span className="text-[9.5px] font-bold text-[var(--forest-700)] bg-[var(--mist-100)] px-2 py-0.5 rounded-full">
              🔒 OWNER ONLY
            </span>
          </div>

          {userIsOwner ? (
            client.payments.length > 0 ? (
              <div className="divide-y divide-[var(--border-subtle)]">
                {client.payments.map((p) => (
                  <div key={p.id} className="flex justify-between py-2 text-[13px]">
                    <div>
                      <span className="font-medium text-[var(--ink-900)]">{p.method}</span>
                      <span className="text-[11px] text-[var(--text-muted)] ml-2">{p.date}</span>
                    </div>
                    <span className="font-semibold text-[var(--evergreen-600)]">{p.amountFmt}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[12.5px] text-[var(--text-muted)] py-2">No payment records yet.</div>
            )
          ) : (
            <div className="bg-[var(--canvas)] border border-[var(--border-subtle)] rounded-[12px] p-3.5 text-[12.5px] text-[var(--text-muted)]">
              🔒 Payment history is restricted to Store Owner role.
            </div>
          )}
        </div>
      </div>
    </>
  )
}

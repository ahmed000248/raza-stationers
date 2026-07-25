"use client"

import * as React from "react"
import { MOCK_CLIENTS, DetailedClientBusiness } from "@/content/mock/client-data"
import { useAdminShell } from "@/components/shell/AdminShell"
import { isOwner } from "@/lib/role"

export function CreditLimitTable() {
  const { role, addToast } = useAdminShell()
  const ownerVisible = isOwner(role)

  // Filter out pending clients
  const [clients, setClients] = React.useState<DetailedClientBusiness[]>(() =>
    MOCK_CLIENTS.filter((c) => c.accountStatus !== "pending")
  )

  const [limitsInput, setLimitsInput] = React.useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    MOCK_CLIENTS.forEach((c) => {
      initial[c.id] = c.creditLimit
    })
    return initial
  })

  const handleInputChange = (id: string, value: string) => {
    const val = Number(value) || 0
    setLimitsInput((prev) => ({ ...prev, [id]: val }))
  }

  const handleApplyUpdate = (id: string) => {
    const newLimit = limitsInput[id]
    if (newLimit === undefined || newLimit < 0) return

    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, creditLimit: newLimit } : c))
    )

    addToast({
      title: "Credit limit updated",
      description: `Updated credit limit to Rs ${newLimit.toLocaleString()}`,
      type: "success",
    })
  }

  return (
    <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xs">
      {/* Table Header / Title Bar */}
      <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center gap-2">
        <h2 className="text-sm font-semibold text-[var(--ink-900)]">
          Credit limits by client
        </h2>
        {ownerVisible && (
          <span className="text-[9.5px] font-bold text-[var(--evergreen-600)] bg-[var(--mist-100)] px-2 py-0.5 rounded-full tracking-wide">
            🔒 OWNER ONLY
          </span>
        )}
      </div>

      {/* Non-owner banner notice */}
      {!ownerVisible && (
        <div className="px-5 py-2.5 text-xs text-[var(--text-muted)] bg-[var(--canvas)] border-b border-[var(--border-subtle)] font-sans">
          Only the business owner can change credit limits.
        </div>
      )}

      {/* Table Content */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="bg-[var(--canvas)] text-[var(--sage-400)] text-[11px] uppercase tracking-wider font-semibold border-b border-[var(--border-subtle)]">
              <th className="px-5 py-2.5">Client</th>
              <th className="px-3 py-2.5">Credit limit</th>
              <th className="px-3 py-2.5">Outstanding</th>
              <th className="px-5 py-2.5">Adjust</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {clients.map((client) => {
              const isOverThreshold =
                client.outstandingBalance > client.creditLimit * 0.7
              const currentInputVal = limitsInput[client.id] ?? client.creditLimit

              return (
                <tr
                  key={client.id}
                  className="hover:bg-black/[0.01] transition-colors animate-fade-in"
                >
                  <td className="px-5 py-3.5 font-semibold text-[var(--ink-900)]">
                    {client.businessName}
                  </td>
                  <td className="px-3 py-3.5 text-[var(--ink-900)]">
                    Rs {client.creditLimit.toLocaleString()}
                  </td>
                  <td
                    className={`px-3 py-3.5 font-semibold ${
                      isOverThreshold
                        ? "text-[#d93838]"
                        : "text-[var(--ink-900)]"
                    }`}
                  >
                    Rs {client.outstandingBalance.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    {ownerVisible ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step={5000}
                          value={currentInputVal}
                          onChange={(e) =>
                            handleInputChange(client.id, e.target.value)
                          }
                          className="w-28 h-8.5 rounded-lg border border-gray-200 px-2 text-xs font-sans focus:outline-none focus:border-[var(--evergreen-600)] text-[var(--ink-900)]"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyUpdate(client.id)}
                          className="text-xs font-semibold text-[var(--evergreen-600)] hover:underline cursor-pointer"
                        >
                          Update
                        </button>
                      </div>
                    ) : (
                      <span className="text-[var(--text-muted)] text-xs">
                        Rs {client.creditLimit.toLocaleString()}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

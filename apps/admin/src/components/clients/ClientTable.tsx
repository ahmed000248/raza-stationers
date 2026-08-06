"use client"

import * as React from "react"
import { Badge } from "@raza-stationers/ui"
import { DetailedClientBusiness } from "@/content/mock/client-data"

interface ClientTableProps {
  clients: DetailedClientBusiness[]
  onSelectClient: (client: DetailedClientBusiness) => void
}

export function ClientTable({ clients, onSelectClient }: ClientTableProps) {
  if (clients.length === 0) {
    return (
      <div className="bg-white border border-[var(--border-subtle)] rounded-[16px] p-8 text-center text-sm text-[var(--text-muted)]">
        No wholesale client businesses match your criteria.
      </div>
    )
  }

  return (
    <div className="bg-white border border-[var(--border-subtle)] rounded-[16px] overflow-hidden shadow-xs">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--canvas)] text-[var(--sage-400)] text-[11px] uppercase tracking-wider font-semibold border-b border-[var(--border-subtle)]">
              <th className="py-3 px-5">Business</th>
              <th className="py-3 px-3">City</th>
              <th className="py-3 px-3">Tier</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-5">Outstanding</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)] font-sans">
            {clients.map((client) => {
              const balance = Number(client.outstandingBalance || 0)
              const isPending = client.accountStatus === "pending"
              const isOverdue = balance > 60000

              return (
                <tr
                  key={client.id}
                  className="hover:bg-[var(--canvas)] transition-colors animate-fadeIn"
                >
                  <td className="py-3.5 px-5 font-semibold text-[var(--ink-900)]">
                    <div>{client.businessName}</div>
                    <div className="text-[11px] font-normal text-[var(--text-muted)]">
                      {client.contactPerson}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-[var(--ink-900)]">{client.city}</td>
                  <td className="py-3.5 px-3 font-medium text-[var(--ink-900)]">
                    {client.discountTier || "Standard"}
                  </td>
                  <td className="py-3.5 px-3">
                    {isPending ? (
                      <Badge variant="secondary" className="bg-[var(--amber-tint)] text-[var(--amber-ink)] border-transparent font-medium text-[11px]">
                        Pending Approval
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-[var(--mist-100)] text-[var(--evergreen-600)] border-transparent font-medium text-[11px]">
                        Active Account
                      </Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-5 font-semibold">
                    <span className={isOverdue ? "text-[var(--red-ink)] font-bold" : "text-[var(--ink-900)]"}>
                      Rs {balance.toLocaleString()}
                    </span>
                    {isOverdue && (
                      <span className="ml-1.5 text-[10px] bg-[var(--red-tint)] text-[var(--red-ink)] px-1.5 py-0.5 rounded-full font-bold">
                        Overdue
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectClient(client)}
                      className="font-semibold text-[var(--evergreen-600)] hover:underline cursor-pointer text-xs"
                    >
                      View
                    </button>
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

"use client"

import * as React from "react"
import { DeliveryItem, DELIVERY_DRIVERS } from "@/content/mock/delivery-data"

interface ReadyDispatchTableProps {
  orders: DeliveryItem[]
  onDispatch: (orderId: string, driver: string) => void
}

export function ReadyDispatchTable({
  orders,
  onDispatch,
}: ReadyDispatchTableProps) {
  const [selectedDrivers, setSelectedDrivers] = React.useState<
    Record<string, string>
  >({})

  const handleDriverChange = (orderId: string, driver: string) => {
    setSelectedDrivers((prev) => ({ ...prev, [orderId]: driver }))
  }

  if (orders.length === 0) {
    return (
      <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xs mb-6 p-6 text-center text-xs text-[var(--text-muted)] font-sans">
        No packed orders waiting for dispatch at this time.
      </div>
    )
  }

  return (
    <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xs mb-6">
      <div className="px-5 py-4 text-sm font-semibold text-[var(--ink-900)] border-b border-[var(--border-subtle)]">
        Ready for dispatch — packed orders
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="bg-[var(--canvas)] text-[var(--sage-400)] text-[11px] uppercase tracking-wider font-semibold border-b border-[var(--border-subtle)]">
              <th className="px-5 py-2.5">Order #</th>
              <th className="px-3 py-2.5">Client</th>
              <th className="px-3 py-2.5">City</th>
              <th className="px-3 py-2.5">Assign driver</th>
              <th className="px-5 py-2.5 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {orders.map((order) => {
              const currentDriver =
                selectedDrivers[order.id] || order.driver || DELIVERY_DRIVERS[0]

              return (
                <tr
                  key={order.id}
                  className="hover:bg-black/[0.01] transition-colors animate-fade-in"
                >
                  <td className="px-5 py-3.5 font-semibold text-[var(--ink-900)]">
                    {order.id}
                  </td>
                  <td className="px-3 py-3.5 font-semibold text-[var(--ink-900)]">
                    {order.client}
                  </td>
                  <td className="px-3 py-3.5 text-[var(--text-muted)]">
                    {order.city}
                  </td>
                  <td className="px-3 py-3.5">
                    <select
                      value={currentDriver}
                      onChange={(e) =>
                        handleDriverChange(order.id, e.target.value)
                      }
                      className="h-9 rounded-full border border-gray-200 px-3 text-xs focus:outline-none focus:border-[var(--evergreen-600)] text-[var(--ink-900)] bg-white"
                    >
                      {DELIVERY_DRIVERS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onDispatch(order.id, currentDriver)}
                      className="text-xs font-semibold text-[var(--evergreen-600)] hover:underline cursor-pointer"
                    >
                      Dispatch
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

"use client"

import * as React from "react"
import { Store, Truck, X } from "lucide-react"
import { Badge, Button } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"

export default function OrderQueuePage() {
  const { role } = useAdminShell()
  const [orders] = React.useState<any[]>([])
  const [selected, setSelected] = React.useState<any>(null)
  const [status, setStatus] = React.useState("")

  if (role === "delivery") return <div className="p-8 text-center text-sm text-muted-foreground">Delivery work is available from Delivery Management.</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-heading text-2xl font-bold">Order Queue</h1>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Order queue preview (Backend Rebuild in Progress)</p>
        </div>
        <label className="text-xs font-semibold">Status
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="ml-2 h-10 rounded-xl border border-gray-200 bg-white px-3">
            <option value="">All</option>
            <option value="pending_review">Pending review</option>
            <option value="confirmed">Confirmed</option>
            <option value="packed">Packed</option>
            <option value="delivered">Delivered</option>
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-white">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="bg-[var(--canvas)] text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Fulfilment</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3 font-semibold">{order.orderNumber}</td>
                <td className="px-4 py-3">{order.clientBusiness?.businessName}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 capitalize">
                    {order.fulfilmentMethod === "pickup" ? <Store className="size-4" /> : <Truck className="size-4" />}
                    {order.fulfilmentMethod || "delivery"}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold">Rs {Number(order.grandTotal).toLocaleString("en-PK")}</td>
                <td className="px-4 py-3"><Badge>{String(order.status).replaceAll("_", " ")}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => setSelected(order)} className="font-semibold text-[var(--evergreen-600)] hover:underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <>
          <button type="button" aria-label="Close order details" onClick={() => setSelected(null)} className="fixed inset-0 z-40 bg-black/40" />
          <aside role="dialog" aria-modal="true" aria-labelledby="order-title" className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
            <button type="button" onClick={() => setSelected(null)} className="absolute right-4 top-4 rounded-lg p-2 hover:bg-gray-100" aria-label="Close"><X className="size-5" /></button>
            <h2 id="order-title" className="pr-10 font-heading text-xl font-bold">{selected.orderNumber}</h2>
            <Button type="button" className="mt-6 w-full" onClick={() => alert("Backend rebuild in progress.")}>
              Order Actions (Disabled)
            </Button>
          </aside>
        </>
      )}
    </div>
  )
}

"use client"

import * as React from "react"
import { Loader2, MapPin, Store, Truck, X } from "lucide-react"
import { Badge, Button } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"
import { useAdminAuth } from "@/hooks/use-admin-auth"

export default function OrderQueuePage() {
  const { role, addToast } = useAdminShell()
  const { api } = useAdminAuth()
  const [orders, setOrders] = React.useState<any[]>([])
  const [selected, setSelected] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [updating, setUpdating] = React.useState(false)
  const [status, setStatus] = React.useState("")

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const data: any = await api.getOrders(status ? { status } : undefined)
      setOrders(data.items || [])
    } catch (cause) {
      addToast({ title: "Orders could not be loaded", description: cause instanceof Error ? cause.message : undefined, type: "error" })
    } finally {
      setLoading(false)
    }
  }, [api, status, addToast])

  React.useEffect(() => { load() }, [load])

  const openOrder = async (id: string) => {
    try { setSelected(await api.getOrder(id)) }
    catch (cause) { addToast({ title: "Order details could not be loaded", description: cause instanceof Error ? cause.message : undefined, type: "error" }) }
  }

  const advanceOrder = async () => {
    if (!selected || !["pending_review", "confirmed"].includes(selected.status)) return
    setUpdating(true)
    try {
      const wasPending = selected.status === "pending_review"
      await api.updateOrderStatus(selected.id, wasPending ? "confirmed" : "packed")
      setSelected(null)
      await load()
      addToast({ title: wasPending ? "Order confirmed and stock reserved" : "Order packed and stock moved", type: "success" })
    } catch (cause) {
      addToast({ title: "Order status could not be updated", description: cause instanceof Error ? cause.message : undefined, type: "error" })
    } finally {
      setUpdating(false)
    }
  }

  if (role === "delivery") return <div className="p-8 text-center text-sm text-muted-foreground">Delivery work is available from Delivery Management.</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h1 className="font-heading text-2xl font-bold">Order Queue</h1><p className="mt-1 text-xs text-[var(--text-muted)]">Delivery and pickup are shown from the checkout snapshot. Confirmation reserves stock; packing moves it out of sellable stock.</p></div><label className="text-xs font-semibold">Status<select value={status} onChange={(event) => setStatus(event.target.value)} className="ml-2 h-10 rounded-xl border border-gray-200 bg-white px-3"><option value="">All</option><option value="pending_review">Pending review</option><option value="confirmed">Confirmed</option><option value="packed">Packed</option><option value="delivered">Delivered</option></select></label></div>
      {loading ? <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin" /></div> : <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-white"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-[var(--canvas)] text-[var(--text-muted)]"><tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Business</th><th className="px-4 py-3">Fulfilment</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-[var(--border-subtle)]">{orders.map((order) => <tr key={order.id}><td className="px-4 py-3 font-semibold">{order.orderNumber}</td><td className="px-4 py-3">{order.clientBusiness?.businessName}</td><td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 capitalize">{order.fulfilmentMethod === "pickup" ? <Store className="size-4" /> : <Truck className="size-4" />}{order.fulfilmentMethod || "delivery"}</span></td><td className="px-4 py-3 font-semibold">Rs {Number(order.grandTotal).toLocaleString("en-PK")}</td><td className="px-4 py-3"><Badge>{String(order.status).replaceAll("_", " ")}</Badge></td><td className="px-4 py-3 text-right"><button type="button" onClick={() => openOrder(order.id)} className="font-semibold text-[var(--evergreen-600)] hover:underline">View</button></td></tr>)}</tbody></table></div>}

      {selected && <><button type="button" aria-label="Close order details" onClick={() => setSelected(null)} className="fixed inset-0 z-40 bg-black/40" /><aside role="dialog" aria-modal="true" aria-labelledby="order-title" className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl"><button type="button" onClick={() => setSelected(null)} className="absolute right-4 top-4 rounded-lg p-2 hover:bg-gray-100" aria-label="Close"><X className="size-5" /></button><h2 id="order-title" className="pr-10 font-heading text-xl font-bold">{selected.orderNumber}</h2><p className="mt-1 text-xs text-[var(--text-muted)]">{selected.clientBusiness?.businessName}</p><div className="mt-5 rounded-2xl bg-[var(--canvas)] p-4"><p className="flex items-center gap-2 text-sm font-bold capitalize">{selected.fulfilmentMethod === "pickup" ? <Store className="size-4" /> : <Truck className="size-4" />}{selected.fulfilmentMethod || "delivery"}</p>{selected.fulfilmentMethod === "pickup" ? <div className="mt-2 text-xs text-[var(--text-muted)]"><p className="flex gap-1.5 font-semibold text-[var(--ink-900)]"><MapPin className="size-4 shrink-0" />{selected.pickupLocationSnapshot}</p><p className="mt-2">{selected.pickupInstructionsSnapshot}</p></div> : <div className="mt-2 text-xs text-[var(--text-muted)]"><p>{selected.recipientNameSnapshot} / {selected.mobileSnapshot}</p><p className="mt-1">{selected.addressSnapshot}, {selected.citySnapshot}</p><p className="mt-1">Delivery charge: Rs {Number(selected.deliveryCharge).toLocaleString("en-PK")}</p></div>}</div><div className="mt-5 space-y-2">{selected.items?.map((item: any) => <div key={item.id} className="flex justify-between gap-3 border-b border-gray-100 py-2 text-xs"><span>{item.productNameSnapshot} x {Number(item.quantity)} {item.packagingLabelSnapshot}</span><span className="shrink-0 font-semibold">Rs {Number(item.lineTotalSnapshot).toLocaleString("en-PK")}</span></div>)}</div><div className="mt-5 flex justify-between font-bold"><span>Total</span><span>Rs {Number(selected.grandTotal).toLocaleString("en-PK")}</span></div>{["owner", "admin"].includes(role) && ["pending_review", "confirmed"].includes(selected.status) && <Button type="button" className="mt-6 w-full" disabled={updating} onClick={advanceOrder}>{updating && <Loader2 className="size-4 animate-spin" />}{selected.status === "pending_review" ? "Confirm order and reserve stock" : "Mark packed and move stock"}</Button>}</aside></>}
    </div>
  )
}

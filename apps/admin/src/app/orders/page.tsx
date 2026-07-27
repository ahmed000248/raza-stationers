"use client"

import * as React from "react"
import { useAdminShell } from "@/components/shell/AdminShell"
import { OrderFilterBar, OrderFilterType } from "@/components/orders/OrderFilterBar"
import { OrderTable } from "@/components/orders/OrderTable"
import { OrderDetailDrawer } from "@/components/orders/OrderDetailDrawer"
import { createAPIClient } from "@raza-stationers/api"
import { Loader2 } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export default function OrderQueuePage() {
  const { role } = useAdminShell()
  const [orders, setOrders] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [activeFilter, setActiveFilter] = React.useState<OrderFilterType>("all")
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null)

  const fetchOrders = React.useCallback(async () => {
    setLoading(true)
    try {
      const api = createAPIClient({ baseUrl: API_BASE })
      const params: any = {}
      if (activeFilter !== "all") params.status = activeFilter as string
      const data = await api.getOrders(params)
      setOrders(data.items || [])
    } catch { setOrders([]) } finally { setLoading(false) }
  }, [activeFilter])

  React.useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const api = createAPIClient({ baseUrl: API_BASE })
      await api.updateOrderStatus(orderId, newStatus)
      fetchOrders()
    } catch {}
  }

  if (role === "delivery") {
    return <div className="p-8 text-center text-sm text-muted-foreground">Delivery view available from the Delivery Management page.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="font-heading text-2xl font-bold">Order Queue</h1></div>
      <OrderFilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <OrderTable orders={orders} sortDir={0} onToggleSortTotal={() => {}} onSelectOrder={setSelectedOrder} />
      )}
      {selectedOrder && <OrderDetailDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdateOrder={handleStatusChange} />}
    </div>
  )
}

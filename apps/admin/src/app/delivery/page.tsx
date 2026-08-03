"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"
import { ReadyDispatchTable } from "@/components/delivery/ReadyDispatchTable"
import { ActiveDeliveriesList } from "@/components/delivery/ActiveDeliveriesList"
import { DeliveryOutcomeModal } from "@/components/delivery/DeliveryOutcomeModal"
import { createAPIClient } from "@raza-stationers/api"
import { Loader2 } from "lucide-react"
import { getApiBaseUrl } from "@/lib/public-config"

const API_BASE = getApiBaseUrl()

export default function DeliveryManagementPage() {
  const { role, addToast } = useAdminShell()
  const [deliveries, setDeliveries] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedOutcomeOrder, setSelectedOutcomeOrder] = React.useState<any>(null)

  React.useEffect(() => {
    if (role === "packing") return
    const api = createAPIClient({ baseUrl: API_BASE })
    api.getAllDeliveries().then((data: any) => setDeliveries(data.items || [])).catch(() => {}).finally(() => setLoading(false))
  }, [role])

  if (role === "packing") {
    return <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center max-w-md mx-auto my-16 shadow-xs"><h2 className="text-base font-semibold mb-2">This section isn&apos;t part of your role</h2><Link href="/dashboard"><Button variant="default" className="h-10 text-xs px-5">Back to dashboard</Button></Link></div>
  }
  if (role === "delivery") {
    const myDeliveries = deliveries.filter((d) => d.status === "dispatched" || d.status === "out_for_delivery")
    return <div className="space-y-6"><h1 className="font-heading text-2xl font-bold">My Delivery Assignments</h1>{loading ? <Loader2 className="size-6 animate-spin" /> : <ActiveDeliveriesList orders={myDeliveries} title="Active" onOpenOutcomeModal={(order, outcome) => setSelectedOutcomeOrder(order)} />}{selectedOutcomeOrder && <DeliveryOutcomeModal open={true} order={selectedOutcomeOrder} outcome={null} onClose={() => setSelectedOutcomeOrder(null)} onSaveOutcome={() => window.location.reload()} />}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="font-heading text-2xl font-bold">Delivery Management</h1></div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div> : (
        <>
          <ReadyDispatchTable orders={deliveries.filter((d) => d.status === "pending")} onDispatch={(id, driver) => { const api = createAPIClient({ baseUrl: API_BASE }); api.post(`/deliveries`, { orderId: id }).then(() => window.location.reload()) }} />
          <ActiveDeliveriesList orders={deliveries.filter((d) => d.status !== "pending" && d.status !== "delivered" && d.status !== "cancelled")} title="In Progress" onOpenOutcomeModal={(order, outcome) => setSelectedOutcomeOrder(order)} />
        </>
      )}
      {selectedOutcomeOrder && <DeliveryOutcomeModal open={true} order={selectedOutcomeOrder} outcome={null} onClose={() => setSelectedOutcomeOrder(null)} onSaveOutcome={() => window.location.reload()} />}
    </div>
  )
}

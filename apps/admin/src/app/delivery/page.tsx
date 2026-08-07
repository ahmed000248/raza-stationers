"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@raza-stationers/ui"
import { useAdminShell } from "@/components/shell/AdminShell"
import { ReadyDispatchTable } from "@/components/delivery/ReadyDispatchTable"
import { ActiveDeliveriesList } from "@/components/delivery/ActiveDeliveriesList"
import { DeliveryOutcomeModal } from "@/components/delivery/DeliveryOutcomeModal"

export default function DeliveryManagementPage() {
  const { role } = useAdminShell()
  const [deliveries] = React.useState<any[]>([])
  const [selectedOutcomeOrder, setSelectedOutcomeOrder] = React.useState<any>(null)

  if (role === "packing") {
    return <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center max-w-md mx-auto my-16 shadow-xs"><h2 className="text-base font-semibold mb-2">This section isn&apos;t part of your role</h2><Link href="/dashboard"><Button variant="default" className="h-10 text-xs px-5">Back to dashboard</Button></Link></div>
  }
  if (role === "delivery") {
    const myDeliveries = deliveries.filter((d) => d.status === "dispatched" || d.status === "out_for_delivery")
    return <div className="space-y-6"><h1 className="font-heading text-2xl font-bold">My Delivery Assignments</h1><ActiveDeliveriesList orders={myDeliveries} title="Active" onOpenOutcomeModal={(order) => setSelectedOutcomeOrder(order)} />{selectedOutcomeOrder && <DeliveryOutcomeModal open={true} order={selectedOutcomeOrder} outcome={null} onClose={() => setSelectedOutcomeOrder(null)} onSaveOutcome={() => {}} />}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Delivery Management</h1>
        <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 font-medium">Backend rebuild in progress</span>
      </div>
      <ReadyDispatchTable orders={deliveries.filter((d) => d.status === "pending")} onDispatch={() => alert("Backend rebuild in progress. Dispatch is disabled.")} />
      <ActiveDeliveriesList orders={deliveries.filter((d) => d.status !== "pending" && d.status !== "delivered" && d.status !== "cancelled")} title="In Progress" onOpenOutcomeModal={(order) => setSelectedOutcomeOrder(order)} />
      {selectedOutcomeOrder && <DeliveryOutcomeModal open={true} order={selectedOutcomeOrder} outcome={null} onClose={() => setSelectedOutcomeOrder(null)} onSaveOutcome={() => {}} />}
    </div>
  )
}

"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

interface Props { params: Promise<{ id: string }> }

export default function OrderTrackingPage({ params }: Props) {
  const { id } = React.use(params)

  return (
    <div className="py-10 px-6 min-h-screen">
      <div className="mx-auto max-w-none w-full space-y-8">
        <div>
          <Link href="/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft className="size-4" /><span>Back to Order History</span>
          </Link>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">Order #{id}</h1>
        </div>

        <div className="p-8 rounded-3xl border border-border bg-card text-center space-y-4">
          <Badge variant="amber" className="text-xs">Backend Rebuild in Progress</Badge>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            The legacy backend has been removed. Order tracking and invoices will be active once Backend V2 is deployed.
          </p>
        </div>
      </div>
    </div>
  )
}

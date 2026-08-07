"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Home } from "lucide-react"

interface Props { params: Promise<{ id: string }> }

export default function OrderConfirmationPage({ params }: Props) {
  const { id } = React.use(params)

  return (
    <div className="py-12 px-6 min-h-screen">
      <div className="mx-auto max-w-4xl space-y-10">
        <div className="p-8 rounded-3xl border border-[var(--color-evergreen-600)]/30 bg-[var(--color-evergreen-600)]/10 text-center space-y-4 shadow-sm">
          <div className="inline-flex size-16 items-center justify-center rounded-full bg-[var(--color-evergreen-600)] text-white shadow-md mx-auto">
            <CheckCircle2 className="size-8" />
          </div>
          <div className="space-y-1">
            <Badge variant="amber" className="text-xs">Backend Rebuild in Progress</Badge>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">Order #{id}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">Your order reference has been logged locally.</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link href="/"><Button className="rounded-full gap-2"><Home className="size-4" /><span>Back to Home</span></Button></Link>
        </div>
      </div>
    </div>
  )
}

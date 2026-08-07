"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

interface Props { params: Promise<{ id: string }> }

export default function ProductDetailPage({ params }: Props) {
  const { id } = React.use(params)

  return (
    <div className="min-h-screen px-3 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        <Link href="/catalogue" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" /><span>Back to Product Catalogue</span>
        </Link>

        <div className="p-8 rounded-3xl border border-border bg-card text-center space-y-4">
          <Badge variant="amber" className="text-xs">Backend Rebuild in Progress</Badge>
          <h1 className="font-heading text-2xl font-bold">Product #{id}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            The legacy backend has been removed. Detailed product information and dynamic pricing will be re-connected when Backend V2 is built.
          </p>
        </div>
      </div>
    </div>
  )
}

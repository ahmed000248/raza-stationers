"use client"

import * as React from "react"
import { ClientFilterBar, ClientFilterType } from "@/components/clients/ClientFilterBar"
import { ClientTable } from "@/components/clients/ClientTable"
import { ClientDrawer } from "@/components/clients/ClientDrawer"

export default function ClientBusinessesPage() {
  const [clients] = React.useState<any[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeFilter, setActiveFilter] = React.useState<ClientFilterType>("all")
  const [selectedClient, setSelectedClient] = React.useState<any>(null)

  const filteredClients = clients.filter((c) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return c.businessName?.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q) || c.contactPerson?.toLowerCase().includes(q) || c.mobileNumber?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Client Businesses</h1>
        <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 font-medium">Backend rebuild in progress</span>
      </div>
      <ClientFilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <ClientTable clients={filteredClients} onSelectClient={setSelectedClient} />
      {selectedClient && <ClientDrawer client={selectedClient} onClose={() => setSelectedClient(null)} onUpdateClient={() => {}} />}
    </div>
  )
}

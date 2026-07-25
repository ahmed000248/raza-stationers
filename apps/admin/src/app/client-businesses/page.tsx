"use client"

import * as React from "react"
import { MOCK_CLIENTS, DetailedClientBusiness } from "@/content/mock/client-data"
import { ClientFilterBar, ClientFilterType } from "@/components/clients/ClientFilterBar"
import { ClientTable } from "@/components/clients/ClientTable"
import { ClientDrawer } from "@/components/clients/ClientDrawer"

export default function ClientBusinessesPage() {
  const [clients, setClients] = React.useState<DetailedClientBusiness[]>(MOCK_CLIENTS)
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [activeFilter, setActiveFilter] = React.useState<ClientFilterType>("all")
  const [selectedClient, setSelectedClient] = React.useState<DetailedClientBusiness | null>(null)

  const handleUpdateClient = (updatedClient: DetailedClientBusiness) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    )
    setSelectedClient(updatedClient)
  }

  const filteredClients = React.useMemo(() => {
    return clients.filter((c) => {
      // Search check
      const query = searchQuery.toLowerCase().trim()
      if (
        query &&
        !c.businessName.toLowerCase().includes(query) &&
        !c.city.toLowerCase().includes(query) &&
        !c.contactPerson.toLowerCase().includes(query)
      ) {
        return false
      }

      // Filter check
      if (activeFilter === "active" && c.accountStatus !== "active") return false
      if (activeFilter === "pending" && c.accountStatus !== "pending") return false
      if (activeFilter === "tier-a" && c.discountTier !== "Tier A") return false
      if (activeFilter === "overdue" && c.outstandingBalance <= 60000) return false

      return true
    })
  }, [clients, searchQuery, activeFilter])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--ink-900)]">
          Client Businesses
        </h1>
        <div className="text-xs text-[var(--text-muted)] mt-1 font-sans">
          کلائنٹ کاروبار · registered wholesale accounts
        </div>
      </div>

      {/* Filter Bar */}
      <ClientFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Client Table */}
      <ClientTable
        clients={filteredClients}
        onSelectClient={(client) => setSelectedClient(client)}
      />

      {/* Client Drawer */}
      <ClientDrawer
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
        onUpdateClient={handleUpdateClient}
      />
    </div>
  )
}

"use client"

import * as React from "react"
import { ClientFilterBar, ClientFilterType } from "@/components/clients/ClientFilterBar"
import { ClientTable } from "@/components/clients/ClientTable"
import { ClientDrawer } from "@/components/clients/ClientDrawer"
import { createAPIClient } from "@raza-stationers/api"
import { Loader2 } from "lucide-react"
import { getApiBaseUrl } from "@/lib/public-config"

const API_BASE = getApiBaseUrl()

export default function ClientBusinessesPage() {
  const [clients, setClients] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeFilter, setActiveFilter] = React.useState<ClientFilterType>("all")
  const [selectedClient, setSelectedClient] = React.useState<any>(null)

  const fetchClients = React.useCallback(async () => {
    setLoading(true)
    try {
      const api = createAPIClient({ baseUrl: API_BASE })
      const params: any = {}
      if (activeFilter !== "all") params.status = activeFilter
      const data = await api.listClients(params)
      setClients(data.items || [])
    } catch { setClients([]) } finally { setLoading(false) }
  }, [activeFilter])

  React.useEffect(() => { fetchClients() }, [fetchClients])

  const filteredClients = clients.filter((c) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return c.businessName?.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q) || c.contactPerson?.toLowerCase().includes(q) || c.mobileNumber?.toLowerCase().includes(q)
  })

  const handleApprove = async (id: string) => {
    try {
      const api = createAPIClient({ baseUrl: API_BASE })
      await api.approveClient(id)
      fetchClients()
    } catch {}
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Client Businesses</h1>
      <ClientFilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <ClientTable clients={filteredClients} onSelectClient={setSelectedClient} />
      )}
      {selectedClient && <ClientDrawer client={selectedClient} onClose={() => setSelectedClient(null)} onUpdateClient={(c) => { setSelectedClient(c); fetchClients() }} />}
    </div>
  )
}

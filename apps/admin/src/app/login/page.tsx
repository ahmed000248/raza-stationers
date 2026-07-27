"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { LogIn } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const { login } = useAdminAuth()
  const [mobileNumber, setMobileNumber] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mobileNumber || !password) {
      setError("Please enter mobile number and password")
      return
    }
    setLoading(true)
    setError("")
    try {
      await login(mobileNumber, password)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--canvas)]">
      <div className="w-full max-w-sm p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="font-heading text-2xl font-bold text-[var(--ink-900)]">Admin Sign In</h1>
          <p className="text-sm text-muted-foreground">Raza Stationers Operations Portal</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Mobile Number</label>
            <input value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          {error && <p className="text-xs text-destructive font-medium">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full h-10 rounded-xl bg-[#051F20] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#0a3a3a] transition-colors">
            <LogIn size={16} />
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  )
}

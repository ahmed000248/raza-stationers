"use client"

import * as React from "react"

interface BusinessProfileCardProps {
  name: string
  phone: string
  onNameChange: (name: string) => void
  onPhoneChange: (phone: string) => void
}

export function BusinessProfileCard({
  name,
  phone,
  onNameChange,
  onPhoneChange,
}: BusinessProfileCardProps) {
  return (
    <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-6 mb-4 shadow-xs font-sans">
      <div className="text-sm font-semibold text-[var(--ink-900)] mb-4">
        Business profile
      </div>

      <div className="space-y-3.5">
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1 font-medium">
            Business name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full h-11 rounded-xl border border-gray-200 px-3.5 text-xs focus:outline-none focus:border-[var(--evergreen-600)] text-[var(--ink-900)] font-sans"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1 font-medium">
            Contact phone
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="w-full h-11 rounded-xl border border-gray-200 px-3.5 text-xs focus:outline-none focus:border-[var(--evergreen-600)] text-[var(--ink-900)] font-sans"
          />
        </div>
      </div>
    </div>
  )
}

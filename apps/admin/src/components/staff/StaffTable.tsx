"use client"

import * as React from "react"
import { StaffMember } from "@/content/mock/staff-data"

interface StaffTableProps {
  staff: StaffMember[]
  onToggleActive: (id: string) => void
}

export function StaffTable({ staff, onToggleActive }: StaffTableProps) {
  if (staff.length === 0) {
    return (
      <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-8 text-center text-xs text-[var(--text-muted)] font-sans mt-5">
        No staff accounts registered.
      </div>
    )
  }

  return (
    <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xs mt-5">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="bg-[var(--canvas)] text-[var(--sage-400)] text-[11px] uppercase tracking-wider font-semibold border-b border-[var(--border-subtle)]">
              <th className="px-5 py-3">Name</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">Phone</th>
              <th className="px-3 py-3">Last login</th>
              <th className="px-5 py-3">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {staff.map((member) => {
              const dateObj = new Date(member.lastLogin)
              const dateStr = dateObj.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })

              return (
                <tr
                  key={member.id}
                  className="hover:bg-black/[0.01] transition-colors animate-fade-in"
                >
                  <td className="px-5 py-3.5 font-semibold text-[var(--ink-900)]">
                    {member.name}
                  </td>
                  <td className="px-3 py-3.5 text-[var(--ink-900)] font-medium">
                    {member.role}
                  </td>
                  <td className="px-3 py-3.5 text-[var(--text-muted)] font-mono text-[11.5px]">
                    {member.phone}
                  </td>
                  <td className="px-3 py-3.5 text-[var(--text-muted)] text-[12px]">
                    {dateStr}
                  </td>
                  <td className="px-5 py-3.5">
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => onToggleActive(member.id)}
                      className={`w-[38px] h-[22px] rounded-full relative cursor-pointer transition-colors duration-150 block shrink-0 ${
                        member.active
                          ? "bg-[var(--evergreen-600)]"
                          : "bg-gray-200"
                      }`}
                      aria-label={`Toggle active state for ${member.name}`}
                    >
                      <span
                        className={`w-[18px] h-[18px] rounded-full bg-white absolute top-0.5 transition-all duration-150 block shadow-xs ${
                          member.active ? "left-[18px]" : "left-[2px]"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

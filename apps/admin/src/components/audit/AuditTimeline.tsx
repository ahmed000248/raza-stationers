"use client"

import * as React from "react"
import { AuditLogEntry } from "@/content/mock/audit-data"

interface AuditTimelineProps {
  entries: AuditLogEntry[]
}

export function AuditTimeline({ entries }: AuditTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-2xl p-8 text-center text-xs text-[var(--text-muted)] font-sans mt-5">
        No audit log records found.
      </div>
    )
  }

  return (
    <div className="relative pl-2 font-sans my-5">
      {/* Connecting Vertical Line */}
      <div className="absolute left-[17px] top-2 bottom-2 w-px bg-[var(--border-subtle)]" />

      <div className="space-y-4">
        {entries.map((entry) => {
          const dateObj = new Date(entry.at)
          const dateStr = dateObj.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })

          return (
            <div key={entry.id} className="flex gap-4 items-start relative z-10 animate-fade-in">
              {/* Circle Node */}
              <div className="w-4.5 h-4.5 rounded-full bg-white border-2 border-[var(--evergreen-600)] shrink-0 z-10 mt-1 shadow-2xs" />

              {/* Log Card */}
              <div className="bg-[var(--white)] border border-[var(--border-subtle)] rounded-xl p-4 flex-1 shadow-xs">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="font-semibold text-[13.5px] text-[var(--ink-900)]">
                    {entry.action}
                  </span>
                  <span className="text-[11.5px] text-[var(--text-muted)] font-sans shrink-0">
                    {dateStr}
                  </span>
                </div>

                <div className="text-xs text-[var(--ink-900)] mt-1 font-sans leading-relaxed">
                  {entry.detail}
                </div>

                <div className="text-[11.5px] text-[var(--sage-400)] mt-2 font-sans font-medium">
                  by {entry.user}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

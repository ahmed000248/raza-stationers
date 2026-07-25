"use client"

import * as React from "react"
import { MOCK_SALES_POINTS } from "@/content/mock/dashboard-data"

export function SalesLineChart() {
  return (
    <div className="bg-white border border-[var(--border-subtle)] rounded-[16px] p-6">
      <div className="text-[14px] font-semibold mb-3.5 text-[var(--ink-900)]">
        Sales — last 10 days
      </div>
      <div className="h-[130px] w-full flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 300 110"
          className="w-full h-full text-[var(--evergreen-600)] transition-all duration-700 ease-out"
          preserveAspectRatio="none"
        >
          {/* Gradient area under line */}
          <defs>
            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--evergreen-600)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--evergreen-600)" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polygon
            points={`10,110 ${MOCK_SALES_POINTS} 280,110`}
            fill="url(#salesGrad)"
          />
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={MOCK_SALES_POINTS}
          />
        </svg>
      </div>
    </div>
  )
}

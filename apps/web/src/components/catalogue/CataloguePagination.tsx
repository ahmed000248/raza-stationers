"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CataloguePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function CataloguePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: CataloguePaginationProps) {
  if (totalPages <= 1) return null

  const pageNumbers = Array.from(new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages]))
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b)

  return (
    <div className={cn("flex items-center justify-between border-t border-border pt-6 mt-8", className)}>
      <span className="text-xs text-muted-foreground">
        Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
        <span className="font-semibold text-foreground">{totalPages}</span>
      </span>

      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-lg gap-1"
        >
          <ChevronLeft className="size-4" />
          <span>Previous</span>
        </Button>

        {pageNumbers.map((page, index) => (
          <React.Fragment key={page}>
            {index > 0 && page - pageNumbers[index - 1] > 1 && <span className="px-1 text-xs text-muted-foreground" aria-hidden>…</span>}
            <button type="button" onClick={() => onPageChange(page)} aria-current={page === currentPage ? "page" : undefined}
              className={cn("size-8 rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring", page === currentPage ? "bg-[var(--color-ink-900)] text-white shadow-xs" : "hover:bg-muted text-muted-foreground")}>{page}</button>
          </React.Fragment>
        ))}

        <Button
          size="sm"
          variant="outline"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-lg gap-1"
        >
          <span>Next</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

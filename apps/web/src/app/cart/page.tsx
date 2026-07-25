"use client"

import * as React from "react"
import Link from "next/link"
import { useCart } from "@/hooks/use-cart"
import { CartLineItem } from "@/components/cart/CartLineItem"
import { CartSummary } from "@/components/cart/CartSummary"
import { EmptyState } from "@/components/ui/empty-state"
import { Bilingual } from "@/components/ui/bilingual"
import { ShoppingBag, ArrowLeft, Trash2 } from "lucide-react"

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, totalItems } = useCart()

  return (
    <div className="py-10 px-6 min-h-screen">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-evergreen-600)]">
              FR-CRT-01 Shopping Basket
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-ink-900)] mt-1 flex items-center gap-3">
              <span>Your Wholesale Cart</span>
              {totalItems > 0 && (
                <span className="rounded-full bg-[var(--color-evergreen-600)] px-3 py-0.5 text-xs font-bold text-white">
                  {totalItems} items
                </span>
              )}
            </h1>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="size-3.5" />
              <span>Clear Entire Cart</span>
            </button>
          )}
        </div>

        {/* Cart Main Section */}
        {items.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={ShoppingBag}
              title="Your Shopping Cart is Empty"
              description="You have no stationery items in your basket. Explore our catalogue to add paper, pens, and office supplies."
              actionLabel="Browse Product Catalogue"
              onAction={() => {
                window.location.href = "/catalogue"
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Line Items List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-3">
                {items.map((item) => (
                  <CartLineItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>

              {/* Navigation Back to Catalogue */}
              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                <Link
                  href="/catalogue"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="size-4" />
                  <Bilingual en="Continue Shopping" ur="مزید خریداری کریں" layout="inline" />
                </Link>

                <span className="text-xs text-muted-foreground">
                  Cart persists automatically across sessions (FR-CRT-01).
                </span>
              </div>
            </div>

            {/* Right Column: Order Summary & Checkout Gate */}
            <div className="lg:col-span-5">
              <CartSummary subtotal={subtotal} totalItems={totalItems} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

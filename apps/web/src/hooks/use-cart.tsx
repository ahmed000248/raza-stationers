"use client"

import * as React from "react"
import { calculateCartSubtotal, calculateCartTotalItems } from "@/lib/cart-math"

export interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
  unit: string
  category?: string
}

interface CartContextValue {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
}

const CartContext = React.createContext<CartContextValue | null>(null)

const CART_STORAGE_KEY = "raza_stationers_guest_cart_v1"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = React.useState(false)

  // Load guest cart from localStorage on client mount (FR-CRT-01)
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        setItems(JSON.parse(stored))
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Persist cart items to localStorage on updates
  React.useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignore localStorage errors
    }
  }, [items, isLoaded])

  const addItem = React.useCallback(
    (item: Omit<CartItem, "quantity">, quantityToAdd = 1) => {
      setItems((prev) => {
        const existingIdx = prev.findIndex((i) => i.id === item.id)
        if (existingIdx > -1) {
          const updated = [...prev]
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + quantityToAdd,
          }
          return updated
        }
        return [...prev, { ...item, quantity: quantityToAdd }]
      })
    },
    []
  )

  const removeItem = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateQuantity = React.useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id))
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    )
  }, [])

  const clearCart = React.useCallback(() => {
    setItems([])
  }, [])

  const totalItems = React.useMemo(() => calculateCartTotalItems(items), [items])
  const subtotal = React.useMemo(() => calculateCartSubtotal(items), [items])

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = React.useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

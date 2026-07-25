export interface ExpenseItem {
  id: string
  category: string
  date: string
  note: string
  amount: number
}

export const MOCK_EXPENSES: ExpenseItem[] = [
  {
    id: "exp-1",
    category: "Restocking",
    date: "2026-07-24",
    note: "Dollar Industries invoice #940",
    amount: 9000,
  },
  {
    id: "exp-2",
    category: "Fuel & Delivery",
    date: "2026-07-22",
    note: "Bike fuel allowance - Imran & Bilal",
    amount: 3500,
  },
  {
    id: "exp-3",
    category: "Rent & Utilities",
    date: "2026-07-05",
    note: "Shop & warehouse electricity bill",
    amount: 28000,
  },
  {
    id: "exp-4",
    category: "Packaging Supplies",
    date: "2026-07-02",
    note: "Carton boxes & sealing tapes",
    amount: 6200,
  },
]

export const MOCK_SALES_TREND_POINTS = [
  { day: "Mon", sales: 18000 },
  { day: "Tue", sales: 34000 },
  { day: "Wed", sales: 27000 },
  { day: "Thu", sales: 52000 },
  { day: "Fri", sales: 48000 },
  { day: "Sat", sales: 65000 },
  { day: "Sun", sales: 22000 },
]

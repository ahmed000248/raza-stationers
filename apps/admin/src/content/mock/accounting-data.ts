export interface ExpenseItem {
  id: string;
  category: string;
  date: string; // ISO format
  note: string;
  amount: number; // positive values represent expense
}

export const MOCK_EXPENSES: ExpenseItem[] = [
  {
    id: "exp-1",
    category: "Restocking",
    date: "2026-07-01",
    note: "Purchased new ink cartridges",
    amount: 120.5,
  },
  {
    id: "exp-2",
    category: "Utilities",
    date: "2026-07-05",
    note: "Electricity bill",
    amount: 85.0,
  },
  {
    id: "exp-3",
    category: "Marketing",
    date: "2026-07-10",
    note: "Online ad campaign",
    amount: 250.75,
  },
  {
    id: "exp-4",
    category: "Travel",
    date: "2026-07-12",
    note: "Client meeting transportation",
    amount: 45.0,
  },
  {
    id: "exp-5",
    category: "Supplies",
    date: "2026-07-15",
    note: "Office stationery",
    amount: 30.2,
  },
];

export interface RevenueItem {
  id: string;
  source: string;
  date: string; // ISO format
  amount: number; // positive values represent revenue
}

export const MOCK_REVENUE: RevenueItem[] = [
  {
    id: "rev-1",
    source: "Online Orders",
    date: "2026-07-01",
    amount: 1500.0,
  },
  {
    id: "rev-2",
    source: "In‑Store Sales",
    date: "2026-07-03",
    amount: 800.0,
  },
  {
    id: "rev-3",
    source: "Wholesale",
    date: "2026-07-07",
    amount: 1200.0,
  },
];

export interface SalesTrendPoint {
  day: string;
  sales: number;
}

export const MOCK_SALES_TREND_POINTS: SalesTrendPoint[] = [
  { day: "Mon", sales: 45000 },
  { day: "Tue", sales: 62000 },
  { day: "Wed", sales: 58000 },
  { day: "Thu", sales: 71000 },
  { day: "Fri", sales: 89000 },
  { day: "Sat", sales: 95000 },
  { day: "Sun", sales: 40000 },
];


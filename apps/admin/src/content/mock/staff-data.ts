export interface StaffMember {
  id: string
  name: string
  role: string
  phone: string
  active: boolean
  lastLogin: string
}

export const MOCK_STAFF_MEMBERS: StaffMember[] = [
  {
    id: "s1",
    name: "Sana Malik",
    role: "Admin / Operator",
    phone: "0300-9876543",
    active: true,
    lastLogin: "2026-07-25T14:45:00Z",
  },
  {
    id: "s2",
    name: "Bilal Hussain",
    role: "Warehouse Worker",
    phone: "0321-5544332",
    active: true,
    lastLogin: "2026-07-25T11:20:00Z",
  },
  {
    id: "s3",
    name: "Imran Sheikh",
    role: "Delivery Worker",
    phone: "0333-1122334",
    active: true,
    lastLogin: "2026-07-25T08:10:00Z",
  },
  {
    id: "s4",
    name: "Tariq Aziz",
    role: "Delivery Worker",
    phone: "0345-6677889",
    active: false,
    lastLogin: "2026-07-20T16:00:00Z",
  },
]

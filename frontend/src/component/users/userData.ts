export type Role = 'Admin' | 'Staff' | 'Viewer'

export interface AppUser {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  status: 'Active' | 'Inactive'
  joinedDate: string
  avatar: string
}

export const ROLE_CONFIG: Record<Role, { color: string; bg: string; desc: string }> = {
  Admin:  { color: '#724B68', bg: 'rgba(114,75,104,0.1)', desc: 'Full system access'        },
  Staff:  { color: '#2563eb', bg: 'rgba(37,99,235,0.1)',  desc: 'Billing & inventory'       },
  Viewer: { color: '#059669', bg: 'rgba(5,150,105,0.1)',  desc: 'Read-only reports access'  },
}

export const SEED_USERS: AppUser[] = [
  { id: 'U001', name: 'Rajesh Kumar',  email: 'rajesh@inventra.in',  phone: '9876543210', role: 'Admin',  status: 'Active',   joinedDate: '01 Jan 2024', avatar: 'RK' },
  { id: 'U002', name: 'Amit Sharma',   email: 'amit@inventra.in',    phone: '9123456780', role: 'Staff',  status: 'Active',   joinedDate: '15 Feb 2024', avatar: 'AS' },
  { id: 'U003', name: 'Neha Patel',    email: 'neha@inventra.in',    phone: '9988776655', role: 'Viewer', status: 'Active',   joinedDate: '20 Feb 2024', avatar: 'NP' },
  { id: 'U004', name: 'Suresh Verma',  email: 'suresh@inventra.in',  phone: '9001122334', role: 'Staff',  status: 'Active',   joinedDate: '05 Mar 2024', avatar: 'SV' },
  { id: 'U005', name: 'Priya Singh',   email: 'priya@inventra.in',   phone: '9765432100', role: 'Viewer', status: 'Inactive', joinedDate: '12 Mar 2024', avatar: 'PS' },
  { id: 'U006', name: 'Karan Mehta',   email: 'karan@inventra.in',   phone: '9812345678', role: 'Staff',  status: 'Active',   joinedDate: '01 Apr 2024', avatar: 'KM' },
]

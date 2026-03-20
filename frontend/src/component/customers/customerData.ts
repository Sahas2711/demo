export interface PurchaseRecord {
  invoiceId: string
  date: string
  amount: number
  status: 'Paid' | 'Pending'
}

export interface Customer {
  id: string
  name: string
  phone: string
  address: string
  gstin: string
  totalPurchases: number
  purchases: PurchaseRecord[]
}

export const SEED_CUSTOMERS: Customer[] = [
  {
    id: 'C001', name: 'Rahul Traders', phone: '9876543210',
    address: '12, MG Road, Pune', gstin: '27ABCDE1234F1Z5',
    totalPurchases: 42800,
    purchases: [
      { invoiceId: 'INV-1021', date: '24 May 2024', amount: 3200,  status: 'Paid'    },
      { invoiceId: 'INV-1015', date: '18 May 2024', amount: 18400, status: 'Paid'    },
      { invoiceId: 'INV-1008', date: '10 May 2024', amount: 21200, status: 'Paid'    },
    ],
  },
  {
    id: 'C002', name: 'Amit Hardware', phone: '9123456780',
    address: '45, Ring Road, Mumbai', gstin: '',
    totalPurchases: 19600,
    purchases: [
      { invoiceId: 'INV-1022', date: '24 May 2024', amount: 1800,  status: 'Pending' },
      { invoiceId: 'INV-1014', date: '17 May 2024', amount: 9200,  status: 'Paid'    },
      { invoiceId: 'INV-1007', date: '9 May 2024',  amount: 8600,  status: 'Paid'    },
    ],
  },
  {
    id: 'C003', name: 'Ravi Constructions', phone: '9988776655',
    address: '7, NH-48, Chennai', gstin: '33XYZAB5678G2Z1',
    totalPurchases: 67500,
    purchases: [
      { invoiceId: 'INV-1023', date: '23 May 2024', amount: 8500,  status: 'Paid'    },
      { invoiceId: 'INV-1016', date: '19 May 2024', amount: 34000, status: 'Paid'    },
      { invoiceId: 'INV-1009', date: '11 May 2024', amount: 25000, status: 'Pending' },
    ],
  },
  {
    id: 'C004', name: 'Sharma Builders', phone: '9001122334',
    address: '3, Civil Lines, Delhi', gstin: '07PQRST9012H3Z4',
    totalPurchases: 31200,
    purchases: [
      { invoiceId: 'INV-1024', date: '23 May 2024', amount: 4200,  status: 'Pending' },
      { invoiceId: 'INV-1017', date: '20 May 2024', amount: 14800, status: 'Paid'    },
      { invoiceId: 'INV-1010', date: '12 May 2024', amount: 12200, status: 'Paid'    },
    ],
  },
  {
    id: 'C005', name: 'Kumar & Sons', phone: '9765432100',
    address: '88, GT Road, Kolkata', gstin: '19LMNOP3456I4Z7',
    totalPurchases: 54000,
    purchases: [
      { invoiceId: 'INV-1025', date: '22 May 2024', amount: 12000, status: 'Paid'    },
      { invoiceId: 'INV-1018', date: '21 May 2024', amount: 22000, status: 'Paid'    },
      { invoiceId: 'INV-1011', date: '13 May 2024', amount: 20000, status: 'Paid'    },
    ],
  },
  {
    id: 'C006', name: 'Patel Enterprises', phone: '9812345678',
    address: '22, SG Highway, Ahmedabad', gstin: '24UVWXY7890J5Z2',
    totalPurchases: 28400,
    purchases: [
      { invoiceId: 'INV-1026', date: '21 May 2024', amount: 6400,  status: 'Paid'    },
      { invoiceId: 'INV-1019', date: '20 May 2024', amount: 12000, status: 'Paid'    },
      { invoiceId: 'INV-1012', date: '14 May 2024', amount: 10000, status: 'Pending' },
    ],
  },
]

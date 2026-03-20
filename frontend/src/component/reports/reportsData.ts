export interface SalesRow {
  date: string
  invoiceId: string
  customer: string
  amount: number
  gst: number
  status: 'Paid' | 'Pending'
}

export interface LowStockItem {
  id: string
  name: string
  category: string
  stock: number
  threshold: number
}

export const SALES_DATA: SalesRow[] = [
  { date: '24 May 2024', invoiceId: 'INV-1026', customer: 'Patel Enterprises',  amount: 6400,  gst: 1152, status: 'Paid'    },
  { date: '24 May 2024', invoiceId: 'INV-1025', customer: 'Kumar & Sons',        amount: 12000, gst: 2160, status: 'Paid'    },
  { date: '23 May 2024', invoiceId: 'INV-1024', customer: 'Sharma Builders',     amount: 4200,  gst: 756,  status: 'Pending' },
  { date: '23 May 2024', invoiceId: 'INV-1023', customer: 'Ravi Constructions',  amount: 8500,  gst: 1530, status: 'Paid'    },
  { date: '24 May 2024', invoiceId: 'INV-1022', customer: 'Amit Hardware',       amount: 1800,  gst: 324,  status: 'Pending' },
  { date: '24 May 2024', invoiceId: 'INV-1021', customer: 'Rahul Traders',       amount: 3200,  gst: 576,  status: 'Paid'    },
  { date: '21 May 2024', invoiceId: 'INV-1019', customer: 'Patel Enterprises',  amount: 12000, gst: 2160, status: 'Paid'    },
  { date: '20 May 2024', invoiceId: 'INV-1018', customer: 'Kumar & Sons',        amount: 22000, gst: 3960, status: 'Paid'    },
  { date: '20 May 2024', invoiceId: 'INV-1017', customer: 'Sharma Builders',     amount: 14800, gst: 2664, status: 'Paid'    },
  { date: '19 May 2024', invoiceId: 'INV-1016', customer: 'Ravi Constructions',  amount: 34000, gst: 6120, status: 'Paid'    },
  { date: '18 May 2024', invoiceId: 'INV-1015', customer: 'Rahul Traders',       amount: 18400, gst: 3312, status: 'Paid'    },
  { date: '17 May 2024', invoiceId: 'INV-1014', customer: 'Amit Hardware',       amount: 9200,  gst: 1656, status: 'Paid'    },
]

export const GST_SUMMARY = { cgst: 22122, sgst: 22122, igst: 0 }

export const LOW_STOCK_ITEMS: LowStockItem[] = [
  { id: 'P002', name: 'Steel Rods',     category: 'Steel',     stock: 8,  threshold: 20 },
  { id: 'P007', name: 'TMT Steel Bars', category: 'Steel',     stock: 6,  threshold: 20 },
  { id: 'P005', name: 'River Sand',     category: 'Aggregate', stock: 12, threshold: 20 },
]

export const MONTHLY_TREND = [
  { month: 'Jan', sales: 68000,  gst: 12240 },
  { month: 'Feb', sales: 94000,  gst: 16920 },
  { month: 'Mar', sales: 81000,  gst: 14580 },
  { month: 'Apr', sales: 120000, gst: 21600 },
  { month: 'May', sales: 146500, gst: 26370 },
]

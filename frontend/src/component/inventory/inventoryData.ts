export interface Product {
  id: string
  name: string
  category: string
  price: number
  gst: number
  stock: number
}

export const CATEGORIES = ['Cement', 'Steel', 'Pipes', 'Masonry', 'Timber', 'Aggregate', 'Hardware', 'Other']

export const SEED_PRODUCTS: Product[] = [
  { id: 'P001', name: 'Cement Bags',     category: 'Cement',    price: 380,  gst: 28, stock: 120 },
  { id: 'P002', name: 'Steel Rods',      category: 'Steel',     price: 6200, gst: 18, stock: 8   },
  { id: 'P003', name: 'PVC Pipes',       category: 'Pipes',     price: 240,  gst: 18, stock: 40  },
  { id: 'P004', name: 'Red Bricks',      category: 'Masonry',   price: 8,    gst: 5,  stock: 1500},
  { id: 'P005', name: 'River Sand',      category: 'Aggregate', price: 1800, gst: 5,  stock: 12  },
  { id: 'P006', name: 'Plywood Sheets',  category: 'Timber',    price: 1200, gst: 18, stock: 22  },
  { id: 'P007', name: 'TMT Steel Bars',  category: 'Steel',     price: 5800, gst: 18, stock: 6   },
  { id: 'P008', name: 'Portland Cement', category: 'Cement',    price: 420,  gst: 28, stock: 240 },
  { id: 'P009', name: 'CPVC Fittings',   category: 'Pipes',     price: 180,  gst: 18, stock: 85  },
  { id: 'P010', name: 'Granite Tiles',   category: 'Masonry',   price: 950,  gst: 18, stock: 60  },
]

export const LOW_STOCK_THRESHOLD = 20

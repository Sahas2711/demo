import { describe, expect, it } from 'vitest'
import { inventoryApi } from '@/api/inventoryApi'

describe('inventoryApi', () => {
  it('manages categories', async () => {
    const list = await inventoryApi.getCategories()
    const created = await inventoryApi.createCategory({ name: 'Electrical', description: 'Wires' })
    const updated = await inventoryApi.updateCategory('cat-1', { name: 'Updated Category' })
    const deleted = await inventoryApi.deleteCategory('cat-1')

    expect(list.data).toHaveLength(2)
    expect(created.status).toBe(201)
    expect(updated.data.name).toBe('Updated Category')
    expect(deleted.data.message).toContain('deleted')
  })

  it('rejects empty category names', async () => {
    await expect(inventoryApi.createCategory({ name: '' })).rejects.toMatchObject({ response: { status: 400 } })
  })

  it('manages products and missing product errors', async () => {
    const list = await inventoryApi.getProducts({ size: 20 })
    const one = await inventoryApi.getProductById('prod-1')
    const created = await inventoryApi.createProduct({
      name: 'Paint',
      hsnCode: '3208',
      unitPrice: 900,
      gstPercentage: 18,
      categoryId: 'cat-1',
      quantityAvailable: 12,
      reorderLevel: 5,
    })

    expect(list.data.content).toHaveLength(2)
    expect(one.data.name).toBe('Ultra Cement')
    expect(created.data.id).toBe('prod-3')
    await expect(inventoryApi.getProductById('missing')).rejects.toMatchObject({ response: { status: 404 } })
  })

  it('filters low stock inventory', async () => {
    const all = await inventoryApi.getInventory()
    const lowStock = await inventoryApi.getInventory(true)
    const dedicatedLowStock = await inventoryApi.getLowStockProducts()

    expect(all.data).toHaveLength(2)
    expect(lowStock.data.every((product) => product.lowStock)).toBe(true)
    expect(dedicatedLowStock.data).toHaveLength(1)
  })

  it('adjusts stock and recalculates low stock state', async () => {
    const response = await inventoryApi.adjustStock('prod-1', { quantityAvailable: 20, reorderLevel: 10 })

    expect(response.data.quantityAvailable).toBe(20)
    expect(response.data.lowStock).toBe(false)
  })
})

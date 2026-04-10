import { describe, it, expect, vi } from 'vitest'
import { fetchMyProducts, fetchMyMaterials } from './route'
import type { SuzuriClient } from '@/lib/suzuri-client'

describe('MCP Handler', () => {
  it('MCPハンドラーが正しくエクスポートされる', async () => {
    const { GET, POST, DELETE } = await import('./route')

    expect(GET).toBeDefined()
    expect(POST).toBeDefined()
    expect(DELETE).toBeDefined()
  })
})

describe('fetchMyProducts', () => {
  it('認証ユーザーのuserIdを付与してgetProductsを呼ぶ', async () => {
    const getProducts = vi.fn().mockResolvedValue({
      products: [{ id: 1, title: '自分の商品', price: 2500 }],
    })
    const client = { getProducts } as unknown as SuzuriClient

    const result = await fetchMyProducts(client, 42, { limit: 10, offset: 0 })

    expect(getProducts).toHaveBeenCalledWith({ limit: 10, offset: 0, userId: 42 })
    expect(result).toEqual({
      items: [{ id: 1, title: '自分の商品', price: 2500 }],
    })
  })
})

describe('fetchMyMaterials', () => {
  it('認証ユーザーのuserIdを付与してgetMaterialsを呼ぶ', async () => {
    const getMaterials = vi.fn().mockResolvedValue({
      materials: [{ id: 7, title: '自分の素材' }],
    })
    const client = { getMaterials } as unknown as SuzuriClient

    const result = await fetchMyMaterials(client, 42, { limit: 5 })

    expect(getMaterials).toHaveBeenCalledWith({ limit: 5, userId: 42 })
    expect(result).toEqual({
      items: [{ id: 7, title: '自分の素材' }],
    })
  })
})

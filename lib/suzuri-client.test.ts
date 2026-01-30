import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SuzuriClient } from './suzuri-client'

describe('SuzuriClient', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('getItems', () => {
    it('アイテム一覧を取得できる', async () => {
      const mockItems = {
        items: [
          { id: 1, name: 'Tシャツ', humanizeName: 'Tシャツ' },
          { id: 2, name: 'パーカー', humanizeName: 'パーカー' },
        ],
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockItems),
      })

      const client = new SuzuriClient()
      const result = await client.getItems()

      expect(result).toEqual(mockItems)
      expect(fetch).toHaveBeenCalledWith(
        'https://suzuri.jp/api/v1/items',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Accept': 'application/json',
          }),
        })
      )
    })

    it('limitパラメータで取得件数を制限できる', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      })

      const client = new SuzuriClient()
      await client.getItems({ limit: 10 })

      expect(fetch).toHaveBeenCalledWith(
        'https://suzuri.jp/api/v1/items?limit=10',
        expect.any(Object)
      )
    })

    it('APIエラー時に適切なエラーメッセージを返す', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      const client = new SuzuriClient()

      await expect(client.getItems()).rejects.toThrow('SUZURI API error: 500 Internal Server Error')
    })
  })

  describe('getProducts', () => {
    it('商品一覧を取得できる', async () => {
      const mockProducts = {
        products: [
          { id: 1, title: 'サンプル商品', price: 2500 },
        ],
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })

      const client = new SuzuriClient()
      const result = await client.getProducts()

      expect(result).toEqual(mockProducts)
      expect(fetch).toHaveBeenCalledWith(
        'https://suzuri.jp/api/v1/products',
        expect.any(Object)
      )
    })

    it('userIdパラメータでユーザーの商品を絞り込める', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ products: [] }),
      })

      const client = new SuzuriClient()
      await client.getProducts({ userId: 12345 })

      expect(fetch).toHaveBeenCalledWith(
        'https://suzuri.jp/api/v1/products?userId=12345',
        expect.any(Object)
      )
    })

    it('itemIdパラメータでアイテム種類を絞り込める', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ products: [] }),
      })

      const client = new SuzuriClient()
      await client.getProducts({ itemId: 1 })

      expect(fetch).toHaveBeenCalledWith(
        'https://suzuri.jp/api/v1/products?itemId=1',
        expect.any(Object)
      )
    })
  })
})

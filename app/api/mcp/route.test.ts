import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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
  it('getMeでuserIdを取得してから自分の商品を絞り込む', async () => {
    const getMe = vi.fn().mockResolvedValue({ id: 42, name: 'yukyu30' })
    const getProducts = vi.fn().mockResolvedValue({
      products: [{ id: 1, title: '自分の商品', price: 2500 }],
    })
    const client = { getMe, getProducts } as unknown as SuzuriClient

    const result = await fetchMyProducts(client, { limit: 10, offset: 0 })

    expect(getMe).toHaveBeenCalledTimes(1)
    expect(getProducts).toHaveBeenCalledWith({ limit: 10, offset: 0, userId: 42 })
    expect(result).toEqual({
      items: [{ id: 1, title: '自分の商品', price: 2500 }],
    })
  })
})

describe('fetchMyMaterials', () => {
  it('getMeでuserIdを取得してから自分の素材を絞り込む', async () => {
    const getMe = vi.fn().mockResolvedValue({ id: 42, name: 'yukyu30' })
    const getMaterials = vi.fn().mockResolvedValue({
      materials: [{ id: 7, title: '自分の素材' }],
    })
    const client = { getMe, getMaterials } as unknown as SuzuriClient

    const result = await fetchMyMaterials(client, { limit: 5 })

    expect(getMe).toHaveBeenCalledTimes(1)
    expect(getMaterials).toHaveBeenCalledWith({ limit: 5, userId: 42 })
    expect(result).toEqual({
      items: [{ id: 7, title: '自分の素材' }],
    })
  })
})

describe('POST /api/mcp 経由の get_my_products', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  const callTool = async (toolName: string, args: Record<string, unknown> = {}) => {
    const { POST } = await import('./route')
    const request = new Request('http://localhost/api/mcp', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-token',
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        'mcp-protocol-version': '2025-06-18',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name: toolName, arguments: args },
      }),
    })
    const response = await POST(request)
    const text = await response.text()
    // SSE 形式 ("event: ... data: {...}\n\n") と JSON 形式の両方に対応する
    const dataLine = text.split('\n').find((line) => line.startsWith('data:'))
    const jsonText = dataLine ? dataLine.replace(/^data:\s*/, '') : text
    return { status: response.status, body: JSON.parse(jsonText) }
  }

  const setupFetchMock = (productsResponse: unknown) => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url === 'https://suzuri.jp/api/v1/user') {
        return new Response(
          JSON.stringify({ id: 42, name: 'yukyu30' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
      }
      if (url.startsWith('https://suzuri.jp/api/v1/products')) {
        return new Response(JSON.stringify(productsResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      throw new Error(`Unexpected fetch: ${url}`)
    })
    global.fetch = fetchMock as unknown as typeof fetch
    return fetchMock
  }

  it('認証ユーザーのuserIdをクエリに付けてSUZURI APIを叩く', async () => {
    const fetchMock = setupFetchMock({
      products: [{ id: 1, title: '自分の商品', price: 2500 }],
    })

    const { status, body } = await callTool('get_my_products')

    expect(status).toBe(200)
    expect(body.error).toBeUndefined()
    expect(body.result?.isError).not.toBe(true)

    const productsCall = fetchMock.mock.calls.find(([url]) =>
      url.toString().startsWith('https://suzuri.jp/api/v1/products'),
    )
    expect(productsCall, 'getProducts API should be called').toBeDefined()
    const calledUrl = productsCall![0].toString()
    expect(calledUrl).toContain('userId=42')
  })
})

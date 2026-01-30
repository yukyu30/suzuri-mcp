const SUZURI_API_BASE = 'https://suzuri.jp/api/v1'

export interface SuzuriItem {
  id: number
  name: string
  humanizeName: string
}

export interface GetItemsResponse {
  items: SuzuriItem[]
}

export interface GetItemsParams {
  limit?: number
  offset?: number
}

export interface SuzuriProduct {
  id: number
  title: string
  price: number
}

export interface GetProductsResponse {
  products: SuzuriProduct[]
}

export interface GetProductsParams {
  limit?: number
  offset?: number
  userId?: number
  userName?: string
  itemId?: number
  materialId?: number
}

export class SuzuriClient {
  private accessToken?: string

  constructor(accessToken?: string) {
    this.accessToken = accessToken
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    const response = await fetch(`${SUZURI_API_BASE}${endpoint}`, {
      ...options,
      method: options.method ?? 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`SUZURI API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getItems(params?: GetItemsParams): Promise<GetItemsResponse> {
    const searchParams = new URLSearchParams()

    if (params?.limit !== undefined) {
      searchParams.set('limit', params.limit.toString())
    }
    if (params?.offset !== undefined) {
      searchParams.set('offset', params.offset.toString())
    }

    const queryString = searchParams.toString()
    const endpoint = queryString ? `/items?${queryString}` : '/items'

    return this.request<GetItemsResponse>(endpoint)
  }

  async getProducts(params?: GetProductsParams): Promise<GetProductsResponse> {
    const searchParams = new URLSearchParams()

    if (params?.limit !== undefined) {
      searchParams.set('limit', params.limit.toString())
    }
    if (params?.offset !== undefined) {
      searchParams.set('offset', params.offset.toString())
    }
    if (params?.userId !== undefined) {
      searchParams.set('userId', params.userId.toString())
    }
    if (params?.userName !== undefined) {
      searchParams.set('userName', params.userName)
    }
    if (params?.itemId !== undefined) {
      searchParams.set('itemId', params.itemId.toString())
    }
    if (params?.materialId !== undefined) {
      searchParams.set('materialId', params.materialId.toString())
    }

    const queryString = searchParams.toString()
    const endpoint = queryString ? `/products?${queryString}` : '/products'

    return this.request<GetProductsResponse>(endpoint)
  }
}

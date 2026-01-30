const SUZURI_API_BASE = 'https://suzuri.jp/api/v1'

// ========== Items ==========
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

// ========== Products ==========
export interface SuzuriProduct {
  id: number
  title: string
  price: number
  imageUrl?: string
  sampleImageUrl?: string
  sampleUrl?: string
  publishedAt?: string
  user?: SuzuriUser
  material?: SuzuriMaterial
  item?: SuzuriItem
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

export interface SearchProductsParams {
  q: string
  limit?: number
  offset?: number
  itemId?: number
}

// ========== Users ==========
export interface SuzuriUser {
  id: number
  name: string
  displayName?: string
  avatarUrl?: string
  headerUrl?: string
  profile?: string
}

export interface GetUsersParams {
  name?: string
  limit?: number
  offset?: number
}

export interface GetUsersResponse {
  users: SuzuriUser[]
}

// ========== Materials ==========
export interface SuzuriMaterial {
  id: number
  title?: string
  description?: string
  imageUrl?: string
  texture?: string
  userId?: number
  user?: SuzuriUser
}

export interface GetMaterialsParams {
  limit?: number
  offset?: number
  userId?: number
}

export interface GetMaterialsResponse {
  materials: SuzuriMaterial[]
}

export interface CreateMaterialParams {
  texture: string  // Base64エンコードされた画像
  title?: string
  description?: string
  products?: boolean  // 自動で商品を作成するか
}

export interface CreateTextMaterialParams {
  text: string
  itemVariantId?: number
}

// ========== Favorites ==========
export interface SuzuriFavorite {
  id: number
  productId: number
  userId?: number
  anonymouse?: boolean
  count?: number
  product?: SuzuriProduct
}

export interface GetFavoritesParams {
  limit?: number
  offset?: number
  itemId?: number
}

export interface GetFavoritesResponse {
  favorites: SuzuriFavorite[]
}

// ========== Choices (オモイデ) ==========
export interface SuzuriChoice {
  id: number
  title: string
  description?: string
  imageUrl?: string
  user?: SuzuriUser
}

export interface GetChoicesParams {
  limit?: number
  offset?: number
  userId?: number
  userName?: string
}

export interface GetChoicesResponse {
  choices: SuzuriChoice[]
}

// ========== Activities ==========
export interface SuzuriActivity {
  id: number
  type: string
  createdAt: string
  read: boolean
}

export interface GetActivitiesParams {
  limit?: number
}

export interface GetActivitiesResponse {
  activities: SuzuriActivity[]
}

export interface UnreadActivitiesResponse {
  count: number
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

    // POST/PUT/DELETEリクエストにはContent-Typeを追加
    if (options.method && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
      headers['Content-Type'] = 'application/json'
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

  async getProduct(productId: number): Promise<SuzuriProduct> {
    return this.request<SuzuriProduct>(`/products/${productId}`)
  }

  async searchProducts(params: SearchProductsParams): Promise<GetProductsResponse> {
    const searchParams = new URLSearchParams()
    searchParams.set('q', params.q)

    if (params.limit !== undefined) {
      searchParams.set('limit', params.limit.toString())
    }
    if (params.offset !== undefined) {
      searchParams.set('offset', params.offset.toString())
    }
    if (params.itemId !== undefined) {
      searchParams.set('itemId', params.itemId.toString())
    }

    return this.request<GetProductsResponse>(`/products/search?${searchParams.toString()}`)
  }

  async getOnSaleProducts(params?: { limit?: number; offset?: number }): Promise<GetProductsResponse> {
    const searchParams = new URLSearchParams()

    if (params?.limit !== undefined) {
      searchParams.set('limit', params.limit.toString())
    }
    if (params?.offset !== undefined) {
      searchParams.set('offset', params.offset.toString())
    }

    const queryString = searchParams.toString()
    const endpoint = queryString ? `/products/on_sale?${queryString}` : '/products/on_sale'

    return this.request<GetProductsResponse>(endpoint)
  }

  // ========== Users ==========
  async getUsers(params?: GetUsersParams): Promise<GetUsersResponse> {
    const searchParams = new URLSearchParams()

    if (params?.name !== undefined) {
      searchParams.set('name', params.name)
    }
    if (params?.limit !== undefined) {
      searchParams.set('limit', params.limit.toString())
    }
    if (params?.offset !== undefined) {
      searchParams.set('offset', params.offset.toString())
    }

    const queryString = searchParams.toString()
    const endpoint = queryString ? `/users?${queryString}` : '/users'

    return this.request<GetUsersResponse>(endpoint)
  }

  async getUser(userId: number): Promise<SuzuriUser> {
    return this.request<SuzuriUser>(`/users/${userId}`)
  }

  async getMe(): Promise<SuzuriUser> {
    return this.request<SuzuriUser>('/user')
  }

  async updateMe(params: { displayName?: string; profile?: string }): Promise<SuzuriUser> {
    return this.request<SuzuriUser>('/user', {
      method: 'PUT',
      body: JSON.stringify(params),
    })
  }

  // ========== Materials ==========
  async getMaterials(params?: GetMaterialsParams): Promise<GetMaterialsResponse> {
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

    const queryString = searchParams.toString()
    const endpoint = queryString ? `/materials?${queryString}` : '/materials'

    return this.request<GetMaterialsResponse>(endpoint)
  }

  async createMaterial(params: CreateMaterialParams): Promise<SuzuriMaterial> {
    return this.request<SuzuriMaterial>('/materials', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async createTextMaterial(params: CreateTextMaterialParams): Promise<SuzuriMaterial> {
    return this.request<SuzuriMaterial>('/materials/text', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async updateMaterial(materialId: number, params: { title?: string; description?: string }): Promise<SuzuriMaterial> {
    return this.request<SuzuriMaterial>(`/materials/${materialId}`, {
      method: 'PUT',
      body: JSON.stringify(params),
    })
  }

  async deleteMaterial(materialId: number): Promise<void> {
    await this.request<void>(`/materials/${materialId}`, {
      method: 'DELETE',
    })
  }

  // ========== Favorites ==========
  async getProductFavorites(productId: number, params?: GetFavoritesParams): Promise<GetFavoritesResponse> {
    const searchParams = new URLSearchParams()

    if (params?.limit !== undefined) {
      searchParams.set('limit', params.limit.toString())
    }
    if (params?.offset !== undefined) {
      searchParams.set('offset', params.offset.toString())
    }
    if (params?.itemId !== undefined) {
      searchParams.set('itemId', params.itemId.toString())
    }

    const queryString = searchParams.toString()
    const endpoint = queryString
      ? `/products/${productId}/favorites?${queryString}`
      : `/products/${productId}/favorites`

    return this.request<GetFavoritesResponse>(endpoint)
  }

  async getUserFavorites(userId: number, params?: { limit?: number; offset?: number }): Promise<GetFavoritesResponse> {
    const searchParams = new URLSearchParams()

    if (params?.limit !== undefined) {
      searchParams.set('limit', params.limit.toString())
    }
    if (params?.offset !== undefined) {
      searchParams.set('offset', params.offset.toString())
    }

    const queryString = searchParams.toString()
    const endpoint = queryString
      ? `/users/${userId}/favorites?${queryString}`
      : `/users/${userId}/favorites`

    return this.request<GetFavoritesResponse>(endpoint)
  }

  async addFavorite(productId: number, params?: { anonymouse?: boolean; count?: number }): Promise<SuzuriFavorite> {
    return this.request<SuzuriFavorite>(`/products/${productId}/favorites`, {
      method: 'POST',
      body: JSON.stringify(params || {}),
    })
  }

  async removeFavorite(productId: number): Promise<void> {
    await this.request<void>(`/products/${productId}/favorites`, {
      method: 'DELETE',
    })
  }

  // ========== Choices ==========
  async getChoices(params?: GetChoicesParams): Promise<GetChoicesResponse> {
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

    const queryString = searchParams.toString()
    const endpoint = queryString ? `/choices?${queryString}` : '/choices'

    return this.request<GetChoicesResponse>(endpoint)
  }

  async getChoice(choiceId: number): Promise<SuzuriChoice> {
    return this.request<SuzuriChoice>(`/choices/${choiceId}`)
  }

  async getChoiceProducts(choiceId: number, params?: { limit?: number; offset?: number }): Promise<GetProductsResponse> {
    const searchParams = new URLSearchParams()

    if (params?.limit !== undefined) {
      searchParams.set('limit', params.limit.toString())
    }
    if (params?.offset !== undefined) {
      searchParams.set('offset', params.offset.toString())
    }

    const queryString = searchParams.toString()
    const endpoint = queryString
      ? `/choices/${choiceId}/products?${queryString}`
      : `/choices/${choiceId}/products`

    return this.request<GetProductsResponse>(endpoint)
  }

  async createChoice(params: { title: string; description?: string }): Promise<SuzuriChoice> {
    return this.request<SuzuriChoice>('/choices', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async addProductToChoice(choiceId: number, productId: number): Promise<void> {
    await this.request<void>(`/choices/${choiceId}`, {
      method: 'POST',
      body: JSON.stringify({ productId }),
    })
  }

  async removeProductFromChoice(choiceId: number, productId: number): Promise<void> {
    await this.request<void>(`/choices/${choiceId}/remove`, {
      method: 'POST',
      body: JSON.stringify({ productId }),
    })
  }

  async updateChoice(choiceId: number, params: { title?: string; description?: string }): Promise<SuzuriChoice> {
    return this.request<SuzuriChoice>(`/choices/${choiceId}`, {
      method: 'PUT',
      body: JSON.stringify(params),
    })
  }

  async deleteChoice(choiceId: number): Promise<void> {
    await this.request<void>(`/choices/${choiceId}`, {
      method: 'DELETE',
    })
  }

  // ========== Activities ==========
  async getActivities(params?: GetActivitiesParams): Promise<GetActivitiesResponse> {
    const searchParams = new URLSearchParams()

    if (params?.limit !== undefined) {
      searchParams.set('limit', params.limit.toString())
    }

    const queryString = searchParams.toString()
    const endpoint = queryString ? `/activities?${queryString}` : '/activities'

    return this.request<GetActivitiesResponse>(endpoint)
  }

  async getUnreadActivitiesCount(): Promise<UnreadActivitiesResponse> {
    return this.request<UnreadActivitiesResponse>('/activities/unreads')
  }
}

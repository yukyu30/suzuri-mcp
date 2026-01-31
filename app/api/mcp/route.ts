import { z } from 'zod'
import { createMcpHandler, withMcpAuth } from 'mcp-handler'
import { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js'
import { SuzuriClient, SuzuriProduct, SuzuriUser, SuzuriMaterial, SuzuriChoice, SuzuriFavorite } from '@/lib/suzuri-client'

// 定数
const MAX_LIMIT = 100
const SUZURI_API_USER_ENDPOINT = 'https://suzuri.jp/api/v1/user'

// 型定義
type ToolContent = { type: 'text'; text: string }
type ToolResponse = { content: ToolContent[]; isError?: boolean }
type AuthContext = { authInfo?: { token?: string } }

// レスポンス生成ヘルパー
const createJsonResponse = <T>(data: T): ToolResponse => ({
  content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
})

const createTextResponse = (message: string): ToolResponse => ({
  content: [{ type: 'text', text: message }],
})

const createErrorResponse = (message: string): ToolResponse => ({
  content: [{ type: 'text', text: `エラー: ${message}` }],
  isError: true,
})

const AUTH_ERROR_RESPONSE = createErrorResponse('認証が必要です')

// 認証チェック付きハンドラを生成
const withAuth = <TParams, TResult>(
  handler: (client: SuzuriClient, params: TParams) => Promise<TResult>
) => {
  return async (params: TParams, { authInfo }: AuthContext): Promise<ToolResponse> => {
    if (!authInfo?.token) return AUTH_ERROR_RESPONSE
    const client = new SuzuriClient(authInfo.token)
    const result = await handler(client, params)
    return createJsonResponse(result)
  }
}

// 認証チェック付きハンドラ（テキストレスポンス用）
const withAuthText = <TParams>(
  handler: (client: SuzuriClient, params: TParams) => Promise<string>
) => {
  return async (params: TParams, { authInfo }: AuthContext): Promise<ToolResponse> => {
    if (!authInfo?.token) return AUTH_ERROR_RESPONSE
    const client = new SuzuriClient(authInfo.token)
    const message = await handler(client, params)
    return createTextResponse(message)
  }
}

// レスポンス軽量化用のヘルパー関数
const toCompactProduct = (p: SuzuriProduct) => ({ id: p.id, title: p.title, price: p.price })
const toCompactUser = (u: SuzuriUser) => ({ id: u.id, name: u.name, displayName: u.displayName })
const toCompactMaterial = (m: SuzuriMaterial) => ({ id: m.id, title: m.title })
const toCompactChoice = (c: SuzuriChoice) => ({ id: c.id, title: c.title })
const toCompactFavorite = (f: SuzuriFavorite) => ({ id: f.id, productId: f.productId, count: f.count })

const handler = createMcpHandler(
  (server) => {
    // ========== Items ==========
    server.tool(
      'get_items',
      'SUZURIで取り扱っているアイテム（商品カテゴリ）一覧を取得します（要認証）',
      {
        limit: z.number().int().min(1).max(MAX_LIMIT).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
      },
      withAuth(async (client, { limit, offset }) => client.getItems({ limit, offset })),
    )

    // ========== Products ==========
    server.tool(
      'get_products',
      'SUZURIの商品一覧を取得します（軽量版: id, title, priceのみ）（要認証）',
      {
        limit: z.number().int().min(1).max(MAX_LIMIT).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
        userId: z.number().int().optional().describe('ユーザーIDで絞り込み'),
        userName: z.string().optional().describe('ユーザー名で絞り込み'),
        itemId: z.number().int().optional().describe('アイテムIDで絞り込み'),
      },
      withAuth(async (client, params) => {
        const result = await client.getProducts(params)
        return { products: result.products.map(toCompactProduct) }
      }),
    )

    server.tool(
      'get_product',
      'SUZURIの商品詳細を取得します（要認証）',
      {
        productId: z.number().int().describe('商品ID'),
      },
      withAuth(async (client, { productId }) => client.getProduct(productId)),
    )

    server.tool(
      'search_products',
      'SUZURIの商品を検索します（軽量版: id, title, priceのみ）（要認証）',
      {
        q: z.string().describe('検索キーワード'),
        limit: z.number().int().min(1).max(MAX_LIMIT).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
        itemId: z.number().int().optional().describe('アイテムIDで絞り込み'),
      },
      withAuth(async (client, params) => {
        const result = await client.searchProducts(params)
        return { products: result.products.map(toCompactProduct) }
      }),
    )

    server.tool(
      'get_on_sale_products',
      'SUZURIのセール商品一覧を取得します（軽量版: id, title, priceのみ）（要認証）',
      {
        limit: z.number().int().min(1).max(MAX_LIMIT).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
      },
      withAuth(async (client, params) => {
        const result = await client.getOnSaleProducts(params)
        return { products: result.products.map(toCompactProduct) }
      }),
    )

    server.tool(
      'get_my_products',
      '認証ユーザーの商品一覧を取得します（軽量版: id, title, priceのみ）（要認証）',
      {
        limit: z.number().int().min(1).max(MAX_LIMIT).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
      },
      withAuth(async (client, params) => {
        const result = await client.getProducts(params)
        return { products: result.products.map(toCompactProduct) }
      }),
    )

    server.tool(
      'get_product_images',
      '商品の画像URL一覧を取得します（要認証）',
      {
        productId: z.number().int().describe('商品ID'),
      },
      withAuth(async (client, { productId }) => {
        const product = await client.getProduct(productId)
        return {
          productId: product.id,
          imageUrl: product.imageUrl,
          sampleImageUrl: product.sampleImageUrl,
          sampleUrl: product.sampleUrl,
        }
      }),
    )

    // ========== Users ==========
    server.tool(
      'get_users',
      'SUZURIのユーザー一覧を取得します（軽量版: id, name, displayNameのみ）（要認証）',
      {
        name: z.string().optional().describe('ユーザー名で検索'),
        limit: z.number().int().min(1).max(MAX_LIMIT).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
      },
      withAuth(async (client, params) => {
        const result = await client.getUsers(params)
        return { users: result.users.map(toCompactUser) }
      }),
    )

    server.tool(
      'get_user',
      'SUZURIのユーザー詳細を取得します（要認証）',
      {
        userId: z.number().int().describe('ユーザーID'),
      },
      withAuth(async (client, { userId }) => client.getUser(userId)),
    )

    server.tool(
      'get_me',
      '認証ユーザーの情報を取得します（要認証）',
      {},
      withAuth(async (client) => client.getMe()),
    )

    // ========== Materials ==========
    server.tool(
      'get_materials',
      'SUZURIの素材一覧を取得します（軽量版: id, titleのみ）（要認証）',
      {
        limit: z.number().int().min(1).max(MAX_LIMIT).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
        userId: z.number().int().optional().describe('ユーザーIDで絞り込み'),
      },
      withAuth(async (client, params) => {
        const result = await client.getMaterials(params)
        return { materials: result.materials.map(toCompactMaterial) }
      }),
    )

    server.tool(
      'get_my_materials',
      '認証ユーザーの素材一覧を取得します（軽量版: id, titleのみ）（要認証）',
      {
        limit: z.number().int().min(1).max(MAX_LIMIT).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
      },
      withAuth(async (client, params) => {
        const result = await client.getMaterials(params)
        return { materials: result.materials.map(toCompactMaterial) }
      }),
    )

    server.tool(
      'get_material_detail',
      '素材の詳細情報を取得します（imageUrl, description含む）（要認証）',
      {
        materialId: z.number().int().describe('素材ID'),
      },
      async ({ materialId }, { authInfo }): Promise<ToolResponse> => {
        if (!authInfo?.token) return AUTH_ERROR_RESPONSE
        const client = new SuzuriClient(authInfo.token)
        const result = await client.getMaterials({ limit: MAX_LIMIT })
        const material = result.materials.find(m => m.id === materialId)
        if (!material) return createErrorResponse('素材が見つかりません')
        return createJsonResponse(material)
      },
    )

    server.tool(
      'create_material',
      '画像から素材を作成します（要認証）',
      {
        texture: z.string().describe('Base64エンコードされた画像データ'),
        title: z.string().optional().describe('素材のタイトル'),
        description: z.string().optional().describe('素材の説明'),
        products: z.boolean().optional().describe('自動で商品を作成するか'),
      },
      withAuth(async (client, params) => client.createMaterial(params)),
    )

    server.tool(
      'create_text_material',
      'テキストから素材を作成します（要認証）',
      {
        text: z.string().describe('テキスト'),
        itemVariantId: z.number().int().optional().describe('アイテムバリアントID'),
      },
      withAuth(async (client, params) => client.createTextMaterial(params)),
    )

    server.tool(
      'update_material',
      '素材を更新します（要認証）',
      {
        materialId: z.number().int().describe('素材ID'),
        title: z.string().optional().describe('素材のタイトル'),
        description: z.string().optional().describe('素材の説明'),
      },
      withAuth(async (client, { materialId, title, description }) =>
        client.updateMaterial(materialId, { title, description })
      ),
    )

    server.tool(
      'delete_material',
      '素材を削除します（要認証）',
      {
        materialId: z.number().int().describe('素材ID'),
      },
      withAuthText(async (client, { materialId }) => {
        await client.deleteMaterial(materialId)
        return '素材を削除しました'
      }),
    )

    // ========== Favorites ==========
    server.tool(
      'get_product_favorites',
      '商品のお気に入り（ズッキュン）一覧を取得します（軽量版）（要認証）',
      {
        productId: z.number().int().describe('商品ID'),
        limit: z.number().int().min(1).max(MAX_LIMIT).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
      },
      withAuth(async (client, { productId, limit, offset }) => {
        const result = await client.getProductFavorites(productId, { limit, offset })
        return { favorites: result.favorites.map(toCompactFavorite) }
      }),
    )

    server.tool(
      'get_user_favorites',
      'ユーザーのお気に入り（ズッキュン）一覧を取得します（軽量版）（要認証）',
      {
        userId: z.number().int().describe('ユーザーID'),
        limit: z.number().int().min(1).max(MAX_LIMIT).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
      },
      withAuth(async (client, { userId, limit, offset }) => {
        const result = await client.getUserFavorites(userId, { limit, offset })
        return { favorites: result.favorites.map(toCompactFavorite) }
      }),
    )

    server.tool(
      'add_favorite',
      '商品をお気に入り（ズッキュン）に追加します（要認証）',
      {
        productId: z.number().int().describe('商品ID'),
        anonymouse: z.boolean().optional().describe('匿名でお気に入りするか'),
        count: z.number().int().optional().describe('お気に入りの数'),
      },
      withAuth(async (client, { productId, anonymouse, count }) =>
        client.addFavorite(productId, { anonymouse, count })
      ),
    )

    server.tool(
      'remove_favorite',
      '商品のお気に入り（ズッキュン）を削除します（要認証）',
      {
        productId: z.number().int().describe('商品ID'),
      },
      withAuthText(async (client, { productId }) => {
        await client.removeFavorite(productId)
        return 'お気に入りを削除しました'
      }),
    )

    // ========== Choices ==========
    server.tool(
      'get_choices',
      'SUZURIのオモイデ一覧を取得します（軽量版: id, titleのみ）（要認証）',
      {
        limit: z.number().int().min(1).max(MAX_LIMIT).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
        userId: z.number().int().optional().describe('ユーザーIDで絞り込み'),
        userName: z.string().optional().describe('ユーザー名で絞り込み'),
      },
      withAuth(async (client, params) => {
        const result = await client.getChoices(params)
        return { choices: result.choices.map(toCompactChoice) }
      }),
    )

    server.tool(
      'get_choice',
      'SUZURIのオモイデ詳細を取得します（要認証）',
      {
        choiceId: z.number().int().describe('オモイデID'),
      },
      withAuth(async (client, { choiceId }) => client.getChoice(choiceId)),
    )

    server.tool(
      'get_choice_products',
      'SUZURIのオモイデに含まれる商品一覧を取得します（軽量版: id, title, priceのみ）（要認証）',
      {
        choiceId: z.number().int().describe('オモイデID'),
        limit: z.number().int().min(1).max(MAX_LIMIT).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
      },
      withAuth(async (client, { choiceId, limit, offset }) => {
        const result = await client.getChoiceProducts(choiceId, { limit, offset })
        return { products: result.products.map(toCompactProduct) }
      }),
    )

    server.tool(
      'create_choice',
      'オモイデを作成します（要認証）',
      {
        title: z.string().describe('オモイデのタイトル'),
        description: z.string().optional().describe('オモイデの説明'),
      },
      withAuth(async (client, params) => client.createChoice(params)),
    )

    server.tool(
      'add_product_to_choice',
      'オモイデに商品を追加します（要認証）',
      {
        choiceId: z.number().int().describe('オモイデID'),
        productId: z.number().int().describe('商品ID'),
      },
      withAuthText(async (client, { choiceId, productId }) => {
        await client.addProductToChoice(choiceId, productId)
        return '商品をオモイデに追加しました'
      }),
    )

    server.tool(
      'remove_product_from_choice',
      'オモイデから商品を削除します（要認証）',
      {
        choiceId: z.number().int().describe('オモイデID'),
        productId: z.number().int().describe('商品ID'),
      },
      withAuthText(async (client, { choiceId, productId }) => {
        await client.removeProductFromChoice(choiceId, productId)
        return '商品をオモイデから削除しました'
      }),
    )

    server.tool(
      'update_choice',
      'オモイデを更新します（要認証）',
      {
        choiceId: z.number().int().describe('オモイデID'),
        title: z.string().optional().describe('オモイデのタイトル'),
        description: z.string().optional().describe('オモイデの説明'),
      },
      withAuth(async (client, { choiceId, title, description }) =>
        client.updateChoice(choiceId, { title, description })
      ),
    )

    server.tool(
      'delete_choice',
      'オモイデを削除します（要認証）',
      {
        choiceId: z.number().int().describe('オモイデID'),
      },
      withAuthText(async (client, { choiceId }) => {
        await client.deleteChoice(choiceId)
        return 'オモイデを削除しました'
      }),
    )

    // ========== Activities ==========
    server.tool(
      'get_activities',
      '認証ユーザーのアクティビティ一覧を取得します（要認証）',
      {
        limit: z.number().int().min(1).max(MAX_LIMIT).optional().describe('取得件数（1-100）'),
      },
      withAuth(async (client, params) => client.getActivities(params)),
    )

    server.tool(
      'get_unread_activities_count',
      '認証ユーザーの未読アクティビティ数を取得します（要認証）',
      {},
      withAuth(async (client) => client.getUnreadActivitiesCount()),
    )
  },
  {
    serverInfo: {
      name: 'suzuri-mcp',
      version: '0.1.0',
    },
  },
  { basePath: '/api' },
)

const verifyToken = async (
  req: Request,
  bearerToken?: string
): Promise<AuthInfo | undefined> => {
  if (!bearerToken) return undefined

  // SUZURIのアクセストークンを検証
  // 実際のトークン検証はSUZURI APIへのリクエストで行う
  try {
    const response = await fetch(SUZURI_API_USER_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      return undefined
    }

    const user = await response.json()

    return {
      token: bearerToken,
      scopes: ['read'],
      clientId: user.id?.toString() || 'unknown',
      extra: {
        userId: user.id,
        userName: user.name,
      },
    }
  } catch {
    return undefined
  }
}

const authHandler = withMcpAuth(handler, verifyToken, {
  required: false, // 認証はオプション（一部ツールのみ必須）
  resourceMetadataPath: '/.well-known/oauth-protected-resource',
})

export { authHandler as GET, authHandler as POST, authHandler as DELETE }

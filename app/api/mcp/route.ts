import { z } from 'zod'
import { createMcpHandler, withMcpAuth } from 'mcp-handler'
import { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js'
import { SuzuriClient } from '@/lib/suzuri-client'

const handler = createMcpHandler(
  (server) => {
    // ========== Items ==========
    server.tool(
      'get_items',
      'SUZURIで取り扱っているアイテム（商品カテゴリ）一覧を取得します（要認証）',
      {
        limit: z.number().int().min(1).max(100).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
      },
      async ({ limit, offset }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.getItems({ limit, offset })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    // ========== Products ==========
    server.tool(
      'get_products',
      'SUZURIの商品一覧を取得します（要認証）',
      {
        limit: z.number().int().min(1).max(100).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
        userId: z.number().int().optional().describe('ユーザーIDで絞り込み'),
        userName: z.string().optional().describe('ユーザー名で絞り込み'),
        itemId: z.number().int().optional().describe('アイテムIDで絞り込み'),
      },
      async ({ limit, offset, userId, userName, itemId }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.getProducts({ limit, offset, userId, userName, itemId })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    server.tool(
      'get_product',
      'SUZURIの商品詳細を取得します（要認証）',
      {
        productId: z.number().int().describe('商品ID'),
      },
      async ({ productId }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.getProduct(productId)
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    server.tool(
      'search_products',
      'SUZURIの商品を検索します（要認証）',
      {
        q: z.string().describe('検索キーワード'),
        limit: z.number().int().min(1).max(100).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
        itemId: z.number().int().optional().describe('アイテムIDで絞り込み'),
      },
      async ({ q, limit, offset, itemId }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.searchProducts({ q, limit, offset, itemId })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    server.tool(
      'get_on_sale_products',
      'SUZURIのセール商品一覧を取得します（要認証）',
      {
        limit: z.number().int().min(1).max(100).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
      },
      async ({ limit, offset }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.getOnSaleProducts({ limit, offset })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    server.tool(
      'get_my_products',
      '認証ユーザーの商品一覧を取得します（要認証）',
      {
        limit: z.number().int().min(1).max(100).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
      },
      async ({ limit, offset }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.getProducts({ limit, offset })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    // ========== Users ==========
    server.tool(
      'get_users',
      'SUZURIのユーザー一覧を取得します（要認証）',
      {
        name: z.string().optional().describe('ユーザー名で検索'),
        limit: z.number().int().min(1).max(100).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
      },
      async ({ name, limit, offset }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.getUsers({ name, limit, offset })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    server.tool(
      'get_user',
      'SUZURIのユーザー詳細を取得します（要認証）',
      {
        userId: z.number().int().describe('ユーザーID'),
      },
      async ({ userId }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.getUser(userId)
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    server.tool(
      'get_me',
      '認証ユーザーの情報を取得します（要認証）',
      {},
      async (_, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.getMe()
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    // ========== Materials ==========
    server.tool(
      'get_materials',
      'SUZURIの素材一覧を取得します（要認証）',
      {
        limit: z.number().int().min(1).max(100).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
        userId: z.number().int().optional().describe('ユーザーIDで絞り込み'),
      },
      async ({ limit, offset, userId }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.getMaterials({ limit, offset, userId })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    server.tool(
      'get_my_materials',
      '認証ユーザーの素材一覧を取得します（要認証）',
      {
        limit: z.number().int().min(1).max(100).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
      },
      async ({ limit, offset }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.getMaterials({ limit, offset })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
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
      async ({ texture, title, description, products }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.createMaterial({ texture, title, description, products })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    server.tool(
      'create_text_material',
      'テキストから素材を作成します（要認証）',
      {
        text: z.string().describe('テキスト'),
        itemVariantId: z.number().int().optional().describe('アイテムバリアントID'),
      },
      async ({ text, itemVariantId }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.createTextMaterial({ text, itemVariantId })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    server.tool(
      'update_material',
      '素材を更新します（要認証）',
      {
        materialId: z.number().int().describe('素材ID'),
        title: z.string().optional().describe('素材のタイトル'),
        description: z.string().optional().describe('素材の説明'),
      },
      async ({ materialId, title, description }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.updateMaterial(materialId, { title, description })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    server.tool(
      'delete_material',
      '素材を削除します（要認証）',
      {
        materialId: z.number().int().describe('素材ID'),
      },
      async ({ materialId }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        await client.deleteMaterial(materialId)
        return {
          content: [{ type: 'text', text: '素材を削除しました' }],
        }
      },
    )

    // ========== Favorites ==========
    server.tool(
      'get_product_favorites',
      '商品のお気に入り（ズッキュン）一覧を取得します（要認証）',
      {
        productId: z.number().int().describe('商品ID'),
        limit: z.number().int().min(1).max(100).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
      },
      async ({ productId, limit, offset }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.getProductFavorites(productId, { limit, offset })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    server.tool(
      'get_user_favorites',
      'ユーザーのお気に入り（ズッキュン）一覧を取得します（要認証）',
      {
        userId: z.number().int().describe('ユーザーID'),
        limit: z.number().int().min(1).max(100).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
      },
      async ({ userId, limit, offset }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.getUserFavorites(userId, { limit, offset })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    server.tool(
      'add_favorite',
      '商品をお気に入り（ズッキュン）に追加します（要認証）',
      {
        productId: z.number().int().describe('商品ID'),
        anonymouse: z.boolean().optional().describe('匿名でお気に入りするか'),
        count: z.number().int().optional().describe('お気に入りの数'),
      },
      async ({ productId, anonymouse, count }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.addFavorite(productId, { anonymouse, count })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    server.tool(
      'remove_favorite',
      '商品のお気に入り（ズッキュン）を削除します（要認証）',
      {
        productId: z.number().int().describe('商品ID'),
      },
      async ({ productId }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        await client.removeFavorite(productId)
        return {
          content: [{ type: 'text', text: 'お気に入りを削除しました' }],
        }
      },
    )

    // ========== Choices ==========
    server.tool(
      'get_choices',
      'SUZURIのオモイデ一覧を取得します（要認証）',
      {
        limit: z.number().int().min(1).max(100).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
        userId: z.number().int().optional().describe('ユーザーIDで絞り込み'),
        userName: z.string().optional().describe('ユーザー名で絞り込み'),
      },
      async ({ limit, offset, userId, userName }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.getChoices({ limit, offset, userId, userName })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    server.tool(
      'get_choice',
      'SUZURIのオモイデ詳細を取得します（要認証）',
      {
        choiceId: z.number().int().describe('オモイデID'),
      },
      async ({ choiceId }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.getChoice(choiceId)
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    server.tool(
      'get_choice_products',
      'SUZURIのオモイデに含まれる商品一覧を取得します（要認証）',
      {
        choiceId: z.number().int().describe('オモイデID'),
        limit: z.number().int().min(1).max(100).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
      },
      async ({ choiceId, limit, offset }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.getChoiceProducts(choiceId, { limit, offset })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    server.tool(
      'create_choice',
      'オモイデを作成します（要認証）',
      {
        title: z.string().describe('オモイデのタイトル'),
        description: z.string().optional().describe('オモイデの説明'),
      },
      async ({ title, description }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.createChoice({ title, description })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    server.tool(
      'add_product_to_choice',
      'オモイデに商品を追加します（要認証）',
      {
        choiceId: z.number().int().describe('オモイデID'),
        productId: z.number().int().describe('商品ID'),
      },
      async ({ choiceId, productId }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        await client.addProductToChoice(choiceId, productId)
        return {
          content: [{ type: 'text', text: '商品をオモイデに追加しました' }],
        }
      },
    )

    server.tool(
      'remove_product_from_choice',
      'オモイデから商品を削除します（要認証）',
      {
        choiceId: z.number().int().describe('オモイデID'),
        productId: z.number().int().describe('商品ID'),
      },
      async ({ choiceId, productId }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        await client.removeProductFromChoice(choiceId, productId)
        return {
          content: [{ type: 'text', text: '商品をオモイデから削除しました' }],
        }
      },
    )

    server.tool(
      'update_choice',
      'オモイデを更新します（要認証）',
      {
        choiceId: z.number().int().describe('オモイデID'),
        title: z.string().optional().describe('オモイデのタイトル'),
        description: z.string().optional().describe('オモイデの説明'),
      },
      async ({ choiceId, title, description }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.updateChoice(choiceId, { title, description })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    server.tool(
      'delete_choice',
      'オモイデを削除します（要認証）',
      {
        choiceId: z.number().int().describe('オモイデID'),
      },
      async ({ choiceId }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        await client.deleteChoice(choiceId)
        return {
          content: [{ type: 'text', text: 'オモイデを削除しました' }],
        }
      },
    )

    // ========== Activities ==========
    server.tool(
      'get_activities',
      '認証ユーザーのアクティビティ一覧を取得します（要認証）',
      {
        limit: z.number().int().min(1).max(100).optional().describe('取得件数（1-100）'),
      },
      async ({ limit }, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.getActivities({ limit })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    server.tool(
      'get_unread_activities_count',
      '認証ユーザーの未読アクティビティ数を取得します（要認証）',
      {},
      async (_, { authInfo }) => {
        if (!authInfo?.token) {
          return {
            content: [{ type: 'text', text: 'エラー: 認証が必要です' }],
            isError: true,
          }
        }
        const client = new SuzuriClient(authInfo.token)
        const result = await client.getUnreadActivitiesCount()
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
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
    const response = await fetch('https://suzuri.jp/api/v1/user', {
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

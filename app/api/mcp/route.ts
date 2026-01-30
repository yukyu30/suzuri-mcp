import { z } from 'zod'
import { createMcpHandler, withMcpAuth } from 'mcp-handler'
import { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js'
import { SuzuriClient } from '@/lib/suzuri-client'

const handler = createMcpHandler(
  (server) => {
    server.tool(
      'get_items',
      'SUZURIで取り扱っているアイテム（商品カテゴリ）一覧を取得します',
      {
        limit: z.number().int().min(1).max(100).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
      },
      async ({ limit, offset }) => {
        const client = new SuzuriClient()
        const result = await client.getItems({ limit, offset })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      },
    )

    server.tool(
      'get_products',
      'SUZURIの商品一覧を取得します',
      {
        limit: z.number().int().min(1).max(100).optional().describe('取得件数（1-100）'),
        offset: z.number().int().min(0).optional().describe('オフセット'),
        userId: z.number().int().optional().describe('ユーザーIDで絞り込み'),
        userName: z.string().optional().describe('ユーザー名で絞り込み'),
        itemId: z.number().int().optional().describe('アイテムIDで絞り込み'),
      },
      async ({ limit, offset, userId, userName, itemId }) => {
        const client = new SuzuriClient()
        const result = await client.getProducts({ limit, offset, userId, userName, itemId })
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

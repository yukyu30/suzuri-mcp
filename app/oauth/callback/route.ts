import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// 認可コードを一時保存（本番環境ではRedis等を使用）
const authorizationCodes = new Map<string, {
  suzuriCode: string
  clientId: string
  redirectUri: string
  codeChallenge?: string
  codeChallengeMethod?: string
  createdAt: number
}>()

export { authorizationCodes }

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const suzuriCode = searchParams.get('code')
  const encodedState = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.json(
      { error, error_description: searchParams.get('error_description') },
      { status: 400 }
    )
  }

  if (!suzuriCode || !encodedState) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'Missing code or state' },
      { status: 400 }
    )
  }

  // stateをデコード
  let mcpState: {
    originalState?: string
    clientId: string
    redirectUri: string
    codeChallenge?: string
    codeChallengeMethod?: string
  }

  try {
    mcpState = JSON.parse(Buffer.from(encodedState, 'base64url').toString())
  } catch {
    return NextResponse.json(
      { error: 'invalid_state', error_description: 'Failed to decode state' },
      { status: 400 }
    )
  }

  // 新しい認可コードを生成
  const mcpCode = 'mcp_' + crypto.randomBytes(32).toString('hex')

  // SUZURIの認可コードを保存
  authorizationCodes.set(mcpCode, {
    suzuriCode,
    clientId: mcpState.clientId,
    redirectUri: mcpState.redirectUri,
    codeChallenge: mcpState.codeChallenge,
    codeChallengeMethod: mcpState.codeChallengeMethod,
    createdAt: Date.now(),
  })

  // MCPクライアントにリダイレクト
  const redirectUrl = new URL(mcpState.redirectUri)
  redirectUrl.searchParams.set('code', mcpCode)
  if (mcpState.originalState) {
    redirectUrl.searchParams.set('state', mcpState.originalState)
  }

  return NextResponse.redirect(redirectUrl.toString())
}

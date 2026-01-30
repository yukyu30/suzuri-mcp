import { NextRequest, NextResponse } from 'next/server'

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

  // MCPクライアントにリダイレクト
  // サーバーレス環境ではMapが共有されないため、SUZURIの認可コードを直接パススルー
  const redirectUrl = new URL(mcpState.redirectUri)
  redirectUrl.searchParams.set('code', suzuriCode)
  if (mcpState.originalState) {
    redirectUrl.searchParams.set('state', mcpState.originalState)
  }

  return NextResponse.redirect(redirectUrl.toString())
}

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const clientId = searchParams.get('client_id')
  const redirectUri = searchParams.get('redirect_uri')
  const responseType = searchParams.get('response_type')
  const scope = searchParams.get('scope') || 'read'
  const state = searchParams.get('state')
  const codeChallenge = searchParams.get('code_challenge')
  const codeChallengeMethod = searchParams.get('code_challenge_method')

  if (!clientId || !redirectUri || responseType !== 'code') {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'Missing required parameters' },
      { status: 400 }
    )
  }

  // SUZURI OAuth認可エンドポイントにリダイレクト
  const suzuriClientId = process.env.SUZURI_CLIENT_ID
  if (!suzuriClientId) {
    return NextResponse.json(
      { error: 'server_error', error_description: 'SUZURI_CLIENT_ID not configured' },
      { status: 500 }
    )
  }

  // stateにMCPクライアント情報を含める
  const mcpState = JSON.stringify({
    originalState: state,
    clientId,
    redirectUri,
    codeChallenge,
    codeChallengeMethod,
  })
  const encodedState = Buffer.from(mcpState).toString('base64url')

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  const suzuriAuthUrl = new URL('https://suzuri.jp/oauth/authorize')
  suzuriAuthUrl.searchParams.set('client_id', suzuriClientId)
  suzuriAuthUrl.searchParams.set('redirect_uri', `${baseUrl}/oauth/callback`)
  suzuriAuthUrl.searchParams.set('response_type', 'code')
  suzuriAuthUrl.searchParams.set('scope', scope)
  suzuriAuthUrl.searchParams.set('state', encodedState)

  return NextResponse.redirect(suzuriAuthUrl.toString())
}

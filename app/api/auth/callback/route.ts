import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken } from '@/lib/suzuri-oauth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.json(
      { error: error, description: searchParams.get('error_description') },
      { status: 400 }
    )
  }

  if (!code) {
    return NextResponse.json(
      { error: 'missing_code', description: '認可コードがありません' },
      { status: 400 }
    )
  }

  const clientId = process.env.SUZURI_CLIENT_ID
  const clientSecret = process.env.SUZURI_CLIENT_SECRET
  const redirectUri = process.env.SUZURI_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: 'server_error', description: 'OAuth設定が不完全です' },
      { status: 500 }
    )
  }

  try {
    const tokenResponse = await exchangeCodeForToken({
      code,
      clientId,
      clientSecret,
      redirectUri,
    })

    // Claudeにトークンを返す
    // Claude.aiのauth_callbackにリダイレクトする場合は
    // そちらにトークンを渡す必要がある
    return NextResponse.json({
      access_token: tokenResponse.access_token,
      token_type: tokenResponse.token_type,
      expires_in: tokenResponse.expires_in,
      state,
    })
  } catch (error) {
    console.error('Token exchange error:', error)
    return NextResponse.json(
      { error: 'token_error', description: 'トークン取得に失敗しました' },
      { status: 500 }
    )
  }
}

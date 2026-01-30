import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') || ''

  let body: Record<string, string> = {}

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData()
    formData.forEach((value, key) => {
      body[key] = value.toString()
    })
  } else if (contentType.includes('application/json')) {
    body = await request.json()
  } else {
    // Try form data anyway
    try {
      const text = await request.text()
      const params = new URLSearchParams(text)
      params.forEach((value, key) => {
        body[key] = value
      })
    } catch {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Unsupported content type' },
        { status: 400 }
      )
    }
  }

  const grantType = body.grant_type
  const code = body.code
  const redirectUri = body.redirect_uri
  const clientId = body.client_id

  if (grantType !== 'authorization_code') {
    return NextResponse.json(
      { error: 'unsupported_grant_type' },
      { status: 400 }
    )
  }

  if (!code || !redirectUri || !clientId) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'Missing required parameters' },
      { status: 400 }
    )
  }

  // SUZURIからトークンを取得
  const suzuriClientId = process.env.SUZURI_CLIENT_ID
  const suzuriClientSecret = process.env.SUZURI_CLIENT_SECRET
  const baseUrl = process.env.APP_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  if (!suzuriClientId || !suzuriClientSecret) {
    return NextResponse.json(
      { error: 'server_error', error_description: 'SUZURI credentials not configured' },
      { status: 500 }
    )
  }

  // callbackからパススルーされたSUZURIの認可コードを使用
  const suzuriCode = code

  try {
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: suzuriCode,
      redirect_uri: `${baseUrl}/oauth/callback`,
      client_id: suzuriClientId,
      client_secret: suzuriClientSecret,
    })

    const tokenResponse = await fetch('https://suzuri.jp/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString(),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('SUZURI token error:', errorData)
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Failed to exchange code with SUZURI' },
        { status: 400 }
      )
    }

    const tokenData = await tokenResponse.json()

    return NextResponse.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type || 'Bearer',
      expires_in: tokenData.expires_in || 3600,
      refresh_token: tokenData.refresh_token,
      scope: tokenData.scope || 'read',
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Token exchange error:', error)
    return NextResponse.json(
      { error: 'server_error', error_description: 'Failed to exchange token' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

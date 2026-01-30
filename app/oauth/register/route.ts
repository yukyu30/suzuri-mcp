import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// メモリ内ストレージ（本番環境ではRedis等を使用）
const dynamicClients = new Map<string, {
  clientId: string
  clientSecret: string
  redirectUris: string[]
  clientName?: string
  createdAt: number
}>()

// グローバルにエクスポートして他のエンドポイントから参照
export { dynamicClients }

function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const clientId = 'dyn_' + generateRandomString(16)
    const clientSecret = 'secret_' + generateRandomString(32)

    const clientInfo = {
      clientId,
      clientSecret,
      redirectUris: body.redirect_uris || [],
      clientName: body.client_name,
      createdAt: Date.now(),
    }

    dynamicClients.set(clientId, clientInfo)

    return NextResponse.json({
      client_id: clientId,
      client_secret: clientSecret,
      client_id_issued_at: Math.floor(clientInfo.createdAt / 1000),
      client_secret_expires_at: 0, // never expires
      redirect_uris: clientInfo.redirectUris,
      client_name: clientInfo.clientName,
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'client_secret_post',
    }, {
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Client registration error:', error)
    return NextResponse.json(
      { error: 'invalid_client_metadata' },
      { status: 400 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

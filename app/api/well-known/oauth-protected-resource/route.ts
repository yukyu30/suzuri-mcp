import { NextResponse } from 'next/server'

export async function GET() {
  // 本番環境では APP_URL を使用（VERCEL_URL はデプロイ固有のURL）
  const baseUrl = process.env.APP_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  // RFC 9728: OAuth 2.0 Protected Resource Metadata
  // MCPクライアントに対して、このリソースの認可サーバーを通知
  const metadata = {
    resource: `${baseUrl}/api/mcp`,
    authorization_servers: [`${baseUrl}/.well-known/oauth-authorization-server`],
    scopes_supported: ['read', 'write'],
    bearer_methods_supported: ['header'],
  }

  return NextResponse.json(metadata, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

import { jsonResponse } from '@/lib/http-response'

export async function GET() {
  // 本番環境では APP_URL を使用（VERCEL_URL はデプロイ固有のURL）
  const baseUrl = process.env.APP_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  // RFC 9728: OAuth 2.0 Protected Resource Metadata
  // authorization_servers は issuer URL (baseUrl) を入れる。
  // MCP SDK は受け取った URL に /.well-known/oauth-authorization-server を
  // 付けてメタデータを取りに来るため、メタデータURLを入れると二重パスで404になる。
  const metadata = {
    resource: `${baseUrl}/api/mcp`,
    authorization_servers: [baseUrl],
    scopes_supported: ['read', 'write'],
    bearer_methods_supported: ['header'],
  }

  return jsonResponse(metadata, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

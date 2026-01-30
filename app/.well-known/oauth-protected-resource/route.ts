import { NextResponse } from 'next/server'

export async function GET() {
  const metadata = {
    resource: process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/mcp`
      : 'http://localhost:3000/api/mcp',
    authorization_servers: [
      {
        issuer: 'https://suzuri.jp',
        authorization_endpoint: 'https://suzuri.jp/oauth/authorize',
        token_endpoint: 'https://suzuri.jp/oauth/token',
      }
    ],
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

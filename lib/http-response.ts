// Next.js 16.1 では NextResponse / Response.json() を return すると
// Turbopack ランタイムが「No response is returned from route handler」エラーを
// 出して 500 を返す。Web 標準の Response コンストラクタ経由なら影響を受けない。
export const jsonResponse = (data: unknown, init: ResponseInit = {}): Response => {
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return new Response(JSON.stringify(data), { ...init, headers })
}

export const redirectResponse = (url: string, status = 302): Response => {
  return new Response(null, {
    status,
    headers: { Location: url },
  })
}

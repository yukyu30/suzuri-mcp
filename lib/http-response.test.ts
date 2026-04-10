import { describe, it, expect } from 'vitest'
import { jsonResponse, redirectResponse } from './http-response'

describe('jsonResponse', () => {
  it('JSONボディとContent-Typeを返す', async () => {
    const res = jsonResponse({ ok: true })
    expect(res.headers.get('Content-Type')).toBe('application/json')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })

  it('initでstatusと追加ヘッダを設定できる', async () => {
    const res = jsonResponse({ error: 'bad' }, {
      status: 400,
      headers: { 'X-Custom': 'value' },
    })
    expect(res.status).toBe(400)
    expect(res.headers.get('X-Custom')).toBe('value')
    expect(res.headers.get('Content-Type')).toBe('application/json')
    expect(await res.json()).toEqual({ error: 'bad' })
  })
})

describe('redirectResponse', () => {
  it('Locationヘッダで302リダイレクトを返す', () => {
    const res = redirectResponse('https://example.com/next')
    expect(res.status).toBe(302)
    expect(res.headers.get('Location')).toBe('https://example.com/next')
  })

  it('statusを指定できる', () => {
    const res = redirectResponse('https://example.com/next', 307)
    expect(res.status).toBe(307)
  })
})

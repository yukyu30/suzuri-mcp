import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SuzuriOAuth, generateAuthUrl, exchangeCodeForToken } from './suzuri-oauth'

describe('SuzuriOAuth', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('generateAuthUrl', () => {
    it('OAuth2認可URLを生成できる', () => {
      const url = generateAuthUrl({
        clientId: 'test-client-id',
        redirectUri: 'https://example.com/callback',
        scope: 'read write',
      })

      expect(url).toContain('https://suzuri.jp/oauth/authorize')
      expect(url).toContain('client_id=test-client-id')
      expect(url).toContain('redirect_uri=https%3A%2F%2Fexample.com%2Fcallback')
      expect(url).toContain('scope=read+write')
      expect(url).toContain('response_type=code')
    })
  })

  describe('exchangeCodeForToken', () => {
    it('認可コードからアクセストークンを取得できる', async () => {
      const mockTokenResponse = {
        access_token: 'test-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'test-refresh-token',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      })

      const result = await exchangeCodeForToken({
        code: 'auth-code',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        redirectUri: 'https://example.com/callback',
      })

      expect(result).toEqual(mockTokenResponse)
      expect(fetch).toHaveBeenCalledWith(
        'https://suzuri.jp/oauth/token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        })
      )
    })

    it('トークン取得失敗時に適切なエラーを返す', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      })

      await expect(
        exchangeCodeForToken({
          code: 'invalid-code',
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          redirectUri: 'https://example.com/callback',
        })
      ).rejects.toThrow('Failed to exchange code for token: 401 Unauthorized')
    })
  })
})

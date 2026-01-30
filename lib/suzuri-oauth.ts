const SUZURI_OAUTH_BASE = 'https://suzuri.jp/oauth'

export interface GenerateAuthUrlParams {
  clientId: string
  redirectUri: string
  scope: string
  state?: string
}

export interface ExchangeCodeParams {
  code: string
  clientId: string
  clientSecret: string
  redirectUri: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
}

export interface RefreshTokenParams {
  refreshToken: string
  clientId: string
  clientSecret: string
}

export function generateAuthUrl(params: GenerateAuthUrlParams): string {
  const searchParams = new URLSearchParams({
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    scope: params.scope,
    response_type: 'code',
  })

  if (params.state) {
    searchParams.set('state', params.state)
  }

  return `${SUZURI_OAUTH_BASE}/authorize?${searchParams.toString()}`
}

export async function exchangeCodeForToken(
  params: ExchangeCodeParams
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: params.code,
    redirect_uri: params.redirectUri,
    client_id: params.clientId,
    client_secret: params.clientSecret,
  })

  const response = await fetch(`${SUZURI_OAUTH_BASE}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!response.ok) {
    throw new Error(
      `Failed to exchange code for token: ${response.status} ${response.statusText}`
    )
  }

  return response.json()
}

export async function refreshAccessToken(
  params: RefreshTokenParams
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: params.refreshToken,
    client_id: params.clientId,
    client_secret: params.clientSecret,
  })

  const response = await fetch(`${SUZURI_OAUTH_BASE}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!response.ok) {
    throw new Error(
      `Failed to refresh token: ${response.status} ${response.statusText}`
    )
  }

  return response.json()
}

export class SuzuriOAuth {
  constructor(
    private clientId: string,
    private clientSecret: string,
    private redirectUri: string
  ) {}

  generateAuthUrl(scope: string, state?: string): string {
    return generateAuthUrl({
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      scope,
      state,
    })
  }

  async exchangeCode(code: string): Promise<TokenResponse> {
    return exchangeCodeForToken({
      code,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectUri: this.redirectUri,
    })
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    return refreshAccessToken({
      refreshToken,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
    })
  }
}

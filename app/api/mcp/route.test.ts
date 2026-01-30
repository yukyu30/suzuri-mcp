import { describe, it, expect } from 'vitest'

describe('MCP Handler', () => {
  it('MCPハンドラーが正しくエクスポートされる', async () => {
    const { GET, POST, DELETE } = await import('./route')

    expect(GET).toBeDefined()
    expect(POST).toBeDefined()
    expect(DELETE).toBeDefined()
  })
})

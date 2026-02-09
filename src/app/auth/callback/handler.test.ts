import { resolveCallbackRedirect } from './handler'

describe('resolveCallbackRedirect', () => {
  it('redirects to error when code is missing', () => {
    const result = resolveCallbackRedirect({
      url: 'http://localhost:3000/auth/callback'
    })

    expect(result).toBe('http://localhost:3000/auth/auth-code-error')
  })

  it('redirects to safe next path when code exists', () => {
    const result = resolveCallbackRedirect({
      url: 'http://localhost:3000/auth/callback?code=123&next=/dashboard'
    })

    expect(result).toBe('http://localhost:3000/dashboard')
  })

  it('prevents external redirect', () => {
    const result = resolveCallbackRedirect({
      url: 'http://localhost:3000/auth/callback?code=123&next=https://evil.com'
    })

    expect(result).toBe('http://localhost:3000/')
  })
})

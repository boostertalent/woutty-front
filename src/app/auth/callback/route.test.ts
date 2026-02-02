// Import du handler GET
import { GET } from './route'

// Mock de NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    redirect: jest.fn((url: string) => ({ redirectedTo: url })),
  },
}))

// Mock des cookies Next.js
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
  }),
}))

describe('GET /auth/callback', () => {

  it('redirige vers login si aucun code OAuth', async () => {

    // Création d'une requête sans paramètre "code"
    const request = new Request(
      'http://localhost/auth/callback'
    )

    // Appel du handler
    const response: any = await GET(request)

    // Vérification de la redirection
    expect(response.redirectedTo).toContain(
      '/auth/login?error=auth_failed'
    )
  })

})

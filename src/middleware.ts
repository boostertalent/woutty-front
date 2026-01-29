import { createServerClient, type NextRequest } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// 1. L'exportation doit impérativement s'appeler "middleware"
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Rafraîchit le token de session
  const { data: { user } } = await supabase.auth.getUser()

  // PROTECTION DES ROUTES : Si l'utilisateur essaie d'aller sur le dashboard sans être connecté
  if (!user && request.nextUrl.pathname.startsWith('/brands/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

// 2. Le matcher définit sur quelles pages le middleware s'exécute
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf celles commençant par :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico (icône du site)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // On crée une réponse initiale
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
        set(name: string, value: string, options: CookieOptions) {
          // On met à jour la requête ET la réponse pour que le cookie soit 
          // disponible immédiatement et envoyé au navigateur
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
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

  // IMPORTANT : getUser() rafraîchit la session automatiquement si nécessaire
  const { data: { user } } = await supabase.auth.getUser()

  // PROTECTION DES ROUTES
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/brands/dashboard')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')

  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Optionnel : Rediriger un utilisateur déjà connecté qui essaie d'aller sur /login
  if (user && isAuthRoute && request.nextUrl.pathname === '/auth/login') {
    return NextResponse.redirect(new URL('/brands/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
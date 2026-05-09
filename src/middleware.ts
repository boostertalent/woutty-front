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

  const { data: { user } } = await supabase.auth.getUser()

  // PROTECTION DES ROUTES
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/brands/dashboard')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')

  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Si l'utilisateur est déjà connecté, on ne redirige vers un dashboard
  // que s'il possède un profil complet (admin / createur / marque).
  // Sinon, on le laisse sur `/auth/login` (ex: OAuth sans inscription).
  if (user && isAuthRoute && request.nextUrl.pathname === '/auth/login') {
    const userId = user.id

    // 1) Admin secondaire
    const { data: adminData } = await supabase
      .from('admin')
      .select('id_w, role')
      .eq('id_w', userId)
      .maybeSingle()

    if (adminData) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    // 2) Créateur
    const { data: creatorData } = await supabase
      .from('createur')
      .select('id_w, role')
      .eq('id_w', userId)
      .maybeSingle()

    if (creatorData) {
      const path = creatorData.role === 'admin' ? '/admin/dashboard' : '/creators/dashboard'
      return NextResponse.redirect(new URL(path, request.url))
    }

    // 3) Marque/Entreprise
    const { data: brandData } = await supabase
      .from('marque')
      .select('id_w')
      .eq('id_w', userId)
      .maybeSingle()

    if (brandData) {
      return NextResponse.redirect(new URL('/brands/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
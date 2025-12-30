import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/creators/dashboard'

  if (code) {
    const cookieStore = await cookies()
    
    
    const response = NextResponse.redirect(`${origin}${next}`)

    // initialise Supabase avec une gestion stricte des cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

  
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      
      response.headers.set('Cache-Control', 'no-store, max-age=0')
      return response
    }

    console.error("Erreur d'échange de session:", error)
  }

  // Retour au login avec une erreur explicite pour le débug
  return NextResponse.redirect(`${origin}/creators/auth/login?error=auth_exchange_failed`)
}
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/' // Pourrait être utilisé pour rediriger précisément

  if (code) {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // 1. Échange du code contre une session
    const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!authError && authData.user) {
      const user = authData.user;

      // 2. MAGIE : On crée ou on met à jour le profil (évite l'erreur de clé étrangère)
      // On récupère le rôle passé dans l'URL (si tu l'as ajouté) ou on met 'creator' par défaut
      const roleFromUrl = searchParams.get('role') || 'creator';

      const { data: profile, error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata.full_name || 'Utilisateur Google',
          avatar_url: user.user_metadata.avatar_url,
          role: roleFromUrl, // Très important pour la redirection suivante
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
        .select()
        .single();

      // 3. Détermination de la redirection basée sur le profil fraîchement créé/récupéré
      let nextUrl = '/auth'
      
      if (profile) {
        if (profile.role === 'brand') nextUrl = '/brands/dashboard'
        else if (profile.role === 'creator') nextUrl = '/creators/dashboard'
        else if (profile.role === 'admin') nextUrl = '/admin/dashboard'
      }

      const finalResponse = NextResponse.redirect(`${origin}${nextUrl}`)
      finalResponse.headers.set('Cache-Control', 'no-store, max-age=0')
      return finalResponse
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
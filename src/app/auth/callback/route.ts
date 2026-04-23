import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

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

    const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!authError && authData.user) {
      const user = authData.user;

      // 1. Vérifier admin secondaire
      const { data: adminData } = await supabase
        .from('admin')
        .select('id_w, role')
        .eq('id_w', user.id)
        .maybeSingle();
      if (adminData) {
        return NextResponse.redirect(`${origin}/admin/dashboard`);
      }

      // 2. Vérifier créateur
      const { data: creatorData } = await supabase
        .from('createur')
        .select('id_w, role')
        .eq('id_w', user.id)
        .maybeSingle();
      if (creatorData) {
        const path = creatorData.role === 'admin' ? '/admin/dashboard' : '/creators/dashboard';
        return NextResponse.redirect(`${origin}${path}`);
      }

      // 3. Vérifier marque
      const { data: brandData } = await supabase
        .from('marque')
        .select('id_w')
        .eq('id_w', user.id)
        .maybeSingle();
      if (brandData) {
        return NextResponse.redirect(`${origin}/brands/dashboard`);
      }

      return NextResponse.redirect(`${origin}/auth/login?error=profile_not_found`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
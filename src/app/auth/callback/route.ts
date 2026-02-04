import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // On récupère le rôle souhaité depuis l'URL (par défaut 'creator')
  const roleFromUrl = searchParams.get('role') || 'creator'

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

    // 1. Échange du code Google contre une session
    const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!authError && authData.user) {
      const user = authData.user;
      let targetTable = '';
      let redirectPath = '/auth';

      // 2. RECHERCHE DES PROFILS EXISTANTS
      // On cherche d'abord dans 'createur' avec id_w
      const { data: isCreator } = await supabase
        .from('createur')
        .select('id_w')
        .eq('id_w', user.id)
        .maybeSingle();
      
      if (isCreator) {
        targetTable = 'createur';
        redirectPath = '/creators/dashboard';
      } else {
        // Sinon on cherche dans 'marque' (vérifier si c'est id ou id_w ici aussi)
        const { data: isBrand } = await supabase
          .from('marque')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (isBrand) {
          targetTable = 'marque';
          redirectPath = '/brands/dashboard';
        }
      }

      // 3. INSCRIPTION (si l'utilisateur est nouveau)
      if (!targetTable) {
        targetTable = roleFromUrl === 'brand' ? 'marque' : 'createur';
        redirectPath = roleFromUrl === 'brand' ? '/brands/dashboard' : '/creators/dashboard';

        // Construction de l'objet de données
        const insertData: any = {
          email: user.email,
          full_name: user.user_metadata.full_name || 'Utilisateur Google',
          avatar_url: user.user_metadata.avatar_url,
        };

        // On adapte la clé d'ID selon la table cible
        let conflictColumn = 'id';
        if (targetTable === 'createur') {
          insertData.id_w = user.id; 
          conflictColumn = 'id_w';
        } else {
          insertData.id = user.id; 
          conflictColumn = 'id';
        }

        const { error: upsertError } = await supabase
          .from(targetTable)
          .upsert(insertData, { onConflict: conflictColumn });

        if (upsertError) {
            console.error("Erreur lors de la création du profil Google:", upsertError);
            // Si erreur RLS ici, c'est que la Policy d'INSERT manque encore
            return NextResponse.redirect(`${origin}/auth/login?error=db_error`);
        }
      }

      // 4. Redirection finale vers le bon Dashboard
      const finalResponse = NextResponse.redirect(`${origin}${redirectPath}`)
      finalResponse.headers.set('Cache-Control', 'no-store, max-age=0')
      return finalResponse
    }
  }

  // En cas d'échec total
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
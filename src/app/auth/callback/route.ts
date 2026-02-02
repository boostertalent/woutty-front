// Import du client Supabase côté serveur (SSR)
import { createServerClient, type CookieOptions } from '@supabase/ssr'

// Import de l'API cookies de Next.js (App Router)
import { cookies } from 'next/headers'

// Utilisé pour gérer les redirections HTTP
import { NextResponse } from 'next/server'

// Handler GET appelé lors du callback OAuth Google
export async function GET(request: Request) {

  // On extrait les paramètres de l'URL (code OAuth, role, origin)
  const { searchParams, origin } = new URL(request.url)

  // Code OAuth retourné par Google
  const code = searchParams.get('code')

  // Rôle optionnel passé dans l'URL (creator par défaut)
  const roleFromUrl = searchParams.get('role') || 'creator'

  // Si aucun code OAuth → échec direct
  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
  }

  // Accès au cookie store Next.js
  const cookieStore = cookies()

  // Création du client Supabase avec gestion des cookies SSR
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Lire un cookie
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // Écrire un cookie
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        // Supprimer un cookie
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 1️⃣ Échange du code OAuth contre une session Supabase
  const { data: authData, error: authError } =
    await supabase.auth.exchangeCodeForSession(code)

  // Si erreur d'authentification
  if (authError || !authData?.user) {
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
  }

  // Utilisateur Supabase authentifié
  const user = authData.user

  // Table cible et redirection par défaut
  let targetTable: 'createur' | 'marque' | null = null
  let redirectPath = '/auth'

  // 2️⃣ Vérification si le profil existe déjà côté "createur"
  const { data: existingCreator } = await supabase
    .from('createur')
    .select('id_w')
    .eq('id_w', user.id)
    .maybeSingle()

  if (existingCreator) {
    targetTable = 'createur'
    redirectPath = '/creators/dashboard'
  } else {
    // Sinon, on vérifie côté "marque"
    const { data: existingBrand } = await supabase
      .from('marque')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (existingBrand) {
      targetTable = 'marque'
      redirectPath = '/brands/dashboard'
    }
  }

  // 3️⃣ Création du profil si l'utilisateur est nouveau
  if (!targetTable) {

    // Détermination du rôle final
    targetTable = roleFromUrl === 'brand' ? 'marque' : 'createur'
    redirectPath =
      targetTable === 'marque'
        ? '/brands/dashboard'
        : '/creators/dashboard'

    // Données communes au profil
    const insertData: any = {
      email: user.email,
      full_name: user.user_metadata?.full_name || 'Utilisateur Google',
      avatar_url: user.user_metadata?.avatar_url || null,
    }

    // Clé primaire différente selon la table
    let conflictColumn: 'id' | 'id_w' = 'id'

    if (targetTable === 'createur') {
      insertData.id_w = user.id
      conflictColumn = 'id_w'
    } else {
      insertData.id = user.id
      conflictColumn = 'id'
    }

    // Insertion ou mise à jour sécurisée
    const { error: upsertError } = await supabase
      .from(targetTable)
      .upsert(insertData, { onConflict: conflictColumn })

    // Erreur DB (souvent RLS mal configurée)
    if (upsertError) {
      console.error('Erreur création profil Google :', upsertError)
      return NextResponse.redirect(`${origin}/auth/login?error=db_error`)
    }
  }

  // 4️⃣ Redirection finale vers le bon dashboard
  const response = NextResponse.redirect(`${origin}${redirectPath}`)

  // Désactive toute mise en cache
  response.headers.set('Cache-Control', 'no-store, max-age=0')

  return response
}

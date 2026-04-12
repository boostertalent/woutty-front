import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()

  // Vérifier que l'utilisateur est authentifié et admin
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options: CookieOptions) => { cookieStore.set({ name, value, ...options }) },
        remove: (name, options: CookieOptions) => { cookieStore.set({ name, value: '', ...options }) },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const [{ data: creatorCheck }, { data: adminCheck }] = await Promise.all([
    supabase.from('createur').select('role').eq('id_w', user.id).maybeSingle(),
    supabase.from('admin').select('id_w').eq('id_w', user.id).maybeSingle(),
  ])

  if (creatorCheck?.role !== 'admin' && !adminCheck) {
    return NextResponse.json({ error: 'Accès réservé aux admins' }, { status: 403 })
  }

  // Récupérer le chemin de la vidéo
  const adminClient = createAdminClient()
  const { data: submission, error } = await adminClient
    .from('campaign_submissions')
    .select('video_path')
    .eq('id', id)
    .single()

  if (error || !submission?.video_path) {
    return NextResponse.json({ error: 'Soumission introuvable' }, { status: 404 })
  }

  // Générer le lien signé (valide 24h)
  const { data: signedData, error: signError } = await adminClient.storage
    .from('validation-videos')
    .createSignedUrl(submission.video_path, 60 * 60 * 24)

  if (signError || !signedData) {
    return NextResponse.json({ error: 'Impossible de générer le lien vidéo' }, { status: 500 })
  }

  return NextResponse.json({ signedUrl: signedData.signedUrl })
}

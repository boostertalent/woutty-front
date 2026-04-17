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
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => { cookieStore.set({ name, value, ...options }) },
        remove: (name: string, options: CookieOptions) => { cookieStore.set({ name, value: '', ...options }) },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const [{ data: creatorCheck }, { data: adminCheck }, { data: brandCheck }] = await Promise.all([
    supabase.from('createur').select('role').eq('id_w', user.id).maybeSingle(),
    supabase.from('admin').select('id_w').eq('id_w', user.id).maybeSingle(),
    supabase.from('marque').select('id_w').eq('id_w', user.id).maybeSingle(),
  ])

  const isAdmin = creatorCheck?.role === 'admin' || !!adminCheck
  const isBrand = !!brandCheck

  if (!isAdmin && !isBrand) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
  }

  const adminClient = createAdminClient()

  // Récupérer la soumission
  const { data: submission, error } = await adminClient
    .from('campaign_submissions')
    .select('video_path, campaign_id')
    .eq('id', id)
    .single()

  // Si c'est une marque, vérifier que la soumission appartient bien à une de ses campagnes
  if (isBrand && !isAdmin && submission) {
    const { data: campaign } = await adminClient
      .from('campaigns')
      .select('id_w')
      .eq('id_t_campagne', submission.campaign_id)
      .maybeSingle()

    if (campaign?.id_w !== user.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }
  }

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

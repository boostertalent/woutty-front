import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()

  const body = await req.json()
  const { decision, brandNote }: { decision: 'approved' | 'rejected'; brandNote?: string } = body

  if (!decision || !['approved', 'rejected'].includes(decision)) {
    return NextResponse.json({ error: 'decision invalide' }, { status: 400 })
  }

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

  const adminClient = createAdminClient()

  // Récupérer la soumission
  const { data: submission, error: fetchError } = await adminClient
    .from('campaign_submissions')
    .select('video_path, campaign_id, creator_id')
    .eq('id', id)
    .single()

  if (fetchError || !submission) {
    return NextResponse.json({ error: 'Soumission introuvable' }, { status: 404 })
  }

  // Vérifier que l'utilisateur est la marque de cette campagne
  const { data: campaign } = await adminClient
    .from('campaigns')
    .select('id_w, title')
    .eq('id_t_campagne', submission.campaign_id)
    .maybeSingle()

  const isBrand = campaign?.id_w === user.id
  const { data: creatorCheck } = await supabase
    .from('createur').select('role').eq('id_w', user.id).maybeSingle()
  const isAdmin = creatorCheck?.role === 'admin'

  if (!isBrand && !isAdmin) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
  }

  // 1. Supprimer le fichier du bucket immédiatement
  if (submission.video_path) {
    const { error: deleteError } = await adminClient.storage
      .from('validation-videos')
      .remove([submission.video_path])

    if (deleteError) {
      console.error('[decide] Erreur suppression fichier:', deleteError)
    }
  }

  // 2. Mettre à jour le statut
  await adminClient
    .from('campaign_submissions')
    .update({
      status: decision,
      admin_note: brandNote ?? null,
      reviewed_at: new Date().toISOString(),
      video_path: null,
    })
    .eq('id', id)

  // 3. Notifier le créateur
  if (submission.creator_id) {
    const meta = {
      campaign_title: campaign?.title ?? 'Campagne',
      action_url: '/creators/dashboard',
      ...(decision === 'rejected' && brandNote ? { message: brandNote } : {}),
    }

    await adminClient.from('campaign_notifications').insert({
      campaign_id: submission.campaign_id ?? null,
      creator_id: submission.creator_id,
      recipient_id: submission.creator_id,
      recipient_role: 'creator',
      notification_type: decision === 'approved' ? 'content_validated' : 'content_rejected',
      metadata: meta,
      is_read: false,
    })
  }

  return NextResponse.json({ success: true })
}

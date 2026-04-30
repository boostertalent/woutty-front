import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'

export async function GET(req: Request) {
  const cookieStore = await cookies()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const campaignIdFilter = searchParams.get('campaignId')

  // Vérifier que l'utilisateur est une marque authentifiée
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

  const { data: brandCheck } = await supabase
    .from('marque')
    .select('id_w')
    .eq('id_w', user.id)
    .maybeSingle()

  if (!brandCheck) {
    return NextResponse.json({ error: 'Accès réservé aux marques' }, { status: 403 })
  }

  const adminClient = createAdminClient()

  // Récupérer les campagnes de cette marque
  const { data: campaigns } = await adminClient
    .from('campaigns')
    .select('id_t_campagne, title')
    .eq('id_w', user.id)

  if (!campaigns || campaigns.length === 0) {
    return NextResponse.json({ submissions: [] })
  }

  const campaignIds = campaigns.map((c: any) => c.id_t_campagne)

  // Si un campaignId spécifique est demandé, vérifier qu'il appartient bien à cette marque
  const filteredIds = campaignIdFilter
    ? campaignIds.filter((id: string) => id === campaignIdFilter)
    : campaignIds

  if (filteredIds.length === 0) {
    return NextResponse.json({ submissions: [] })
  }

  // Récupérer les soumissions pour ces campagnes uniquement
  let query = adminClient
    .from('campaign_submissions')
    .select('*')
    .in('campaign_id', filteredIds)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: submissions, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!submissions || submissions.length === 0) {
    return NextResponse.json({ submissions: [] })
  }

  // Enrichir avec créateurs
  const creatorIds = [...new Set(submissions.map((s: any) => s.creator_id).filter(Boolean))]
  const { data: creatorsData } = await adminClient
    .from('createur')
    .select('id_w, full_name, avatar_url')
    .in('id_w', creatorIds)

  const campaignsMap = new Map(campaigns.map((c: any) => [c.id_t_campagne, c]))
  const creatorsMap = new Map((creatorsData ?? []).map((c: any) => [c.id_w, c]))

  const enriched = submissions.map((s: any) => ({
    ...s,
    campaign_title: (campaignsMap.get(s.campaign_id) as any)?.title ?? '—',
    creator_name: (creatorsMap.get(s.creator_id) as any)?.full_name ?? 'Créateur',
    creator_avatar: (creatorsMap.get(s.creator_id) as any)?.avatar_url ?? null,
  }))

  return NextResponse.json({ submissions: enriched })
}

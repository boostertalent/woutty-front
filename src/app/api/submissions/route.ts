import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'

export async function GET(req: Request) {
  const cookieStore = await cookies()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  // Vérifier que l'utilisateur est admin
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

  // Récupérer les soumissions avec le service role (bypass RLS)
  const adminClient = createAdminClient()

  let query = adminClient
    .from('campaign_submissions')
    .select('*')
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

  // Enrichir avec campagnes et créateurs
  const campaignIds = [...new Set(submissions.map((s: any) => s.campaign_id).filter(Boolean))]
  const creatorIds = [...new Set(submissions.map((s: any) => s.creator_id).filter(Boolean))]

  const [{ data: campaignsData }, { data: creatorsData }] = await Promise.all([
    campaignIds.length > 0
      ? adminClient.from('campaigns').select('id_t_campagne, title').in('id_t_campagne', campaignIds)
      : Promise.resolve({ data: [] }),
    creatorIds.length > 0
      ? adminClient.from('createur').select('id_w, full_name, avatar_url').in('id_w', creatorIds)
      : Promise.resolve({ data: [] }),
  ])

  const campaignsMap = new Map((campaignsData ?? []).map((c: any) => [c.id_t_campagne, c]))
  const creatorsMap = new Map((creatorsData ?? []).map((c: any) => [c.id_w, c]))

  const enriched = submissions.map((s: any) => ({
    ...s,
    campaign_title: (campaignsMap.get(s.campaign_id) as any)?.title ?? '—',
    creator_name: (creatorsMap.get(s.creator_id) as any)?.full_name ?? 'Créateur',
    creator_avatar: (creatorsMap.get(s.creator_id) as any)?.avatar_url ?? null,
  }))

  return NextResponse.json({ submissions: enriched })
}

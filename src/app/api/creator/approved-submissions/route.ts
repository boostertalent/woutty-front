import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'

export async function GET(req: Request) {
  const cookieStore = await cookies()

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

  const { searchParams } = new URL(req.url)
  const creatorId = searchParams.get('creatorId') || user.id

  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('campaign_submissions')
    .select('campaign_id, status')
    .eq('creator_id', creatorId)
    .in('status', ['approved', 'pending'])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Agréger par campaign_id
  const approvedCounts: Record<string, number> = {}
  const pendingCounts: Record<string, number> = {}
  ;(data || []).forEach((row) => {
    if (!row.campaign_id) return
    if (row.status === 'approved') {
      approvedCounts[row.campaign_id] = (approvedCounts[row.campaign_id] || 0) + 1
    } else if (row.status === 'pending') {
      pendingCounts[row.campaign_id] = (pendingCounts[row.campaign_id] || 0) + 1
    }
  })

  return NextResponse.json({ counts: approvedCounts, pendingCounts })
}

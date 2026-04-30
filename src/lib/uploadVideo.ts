import { getSupabaseBrowserClient } from './supabaseClient'
import { createNotification } from './notifications'
import { triggerEmailNotification } from './n8n'

/**
 * Upload une vidéo dans le bucket privé "validation-videos" et crée
 * une ligne dans campaign_submissions avec status "pending".
 * Notifie l'admin via in-app + email.
 */
export async function uploadVideoValidation(
  file: File,
  campaignId: string,
  creatorId: string,
  campaignTitle: string,
  creatorName: string,
): Promise<{ submissionId: string | null; error: string | null }> {
  const supabase = getSupabaseBrowserClient()

  // Nom unique : évite les collisions entre plusieurs soumissions
  const ext = file.name.split('.').pop() ?? 'mp4'
  const fileName = `${campaignId}/${creatorId}_${Date.now()}.${ext}`

  const { data, error: uploadError } = await supabase.storage
    .from('validation-videos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'video/mp4',
    })

  if (uploadError) {
    return { submissionId: null, error: uploadError.message }
  }

  const { data: submission, error: insertError } = await supabase
    .from('campaign_submissions')
    .insert({
      campaign_id: campaignId,
      creator_id: creatorId,
      video_path: data.path,
      status: 'pending',
    })
    .select('id')
    .single()

  if (insertError) {
    return { submissionId: null, error: insertError.message }
  }

  // Notifier l'admin
  const { data: adminData } = await supabase
    .from('createur')
    .select('id_w, email, full_name')
    .eq('role', 'admin')
    .limit(1)
    .maybeSingle()

  if (adminData) {
    const meta = {
      campaign_title: campaignTitle,
      creator_name: creatorName,
      action_url: '/admin/validate-submissions',
      post_id: submission.id,
    }

    await createNotification({
      campaign_id: campaignId,
      creator_id: creatorId,
      recipient_id: adminData.id_w,
      recipient_role: 'admin',
      notification_type: 'content_submitted',
      metadata: meta,
    })

    await triggerEmailNotification({
      event: 'content_submitted',
      recipient_email: adminData.email,
      recipient_name: adminData.full_name || 'Admin',
      metadata: meta,
    })
  }

  return { submissionId: submission.id, error: null }
}

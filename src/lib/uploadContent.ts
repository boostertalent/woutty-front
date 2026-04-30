import { getSupabaseBrowserClient } from './supabaseClient'
import { createNotification } from './notifications'
import { triggerEmailNotification } from './n8n'

export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const ACCEPTED_TYPES = [...ACCEPTED_VIDEO_TYPES, ...ACCEPTED_IMAGE_TYPES]
export const MAX_SIZE_MB = 500

export function isVideo(file: File) {
  return ACCEPTED_VIDEO_TYPES.includes(file.type)
}

/**
 * Upload un fichier (vidéo ou image) dans le bucket privé "validation-videos"
 * et crée une ligne dans campaign_submissions avec status "pending".
 * Notifie la marque de la campagne.
 */
export async function uploadContent(
  file: File,
  campaignId: string,
  creatorId: string,
  campaignTitle: string,
  creatorName: string,
  brandId: string,
): Promise<{ submissionId: string | null; error: string | null }> {
  const supabase = getSupabaseBrowserClient()

  const ext = file.name.split('.').pop() ?? 'bin'
  const fileName = `${campaignId}/${creatorId}_${Date.now()}.${ext}`

  const { data, error: uploadError } = await supabase.storage
    .from('validation-videos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
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

  // Notifier la marque
  const { data: brandData } = await supabase
    .from('marque')
    .select('id_w, email, nom_marque')
    .eq('id_w', brandId)
    .maybeSingle()

  if (brandData) {
    const meta = {
      campaign_title: campaignTitle,
      creator_name: creatorName,
      action_url: '/brands/dashboard/validate-submissions',
      post_id: submission.id,
    }

    await createNotification({
      campaign_id: campaignId,
      creator_id: creatorId,
      brand_id: brandId,
      recipient_id: brandData.id_w,
      recipient_role: 'brand',
      notification_type: 'content_submitted',
      metadata: meta,
    })

    await triggerEmailNotification({
      event: 'content_submitted',
      recipient_email: brandData.email,
      recipient_name: brandData.nom_marque || 'Marque',
      metadata: meta,
    })
  }

  return { submissionId: submission.id, error: null }
}

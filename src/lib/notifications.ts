import { getSupabaseBrowserClient } from './supabaseClient';
import type { CreateNotificationPayload, Notification } from '@/types/notifications';

const supabase = getSupabaseBrowserClient();

/**
 * Crée une notification en base.
 * À appeler côté client au moment de l'événement déclencheur.
 */
export async function createNotification(
  payload: CreateNotificationPayload
): Promise<void> {
  const { error } = await supabase.from('campaign_notifications').insert({
    campaign_id:    payload.campaign_id    ?? null,
    creator_id:     payload.creator_id     ?? null,
    brand_id:       payload.brand_id       ?? null,
    recipient_id:   payload.recipient_id,
    recipient_role: payload.recipient_role,
    notification_type: payload.notification_type,
    metadata:       payload.metadata       ?? null,
    is_read:        false,
  });

  if (error) {
    console.error('[notifications] createNotification error:', error.message);
  }
}

/**
 * Récupère les notifications d'un utilisateur (50 max, les plus récentes).
 */
export async function fetchNotifications(
  recipientId: string
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('campaign_notifications')
    .select('*')
    .eq('recipient_id', recipientId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[notifications] fetchNotifications error:', error.message);
    return [];
  }

  return (data ?? []) as Notification[];
}

/**
 * Marque une notification comme lue.
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  const { error } = await supabase
    .from('campaign_notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) {
    console.error('[notifications] markAsRead error:', error.message);
  }
}

/**
 * Marque toutes les notifications d'un utilisateur comme lues.
 */
export async function markAllNotificationsAsRead(
  recipientId: string
): Promise<void> {
  const { error } = await supabase
    .from('campaign_notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('recipient_id', recipientId)
    .eq('is_read', false);

  if (error) {
    console.error('[notifications] markAllAsRead error:', error.message);
  }
}

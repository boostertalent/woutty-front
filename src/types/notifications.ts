export type NotificationEventType =
  | 'campaign_created'          // Marque crée une campagne → Admin
  | 'campaign_assigned'         // Marque assigne des créateurs → Admin (en attente validation)
  | 'campaign_validated'        // Admin valide l'assignation → Créateur notifié
  | 'campaign_declined'         // Admin refuse l'assignation → Marque notifiée (avec motif)
  | 'creator_accepted'          // Créateur accepte la campagne → Admin + Marque
  | 'creator_declined'          // Créateur refuse la campagne → Admin + Marque
  | 'content_submitted'         // Créateur soumet un contenu → Admin
  | 'content_validated'         // Admin valide un contenu → Créateur
  | 'content_rejected'          // Admin rejette un contenu → Créateur
  | 'content_published';        // Créateur publie → Marque + Admin

export type RecipientRole = 'admin' | 'brand' | 'creator';

export interface Notification {
  id: string;
  campaign_id: string | null;
  creator_id: string | null;
  brand_id: string | null;
  recipient_id: string;
  recipient_role: RecipientRole;
  notification_type: NotificationEventType;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  metadata: NotificationMetadata | null;
}

export interface NotificationMetadata {
  campaign_title?: string;
  brand_name?: string;
  creator_name?: string;
  post_id?: string;
  action_url?: string;
  message?: string;
  decline_reason?: string;
  campaign_creators_ids?: string[]; // IDs des campaign_creators concernés
  nb_publications?: number; // Nombre de publications assignées au créateur
}

// Payload pour créer une notification
export interface CreateNotificationPayload {
  campaign_id?: string;
  creator_id?: string;
  brand_id?: string;
  recipient_id: string;
  recipient_role: RecipientRole;
  notification_type: NotificationEventType;
  metadata?: NotificationMetadata;
}

// Payload pour déclencher un email via n8n
export interface N8nEmailPayload {
  event: NotificationEventType;
  recipient_email: string;
  recipient_name: string;
  metadata: NotificationMetadata;
}

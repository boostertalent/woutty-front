import type { N8nEmailPayload } from '@/types/notifications';

const N8N_EMAIL_WEBHOOK = process.env.NEXT_PUBLIC_N8N_EMAIL_WEBHOOK ?? '';

/**
 * Déclenche l'envoi d'un email via n8n pour un événement du flux campagne.
 * Correspond au livrable F1 du CDC : notifications email sur les 5 événements clés.
 *
 * La variable d'environnement NEXT_PUBLIC_N8N_EMAIL_WEBHOOK doit être configurée
 * dans .env.local et dans les variables Vercel en production.
 */
export async function triggerEmailNotification(
  payload: N8nEmailPayload
): Promise<void> {
  if (!N8N_EMAIL_WEBHOOK) {
    console.warn('[n8n] NEXT_PUBLIC_N8N_EMAIL_WEBHOOK non configuré — email ignoré');
    return;
  }

  try {
    await fetch(N8N_EMAIL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    // Non bloquant : l'email échoue silencieusement, la notif in-app est déjà créée
    console.error('[n8n] triggerEmailNotification error:', error);
  }
}

/**
 * Messages d'email par type d'événement.
 * Centralise le contenu des emails pour cohérence.
 */
export const EMAIL_TEMPLATES: Record<
  N8nEmailPayload['event'],
  { subject: string; body: (meta: N8nEmailPayload['metadata']) => string }
> = {
  campaign_created: {
    subject: 'Nouvelle campagne créée — Action requise',
    body: (m) =>
      `La marque "${m.brand_name}" vient de créer la campagne "${m.campaign_title}". Connectez-vous pour assigner un créateur.`,
  },
  campaign_assigned: {
    subject: 'Une campagne vous a été assignée',
    body: (m) =>
      `Vous avez été sélectionné(e) pour la campagne "${m.campaign_title}" de la marque "${m.brand_name}". Connectez-vous pour voir les détails.`,
  },
  content_submitted: {
    subject: 'Nouveau contenu en attente de validation',
    body: (m) =>
      `Le créateur "${m.creator_name}" a soumis un contenu pour la campagne "${m.campaign_title}". Connectez-vous pour valider.`,
  },
  content_validated: {
    subject: 'Votre contenu a été validé',
    body: (m) =>
      `Votre contenu pour la campagne "${m.campaign_title}" a été validé. Vous pouvez maintenant le publier.`,
  },
  content_rejected: {
    subject: 'Votre contenu nécessite des modifications',
    body: (m) =>
      `Votre contenu pour la campagne "${m.campaign_title}" a été refusé. ${m.message ? `Motif : ${m.message}` : 'Connectez-vous pour voir les détails.'}`,
  },
  content_published: {
    subject: 'Contenu publié sur la campagne',
    body: (m) =>
      `Le créateur "${m.creator_name}" a publié son contenu pour la campagne "${m.campaign_title}".`,
  },
};

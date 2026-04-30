'use client';

import {
  Megaphone,
  UserCheck,
  Send,
  CheckCircle,
  XCircle,
  Upload,
  ShieldCheck,
  ShieldX,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import type { Notification } from '@/types/notifications';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

const CONFIG = {
  campaign_created: {
    icon: Megaphone,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    label: 'Nouvelle campagne',
  },
  campaign_assigned: {
    icon: UserCheck,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    label: 'Campagne assignée',
  },
  content_submitted: {
    icon: Send,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    label: 'Contenu soumis',
  },
  content_validated: {
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-50',
    label: 'Contenu validé',
  },
  content_rejected: {
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-50',
    label: 'Contenu refusé',
  },
  content_published: {
    icon: Upload,
    color: 'text-[#F5C200]',
    bg: 'bg-yellow-50',
    label: 'Contenu publié',
  },
  campaign_validated: {
    icon: ShieldCheck,
    color: 'text-green-500',
    bg: 'bg-green-50',
    label: 'Campagne validée',
  },
  campaign_declined: {
    icon: ShieldX,
    color: 'text-red-500',
    bg: 'bg-red-50',
    label: 'Campagne refusée',
  },
  creator_accepted: {
    icon: ThumbsUp,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    label: 'Créateur accepte',
  },
  creator_declined: {
    icon: ThumbsDown,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    label: 'Créateur refuse',
  },
};

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

export default function NotificationItem({
  notification,
  onRead,
}: NotificationItemProps) {
  const config = CONFIG[notification.notification_type];
  const Icon = config.icon;
  const meta = notification.metadata;

  const isDecision =
    notification.notification_type === 'content_validated' ||
    notification.notification_type === 'content_rejected';

  const getTitle = (): string => {
    switch (notification.notification_type) {
      case 'content_validated':
        return `Contenu validé — "${meta?.campaign_title ?? 'campagne'}"`;
      case 'content_rejected':
        return `Contenu refusé — "${meta?.campaign_title ?? 'campagne'}"`;
      default:
        return '';
    }
  };

  const getMessage = (): string => {
    switch (notification.notification_type) {
      case 'campaign_created':
        return `"${meta?.campaign_title ?? 'Campagne'}" créée par ${meta?.brand_name ?? 'une marque'}`;
      case 'campaign_assigned':
        return `Vous avez été assigné(e) à "${meta?.campaign_title ?? 'une campagne'}"`;
      case 'content_submitted':
        return `${meta?.creator_name ?? 'Un créateur'} a soumis un contenu pour "${meta?.campaign_title ?? 'une campagne'}"`;
      case 'content_validated':
        return `Votre contenu pour "${meta?.campaign_title ?? 'la campagne'}" a été validé par la marque.`;
      case 'content_rejected':
        return `Votre contenu pour "${meta?.campaign_title ?? 'la campagne'}" a été refusé par la marque.`;
      case 'content_published':
        return `${meta?.creator_name ?? 'Un créateur'} a publié son contenu pour "${meta?.campaign_title ?? 'la campagne'}"`;
      case 'campaign_validated':
        return `Votre assignation à "${meta?.campaign_title ?? 'la campagne'}" a été validée par l'admin${meta?.nb_publications ? ` — ${meta.nb_publications} publication${meta.nb_publications > 1 ? 's' : ''} à produire` : ''}`;
      case 'campaign_declined':
        return `Votre assignation à "${meta?.campaign_title ?? 'la campagne'}" a été refusée${meta?.decline_reason ? ` : ${meta.decline_reason}` : ''}`;
      case 'creator_accepted':
        return `${meta?.creator_name ?? 'Un créateur'} a accepté la campagne "${meta?.campaign_title ?? ''}"`;
      case 'creator_declined':
        return `${meta?.creator_name ?? 'Un créateur'} a refusé la campagne "${meta?.campaign_title ?? ''}"`;
      default:
        return 'Nouvelle notification';
    }
  };

  if (isDecision) {
    const brandNote = meta?.message as string | undefined;
    return (
      <div
        onClick={() => !notification.is_read && onRead(notification.id)}
        className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 cursor-pointer ${
          !notification.is_read ? 'bg-white border-l-2 border-[#F5C200]' : 'bg-white'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-9 h-9 rounded-full ${config.bg} flex items-center justify-center`}>
            <Icon size={16} className={config.color} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold ${config.color} uppercase tracking-wide mb-0.5`}>
              {config.label}
            </p>
            <p className="text-sm text-gray-700 leading-snug">
              {getMessage()}
            </p>
            {brandNote && (
              <div className={`mt-2 p-2.5 rounded-lg text-xs leading-relaxed ${
                notification.notification_type === 'content_rejected'
                  ? 'bg-red-50 text-red-700 border border-red-100'
                  : 'bg-green-50 text-green-700 border border-green-100'
              }`}>
                <span className="font-bold block mb-0.5">Message de la marque :</span>
                {brandNote}
              </div>
            )}
            <p className="text-[11px] text-gray-400 mt-1">
              {timeAgo(notification.created_at)}
            </p>
          </div>
          {!notification.is_read && (
            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#F5C200] mt-1.5" />
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => !notification.is_read && onRead(notification.id)}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
        !notification.is_read ? 'bg-white border-l-2 border-[#F5C200]' : 'bg-white'
      }`}
    >
      {/* Icône */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-full ${config.bg} flex items-center justify-center`}>
        <Icon size={16} className={config.color} />
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold ${config.color} uppercase tracking-wide mb-0.5`}>
          {config.label}
        </p>
        <p className="text-sm text-gray-700 leading-snug line-clamp-2">
          {getMessage()}
        </p>
        <p className="text-[11px] text-gray-400 mt-1">
          {timeAgo(notification.created_at)}
        </p>
      </div>

      {/* Point non lu */}
      {!notification.is_read && (
        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#F5C200] mt-1.5" />
      )}
    </button>
  );
}

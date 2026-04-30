'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/notifications';
import type { Notification } from '@/types/notifications';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

/**
 * Hook Supabase Realtime pour les notifications in-app.
 * S'abonne aux INSERT sur campaign_notifications filtrés par recipient_id.
 * Livrable F1 — CDC Woutty v2.
 */
export function useNotifications(recipientId: string | null): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = getSupabaseBrowserClient();

  // Chargement initial
  const loadNotifications = useCallback(async () => {
    if (!recipientId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await fetchNotifications(recipientId);
    setNotifications(data);
    setLoading(false);
  }, [recipientId]);

  // Souscription Supabase Realtime
  useEffect(() => {
    if (!recipientId) return;

    loadNotifications();

    const channel = supabase
      .channel(`notifications:${recipientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'campaign_notifications',
          filter: `recipient_id=eq.${recipientId}`,
        },
        (payload) => {
          // Ajoute la nouvelle notification en tête de liste sans refetch
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'campaign_notifications',
          filter: `recipient_id=eq.${recipientId}`,
        },
        (payload) => {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === (payload.new as Notification).id
                ? (payload.new as Notification)
                : n
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [recipientId]);

  const markAsRead = useCallback(
    async (id: string) => {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      await markNotificationAsRead(id);
    },
    []
  );

  const markAllAsRead = useCallback(async () => {
    if (!recipientId) return;
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await markAllNotificationsAsRead(recipientId);
  }, [recipientId]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}

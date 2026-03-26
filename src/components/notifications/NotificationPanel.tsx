'use client';

import React from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import NotificationItem from './NotificationItem';
import type { Notification } from '@/types/notifications';

interface NotificationPanelProps {
  notifications: Notification[];
  loading: boolean;
  onRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  unreadCount: number;
}

export default function NotificationPanel({
  notifications,
  loading,
  onRead,
  onMarkAllAsRead,
  unreadCount,
}: NotificationPanelProps) {
  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-gray-700" />
          <span className="text-sm font-bold text-gray-900">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs font-bold text-white bg-[#F5C200] rounded-full px-2 py-0.5">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#F5C200] transition-colors font-medium"
          >
            <CheckCheck size={14} />
            Tout marquer lu
          </button>
        )}
      </div>

      {/* Liste */}
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-[#F5C200]" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
            <Bell size={28} className="opacity-30" />
            <p className="text-sm">Aucune notification</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onRead={onRead}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-50 bg-gray-50/50">
          <p className="text-[11px] text-gray-400 text-center">
            Les {notifications.length} dernières notifications
          </p>
        </div>
      )}
    </div>
  );
}

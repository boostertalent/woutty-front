"use client";

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Activity, FileText, Clock, Loader2 } from 'lucide-react';

interface ActivityLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string;
  created_at: string;
}

export default function LogsPage() {
  const router = useRouter();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    // Vérifier que c'est bien l'admin principal
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }

    const { data: creatorCheck } = await supabase
      .from('createur').select('role').eq('id_w', user.id).maybeSingle();

    if (!creatorCheck || creatorCheck.role !== 'admin') {
      router.push('/admin/dashboard');
      return;
    }

    await fetchActivityLogs();
    setLoading(false);
  };

  const fetchActivityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      setActivityLogs(error ? [] : (data || []));
    } catch {
      setActivityLogs([]);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const getActionIcon = (action: string) => {
    switch(action) {
      case 'CREATE': return '➕';
      case 'DELETE': return '🗑️';
      case 'UPDATE': return '✏️';
      case 'VIEW': return '👁️';
      case 'LOGOUT': return '🚪';
      default: return '📝';
    }
  };

  const getActionColor = (action: string) => {
    switch(action) {
      case 'CREATE': return 'bg-green-50 text-green-700 border-green-200';
      case 'DELETE': return 'bg-red-50 text-red-700 border-red-200';
      case 'UPDATE': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'VIEW': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-[#ceaf4a] animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* EN-TÊTE */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">📊 Logs d'activité</h2>
          <p className="text-gray-500 text-sm mt-1">Suivi des actions des administrateurs</p>
        </div>
        <button onClick={fetchActivityLogs}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
          <Activity size={16} /> Actualiser
        </button>
      </div>

      {/* LISTE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {activityLogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">Aucune activité enregistrée</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50 transition-all">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${getActionColor(log.action)}`}>
                    <span className="text-lg">{getActionIcon(log.action)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900">{log.admin_name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{log.details}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <Clock size={12} />
                      <span>{formatRelativeTime(log.created_at)}</span>
                      <span>•</span>
                      <span className="capitalize">{log.target_type}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

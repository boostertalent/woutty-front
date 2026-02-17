"use client";

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  HeadphonesIcon, Loader2, User, Mail, Phone, 
  Calendar, MessageCircle, CheckCircle2, XCircle, Clock
} from 'lucide-react';

export default function AssistancePage() {
  const [assistanceRequests, setAssistanceRequests] = useState<any[]>([]);
  const [assistanceFilter, setAssistanceFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    fetchAssistanceRequests();
  }, [assistanceFilter]);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: creatorCheck } = await supabase
      .from('createur').select('full_name, role').eq('id_w', user.id).maybeSingle();
    if (creatorCheck) setAdminName(creatorCheck.full_name || 'Admin');

    await fetchAssistanceRequests();
    setLoading(false);
  };

  const fetchAssistanceRequests = async () => {
    try {
      let query = supabase
        .from('campaign_assistance_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (assistanceFilter !== 'all') query = query.eq('status', assistanceFilter);

      const { data, error } = await query;
      setAssistanceRequests(error ? [] : (data || []));
    } catch {
      setAssistanceRequests([]);
    }
  };

  const logActivity = async (action: string, targetId: string, details: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('admin_logs').insert({
        admin_id: user.id,
        admin_name: adminName,
        action,
        target_type: 'assistance',
        target_id: targetId,
        details,
        created_at: new Date().toISOString()
      });
    } catch {}
  };

  const updateAssistanceStatus = async (requestId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'in_progress') {
        const request = assistanceRequests.find(r => r.id === requestId);
        if (request && !request.contacted_at) updates.contacted_at = new Date().toISOString();
      }
      if (newStatus === 'completed') updates.completed_at = new Date().toISOString();

      const { error } = await supabase
        .from('campaign_assistance_requests').update(updates).eq('id', requestId);
      if (error) throw error;

      await logActivity('UPDATE', requestId, `Changement statut assistance vers ${newStatus}`);
      alert('✅ Statut mis à jour !');
      fetchAssistanceRequests();
    } catch (error: any) {
      alert('❌ Erreur : ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'in_progress': return <Loader2 size={16} className="animate-spin" />;
      case 'completed': return <CheckCircle2 size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return status;
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
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <HeadphonesIcon size={32} className="text-[#D4A017]" />
            Demandes d'assistance
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Marques ayant demandé de l'aide pour créer une campagne
          </p>
        </div>
        <button onClick={fetchAssistanceRequests}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
          <Loader2 size={16} /> Actualiser
        </button>
      </div>

      {/* FILTRES */}
      <div className="flex gap-2 mb-6">
        {([
          { key: 'all', label: `Toutes (${assistanceRequests.length})` },
          { key: 'pending', label: 'En attente' },
          { key: 'in_progress', label: 'En cours' },
          { key: 'completed', label: 'Terminées' },
        ] as const).map(({ key, label }) => (
          <button key={key}
            onClick={() => setAssistanceFilter(key)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              assistanceFilter === key
                ? 'bg-[#ceaf4a] text-white shadow-lg'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* LISTE */}
      {assistanceRequests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <HeadphonesIcon size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500 font-bold">Aucune demande d'assistance</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {assistanceRequests.map((request) => (
            <div key={request.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6">
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                    <User size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{request.brand_name || 'Marque'}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1"><Mail size={14} />{request.brand_email}</div>
                      {request.brand_phone && (
                        <div className="flex items-center gap-1"><Phone size={14} />{request.brand_phone}</div>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1.5 rounded-full font-bold border flex items-center gap-1.5 ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}{getStatusLabel(request.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <div>
                    <p className="text-xs text-gray-400">Demandé le</p>
                    <p className="font-medium">
                      {new Date(request.requested_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                {request.contacted_at && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MessageCircle size={16} />
                    <div>
                      <p className="text-xs text-gray-400">Contacté le</p>
                      <p className="font-medium">
                        {new Date(request.contacted_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}
                {request.completed_at && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle2 size={16} />
                    <div>
                      <p className="text-xs text-gray-400">Terminé le</p>
                      <p className="font-medium">
                        {new Date(request.completed_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                {request.status === 'pending' && (
                  <button onClick={() => updateAssistanceStatus(request.id, 'in_progress')}
                    className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-100 transition-all">
                    Prendre en charge
                  </button>
                )}
                {request.status === 'in_progress' && (
                  <button onClick={() => updateAssistanceStatus(request.id, 'completed')}
                    className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg font-bold text-sm hover:bg-green-100 transition-all">
                    Marquer comme terminée
                  </button>
                )}
                {(request.status === 'pending' || request.status === 'in_progress') && (
                  <button onClick={() => updateAssistanceStatus(request.id, 'cancelled')}
                    className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-sm hover:bg-red-100 transition-all">
                    Annuler
                  </button>
                )}
                {request.status === 'completed' && (
                  <button onClick={() => updateAssistanceStatus(request.id, 'in_progress')}
                    className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-100 transition-all">
                    Rouvrir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

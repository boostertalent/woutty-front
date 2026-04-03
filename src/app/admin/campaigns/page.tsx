"use client";

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { createNotification } from '@/lib/notifications';
import { triggerEmailNotification } from '@/lib/n8n';
import {
  CheckCircle2, XCircle, Loader2, AlertCircle, ChevronDown, ChevronUp,
  Users, Calendar, Globe, Megaphone, Clock
} from 'lucide-react';

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminCampaignsPage() {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [loading, setLoading] = useState(true);
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);

  // Modal déclin
  const [declineTarget, setDeclineTarget] = useState<{ campaignId: string; campaignTitle: string; brandId: string } | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadPendingCampaigns();
  }, []);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadPendingCampaigns = async () => {
    setLoading(true);
    try {
      // Campagnes avec au moins un créateur en attente d'admin
      const { data: ccRows, error } = await supabase
        .from('campaign_creators')
        .select('*, campaigns(*), createur(*)')
        .eq('status', 'pending_admin')
        .order('assigned_at', { ascending: false });

      if (error) throw error;

      // Grouper par campagne
      const grouped: Record<string, any> = {};
      for (const row of ccRows || []) {
        const cid = row.campaign_id;
        if (!grouped[cid]) {
          grouped[cid] = {
            campaign: row.campaigns,
            creators: [],
          };
        }
        grouped[cid].creators.push({ ...row.createur, cc_id: row.id, cc_status: row.status });
      }

      // Enrichir avec le nom de la marque
      const items = await Promise.all(
        Object.values(grouped).map(async (item: any) => {
          const { data: brand } = await supabase
            .from('marque')
            .select('nom_marque, email_marque')
            .eq('id_w', item.campaign?.id_w)
            .maybeSingle();
          return { ...item, brand };
        })
      );

      setPendingItems(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (campaignId: string, campaignTitle: string, creators: any[], brandId: string) => {
    setProcessing(true);
    try {
      // Passer les créateurs en pending_creator
      await supabase
        .from('campaign_creators')
        .update({ status: 'pending_creator', validated_at: new Date().toISOString() })
        .eq('campaign_id', campaignId)
        .eq('status', 'pending_admin');

      // Mettre à jour le statut de la campagne
      await supabase
        .from('campaigns')
        .update({ status: 'assigned' })
        .eq('id_t_campagne', campaignId);

      // Récupérer infos marque
      const { data: brand } = await supabase
        .from('marque').select('nom_marque').eq('id_w', brandId).maybeSingle();
      const brandName = brand?.nom_marque || 'Marque';

      // Notifier chaque créateur
      await Promise.allSettled(
        creators.map(async (creator) => {
          const meta = {
            campaign_title: campaignTitle,
            brand_name: brandName,
            action_url: '/creators/dashboard',
          };
          await createNotification({
            campaign_id: campaignId,
            brand_id: brandId,
            recipient_id: creator.id_w,
            recipient_role: 'creator',
            notification_type: 'campaign_validated',
            metadata: meta,
          });
          if (creator.email) {
            await triggerEmailNotification({
              event: 'campaign_validated',
              recipient_email: creator.email,
              recipient_name: creator.full_name || 'Créateur',
              metadata: meta,
            });
          }
        })
      );

      showToast('Campagne validée — les créateurs ont été notifiés.', 'success');
      await loadPendingCampaigns();
    } catch (err: any) {
      showToast(err.message || 'Une erreur est survenue.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!declineTarget || !declineReason.trim()) return;
    setProcessing(true);
    try {
      const { campaignId, campaignTitle, brandId } = declineTarget;

      // Passer les créateurs en declined_admin
      await supabase
        .from('campaign_creators')
        .update({ status: 'declined_admin', decline_reason: declineReason })
        .eq('campaign_id', campaignId)
        .eq('status', 'pending_admin');

      // Mettre à jour le statut de la campagne
      await supabase
        .from('campaigns')
        .update({ status: 'declined' })
        .eq('id_t_campagne', campaignId);

      // Notifier la marque
      const meta = {
        campaign_title: campaignTitle,
        decline_reason: declineReason,
        action_url: '/brands/dashboard',
      };
      await createNotification({
        campaign_id: campaignId,
        brand_id: brandId,
        recipient_id: brandId,
        recipient_role: 'brand',
        notification_type: 'campaign_declined',
        metadata: meta,
      });

      // Email à la marque
      const { data: brand } = await supabase
        .from('marque').select('email_marque, nom_marque').eq('id_w', brandId).maybeSingle();
      if (brand?.email_marque) {
        await triggerEmailNotification({
          event: 'campaign_declined',
          recipient_email: brand.email_marque,
          recipient_name: brand.nom_marque || 'Marque',
          metadata: meta,
        });
      }

      showToast('Campagne refusée — la marque a été notifiée.', 'success');
      setDeclineTarget(null);
      setDeclineReason('');
      await loadPendingCampaigns();
    } catch (err: any) {
      showToast(err.message || 'Une erreur est survenue.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border-2 text-sm font-bold ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Modal refus */}
      {declineTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-xl font-bold mb-2 text-[#111827]">Refuser la campagne</h3>
            <p className="text-sm text-gray-500 mb-5">
              Indiquez le motif du refus — la marque recevra cette explication.
            </p>
            <p className="text-sm font-bold text-gray-700 mb-2">
              Campagne : <span className="text-[#ceaf4a]">{declineTarget.campaignTitle}</span>
            </p>
            <textarea
              rows={4}
              value={declineReason}
              onChange={e => setDeclineReason(e.target.value)}
              placeholder="Ex : Les créateurs sélectionnés ne correspondent pas aux critères de la campagne..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50 transition-all text-sm resize-none mb-5"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setDeclineTarget(null); setDeclineReason(''); }}
                disabled={processing}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDecline}
                disabled={processing || !declineReason.trim()}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Campagnes en attente</h1>
          <p className="text-sm text-gray-400 mt-1">Validez ou refusez les assignations de créateurs soumises par les marques</p>
        </div>
        <span className="px-4 py-2 bg-[#ceaf4a]/10 text-[#ceaf4a] font-black text-sm rounded-full border border-[#ceaf4a]/20">
          {pendingItems.length} en attente
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-[#ceaf4a] animate-spin" />
        </div>
      ) : pendingItems.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl bg-white">
          <CheckCircle2 size={48} className="mx-auto text-green-200 mb-4" />
          <p className="text-gray-500 font-bold text-lg">Tout est à jour !</p>
          <p className="text-sm text-gray-400 mt-1">Aucune campagne en attente de validation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingItems.map((item) => {
            const campaign = item.campaign;
            const isExpanded = expandedCampaign === campaign?.id_t_campagne;
            return (
              <div key={campaign?.id_t_campagne} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Header campagne */}
                <div
                  className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedCampaign(isExpanded ? null : campaign?.id_t_campagne)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#ceaf4a]/10 rounded-xl flex items-center justify-center shrink-0">
                      <Megaphone size={20} className="text-[#ceaf4a]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#111827]">{campaign?.title || 'Sans titre'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Marque : <span className="font-bold text-gray-600">{item.brand?.nom_marque || '—'}</span>
                      </p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Users size={12} /> {item.creators.length} créateur{item.creators.length > 1 ? 's' : ''} proposé{item.creators.length > 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar size={12} /> {formatDate(campaign?.start_date)} → {formatDate(campaign?.end_date)}
                        </span>
                        {campaign?.countries?.length > 0 && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Globe size={12} /> {campaign.countries.join(', ')}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-[#ceaf4a] font-bold bg-[#ceaf4a]/10 px-2 py-0.5 rounded-full">
                          <Clock size={11} /> En attente de validation
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    {/* Actions */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleValidate(campaign.id_t_campagne, campaign.title, item.creators, campaign.id_w);
                      }}
                      disabled={processing}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-xl font-bold text-xs hover:bg-green-600 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} /> Valider
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setDeclineTarget({ campaignId: campaign.id_t_campagne, campaignTitle: campaign.title, brandId: campaign.id_w });
                      }}
                      disabled={processing}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-xs hover:bg-red-100 transition-all disabled:opacity-50"
                    >
                      <XCircle size={14} /> Refuser
                    </button>
                    {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </div>
                </div>

                {/* Détail créateurs */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-6 pb-6 pt-4">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Créateurs proposés</p>
                    <div className="space-y-3">
                      {item.creators.map((creator: any) => (
                        <div key={creator.id_w} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden shrink-0">
                            {creator.avatar_url
                              ? <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xs">{creator.full_name?.charAt(0)}</div>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">{creator.full_name}</p>
                            <p className="text-xs text-gray-400">{creator.email}</p>
                          </div>
                          {creator.niche && (
                            <span className="text-xs bg-[#ceaf4a]/10 text-[#ceaf4a] px-2 py-0.5 rounded-full font-bold">{creator.niche}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {campaign?.description && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs font-bold text-blue-600 mb-1">Description de la campagne</p>
                        <p className="text-sm text-blue-800">{campaign.description}</p>
                      </div>
                    )}

                    {campaign?.objectives?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {campaign.objectives.map((obj: string) => (
                          <span key={obj} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">{obj}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

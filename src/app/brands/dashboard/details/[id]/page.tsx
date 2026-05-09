"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft, Loader2, AlertCircle, Calendar, DollarSign,
  Users, CheckCircle2, Clock, X, FileVideo, User, Target
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface Creator {
  id_w: string;
  full_name: string;
  avatar_url?: string | null;
  nb_publications: number;
  approvedCount: number;
  pendingCount: number;
}

export default function BrandCampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.id as string;

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [campaign, setCampaign] = useState<any>(null);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) return;
    load();
  }, [campaignId]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth/login'); return; }

      const { data: camp, error: campError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id_t_campagne', campaignId)
        .single();

      if (campError || !camp) throw new Error('Campagne introuvable');
      if (camp.id_w !== session.user.id) throw new Error("Accès non autorisé");

      setCampaign(camp);

      // Créateurs acceptés sur cette campagne
      const { data: cc } = await supabase
        .from('campaign_creators')
        .select('creator_id, nb_publications')
        .eq('campaign_id', campaignId)
        .eq('status', 'accepted');

      if (!cc || cc.length === 0) {
        setCreators([]);
        setLoading(false);
        return;
      }

      const creatorIds = cc.map((r: any) => r.creator_id);

      // Infos créateurs
      const { data: creatorData } = await supabase
        .from('createur')
        .select('id_w, full_name, avatar_url')
        .in('id_w', creatorIds);

      // Soumissions approuvées + en attente via API
      const res = await fetch(`/api/brand/submissions?campaignId=${campaignId}`);
      const submissionsData = res.ok ? await res.json() : { submissions: [] };
      const subs: any[] = submissionsData.submissions || [];

      const approvedMap: Record<string, number> = {};
      const pendingMap: Record<string, number> = {};
      subs.forEach((s: any) => {
        if (s.status === 'approved') approvedMap[s.creator_id] = (approvedMap[s.creator_id] || 0) + 1;
        if (s.status === 'pending') pendingMap[s.creator_id] = (pendingMap[s.creator_id] || 0) + 1;
      });

      const enriched: Creator[] = cc.map((row: any) => {
        const info = (creatorData || []).find((c: any) => c.id_w === row.creator_id);
        return {
          id_w: row.creator_id,
          full_name: info?.full_name ?? 'Créateur',
          avatar_url: info?.avatar_url ?? null,
          nb_publications: row.nb_publications || 0,
          approvedCount: approvedMap[row.creator_id] || 0,
          pendingCount: pendingMap[row.creator_id] || 0,
        };
      });

      setCreators(enriched);
    } catch (e: any) {
      setError(e.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const campaignProgress = () => {
    if (!campaign?.start_date || !campaign?.end_date) return 0;
    const start = new Date(campaign.start_date).getTime();
    const end = new Date(campaign.end_date).getTime();
    const now = Date.now();
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
      <Loader2 className="animate-spin text-[#D4A017]" size={32} />
    </div>
  );

  if (error || !campaign) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full border text-center">
        <AlertCircle className="text-red-500 mx-auto mb-3" size={40} />
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <button onClick={() => router.back()} className="w-full py-2 bg-gray-100 rounded-lg font-bold text-sm">
          ← Retour
        </button>
      </div>
    </div>
  );

  const progress = campaignProgress();
  const totalApproved = creators.reduce((s, c) => s + c.approvedCount, 0);
  const totalExpected = creators.reduce((s, c) => s + c.nb_publications, 0);

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-700 mb-6 font-bold text-sm transition-colors"
        >
          <ChevronLeft size={16} /> Retour
        </button>

        {/* INFOS CAMPAGNE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{campaign.title}</h1>
              {campaign.description && (
                <p className="text-sm text-gray-500 max-w-xl">{campaign.description}</p>
              )}
            </div>
            <button
              onClick={() => router.push(`/brands/dashboard/edit/${campaignId}`)}
              className="shrink-0 px-4 py-2 bg-[#D4A017] text-white rounded-xl font-bold text-sm hover:bg-[#b8962f] transition-colors h-fit"
            >
              Modifier
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Budget</p>
              <p className="font-bold text-gray-800">{parseFloat(campaign.budget || 0).toLocaleString('fr-FR')} CFA</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Publications</p>
              <p className="font-bold text-gray-800">{campaign.nb_publications || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Début</p>
              <p className="font-bold text-gray-800">{formatDate(campaign.start_date)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Fin</p>
              <p className="font-bold text-gray-800">{formatDate(campaign.end_date)}</p>
            </div>
          </div>

          {/* Barre de progression temporelle */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progression temporelle</span>
              <span className="font-bold text-[#D4A017]">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#D4A017] to-[#FFD700] transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* RÉSUMÉ CONTENUS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Créateurs</p>
            <p className="text-3xl font-black text-gray-800">{creators.length}</p>
          </div>
          <div className="bg-green-50 rounded-2xl border border-green-200 shadow-sm p-5">
            <p className="text-xs font-bold text-green-600 uppercase mb-1">Validés</p>
            <p className="text-3xl font-black text-green-700">{totalApproved}</p>
          </div>
          <div className="bg-orange-50 rounded-2xl border border-orange-200 shadow-sm p-5">
            <p className="text-xs font-bold text-orange-600 uppercase mb-1">En attente</p>
            <p className="text-3xl font-black text-orange-700">
              {creators.reduce((s, c) => s + c.pendingCount, 0)}
            </p>
          </div>
        </div>

        {/* CRÉATEURS */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Users size={16} className="text-[#D4A017]" />
            Créateurs assignés ({creators.length})
          </h2>

          {creators.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
              <Users size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="font-bold text-gray-500">Aucun créateur accepté pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {creators.map((creator) => {
                const quota = creator.nb_publications;
                const done = creator.approvedCount + creator.pendingCount;
                const pct = quota > 0 ? Math.min(100, Math.round((creator.approvedCount / quota) * 100)) : 0;
                return (
                  <div key={creator.id_w} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-[#D4A017] overflow-hidden shrink-0 flex items-center justify-center">
                        {creator.avatar_url ? (
                          <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User size={18} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{creator.full_name}</p>
                        <p className="text-xs text-gray-400">{quota} publication{quota > 1 ? 's' : ''} attendue{quota > 1 ? 's' : ''}</p>
                      </div>
                      {creator.approvedCount >= quota && quota > 0 ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold">
                          <CheckCircle2 size={12} /> Complété
                        </span>
                      ) : creator.pendingCount > 0 ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-xs font-bold">
                          <Clock size={12} /> En attente
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-500 border border-gray-200 rounded-full text-xs font-bold">
                          <FileVideo size={12} /> En cours
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                      <div className="bg-green-50 rounded-xl p-2">
                        <p className="text-lg font-black text-green-700">{creator.approvedCount}</p>
                        <p className="text-[10px] font-bold text-green-500">Validé{creator.approvedCount > 1 ? 's' : ''}</p>
                      </div>
                      <div className="bg-orange-50 rounded-xl p-2">
                        <p className="text-lg font-black text-orange-700">{creator.pendingCount}</p>
                        <p className="text-[10px] font-bold text-orange-500">En attente</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2">
                        <p className="text-lg font-black text-gray-700">{quota}</p>
                        <p className="text-[10px] font-bold text-gray-400">Attendu{quota > 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progression</span>
                        <span className="font-bold text-[#D4A017]">{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#D4A017] to-[#FFD700] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

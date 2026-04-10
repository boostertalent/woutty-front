"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, Loader2, CheckCircle2, Instagram, Youtube,
  Music2, TrendingUp, Users, Zap, X as CloseIcon, UserPlus, CheckCheck
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { createNotification } from '@/lib/notifications';
import { triggerEmailNotification } from '@/lib/n8n';

const XLogo = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.486 3.24H4.298L17.607 20.65z" />
  </svg>
);

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export default function CampaignMatchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id_t_campagne = searchParams.get('campaign');

  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  const [loading, setLoading]                     = useState(true);
  const [campaign, setCampaign]                   = useState<any>(null);
  const [suggestedCreators, setSuggestedCreators] = useState<any[]>([]);

  // Sélection multiple
  const [selectedIds, setSelectedIds]             = useState<Set<string>>(new Set());

  // Nb publications par créateur (creatorId → nb)
  const [publicationsMap, setPublicationsMap]     = useState<Record<string, number>>({});

  // Modal détail créateur
  const [modalCreator, setModalCreator]           = useState<any>(null);
  const [creatorDetails, setCreatorDetails]       = useState<any>(null);
  const [loadingDetails, setLoadingDetails]       = useState(false);

  // Confirmation
  const [showConfirm, setShowConfirm]             = useState(false);
  const [isAssigning, setIsAssigning]             = useState(false);
  const [assignError, setAssignError]             = useState<string | null>(null);

  const getPrimaryPlatform = (creator: any) => {
    const platforms = [
      { name: 'Instagram', followers: creator.instagram_followers || 0 },
      { name: 'YouTube',   followers: creator.youtube_followers   || 0 },
      { name: 'TikTok',    followers: creator.tiktok_followers    || 0 },
      { name: 'X',         followers: creator.x_followers         || 0 },
      { name: 'Snap',      followers: creator.snap_followers      || 0 },
    ];
    return platforms.sort((a, b) => b.followers - a.followers)[0]?.name || 'Plateforme';
  };

  const getSuggestedCreators = async (campaignData: any) => {
    try {
      const { data: allCreators, error } = await supabase
        .from('createur')
        .select('*')
        .eq('role', 'creator')
        .order('created_at', { ascending: false });

      if (error || !allCreators) return [];

      const campaignNiches = Array.isArray(campaignData.interests) ? campaignData.interests : [];

      return allCreators
        .map(creator => {
          let score = 0;
          const reasons: string[] = [];

          if (campaignNiches.length > 0 && creator.niche) {
            const creatorNiches = Array.isArray(creator.niche) ? creator.niche : [];
            const nicheMatch = creatorNiches.some((cn: string) =>
              campaignNiches.some((cn2: string) =>
                cn.toLowerCase().includes(cn2.toLowerCase()) ||
                cn2.toLowerCase().includes(cn.toLowerCase())
              )
            );
            if (nicheMatch) { score += 40; reasons.push("Niche correspondante"); }
          }

          const totalFollowers =
            (creator.instagram_followers || 0) +
            (creator.youtube_followers   || 0) +
            (creator.tiktok_followers    || 0);

          if (totalFollowers > 100000) { score += 30; reasons.push("Grande audience"); }
          else if (totalFollowers > 50000) score += 25;
          else if (totalFollowers > 10000) score += 20;
          else if (totalFollowers > 1000)  score += 10;

          const budget = parseFloat(campaignData.budget) || 0;
          if (budget > 0) {
            const estimatedCost = totalFollowers * 10;
            if (estimatedCost <= budget * 1.2)      { score += 20; reasons.push("Budget adapté"); }
            else if (estimatedCost <= budget * 1.5) score += 10;
          }

          let profileScore = 0;
          if (creator.avatar_url) profileScore += 3;
          if (creator.full_name)  profileScore += 2;
          if (creator.phone)      profileScore += 2;
          if (creator.instagram_username || creator.youtube_username || creator.tiktok_username) profileScore += 3;
          score += profileScore;
          if (profileScore >= 8) reasons.push("Profil complet");

          return { ...creator, matchScore: score, matchReasons: reasons, totalFollowers, primaryPlatform: getPrimaryPlatform(creator) };
        })
        .filter((c: any) => c.matchScore > 0)
        .sort((a: any, b: any) => b.matchScore - a.matchScore);
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!id_t_campagne) { router.push('/brands/dashboard'); return; }

      const { data: campaignData, error } = await supabase
        .from('campaigns').select('*').eq('id_t_campagne', id_t_campagne).single();

      if (error || !campaignData) { router.push('/brands/dashboard'); return; }

      setCampaign(campaignData);
      setSuggestedCreators(await getSuggestedCreators(campaignData));
      setLoading(false);
    };
    load();
  }, []);

  const toggleSelect = (creatorId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(creatorId)) {
        next.delete(creatorId);
        setPublicationsMap(m => { const copy = { ...m }; delete copy[creatorId]; return copy; });
      } else {
        next.add(creatorId);
        setPublicationsMap(m => ({ ...m, [creatorId]: 1 }));
      }
      return next;
    });
  };

  const totalPubCampagne = campaign?.nb_publications ?? 0;
  const totalPubAssignees = Object.values(publicationsMap).reduce((s, v) => s + v, 0);
  const pubRestantes = totalPubCampagne - totalPubAssignees;

  const openModal = async (creator: any) => {
    setModalCreator(creator);
    setCreatorDetails(null);
    setLoadingDetails(true);
    const { data } = await supabase.from('createur').select('*').eq('id_w', creator.id_w).single();
    setCreatorDetails(data);
    setLoadingDetails(false);
  };

  const closeModal = () => { setModalCreator(null); setCreatorDetails(null); };

  const selectedCreators = suggestedCreators.filter(c => selectedIds.has(c.id_w));

  // Confirmer l'assignation de tous les créateurs sélectionnés
  const handleConfirmAssign = async () => {
    if (selectedCreators.length === 0 || !id_t_campagne) return;

    setIsAssigning(true);
    setAssignError(null);

    try {
      // Récupérer le nom de la marque
      const { data: brandData } = await supabase
        .from('marque').select('nom_marque').eq('id_w', campaign?.id_w).maybeSingle();
      const brandName = brandData?.nom_marque || 'Marque';

      // Insérer dans campaign_creators avec statut pending_admin
      const rows = selectedCreators.map(c => ({
        campaign_id:      id_t_campagne,
        creator_id:       c.id_w,
        status:           'pending_admin',
        nb_publications:  publicationsMap[c.id_w] ?? 0,
      }));

      const { error: insertError } = await supabase
        .from('campaign_creators')
        .upsert(rows, { onConflict: 'campaign_id,creator_id' });

      if (insertError) throw insertError;

      // Mettre à jour le statut de la campagne
      await supabase
        .from('campaigns')
        .update({ status: 'pending_admin' })
        .eq('id_t_campagne', id_t_campagne);

      // Notifier l'admin (pas le créateur — l'admin doit valider d'abord)
      const { data: adminData } = await supabase
        .from('createur')
        .select('id_w, email, full_name')
        .eq('role', 'admin')
        .limit(1)
        .maybeSingle();

      if (adminData) {
        const notifMeta = {
          campaign_title: campaign?.title || 'Sans titre',
          brand_name:     brandName,
          action_url:     '/admin/campaigns',
          campaign_creators_ids: selectedCreators.map(c => c.id_w),
        };
        await createNotification({
          campaign_id:       id_t_campagne,
          brand_id:          campaign?.id_w,
          recipient_id:      adminData.id_w,
          recipient_role:    'admin',
          notification_type: 'campaign_assigned',
          metadata:          notifMeta,
        });
        if (adminData.email) {
          await triggerEmailNotification({
            event:           'campaign_assigned',
            recipient_email: adminData.email,
            recipient_name:  adminData.full_name || 'Admin',
            metadata:        notifMeta,
          });
        }
      }

      router.push('/brands/dashboard');
    } catch (err: any) {
      console.error("❌ Erreur lors de l'attribution:", err);
      setAssignError(err.message || "Une erreur est survenue.");
    } finally {
      setIsAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4A017] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-white to-[#FEF9E7] relative overflow-hidden">

      {/* Fond animé */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-[#D4A017] to-[#FFD700] rounded-full blur-3xl"
        />
      </div>

      {/* Modal détail créateur */}
      {modalCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl border border-gray-100 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Profil du créateur</h3>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                <CloseIcon size={22} />
              </button>
            </div>

            {loadingDetails ? (
              <div className="text-center py-12">
                <Loader2 className="inline-block w-8 h-8 text-[#D4A017] animate-spin mb-4" />
                <p className="text-gray-400 text-sm">Chargement...</p>
              </div>
            ) : creatorDetails ? (
              <div className="space-y-6">
                {/* En-tête profil */}
                <div className="flex items-start gap-5 p-5 bg-[#D4A017]/5 rounded-2xl border border-[#D4A017]/10">
                  <div className="w-20 h-20 rounded-full bg-gray-200 border-4 border-white shadow-lg overflow-hidden shrink-0">
                    {creatorDetails.avatar_url ? (
                      <img src={creatorDetails.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#D4A017]/10 text-[#D4A017] font-bold text-2xl">
                        {creatorDetails.full_name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold mb-2">{creatorDetails.full_name || 'Créateur'}</h4>
                    {creatorDetails.niche?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {creatorDetails.niche.map((n: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-[#D4A017]/10 text-[#D4A017] rounded-full text-xs font-bold">{n}</span>
                        ))}
                      </div>
                    )}
                    {modalCreator.matchReasons?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {modalCreator.matchReasons.map((r: string, i: number) => (
                          <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200 font-medium">✓ {r}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats audience */}
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <TrendingUp size={15} className="text-[#D4A017]" /> Audience
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {creatorDetails.instagram_followers > 0 && (
                      <div className="flex items-center gap-2 p-3 bg-pink-50 rounded-xl border border-pink-100">
                        <Instagram size={16} className="text-pink-600 shrink-0" />
                        <div>
                          <p className="text-[10px] text-pink-600 font-bold">Instagram</p>
                          <p className="text-xs font-bold">{formatNumber(creatorDetails.instagram_followers)}</p>
                        </div>
                      </div>
                    )}
                    {creatorDetails.youtube_followers > 0 && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                        <Youtube size={16} className="text-red-600 shrink-0" />
                        <div>
                          <p className="text-[10px] text-red-600 font-bold">YouTube</p>
                          <p className="text-xs font-bold">{formatNumber(creatorDetails.youtube_followers)}</p>
                        </div>
                      </div>
                    )}
                    {creatorDetails.tiktok_followers > 0 && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <Music2 size={16} className="text-gray-700 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-700 font-bold">TikTok</p>
                          <p className="text-xs font-bold">{formatNumber(creatorDetails.tiktok_followers)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bouton sélectionner / désélectionner */}
                <div className="flex gap-3 pt-2 border-t">
                  <button onClick={closeModal} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm">
                    Fermer
                  </button>
                  <button
                    onClick={() => { toggleSelect(modalCreator.id_w); closeModal(); }}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${
                      selectedIds.has(modalCreator.id_w)
                        ? 'bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100'
                        : 'bg-[#D4A017] text-white hover:bg-[#B88A14]'
                    }`}
                  >
                    {selectedIds.has(modalCreator.id_w) ? (
                      <><CloseIcon size={16} /> Retirer la sélection</>
                    ) : (
                      <><UserPlus size={16} /> Sélectionner ce créateur</>
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Modal confirmation finale */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl border border-gray-100">
            <h3 className="text-xl font-bold mb-2">Confirmer la sélection</h3>
            <p className="text-sm text-gray-500 mb-4">
              Vous allez assigner <strong className="text-[#D4A017]">{selectedCreators.length} créateur{selectedCreators.length > 1 ? 's' : ''}</strong> à la campagne <strong>{campaign?.title}</strong>.
            </p>

            {/* Quota publications */}
            <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border mb-4 text-sm font-bold ${
              pubRestantes < 0 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-[#D4A017]/5 border-[#D4A017]/20 text-[#D4A017]'
            }`}>
              <span>Publications assignées</span>
              <span>{totalPubAssignees} / {totalPubCampagne}</span>
            </div>

            <div className="space-y-2 mb-6 max-h-56 overflow-y-auto">
              {selectedCreators.map(c => (
                <div key={c.id_w} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
                    {c.avatar_url
                      ? <img src={c.avatar_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xs">{c.full_name?.charAt(0)}</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{c.full_name}</p>
                    <p className="text-[10px] text-gray-400">{formatNumber(c.totalFollowers)} followers · {c.primaryPlatform}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setPublicationsMap(m => ({ ...m, [c.id_w]: Math.max(1, (m[c.id_w] ?? 1) - 1) }))}
                      className="w-6 h-6 rounded-full border border-gray-300 text-gray-500 hover:border-[#D4A017] hover:text-[#D4A017] flex items-center justify-center font-bold text-sm transition-colors"
                    >−</button>
                    <span className="w-6 text-center text-sm font-black text-[#111827]">{publicationsMap[c.id_w] ?? 1}</span>
                    <button
                      onClick={() => setPublicationsMap(m => ({ ...m, [c.id_w]: (m[c.id_w] ?? 1) + 1 }))}
                      disabled={pubRestantes <= 0}
                      className="w-6 h-6 rounded-full border border-gray-300 text-gray-500 hover:border-[#D4A017] hover:text-[#D4A017] flex items-center justify-center font-bold text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >+</button>
                    <span className="text-[9px] text-gray-400 ml-1">pub.</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-bold mb-1">Ce qui va se passer :</p>
                  <ul className="space-y-0.5 text-xs">
                    <li>• L'admin Woutty reçoit une notification pour validation</li>
                    <li>• Si validé, chaque créateur est notifié et peut accepter ou refuser</li>
                    <li>• Si refusé, vous recevrez un email avec le motif</li>
                    <li>• Vous suivez les réponses depuis votre dashboard</li>
                  </ul>
                </div>
              </div>
            </div>

            {assignError && (
              <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-xl mb-4">{assignError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowConfirm(false); setAssignError(null); }}
                disabled={isAssigning}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmAssign}
                disabled={isAssigning || pubRestantes < 0}
                className="flex-1 py-3 bg-[#D4A017] text-white rounded-xl font-bold hover:bg-[#B88A14] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isAssigning
                  ? <><Loader2 size={16} className="animate-spin" />Envoi en cours...</>
                  : <><CheckCheck size={16} />Confirmer</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 min-h-screen p-4 md:p-8 pb-32">
        <div className="max-w-6xl mx-auto">

          {/* En-tête */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-6 py-3 rounded-full font-bold mb-6 border border-green-200"
            >
              <CheckCircle2 size={20} />
              Analyse terminée !
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#111827] mb-2">
              {suggestedCreators.length} Matchs Parfaits
            </h1>
            <p className="text-lg text-gray-600 mb-1">
              Pour votre campagne <span className="font-bold text-[#D4A017]">{campaign?.title}</span>
            </p>
            <p className="text-sm text-gray-400">Sélectionnez un ou plusieurs créateurs, puis confirmez</p>
          </div>

          {/* Tableau des créateurs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden mb-6">
            <div className="p-5 md:p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#111827]">Créateurs recommandés</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Cochez les créateurs souhaités — cliquez sur un nom pour voir le profil complet
                </p>
              </div>
              {selectedIds.size > 0 && (
                <span className="px-4 py-2 bg-[#D4A017]/10 text-[#D4A017] text-sm font-black rounded-full">
                  {selectedIds.size} sélectionné{selectedIds.size > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 w-10" />
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Créateur</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Plateforme</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Audience</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Match</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Raisons</th>
                    <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Profil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {suggestedCreators.map((creator) => {
                    const matchPct    = Math.min(95, Math.round(creator.matchScore));
                    const isSelected  = selectedIds.has(creator.id_w);

                    return (
                      <tr key={creator.id_w}
                        className={`transition-colors ${isSelected ? 'bg-[#D4A017]/5' : 'hover:bg-gray-50'}`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleSelect(creator.id_w)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-[#D4A017] border-[#D4A017] text-white'
                                : 'border-gray-300 hover:border-[#D4A017]'
                            }`}
                          >
                            {isSelected && <CheckCircle2 size={14} />}
                          </button>
                        </td>

                        {/* Nom */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden shrink-0">
                              {creator.avatar_url
                                ? <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">{creator.full_name?.charAt(0) || '?'}</div>
                              }
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate">{creator.full_name || 'Créateur'}</p>
                              <p className="text-[10px] text-gray-400 truncate">{creator.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Plateforme */}
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-gray-600">{creator.primaryPlatform}</span>
                        </td>

                        {/* Audience */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Users size={12} className="text-gray-400" />
                            <span className="text-xs font-bold">{formatNumber(creator.totalFollowers)}</span>
                          </div>
                        </td>

                        {/* Score */}
                        <td className="px-4 py-3">
                          <div className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-black border ${
                            matchPct >= 80 ? 'bg-green-50 text-green-600 border-green-200'
                            : matchPct >= 60 ? 'bg-yellow-50 text-yellow-600 border-yellow-200'
                            : 'bg-orange-50 text-orange-600 border-orange-200'
                          }`}>
                            {matchPct}%
                          </div>
                        </td>

                        {/* Raisons */}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {creator.matchReasons?.slice(0, 2).map((r: string, i: number) => (
                              <span key={i} className="text-[8px] bg-[#D4A017]/10 text-[#D4A017] px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                                ✓ {r}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Voir profil */}
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openModal(creator)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:border-[#D4A017] hover:text-[#D4A017] transition-all"
                          >
                            Profil <ArrowRight size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center">
            <Link href="/brands/dashboard">
              <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 mx-auto hover:bg-black transition-all shadow-xl">
                <Zap size={18} fill="currentColor" />
                Accéder au Dashboard
                <ArrowRight size={18} />
              </button>
            </Link>
            <p className="text-xs text-gray-400 mt-3">Vous pouvez aussi gérer cette campagne depuis votre dashboard</p>
          </div>
        </div>
      </div>

      {/* Barre de confirmation flottante */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl p-4"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {selectedCreators.slice(0, 4).map(c => (
                  <div key={c.id_w} className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white overflow-hidden">
                    {c.avatar_url
                      ? <img src={c.avatar_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xs">{c.full_name?.charAt(0)}</div>
                    }
                  </div>
                ))}
                {selectedCreators.length > 4 && (
                  <div className="w-9 h-9 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-gray-500">
                    +{selectedCreators.length - 4}
                  </div>
                )}
              </div>
              <div>
                <p className="font-black text-sm text-[#111827]">
                  {selectedIds.size} créateur{selectedIds.size > 1 ? 's' : ''} sélectionné{selectedIds.size > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-gray-400">Prêt à lancer les collaborations</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all"
              >
                Tout déselectionner
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#D4A017] text-white rounded-xl font-bold text-sm hover:bg-[#B88A14] transition-all shadow-lg"
              >
                <Sparkles size={16} />
                Confirmer {selectedIds.size > 1 ? `les ${selectedIds.size} créateurs` : 'le créateur'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

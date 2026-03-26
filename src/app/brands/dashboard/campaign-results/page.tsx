"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, Loader2, CheckCircle2, Instagram, Youtube,
  Music2, TrendingUp, Users, Star, Zap, X as CloseIcon
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

  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<any>(null);
  const [suggestedCreators, setSuggestedCreators] = useState<any[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null);
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [loadingCreatorDetails, setLoadingCreatorDetails] = useState(false);
  const [creatorDetails, setCreatorDetails] = useState<any>(null);
  const [showCampaignSelection, setShowCampaignSelection] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const getPrimaryPlatform = (creator: any) => {
    const platforms = [
      { name: 'Instagram', followers: creator.instagram_followers || 0 },
      { name: 'YouTube', followers: creator.youtube_followers || 0 },
      { name: 'TikTok', followers: creator.tiktok_followers || 0 },
      { name: 'X', followers: creator.x_followers || 0 },
      { name: 'Snap', followers: creator.snap_followers || 0 }
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

      if (error || !allCreators) {
        console.error("❌ Erreur créateurs:", error);
        return [];
      }

      const campaignNiches = Array.isArray(campaignData.interests) ? campaignData.interests : [];

      const scoredCreators = allCreators.map(creator => {
        let score = 0;
        const reasons: string[] = [];

        if (campaignNiches.length > 0 && creator.niche) {
          const creatorNiches = Array.isArray(creator.niche) ? creator.niche : [];
          const nicheMatch = creatorNiches.some(cn =>
            campaignNiches.some(campNiche =>
              cn.toLowerCase().includes(campNiche.toLowerCase()) ||
              campNiche.toLowerCase().includes(cn.toLowerCase())
            )
          );

          if (nicheMatch) {
            score += 40;
            reasons.push("Niche correspondante");
          }
        }

        const totalFollowers =
          (creator.instagram_followers || 0) +
          (creator.youtube_followers || 0) +
          (creator.tiktok_followers || 0);

        if (totalFollowers > 100000) {
          score += 30;
          reasons.push("Grande audience");
        } else if (totalFollowers > 50000) {
          score += 25;
        } else if (totalFollowers > 10000) {
          score += 20;
        } else if (totalFollowers > 1000) {
          score += 10;
        }

        const budget = parseFloat(campaignData.budget) || 0;
        if (budget > 0) {
          const estimatedCost = totalFollowers * 10;
          if (estimatedCost <= budget * 1.2) {
            score += 20;
            reasons.push("Budget adapté");
          } else if (estimatedCost <= budget * 1.5) {
            score += 10;
          }
        }

        let profileScore = 0;
        if (creator.avatar_url) profileScore += 3;
        if (creator.full_name) profileScore += 2;
        if (creator.phone) profileScore += 2;
        if (creator.instagram_username || creator.youtube_username || creator.tiktok_username) profileScore += 3;

        score += profileScore;
        if (profileScore >= 8) reasons.push("Profil complet");

        return {
          ...creator,
          matchScore: score,
          matchReasons: reasons,
          totalFollowers,
          primaryPlatform: getPrimaryPlatform(creator)
        };
      });

      return scoredCreators
        .filter(c => c.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);
    } catch (err) {
      console.error("❌ Erreur suggestion:", err);
      return [];
    }
  };

  const loadCampaignAndCreators = async () => {
    try {
      if (!id_t_campagne) {
        router.push('/brands/dashboard');
        return;
      }

      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id_t_campagne', id_t_campagne)
        .single();

      if (campaignError || !campaignData) {
        console.error("❌ Erreur campagne:", campaignError);
        router.push('/brands/dashboard');
        return;
      }

      setCampaign(campaignData);

      const creators = await getSuggestedCreators(campaignData);
      setSuggestedCreators(creators);

      setLoading(false);
    } catch (error) {
      console.error("❌ Erreur:", error);
      router.push('/brands/dashboard');
    }
  };

  useEffect(() => {
    loadCampaignAndCreators();
  }, []);

  const loadCreatorDetails = async (creatorId: string) => {
    setLoadingCreatorDetails(true);
    try {
      const { data, error } = await supabase
        .from('createur')
        .select('*')
        .eq('id_w', creatorId)
        .single();

      if (error) {
        console.error("❌ Erreur détails créateur:", error);
        return null;
      }

      setCreatorDetails(data);
      return data;
    } catch (err) {
      console.error("❌ Erreur:", err);
      return null;
    } finally {
      setLoadingCreatorDetails(false);
    }
  };

  const handleCreatorClick = async (creator: any) => {
    setSelectedCreator(creator);
    setShowCreatorModal(true);
    setShowCampaignSelection(false);
    await loadCreatorDetails(creator.id_w);
  };

  const proceedToCampaignSelection = () => {
    setShowCampaignSelection(true);
  };

 const handleAssignCampaign = async () => {
  const creatorId = selectedCreator?.id_w;

  if (!creatorId || !id_t_campagne) {
    alert("❌ Erreur : Impossible d'identifier le créateur ou la campagne.");
    return;
  }

  console.log("🔄 Attribution de la campagne...");
  console.log("   📊 Campaign ID:", id_t_campagne);
  console.log("   👤 Creator ID:", creatorId);
  console.log("   ✍️ Creator Name:", selectedCreator?.full_name);

  setIsAssigning(true);
  
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ 
        assigned_creator_id: creatorId,
        creator_status: 'pending',  
        status: 'assigned'
      })
      .eq('id_t_campagne', id_t_campagne)
      .select();  

    if (error) {
      console.error("❌ Erreur Supabase:", error);
      throw error;
    }
    
    console.log("✅ Campagne mise à jour:", data);

    if (data && data.length > 0) {
      console.log("✅ SUCCÈS !");
      console.log("   - creator_status:", data[0].creator_status);
      console.log("   - assigned_creator_id:", data[0].assigned_creator_id);
      console.log("   - Le créateur verra cette campagne ");
    }

    // Notification : campaign_assigned → notifie le créateur
    try {
      const { data: brandData } = await supabase
        .from('marque')
        .select('nom_marque')
        .eq('id_w', campaign?.id_w)
        .maybeSingle();

      const notifMeta = {
        campaign_title: campaign?.title || 'Sans titre',
        brand_name: brandData?.nom_marque || 'Marque',
        action_url: '/creators/dashboard',
      };

      await createNotification({
        campaign_id: id_t_campagne!,
        brand_id: campaign?.id_w,
        recipient_id: selectedCreator.id_w,
        recipient_role: 'creator',
        notification_type: 'campaign_assigned',
        metadata: notifMeta,
      });

      const creatorEmail = creatorDetails?.email || selectedCreator?.email;
      if (creatorEmail) {
        await triggerEmailNotification({
          event: 'campaign_assigned',
          recipient_email: creatorEmail,
          recipient_name: selectedCreator.full_name || 'Créateur',
          metadata: notifMeta,
        });
      }
    } catch (notifErr) {
      console.error('⚠️ Notification campaign_assigned non envoyée:', notifErr);
    }

    alert(
      `✅ Campagne attribuée avec succès à ${selectedCreator?.full_name} !\n\n` +
      `📧 Le créateur verra cette campagne .\n\n` +
      `Le créateur pourra l'accepter ou la refuser.`
    );
    
    setSelectedCreator(null);
    setCreatorDetails(null);
    setShowCampaignSelection(false);
    setShowCreatorModal(false);  
    
    router.push('/brands/dashboard');
    
  } catch (error: any) {
    console.error("❌ Erreur lors de l'attribution:", error);
    alert("❌ Erreur : " + error.message);
  } finally {
    setIsAssigning(false);
  }
};

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
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
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-[#D4A017] to-[#FFD700] rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-[#D4A017] to-[#FFD700] rounded-full blur-3xl"
        />
      </div>

      {showCreatorModal && selectedCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl p-8 shadow-2xl border border-gray-100 my-8">
            
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-[#111827]">
                {showCampaignSelection ? 'Confirmer l\'attribution' : 'Profil du créateur'}
              </h3>
              <button 
                onClick={() => {
                  setSelectedCreator(null);
                  setCreatorDetails(null);
                  setShowCampaignSelection(false);
                }} 
                className="p-2 text-gray-400 hover:text-[#111827] transition-colors"
              >
                <CloseIcon size={24} />
              </button>
            </div>

            {!showCampaignSelection ? (
              loadingCreatorDetails ? (
                <div className="text-center py-12">
                  <Loader2 className="inline-block w-8 h-8 text-[#D4A017] animate-spin mb-4" />
                  <p className="text-gray-400">Chargement des détails...</p>
                </div>
              ) : creatorDetails ? (
                <div className="space-y-6">
                  <div className="flex items-start gap-6 p-6 bg-gradient-to-br from-[#D4A017]/5 to-[#FFD700]/5 rounded-2xl border border-[#D4A017]/10">
                    <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-lg overflow-hidden shrink-0">
                      {creatorDetails.avatar_url ? (
                        <img src={creatorDetails.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#D4A017]/10 text-[#D4A017] font-bold text-3xl">
                          {creatorDetails.full_name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-[#111827] mb-2">{creatorDetails.full_name || 'Créateur'}</h4>
                      {creatorDetails.niche && creatorDetails.niche.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {creatorDetails.niche.map((n: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-[#D4A017]/10 text-[#D4A017] rounded-full text-xs font-bold">
                              {n}
                            </span>
                          ))}
                        </div>
                      )}
                      {selectedCreator.matchReasons && selectedCreator.matchReasons.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {selectedCreator.matchReasons.map((reason: string, i: number) => (
                            <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200 font-medium">
                              ✓ {reason}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* STATISTIQUES DE FOLLOWERS/FOLLOWING */}
                  <div>
                    <h5 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                      <TrendingUp size={16} className="text-[#D4A017]" />
                      Statistiques d'audience
                    </h5>
                    <div className="grid md:grid-cols-3 gap-4">
                      {creatorDetails.instagram_followers > 0 && (
                        <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl border border-pink-100">
                          <Instagram size={20} className="text-pink-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-pink-600 font-bold">Instagram</p>
                            <p className="text-sm font-bold text-gray-900">{formatNumber(creatorDetails.instagram_followers || 0)} followers</p>
                            {creatorDetails.instagram_following > 0 && (
                              <p className="text-xs text-gray-500">{formatNumber(creatorDetails.instagram_following || 0)} following</p>
                            )}
                          </div>
                        </div>
                      )}
                      {creatorDetails.youtube_followers > 0 && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                          <Youtube size={20} className="text-red-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-red-600 font-bold">YouTube</p>
                            <p className="text-sm font-bold text-gray-900">{formatNumber(creatorDetails.youtube_followers || 0)} abonnés</p>
                            {creatorDetails.youtube_following > 0 && (
                              <p className="text-xs text-gray-500">{formatNumber(creatorDetails.youtube_following || 0)} abonnements</p>
                            )}
                          </div>
                        </div>
                      )}
                      {creatorDetails.tiktok_followers > 0 && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <Music2 size={20} className="text-gray-700 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-700 font-bold">TikTok</p>
                            <p className="text-sm font-bold text-gray-900">{formatNumber(creatorDetails.tiktok_followers || 0)} followers</p>
                            {creatorDetails.tiktok_following > 0 && (
                              <p className="text-xs text-gray-500">{formatNumber(creatorDetails.tiktok_following || 0)} following</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* USERNAMES DES RÉSEAUX SOCIAUX */}
                  <div>
                    <h5 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                      <Sparkles size={16} className="text-[#D4A017]" />
                      Réseaux sociaux
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {creatorDetails.instagram_username && (
                        <div className="flex items-center gap-2 p-3 text-gray-700 bg-gray-50 rounded-lg">
                          <Instagram size={18} className="text-pink-600" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-pink-600 font-bold">Instagram</p>
                            <p className="text-xs font-medium truncate">@{creatorDetails.instagram_username}</p>
                          </div>
                        </div>
                      )}
                      {creatorDetails.youtube_username && (
                        <div className="flex items-center gap-2 p-3 text-gray-700 bg-gray-50 rounded-lg">
                          <Youtube size={18} className="text-red-600" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-red-600 font-bold">YouTube</p>
                            <p className="text-xs font-medium truncate">@{creatorDetails.youtube_username}</p>
                          </div>
                        </div>
                      )}
                      {creatorDetails.tiktok_username && (
                        <div className="flex items-center gap-2 p-3 text-gray-700 bg-gray-50 rounded-lg">
                          <Music2 size={18} className="text-gray-700" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-gray-700 font-bold">TikTok</p>
                            <p className="text-xs font-medium truncate">@{creatorDetails.tiktok_username}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 border-t">
                    <button
                      onClick={() => {
                        setSelectedCreator(null);
                        setCreatorDetails(null);
                      }}
                      className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={proceedToCampaignSelection}
                      className="flex-1 py-3 bg-[#D4A017] text-white rounded-xl font-bold hover:bg-[#B88A14] transition-all flex items-center justify-center gap-2"
                    >
                      Attribuer cette campagne
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ) : null
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-6">
                  Confirmez l'attribution de votre campagne <strong className="text-[#D4A017]">{campaign?.title}</strong> à <strong>{creatorDetails?.full_name}</strong>
                </p>
                
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-blue-900 mb-2">Que se passe-t-il ensuite ?</p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Le créateur sera notifié de votre choix</li>
                        <li>• Le statut de la campagne passera à "Attribuée"</li>
                        <li>• Vous pourrez suivre la collaboration depuis votre dashboard</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowCampaignSelection(false)}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={handleAssignCampaign}
                    disabled={isAssigning}
                    className="flex-1 py-3 bg-[#D4A017] text-white rounded-xl font-bold hover:bg-[#B88A14] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isAssigning ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Attribution...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        Confirmer l'attribution
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative z-10 min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          
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
            <p className="text-sm text-gray-400">
              Triés par pertinence grâce à notre IA
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden mb-6">
            <div className="p-5 md:p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#111827]">Créateurs recommandés</h2>
              <p className="text-xs text-gray-400 mt-1">
                Cliquez sur "Voir & Attribuer" pour voir le profil du créateur et attribuer la campagne
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Créateur</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Plateforme</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Audience</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Match</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Raisons</th>
                    <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {suggestedCreators.map((creator) => {
                    const matchPercentage = Math.min(95, Math.round(creator.matchScore));

                    return (
                      <tr key={creator.id_w} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                              {creator.avatar_url ? (
                                <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-sm">
                                  {creator.full_name?.charAt(0) || '?'}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate">{creator.full_name || 'Créateur'}</p>
                              <p className="text-[10px] text-gray-400 truncate">{creator.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-gray-600">{creator.primaryPlatform}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Users size={12} className="text-gray-400" />
                            <span className="text-xs font-bold text-gray-900">{formatNumber(creator.totalFollowers)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-black border ${
                            matchPercentage >= 80
                              ? 'bg-green-50 text-green-600 border-green-200'
                              : matchPercentage >= 60
                              ? 'bg-yellow-50 text-yellow-600 border-yellow-200'
                              : 'bg-orange-50 text-orange-600 border-orange-200'
                          }`}>
                            {matchPercentage}%
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {creator.matchReasons && creator.matchReasons.slice(0, 2).map((reason: string, i: number) => (
                              <span
                                key={i}
                                className="text-[8px] bg-[#D4A017]/10 text-[#D4A017] px-1.5 py-0.5 rounded font-bold whitespace-nowrap"
                              >
                                ✓ {reason}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleCreatorClick(creator)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4A017] text-white rounded-lg text-xs font-bold hover:bg-[#B88A14] transition-all"
                          >
                            Voir & Attribuer
                            <ArrowRight size={12} />
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
              <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-base flex items-center gap-2 mx-auto hover:bg-black transition-all shadow-xl hover:shadow-2xl">
                <Zap size={20} fill="currentColor" />
                Accéder au Dashboard
                <ArrowRight size={20} />
              </button>
            </Link>
            <p className="text-xs text-gray-400 mt-3">
              Vous pourrez également gérer cette campagne depuis votre dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

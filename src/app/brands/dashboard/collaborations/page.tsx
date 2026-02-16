"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UserCheck, ArrowLeft, Loader2, Calendar, Mail, Instagram, 
  ExternalLink, CheckCircle, Building2, TrendingUp, DollarSign,
  Youtube, Music2, Phone, Clock
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function BrandCollaborations() {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [loading, setLoading] = useState(true);
  const [collaborations, setCollaborations] = useState<any[]>([]);

  const fetchCollaborations = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const USER_ID = session.user.id;

      const { data: campaignsData, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id_w', USER_ID)
        .eq('creator_status', 'accepted')
        .order('accepted_at', { ascending: false });

      if (error) {
        console.error("❌ Erreur récupération campagnes:", error);
        return;
      }

      console.log("📋 Campagnes acceptées:", campaignsData);
      console.log("📊 Nombre:", campaignsData?.length || 0);

      if (campaignsData && campaignsData.length > 0) {
        const collaborationsWithCreators = await Promise.all(
          campaignsData.map(async (campaign) => {
            const { data: creatorInfo } = await supabase
              .from('createur')
              .select('*')
              .eq('id_w', campaign.assigned_creator_id)
              .single();

            const { data: creatorProfile } = await supabase
              .from('info_profile')
              .select('*')
              .eq('id_w', campaign.assigned_creator_id)
              .single();

            return {
              campaign,
              creatorProfile,
              creatorInfo
            };
          })
        );

        setCollaborations(collaborationsWithCreators);
      } else {
        setCollaborations([]);
      }

    } catch (error) {
      console.error("❌ Erreur générale:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#D4A017] animate-spin mx-auto mb-4" />
          <p className="font-bold text-[#D4A017]">Chargement des collaborations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      {/* ✅ CHANGÉ : max-w-7xl → max-w-5xl pour largeur réduite */}
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <Link href="/brands/dashboard">
            <button className="flex items-center gap-2 text-gray-400 hover:text-[#D4A017] font-bold mb-4 transition-colors">
              <ArrowLeft size={20} />
              Retour au dashboard
            </button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#111827] flex items-center gap-3">
                <CheckCircle size={32} className="text-green-600" />
                Collaborations Confirmées
              </h1>
              <p className="text-gray-400 text-sm mt-2">
                {collaborations.length} créateur{collaborations.length > 1 ? 's ont' : ' a'} accepté vos campagnes
              </p>
            </div>
            
            <button
              onClick={fetchCollaborations}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-[#D4A017] hover:text-[#D4A017] transition-all"
            >
              <Clock size={16} className={loading ? 'animate-spin' : ''} />
              Actualiser
            </button>
          </div>
        </div>

        {/* LISTE DES COLLABORATIONS */}
        {collaborations.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserCheck size={40} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-600 mb-2">Aucune collaboration confirmée</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Les créateurs n'ont pas encore accepté vos demandes d'attribution. 
              Dès qu'un créateur accepte une mission, il apparaîtra ici.
            </p>
            <Link href="/brands/dashboard">
              <button className="bg-[#D4A017] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#B88A14] transition-all">
                Retour au dashboard
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            {/* EN-TÊTE */}
            <div className="p-5 md:p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <h2 className="text-xl font-bold text-[#111827]">
                Collaborations actives ({collaborations.length})
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Gérez vos collaborations en cours avec les créateurs
              </p>
            </div>

            {/* VERSION DESKTOP - Tableau */}
            <div className="overflow-x-auto">
              <table className="hidden md:table w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                      Créateur
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                      Campagne
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                      Budget
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                      Période
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {collaborations.map((collab) => {
                    const { campaign, creatorInfo } = collab;
                    const campaignKey = campaign.id_t_campagne || campaign.id;
                    const daysLeft = campaign.end_date 
                      ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))
                      : 0;

                    return (
                      <tr key={campaignKey} className="hover:bg-green-50/50 transition-colors">
                        {/* CRÉATEUR */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
                              {creatorInfo?.avatar_url ? (
                                <img 
                                  src={creatorInfo.avatar_url} 
                                  alt="" 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#D4A017] text-white text-lg font-bold">
                                  {creatorInfo?.full_name?.charAt(0) || '?'}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate">
                                {creatorInfo?.full_name || 'Créateur'}
                              </p>
                              {creatorInfo?.email && (
                                <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                                  <Mail size={10} />
                                  {creatorInfo.email}
                                </p>
                              )}
                              {/* Réseaux sociaux */}
                              <div className="flex gap-2 mt-1">
                                {creatorInfo?.instagram_followers > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-pink-600">
                                    <Instagram size={10} />
                                    {formatNumber(creatorInfo.instagram_followers)}
                                  </div>
                                )}
                                {creatorInfo?.youtube_followers > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-red-600">
                                    <Youtube size={10} />
                                    {formatNumber(creatorInfo.youtube_followers)}
                                  </div>
                                )}
                                {creatorInfo?.tiktok_followers > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-gray-700">
                                    <Music2 size={10} />
                                    {formatNumber(creatorInfo.tiktok_followers)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* CAMPAGNE */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 size={14} className="text-gray-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-700 truncate">
                                {campaign.title || 'Campagne'}
                              </p>
                              {campaign.accepted_at && (
                                <p className="text-xs text-green-600 truncate">
                                  Acceptée le {formatDate(campaign.accepted_at)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* BUDGET */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <DollarSign size={12} className="text-green-600" />
                            <span className="text-sm font-black text-green-700">
                              {parseFloat(campaign.budget || 0).toLocaleString('fr-FR')}
                            </span>
                            <span className="text-xs text-gray-500">CFA</span>
                          </div>
                        </td>

                        {/* PÉRIODE */}
                        <td className="px-4 py-4">
                          <div className="text-xs text-gray-600">
                            <p className="font-medium">{formatDate(campaign.start_date)}</p>
                            <p className="text-gray-400">au {formatDate(campaign.end_date)}</p>
                            {daysLeft > 0 && (
                              <span className="inline-block mt-1 text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold">
                                {daysLeft}j restants
                              </span>
                            )}
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-4 py-4">
                          <div className="flex gap-2 justify-end">
                            {creatorInfo?.email && (
                              <a
                                href={`mailto:${creatorInfo.email}?subject=Collaboration: ${campaign.title}`}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Envoyer un email"
                              >
                                <Mail size={18} />
                              </a>
                            )}
                            <Link href={`/brands/dashboard/details/${campaignKey}`}>
                              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4A017] text-white rounded-lg text-xs font-bold hover:bg-[#B88A14] transition-all">
                                <ExternalLink size={14} />
                                Détails
                              </button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* VERSION MOBILE - Liste compacte */}
              <div className="md:hidden divide-y divide-gray-100">
                {collaborations.map((collab) => {
                  const { campaign, creatorInfo } = collab;
                  const campaignKey = campaign.id_t_campagne || campaign.id;
                  const daysLeft = campaign.end_date 
                    ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))
                    : 0;

                  return (
                    <div key={campaignKey} className="p-4 hover:bg-green-50/50 transition-colors">
                      {/* En-tête mobile */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
                          {creatorInfo?.avatar_url ? (
                            <img 
                              src={creatorInfo.avatar_url} 
                              alt="" 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#D4A017] text-white font-bold">
                              {creatorInfo?.full_name?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">
                            {creatorInfo?.full_name || 'Créateur'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {campaign.title || 'Campagne'}
                          </p>
                          {creatorInfo?.email && (
                            <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-1">
                              <Mail size={10} />
                              {creatorInfo.email}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold shrink-0">
                          ✓ Acceptée
                        </span>
                      </div>

                      {/* Réseaux sociaux mobile */}
                      <div className="flex gap-3 mb-3 text-xs">
                        {creatorInfo?.instagram_followers > 0 && (
                          <div className="flex items-center gap-1 text-pink-600">
                            <Instagram size={12} />
                            {formatNumber(creatorInfo.instagram_followers)}
                          </div>
                        )}
                        {creatorInfo?.youtube_followers > 0 && (
                          <div className="flex items-center gap-1 text-red-600">
                            <Youtube size={12} />
                            {formatNumber(creatorInfo.youtube_followers)}
                          </div>
                        )}
                        {creatorInfo?.tiktok_followers > 0 && (
                          <div className="flex items-center gap-1 text-gray-700">
                            <Music2 size={12} />
                            {formatNumber(creatorInfo.tiktok_followers)}
                          </div>
                        )}
                      </div>

                      {/* Infos principales */}
                      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                        <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                          <p className="text-green-600 font-bold mb-0.5">Budget</p>
                          <p className="font-black text-green-700">
                            {parseFloat(campaign.budget || 0).toLocaleString('fr-FR')} CFA
                          </p>
                        </div>
                        <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                          <p className="text-blue-600 font-bold mb-0.5">Durée</p>
                          <p className="font-black text-blue-700">{daysLeft} jours</p>
                        </div>
                      </div>

                      {/* Période */}
                      <div className="text-xs text-gray-500 mb-3 pb-3 border-b">
                        <p>Du {formatDate(campaign.start_date)} au {formatDate(campaign.end_date)}</p>
                        {campaign.accepted_at && (
                          <p className="text-green-600 mt-1">
                            Acceptée le {formatDate(campaign.accepted_at)}
                          </p>
                        )}
                      </div>

                      {/* Actions mobile */}
                      <div className="flex gap-2">
                        {creatorInfo?.email && (
                          <a
                            href={`mailto:${creatorInfo.email}?subject=Collaboration: ${campaign.title}`}
                            className="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                          >
                            <Mail size={16} />
                            Email
                          </a>
                        )}
                        <Link 
                          href={`/brands/dashboard/details/${campaignKey}`}
                          className="flex-1 py-2.5 bg-[#D4A017] text-white rounded-lg text-sm font-bold hover:bg-[#B88A14] transition-all flex items-center justify-center gap-2"
                        >
                          <ExternalLink size={16} />
                          Détails
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

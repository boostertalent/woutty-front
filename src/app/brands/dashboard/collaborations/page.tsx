"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UserCheck, Loader2, Calendar, Mail, Instagram, 
  ExternalLink, CheckCircle, Building2, DollarSign,
  Youtube, Music2, Clock
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
      if (!session) { router.push('/auth/login'); return; }

      const { data: campaignsData, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id_w', session.user.id)
        .eq('creator_status', 'accepted')
        .order('accepted_at', { ascending: false });

      if (error || !campaignsData?.length) { setCollaborations([]); return; }

      const collaborationsWithCreators = await Promise.all(
        campaignsData.map(async (campaign) => {
          const { data: creatorInfo } = await supabase
            .from('createur').select('*').eq('id_w', campaign.assigned_creator_id).single();
          return { campaign, creatorInfo };
        })
      );
      setCollaborations(collaborationsWithCreators);
    } catch (error) {
      console.error("❌", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCollaborations(); }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-[#D4A017] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* EN-TÊTE */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#111827] flex items-center gap-3">
              <CheckCircle size={32} className="text-green-600" />
              Collaborations Confirmées
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              {collaborations.length} créateur{collaborations.length > 1 ? 's ont' : ' a'} accepté vos campagnes
            </p>
          </div>
          <button onClick={fetchCollaborations} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-[#D4A017] hover:text-[#D4A017] transition-all">
            <Clock size={16} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>

        {/* LISTE */}
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
            <div className="p-5 md:p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <h2 className="text-xl font-bold text-[#111827]">Collaborations actives ({collaborations.length})</h2>
              <p className="text-xs text-gray-500 mt-1">Gérez vos collaborations en cours avec les créateurs</p>
            </div>

            {/* TABLEAU DESKTOP */}
            <div className="overflow-x-auto">
              <table className="hidden md:table w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Créateur', 'Campagne', 'Budget', 'Période', 'Actions'].map((h, i) => (
                      <th key={h} className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {collaborations.map(({ campaign, creatorInfo }) => {
                    const key = campaign.id_t_campagne || campaign.id;
                    const daysLeft = campaign.end_date ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 3600 * 24))) : 0;
                    return (
                      <tr key={key} className="hover:bg-green-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
                              {creatorInfo?.avatar_url ? (
                                <img src={creatorInfo.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#D4A017] text-white text-lg font-bold">
                                  {creatorInfo?.full_name?.charAt(0) || '?'}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate">{creatorInfo?.full_name || 'Créateur'}</p>
                              {creatorInfo?.email && <p className="text-xs text-gray-400 flex items-center gap-1"><Mail size={10} />{creatorInfo.email}</p>}
                              <div className="flex gap-2 mt-1">
                                {creatorInfo?.instagram_followers > 0 && <span className="flex items-center gap-1 text-xs text-pink-600"><Instagram size={10} />{formatNumber(creatorInfo.instagram_followers)}</span>}
                                {creatorInfo?.youtube_followers > 0 && <span className="flex items-center gap-1 text-xs text-red-600"><Youtube size={10} />{formatNumber(creatorInfo.youtube_followers)}</span>}
                                {creatorInfo?.tiktok_followers > 0 && <span className="flex items-center gap-1 text-xs text-gray-700"><Music2 size={10} />{formatNumber(creatorInfo.tiktok_followers)}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 size={14} className="text-gray-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-700 truncate">{campaign.title || 'Campagne'}</p>
                              {campaign.accepted_at && <p className="text-xs text-green-600">Acceptée le {formatDate(campaign.accepted_at)}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <DollarSign size={12} className="text-green-600" />
                            <span className="text-sm font-black text-green-700">{parseFloat(campaign.budget||0).toLocaleString('fr-FR')}</span>
                            <span className="text-xs text-gray-500">CFA</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-xs text-gray-600">
                            <p className="font-medium">{formatDate(campaign.start_date)}</p>
                            <p className="text-gray-400">au {formatDate(campaign.end_date)}</p>
                            {daysLeft > 0 && <span className="inline-block mt-1 text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold">{daysLeft}j restants</span>}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2 justify-end">
                            {creatorInfo?.email && (
                              <a href={`mailto:${creatorInfo.email}?subject=Collaboration: ${campaign.title}`}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Email">
                                <Mail size={18} />
                              </a>
                            )}
                            <Link href={`/brands/dashboard/details/${key}`}>
                              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4A017] text-white rounded-lg text-xs font-bold hover:bg-[#B88A14] transition-all">
                                <ExternalLink size={14} /> Détails
                              </button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* MOBILE */}
              <div className="md:hidden divide-y divide-gray-100">
                {collaborations.map(({ campaign, creatorInfo }) => {
                  const key = campaign.id_t_campagne || campaign.id;
                  const daysLeft = campaign.end_date ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 3600 * 24))) : 0;
                  return (
                    <div key={key} className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
                          {creatorInfo?.avatar_url ? (
                            <img src={creatorInfo.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#D4A017] text-white font-bold">{creatorInfo?.full_name?.charAt(0)||'?'}</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">{creatorInfo?.full_name||'Créateur'}</p>
                          <p className="text-xs text-gray-500 truncate">{campaign.title||'Campagne'}</p>
                        </div>
                        <span className="text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold shrink-0">✓ Acceptée</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                        <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                          <p className="text-green-600 font-bold mb-0.5">Budget</p>
                          <p className="font-black text-green-700">{parseFloat(campaign.budget||0).toLocaleString('fr-FR')} CFA</p>
                        </div>
                        <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                          <p className="text-blue-600 font-bold mb-0.5">Jours restants</p>
                          <p className="font-black text-blue-700">{daysLeft}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {creatorInfo?.email && (
                          <a href={`mailto:${creatorInfo.email}`} className="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                            <Mail size={16} /> Email
                          </a>
                        )}
                        <Link href={`/brands/dashboard/details/${key}`} className="flex-1 py-2.5 bg-[#D4A017] text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                          <ExternalLink size={16} /> Détails
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

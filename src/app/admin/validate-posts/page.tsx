"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
  Check, X, Eye, Loader2, ArrowLeft, Calendar, User,
  Heart, MessageCircle, Share2, TrendingUp, ExternalLink,
  Shield, AlertCircle, CheckCircle2, Filter, Building2
} from 'lucide-react';
import { createNotification } from '@/lib/notifications';
import { triggerEmailNotification } from '@/lib/n8n';

export default function ValidatePostsPage() {
  const router = useRouter();
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'validated'>('pending');
  const [processingPostId, setProcessingPostId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadPosts();
  }, [filter]);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Chargement des posts...');

      // ✅ Charger les posts
      let query = supabase
        .from('info_poste')
        .select('*')
        .not('id_t_campagne', 'is', null)
        .order('date_poste', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('is_validated', false);
      } else if (filter === 'validated') {
        query = query.eq('is_validated', true);
      }

      const { data: postsData, error: postsError } = await query;

      if (postsError) {
        console.error('❌ Erreur posts:', postsError);
        throw postsError;
      }

      console.log('✅ Posts chargés:', postsData?.length);

      // ✅ Charger les infos des campagnes séparément 
      const campaignIds = [...new Set(postsData?.map(p => p.id_t_campagne).filter(Boolean))];
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id_t_campagne, title, start_date, end_date, id_w')
        .in('id_t_campagne', campaignIds);

      if (campaignsError) {
        console.error('⚠️ Erreur campagnes:', campaignsError);
      }

      console.log('✅ Campagnes chargées:', campaignsData?.length);

      // ✅ Charger les infos des créateurs séparément
      const creatorIds = [...new Set(postsData?.map(p => p.id_w).filter(Boolean))];
      const { data: creatorsData, error: creatorsError } = await supabase
        .from('createur')
        .select('id_w, full_name, avatar_url')
        .in('id_w', creatorIds);

      if (creatorsError) {
        console.error('⚠️ Erreur créateurs:', creatorsError);
      }

      console.log('✅ Créateurs chargés:', creatorsData?.length);

      // ✅ Charger les infos des marques séparément
      const brandIds = [...new Set(campaignsData?.map(c => c.id_w).filter(Boolean))];
      console.log('🔍 Brand IDs trouvés:', brandIds);

      let brandsData = null;
      if (brandIds.length > 0) {
        const { data, error: brandsError } = await supabase
          .from('marque')
          .select('id_w, nom_marque, logo_url')
          .in('id_w', brandIds);

        if (brandsError) {
          console.error('⚠️ Erreur marques:', brandsError);
        }
        brandsData = data;
      }

      console.log('✅ Marques chargées:', brandsData?.length);

      // ✅ Mapper les données
      const campaignsMap = new Map(campaignsData?.map(c => [c.id_t_campagne, c]) || []);
      const creatorsMap = new Map(creatorsData?.map(c => [c.id_w, c]) || []);
      const brandsMap = new Map(brandsData?.map(b => [b.id_w, b]) || []);

      const enrichedPosts = postsData?.map(post => {
        const campaign = campaignsMap.get(post.id_t_campagne);
        return {
          ...post,
          campaigns: campaign,
          createur: creatorsMap.get(post.id_w),
          marque: campaign ? brandsMap.get(campaign.id_w) : null
        };
      }) || [];

      console.log('✅ Posts enrichis:', enrichedPosts.length);
      if (enrichedPosts.length > 0) {
        console.log('📊 Exemple post:', enrichedPosts[0]);
      }
      
      setPendingPosts(enrichedPosts);

    } catch (err: any) {
      console.error('❌ Erreur complète:', err);
      setError(err.message || 'Erreur lors du chargement');
      setPendingPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const validatePost = async (postId: string, approved: boolean) => {
    setProcessingPostId(postId);
    setError(null);
    
    try {
      console.log(`${approved ? '✅' : '❌'} Validation du post:`, postId);

      const { error: updateError } = await supabase
        .from('info_poste')
        .update({ 
          is_validated: approved,
          validated_at: approved ? new Date().toISOString() : null
        })
        .eq('id_t_poste', postId);

      if (updateError) {
        console.error('❌ Erreur update:', updateError);
        throw updateError;
      }

      console.log('✅ Post mis à jour');

      // ✅ Log de l'activité admin
      await logAdminActivity(
        approved ? 'VALIDATE_POST' : 'REJECT_POST',
        'post',
        postId,
        `Post ${approved ? 'validé' : 'rejeté'}`
      );

      // ✅ Notifier le créateur — validation ou rejet (F1 — CDC)
      const post = pendingPosts.find((p) => p.id_t_poste === postId);
      if (post?.id_w) {
        const { data: creatorData } = await supabase
          .from('createur')
          .select('id_w, email, full_name')
          .eq('id_w', post.id_w)
          .maybeSingle();

        if (creatorData) {
          const notifMeta = {
            campaign_title: post.campaigns?.title ?? 'Campagne',
            post_id: postId,
            action_url: '/creators/dashboard',
          };

          await createNotification({
            campaign_id: post.id_t_campagne ?? undefined,
            creator_id: post.id_w,
            recipient_id: creatorData.id_w,
            recipient_role: 'creator',
            notification_type: approved ? 'content_validated' : 'content_rejected',
            metadata: notifMeta,
          });

          await triggerEmailNotification({
            event: approved ? 'content_validated' : 'content_rejected',
            recipient_email: creatorData.email,
            recipient_name: creatorData.full_name || 'Créateur',
            metadata: notifMeta,
          });
        }
      }

      // ✅ Recharger les posts
      await loadPosts();

    } catch (err: any) {
      console.error('❌ Erreur validation:', err);
      setError(`Erreur: ${err.message}`);
    } finally {
      setProcessingPostId(null);
    }
  };

  const logAdminActivity = async (action: string, targetType: string, targetId: string, details: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer le nom de l'admin
      const { data: adminData } = await supabase
        .from('createur')
        .select('full_name')
        .eq('id_w', user.id)
        .maybeSingle();

      await supabase.from('admin_logs').insert({
        admin_id: user.id,
        admin_name: adminData?.full_name || 'Admin',
        action,
        target_type: targetType,
        target_id: targetId,
        details,
        created_at: new Date().toISOString()
      });

      console.log('✅ Log admin créé');
    } catch (err) {
      console.warn('⚠️ Erreur log:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    const n = Number(num);
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return Math.round(n).toString();
  };

  const calculateEngagementRate = (post: any): string => {
    const likes = post.nbre_like || 0;
    const comments = post.nbre_commentaire || 0;
    const views = post.nbre_vue || 0;
    if (views === 0) return '0%';
    const engagement = (likes + comments) / views;
    return `${(engagement * 100).toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-[#D4A017] font-bold mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Retour au dashboard
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#111827] mb-2 flex items-center gap-3">
                <Shield size={32} className="text-[#D4A017]" />
                Validation des posts
              </h1>
              <p className="text-gray-400 text-sm">
                Validez ou refusez les posts liés aux campagnes
              </p>
            </div>
            
            <button
              onClick={loadPosts}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <Loader2 size={18} className={loading ? 'animate-spin' : ''} />
              Actualiser
            </button>
          </div>
        </div>

        {/* MESSAGE D'ERREUR */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-500 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="font-bold text-red-700">Erreur</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* FILTRES */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              filter === 'all' 
                ? 'bg-[#D4A017] text-white shadow-lg' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Tous ({pendingPosts.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              filter === 'pending' 
                ? 'bg-[#D4A017] text-white shadow-lg' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <AlertCircle size={14} className="inline mr-1" />
            En attente
          </button>
          <button
            onClick={() => setFilter('validated')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              filter === 'validated' 
                ? 'bg-[#D4A017] text-white shadow-lg' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CheckCircle2 size={14} className="inline mr-1" />
            Validés
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-500">Total</span>
              <Filter size={16} className="text-gray-400" />
            </div>
            <p className="text-3xl font-black text-gray-900">{pendingPosts.length}</p>
          </div>
          <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-orange-600">En attente</span>
              <AlertCircle size={16} className="text-orange-600" />
            </div>
            <p className="text-3xl font-black text-orange-700">
              {pendingPosts.filter(p => !p.is_validated).length}
            </p>
          </div>
          <div className="bg-green-50 rounded-2xl p-6 border border-green-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-green-600">Validés</span>
              <CheckCircle2 size={16} className="text-green-600" />
            </div>
            <p className="text-3xl font-black text-green-700">
              {pendingPosts.filter(p => p.is_validated).length}
            </p>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Loader2 className="w-16 h-16 text-[#D4A017] animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-bold">Chargement des posts...</p>
          </div>
        ) : pendingPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Shield size={64} className="mx-auto text-gray-200 mb-4" />
            <h2 className="text-xl font-bold text-gray-600 mb-2">Aucun post à valider</h2>
            <p className="text-gray-400">Les posts liés aux campagnes apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPosts.map((post) => (
              <div 
                key={post.id_t_poste} 
                className={`bg-white rounded-2xl border-2 shadow-sm hover:shadow-md transition-all overflow-hidden ${
                  post.is_validated ? 'border-green-200' : 'border-gray-100'
                }`}
              >
                {/* EN-TÊTE */}
                <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-2 border-[#D4A017] overflow-hidden bg-gray-100">
                        {post.createur?.avatar_url ? (
                          <img src={post.createur.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{post.createur?.full_name || 'Créateur'}</p>
                        <p className="text-xs text-gray-500">
                          Publié le {formatDate(post.date_poste)}
                        </p>
                      </div>
                    </div>
                    
                    {post.is_validated ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold">
                        <CheckCircle2 size={14} />
                        Validé
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-xs font-bold">
                        <AlertCircle size={14} />
                        En attente
                      </span>
                    )}
                  </div>
                </div>

                {/* CONTENU */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">
                      {post.titre_poste || 'Sans titre'}
                    </h3>
                    
                    {/* ✅ CAMPAGNE ET MARQUE */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} className="text-blue-500" />
                        <span className="font-medium">Campagne :</span>
                        <span className="font-bold text-gray-900">{post.campaigns?.title || 'N/A'}</span>
                      </div>
                      
                      {post.marque && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building2 size={14} className="text-purple-500" />
                          <span className="font-medium">Marque :</span>
                          <span className="font-bold text-gray-900">{post.marque.nom_marque}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* STATS */}
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
                      <Heart size={16} className="text-red-500 mx-auto mb-1" />
                      <p className="text-lg font-black text-red-600">{formatNumber(post.nbre_like)}</p>
                      <p className="text-xs text-red-500 font-bold">Likes</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                      <Eye size={16} className="text-blue-500 mx-auto mb-1" />
                      <p className="text-lg font-black text-blue-600">{formatNumber(post.nbre_vue)}</p>
                      <p className="text-xs text-blue-500 font-bold">Vues</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                      <MessageCircle size={16} className="text-green-500 mx-auto mb-1" />
                      <p className="text-lg font-black text-green-600">{formatNumber(post.nbre_commentaire)}</p>
                      <p className="text-xs text-green-500 font-bold">Comm.</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                      <TrendingUp size={16} className="text-amber-500 mx-auto mb-1" />
                      <p className="text-lg font-black text-amber-600">{calculateEngagementRate(post)}</p>
                      <p className="text-xs text-amber-500 font-bold">Eng.</p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-3">
                    {post.url_poste && (
                      <button
                        onClick={() => window.open(post.url_poste, '_blank')}
                        className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                      >
                        <ExternalLink size={18} />
                        Voir le post
                      </button>
                    )}

                    {!post.is_validated ? (
                      <>
                        <button
                          onClick={() => validatePost(post.id_t_poste, false)}
                          disabled={processingPostId === post.id_t_poste}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all disabled:opacity-50"
                        >
                          {processingPostId === post.id_t_poste ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <X size={18} />
                          )}
                          Refuser
                        </button>
                        <button
                          onClick={() => validatePost(post.id_t_poste, true)}
                          disabled={processingPostId === post.id_t_poste}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-600 rounded-xl font-bold hover:bg-green-100 transition-all disabled:opacity-50"
                        >
                          {processingPostId === post.id_t_poste ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Check size={18} />
                          )}
                          Valider
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => validatePost(post.id_t_poste, false)}
                        disabled={processingPostId === post.id_t_poste}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-50 text-orange-600 rounded-xl font-bold hover:bg-orange-100 transition-all disabled:opacity-50"
                      >
                        {processingPostId === post.id_t_poste ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <X size={18} />
                        )}
                        Annuler la validation
                      </button>
                    )}
                  </div>

                  {/* DATE VALIDATION */}
                  {post.is_validated && post.validated_at && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        ✅ Validé le {formatDate(post.validated_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

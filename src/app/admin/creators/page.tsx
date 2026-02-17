"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Eye, Trash2, Plus, Loader2 } from 'lucide-react';

export default function CreatorsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState<any[]>([]);
  const [creatorFilter, setCreatorFilter] = useState<'all' | 'active' | 'top'>('all');
  const [isPrincipalAdmin, setIsPrincipalAdmin] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordToConfirm, setPasswordToConfirm] = useState('');
  const [actionPending, setActionPending] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: adminCheck } = await supabase
        .from('createur')
        .select('role')
        .eq('id_w', user.id)
        .single();

      setIsPrincipalAdmin(adminCheck?.role === 'admin');

      const { data: creatorsData } = await supabase
        .from('createur')
        .select('*')
        .neq('role', 'admin')
        .order('created_at', { ascending: false });

      setCreators(creatorsData || []);
      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur:', error);
      setLoading(false);
    }
  };

  const getFilteredCreators = () => {
    let filtered = creators;

    if (searchQuery.trim()) {
      filtered = filtered.filter(c =>
        c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (creatorFilter === 'active') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(c => new Date(c.updated_at || c.created_at) >= thirtyDaysAgo);
    }
    if (creatorFilter === 'top') {
      filtered = [...filtered].sort((a, b) => {
        const aF = (a.instagram_followers || 0) + (a.youtube_followers || 0) + (a.tiktok_followers || 0);
        const bF = (b.instagram_followers || 0) + (b.youtube_followers || 0) + (b.tiktok_followers || 0);
        return bF - aF;
      }).slice(0, 10);
    }
    return filtered;
  };

  const handleDeleteCreator = (creatorId: string) => {
    setActionPending({ type: 'delete_creator', id: creatorId });
    setShowPasswordModal(true);
  };

  const confirmAction = async () => {
    if (!passwordToConfirm) { alert('Veuillez entrer votre mot de passe'); return; }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordToConfirm
      });

      if (signInError) { alert('❌ Mot de passe incorrect'); return; }

      const { error } = await supabase.from('createur').delete().eq('id_w', actionPending.id);
      if (error) throw error;

      alert('✅ Créateur supprimé');
      setShowPasswordModal(false);
      setPasswordToConfirm('');
      setActionPending(null);
      fetchCreators();
    } catch (err: any) {
      alert('❌ Erreur: ' + err.message);
    }
  };

  const handleViewCreatorDashboard = (creatorId: string) => {
    localStorage.removeItem('admin_viewing_brand');
    localStorage.setItem('admin_viewing_creator', creatorId);
    localStorage.setItem('admin_mode', 'view');
    localStorage.setItem('hide_profile_section', 'true');
    router.push(`/creators/dashboard?viewing=${creatorId}`);
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
      {/* MODAL MOT DE PASSE */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">🔐 Confirmation requise</h3>
            <p className="text-gray-600 mb-6">Entrez votre mot de passe pour confirmer cette suppression.</p>
            <input
              type="password"
              value={passwordToConfirm}
              onChange={(e) => setPasswordToConfirm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && confirmAction()}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#ceaf4a] transition-all mb-6"
              placeholder="Votre mot de passe"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowPasswordModal(false); setPasswordToConfirm(''); setActionPending(null); }}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">
                Annuler
              </button>
              <button onClick={confirmAction}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all">
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EN-TÊTE */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">👥 Gestion des créateurs</h2>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/creators/auth/profil')}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus size={20} />
            Créer un créateur
          </button>
          <button onClick={() => setCreatorFilter('all')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${creatorFilter === 'all' ? 'bg-[#ceaf4a] text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            📋 Tous ({creators.length})
          </button>
          <button onClick={() => setCreatorFilter('active')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${creatorFilter === 'active' ? 'bg-[#ceaf4a] text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            ⚡ Actifs
          </button>
          <button onClick={() => setCreatorFilter('top')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${creatorFilter === 'top' ? 'bg-[#ceaf4a] text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            🏆 Top 10
          </button>
        </div>
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Créateur</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Téléphone</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Inscription</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {getFilteredCreators().length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Aucun créateur trouvé</td></tr>
              ) : (
                getFilteredCreators().map((creator) => (
                  <tr key={creator.id_w} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                          {creator.avatar_url ? (
                            <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">
                              {creator.full_name?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{creator.full_name || 'Sans nom'}</p>
                          <p className="text-xs text-gray-400">ID: {creator.id_w.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="text-sm text-gray-700">{creator.email}</span></td>
                    <td className="px-6 py-4"><span className="text-sm text-gray-700">{creator.phone || '-'}</span></td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {new Date(creator.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleViewCreatorDashboard(creator.id_w)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs hover:bg-blue-100 transition-all flex items-center gap-1.5">
                          <Eye size={14} /> Voir
                        </button>
                        {isPrincipalAdmin && (
                          <button onClick={() => handleDeleteCreator(creator.id_w)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-bold text-xs hover:bg-red-100 transition-all flex items-center gap-1.5">
                            <Trash2 size={14} /> Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

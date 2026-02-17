"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Eye, Trash2, Plus, Loader2 } from 'lucide-react';

export default function BrandsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<any[]>([]);
  const [brandFilter, setBrandFilter] = useState<'all' | 'active' | 'top'>('all');
  const [isPrincipalAdmin, setIsPrincipalAdmin] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordToConfirm, setPasswordToConfirm] = useState('');
  const [actionPending, setActionPending] = useState<any>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: adminCheck } = await supabase
        .from('createur').select('role').eq('id_w', user.id).single();
      setIsPrincipalAdmin(adminCheck?.role === 'admin');

      const { data: brandsData } = await supabase
        .from('marque').select('*').order('created_at', { ascending: false });

      setBrands(brandsData || []);
      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur:', error);
      setLoading(false);
    }
  };

  const getFilteredBrands = () => {
    let filtered = brands;
    if (brandFilter === 'active') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(b => new Date(b.updated_at || b.created_at) >= thirtyDaysAgo);
    }
    if (brandFilter === 'top') filtered = filtered.slice(0, 10);
    return filtered;
  };

  const handleDeleteBrand = (brandId: string) => {
    setActionPending({ type: 'delete_brand', id: brandId });
    setShowPasswordModal(true);
  };

  const confirmAction = async () => {
    if (!passwordToConfirm) { alert('Veuillez entrer votre mot de passe'); return; }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email, password: passwordToConfirm
      });
      if (signInError) { alert('❌ Mot de passe incorrect'); return; }

      const { error } = await supabase.from('marque').delete().eq('id_w', actionPending.id);
      if (error) throw error;

      alert('✅ Marque supprimée');
      setShowPasswordModal(false);
      setPasswordToConfirm('');
      setActionPending(null);
      fetchBrands();
    } catch (err: any) {
      alert('❌ Erreur: ' + err.message);
    }
  };

  const handleViewBrandDashboard = (brandId: string) => {
    localStorage.removeItem('admin_viewing_creator');
    localStorage.setItem('admin_viewing_brand', brandId);
    localStorage.setItem('admin_mode', 'view');
    localStorage.setItem('hide_profile_section', 'true');
    router.push(`/brands/dashboard?viewing=${brandId}`);
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
              type="password" value={passwordToConfirm}
              onChange={(e) => setPasswordToConfirm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && confirmAction()}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#ceaf4a] transition-all mb-6"
              placeholder="Votre mot de passe" autoFocus
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
        <h2 className="text-3xl font-bold">🏢 Gestion des marques</h2>
        <div className="flex gap-2">
          <button onClick={() => router.push('/brands/auth/entreprise')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold hover:from-purple-700 hover:to-purple-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            <Plus size={20} /> Créer une marque
          </button>
          <button onClick={() => setBrandFilter('all')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${brandFilter === 'all' ? 'bg-[#ceaf4a] text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            📋 Toutes ({brands.length})
          </button>
          <button onClick={() => setBrandFilter('active')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${brandFilter === 'active' ? 'bg-[#ceaf4a] text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            ⚡ Actives
          </button>
          <button onClick={() => setBrandFilter('top')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${brandFilter === 'top' ? 'bg-[#ceaf4a] text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
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
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Marque</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Domaine</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Inscription</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {getFilteredBrands().length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Aucune marque trouvée</td></tr>
              ) : (
                getFilteredBrands().map((brand) => (
                  <tr key={brand.id_w} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600 shrink-0">
                          {brand.nom_marque?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{brand.nom_marque || 'Sans nom'}</p>
                          <p className="text-xs text-gray-400">ID: {brand.id_w.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="text-sm text-gray-700">{brand.email_marque}</span></td>
                    <td className="px-6 py-4">
                      {brand.domaine ? (
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium">{brand.domaine}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {new Date(brand.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleViewBrandDashboard(brand.id_w)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs hover:bg-blue-100 transition-all flex items-center gap-1.5">
                          <Eye size={14} /> Voir
                        </button>
                        {isPrincipalAdmin && (
                          <button onClick={() => handleDeleteBrand(brand.id_w)}
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

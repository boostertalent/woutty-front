"use client";

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Shield, Plus, Trash2, X, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AdminsPage() {
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<any[]>([]);
  const [isPrincipalAdmin, setIsPrincipalAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [passwordToConfirm, setPasswordToConfirm] = useState('');
  const [actionPending, setActionPending] = useState<any>(null);
  const [newAdmin, setNewAdmin] = useState({ email: '', full_name: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: creatorCheck } = await supabase
        .from('createur').select('*').eq('id_w', user.id).maybeSingle();

      if (creatorCheck && creatorCheck.role === 'admin') {
        setIsPrincipalAdmin(true);
        setAdminUser({ id_w: creatorCheck.id_w, name: creatorCheck.full_name, email: user.email, phone: creatorCheck.phone });

        const { data: adminsData } = await supabase
          .from('admin').select('*').order('created_at', { ascending: false });

        setAdmins([
          { id_w: creatorCheck.id_w, email: user.email, full_name: creatorCheck.full_name, phone: creatorCheck.phone, created_at: creatorCheck.created_at, is_principal: true },
          ...(adminsData || [])
        ]);
      } else {
        const { data: adminCheck } = await supabase
          .from('admin').select('*').eq('id_w', user.id).maybeSingle();

        if (adminCheck) {
          setIsPrincipalAdmin(false);
          setAdminUser({ id_w: adminCheck.id_w, name: adminCheck.full_name, email: user.email, phone: adminCheck.phone });

          const { data: adminsData } = await supabase
            .from('admin').select('*').order('created_at', { ascending: false });
          setAdmins(adminsData || []);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur:', error);
      setLoading(false);
    }
  };

  const handleDeleteAdmin = (adminId: string) => {
    setActionPending({ type: 'delete_admin', id: adminId });
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

      const { error } = await supabase.from('admin').delete().eq('id_w', actionPending.id);
      if (error) throw error;

      alert('✅ Admin supprimé');
      setShowPasswordModal(false);
      setPasswordToConfirm('');
      setActionPending(null);
      fetchAdmins();
    } catch (err: any) {
      alert('❌ Erreur: ' + err.message);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.email || !newAdmin.full_name || !newAdmin.password || !newAdmin.confirmPassword) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires'); return;
    }
    if (newAdmin.password !== newAdmin.confirmPassword) { alert('❌ Les mots de passe ne correspondent pas'); return; }
    if (newAdmin.password.length < 8) { alert('❌ Le mot de passe doit contenir au moins 8 caractères'); return; }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdmin.email,
        password: newAdmin.password,
        options: { data: { role: 'admin', full_name: newAdmin.full_name }, emailRedirectTo: undefined }
      });
      if (authError) throw authError;

      if (authData.user) {
        const { error: insertError } = await supabase.from('admin').insert({
          id_w: authData.user.id,
          email: newAdmin.email,
          full_name: newAdmin.full_name,
          phone: newAdmin.phone || null,
          role: 'admin'
        });
        if (insertError) throw insertError;

        alert(`✅ Admin créé !\n\n📧 Email: ${newAdmin.email}\n👤 Nom: ${newAdmin.full_name}`);
        setShowAddAdminModal(false);
        setNewAdmin({ email: '', full_name: '', phone: '', password: '', confirmPassword: '' });
        fetchAdmins();
      }
    } catch (err: any) {
      alert('❌ Erreur: ' + (err.message || 'Erreur inconnue'));
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

      {/* MODAL AJOUT ADMIN */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">➕ Nouvel admin</h3>
              <button onClick={() => setShowAddAdminModal(false)}>
                <X className="text-gray-400 hover:text-gray-900" size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nom complet *</label>
                <input type="text" placeholder="John Doe" value={newAdmin.full_name}
                  onChange={(e) => setNewAdmin({...newAdmin, full_name: e.target.value})}
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-[#ceaf4a] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email *</label>
                <input type="email" placeholder="admin@woutty.com" value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-[#ceaf4a] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Téléphone</label>
                <input type="tel" placeholder="+221 77 123 45 67" value={newAdmin.phone}
                  onChange={(e) => setNewAdmin({...newAdmin, phone: e.target.value})}
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-[#ceaf4a] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mot de passe * (min. 8)</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={newAdmin.password}
                    onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-[#ceaf4a] transition-all pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Confirmer *</label>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={newAdmin.confirmPassword}
                    onChange={(e) => setNewAdmin({...newAdmin, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-[#ceaf4a] transition-all pr-10" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <button onClick={handleCreateAdmin}
              disabled={!newAdmin.email || !newAdmin.full_name || !newAdmin.password || !newAdmin.confirmPassword}
              className="w-full mt-4 py-2.5 text-sm bg-[#ceaf4a] text-white rounded-lg font-bold hover:bg-[#b8962f] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              Créer l'administrateur
            </button>
          </div>
        </div>
      )}

      {/* EN-TÊTE */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">🛡️ Gestion des admins</h2>
        {isPrincipalAdmin && (
          <button onClick={() => setShowAddAdminModal(true)}
            className="px-6 py-3 bg-[#ceaf4a] text-white rounded-xl font-bold hover:bg-[#b8962f] transition-all flex items-center gap-2 shadow-lg">
            <Plus size={20} /> Créer un admin
          </button>
        )}
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Téléphone</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Aucun admin trouvé</td></tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id_w} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                          <Shield size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{admin.full_name || 'Admin'}</p>
                          <p className="text-xs text-gray-400">ID: {admin.id_w.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="text-sm text-gray-700">{admin.email}</span></td>
                    <td className="px-6 py-4"><span className="text-sm text-gray-700">{admin.phone || '-'}</span></td>
                    <td className="px-6 py-4">
                      {admin.is_principal ? (
                        <span className="text-xs bg-[#ceaf4a] text-white px-3 py-1 rounded-full font-bold">⭐ Principal</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">Secondaire</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        {isPrincipalAdmin && (
                          <button
                            onClick={() => handleDeleteAdmin(admin.id_w)}
                            disabled={admin.email === adminUser?.email || admin.is_principal === true}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-bold text-xs hover:bg-red-100 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={admin.is_principal ? "Admin principal - Ne peut pas être supprimé" : admin.email === adminUser?.email ? "Vous ne pouvez pas vous supprimer" : "Supprimer"}>
                            <Trash2 size={14} />
                            {admin.is_principal ? "Principal" : admin.email === adminUser?.email ? "Vous" : "Supprimer"}
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

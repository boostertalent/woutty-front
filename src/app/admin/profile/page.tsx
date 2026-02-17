"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Shield, Edit2, Save, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ full_name: '', phone: '' });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }

    const { data: creatorCheck } = await supabase
      .from('createur').select('*').eq('id_w', user.id).maybeSingle();

    // Seul l'admin principal peut accéder à cette page
    if (!creatorCheck || creatorCheck.role !== 'admin') {
      router.push('/admin/dashboard');
      return;
    }

    setAdminUser({
      id_w: creatorCheck.id_w,
      name: creatorCheck.full_name || 'Admin',
      email: user.email || '',
      phone: creatorCheck.phone || '',
      avatar_url: creatorCheck.avatar_url
    });

    setProfileData({
      full_name: creatorCheck.full_name || '',
      phone: creatorCheck.phone || ''
    });

    setLoading(false);
  };

  const handleUpdateProfile = async () => {
    if (!profileData.full_name) { alert('⚠️ Le nom complet est obligatoire'); return; }

    try {
      const { error } = await supabase
        .from('createur')
        .update({ full_name: profileData.full_name, phone: profileData.phone })
        .eq('id_w', adminUser?.id_w);

      if (error) throw error;

      // Log de l'activité
      await supabase.from('admin_logs').insert({
        admin_id: adminUser.id_w,
        admin_name: adminUser.name,
        action: 'UPDATE',
        target_type: 'profile',
        target_id: adminUser.id_w,
        details: 'Mise à jour du profil admin',
        created_at: new Date().toISOString()
      });

      alert('✅ Profil mis à jour avec succès !');
      setIsEditingProfile(false);

      // Mettre à jour l'état local
      setAdminUser({ ...adminUser, name: profileData.full_name, phone: profileData.phone });
    } catch (err: any) {
      alert('❌ Erreur: ' + err.message);
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
      {/* EN-TÊTE */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">👤 Mon profil administrateur</h2>
        {!isEditingProfile && (
          <button onClick={() => setIsEditingProfile(true)}
            className="px-6 py-3 bg-[#ceaf4a] text-white rounded-xl font-bold hover:bg-[#b8962f] transition-all flex items-center gap-2 shadow-lg">
            <Edit2 size={20} /> Modifier
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-2xl">

        {/* NOTE */}
        <div className="bg-[#fef9e7] border border-[#ceaf4a] rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-700">
            <span className="font-bold text-[#ceaf4a]">ℹ️ Note :</span> Ceci est votre profil <strong>administrateur</strong>.
          </p>
        </div>

        {/* AVATAR + NOM */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-900 flex items-center justify-center overflow-hidden shrink-0">
            {adminUser?.avatar_url ? (
              <img src={adminUser.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <Shield size={40} className="text-[#ceaf4a]" />
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{adminUser?.name}</h3>
            <p className="text-gray-500 mt-1">{adminUser?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-[#ceaf4a] text-white px-3 py-1 rounded-full font-bold">⭐ Administrateur Principal</span>
              <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold">🛡️ Accès complet</span>
            </div>
          </div>
        </div>

        {/* CHAMPS */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nom complet</label>
            {isEditingProfile ? (
              <input type="text" value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#ceaf4a] transition-all" />
            ) : (
              <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">{adminUser?.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">{adminUser?.email}</p>
            <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone</label>
            {isEditingProfile ? (
              <input type="tel" value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+221 77 123 45 67"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#ceaf4a] transition-all" />
            ) : (
              <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">{adminUser?.phone || 'Non renseigné'}</p>
            )}
          </div>



          {/* BOUTONS ÉDITION */}
          {isEditingProfile && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setIsEditingProfile(false);
                  setProfileData({ full_name: adminUser?.name || '', phone: adminUser?.phone || '' });
                }}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">
                Annuler
              </button>
              <button onClick={handleUpdateProfile}
                className="flex-1 py-3 bg-[#ceaf4a] text-white rounded-xl font-bold hover:bg-[#b8962f] transition-all flex items-center justify-center gap-2">
                <Save size={20} /> Enregistrer
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

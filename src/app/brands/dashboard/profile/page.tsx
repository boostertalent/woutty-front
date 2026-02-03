"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Loader2, Building, Mail, Globe, Tag, 
  AlertCircle, Check, X, Edit2, Eye, FileText
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function BrandProfile() {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  const [brandData, setBrandData] = useState({
    nom_marque: '',
    email_marque: '',
    domaine: '',
    site_web: '',
    description: ''
  });

  const fetchBrandData = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('marque')
        .select('*')
        .eq('id_w', session.user.id)
        .single();

      if (error) {
        console.error("❌ Erreur:", error);
        setError("Impossible de charger les données");
      } else if (data) {
        console.log("✅ Données chargées:", data);
        setBrandData({
          nom_marque: data.nom_marque || '',
          email_marque: data.email_marque || '',
          domaine: data.domaine || '',
          site_web: data.site_web || '',
          description: data.description || ''
        });
      }
    } catch (err: any) {
      console.error("❌ Erreur:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBrandData({
      ...brandData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data: existingData } = await supabase
        .from('marque')
        .select('*')
        .eq('id_w', session.user.id)
        .single();

      let result;
      
      if (existingData) {
        result = await supabase
          .from('marque')
          .update(brandData)
          .eq('id_w', session.user.id);
      } else {
        result = await supabase
          .from('marque')
          .insert({
            id_w: session.user.id,
            ...brandData
          });
      }

      if (result.error) {
        throw result.error;
      }

      console.log("✅ Profil sauvegardé");
      setSuccess(true);
      setEditMode(false);
      
      // Recharger les données
      await fetchBrandData();
      
    } catch (err: any) {
      console.error("❌ Erreur sauvegarde:", err);
      setError(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#D4A017] animate-spin mx-auto mb-4" />
          <p className="font-bold text-[#D4A017]">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        
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
              <h1 className="text-3xl font-serif font-bold text-[#111827] mb-2">
                Mon profil
              </h1>
              <p className="text-gray-400 text-sm">
                {editMode ? 'Modifiez les informations de votre marque' : 'Consultez les informations de votre marque'}
              </p>
            </div>
            
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-6 py-3 bg-[#D4A017] text-white rounded-xl font-bold hover:bg-[#B88A14] transition-all"
              >
                <Edit2 size={18} />
                Modifier
              </button>
            )}
          </div>
        </div>

        {/* MESSAGES */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="text-red-500 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="font-bold text-red-700">Erreur</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <X size={20} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in">
            <Check className="text-green-500 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-green-700">Succès !</p>
              <p className="text-sm text-green-600">Votre profil a été mis à jour avec succès</p>
            </div>
          </div>
        )}

        {/* FORMULAIRE */}
<form onSubmit={handleSubmit} className="bg-white rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-sm">
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Informations de la marque</h2>
            {!editMode && <Eye size={20} className="text-gray-400" />}
          </div>

          <div className="space-y-6">
            
            {/* NOM DE LA MARQUE */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Building size={16} className="text-[#D4A017]" />
                Nom de la marque *
              </label>
              {editMode ? (
                <input
                  type="text"
                  name="nom_marque"
                  value={brandData.nom_marque}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Nike, Adidas, Apple..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4A017] focus:border-transparent outline-none transition-all text-gray-700"
                />
              ) : (
                <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700 font-medium">
                  {brandData.nom_marque || '—'}
                </p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Mail size={16} className="text-[#D4A017]" />
                Email de marque*
              </label>
              {editMode ? (
                <input
                  type="email"
                  name="email_marque"
                  value={brandData.email_marque}
                  onChange={handleChange}
                  required
                  placeholder="contact@marque.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4A017] focus:border-transparent outline-none transition-all text-gray-700"
                />
              ) : (
                <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700 font-medium">
                  {brandData.email_marque || '—'}
                </p>
              )}
            </div>

            {/* DOMAINE */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Tag size={16} className="text-[#D4A017]" />
                DOMAINE
              </label>
              {editMode ? (
                <input
                  type="text"
                  name="domaine"
                  value={brandData.domaine}
                  onChange={handleChange}
                  placeholder="Ex: Mode, Tech, Beauté, Sport..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4A017] focus:border-transparent outline-none transition-all text-gray-700"
                />
              ) : (
                <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700 font-medium">
                  {brandData.domaine || '—'}
                </p>
              )}
              {editMode && (
                <p className="text-xs text-gray-400 mt-2">
                  Aidez les créateurs à mieux comprendre votre secteur
                </p>
              )}
            </div>

            {/* SITE WEB */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Globe size={16} className="text-[#D4A017]" />
                Site web
              </label>
              {editMode ? (
                <input
                  type="url"
                  name="site_web"
                  value={brandData.site_web}
                  onChange={handleChange}
                  placeholder="https://www.votremarque.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4A017] focus:border-transparent outline-none transition-all text-gray-700"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl">
                  {brandData.site_web ? (
                    <a 
                      href={brandData.site_web} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#D4A017] font-medium hover:underline flex items-center gap-2"
                    >
                      {brandData.site_web}
                      <Globe size={14} />
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* BOUTONS */}
          {editMode && (
            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  fetchBrandData(); 
                }}
                className="flex-1 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                Annuler
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-4 bg-[#D4A017] text-white rounded-xl font-bold hover:bg-[#B88A14] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          )}
        </form>

        {/* NOTE */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-sm text-blue-700">
            <strong>💡 Conseil :</strong> Un profil complet et détaillé vous aide à attirer les meilleurs créateurs pour vos campagnes.
          </p>
        </div>
      </div>
    </div>
  );
}

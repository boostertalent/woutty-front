 "use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Loader2, User, Mail, Phone, Calendar,
  AlertCircle, Check, Instagram, Youtube, Facebook, Camera,
  Upload, X
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

const XLogo = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.486 3.24H4.298L17.607 20.65z" />
  </svg>
);

export default function CreatorProfile() {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [creatorData, setCreatorData] = useState({
    full_name: '',
    email: '',
    phone: '',
    age: '',
    niche: [] as string[],
    avatar_url: '',
    instagram_username: '',
    youtube_username: '',
    tiktok_username: '',
    twitter_username: '',
    facebook_username: '',
    snapchat_username: ''
  });

  const availableNiches = [
    'Mode', 'Beauté', 'Tech', 'Gaming', 'Sport', 'Cuisine',
    'Voyage', 'Lifestyle', 'Fitness', 'Music', 'Art', 'Business'
  ];

  const fetchCreatorData = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('createur')
        .select('*')
        .eq('id_w', session.user.id)
        .single();

      if (error) {
        console.error("❌ Erreur:", error);
        setError("Impossible de charger les données");
      } else if (data) {
        console.log("✅ Données chargées:", data);
        setCreatorData({
          full_name: data.full_name || '',
          email: data.email || session.user.email || '',
          phone: data.phone || '',
          age: data.age?.toString() || '',
          niche: Array.isArray(data.niche) ? data.niche : [],
          avatar_url: data.avatar_url || '',
          instagram_username: data.instagram_username || '',
          youtube_username: data.youtube_username || '',
          tiktok_username: data.tiktok_username || '',
          twitter_username: data.twitter_username || '',
          facebook_username: data.facebook_username || '',
          snapchat_username: data.snapchat_username || ''
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
    fetchCreatorData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreatorData({
      ...creatorData,
      [e.target.name]: e.target.value
    });
  };

  const toggleNiche = (niche: string) => {
    if (creatorData.niche.includes(niche)) {
      setCreatorData({
        ...creatorData,
        niche: creatorData.niche.filter(n => n !== niche)
      });
    } else {
      setCreatorData({
        ...creatorData,
        niche: [...creatorData.niche, niche]
      });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setError("Veuillez sélectionner une image");
      return;
    }

    // Vérifier la taille (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 2MB");
      return;
    }

    setUploadingAvatar(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('creator-avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('creator-avatars')
        .getPublicUrl(filePath);

      // Mettre à jour l'état
      setCreatorData({
        ...creatorData,
        avatar_url: publicUrl
      });

      console.log("✅ Avatar uploadé:", publicUrl);

    } catch (err: any) {
      console.error("❌ Erreur upload:", err);
      setError("Erreur lors de l'upload de l'image");
    } finally {
      setUploadingAvatar(false);
    }
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

      // Préparer les données
      const updateData = {
        full_name: creatorData.full_name,
        email: creatorData.email,
        phone: creatorData.phone,
        age: creatorData.age ? parseInt(creatorData.age) : null,
        niche: creatorData.niche,
        avatar_url: creatorData.avatar_url,
        instagram_username: creatorData.instagram_username,
        youtube_username: creatorData.youtube_username,
        tiktok_username: creatorData.tiktok_username,
        twitter_username: creatorData.twitter_username,
        facebook_username: creatorData.facebook_username,
        snapchat_username: creatorData.snapchat_username
      };

      // Vérifier si le profil existe
      const { data: existingData } = await supabase
        .from('createur')
        .select('*')
        .eq('id_w', session.user.id)
        .single();

      let result;
      
      if (existingData) {
        // Mettre à jour
        result = await supabase
          .from('createur')
          .update(updateData)
          .eq('id_w', session.user.id);
      } else {
        // Créer
        result = await supabase
          .from('createur')
          .insert({
            id_w: session.user.id,
            role: 'creator',
            ...updateData
          });
      }

      if (result.error) {
        throw result.error;
      }

      console.log("✅ Profil sauvegardé");
      setSuccess(true);
      
      // Rediriger après 2 secondes
      setTimeout(() => {
        router.push('/creators/dashboard');
      }, 2000);
      
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
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <Link href="/creators/dashboard">
            <button className="flex items-center gap-2 text-gray-400 hover:text-[#D4A017] font-bold mb-4 transition-colors">
              <ArrowLeft size={20} />
              Retour au dashboard
            </button>
          </Link>
          
          <h1 className="text-3xl font-serif font-bold text-[#111827] mb-2">
            Mon profil
          </h1>
          <p className="text-gray-400 text-sm">
            Gérez vos informations personnelles et professionnelles
          </p>
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
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
            <Check className="text-green-500 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-green-700">Succès !</p>
              <p className="text-sm text-green-600">Votre profil a été mis à jour. Redirection...</p>
            </div>
          </div>
        )}

        {/* FORMULAIRE */}
<form onSubmit={handleSubmit} className="space-y-6">
          
          {/* AVATAR */}
          <div className="bg-white rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Photo de profil</h2>
            
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-[#D4A017] overflow-hidden bg-gray-100">
                  {creatorData.avatar_url ? (
                    <img 
                      src={creatorData.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User size={40} />
                    </div>
                  )}
                </div>
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <label className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-100 transition-all cursor-pointer">
                  <Upload size={16} className="text-[#D4A017]" />
                  Changer la photo
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  JPG, PNG ou GIF. Max 2MB.
                </p>
              </div>
            </div>
          </div>

          {/* INFORMATIONS PERSONNELLES */}
          <div className="bg-white rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Informations personnelles</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* NOM COMPLET */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <User size={16} className="text-[#D4A017]" />
                  Nom complet *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={creatorData.full_name}
                  onChange={handleChange}
                  required
                  placeholder="Ex: John Doe"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017] outline-none transition-all placeholder:text-gray-400"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Mail size={16} className="text-[#D4A017]" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={creatorData.email}
                  onChange={handleChange}
                  required
                  placeholder="email@exemple.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017] outline-none transition-all placeholder:text-gray-400"
                />
              </div>

              {/* TÉLÉPHONE */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Phone size={16} className="text-[#D4A017]" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={creatorData.phone}
                  onChange={handleChange}
                  placeholder="+221 77 123 45 67"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017] outline-none transition-all placeholder:text-gray-400"
                />
              </div>

              {/* ÂGE */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-[#D4A017]" />
                  Âge
                </label>
                <input
                  type="number"
                  name="age"
                  value={creatorData.age}
                  onChange={handleChange}
                  min="13"
                  max="100"
                  placeholder="25"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017] outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* NICHES */}
            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Thèmes
              </label>
              <div className="flex flex-wrap gap-2">
                {availableNiches.map((niche) => (
                  <button
                    key={niche}
                    type="button"
                    onClick={() => toggleNiche(niche)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      creatorData.niche.includes(niche)
                        ? 'bg-[#D4A017] text-white shadow-md shadow-[#D4A017]/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                    }`}
                  >
                    {niche}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Sélectionnez vos domaines de prédilection (plusieurs choix possibles)
              </p>
            </div>
          </div>

          {/* RÉSEAUX SOCIAUX */}
          <div className="bg-white rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Réseaux sociaux</h2>
            
            <div className="space-y-4">
              {/* INSTAGRAM */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Instagram size={16} className="text-[#E4405F]" />
                  Instagram
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    name="instagram_username"
                    value={creatorData.instagram_username}
                    onChange={handleChange}
                    placeholder="votre_profil"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-r-xl text-gray-900 focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017] outline-none transition-all"
                  />
                </div>
              </div>

              {/* YOUTUBE */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Youtube size={16} className="text-[#FF0000]" />
                  YouTube
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    name="youtube_username"
                    value={creatorData.youtube_username}
                    onChange={handleChange}
                    placeholder="votre_chaine"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-r-xl text-gray-900 focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017] outline-none transition-all"
                  />
                </div>
              </div>

              {/* TIKTOK */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="text-sm">🎵</span>
                  TikTok
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    name="tiktok_username"
                    value={creatorData.tiktok_username}
                    onChange={handleChange}
                    placeholder="votre_nom"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-r-xl text-gray-900 focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017] outline-none transition-all"
                  />
                </div>
              </div>

              {/* X (TWITTER) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2 text-gray-900">
                  <XLogo size={16} />
                  X (Twitter)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    name="twitter_username"
                    value={creatorData.twitter_username}
                    onChange={handleChange}
                    placeholder="votre_nom"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-r-xl text-gray-900 focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017] outline-none transition-all"
                  />
                </div>
              </div>

              {/* FACEBOOK */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Facebook size={16} className="text-[#1877F2]" />
                  Facebook
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    name="facebook_username"
                    value={creatorData.facebook_username}
                    onChange={handleChange}
                    placeholder="votre_nom"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-r-xl text-gray-900 focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017] outline-none transition-all"
                  />
                </div>
              </div>

              {/* SNAPCHAT */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Camera size={16} className="text-[#FFFC00]" />
                  Snapchat
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    name="snapchat_username"
                    value={creatorData.snapchat_username}
                    onChange={handleChange}
                    placeholder="votre_nom"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-r-xl text-gray-900 focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017] outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BOUTONS */}
          <div className="flex gap-4">
            <Link href="/creators/dashboard" className="flex-1">
              <button
                type="button"
                className="w-full py-4 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Annuler
              </button>
            </Link>
            
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-4 bg-[#D4A017] text-white rounded-xl font-bold hover:bg-[#B88A14] shadow-lg shadow-[#D4A017]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        </form>
        {/* NOTE */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-sm text-blue-700">
            <strong>💡 Conseil :</strong> Un profil complet et à jour augmente vos chances d'être sélectionné par les marques pour des campagnes.
          </p>
        </div>
      </div>
    </div>
  );
}

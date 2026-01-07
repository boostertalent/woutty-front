"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { 
  ChevronLeft, Trash2, Plus, Globe, AlertCircle,
  Instagram, Youtube, Twitter, 
  Music2, MessageCircle, Eye, EyeOff, Loader2 
} from 'lucide-react';

const PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', icon: <Music2 size={20} /> },
  { id: 'instagram', name: 'Instagram', icon: <Instagram size={20} /> },
  { id: 'snapchat', name: 'Snapchat', icon: <MessageCircle size={20} /> },
  { id: 'twitter', name: 'Twitter / X', icon: <Twitter size={20} /> },
  { id: 'youtube', name: 'YouTube', icon: <Youtube size={20} /> },
];

export default function SocialMediaSelection() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [socials, setSocials] = useState([{ id: Date.now(), platform: '', handle: '' }]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const isPasswordMatch = password.length > 0 && password === confirmPassword;
  const isFormValid = 
    password.length >= 6 && 
    isPasswordMatch && 
    socials.every(s => s.platform !== '' && s.handle.trim().length >= 2);

 const handleFinish = async () => {
    if (!isFormValid || loading) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Récupération 
      const userEmail = localStorage.getItem('signup_email');
      const userName = localStorage.getItem('signup_name') || 'Utilisateur';
      const userPhone = localStorage.getItem('signup_phone') || '';
      const userAge = localStorage.getItem('signup_age');
      const userNicheRaw = localStorage.getItem('signup_niche');
      const avatarBase64 = localStorage.getItem('signup_avatar');
      
      const userNiche = userNicheRaw ? JSON.parse(userNicheRaw) : [];
      const parsedAge = userAge ? parseInt(userAge, 10) : null;

      if (!userEmail) throw new Error("Données d'inscription manquantes (email).");

      // 2. Création du compte Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userEmail,
        password: password,
        options: {
          data: { full_name: userName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (authError) throw authError;
      const userId = authData.user?.id;

      if (userId) {
        let publicAvatarUrl = null;

        // 3. Gestion de l'image
        if (avatarBase64) {
          try {
            const base64Data = avatarBase64.split(',')[1];
            const blob = await fetch(`data:image/png;base64,${base64Data}`).then(res => res.blob());
            const fileName = `${userId}/avatar_${Date.now()}.png`;
            
            const { error: uploadError } = await supabase.storage
              .from('avatars')
              .upload(fileName, blob, { upsert: true });

            if (!uploadError) {
              const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
              publicAvatarUrl = data.publicUrl;
            }
          } catch (err) {
            console.error("Upload avatar ignoré:", err);
          }
        }

        // 4. Upsert 
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: userEmail,
            full_name: userName,
            avatar_url: publicAvatarUrl,
            phone: userPhone,
            age: isNaN(parsedAge as number) ? null : parsedAge,
            niche: userNiche,
            instagram_username: socials.find(s => s.platform === 'instagram')?.handle || null,
            tiktok_username: socials.find(s => s.platform === 'tiktok')?.handle || null,
            youtube_username: socials.find(s => s.platform === 'youtube')?.handle || null,
            snapchat_username: socials.find(s => s.platform === 'snapchat')?.handle || null,
            twitter_username: socials.find(s => s.platform === 'twitter')?.handle || null,
            role: 'creator'
          }, { onConflict: 'id' }); 

        if (profileError) throw profileError;

        localStorage.clear();
        
        router.push('/creators/auth/success'); 
        
      }
    } catch (err: any) {
      console.error("Détails de l'erreur:", err);
      setError(err.message || "Une erreur est survenue lors de la création du profil.");
    } finally {
      setLoading(false);
    }
  };

  const updateSocial = (id: number, field: string, value: string) => {
    setSocials(socials.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  
  const getPlatformIcon = (id: string) => PLATFORMS.find(p => p.id === id)?.icon || <Globe size={20} />;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      <div className="bg-white border border-gray-200 rounded-[40px] p-8 md:p-12 w-full max-w-2xl shadow-sm">
        
        <h2 className="text-3xl font-bold text-center mb-4 text-[#ceaf4a]">Tes réseaux</h2>
        <p className="text-center text-gray-500 mb-8 font-medium">Lien vers tes réseaux et mot de passe</p>

        <div className="space-y-4 mb-6">
          {socials.map((social) => (
            <div key={social.id} className="p-4 border border-gray-200 rounded-3xl bg-gray-50/50 space-y-3">
              <div className="flex gap-3 items-center">
                <div className={`p-2.5 rounded-xl transition-colors ${social.platform ? 'bg-[#ceaf4a] text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {getPlatformIcon(social.platform)}
                </div>
                <select 
                  value={social.platform}
                  onChange={(e) => updateSocial(social.id, 'platform', e.target.value)}
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#ceaf4a]"
                >
                  <option value="" disabled>Choisir une plateforme</option>
                  {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {socials.length > 1 && (
                  <button onClick={() => setSocials(socials.filter(s => s.id !== social.id))} className="p-2.5 text-gray-400 hover:text-red-500 bg-white border border-gray-200 rounded-xl transition-colors">
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
              <input 
                type="text"
                placeholder="votre profil ou lien de profil"
                value={social.handle}
                onChange={(e) => updateSocial(social.id, 'handle', e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#ceaf4a]"
              />
            </div>
          ))}
        </div>

        <button 
          onClick={() => setSocials([...socials, { id: Date.now(), platform: '', handle: '' }])}
          className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-[#ceaf4a] hover:text-[#ceaf4a] mb-8 transition-all font-bold text-sm"
        >
          <Plus size={18} className="inline mr-2" /> Ajouter un autre réseau
        </button>

        <div className="space-y-4 mb-6">
          <label className="text-sm font-bold ml-1 text-gray-700 uppercase tracking-wider">Mot de passe</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe (min. 6 caractères)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 outline-none focus:border-[#ceaf4a] bg-gray-50"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-5 py-3.5 rounded-2xl border outline-none bg-gray-50 transition-all ${isPasswordMatch ? 'border-green-500 ring-2 ring-green-500/10' : 'border-gray-200'}`}
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex items-start gap-3 border border-red-100">
            <AlertCircle size={20} className="shrink-0 mt-0.5" /> 
            <span className="text-sm font-bold leading-tight">{error}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-6 border-t border-gray-100">
          <Link href="/creators/auth/niche" className="text-gray-500 font-bold hover:text-black transition-colors flex items-center gap-2">
            <ChevronLeft size={20} /> Retour
          </Link>
          
          <button 
            onClick={handleFinish}
            disabled={!isFormValid || loading}
            className={`px-12 py-3.5 rounded-2xl font-bold transition-all flex items-center gap-2 ${
              isFormValid && !loading 
                ? "bg-[#ceaf4a] text-white shadow-lg shadow-[#ceaf4a]/30 active:scale-95" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={22} /> : "Terminer"}
          </button>
        </div>
      </div>
    </main>
  );
}
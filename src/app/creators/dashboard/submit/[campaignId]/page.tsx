"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
  ArrowLeft, Upload, Video, Image as ImageIcon,
  CheckCircle2, AlertCircle, Loader2, X
} from 'lucide-react';
import { uploadContent, ACCEPTED_TYPES, MAX_SIZE_MB, isVideo } from '@/lib/uploadContent';

export default function SubmitContentPage() {
  const router = useRouter();
  const { campaignId } = useParams<{ campaignId: string }>();

  const [campaign, setCampaign] = useState<{ title: string; brand_id: string } | null>(null);
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [creatorName, setCreatorName] = useState('');
  const [quota, setQuota] = useState<{ total: number; approved: number; pending: number } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setCreatorId(user.id);

      const [{ data: creator }, { data: camp }, { data: cc }] = await Promise.all([
        supabase.from('createur').select('full_name').eq('id_w', user.id).maybeSingle(),
        supabase.from('campaigns').select('title, id_w, nb_publications').eq('id_t_campagne', campaignId).maybeSingle(),
        supabase.from('campaign_creators').select('nb_publications').eq('campaign_id', campaignId).eq('creator_id', user.id).maybeSingle(),
      ]);

      setCreatorName(creator?.full_name ?? '');
      setCampaign(camp ? { title: camp.title, brand_id: camp.id_w } : null);

      // Calculer le quota
      const totalPub = camp?.nb_publications || 0;
      const creatorPub = cc?.nb_publications || 0;
      const nbAttendus = creatorPub > 0 ? creatorPub : totalPub;

      if (nbAttendus > 0) {
        const res = await fetch(`/api/creator/approved-submissions?creatorId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          const approved = data.counts?.[campaignId] || 0;
          const pending = data.pendingCounts?.[campaignId] || 0;
          setQuota({ total: nbAttendus, approved, pending });
        }
      }
    }
    init();
  }, [campaignId]);

  const handleFileChange = (picked: File | null) => {
    setError(null);
    if (!picked) { setFile(null); setPreview(null); return; }

    if (!ACCEPTED_TYPES.includes(picked.type)) {
      setError('Format non supporté. Utilise MP4, MOV, WebM, JPG, PNG ou WebP.');
      return;
    }
    if (picked.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Le fichier dépasse ${MAX_SIZE_MB} Mo.`);
      return;
    }

    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileChange(e.dataTransfer.files[0] ?? null);
  };

  const handleSubmit = async () => {
    if (!file || !creatorId || !campaign) return;

    setUploading(true);
    setError(null);

    const { error: uploadError } = await uploadContent(
      file,
      campaignId,
      creatorId,
      campaign.title,
      creatorName,
      campaign.brand_id,
    );

    setUploading(false);

    if (uploadError) {
      setError(`Erreur lors de l'envoi : ${uploadError}`);
      return;
    }

    setSuccess(true);
  };

  const quotaReached = quota !== null && (quota.approved + quota.pending) >= quota.total;

  if (quotaReached) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center max-w-md w-full">
          <CheckCircle2 size={64} className="mx-auto text-[#D4A017] mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quota atteint</h2>
          <p className="text-gray-500 mb-2">
            Tu as soumis {quota.approved + quota.pending} contenu{quota.approved + quota.pending > 1 ? 's' : ''} sur {quota.total} attendu{quota.total > 1 ? 's' : ''} pour cette campagne.
          </p>
          {quota.pending > 0 && (
            <p className="text-sm text-orange-600 mb-6">
              {quota.pending} contenu{quota.pending > 1 ? 's' : ''} en attente de validation.
            </p>
          )}
          {quota.approved > 0 && quota.pending === 0 && (
            <p className="text-sm text-green-600 mb-6">
              Tous tes contenus ont été validés.
            </p>
          )}
          <button
            onClick={() => router.push('/creators/dashboard')}
            className="w-full py-3 bg-[#D4A017] text-white rounded-xl font-bold hover:bg-[#b8962f] transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center max-w-md w-full">
          <CheckCircle2 size={64} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Contenu envoyé !</h2>
          <p className="text-gray-500 mb-6">
            Ton contenu est en attente de validation par la marque. Tu seras notifié(e) dès qu'une décision est prise.
          </p>
          <button
            onClick={() => router.push('/creators/dashboard')}
            className="w-full py-3 bg-[#D4A017] text-white rounded-xl font-bold hover:bg-[#b8962f] transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      <div className="max-w-xl mx-auto">

        {/* HEADER */}
        <button
          onClick={() => router.push('/creators/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-[#D4A017] font-bold mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Retour
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Soumettre un contenu</h1>
        {campaign && (
          <p className="text-gray-500 text-sm mb-8">
            Campagne : <span className="font-bold text-gray-700">{campaign.title}</span>
          </p>
        )}

        {/* ZONE DE DÉPÔT */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !file && inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl transition-all ${
            file
              ? 'border-green-300 bg-green-50 cursor-default'
              : 'border-gray-200 bg-white hover:border-[#D4A017] hover:bg-amber-50 cursor-pointer'
          } p-8`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />

          {file ? (
            <div className="text-center">
              {preview && (
                isVideo(file) ? (
                  <video
                    src={preview}
                    controls
                    className="w-full max-h-64 rounded-xl mb-4 object-contain bg-black"
                  />
                ) : (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full max-h-64 rounded-xl mb-4 object-contain"
                  />
                )
              )}
              <p className="font-bold text-gray-800 truncate">{file.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {(file.size / 1024 / 1024).toFixed(1)} Mo
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-bold"
              >
                <X size={14} /> Supprimer
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Video size={36} className="text-gray-300" />
                <ImageIcon size={36} className="text-gray-300" />
              </div>
              <p className="font-bold text-gray-700">Glisse ton contenu ici</p>
              <p className="text-sm text-gray-400 mt-1">ou clique pour parcourir</p>
              <p className="text-xs text-gray-400 mt-3">
                Vidéo : MP4, MOV, WebM — Image : JPG, PNG, WebP — max {MAX_SIZE_MB} Mo
              </p>
            </div>
          )}
        </div>

        {/* ERREUR */}
        {error && (
          <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* BOUTON */}
        <button
          onClick={handleSubmit}
          disabled={!file || uploading}
          className="mt-6 w-full flex items-center justify-center gap-2 py-4 bg-[#D4A017] text-white rounded-xl font-bold text-lg hover:bg-[#b8962f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Upload size={20} />
              Envoyer pour validation
            </>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          Le contenu sera examiné par la marque. Tu seras notifié(e) de la décision.
        </p>
      </div>
    </div>
  );
}

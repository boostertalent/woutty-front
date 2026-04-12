"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
  ArrowLeft, Upload, Video, CheckCircle2, AlertCircle, Loader2, X
} from 'lucide-react';
import { uploadVideoValidation } from '@/lib/uploadVideo';

const MAX_SIZE_MB = 500;
const ACCEPTED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

export default function SubmitVideoPage() {
  const router = useRouter();
  const { campaignId } = useParams<{ campaignId: string }>();

  const [campaign, setCampaign] = useState<{ title: string } | null>(null);
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [creatorName, setCreatorName] = useState('');
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

      const [{ data: creator }, { data: camp }] = await Promise.all([
        supabase.from('createur').select('full_name').eq('id_w', user.id).maybeSingle(),
        supabase.from('campaigns').select('title').eq('id_t_campagne', campaignId).maybeSingle(),
      ]);

      setCreatorName(creator?.full_name ?? '');
      setCampaign(camp ? { title: camp.title } : null);
    }

    init();
  }, [campaignId]);

  const handleFileChange = (picked: File | null) => {
    setError(null);
    if (!picked) { setFile(null); setPreview(null); return; }

    if (!ACCEPTED_TYPES.includes(picked.type)) {
      setError('Format non supporté. Utilise MP4, MOV ou WebM.');
      return;
    }
    if (picked.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`La vidéo dépasse ${MAX_SIZE_MB} Mo.`);
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

    const { error: uploadError } = await uploadVideoValidation(
      file,
      campaignId,
      creatorId,
      campaign.title,
      creatorName,
    );

    setUploading(false);

    if (uploadError) {
      setError(`Erreur lors de l'envoi : ${uploadError}`);
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center max-w-md w-full">
          <CheckCircle2 size={64} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vidéo envoyée !</h2>
          <p className="text-gray-500 mb-6">
            Ton contenu est en attente de validation. Tu seras notifié(e) dès qu'une décision est prise.
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

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Soumettre une vidéo</h1>
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
                <video
                  src={preview}
                  controls
                  className="w-full max-h-64 rounded-xl mb-4 object-contain bg-black"
                />
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
              <Video size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="font-bold text-gray-700">Glisse ta vidéo ici</p>
              <p className="text-sm text-gray-400 mt-1">ou clique pour parcourir</p>
              <p className="text-xs text-gray-400 mt-3">MP4, MOV, WebM — max {MAX_SIZE_MB} Mo</p>
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
          La vidéo sera visionnée par l'équipe Woutty. Tu seras notifié(e) de la décision.
        </p>
      </div>
    </div>
  );
}

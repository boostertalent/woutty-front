"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check, X, Play, Loader2, ArrowLeft, User,
  FileVideo, AlertCircle, CheckCircle2, Clock, Image as ImageIcon
} from 'lucide-react';

type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'expired';

interface Submission {
  id: string;
  campaign_id: string | null;
  creator_id: string;
  video_path: string | null;
  status: SubmissionStatus;
  admin_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  campaign_title?: string;
  creator_name?: string;
  creator_avatar?: string | null;
}

export default function BrandValidateSubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SubmissionStatus | 'all'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [modalUrl, setModalUrl] = useState<string | null>(null);
  const [modalIsImage, setModalIsImage] = useState(false);
  const [loadingSignedUrl, setLoadingSignedUrl] = useState<string | null>(null);

  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [brandNote, setBrandNote] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, [filter]);

  const loadSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/brand/submissions${filter !== 'all' ? `?status=${filter}` : ''}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');
      setSubmissions(data.submissions);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const openContent = async (submissionId: string) => {
    setLoadingSignedUrl(submissionId);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/signed-url`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');
      // Détecter si c'est une image via l'extension dans le path
      const sub = submissions.find(s => s.id === submissionId);
      const ext = sub?.video_path?.split('.').pop()?.toLowerCase() ?? ''
      setModalIsImage(['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext));
      setModalUrl(data.signedUrl);
    } catch (err: any) {
      setError(`Impossible de charger le contenu : ${err.message}`);
    } finally {
      setLoadingSignedUrl(null);
    }
  };

  const decide = async (submissionId: string, decision: 'approved' | 'rejected', note?: string) => {
    setProcessingId(submissionId);
    setError(null);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, brandNote: note ?? null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');
      setModalUrl(null);
      setRejectTarget(null);
      setBrandNote('');
      await loadSubmissions();
    } catch (err: any) {
      setError(`Erreur : ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const statusBadge = (status: SubmissionStatus) => {
    const config = {
      pending:  { label: 'En attente',  className: 'bg-orange-50 text-orange-700 border-orange-200', icon: <Clock size={12} /> },
      approved: { label: 'Validé',      className: 'bg-green-50 text-green-700 border-green-200',    icon: <CheckCircle2 size={12} /> },
      rejected: { label: 'Refusé',      className: 'bg-red-50 text-red-700 border-red-200',          icon: <X size={12} /> },
      expired:  { label: 'Expiré',      className: 'bg-gray-100 text-gray-500 border-gray-200',      icon: <AlertCircle size={12} /> },
    };
    const c = config[status];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-full text-xs font-bold ${c.className}`}>
        {c.icon} {c.label}
      </span>
    );
  };

  const pending  = submissions.filter(s => s.status === 'pending').length;
  const approved = submissions.filter(s => s.status === 'approved').length;
  const rejected = submissions.filter(s => s.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/brands/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-[#D4A017] font-bold mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Retour au dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#111827] mb-2 flex items-center gap-3">
                <FileVideo size={32} className="text-[#D4A017]" />
                Contenus à valider
              </h1>
              <p className="text-gray-400 text-sm">
                Visionnez et validez les contenus soumis par vos créateurs
              </p>
            </div>
            <button
              onClick={loadSubmissions}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <Loader2 size={18} className={loading ? 'animate-spin' : ''} />
              Actualiser
            </button>
          </div>
        </div>

        {/* ERREUR */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
            <div className="flex-1">
              <p className="font-bold text-red-700">Erreur</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <X size={20} />
            </button>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-orange-50 rounded-2xl p-5 border border-orange-200">
            <p className="text-xs font-bold text-orange-600 mb-1">En attente</p>
            <p className="text-3xl font-black text-orange-700">{pending}</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-5 border border-green-200">
            <p className="text-xs font-bold text-green-600 mb-1">Validés</p>
            <p className="text-3xl font-black text-green-700">{approved}</p>
          </div>
          <div className="bg-red-50 rounded-2xl p-5 border border-red-200">
            <p className="text-xs font-bold text-red-600 mb-1">Refusés</p>
            <p className="text-3xl font-black text-red-700">{rejected}</p>
          </div>
        </div>

        {/* FILTRES */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                filter === f
                  ? 'bg-[#D4A017] text-white shadow-lg'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : f === 'approved' ? 'Validés' : 'Refusés'}
            </button>
          ))}
        </div>

        {/* LISTE */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Loader2 className="w-12 h-12 text-[#D4A017] animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-bold">Chargement...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <FileVideo size={64} className="mx-auto text-gray-200 mb-4" />
            <h2 className="text-xl font-bold text-gray-600 mb-2">Aucun contenu</h2>
            <p className="text-gray-400">Les contenus soumis par vos créateurs apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className={`bg-white rounded-2xl border-2 shadow-sm hover:shadow-md transition-all overflow-hidden ${
                  sub.status === 'approved' ? 'border-green-200'
                  : sub.status === 'rejected' ? 'border-red-200'
                  : 'border-gray-100'
                }`}
              >
                <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-[#D4A017] overflow-hidden bg-gray-100 shrink-0">
                      {sub.creator_avatar ? (
                        <img src={sub.creator_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={20} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{sub.creator_name}</p>
                      <p className="text-xs text-gray-500">Soumis le {formatDate(sub.created_at)}</p>
                    </div>
                  </div>
                  {statusBadge(sub.status)}
                </div>

                <div className="p-6">
                  <p className="font-bold text-gray-800 mb-1">
                    Campagne : <span className="text-gray-600 font-normal">{sub.campaign_title}</span>
                  </p>

                  {sub.admin_note && (
                    <p className="text-sm text-gray-500 mt-1 italic">Note : {sub.admin_note}</p>
                  )}
                  {sub.reviewed_at && (
                    <p className="text-xs text-gray-400 mt-1">Décision le {formatDate(sub.reviewed_at)}</p>
                  )}

                  {/* Type de contenu */}
                  {sub.video_path && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                      {['jpg','jpeg','png','webp','gif'].includes(sub.video_path.split('.').pop()?.toLowerCase() ?? '')
                        ? <><ImageIcon size={13} /> Image</>
                        : <><FileVideo size={13} /> Vidéo</>
                      }
                    </div>
                  )}

                  {sub.status === 'pending' && sub.video_path && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      <button
                        onClick={() => openContent(sub.id)}
                        disabled={loadingSignedUrl === sub.id}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
                      >
                        {loadingSignedUrl === sub.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Play size={16} />
                        )}
                        Visionner
                      </button>

                      <button
                        onClick={() => decide(sub.id, 'approved')}
                        disabled={processingId === sub.id}
                        className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-xl font-bold hover:bg-green-100 transition-all disabled:opacity-50"
                      >
                        {processingId === sub.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        Valider
                      </button>

                      <button
                        onClick={() => { setRejectTarget(sub.id); setBrandNote(''); }}
                        disabled={processingId === sub.id}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all disabled:opacity-50"
                      >
                        <X size={16} />
                        Refuser
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALE CONTENU */}
      {modalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setModalUrl(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Visionner le contenu</h3>
              <button onClick={() => setModalUrl(null)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            {modalIsImage ? (
              <img src={modalUrl} alt="contenu" className="w-full max-h-[70vh] object-contain bg-gray-50" />
            ) : (
              <video src={modalUrl} controls autoPlay className="w-full max-h-[60vh] bg-black" />
            )}
          </div>
        </div>
      )}

      {/* MODALE REJET */}
      {rejectTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setRejectTarget(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-gray-900 mb-4">Motif de refus (optionnel)</h3>
            <textarea
              value={brandNote}
              onChange={(e) => setBrandNote(e.target.value)}
              placeholder="Ex : Le contenu ne correspond pas au brief de la campagne..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setRejectTarget(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => decide(rejectTarget, 'rejected', brandNote || undefined)}
                disabled={processingId === rejectTarget}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {processingId === rejectTarget ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

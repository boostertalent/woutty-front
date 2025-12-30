import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react'; // Assure-toi d'avoir installé lucide-react

export default function PublicPage() {
  return (
    <div className="flex flex-col">
      
      {/* SECTION HERO */}
      <section className="py-24 lg:py-32 px-4 text-center bg-gradient-to-b from-white to-indigo-50/50">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-6">
          La marketplace ultime pour <br />
          <span className="text-indigo-600">le contenu UGC</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Nous simplifions la collaboration entre les marques e-commerce et les créateurs de contenu talentueux. Authenticité, rapidité et performance.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/public/creators">
            <button className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2">
              Je suis Créateur
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/public/brands">
            <button className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-300 text-gray-900 rounded-lg font-bold hover:bg-gray-50 transition">
              Je suis une Marque
            </button>
          </Link>
        </div>
      </section>

      {/* SECTION AVANTAGES RAPIDES */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Bloc Créateurs */}
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Pour les Créateurs</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-green-500" /> Gardez les produits reçus
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-green-500" /> Rémunération rapide
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-green-500" /> Pas besoin de milliers d'abonnés
                </li>
              </ul>
              <Link href="/public/creators" className="text-indigo-600 font-medium hover:underline">
                En savoir plus &rarr;
              </Link>
            </div>

            {/* Bloc Marques */}
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Pour les Marques</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" /> Contenus livrés en &lt; 48h
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" /> Droits d'utilisation inclus (Ads)
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" /> Créateurs vérifiés manuellement
                </li>
              </ul>
              <Link href="/public/brands" className="text-blue-600 font-medium hover:underline">
                Découvrir l'offre &rarr;
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
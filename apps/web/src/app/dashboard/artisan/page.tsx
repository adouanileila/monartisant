import Image from "next/image";
import { ClipboardList, CheckCircle, Star, DollarSign, Eye, ArrowRight, MapPin, Calendar } from "lucide-react";
import LandingFooter from "@/components/landing/landing-footer";
import "../../../landing.css";

const stats = [
  { icon: ClipboardList, label: "En attente", value: "3", color: "text-blue-500" },
  { icon: CheckCircle, label: "Acceptées", value: "12", color: "text-emerald-500" },
  { icon: Star, label: "Note moyenne", value: "4.7", color: "text-amber-500" },
  { icon: DollarSign, label: "Ce mois", value: "850 DT", color: "text-indigo-500" },
  { icon: Eye, label: "Vues profil", value: "128", color: "text-purple-500" },
];

const demandes = [
  { nom: "Sami Ayari", ville: "Tunis", titre: "Rénovation salle de bain", statut: "En attente", avatar: "/images/artisans/karim-plumber.png", date: "Aujourd'hui, 14:30" },
  { nom: "Mouna Khelifi", ville: "Ariana", titre: "Peinture façade", statut: "Acceptée", avatar: "/images/artisans/amina-painter.png", date: "Hier, 09:15" },
];

const categories = [
  { nom: "Plomberie", count: "12 requêtes" },
  { nom: "Électricité", count: "8 requêtes" },
  { nom: "Peinture", count: "5 requêtes" },
  { nom: "Menuiserie", count: "3 requêtes" },
];

export default function ArtisanDashboardPage() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Hero Header avec fond photographique intégré */}
      <div className="relative h-64 lg:h-[300px] w-full">
        <Image
          src="/images/hero-artisan.png"
          alt="Artisan Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-slate-900/60" />
        
        {/* Hero Content */}
        <div className="absolute bottom-8 left-6 lg:left-12 z-10 text-white">
          <p className="text-emerald-400 text-sm font-semibold mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            En ligne
          </p>
          <h1 className="text-3xl lg:text-4xl font-semibold mb-1">
            Bonjour, Karim
          </h1>
          <p className="text-slate-300 text-sm lg:text-base font-light">
            Voici votre activité du jour
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 px-6 lg:px-12 max-w-6xl mx-auto w-full py-10 space-y-12">

        {/* Stats */}
        <div>
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-6">Aperçu</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2.5 rounded-xl bg-slate-50 ${s.color}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[14px] font-medium text-slate-500">{s.label}</span>
                </div>
                <span className="text-4xl font-semibold text-slate-800 tracking-tight">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-slate-100" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

          {/* Demandes récentes */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Demandes récentes</h2>
              <button className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors">
                Tout voir <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col">
              {demandes.map((d, i) => (
                <div
                  key={i}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-5">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                      <Image src={d.avatar} alt={d.nom} fill className="object-cover" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-slate-900 mb-0.5">{d.titre}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <span>{d.nom}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {d.ville}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {d.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        d.statut === "En attente"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {d.statut}
                    </span>
                    {d.statut === "En attente" && (
                      <div className="flex gap-3">
                        <button className="text-sm font-medium text-slate-400 hover:text-slate-700 transition-colors">Ignorer</button>
                        <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">Accepter</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expertises */}
          <div>
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-6">Expertises</h2>
            <div className="flex flex-col gap-1">
              {categories.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                >
                  <span className="text-base font-medium text-slate-700">{c.nom}</span>
                  <span className="text-sm text-slate-400">{c.count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="mt-16">
        <LandingFooter />
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
import { FileText, Heart, MessageCircle, ArrowRight, MapPin, Plus, X } from "lucide-react";
import "../../../landing.css";

export default function ClientDashboard({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  const firstName = session.user.name?.split(" ")[0] || "";
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [adresse, setAdresse] = useState("");

  const queryClient = useQueryClient();
  const { data: demandes } = useQuery(orpc.myDemandes.queryOptions());

  const createMutation = useMutation(
    orpc.createDemande.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.myDemandes.key() });
        setShowForm(false);
        setDescription("");
        setAdresse("");
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ description, adresse });
  };

  const demandesEnCours = demandes?.filter((d) => d.statut !== "terminee") ?? [];

  const stats = [
    { icon: FileText, label: "Demandes en cours", value: String(demandesEnCours.length), color: "text-blue-500" },
    { icon: Heart, label: "Artisans favoris", value: "0", color: "text-rose-500" },
    { icon: MessageCircle, label: "Messages non lus", value: "0", color: "text-purple-500" },
  ];

  const categoriesPopulaires = [
    { nom: "Plomberie", count: "24 artisans" },
    { nom: "Électricité", count: "18 artisans" },
    { nom: "Peinture", count: "15 artisans" },
    { nom: "Menuiserie", count: "9 artisans" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Hero Header */}
      <div className="relative h-64 lg:h-[300px] w-full">
        <Image
          src="/images/hero-artisan.png"
          alt="Mon Artisan"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-slate-900/60" />

        <div className="absolute bottom-8 left-6 lg:left-12 z-10 text-white">
          <p className="text-emerald-400 text-sm font-semibold mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Bienvenue
          </p>
          <h1 className="text-3xl lg:text-4xl font-semibold mb-1">
            Bonjour, {firstName || "..."}
          </h1>
          <p className="text-slate-300 text-sm lg:text-base font-light">
            Trouvez le bon artisan pour votre projet
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 px-6 lg:px-12 max-w-6xl mx-auto w-full py-10 space-y-12">
        {/* Stats */}
        <div>
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-6">Aperçu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
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
          {/* Colonne principale : demandes + formulaire */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Mes demandes</h2>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Nouvelle demande
                </button>
              )}
            </div>

            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800">Nouvelle demande</h3>
                  <button type="button" onClick={() => setShowForm(false)}>
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-600 mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-600 mb-2">Adresse</label>
                  <input
                    type="text"
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    required
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {createMutation.isPending ? "Envoi..." : "Envoyer la demande"}
                </button>
              </form>
            )}

            <div className="flex flex-col">
              {!demandes || demandes.length === 0 ? (
                <p className="text-sm text-slate-400 py-6">Aucune demande pour le moment.</p>
              ) : (
                demandes.map((d) => (
                  <div
                    key={d.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <h3 className="text-base font-medium text-slate-900 mb-0.5">{d.description}</h3>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <MapPin className="w-3.5 h-3.5" /> {d.adresse}
                      </div>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full font-medium bg-amber-50 text-amber-700 mt-2 sm:mt-0 w-fit">
                      {d.statut}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Colonne latérale : catégories populaires */}
          <div>
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-6">Catégories populaires</h2>
            <div className="flex flex-col gap-1">
              {categoriesPopulaires.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <span className="text-base font-medium text-slate-700">{c.nom}</span>
                  <span className="text-sm text-slate-400">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
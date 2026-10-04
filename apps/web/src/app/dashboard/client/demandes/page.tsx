"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import {
  FileText,
  MapPin,
  MessageCircle,
  Plus,
  X,
  Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Statut = "en_attente" | "acceptee" | "refusee" | "terminee";

type FilterTab = "toutes" | Statut;

const TABS: { key: FilterTab; label: string }[] = [
  { key: "toutes", label: "Toutes" },
  { key: "en_attente", label: "En attente" },
  { key: "acceptee", label: "Acceptées" },
  { key: "terminee", label: "Terminées" },
  { key: "refusee", label: "Refusées" },
];

// ─── Status badge config ───────────────────────────────────────────────────────

const STATUT_CONFIG: Record<Statut, { label: string; className: string }> = {
  en_attente: {
    label: "En attente",
    className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  },
  acceptee: {
    label: "Acceptée",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  },
  terminee: {
    label: "Terminée",
    className: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  },
  refusee: {
    label: "Refusée",
    className: "bg-red-50 text-red-600 ring-1 ring-red-200",
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientDemandesPage() {
  const queryClient = useQueryClient();

  // Fetch
  const { data: demandes, isLoading } = useQuery(
    orpc.myDemandes.queryOptions(),
  );

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [adresse, setAdresse] = useState("");

  // Mutation
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
    if (!description.trim() || !adresse.trim()) return;
    createMutation.mutate({ description, adresse });
  };

  // Filtering
  const [activeTab, setActiveTab] = useState<FilterTab>("toutes");

  const filtered =
    activeTab === "toutes"
      ? (demandes ?? [])
      : (demandes ?? []).filter((d) => d.statut === activeTab);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans px-4 sm:px-8 py-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Mes demandes
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Suivez et gérez toutes vos demandes de service
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-emerald-200"
          >
            <Plus className="w-4 h-4" />
            Nouvelle demande
          </button>
        )}
      </div>

      {/* Collapsible Form */}
      {showForm && (
        <div className="mb-8 bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-slate-800">
              Nouvelle demande
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setDescription("");
                setAdresse("");
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-600 mb-1.5"
              >
                Description du travail
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                placeholder="Décrivez le travail à effectuer..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 resize-none transition"
              />
            </div>

            <div>
              <label
                htmlFor="adresse"
                className="block text-sm font-medium text-slate-600 mb-1.5"
              >
                Adresse d'intervention
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="adresse"
                  type="text"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  required
                  placeholder="Ex : 12 rue de la Paix, Paris"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-emerald-200"
              >
                {createMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {createMutation.isPending
                  ? "Envoi en cours..."
                  : "Envoyer la demande"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setDescription("");
                  setAdresse("");
                }}
                className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-white border border-slate-100 rounded-xl shadow-sm w-fit overflow-x-auto">
        {TABS.map((tab) => {
          const count =
            tab.key === "toutes"
              ? (demandes?.length ?? 0)
              : (demandes?.filter((d) => d.statut === tab.key).length ?? 0);

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              {!isLoading && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    activeTab === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        /* Skeleton loading state */
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-2xl p-6 animate-pulse"
            >
              <div className="h-4 bg-slate-100 rounded w-3/5 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-2/5 mb-4" />
              <div className="h-5 bg-slate-100 rounded-full w-20" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">
            {activeTab === "toutes"
              ? "Aucune demande pour le moment"
              : "Aucune demande dans cette catégorie"}
          </h3>
          <p className="text-sm text-slate-400 max-w-xs">
            {activeTab === "toutes"
              ? "Cliquez sur « Nouvelle demande » pour créer votre première demande."
              : "Essayez un autre filtre ou créez une nouvelle demande."}
          </p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-6 flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-emerald-200"
            >
              <Plus className="w-4 h-4" />
              Nouvelle demande
            </button>
          )}
        </div>
      ) : (
        /* Card list */
        <div className="space-y-4">
          {filtered.map((demande) => {
            const statutCfg =
              STATUT_CONFIG[demande.statut as Statut] ??
              STATUT_CONFIG.en_attente;
            const canMessage =
              demande.statut === "acceptee" || demande.statut === "terminee";

            return (
              <div
                key={demande.id}
                className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200"
              >
                {/* Top row: description + badge */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <p className="text-sm font-medium text-slate-800 leading-snug flex-1">
                    {demande.description}
                  </p>
                  <span
                    className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold ${statutCfg.className}`}
                  >
                    {statutCfg.label}
                  </span>
                </div>

                {/* Address */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{demande.adresse}</span>
                </div>

                {/* Footer row */}
                <div className="flex items-center justify-between">
                  {/* Date */}
                  <span className="text-xs text-slate-400">
                    {demande.dateCreation
                      ? new Date(demande.dateCreation).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )
                      : "\u2014"}
                  </span>

                  {/* Messaging link — only acceptee or terminee */}
                  {canMessage && (
                    <Link
                      href={`/dashboard/client/messages/${demande.id}`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Voir la conversation
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

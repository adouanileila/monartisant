"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { MapPin, MessageCircle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Statut = "en_attente" | "acceptee" | "refusee" | "terminee";

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

export default function ClientMessagesPage() {
  const { data: demandes, isLoading } = useQuery(
    orpc.myDemandes.queryOptions(),
  );

  const conversations = (demandes ?? []).filter(
    (d) => d.statut === "acceptee" || d.statut === "terminee",
  );

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans px-4 sm:px-8 py-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Messages
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Vos conversations en cours avec vos artisans
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        /* Skeleton */
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-2xl p-5 animate-pulse"
            >
              <div className="h-4 bg-slate-100 rounded w-3/5 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-2/5 mb-4" />
              <div className="h-5 bg-slate-100 rounded-full w-20" />
            </div>
          ))}
        </div>
      ) : conversations.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">
            Aucune conversation pour le moment
          </h3>
          <p className="text-sm text-slate-400 max-w-xs">
            Vos conversations apparaîtront ici dès qu'un artisan aura accepté
            l'une de vos demandes.
          </p>
          <Link
            href="/dashboard/client/demandes"
            className="mt-6 flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-emerald-200"
          >
            Voir mes demandes
          </Link>
        </div>
      ) : (
        /* Conversation card list */
        <div className="space-y-4">
          {conversations.map((demande) => {
            const statutCfg =
              STATUT_CONFIG[demande.statut as Statut] ??
              STATUT_CONFIG.en_attente;

            return (
              <Link
                key={demande.id}
                href={`/dashboard/client/messages/${demande.id}`}
                className="group flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200"
              >
                {/* Left: info */}
                <div className="flex-1 min-w-0 pr-4">
                  {/* Description */}
                  <p className="text-sm font-medium text-slate-800 leading-snug truncate mb-2">
                    {demande.description}
                  </p>

                  {/* Address */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{demande.adresse}</span>
                  </div>

                  {/* Date + badge */}
                  <div className="flex items-center gap-3 flex-wrap">
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
                        : "—"}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statutCfg.className}`}
                    >
                      {statutCfg.label}
                    </span>
                  </div>
                </div>

                {/* Right: CTA icon */}
                <div className="shrink-0 flex items-center gap-1.5 text-emerald-600 group-hover:text-emerald-700 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-xs font-semibold hidden sm:inline">
                    Ouvrir
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

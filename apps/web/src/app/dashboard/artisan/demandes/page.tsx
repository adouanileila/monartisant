"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { MapPin, MessageCircle } from "lucide-react";
import { toast } from "sonner";

// ─── Status badge config ──────────────────────────────────────────────────────

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

export default function ArtisanDemandesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: demandes, isLoading } = useQuery(orpc.myDemandes.queryOptions());

  const acceptMutation = useMutation(
    orpc.acceptDemande.mutationOptions({
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: orpc.myDemandes.key() });
        // Redirect straight into the conversation that was just unlocked.
        router.push(`/dashboard/artisan/messages/${variables.demandeId}`);
      },
      onError: (error) => {
        console.error("[acceptDemande] mutation failed:", error);
        const msg = error?.message ?? "";
        if (msg.includes("profile not found") || msg.includes("FORBIDDEN")) {
          toast.error(
            "Profil artisan introuvable. Veuillez compléter votre inscription.",
            { duration: 5000 },
          );
          router.push("/onboarding");
        } else {
          toast.error(`Erreur : ${msg || "Une erreur inattendue s'est produite."}`);
        }
      },
    }),
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/60 px-4 sm:px-8 py-10 max-w-4xl mx-auto">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans px-4 sm:px-8 py-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Mes demandes
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Demandes disponibles et celles que vous avez acceptées
        </p>
      </div>

      {!demandes || demandes.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">
            Aucune demande pour le moment
          </h3>
          <p className="text-sm text-slate-400 max-w-xs">
            Les nouvelles demandes de clients apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {demandes.map((d) => {
            const statutCfg =
              STATUT_CONFIG[d.statut as Statut] ?? STATUT_CONFIG.en_attente;
            const canMessage =
              d.statut === "acceptee" || d.statut === "terminee";

            return (
              <div
                key={d.id}
                className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200"
              >
                {/* Top row: description + badge */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <p className="text-sm font-medium text-slate-800 leading-snug flex-1">
                    {d.description}
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
                  <span>{d.adresse}</span>
                </div>

                {/* Date */}
                <div className="text-xs text-slate-400 mb-4">
                  {d.dateCreation
                    ? new Date(d.dateCreation).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </div>

                {/* Footer: action buttons */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Accepter — only for unassigned requests */}
                  {d.statut === "en_attente" && (
                    <button
                      onClick={() =>
                        acceptMutation.mutate({
                          demandeId: d.id,
                          // artisanId is now resolved server-side from the session.
                        })
                      }
                      disabled={acceptMutation.isPending}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition-colors"
                    >
                      {acceptMutation.isPending ? "En cours…" : "Accepter"}
                    </button>
                  )}

                  {/* Contacter le client — only once accepted or finished */}
                  {canMessage && (
                    <Link
                      href={`/dashboard/artisan/messages/${d.id}`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Contacter le client
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
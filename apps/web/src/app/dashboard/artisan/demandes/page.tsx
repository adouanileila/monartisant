"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { MapPin, MessageCircle, Wrench, AlertCircle } from "lucide-react";
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
        router.push(`/dashboard/artisan/messages/${variables.demandeId}`);
      },
      onError: (error: any) => {
        const msg: string = error?.message ?? "";

        // Business rule: artisan hasn't priced this service yet
        if (
          msg.includes("PRIX_NON_DEFINI") ||
          msg.includes("définir un prix")
        ) {
          toast.error(
            <span className="flex flex-col gap-1">
              <span className="font-semibold">Prix non défini</span>
              <span>
                Vous devez définir un prix pour ce service avant de l'accepter.{" "}
                <Link
                  href="/dashboard/artisan/services"
                  className="underline font-semibold"
                >
                  Définir un prix →
                </Link>
              </span>
            </span>,
            { duration: 8000 },
          );
          return;
        }

        if (msg.includes("profile not found") || msg.includes("FORBIDDEN")) {
          toast.error(
            "Profil artisan introuvable. Veuillez compléter votre inscription.",
            { duration: 5000 },
          );
          router.push("/onboarding");
          return;
        }

        toast.error(`Erreur : ${msg || "Une erreur inattendue s'est produite."}`);
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
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">
            Aucune demande pour le moment
          </h3>
          <p className="text-sm text-slate-400 max-w-xs">
            Les nouvelles demandes de clients apparaîtront ici une fois que vous
            aurez ajouté des services à votre profil.
          </p>
          <Link
            href="/dashboard/artisan/services"
            className="mt-5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-emerald-200"
          >
            Gérer mes services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {demandes.map((d: any) => {
            const statutCfg =
              STATUT_CONFIG[d.statut as Statut] ?? STATUT_CONFIG.en_attente;
            const canMessage =
              d.statut === "acceptee" || d.statut === "terminee";

            // If artisan hasn't priced this service (artisanPrix is null/undefined)
            // and the demande is unassigned, show a warning on the accept button.
            const missingPrice =
              d.statut === "en_attente" &&
              d.serviceId &&
              d.artisanPrix === null;

            return (
              <div
                key={d.id}
                className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200"
              >
                {/* Top: description + status badge */}
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="text-sm font-medium text-slate-800 leading-snug flex-1">
                    {d.description}
                  </p>
                  <span
                    className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold ${statutCfg.className}`}
                  >
                    {statutCfg.label}
                  </span>
                </div>

                {/* Service chip */}
                {d.serviceNom && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 ring-1 ring-emerald-100 px-2.5 py-0.5 rounded-full">
                      <Wrench className="w-3 h-3" />
                      {d.serviceNom}
                      {d.artisanPrix != null && (
                        <span className="ml-1 text-slate-500 font-semibold">
                          · {Number(d.artisanPrix).toFixed(2)} €
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {/* Missing price warning */}
                {missingPrice && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 ring-1 ring-amber-200 rounded-xl px-3 py-2 mb-3">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Vous n'avez pas encore défini de prix pour ce service.{" "}
                      <Link
                        href="/dashboard/artisan/services"
                        className="font-semibold underline"
                      >
                        Définir un prix →
                      </Link>
                    </span>
                  </div>
                )}

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

                {/* Footer: actions */}
                <div className="flex items-center gap-3 flex-wrap">
                  {d.statut === "en_attente" && (
                    <button
                      onClick={() =>
                        acceptMutation.mutate({ demandeId: d.id })
                      }
                      disabled={acceptMutation.isPending}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition-colors"
                    >
                      {acceptMutation.isPending ? "En cours…" : "Accepter"}
                    </button>
                  )}

                  {canMessage && (
                    <Link
                      href={`/dashboard/artisan/messages/${d.id}`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Contacter le client
                    </Link>
                  )}

                  {/* Prix convenu badge (once accepted) */}
                  {d.statut !== "en_attente" && d.prixConvenu != null && (
                    <span className="text-xs text-slate-500">
                      Prix convenu :{" "}
                      <span className="font-semibold text-slate-700">
                        {Number(d.prixConvenu).toFixed(2)} €
                      </span>
                    </span>
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
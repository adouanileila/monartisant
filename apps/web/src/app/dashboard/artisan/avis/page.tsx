"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { authClient } from "@/lib/auth-client";
import { Star, MessageSquareText, TrendingUp, Users } from "lucide-react";

// ─── Star display (read-only) ─────────────────────────────────────────────────

function StarDisplay({ note, size = "sm" }: { note: number; size?: "sm" | "md" | "lg" }) {
  const iconClass =
    size === "lg" ? "w-6 h-6" : size === "md" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${iconClass} transition-colors ${
            n <= Math.round(note)
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Average rating card ──────────────────────────────────────────────────────

function AverageCard({
  moyenne,
  total,
}: {
  moyenne: number;
  total: number;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Big score */}
        <div className="text-center sm:text-left">
          <p className="text-6xl font-bold text-slate-900 tracking-tight leading-none">
            {total === 0 ? "—" : moyenne.toFixed(1)}
          </p>
          <p className="text-sm text-slate-400 mt-1">sur 5</p>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-16 bg-slate-100" />

        {/* Stars + count */}
        <div className="flex flex-col items-center sm:items-start gap-2">
          <StarDisplay note={moyenne} size="lg" />
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-slate-700">{total}</span>
            avis reçu{total !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Distribution teaser (static visual) */}
        {total > 0 && (
          <div className="ml-auto hidden md:flex items-center gap-2 text-xs text-slate-400">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-600 font-medium">Note vérifiée</span>
            par {total} client{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AvisCardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 animate-pulse space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-100 rounded w-2/5" />
        <div className="h-4 bg-slate-100 rounded-full w-24" />
      </div>
      <div className="h-3 bg-slate-100 rounded w-1/3" />
      <div className="h-10 bg-slate-100 rounded w-full" />
    </div>
  );
}

// ─── Hook: resolve artisan ID from session ────────────────────────────────────

function useArtisanId() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  // We need the artisan row for this userId. Re-use myDemandes to extract artisanId
  // or use a dedicated resolver — here we use the privateData pattern available.
  // Since we don't have a direct getMyArtisanProfile route, we use the fact that
  // the artisan dashboard fetches myDemandes and each demande has artisanId.
  // Simpler: use the artisanAvis route — but we need artisanId to call it.
  // WORKAROUND: Temporarily store artisanId by calling a route that resolves it.
  // We use `getMyServices` response which includes artisanId via service_artisan.
  const { data: myServices } = useQuery(orpc.getMyServices.queryOptions());

  // Extract artisanId from the first service entry (all entries share same artisanId)
  // The serviceArtisan rows contain artisanId via the artisan FK.
  // Since we can't easily get artisanId from session (session only has userId),
  // we use a small trick: query myDemandes and pick artisanId from the first row.
  const { data: myDemandes } = useQuery(orpc.myDemandes.queryOptions());

  // artisanId appears on demandes that have been assigned
  const artisanId = myDemandes?.find((d) => d.artisanId)?.artisanId ?? null;

  return { artisanId, userId, isReady: !!artisanId };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ArtisanAvisPage() {
  const { artisanId, isReady } = useArtisanId();

  const { data, isLoading } = useQuery({
    ...orpc.getArtisanAvis.queryOptions({ input: { artisanId: artisanId ?? "" } }),
    enabled: !!artisanId,
  });

  const moyenne = data?.moyenne ?? 0;
  const total = data?.total ?? 0;
  const avisList = data?.avisList ?? [];

  const isLoadingPage = !isReady || isLoading;

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans px-4 sm:px-8 py-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Mes avis
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Les avis laissés par vos clients sur vos prestations
        </p>
      </div>

      {/* Average Rating Card */}
      {isLoadingPage ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-8 animate-pulse">
          <div className="flex items-center gap-6">
            <div className="h-16 w-20 bg-slate-100 rounded-xl" />
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-slate-100 rounded w-32" />
              <div className="h-4 bg-slate-100 rounded w-24" />
            </div>
          </div>
        </div>
      ) : (
        <AverageCard moyenne={moyenne} total={total} />
      )}

      {/* Section title */}
      <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Star className="w-4 h-4 text-amber-400" />
        Avis individuels
      </h2>

      {/* List */}
      {isLoadingPage ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <AvisCardSkeleton key={i} />
          ))}
        </div>
      ) : avisList.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Star className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">
            Aucun avis pour le moment
          </h3>
          <p className="text-sm text-slate-400 max-w-xs">
            Vos clients pourront vous laisser un avis une fois qu'une demande
            aura été marquée comme terminée.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...avisList].reverse().map((item) => (
            <div
              key={item.id}
              className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200"
            >
              {/* Top: client name + stars */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2.5">
                  {/* Avatar initials */}
                  <div className="w-9 h-9 rounded-full bg-emerald-50 ring-1 ring-emerald-200 flex items-center justify-center shrink-0 text-sm font-bold text-emerald-700">
                    {(item.clientPrenom ?? "C").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-tight">
                      {item.clientPrenom ?? "Client anonyme"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.dateCreation
                        ? new Date(item.dateCreation).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Star rating */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <StarDisplay note={item.note} size="md" />
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 ring-1 ring-amber-200 px-2 py-0.5 rounded-full">
                    {item.note}/5
                  </span>
                </div>
              </div>

              {/* Comment */}
              {item.commentaire ? (
                <div className="flex items-start gap-2 px-3 py-3 bg-slate-50 rounded-xl">
                  <MessageSquareText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.commentaire}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Aucun commentaire ajouté
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

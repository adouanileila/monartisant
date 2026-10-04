"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Star, MessageSquareText, User } from "lucide-react";

// ─── Star display (read-only) ─────────────────────────────────────────────────

function StarDisplay({ note, size = "sm" }: { note: number; size?: "sm" | "md" }) {
  const iconClass = size === "md" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${iconClass} ${
            n <= note
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200"
          }`}
        />
      ))}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientAvisPage() {
  const { data: avisList, isLoading } = useQuery(
    orpc.getMyAvis.queryOptions(),
  );

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans px-4 sm:px-8 py-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Mes avis
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Les avis que vous avez laissés à vos artisans
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <AvisCardSkeleton key={i} />
          ))}
        </div>
      ) : !avisList || avisList.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Star className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">
            Aucun avis pour le moment
          </h3>
          <p className="text-sm text-slate-400 max-w-xs">
            Vous pourrez laisser un avis sur vos demandes une fois qu'elles
            auront été marquées comme terminées.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {avisList.map((item) => (
            <div
              key={item.id}
              className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200"
            >
              {/* Top: artisan name + stars */}
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 ring-1 ring-emerald-200 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-tight">
                      {item.artisanPrenom ?? "Artisan"}
                    </p>
                    <p className="text-xs text-slate-400">Artisan</p>
                  </div>
                </div>
                <StarDisplay note={item.note} />
              </div>

              {/* Comment */}
              {item.commentaire ? (
                <div className="flex items-start gap-2 mt-3 px-3 py-3 bg-slate-50 rounded-xl">
                  <MessageSquareText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.commentaire}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-400 italic">
                  Aucun commentaire ajouté
                </p>
              )}

              {/* Footer: date */}
              <p className="mt-3 text-xs text-slate-400">
                {item.dateCreation
                  ? new Date(item.dateCreation).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

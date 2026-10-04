"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import {
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Banknote,
  Users,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Statut = "en_attente" | "paye" | "echoue";

const STATUT_CONFIG: Record<Statut, { label: string; className: string; icon: React.ElementType }> = {
  paye: {
    label: "Payé",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    icon: CheckCircle,
  },
  en_attente: {
    label: "En attente",
    className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    icon: Clock,
  },
  echoue: {
    label: "Échoué",
    className: "bg-red-50 text-red-600 ring-1 ring-red-200",
    icon: XCircle,
  },
};

// ─── Earnings Summary Card ────────────────────────────────────────────────────

function EarningsCard({
  totalEarnings,
  paiements,
}: {
  totalEarnings: number;
  paiements: any[];
}) {
  const paid = paiements.filter((p) => p.statut === "paye");
  const pending = paiements.filter((p) => p.statut === "en_attente");

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Total earnings */}
        <div className="text-center sm:text-left">
          <p className="text-5xl font-bold text-slate-900 tracking-tight leading-none">
            {totalEarnings.toFixed(2)} €
          </p>
          <p className="text-sm text-slate-400 mt-1">revenus totaux confirmés</p>
        </div>

        <div className="hidden sm:block w-px h-16 bg-slate-100" />

        {/* Stats */}
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-700">{paid.length}</span>
            paiement{paid.length !== 1 ? "s" : ""} confirmé{paid.length !== 1 ? "s" : ""}
          </div>
          {pending.length > 0 && (
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-slate-600">{pending.length}</span>
              en attente de confirmation
            </div>
          )}
        </div>

        {/* Earnings icon */}
        <div className="ml-auto hidden md:flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
          <Banknote className="w-8 h-8 text-emerald-500" />
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 animate-pulse flex items-center gap-4 shadow-sm">
      <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-100 rounded w-2/3" />
        <div className="h-3 bg-slate-100 rounded w-1/3" />
      </div>
      <div className="h-5 w-20 bg-slate-100 rounded-full" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ArtisanPaiementsPage() {
  const { data, isLoading } = useQuery(orpc.getArtisanPaiements.queryOptions());

  const paiements = data?.paiements ?? [];
  const totalEarnings = data?.totalEarnings ?? 0;

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans px-4 sm:px-8 py-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Mes paiements
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Suivi des règlements reçus pour vos prestations
        </p>
      </div>

      {/* Earnings card */}
      {isLoading ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-8 animate-pulse">
          <div className="h-12 bg-slate-100 rounded w-48 mb-2" />
          <div className="h-4 bg-slate-100 rounded w-32" />
        </div>
      ) : (
        <EarningsCard totalEarnings={totalEarnings} paiements={paiements} />
      )}

      {/* Section title */}
      <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-slate-400" />
        Historique des transactions
      </h2>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <RowSkeleton key={i} />)}
        </div>
      ) : paiements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">
            Aucun paiement reçu
          </h3>
          <p className="text-sm text-slate-400 max-w-xs">
            Les paiements de vos clients apparaîtront ici une fois les prestations réglées.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...paiements].reverse().map((p) => {
            const cfg = STATUT_CONFIG[p.statut as Statut] ?? STATUT_CONFIG.en_attente;
            const StatusIcon = cfg.icon;
            return (
              <div
                key={p.id}
                className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 flex items-center gap-4"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-emerald-50 ring-1 ring-emerald-100 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {p.demandeDescription ?? "Prestation"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {/* Client name */}
                    {p.clientNom && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Users className="w-3 h-3" />
                        {p.clientNom}
                      </span>
                    )}
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-400">
                      {p.datePaiement
                        ? new Date(p.datePaiement).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <p className="text-base font-bold text-slate-900 shrink-0">
                  {p.montant?.toFixed(2)} €
                </p>

                {/* Status badge */}
                <span
                  className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${cfg.className}`}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

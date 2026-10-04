"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { CheckCircle, CreditCard, ArrowLeft, Loader2 } from "lucide-react";

// ─── Inner component that uses useSearchParams (must be inside Suspense) ───────

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  // We confirm via the demande-level query (session_id → paiement in DB).
  // If sessionId is present but no demandeId, we still show a generic success.
  const [confirmed, setConfirmed] = useState(false);
  const [animDone, setAnimDone] = useState(false);

  // Trigger the checkmark animation after mount
  useEffect(() => {
    const t = setTimeout(() => setAnimDone(true), 600);
    return () => clearTimeout(t);
  }, []);

  // Poll for up to 5s to wait for the webhook to mark the paiement as "paye".
  // In test mode, the webhook fires immediately, so this is usually instant.
  const { data: myPaiements } = useQuery({
    ...orpc.getMyPaiements.queryOptions(),
    refetchInterval: (query) => {
      const list = query.state.data as any[] | undefined;
      const latestPaid = list?.find((p) => p.statut === "paye");
      return latestPaid ? false : 2000; // keep polling every 2s until confirmed
    },
    enabled: !confirmed,
  });

  // Mark as confirmed as soon as we see a paid paiement
  useEffect(() => {
    const latestPaid = myPaiements?.find((p: any) => p.statut === "paye");
    if (latestPaid) setConfirmed(true);
  }, [myPaiements]);

  const latestPaid = (myPaiements as any[])?.find((p) => p.statut === "paye");

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-md p-8 flex flex-col items-center text-center">
          {/* Animated checkmark */}
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-700 ${
              animDone ? "bg-emerald-50 scale-100 opacity-100" : "bg-slate-50 scale-75 opacity-0"
            }`}
          >
            <CheckCircle
              className={`transition-all duration-500 delay-300 ${
                animDone ? "text-emerald-500 w-10 h-10" : "text-slate-200 w-8 h-8"
              }`}
            />
          </div>

          <h1 className="text-xl font-bold text-slate-900 mb-2">
            Paiement confirmé !
          </h1>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Votre paiement a bien été reçu. Merci de votre confiance.
          </p>

          {/* Details block */}
          {confirmed && latestPaid ? (
            <div className="w-full bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Prestation</span>
                <span className="font-medium text-slate-800 max-w-[60%] text-right truncate">
                  {latestPaid.demandeDescription ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Montant</span>
                <span className="font-bold text-emerald-600">
                  {latestPaid.montant?.toFixed(2)} €
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Moyen de paiement</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  Carte bancaire
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
              <Loader2 className="w-4 h-4 animate-spin" />
              Confirmation en cours…
            </div>
          )}

          {/* CTA */}
          <Link
            href="/dashboard/client/paiements"
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-emerald-200 mb-3 w-full justify-center"
          >
            Voir mes paiements
          </Link>
          <Link
            href="/dashboard/client/demandes"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux demandes
          </Link>
        </div>

        {sessionId && (
          <p className="text-center text-xs text-slate-300 mt-4">
            Référence : {sessionId.slice(0, 20)}…
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────

import { Suspense } from "react";

export default function PaiementSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

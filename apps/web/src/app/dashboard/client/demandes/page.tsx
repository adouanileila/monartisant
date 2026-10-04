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
  Star,
  CheckCircle2,
  CreditCard,
  Lock,
  Wrench,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

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

// ─── Star Rating Selector ─────────────────────────────────────────────────────

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          id={`star-${n}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
          aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              n <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-200 fill-slate-200"
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm font-medium text-slate-600">
          {value}/5
        </span>
      )}
    </div>
  );
}

// ─── Avis Modal ───────────────────────────────────────────────────────────────

function AvisModal({
  demandeId,
  onClose,
  onSuccess,
}: {
  demandeId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState("");

  const createMutation = useMutation(
    orpc.createAvis.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.myDemandes.key() });
        queryClient.invalidateQueries({ queryKey: orpc.getMyAvis.key() });
        toast.success("Avis envoyé ! Merci pour votre retour.");
        onSuccess();
      },
      onError: (err: any) => {
        toast.error(err?.message ?? "Une erreur est survenue.");
      },
    }),
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (note === 0) return toast.error("Veuillez choisir une note (1 à 5 étoiles).");
    createMutation.mutate({ demandeId, note, commentaire: commentaire.trim() || undefined });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Laisser un avis
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Évaluez votre expérience avec l'artisan
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Note *
            </label>
            <StarRatingInput value={note} onChange={setNote} />
          </div>

          {/* Comment */}
          <div>
            <label
              htmlFor="commentaire-avis"
              className="block text-sm font-medium text-slate-600 mb-1.5"
            >
              Commentaire <span className="text-slate-400 font-normal">(optionnel)</span>
            </label>
            <textarea
              id="commentaire-avis"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={3}
              placeholder="Décrivez votre expérience avec l'artisan..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 resize-none transition"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={createMutation.isPending || note === 0}
              id="submit-avis"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-emerald-200"
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {createMutation.isPending ? "Envoi…" : "Envoyer l'avis"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Payment Button ───────────────────────────────────────────────────────────

function PaiementButton({ demandeId }: { demandeId: string }) {
  const { data: paiement, isLoading } = useQuery(
    orpc.getPaiementForDemande.queryOptions({ input: { demandeId } }),
  );

  const payMutation = useMutation(
    orpc.createPaiement.mutationOptions({
      onSuccess: ({ checkoutUrl }) => {
        window.location.href = checkoutUrl;
      },
      onError: (err: any) => {
        toast.error(err?.message ?? "Erreur lors de l'initialisation du paiement.");
      },
    }),
  );

  if (isLoading) {
    return <div className="w-32 h-7 bg-slate-100 rounded-full animate-pulse" />;
  }

  // Already paid — show static badge
  if (paiement?.statut === "paye") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 ring-1 ring-emerald-200 px-2.5 py-1 rounded-full">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Payé
      </span>
    );
  }

  // Payment pending (checkout started but not completed)
  if (paiement?.statut === "en_attente") {
    return (
      <button
        id={`payer-btn-${demandeId}`}
        onClick={() => payMutation.mutate({ demandeId })}
        disabled={payMutation.isPending}
        className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 ring-1 ring-amber-200 px-2.5 py-1 rounded-full transition-colors disabled:opacity-60"
      >
        {payMutation.isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <CreditCard className="w-3.5 h-3.5" />
        )}
        Reprendre le paiement
      </button>
    );
  }

  // No payment yet — show "Payer" CTA
  return (
    <div className="flex flex-col items-end gap-0.5">
      <button
        id={`payer-btn-${demandeId}`}
        onClick={() => payMutation.mutate({ demandeId })}
        disabled={payMutation.isPending}
        className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 active:scale-95 px-3 py-1.5 rounded-full transition-all shadow-sm shadow-emerald-200 disabled:opacity-60"
      >
        {payMutation.isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Lock className="w-3 h-3" />
        )}
        {payMutation.isPending ? "Redirection…" : "Payer la prestation"}
      </button>
      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
        <Lock className="w-2.5 h-2.5" /> Paiement sécurisé par Stripe
      </span>
    </div>
  );
}

// ─── Review Button / Submitted State ─────────────────────────────────────────


function AvisButton({ demandeId }: { demandeId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: existingAvis, isLoading } = useQuery(
    orpc.getAvisForDemande.queryOptions({ input: { demandeId } }),
  );

  // Already reviewed (either from DB or from just submitting)
  const isReviewed = submitted || !!existingAvis;

  if (isLoading) {
    return (
      <div className="w-28 h-7 bg-slate-100 rounded-full animate-pulse" />
    );
  }

  if (isReviewed) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 ring-1 ring-emerald-200 px-2.5 py-1 rounded-full">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Avis envoyé
      </span>
    );
  }

  return (
    <>
      <button
        id={`avis-btn-${demandeId}`}
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 ring-1 ring-amber-200 px-2.5 py-1 rounded-full transition-colors"
      >
        <Star className="w-3.5 h-3.5" />
        Laisser un avis
      </button>

      {showModal && (
        <AvisModal
          demandeId={demandeId}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            setSubmitted(true);
          }}
        />
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientDemandesPage() {
  const queryClient = useQueryClient();

  const { data: demandes, isLoading } = useQuery(
    orpc.myDemandes.queryOptions(),
  );

  const [showForm, setShowForm] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const [description, setDescription] = useState("");
  const [adresse, setAdresse] = useState("");

  // Fetch services for the dropdown (grouped by category)
  const { data: services } = useQuery(orpc.getServices.queryOptions());

  // Group services by category for optgroup display
  const servicesByCategory = (services ?? []).reduce<
    Record<string, { id: string; nom: string; categorieNom?: string }[]>
  >((acc, s: any) => {
    const cat = s.categorieNom ?? "Autres";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

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
    if (!serviceId) return toast.error("Veuillez sélectionner un service.");
    createMutation.mutate({ description, adresse, serviceId });
  };

  const [activeTab, setActiveTab] = useState<FilterTab>("toutes");

  const filtered =
    activeTab === "toutes"
      ? (demandes ?? [])
      : (demandes ?? []).filter((d) => d.statut === activeTab);

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
            id="nouvelle-demande-btn"
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
                setServiceId("");
                setDescription("");
                setAdresse("");
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Service Dropdown */}
            <div>
              <label
                htmlFor="service-select"
                className="block text-sm font-medium text-slate-600 mb-1.5"
              >
                Service demandé *
              </label>
              {services && Object.keys(servicesByCategory).length === 0 ? (
                <div className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-700 font-medium">
                  ⚠ Aucun service disponible pour le moment — l&apos;administrateur doit d&apos;abord créer le catalogue.
                </div>
              ) : (
                <div className="relative">
                  <Wrench className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    id="service-select"
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition"
                  >
                    <option value="">-- Choisir un service --</option>
                    {Object.entries(servicesByCategory).map(([cat, svcs]) => (
                      <optgroup key={cat} label={cat}>
                        {svcs.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nom}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              )}
            </div>

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
              id={`tab-${tab.key}`}
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
        <div className="space-y-4">
          {filtered.map((demande) => {
            const statutCfg =
              STATUT_CONFIG[demande.statut as Statut] ??
              STATUT_CONFIG.en_attente;
            const canMessage =
              demande.statut === "acceptee" || demande.statut === "terminee";
            const canReview = demande.statut === "terminee";

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

                {/* Service tag */}
                {(demande as any).serviceNom && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 ring-1 ring-emerald-100 rounded-full px-2.5 py-0.5 w-fit mb-3">
                    <Wrench className="w-3 h-3 shrink-0" />
                    <span className="font-medium">{(demande as any).serviceNom}</span>
                    {(demande as any).prixConvenu && (
                      <span className="ml-1 text-slate-400">·</span>
                    )}
                    {(demande as any).prixConvenu && (
                      <span className="font-semibold text-slate-700">
                        {((demande as any).prixConvenu as number).toFixed(2)} €
                      </span>
                    )}
                  </div>
                )}

                {/* Address */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{demande.adresse}</span>
                </div>


                {/* Footer row */}
                <div className="flex items-center justify-between flex-wrap gap-2">
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
                      : "—"}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Payment button — only terminee */}
                    {canReview && <PaiementButton demandeId={demande.id} />}

                    {/* Review button — only terminee */}
                    {canReview && <AvisButton demandeId={demande.id} />}

                    {/* Messaging link — only acceptee or terminee */}
                    {canMessage && (
                      <Link
                        href={`/dashboard/client/messages/${demande.id}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Conversation
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import {
  Wrench,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Tag,
  Euro,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceRow = {
  id: string;
  nom: string;
  description: string | null;
  categorieId: string | null;
  categorieNom: string | null;
};

type MyServiceRow = {
  id: string;
  prix: number;
  serviceId: string | null;
  serviceNom: string | null;
  serviceDescription: string | null;
  categorieId: string | null;
  categorieNom: string | null;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 animate-pulse space-y-3">
      <div className="h-4 bg-slate-100 rounded w-2/5" />
      <div className="h-3 bg-slate-100 rounded w-3/5" />
      <div className="h-5 bg-slate-100 rounded-full w-16" />
    </div>
  );
}

// ─── Inline "Add" price row (shown inside the catalogue) ──────────────────────

function InlineAddRow({
  service,
  onConfirm,
  onCancel,
  isPending,
}: {
  service: ServiceRow;
  onConfirm: (prix: number) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [prix, setPrix] = useState("");

  function handleConfirm() {
    const val = parseFloat(prix);
    if (isNaN(val) || val <= 0) return toast.error("Entrez un prix valide (> 0).");
    onConfirm(val);
  }

  return (
    <div className="flex flex-col gap-2 px-5 py-3.5 bg-emerald-50/60 border-t border-emerald-100">
      <p className="text-xs text-slate-600 font-medium">
        Prix pour <span className="font-semibold text-slate-800">{service.nom}</span>
      </p>
      <div className="flex items-center gap-2">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">€</span>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={prix}
            onChange={(e) => setPrix(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            autoFocus
            className="pl-7 pr-3 py-1.5 w-28 text-sm bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all"
          />
        </div>
        <button
          onClick={handleConfirm}
          disabled={isPending}
          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
        >
          <Check className="w-3.5 h-3.5" />
          {isPending ? "…" : "Confirmer"}
        </button>
        <button
          onClick={onCancel}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ArtisanServicesPage() {
  const queryClient = useQueryClient();

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: allServices, isLoading: loadingServices } = useQuery(
    orpc.getServices.queryOptions(),
  );
  const { data: myServices, isLoading: loadingMine } = useQuery(
    orpc.getMyServices.queryOptions(),
  );

  // ── Edit-in-place state (for "My services" price edit) ─────────────────────
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrix, setEditPrix] = useState("");

  // ── Catalogue accordion state ──────────────────────────────────────────────
  const [openCategorie, setOpenCategorie] = useState<string | null>(null);

  // ── Inline-add state: which service in the catalogue is being "added" ──────
  const [addingServiceId, setAddingServiceId] = useState<string | null>(null);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const addMutation = useMutation(
    orpc.addServiceArtisan.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.getMyServices.key() });
        setAddingServiceId(null);
        toast.success("Service ajouté avec succès !");
      },
      onError: (error) => {
        const msg = error?.message ?? "";
        if (msg.includes("unique") || msg.includes("duplicate")) {
          toast.error("Vous proposez déjà ce service.");
        } else {
          toast.error(`Erreur : ${msg || "Une erreur inattendue s'est produite."}`);
        }
        setAddingServiceId(null);
      },
    }),
  );

  const updateMutation = useMutation(
    orpc.updateServiceArtisan.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.getMyServices.key() });
        setEditingId(null);
        toast.success("Prix mis à jour.");
      },
      onError: (error) => {
        toast.error(`Erreur : ${error?.message ?? "Échec de la mise à jour."}`);
      },
    }),
  );

  const removeMutation = useMutation(
    orpc.removeServiceArtisan.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.getMyServices.key() });
        toast.success("Service supprimé.");
      },
      onError: (error) => {
        toast.error(`Erreur : ${error?.message ?? "Échec de la suppression."}`);
      },
    }),
  );

  // ── Derived: group all services by category ────────────────────────────────
  const byCategorie = (allServices ?? []).reduce<
    Record<string, { nom: string; services: ServiceRow[] }>
  >((acc, s) => {
    const key = s.categorieId ?? "__none__";
    const label = s.categorieNom ?? "Sans catégorie";
    if (!acc[key]) acc[key] = { nom: label, services: [] };
    acc[key].services.push(s as ServiceRow);
    return acc;
  }, {});

  // ── Derived: set of serviceIds already added ───────────────────────────────
  const alreadyAdded = new Set((myServices ?? []).map((ms) => ms.serviceId));

  // ── Handlers ───────────────────────────────────────────────────────────────
  function startEdit(entry: MyServiceRow) {
    setEditingId(entry.id);
    setEditPrix(String(entry.prix));
  }

  function handleUpdate(id: string) {
    const prix = parseFloat(editPrix);
    if (isNaN(prix) || prix <= 0) return toast.error("Entrez un prix valide.");
    updateMutation.mutate({ id, prix });
  }

  function handleInlineAdd(serviceId: string, prix: number) {
    addMutation.mutate({ serviceId, prix });
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50/60 font-sans px-4 sm:px-8 py-10 max-w-4xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Mes services
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Gérez les services que vous proposez et leurs tarifs
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — My services list */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-slate-500" />
          Services proposés
        </h2>

        {loadingMine ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : !myServices || myServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Wrench className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1">
              Aucun service ajouté
            </h3>
            <p className="text-sm text-slate-400 max-w-xs">
              Parcourez le catalogue ci-dessous et cliquez sur&nbsp;
              <span className="font-medium text-emerald-600">+ Ajouter</span> sur un service pour fixer votre tarif.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(myServices as MyServiceRow[]).map((entry) => (
              <div
                key={entry.id}
                className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: service info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                      {entry.serviceNom ?? "—"}
                    </p>
                    {entry.serviceDescription && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {entry.serviceDescription}
                      </p>
                    )}
                    {entry.categorieNom && (
                      <span className="inline-flex items-center gap-1 mt-2 text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 font-medium">
                        <Tag className="w-3 h-3" />
                        {entry.categorieNom}
                      </span>
                    )}
                  </div>

                  {/* Right: price + actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {editingId === entry.id ? (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">€</span>
                          <input
                            id={`edit-prix-${entry.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={editPrix}
                            onChange={(e) => setEditPrix(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleUpdate(entry.id)}
                            className="pl-5 pr-2 py-1.5 w-24 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all"
                            autoFocus
                          />
                        </div>
                        <button
                          onClick={() => handleUpdate(entry.id)}
                          disabled={updateMutation.isPending}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          {updateMutation.isPending ? "…" : "OK"}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="flex items-center gap-1 text-base font-bold text-slate-900">
                          <Euro className="w-3.5 h-3.5 text-slate-500" />
                          {entry.prix.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => startEdit(entry)}
                            title="Modifier le prix"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeMutation.mutate({ id: entry.id })}
                            disabled={removeMutation.isPending}
                            title="Supprimer"
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — Browse catalogue by category (with inline add) */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section>
        <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Tag className="w-4 h-4 text-slate-500" />
          Catalogue des services disponibles
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Cliquez sur <span className="font-medium text-emerald-600">+ Ajouter</span> pour fixer votre prix et proposer ce service.
        </p>

        {loadingServices ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : Object.keys(byCategorie).length === 0 ? (
          <div className="py-12 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
            <p className="text-sm text-slate-400">
              Le catalogue est vide — demandez à l&apos;administrateur d&apos;ajouter des services.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(byCategorie).map(([catId, { nom, services }]) => {
              const isOpen = openCategorie === catId;
              const availableCount = services.filter((s) => !alreadyAdded.has(s.id)).length;

              return (
                <div
                  key={catId}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:border-slate-200 transition-all duration-200"
                >
                  {/* Accordion header */}
                  <button
                    onClick={() => setOpenCategorie(isOpen ? null : catId)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                        {nom}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {services.length} service{services.length !== 1 ? "s" : ""}
                      </span>
                      {availableCount > 0 && (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 ring-1 ring-emerald-200 px-2 py-0.5 rounded-full">
                          {availableCount} disponible{availableCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    {isOpen
                      ? <ChevronUp className="w-4 h-4 text-slate-400" />
                      : <ChevronDown className="w-4 h-4 text-slate-400" />
                    }
                  </button>

                  {/* Accordion body */}
                  {isOpen && (
                    <div className="border-t border-slate-100">
                      {services.map((s) => {
                        const added = alreadyAdded.has(s.id);
                        const isAddingThis = addingServiceId === s.id;

                        return (
                          <div key={s.id} className="divide-y divide-slate-50">
                            <div className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/70 transition-colors">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700">{s.nom}</p>
                                {s.description && (
                                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{s.description}</p>
                                )}
                              </div>

                              {added ? (
                                <span className="shrink-0 ml-4 text-xs font-semibold text-emerald-600 bg-emerald-50 ring-1 ring-emerald-200 px-2.5 py-0.5 rounded-full">
                                  ✓ Ajouté
                                </span>
                              ) : isAddingThis ? (
                                /* Cancel button when this row's input is open */
                                <button
                                  onClick={() => setAddingServiceId(null)}
                                  className="shrink-0 ml-4 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition-colors"
                                >
                                  Annuler
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setAddingServiceId(s.id);
                                  }}
                                  className="shrink-0 ml-4 flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                  Ajouter
                                </button>
                              )}
                            </div>

                            {/* Inline price input — only shown for the active row */}
                            {isAddingThis && (
                              <InlineAddRow
                                service={s}
                                onConfirm={(prix) => handleInlineAdd(s.id, prix)}
                                onCancel={() => setAddingServiceId(null)}
                                isPending={addMutation.isPending}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

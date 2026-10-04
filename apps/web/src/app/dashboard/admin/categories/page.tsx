"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import {
  Tag,
  Wrench,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type CatRow = { id: string; nom: string };
type SvcRow = {
  id: string;
  nom: string;
  description: string | null;
  categorieId: string | null;
  categorieNom: string | null;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="h-3.5 bg-slate-100 rounded w-1/3" />
      <div className="h-3 bg-slate-100 rounded w-1/4 ml-auto" />
    </div>
  );
}

// ─── Inline edit input ────────────────────────────────────────────────────────

function InlineInput({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all ${className}`}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: categories, isLoading: loadingCats } = useQuery(
    orpc.getCategories.queryOptions(),
  );
  const { data: services, isLoading: loadingServices } = useQuery(
    orpc.getServices.queryOptions(),
  );

  // ── Category state ─────────────────────────────────────────────────────────
  const [newCatNom, setNewCatNom] = useState("");
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [editCatNom, setEditCatNom] = useState("");

  // ── Service state ──────────────────────────────────────────────────────────
  const [newSvcNom, setNewSvcNom] = useState("");
  const [newSvcDesc, setNewSvcDesc] = useState("");
  const [newSvcCatId, setNewSvcCatId] = useState("");
  const [editSvcId, setEditSvcId] = useState<string | null>(null);
  const [editSvcNom, setEditSvcNom] = useState("");
  const [editSvcDesc, setEditSvcDesc] = useState("");
  const [editSvcCatId, setEditSvcCatId] = useState("");
  const [openCatId, setOpenCatId] = useState<string | null>(null);

  // ── Category mutations ─────────────────────────────────────────────────────
  const createCatMutation = useMutation(
    orpc.createCategorie.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.getCategories.key() });
        setNewCatNom("");
        toast.success("Catégorie créée.");
      },
      onError: (e) => toast.error(`Erreur : ${e.message}`),
    }),
  );

  const deleteCatMutation = useMutation(
    orpc.deleteCategorie.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.getCategories.key() });
        queryClient.invalidateQueries({ queryKey: orpc.getServices.key() });
        toast.success("Catégorie supprimée.");
      },
      onError: (e) => toast.error(`Erreur : ${e.message}`),
    }),
  );

  // ── Service mutations ──────────────────────────────────────────────────────
  const createSvcMutation = useMutation(
    orpc.createService.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.getServices.key() });
        setNewSvcNom("");
        setNewSvcDesc("");
        setNewSvcCatId("");
        toast.success("Service créé.");
      },
      onError: (e) => toast.error(`Erreur : ${e.message}`),
    }),
  );

  const updateSvcMutation = useMutation(
    orpc.updateService.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.getServices.key() });
        setEditSvcId(null);
        toast.success("Service mis à jour.");
      },
      onError: (e) => toast.error(`Erreur : ${e.message}`),
    }),
  );

  const deleteSvcMutation = useMutation(
    orpc.deleteService.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.getServices.key() });
        toast.success("Service supprimé.");
      },
      onError: (e) => toast.error(`Erreur : ${e.message}`),
    }),
  );

  // ── Derived: services grouped by category ─────────────────────────────────
  const svcByCategorie = (services ?? []).reduce<Record<string, SvcRow[]>>(
    (acc, s) => {
      const key = s.categorieId ?? "__none__";
      if (!acc[key]) acc[key] = [];
      acc[key].push(s as SvcRow);
      return acc;
    },
    {},
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleCreateCat(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatNom.trim()) return toast.error("Le nom est requis.");
    createCatMutation.mutate({ nom: newCatNom.trim() });
  }

  function startEditSvc(s: SvcRow) {
    setEditSvcId(s.id);
    setEditSvcNom(s.nom);
    setEditSvcDesc(s.description ?? "");
    setEditSvcCatId(s.categorieId ?? "");
  }

  function handleUpdateSvc(id: string) {
    if (!editSvcNom.trim()) return toast.error("Le nom est requis.");
    updateSvcMutation.mutate({
      id,
      nom: editSvcNom.trim(),
      description: editSvcDesc.trim() || null,
      categorieId: editSvcCatId || undefined,
    });
  }

  function handleCreateSvc(e: React.FormEvent) {
    e.preventDefault();
    if (!newSvcNom.trim()) return toast.error("Le nom du service est requis.");
    if (!newSvcCatId) return toast.error("Sélectionnez une catégorie.");
    createSvcMutation.mutate({
      nom: newSvcNom.trim(),
      description: newSvcDesc.trim() || undefined,
      categorieId: newSvcCatId,
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-slate-50/60 px-4 sm:px-8 py-8 max-w-5xl mx-auto"
      style={{ fontFamily: "'Outfit', 'Inter', system-ui, sans-serif" }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Catégories &amp; Services
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Gérez le catalogue de services proposés sur la plateforme
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* LEFT — CATEGORIES */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-4">
          {/* Create category form */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-500" />
              Nouvelle catégorie
            </h2>
            <form onSubmit={handleCreateCat} className="flex gap-2">
              <input
                value={newCatNom}
                onChange={(e) => setNewCatNom(e.target.value)}
                placeholder="Ex: Plomberie, Électricité…"
                className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all"
              />
              <button
                type="submit"
                disabled={createCatMutation.isPending}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5"
              >
                {createCatMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                Ajouter
              </button>
            </form>
          </div>

          {/* Category list */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-50">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400" />
                Catégories
                <span className="ml-auto text-xs text-slate-400 font-normal">
                  {categories?.length ?? 0} au total
                </span>
              </h2>
            </div>

            {loadingCats ? (
              <div className="divide-y divide-slate-50">
                {[1, 2, 3, 4].map((i) => <RowSkeleton key={i} />)}
              </div>
            ) : !categories || categories.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">
                Aucune catégorie. Créez-en une ci-dessus.
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {(categories as CatRow[]).map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/60 transition-colors group"
                  >
                    {editCatId === cat.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <InlineInput
                          value={editCatNom}
                          onChange={setEditCatNom}
                          className="flex-1"
                        />
                        <button
                          onClick={() => {
                            if (!editCatNom.trim()) return;
                            /* no updateCategorie route yet — skip silently */
                            setEditCatId(null);
                            toast("Renommage non implémenté côté API.", { icon: "ℹ️" });
                          }}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditCatId(null)}
                          className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-slate-700">{cat.nom}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-slate-400 mr-2">
                            {svcByCategorie[cat.id]?.length ?? 0} service{(svcByCategorie[cat.id]?.length ?? 0) !== 1 ? "s" : ""}
                          </span>
                          <button
                            onClick={() => { setEditCatId(cat.id); setEditCatNom(cat.nom); }}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Renommer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Supprimer la catégorie "${cat.nom}" et tous ses services ?`)) {
                                deleteCatMutation.mutate({ id: cat.id });
                              }
                            }}
                            disabled={deleteCatMutation.isPending}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* RIGHT — SERVICES */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-4">
          {/* Create service form */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-500" />
              Nouveau service
            </h2>
            <form onSubmit={handleCreateSvc} className="flex flex-col gap-2.5">
              <div className="flex gap-2">
                <input
                  value={newSvcNom}
                  onChange={(e) => setNewSvcNom(e.target.value)}
                  placeholder="Nom du service"
                  className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all"
                />
                <select
                  value={newSvcCatId}
                  onChange={(e) => setNewSvcCatId(e.target.value)}
                  className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all"
                  disabled={loadingCats}
                >
                  <option value="">— Catégorie —</option>
                  {(categories as CatRow[] | undefined)?.map((c) => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  value={newSvcDesc}
                  onChange={(e) => setNewSvcDesc(e.target.value)}
                  placeholder="Description (optionnelle)"
                  className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all"
                />
                <button
                  type="submit"
                  disabled={createSvcMutation.isPending}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  {createSvcMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  Créer
                </button>
              </div>
            </form>
          </div>

          {/* Service list grouped by category */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-50 flex items-center">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-slate-400" />
                Services
              </h2>
              <span className="ml-auto text-xs text-slate-400 font-normal">
                {services?.length ?? 0} au total
              </span>
            </div>

            {loadingServices ? (
              <div className="divide-y divide-slate-50">
                {[1, 2, 3].map((i) => <RowSkeleton key={i} />)}
              </div>
            ) : !services || services.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">
                Aucun service. Créez-en un ci-dessus.
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {(categories as CatRow[] | undefined)?.map((cat) => {
                  const catSvcs = svcByCategorie[cat.id] ?? [];
                  if (catSvcs.length === 0) return null;
                  const isOpen = openCatId === cat.id;
                  return (
                    <div key={cat.id}>
                      {/* Accordion header */}
                      <button
                        onClick={() => setOpenCatId(isOpen ? null : cat.id)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50/60 transition-colors group text-left"
                      >
                        <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-emerald-500" />
                          {cat.nom}
                          <span className="text-xs text-slate-400 font-normal">
                            ({catSvcs.length})
                          </span>
                        </span>
                        {isOpen
                          ? <ChevronUp className="w-4 h-4 text-slate-400" />
                          : <ChevronDown className="w-4 h-4 text-slate-400" />
                        }
                      </button>

                      {/* Accordion body */}
                      {isOpen && (
                        <div className="border-t border-slate-50 divide-y divide-slate-50 bg-slate-50/30">
                          {catSvcs.map((s) => (
                            <div key={s.id} className="px-4 py-2.5 group/row">
                              {editSvcId === s.id ? (
                                /* ── Edit row ── */
                                <div className="flex flex-col gap-2">
                                  <div className="flex gap-2">
                                    <InlineInput
                                      value={editSvcNom}
                                      onChange={setEditSvcNom}
                                      placeholder="Nom"
                                      className="flex-1"
                                    />
                                    <select
                                      value={editSvcCatId}
                                      onChange={(e) => setEditSvcCatId(e.target.value)}
                                      className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all"
                                    >
                                      {(categories as CatRow[] | undefined)?.map((c) => (
                                        <option key={c.id} value={c.id}>{c.nom}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="flex gap-2">
                                    <InlineInput
                                      value={editSvcDesc}
                                      onChange={setEditSvcDesc}
                                      placeholder="Description (optionnelle)"
                                      className="flex-1"
                                    />
                                    <button
                                      onClick={() => handleUpdateSvc(s.id)}
                                      disabled={updateSvcMutation.isPending}
                                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                                    >
                                      {updateSvcMutation.isPending
                                        ? <Loader2 className="w-3 h-3 animate-spin" />
                                        : <Check className="w-3 h-3" />
                                      }
                                      OK
                                    </button>
                                    <button
                                      onClick={() => setEditSvcId(null)}
                                      className="px-2 py-1.5 text-xs text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* ── Display row ── */
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700 leading-snug">{s.nom}</p>
                                    {s.description && (
                                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{s.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0">
                                    <button
                                      onClick={() => startEditSvc(s)}
                                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                      title="Modifier"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm(`Supprimer "${s.nom}" ?`)) {
                                          deleteSvcMutation.mutate({ id: s.id });
                                        }
                                      }}
                                      disabled={deleteSvcMutation.isPending}
                                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                      title="Supprimer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* Services with no category */}
                {svcByCategorie["__none__"]?.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 px-4 py-3 group/row hover:bg-slate-50/60 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700">{s.nom}</p>
                      <p className="text-xs text-slate-400">Sans catégorie</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                      <button onClick={() => startEditSvc(s)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Supprimer "${s.nom}" ?`)) deleteSvcMutation.mutate({ id: s.id }); }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

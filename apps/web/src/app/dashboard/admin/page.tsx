"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Users, ShieldCheck, Tag, Trash2, Plus } from "lucide-react";

export default function AdminDashboardPage() {
  const [nouvelleCategorie, setNouvelleCategorie] = useState("");
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery(orpc.getCategories.queryOptions());

  const createMutation = useMutation(
    orpc.createCategorie.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.getCategories.key() });
        setNouvelleCategorie("");
      },
    }),
  );

  const deleteMutation = useMutation(
    orpc.deleteCategorie.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.getCategories.key() });
      },
    }),
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouvelleCategorie.trim()) return;
    createMutation.mutate({ nom: nouvelleCategorie.trim() });
  };

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "32px" }}>
        Tableau de bord Administrateur
      </h1>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <div style={{ background: "white", border: "1px solid #ebebeb", borderRadius: "16px", padding: "24px" }}>
          <Users size={20} color="#1dbf73" style={{ marginBottom: "12px" }} />
          <div style={{ fontSize: "13px", color: "#8c8c8c" }}>Catégories créées</div>
          <div style={{ fontSize: "28px", fontWeight: 800 }}>{categories?.length ?? 0}</div>
        </div>
        <div style={{ background: "white", border: "1px solid #ebebeb", borderRadius: "16px", padding: "24px" }}>
          <ShieldCheck size={20} color="#1dbf73" style={{ marginBottom: "12px" }} />
          <div style={{ fontSize: "13px", color: "#8c8c8c" }}>Artisans à vérifier</div>
          <div style={{ fontSize: "28px", fontWeight: 800 }}>—</div>
        </div>
      </div>

      {/* Gestion des catégories */}
      <div style={{ background: "white", border: "1px solid #ebebeb", borderRadius: "16px", padding: "28px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Tag size={18} /> Gérer les catégories
        </h2>

        <form onSubmit={handleAdd} style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
          <input
            type="text"
            value={nouvelleCategorie}
            onChange={(e) => setNouvelleCategorie(e.target.value)}
            placeholder="Nom de la catégorie (ex: Plomberie)"
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1.5px solid #e4e4e4",
              fontSize: "14px",
            }}
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 18px",
              background: "#1dbf73",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Plus size={16} /> Ajouter
          </button>
        </form>

        {isLoading ? (
          <p>Chargement...</p>
        ) : !categories || categories.length === 0 ? (
          <p style={{ color: "#8c8c8c", fontSize: "14px" }}>Aucune catégorie pour le moment.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {categories.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  background: "#f8f8f8",
                  borderRadius: "8px",
                }}
              >
                <span style={{ fontWeight: 600, fontSize: "14px" }}>{c.nom}</span>
                <button
                  onClick={() => deleteMutation.mutate({ id: c.id })}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#ababab",
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
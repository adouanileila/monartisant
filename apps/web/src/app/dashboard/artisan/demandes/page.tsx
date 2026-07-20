"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

export default function ArtisanDemandesPage() {
  const queryClient = useQueryClient();
  const { data: demandes, isLoading } = useQuery(orpc.myDemandes.queryOptions());

  const acceptMutation = useMutation(
    orpc.acceptDemande.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.myDemandes.key() });
      },
    }),
  );

  if (isLoading) {
    return <div style={{ padding: "40px" }}>Chargement...</div>;
  }

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "24px" }}>
        Mes demandes
      </h1>

      {!demandes || demandes.length === 0 ? (
        <p style={{ color: "var(--gray-500, #8c8c8c)" }}>
          Aucune demande pour le moment.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {demandes.map((d) => (
            <div
              key={d.id}
              style={{
                background: "white",
                border: "1px solid var(--gray-150, #ebebeb)",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <p style={{ fontWeight: 700, marginBottom: "8px" }}>{d.description}</p>
              <p style={{ fontSize: "14px", color: "var(--gray-500, #8c8c8c)" }}>
                📍 {d.adresse}
              </p>
              <p style={{ fontSize: "13px", color: "var(--gray-400, #ababab)", marginTop: "4px" }}>
                Statut : {d.statut}
              </p>

              {d.statut === "en_attente" && (
                <button
                  onClick={() =>
                    acceptMutation.mutate({
                      demandeId: d.id,
                      artisanId: d.artisanId ?? "",
                    })
                  }
                  style={{
                    marginTop: "12px",
                    padding: "8px 16px",
                    background: "var(--tc, #1dbf73)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Accepter
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
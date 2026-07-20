import { db } from "@monartisant/db";
import { demande } from "@monartisant/db/schema/demande";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const demandeService = {
  create: async (clientId: string, data: { description: string; adresse: string }) => {
    const [newDemande] = await db
      .insert(demande)
      .values({
        id: nanoid(),
        clientId,
        description: data.description,
        adresse: data.adresse,
      })
      .returning();

    return newDemande;
  },

  getByClient: async (clientId: string) => {
    return db.select().from(demande).where(eq(demande.clientId, clientId));
  },

  getByArtisan: async (artisanId: string) => {
    return db.select().from(demande).where(eq(demande.artisanId, artisanId));
  },

  updateStatut: async (demandeId: string, statut: string) => {
    const [updated] = await db
      .update(demande)
      .set({ statut })
      .where(eq(demande.id, demandeId))
      .returning();

    return updated;
  },

  assignArtisan: async (demandeId: string, artisanId: string) => {
    const [updated] = await db
      .update(demande)
      .set({ artisanId, statut: "acceptee" })
      .where(eq(demande.id, demandeId))
      .returning();

    return updated;
  },
};
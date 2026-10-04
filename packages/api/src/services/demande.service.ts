import { db } from "@monartisant/db";
import { demande } from "@monartisant/db/schema/demande";
import { artisan } from "@monartisant/db/schema/artisan";
import { eq, or, isNull } from "drizzle-orm";
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

  /**
   * Returns all demandes an artisan should see:
   *   • unassigned requests (artisanId IS NULL) — available to accept
   *   • requests already assigned to this artisan specifically
   */
  getAvailableForArtisan: async (artisanId: string) => {
    return db
      .select()
      .from(demande)
      .where(or(isNull(demande.artisanId), eq(demande.artisanId, artisanId)));
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

  /**
   * Fetch a single demande and, when assigned, also return the artisan's
   * user.id (artisan.userId) so chat pages can derive destinataireId:
   *   - client  → destinataireId = artisanUserId
   *   - artisan → destinataireId = demande.clientId
   */
  getDemandeById: async (demandeId: string) => {
    const rows = await db
      .select({
        id: demande.id,
        clientId: demande.clientId,
        artisanId: demande.artisanId,
        statut: demande.statut,
        description: demande.description,
        adresse: demande.adresse,
        dateCreation: demande.dateCreation,
        // artisan.userId = the auth user.id of the artisan
        artisanUserId: artisan.userId,
      })
      .from(demande)
      .leftJoin(artisan, eq(artisan.id, demande.artisanId))
      .where(eq(demande.id, demandeId))
      .limit(1);

    return rows[0] ?? null;
  },
};
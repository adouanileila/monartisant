import { db } from "@monartisant/db";
import { avis } from "@monartisant/db/schema/avis";
import { artisan } from "@monartisant/db/schema/artisan";
import { user } from "@monartisant/db/schema/auth";
import { eq, avg, count } from "drizzle-orm";
import { nanoid } from "nanoid";

export const avisService = {
  /**
   * Create a new avis for a demande.
   * - Throws if an avis already exists for that demandeId (unique constraint).
   * - After insertion, recalculates and updates the artisan's noteMoyenne.
   */
  create: async (data: {
    demandeId: string;
    clientId: string;
    artisanId: string;
    note: number;
    commentaire?: string;
  }) => {
    // Check for existing review — unique constraint on demandeId would also
    // catch this at DB level, but we surface a user-friendly error here.
    const [existing] = await db
      .select({ id: avis.id })
      .from(avis)
      .where(eq(avis.demandeId, data.demandeId))
      .limit(1);

    if (existing) {
      throw new Error("UN_AVIS_EXISTE_DEJA");
    }

    const [newAvis] = await db
      .insert(avis)
      .values({
        id: nanoid(),
        demandeId: data.demandeId,
        clientId: data.clientId,
        artisanId: data.artisanId,
        note: data.note,
        commentaire: data.commentaire,
      })
      .returning();

    // Recalculate and persist the artisan's noteMoyenne
    await avisService._recalcNoteMoyenne(data.artisanId);

    return newAvis;
  },

  /**
   * Return all avis received by an artisan, enriched with the client's name.
   */
  getByArtisan: async (artisanId: string) => {
    return db
      .select({
        id: avis.id,
        demandeId: avis.demandeId,
        note: avis.note,
        commentaire: avis.commentaire,
        dateCreation: avis.dateCreation,
        clientId: avis.clientId,
        clientPrenom: user.name,
      })
      .from(avis)
      .leftJoin(user, eq(user.id, avis.clientId))
      .where(eq(avis.artisanId, artisanId))
      .orderBy(avis.dateCreation);
  },

  /**
   * Return the avis (if any) for a given demandeId — used to check
   * whether the client has already reviewed this demande.
   */
  getByDemande: async (demandeId: string) => {
    const [row] = await db
      .select()
      .from(avis)
      .where(eq(avis.demandeId, demandeId))
      .limit(1);
    return row ?? null;
  },

  /**
   * Compute the average note and total count for an artisan.
   */
  getAverageForArtisan: async (artisanId: string) => {
    const [result] = await db
      .select({
        moyenne: avg(avis.note),
        total: count(avis.id),
      })
      .from(avis)
      .where(eq(avis.artisanId, artisanId));

    return {
      moyenne: result?.moyenne ? parseFloat(result.moyenne) : 0,
      total: result?.total ?? 0,
    };
  },

  /**
   * Return all avis written by a specific client.
   */
  getByClient: async (clientId: string) => {
    return db
      .select({
        id: avis.id,
        demandeId: avis.demandeId,
        artisanId: avis.artisanId,
        note: avis.note,
        commentaire: avis.commentaire,
        dateCreation: avis.dateCreation,
        artisanPrenom: user.name,
      })
      .from(avis)
      .leftJoin(artisan, eq(artisan.id, avis.artisanId))
      .leftJoin(user, eq(user.id, artisan.userId))
      .where(eq(avis.clientId, clientId))
      .orderBy(avis.dateCreation);
  },

  /**
   * Internal: recalculate noteMoyenne and persist it on the artisan row.
   */
  _recalcNoteMoyenne: async (artisanId: string) => {
    const [result] = await db
      .select({ moyenne: avg(avis.note) })
      .from(avis)
      .where(eq(avis.artisanId, artisanId));

    const noteMoyenne = result?.moyenne ? parseFloat(result.moyenne) : 0;

    await db
      .update(artisan)
      .set({ noteMoyenne })
      .where(eq(artisan.id, artisanId));
  },
};

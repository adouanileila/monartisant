import { db } from "@monartisant/db";
import { demande } from "@monartisant/db/schema/demande";
import { artisan } from "@monartisant/db/schema/artisan";
import { serviceArtisan } from "@monartisant/db/schema/service-artisan";
import { service } from "@monartisant/db/schema/service";
import { and, eq, or, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";

export const demandeService = {
  create: async (
    clientId: string,
    data: { description: string; adresse: string; serviceId?: string },
  ) => {
    const [newDemande] = await db
      .insert(demande)
      .values({
        id: nanoid(),
        clientId,
        description: data.description,
        adresse: data.adresse,
        serviceId: data.serviceId ?? null,
      })
      .returning();

    return newDemande;
  },

  getByClient: async (clientId: string) => {
    // Return demandes enriched with service name so the client UI can display it.
    return db
      .select({
        id: demande.id,
        clientId: demande.clientId,
        artisanId: demande.artisanId,
        serviceId: demande.serviceId,
        serviceNom: service.nom,
        description: demande.description,
        adresse: demande.adresse,
        statut: demande.statut,
        prixConvenu: demande.prixConvenu,
        dateCreation: demande.dateCreation,
      })
      .from(demande)
      .leftJoin(service, eq(service.id, demande.serviceId))
      .where(eq(demande.clientId, clientId));
  },

  getByArtisan: async (artisanId: string) => {
    return db.select().from(demande).where(eq(demande.artisanId, artisanId));
  },

  /**
   * Returns demandes an artisan should see in their dashboard:
   *   • Demandes already assigned to THIS artisan (regardless of service)
   *   • Unassigned demandes for a service this artisan has priced
   *     (serviceArtisan row exists for artisanId + demande.serviceId)
   *   • Unassigned demandes with no serviceId (legacy rows, shown to all)
   *
   * Enriched with service name for display.
   */
  getAvailableForArtisan: async (artisanId: string) => {
    const rows = await db
      .select({
        id: demande.id,
        clientId: demande.clientId,
        artisanId: demande.artisanId,
        serviceId: demande.serviceId,
        serviceNom: service.nom,
        description: demande.description,
        adresse: demande.adresse,
        statut: demande.statut,
        prixConvenu: demande.prixConvenu,
        dateCreation: demande.dateCreation,
        // prix the artisan has set for this service (null if not priced)
        artisanPrix: serviceArtisan.prix,
      })
      .from(demande)
      .leftJoin(service, eq(service.id, demande.serviceId))
      .leftJoin(
        serviceArtisan,
        and(
          eq(serviceArtisan.artisanId, artisanId),
          eq(serviceArtisan.serviceId, demande.serviceId),
        ),
      )
      .where(
        or(
          // Already assigned to this artisan
          eq(demande.artisanId, artisanId),
          // Unassigned AND artisan has priced this service
          and(isNull(demande.artisanId), eq(serviceArtisan.artisanId, artisanId)),
          // Legacy rows (no serviceId) — visible to everyone
          and(isNull(demande.artisanId), isNull(demande.serviceId)),
        ),
      );

    return rows;
  },

  updateStatut: async (demandeId: string, statut: string) => {
    const [updated] = await db
      .update(demande)
      .set({ statut })
      .where(eq(demande.id, demandeId))
      .returning();

    return updated;
  },

  assignArtisan: async (
    demandeId: string,
    artisanId: string,
    prixConvenu?: number,
  ) => {
    const [updated] = await db
      .update(demande)
      .set({
        artisanId,
        statut: "acceptee",
        ...(prixConvenu !== undefined ? { prixConvenu } : {}),
      })
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
        serviceId: demande.serviceId,
        statut: demande.statut,
        description: demande.description,
        adresse: demande.adresse,
        prixConvenu: demande.prixConvenu,
        dateCreation: demande.dateCreation,
        artisanUserId: artisan.userId,
      })
      .from(demande)
      .leftJoin(artisan, eq(artisan.id, demande.artisanId))
      .where(eq(demande.id, demandeId))
      .limit(1);

    return rows[0] ?? null;
  },
};
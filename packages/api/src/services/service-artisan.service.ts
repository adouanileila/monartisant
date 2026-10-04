import { db } from "@monartisant/db";
import { serviceArtisan } from "@monartisant/db/schema/service-artisan";
import { service } from "@monartisant/db/schema/service";
import { categorie } from "@monartisant/db/schema/categorie";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const serviceArtisanService = {
  /**
   * Return all service-artisan entries for a given artisan,
   * enriched with service name, description and category name.
   */
  getByArtisan: async (artisanId: string) => {
    return db
      .select({
        id: serviceArtisan.id,
        prix: serviceArtisan.prix,
        serviceId: serviceArtisan.serviceId,
        serviceNom: service.nom,
        serviceDescription: service.description,
        categorieId: service.categorieId,
        categorieNom: categorie.nom,
      })
      .from(serviceArtisan)
      .leftJoin(service, eq(service.id, serviceArtisan.serviceId))
      .leftJoin(categorie, eq(categorie.id, service.categorieId))
      .where(eq(serviceArtisan.artisanId, artisanId));
  },

  /** Link an artisan to a service with a given price. */
  create: async (artisanId: string, serviceId: string, prix: number) => {
    const [newEntry] = await db
      .insert(serviceArtisan)
      .values({ id: nanoid(), artisanId, serviceId, prix })
      .returning();
    return newEntry;
  },

  /** Update the price for an existing service-artisan entry. */
  update: async (id: string, prix: number) => {
    const [updated] = await db
      .update(serviceArtisan)
      .set({ prix })
      .where(eq(serviceArtisan.id, id))
      .returning();
    return updated;
  },

  /** Remove a service-artisan entry. */
  delete: async (id: string) => {
    await db.delete(serviceArtisan).where(eq(serviceArtisan.id, id));
    return { success: true };
  },
};

import { db } from "@monartisant/db";
import { service } from "@monartisant/db/schema/service";
import { categorie } from "@monartisant/db/schema/categorie";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const serviceService = {
  /** Return every service, each with its categorie name. */
  getAll: async () => {
    return db
      .select({
        id: service.id,
        nom: service.nom,
        description: service.description,
        categorieId: service.categorieId,
        categorieNom: categorie.nom,
      })
      .from(service)
      .leftJoin(categorie, eq(categorie.id, service.categorieId));
  },

  /** Return services filtered by category. */
  getByCategorie: async (categorieId: string) => {
    return db
      .select({
        id: service.id,
        nom: service.nom,
        description: service.description,
        categorieId: service.categorieId,
        categorieNom: categorie.nom,
      })
      .from(service)
      .leftJoin(categorie, eq(categorie.id, service.categorieId))
      .where(eq(service.categorieId, categorieId));
  },

  /** Create a new service (admin use). */
  create: async (nom: string, description: string | undefined, categorieId: string) => {
    const [newService] = await db
      .insert(service)
      .values({ id: nanoid(), nom, description, categorieId })
      .returning();
    return newService;
  },

  /** Update service name, description and/or category (admin use). */
  update: async (id: string, data: { nom?: string; description?: string | null; categorieId?: string }) => {
    const [updated] = await db
      .update(service)
      .set(data)
      .where(eq(service.id, id))
      .returning();
    return updated;
  },

  /** Delete a service and cascade to service_artisan rows (admin use). */
  delete: async (id: string) => {
    await db.delete(service).where(eq(service.id, id));
    return { success: true };
  },
};

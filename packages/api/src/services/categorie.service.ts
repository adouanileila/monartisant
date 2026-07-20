import { db } from "@monartisant/db";
import { categorie } from "@monartisant/db/schema/categorie";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const categorieService = {
  getAll: async () => {
    return db.select().from(categorie);
  },

  create: async (nom: string) => {
    const [newCategorie] = await db
      .insert(categorie)
      .values({ id: nanoid(), nom })
      .returning();
    return newCategorie;
  },

  delete: async (id: string) => {
    await db.delete(categorie).where(eq(categorie.id, id));
    return { success: true };
  },
};
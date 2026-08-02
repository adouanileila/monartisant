import { db } from "@monartisant/db";
import { message } from "@monartisant/db/schema/message";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const messageService = {
  create: async (data: {
    demandeId: string;
    expediteurId: string;
    destinataireId: string;
    contenu: string;
    type: "texte" | "image";
  }) => {
    const [newMessage] = await db
      .insert(message)
      .values({
        id: nanoid(),
        ...data,
      })
      .returning();

    return newMessage;
  },

  getByDemande: async (demandeId: string) => {
    return db.select().from(message).where(eq(message.demandeId, demandeId));
  },
};
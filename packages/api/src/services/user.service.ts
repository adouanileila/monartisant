import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "@monartisant/db";
import { user, artisan } from "@monartisant/db/schema/index";
import type { Context } from "../context";

export const userService = {
  getPrivateUserData: (context: Context) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  },
  onboardClient: async (userId: string, phone: string) => {
    await db.update(user).set({
      role: "client",
      telephone: phone,
    }).where(eq(user.id, userId));
    return { success: true };
  },
  onboardArtisan: async (
    userId: string, 
    data: { description: string; experience: number; adresse: string; ville: string; photoBase64?: string }
  ) => {
    await db.update(user).set({
      role: "artisan",
      ...(data.photoBase64 ? { image: data.photoBase64 } : {})
    }).where(eq(user.id, userId));
    
    await db.insert(artisan).values({
      id: randomUUID(),
      userId,
      description: data.description,
      experience: data.experience,
      adresse: data.adresse,
      ville: data.ville,
      estVerifie: false,
    });
    
    return { success: true };
  }
};
import { eq } from "drizzle-orm";
import { db } from "@monartisant/db";
import { artisan } from "@monartisant/db/schema/artisan";

export const artisanService = {
  /**
   * Look up an artisan profile by their auth user ID.
   * Returns undefined if the user hasn't completed artisan onboarding yet.
   */
  getByUserId: async (userId: string) => {
    const [profile] = await db
      .select()
      .from(artisan)
      .where(eq(artisan.userId, userId))
      .limit(1);

    return profile; // undefined when no profile row exists
  },
};

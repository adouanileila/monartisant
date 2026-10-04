import { db } from "@monartisant/db";
import { serviceArtisan } from "@monartisant/db/schema/service-artisan";
import { and, eq } from "drizzle-orm";
import { demandeService } from "../services/demande.service";
import { artisanService } from "../services/artisan.service";

export const demandeController = {
  create: async (
    clientId: string,
    data: { description: string; adresse: string; serviceId?: string },
  ) => {
    return demandeService.create(clientId, data);
  },

  getMyDemandes: async (userId: string, role: string) => {
    if (role === "artisan") {
      // demande.artisanId references artisan.id, NOT user.id — resolve first.
      const profile = await artisanService.getByUserId(userId);
      if (!profile) return []; // onboarding not yet complete
      return demandeService.getAvailableForArtisan(profile.id);
    }
    return demandeService.getByClient(userId);
  },

  updateStatut: async (demandeId: string, statut: string) => {
    return demandeService.updateStatut(demandeId, statut);
  },

  /**
   * Accept a demande as an artisan.
   *
   * Business rules:
   *  1. The demande must exist.
   *  2. If the demande has a serviceId, the artisan MUST have a ServiceArtisan
   *     row for that service (meaning they've set a price for it).
   *     If not → throws "PRIX_NON_DEFINI".
   *  3. prixConvenu is locked from serviceArtisan.prix at acceptance time.
   */
  accept: async (demandeId: string, artisanId: string) => {
    // Fetch the demande to get serviceId
    const dem = await demandeService.getDemandeById(demandeId);
    if (!dem) {
      throw new Error("DEMANDE_INTROUVABLE");
    }

    let prixConvenu: number | undefined;

    if (dem.serviceId) {
      // Look up the artisan's price for this specific service
      const [sa] = await db
        .select()
        .from(serviceArtisan)
        .where(
          and(
            eq(serviceArtisan.artisanId, artisanId),
            eq(serviceArtisan.serviceId, dem.serviceId),
          ),
        )
        .limit(1);

      if (!sa) {
        throw new Error("PRIX_NON_DEFINI");
      }

      prixConvenu = sa.prix;
    }

    return demandeService.assignArtisan(demandeId, artisanId, prixConvenu);
  },
};
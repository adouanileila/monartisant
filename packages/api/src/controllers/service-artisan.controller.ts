import { serviceArtisanService } from "../services/service-artisan.service";
import { artisanService } from "../services/artisan.service";

export const serviceArtisanController = {
  /**
   * Resolve artisanId from userId first (same pattern as demandeController.getMyDemandes),
   * then return the enriched list.
   */
  getMyServices: async (userId: string) => {
    const profile = await artisanService.getByUserId(userId);
    if (!profile) return [];
    return serviceArtisanService.getByArtisan(profile.id);
  },

  addService: async (userId: string, serviceId: string, prix: number) => {
    const profile = await artisanService.getByUserId(userId);
    if (!profile) throw new Error("Artisan profile not found.");
    return serviceArtisanService.create(profile.id, serviceId, prix);
  },

  updateService: async (id: string, prix: number) => {
    return serviceArtisanService.update(id, prix);
  },

  removeService: async (id: string) => {
    return serviceArtisanService.delete(id);
  },
};

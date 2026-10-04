import { demandeService } from "../services/demande.service";
import { artisanService } from "../services/artisan.service";

export const demandeController = {
  create: async (clientId: string, data: { description: string; adresse: string }) => {
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

  accept: async (demandeId: string, artisanId: string) => {
    return demandeService.assignArtisan(demandeId, artisanId);
  },
};
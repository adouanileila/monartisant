import { demandeService } from "../services/demande.service";

export const demandeController = {
  create: async (clientId: string, data: { description: string; adresse: string }) => {
    return demandeService.create(clientId, data);
  },

  getMyDemandes: async (userId: string, role: string) => {
    if (role === "artisan") {
      return demandeService.getByArtisan(userId);
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
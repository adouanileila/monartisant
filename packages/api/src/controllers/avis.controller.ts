import { avisService } from "../services/avis.service";
import { demandeService } from "../services/demande.service";

export const avisController = {
  /**
   * Create an avis. Resolves clientId from session; resolves artisanId from
   * the demande so the client cannot supply a forged artisanId.
   */
  create: async (
    clientId: string,
    data: { demandeId: string; note: number; commentaire?: string },
  ) => {
    // Resolve artisanId from the demande (trusted server-side)
    const demande = await demandeService.getDemandeById(data.demandeId);

    if (!demande) {
      throw new Error("DEMANDE_INTROUVABLE");
    }
    if (demande.statut !== "terminee") {
      throw new Error("DEMANDE_NON_TERMINEE");
    }
    if (!demande.artisanId) {
      throw new Error("ARTISAN_INTROUVABLE");
    }

    return avisService.create({
      demandeId: data.demandeId,
      clientId,
      artisanId: demande.artisanId,
      note: data.note,
      commentaire: data.commentaire,
    });
  },

  getByArtisan: async (artisanId: string) => {
    const [avisList, stats] = await Promise.all([
      avisService.getByArtisan(artisanId),
      avisService.getAverageForArtisan(artisanId),
    ]);
    return { avisList, ...stats };
  },

  getByDemande: async (demandeId: string) => {
    return avisService.getByDemande(demandeId);
  },

  getByClient: async (clientId: string) => {
    return avisService.getByClient(clientId);
  },
};

import type { RouterClient } from "@orpc/server";
import { ORPCError } from "@orpc/server";
import { demandeController } from "../controllers/demande.controller";
import { demandeService } from "../services/demande.service";
import { artisanService } from "../services/artisan.service";
import { avisController } from "../controllers/avis.controller";
import { paiementController } from "../controllers/paiement.controller";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../index";
import { healthController } from "../controllers/health.controller";
import { userController } from "../controllers/user.controller";
import { categorieController } from "../controllers/categorie.controller";
import { serviceController } from "../controllers/service.controller";
import { serviceArtisanController } from "../controllers/service-artisan.controller";
import { messageService } from "../services/message.service";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return healthController.check();
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return userController.getPrivateData(context);
  }),
  getCategories: publicProcedure.handler(() => {
    return categorieController.getAll();
  }),
  getMessages: protectedProcedure
    .input(z.object({ demandeId: z.string() }))
    .handler(({ input }) => {
      return messageService.getByDemande(input.demandeId);
    }),

  getDemandeById: protectedProcedure
    .input(z.object({ demandeId: z.string() }))
    .handler(({ input }) => {
      return demandeService.getDemandeById(input.demandeId);
    }),

  createCategorie: protectedProcedure
    .input(z.object({ nom: z.string().min(1) }))
    .handler(({ input }) => {
      return categorieController.create(input.nom);
    }),

  deleteCategorie: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(({ input }) => {
      return categorieController.delete(input.id);
    }),

  createDemande: protectedProcedure
    .input(
      z.object({
        description: z.string(),
        adresse: z.string(),
        serviceId: z.string().optional(),
      }),
    )
    .handler(({ context, input }) => {
      return demandeController.create(context.session.user.id, input);
    }),

  myDemandes: protectedProcedure.handler(({ context }) => {
    return demandeController.getMyDemandes(
      context.session.user.id,
      context.session.user.role ?? "client",
    );
  }),

  updateDemandeStatut: protectedProcedure
    .input(z.object({ demandeId: z.string(), statut: z.string() }))
    .handler(({ input }) => {
      return demandeController.updateStatut(input.demandeId, input.statut);
    }),

  acceptDemande: protectedProcedure
    // artisanId is resolved from the session — never trusted from the client.
    .input(z.object({ demandeId: z.string() }))
    .handler(async ({ context, input }) => {
      const profile = await artisanService.getByUserId(context.session.user.id);
      if (!profile) {
        throw new ORPCError("FORBIDDEN", {
          message: "Artisan profile not found. Please complete onboarding first.",
        });
      }
      try {
        return await demandeController.accept(input.demandeId, profile.id);
      } catch (err: any) {
        const msg: string = err?.message ?? "";
        if (msg === "PRIX_NON_DEFINI") {
          throw new ORPCError("FORBIDDEN", {
            message:
              "Vous devez définir un prix pour ce service avant de l'accepter.",
          });
        }
        if (msg === "DEMANDE_INTROUVABLE") {
          throw new ORPCError("NOT_FOUND", { message: "Demande introuvable." });
        }
        throw err;
      }
    }),

  onboardClient: protectedProcedure
    .input(z.object({ phone: z.string() }))
    .handler(({ context, input }) => {
      return userController.onboardClient(context, input.phone);
    }),

  onboardArtisan: protectedProcedure
    .input(z.object({
      description: z.string(),
      experience: z.number().or(z.string().transform(Number)),
      adresse: z.string(),
      ville: z.string(),
      photoBase64: z.string().optional(),
    }))
    .handler(({ context, input }) => {
      return userController.onboardArtisan(context, input);
    }),

  // ─── Services ───────────────────────────────────────────────────────────────

  /** Public: list all services (with their category name). */
  getServices: publicProcedure.handler(() => {
    return serviceController.getAll();
  }),

  /** Public: list services filtered by category. */
  getServicesByCategorie: publicProcedure
    .input(z.object({ categorieId: z.string() }))
    .handler(({ input }) => {
      return serviceController.getByCategorie(input.categorieId);
    }),

  /** Protected (admin): create a new service. */
  createService: protectedProcedure
    .input(z.object({
      nom: z.string().min(1),
      description: z.string().optional(),
      categorieId: z.string().min(1),
    }))
    .handler(({ input }) => {
      return serviceController.create(input.nom, input.description, input.categorieId);
    }),

  /** Protected (admin): update an existing service. */
  updateService: protectedProcedure
    .input(z.object({
      id: z.string(),
      nom: z.string().min(1).optional(),
      description: z.string().nullable().optional(),
      categorieId: z.string().optional(),
    }))
    .handler(({ input }) => {
      const { id, ...data } = input;
      return serviceController.update(id, data);
    }),

  /** Protected (admin): delete a service (cascades to service_artisan). */
  deleteService: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(({ input }) => {
      return serviceController.delete(input.id);
    }),

  // ─── Service-Artisan ────────────────────────────────────────────────────────

  /** Protected: return the current artisan's own service list (enriched). */
  getMyServices: protectedProcedure.handler(({ context }) => {
    return serviceArtisanController.getMyServices(context.session.user.id);
  }),

  /** Protected: artisan adds a service with a price. */
  addServiceArtisan: protectedProcedure
    .input(z.object({ serviceId: z.string(), prix: z.number().positive() }))
    .handler(async ({ context, input }) => {
      return serviceArtisanController.addService(
        context.session.user.id,
        input.serviceId,
        input.prix,
      );
    }),

  /** Protected: artisan updates the price of one of their service entries. */
  updateServiceArtisan: protectedProcedure
    .input(z.object({ id: z.string(), prix: z.number().positive() }))
    .handler(({ input }) => {
      return serviceArtisanController.updateService(input.id, input.prix);
    }),

  /** Protected: artisan removes one of their service entries. */
  removeServiceArtisan: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(({ input }) => {
      return serviceArtisanController.removeService(input.id);
    }),

  // ─── Avis (Reviews) ─────────────────────────────────────────────────────────

  /**
   * Protected: client submits a review for a completed demande.
   * artisanId is resolved server-side from the demande — never from client input.
   */
  createAvis: protectedProcedure
    .input(z.object({
      demandeId: z.string(),
      note: z.number().int().min(1).max(5),
      commentaire: z.string().optional(),
    }))
    .handler(async ({ context, input }) => {
      try {
        return await avisController.create(context.session.user.id, input);
      } catch (err: any) {
        const msg: string = err?.message ?? "";
        if (msg === "UN_AVIS_EXISTE_DEJA") {
          throw new ORPCError("CONFLICT", { message: "Vous avez déjà laissé un avis pour cette demande." });
        }
        if (msg === "DEMANDE_NON_TERMINEE") {
          throw new ORPCError("FORBIDDEN", { message: "Vous ne pouvez laisser un avis que sur une demande terminée." });
        }
        if (msg === "DEMANDE_INTROUVABLE" || msg === "ARTISAN_INTROUVABLE") {
          throw new ORPCError("NOT_FOUND", { message: "Demande ou artisan introuvable." });
        }
        throw err;
      }
    }),

  /**
   * Public: fetch all avis received by an artisan, plus average + count.
   * Used for public profile pages.
   */
  getArtisanAvis: publicProcedure
    .input(z.object({ artisanId: z.string() }))
    .handler(({ input }) => {
      return avisController.getByArtisan(input.artisanId);
    }),

  /**
   * Protected: check whether the current demande already has an avis.
   * Returns the avis row or null.
   */
  getAvisForDemande: protectedProcedure
    .input(z.object({ demandeId: z.string() }))
    .handler(({ input }) => {
      return avisController.getByDemande(input.demandeId);
    }),

  /**
   * Protected: fetch all avis written by the current client.
   */
  getMyAvis: protectedProcedure.handler(({ context }) => {
    return avisController.getByClient(context.session.user.id);
  }),

  // ─── Paiements ───────────────────────────────────────────────────────────────

  /**
   * Protected: client initiates a Stripe Checkout for a completed demande.
   * montant is resolved 100% server-side from service_artisan.
   * Returns { checkoutUrl } for immediate browser redirect.
   */
  createPaiement: protectedProcedure
    .input(z.object({ demandeId: z.string() }))
    .handler(async ({ context, input }) => {
      try {
        return await paiementController.createCheckoutSession(
          input.demandeId,
          context.session.user.id,
        );
      } catch (err: any) {
        const msg: string = err?.message ?? "";
        if (msg === "DEMANDE_INTROUVABLE") {
          throw new ORPCError("NOT_FOUND", { message: "Demande introuvable." });
        }
        if (msg === "ACCES_INTERDIT") {
          throw new ORPCError("FORBIDDEN", { message: "Accès refusé à cette demande." });
        }
        if (msg === "DEMANDE_NON_TERMINEE") {
          throw new ORPCError("FORBIDDEN", { message: "Le paiement n'est disponible que pour les demandes terminées." });
        }
        if (msg === "ARTISAN_INTROUVABLE") {
          throw new ORPCError("NOT_FOUND", { message: "Aucun artisan assigné à cette demande." });
        }
        if (msg === "MONTANT_INTROUVABLE") {
          throw new ORPCError("UNPROCESSABLE_CONTENT", { message: "Impossible de déterminer le montant : l'artisan n'a pas de services enregistrés." });
        }
        if (msg === "DEJA_PAYE") {
          throw new ORPCError("CONFLICT", { message: "Cette prestation a déjà été payée." });
        }
        throw err;
      }
    }),

  /**
   * Protected: fetch the paiement for a given demande (or null).
   * Used by the client to check payment status on each demande card.
   */
  getPaiementForDemande: protectedProcedure
    .input(z.object({ demandeId: z.string() }))
    .handler(({ input }) => {
      return paiementController.getByDemande(input.demandeId);
    }),

  /**
   * Protected: return all paiements for the currently logged-in client.
   */
  getMyPaiements: protectedProcedure.handler(({ context }) => {
    return paiementController.getByClient(context.session.user.id);
  }),

  /**
   * Protected: return all paiements received for the artisan's demandes.
   * artisanId resolved server-side from the session.
   */
  getArtisanPaiements: protectedProcedure.handler(async ({ context }) => {
    const profile = await artisanService.getByUserId(context.session.user.id);
    if (!profile) {
      throw new ORPCError("NOT_FOUND", { message: "Profil artisan introuvable." });
    }
    return paiementController.getByArtisan(profile.id);
  }),
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
import type { RouterClient } from "@orpc/server";
import { ORPCError } from "@orpc/server";
import { demandeController } from "../controllers/demande.controller";
import { demandeService } from "../services/demande.service";
import { artisanService } from "../services/artisan.service";
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
    .input(z.object({ description: z.string(), adresse: z.string() }))
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
      return demandeController.accept(input.demandeId, profile.id);
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
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
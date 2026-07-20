import type { RouterClient } from "@orpc/server";
import { demandeController } from "../controllers/demande.controller";
import { z } from "zod";

import { protectedProcedure, publicProcedure } from "../index";
import { healthController } from "../controllers/health.controller";
import { userController } from "../controllers/user.controller";
import { categorieController } from "../controllers/categorie.controller";

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
  .input(z.object({ demandeId: z.string(), artisanId: z.string() }))
  .handler(({ input }) => {
    return demandeController.accept(input.demandeId, input.artisanId);
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
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
import type { RouterClient } from "@orpc/server";
import { z } from "zod";

import { protectedProcedure, publicProcedure } from "../index";
import { healthController } from "../controllers/health.controller";
import { userController } from "../controllers/user.controller";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return healthController.check();
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return userController.getPrivateData(context);
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
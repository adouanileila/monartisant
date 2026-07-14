import { ORPCError } from "@orpc/server";
import type { Context } from "../context";
import { userService } from "../services/user.service";
import { userView } from "../views/user.view";

export const userController = {
  getPrivateData: (context: Context) => {
    const data = userService.getPrivateUserData(context);
    return userView.formatPrivateData(data.message, data.user);
  },
  onboardClient: async (context: Context, phone: string) => {
    if (!context.session?.user.id) {
      throw new ORPCError("UNAUTHORIZED");
    }
    return userService.onboardClient(context.session.user.id, phone);
  },
  onboardArtisan: async (
    context: Context, 
    data: { description: string; experience: number; adresse: string; ville: string; photoBase64?: string }
  ) => {
    if (!context.session?.user.id) {
      throw new ORPCError("UNAUTHORIZED");
    }
    return userService.onboardArtisan(context.session.user.id, data);
  }
};
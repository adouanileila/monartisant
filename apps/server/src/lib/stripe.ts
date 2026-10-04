import Stripe from "stripe";
import { env } from "@monartisant/env/server";

/**
 * Singleton Stripe client initialised with the server-side secret key.
 * Only import this file from server code — never from the web app.
 */
export const stripe = new Stripe(env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-09-30.endive",
});

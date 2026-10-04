import Stripe from "stripe";
import { env } from "@monartisant/env/server";

/**
 * Lazy Stripe client factory.
 * Instantiated on first call so an empty/missing STRIPE_SECRET_KEY at startup
 * does NOT crash the server (auth, messaging, etc. still work without Stripe).
 * Throws a clear error at call time if the key hasn't been configured.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not configured. Please add it to apps/server/.env.",
      );
    }
    _stripe = new Stripe(key, { apiVersion: "2026-09-30.endive" });
  }
  return _stripe;
}

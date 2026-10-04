import { db } from "@monartisant/db";
import { paiement } from "@monartisant/db/schema/paiement";
import { eq } from "drizzle-orm";

import { demandeService } from "../services/demande.service";
import { paiementService } from "../services/paiement.service";
import { getStripe } from "../lib/stripe";

/** Base URL for Stripe redirect URLs — points at the Next.js web app. */
const WEB_BASE_URL = process.env.CORS_ORIGIN ?? "http://localhost:3001";

export const paiementController = {
  /**
   * Creates a Stripe Checkout Session for a given demande.
   *
   * - Validates: demande exists, statut === "terminee", belongs to clientId.
   * - Resolves montant 100% server-side: sums the prix of all services
   *   the assigned artisan has registered in service_artisan.
   * - Inserts a paiement row with statut "en_attente".
   * - Returns { checkoutUrl } so the frontend can redirect.
   */
  createCheckoutSession: async (demandeId: string, clientId: string) => {
    // ── 1. Fetch and validate the demande ────────────────────────────────────
    const dem = await demandeService.getDemandeById(demandeId);

    if (!dem) {
      throw new Error("DEMANDE_INTROUVABLE");
    }
    if (dem.clientId !== clientId) {
      throw new Error("ACCES_INTERDIT");
    }
    if (dem.statut !== "terminee") {
      throw new Error("DEMANDE_NON_TERMINEE");
    }
    if (!dem.artisanId) {
      throw new Error("ARTISAN_INTROUVABLE");
    }

    // ── 2. Guard: only one paiement per demande ───────────────────────────────
    const existing = await paiementService.getByDemande(demandeId);
    if (existing && existing.statut === "paye") {
      throw new Error("DEJA_PAYE");
    }

    // ── 3. Resolve montant from prixConvenu locked at acceptance ─────────────
    //   prixConvenu is set on the demande when the artisan accepts, taken
    //   directly from their ServiceArtisan.prix — never client-supplied.
    const montant = dem.prixConvenu;

    if (!montant || montant <= 0) {
      throw new Error("MONTANT_INTROUVABLE");
    }


    // ── 4. Create Stripe Checkout Session ────────────────────────────────────
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: Math.round(montant * 100), // Stripe expects cents
            product_data: {
              name: `Prestation : ${dem.description.slice(0, 100)}`,
              description: `Demande #${demandeId.slice(0, 8)} — Paiement sécurisé`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${WEB_BASE_URL}/dashboard/client/paiements/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${WEB_BASE_URL}/dashboard/client/demandes`,
      metadata: { demandeId, clientId },
    });

    // ── 5. Persist paiement row ───────────────────────────────────────────────
    // If an en_attente row already exists (user abandoned previous checkout),
    // update its stripeSessionId rather than inserting a duplicate.
    if (existing && existing.statut === "en_attente") {
      await db
        .update(paiement)
        .set({ stripeSessionId: session.id })
        .where(eq(paiement.id, existing.id));
    } else {
      await paiementService.create({
        demandeId,
        clientId,
        montant,
        stripeSessionId: session.id,
      });
    }

    return { checkoutUrl: session.url! };
  },

  /** Return paiement for a given demande — null if none exists. */
  getByDemande: async (demandeId: string) => {
    return paiementService.getByDemande(demandeId);
  },

  /** Return all paiements for the connected client. */
  getByClient: async (clientId: string) => {
    return paiementService.getByClient(clientId);
  },

  /** Return all paiements received for the artisan's demandes + total earnings. */
  getByArtisan: async (artisanId: string) => {
    const [list, total] = await Promise.all([
      paiementService.getByArtisan(artisanId),
      paiementService.getTotalEarningsForArtisan(artisanId),
    ]);
    return { paiements: list, totalEarnings: total };
  },
};

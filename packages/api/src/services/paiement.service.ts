import { db } from "@monartisant/db";
import { paiement } from "@monartisant/db/schema/paiement";
import { demande } from "@monartisant/db/schema/demande";
import { user } from "@monartisant/db/schema/auth";
import { eq, sum } from "drizzle-orm";
import { nanoid } from "nanoid";

export const paiementService = {
  /**
   * Insert a new paiement row (statut "en_attente" by default).
   */
  create: async (data: {
    demandeId: string;
    clientId: string;
    montant: number;
    stripeSessionId?: string;
    methode?: string;
  }) => {
    const [row] = await db
      .insert(paiement)
      .values({
        id: nanoid(),
        demandeId: data.demandeId,
        clientId: data.clientId,
        montant: data.montant,
        methode: data.methode ?? "carte",
        stripeSessionId: data.stripeSessionId ?? null,
        statut: "en_attente",
      })
      .returning();
    return row;
  },

  /**
   * Return the paiement (or null) for a given demande.
   */
  getByDemande: async (demandeId: string) => {
    const [row] = await db
      .select()
      .from(paiement)
      .where(eq(paiement.demandeId, demandeId))
      .limit(1);
    return row ?? null;
  },

  /**
   * Update the paiement statut; also refreshes datePaiement when marking as "paye".
   */
  updateStatut: async (id: string, statut: "en_attente" | "paye" | "echoue") => {
    const [row] = await db
      .update(paiement)
      .set({
        statut,
        ...(statut === "paye" ? { datePaiement: new Date() } : {}),
      })
      .where(eq(paiement.id, id))
      .returning();
    return row;
  },

  /**
   * Find a paiement by its Stripe Checkout Session id — used by the webhook.
   */
  getByStripeSession: async (stripeSessionId: string) => {
    const [row] = await db
      .select()
      .from(paiement)
      .where(eq(paiement.stripeSessionId, stripeSessionId))
      .limit(1);
    return row ?? null;
  },

  /**
   * All paiements by a client, enriched with the demande description.
   */
  getByClient: async (clientId: string) => {
    return db
      .select({
        id: paiement.id,
        demandeId: paiement.demandeId,
        montant: paiement.montant,
        methode: paiement.methode,
        statut: paiement.statut,
        datePaiement: paiement.datePaiement,
        stripeSessionId: paiement.stripeSessionId,
        demandeDescription: demande.description,
      })
      .from(paiement)
      .leftJoin(demande, eq(demande.id, paiement.demandeId))
      .where(eq(paiement.clientId, clientId))
      .orderBy(paiement.datePaiement);
  },

  /**
   * All paiements received for an artisan's demandes, enriched with client name
   * and demande description. Resolved by joining demande.artisanId.
   */
  getByArtisan: async (artisanId: string) => {
    return db
      .select({
        id: paiement.id,
        demandeId: paiement.demandeId,
        clientId: paiement.clientId,
        montant: paiement.montant,
        statut: paiement.statut,
        datePaiement: paiement.datePaiement,
        demandeDescription: demande.description,
        clientNom: user.name,
      })
      .from(paiement)
      .innerJoin(demande, eq(demande.id, paiement.demandeId))
      .leftJoin(user, eq(user.id, paiement.clientId))
      .where(eq(demande.artisanId, artisanId))
      .orderBy(paiement.datePaiement);
  },

  /**
   * Sum of "paye" paiements for an artisan — used for the earnings summary card.
   */
  getTotalEarningsForArtisan: async (artisanId: string) => {
    const [result] = await db
      .select({ total: sum(paiement.montant) })
      .from(paiement)
      .innerJoin(demande, eq(demande.id, paiement.demandeId))
      .where(eq(demande.artisanId, artisanId));
    return parseFloat(result?.total ?? "0") || 0;
  },
};

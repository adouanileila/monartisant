import { relations } from "drizzle-orm";
import { pgTable, text, real, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { demande } from "./demande";
import { user } from "./auth";

export const paiement = pgTable(
  "paiement",
  {
    id: text("id").primaryKey(),
    /** One paiement per demande at most (unique). */
    demandeId: text("demande_id")
      .notNull()
      .unique()
      .references(() => demande.id, { onDelete: "cascade" }),
    /** Client who initiated the payment — resolved server-side. */
    clientId: text("client_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    montant: real("montant").notNull(),
    methode: text("methode").notNull().default("carte"),
    /** en_attente | paye | echoue */
    statut: text("statut").notNull().default("en_attente"),
    /** Stripe Checkout Session id — stored for webhook reconciliation. */
    stripeSessionId: text("stripe_session_id"),
    datePaiement: timestamp("date_paiement").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("paiement_demandeId_udx").on(table.demandeId),
    index("paiement_clientId_idx").on(table.clientId),
  ],
);

export const paiementRelations = relations(paiement, ({ one }) => ({
  demande: one(demande, {
    fields: [paiement.demandeId],
    references: [demande.id],
  }),
  client: one(user, {
    fields: [paiement.clientId],
    references: [user.id],
  }),
}));
import { relations } from "drizzle-orm";
import { pgTable, text, real, timestamp, index } from "drizzle-orm/pg-core";
import { demande } from "./demande";

export const paiement = pgTable(
  "paiement",
  {
    id: text("id").primaryKey(),
    demandeId: text("demande_id")
      .notNull()
      .references(() => demande.id, { onDelete: "cascade" }),
    montant: real("montant").notNull(),
    methode: text("methode").notNull(),
    statut: text("statut").notNull().default("en_attente"),
    datePaiement: timestamp("date_paiement"),
  },
  (table) => [index("paiement_demandeId_idx").on(table.demandeId)],
);

export const paiementRelations = relations(paiement, ({ one }) => ({
  demande: one(demande, {
    fields: [paiement.demandeId],
    references: [demande.id],
  }),
}));
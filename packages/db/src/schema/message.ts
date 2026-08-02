import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { demande } from "./demande";

export const message = pgTable(
  "message",
  {
    id: text("id").primaryKey(),
    demandeId: text("demande_id")
      .notNull()
      .references(() => demande.id, { onDelete: "cascade" }),
    expediteurId: text("expediteur_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    destinataireId: text("destinataire_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    contenu: text("contenu").notNull(),
    type: text("type", { enum: ["texte", "image"] })
      .notNull()
      .default("texte"),
    dateCreation: timestamp("date_creation").defaultNow().notNull(),
  },
  (table) => [index("message_demandeId_idx").on(table.demandeId)],
);

export const messageRelations = relations(message, ({ one }) => ({
  demande: one(demande, {
    fields: [message.demandeId],
    references: [demande.id],
  }),
  expediteur: one(user, {
    fields: [message.expediteurId],
    references: [user.id],
  }),
  destinataire: one(user, {
    fields: [message.destinataireId],
    references: [user.id],
  }),
}));
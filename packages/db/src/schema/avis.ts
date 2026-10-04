import { relations } from "drizzle-orm";
import { pgTable, text, integer, timestamp, index } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { artisan } from "./artisan";
import { demande } from "./demande";

export const avis = pgTable(
  "avis",
  {
    id: text("id").primaryKey(),
    demandeId: text("demande_id")
      .notNull()
      .unique() // enforces one review per demande
      .references(() => demande.id, { onDelete: "cascade" }),
    clientId: text("client_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    artisanId: text("artisan_id")
      .notNull()
      .references(() => artisan.id, { onDelete: "cascade" }),
    note: integer("note").notNull(), // 1 to 5
    commentaire: text("commentaire"),
    dateCreation: timestamp("date_creation").defaultNow().notNull(),
  },
  (table) => [
    index("avis_artisanId_idx").on(table.artisanId),
    index("avis_clientId_idx").on(table.clientId),
  ],
);

export const avisRelations = relations(avis, ({ one }) => ({
  demande: one(demande, {
    fields: [avis.demandeId],
    references: [demande.id],
  }),
  client: one(user, {
    fields: [avis.clientId],
    references: [user.id],
  }),
  artisan: one(artisan, {
    fields: [avis.artisanId],
    references: [artisan.id],
  }),
}));
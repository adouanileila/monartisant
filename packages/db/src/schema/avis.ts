import { relations } from "drizzle-orm";
import { pgTable, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { artisan } from "./artisan";

export const avis = pgTable(
  "avis",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    artisanId: text("artisan_id")
      .notNull()
      .references(() => artisan.id, { onDelete: "cascade" }),
    note: integer("note").notNull(),
    commentaire: text("commentaire"),
    date: timestamp("date").defaultNow().notNull(),
  },
  (table) => [index("avis_artisanId_idx").on(table.artisanId)],
);

export const avisRelations = relations(avis, ({ one }) => ({
  client: one(user, {
    fields: [avis.clientId],
    references: [user.id],
  }),
  artisan: one(artisan, {
    fields: [avis.artisanId],
    references: [artisan.id],
  }),
}));
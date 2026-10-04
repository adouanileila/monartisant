import { relations } from "drizzle-orm";
import { pgTable, text, index } from "drizzle-orm/pg-core";
import { categorie } from "./categorie";

export const service = pgTable(
  "service",
  {
    id: text("id").primaryKey(),
    nom: text("nom").notNull(),
    description: text("description"),
    categorieId: text("categorie_id")
      .notNull()
      .references(() => categorie.id, { onDelete: "cascade" }),
  },
  (table) => [index("service_categorieId_idx").on(table.categorieId)],
);

export const serviceRelations = relations(service, ({ one }) => ({
  categorie: one(categorie, {
    fields: [service.categorieId],
    references: [categorie.id],
  }),
}));

import { pgTable, text } from "drizzle-orm/pg-core";

export const categorie = pgTable("categorie", {
  id: text("id").primaryKey(),
  nom: text("nom").notNull().unique(),
});
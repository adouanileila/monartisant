import { relations } from "drizzle-orm";
import { pgTable, text, integer, real, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const artisan = pgTable(
  "artisan",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    description: text("description"),
    experience: integer("experience"),
    ville: text("ville"),
    adresse: text("adresse"),
    latitude: real("latitude"),
    longitude: real("longitude"),
    disponibilite: boolean("disponibilite").default(true).notNull(),
    estVerifie: boolean("est_verifie").default(false).notNull(),
    noteMoyenne: real("note_moyenne").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("artisan_userId_idx").on(table.userId)],
);

export const artisanRelations = relations(artisan, ({ one }) => ({
  user: one(user, {
    fields: [artisan.userId],
    references: [user.id],
  }),
}));
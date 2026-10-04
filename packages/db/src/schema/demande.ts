import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, real, index } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { artisan } from "./artisan";
import { service } from "./service";

export const demande = pgTable(
  "demande",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    artisanId: text("artisan_id").references(() => artisan.id, {
      onDelete: "set null",
    }),
    // nullable so existing rows (created before this feature) are not broken.
    serviceId: text("service_id").references(() => service.id, {
      onDelete: "set null",
    }),
    description: text("description").notNull(),
    adresse: text("adresse").notNull(),
    statut: text("statut").notNull().default("en_attente"), // en_attente | acceptee | refusee | terminee
    /**
     * Prix verrouillé à l'acceptation depuis serviceArtisan.prix.
     * Nullable on legacy rows (pre-serviceId feature) and until accepted.
     */
    prixConvenu: real("prix_convenu"),
    dateCreation: timestamp("date_creation").defaultNow().notNull(),
  },
  (table) => [
    index("demande_clientId_idx").on(table.clientId),
    index("demande_artisanId_idx").on(table.artisanId),
    index("demande_serviceId_idx").on(table.serviceId),
  ],
);

export const demandeRelations = relations(demande, ({ one }) => ({
  client: one(user, {
    fields: [demande.clientId],
    references: [user.id],
  }),
  artisan: one(artisan, {
    fields: [demande.artisanId],
    references: [artisan.id],
  }),
  service: one(service, {
    fields: [demande.serviceId],
    references: [service.id],
  }),
}));
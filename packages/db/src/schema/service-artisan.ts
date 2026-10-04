import { relations } from "drizzle-orm";
import { pgTable, text, real, uniqueIndex, index } from "drizzle-orm/pg-core";
import { artisan } from "./artisan";
import { service } from "./service";

export const serviceArtisan = pgTable(
  "service_artisan",
  {
    id: text("id").primaryKey(),
    prix: real("prix").notNull(),
    artisanId: text("artisan_id")
      .notNull()
      .references(() => artisan.id, { onDelete: "cascade" }),
    serviceId: text("service_id")
      .notNull()
      .references(() => service.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("service_artisan_artisan_service_udx").on(
      table.artisanId,
      table.serviceId,
    ),
    index("service_artisan_artisanId_idx").on(table.artisanId),
    index("service_artisan_serviceId_idx").on(table.serviceId),
  ],
);

export const serviceArtisanRelations = relations(serviceArtisan, ({ one }) => ({
  artisan: one(artisan, {
    fields: [serviceArtisan.artisanId],
    references: [artisan.id],
  }),
  service: one(service, {
    fields: [serviceArtisan.serviceId],
    references: [service.id],
  }),
}));

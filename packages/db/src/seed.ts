import "dotenv/config";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "../../apps/server/.env") });
dotenv.config({ path: path.resolve(process.cwd(), "apps/server/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { db } from "./index";
import { categorie } from "./schema/categorie";
import { service } from "./schema/service";
import { eq } from "drizzle-orm";

const initialCategories = [
  {
    id: "cat-plomberie",
    nom: "Plomberie",
    services: [
      { id: "srv-fuite", nom: "Réparation de fuite d'eau", description: "Détection et réparation rapide de fuites d'eau ou tuyauterie endommagée." },
      { id: "srv-debouchage", nom: "Débouchage de canalisation", description: "Débouchage évier, lavabo, douche, baignoire ou WC." },
      { id: "srv-chauffe-eau", nom: "Installation & entretien chauffe-eau", description: "Pose, détartrage et remplacement de chauffe-eau électrique ou gaz." },
      { id: "srv-sanitaire", nom: "Remplacement d'équipements sanitaires", description: "Pose et replacement de robinetterie, WC, lavabo et douche." },
    ],
  },
  {
    id: "cat-electricite",
    nom: "Électricité",
    services: [
      { id: "srv-panne-elec", nom: "Dépannage panne électrique", description: "Diagnostic et remise en service après court-circuit ou disjonction." },
      { id: "srv-tableau-elec", nom: "Mise aux normes tableau électrique", description: "Remplacement ou sécurisation de tableau électrique vétuste." },
      { id: "srv-prises", nom: "Installation de prises & interrupteurs", description: "Ajout, déplacement ou changement de prises électriques et interrupteurs." },
      { id: "srv-luminaire", nom: "Pose de luminaires & éclairage", description: "Installation de lustres, spots encastrés et éclairages extérieurs." },
    ],
  },
  {
    id: "cat-peinture",
    nom: "Peinture & Décoration",
    services: [
      { id: "srv-peinture-int", nom: "Peinture intérieure (murs & plafonds)", description: "Préparation des surfaces, sous-couche et peinture de finition." },
      { id: "srv-papier-peint", nom: "Pose de papier peint", description: "Décollement et pose soignée de tous types de papiers peints." },
      { id: "srv-enduit", nom: "Enduisage & ponçage", description: "Lissage et rebouchage des trous et fissures avant peinture." },
    ],
  },
  {
    id: "cat-menuiserie",
    nom: "Menuiserie",
    services: [
      { id: "srv-porte-fenetre", nom: "Pose de portes & fenêtres", description: "Installation et ajustement de portes intérieures, d'entrée et fenêtres." },
      { id: "srv-parquet", nom: "Pose de parquet", description: "Pose flottante ou collée de parquet stratifié, massif ou contrecollé." },
      { id: "srv-meuble-sur-mesure", nom: "Fabrication de meubles sur mesure", description: "Création de placards, dressing ou étagères personnalisées." },
    ],
  },
  {
    id: "cat-jardinage",
    nom: "Jardinage & Espaces Verts",
    services: [
      { id: "srv-tonte", nom: "Tonte de pelouse & débroussaillage", description: "Entretien régulier ou ponctuel des gazons et espaces herbeux." },
      { id: "srv-taille-haie", nom: "Taille de haies & arbustes", description: "Taille de formation, d'entretien ou de rabattage de haies." },
      { id: "srv-arrosage", nom: "Installation système d'arrosage", description: "Mise en place d'arrosage automatique goutte-à-goutte ou enterré." },
    ],
  },
];

export async function seed() {
  console.log("🌱 Starting Database Seed...");

  for (const catData of initialCategories) {
    // Upsert Category
    const existingCat = await db
      .select()
      .from(categorie)
      .where(eq(categorie.nom, catData.nom));

    let categorieId = catData.id;

    if (existingCat.length === 0) {
      await db.insert(categorie).values({
        id: catData.id,
        nom: catData.nom,
      });
      console.log(`+ Category added: ${catData.nom}`);
    } else {
      categorieId = existingCat[0].id;
      console.log(`= Category already exists: ${catData.nom}`);
    }

    // Insert services
    for (const srvData of catData.services) {
      const existingSrv = await db
        .select()
        .from(service)
        .where(eq(service.nom, srvData.nom));

      if (existingSrv.length === 0) {
        await db.insert(service).values({
          id: srvData.id,
          nom: srvData.nom,
          description: srvData.description,
          categorieId: categorieId,
        });
        console.log(`  + Service added: ${srvData.nom}`);
      } else {
        console.log(`  = Service already exists: ${srvData.nom}`);
      }
    }
  }

  console.log("✅ Database Seed Completed Successfully!");
}

// Run directly if executed as standalone script
if (process.argv[1]?.includes("seed")) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed error:", err);
      process.exit(1);
    });
}

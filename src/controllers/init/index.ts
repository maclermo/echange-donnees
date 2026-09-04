/* istanbul ignore file */

import { Entreprise, entrepriseModelInit } from "@/controllers/entreprise";
import { Facture, factureModelInit } from "@/controllers/facture";
import { Item, itemModelInit } from "@/controllers/item";
import sequelize from "@/database";
import { createHash } from "node:crypto";
import { rbacModelInit } from "../rbac";

const entrepriseModel = entrepriseModelInit();
const factureModel = factureModelInit();
const itemModel = itemModelInit();
const rbacModel = rbacModelInit();

export const init = async (doSyncFakeData: boolean): Promise<void> => {
  try {
    await sequelize.authenticate();

    factureModel.belongsTo(entrepriseModel, { foreignKey: "entreprise_id" });
    factureModel.hasMany(itemModel, { foreignKey: "facture_numero" });
    itemModel.belongsTo(factureModel, { foreignKey: "facture_numero" });

    await entrepriseModel.sync({ force: true, alter: true });
    await factureModel.sync({ force: true, alter: true });
    await itemModel.sync({ force: true, alter: true });
    await rbacModel.sync({ force: true, alter: true });

    if (doSyncFakeData) {
      await syncFakeData(entrepriseModel, factureModel);
    }
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
};

export const syncFakeData = async (
  entrepriseModel: typeof Entreprise,
  factureModel: typeof Facture,
): Promise<void> => {
  await entrepriseModel.create({
    id: 1,
    nom: "Fleuriste Baccara Enr.",
    client: "Nadia Fontaine",
    courriel: "nadia@fleursbaccara.com",
    telephone: "514-555-1234",
    adresse: "123 Rue Smith",
    code_postal: "H0H0H0",
    ville: "Laval",
    province: "Quebec",
    pays: "Canada",
  });

  await entrepriseModel.create({
    id: 2,
    nom: "8001-8294 Quebec Inc.",
    client: "Marcel Rabouldingue",
    courriel: "super_marcel@hotmail.fr",
    telephone: "450-111-9876",
    adresse: "1235 Blvd. Des Pigeons",
    code_postal: "H4E5T3",
    ville: "Ville-Emard",
    province: "Quebec",
    pays: "Canada",
  });

  await factureModel.create(
    {
      entreprise_id: 1,
      details: "Pour le projet de décoration chez Gilles Labonté",
      date_echeance: new Date(),
      date_emission: new Date(),
      items: [
        {
          nom: "Rose du printemps",
          description: "Avec boucle en soie",
          quantite: 3,
          prix: 8.99,
        },
      ],
    },
    { include: [Item] },
  );

  await factureModel.create(
    {
      entreprise_id: 2,
      details: "Pour le projet de rénovation chez Jules Inc.",
      date_echeance: new Date(),
      date_emission: new Date(),
      items: [
        {
          nom: "Tuyau flexible 3/4 2 pieds",
          description: "Construction aluminium brossé",
          quantite: 1,
          prix: 12.99,
        },
        {
          nom: "Joint torique 1/2 pouces",
          quantite: 2,
          prix: 0.99,
        },
        {
          nom: "Fusible panneau principal 200 Ampères",
          description: "Connexion Square D",
          quantite: 1,
          prix: 249.99,
        },
      ],
    },
    { include: [Item] },
  );

  let sha256 = createHash("sha256");
  sha256.update("my-super-password");

  await rbacModel.create({
    username: "odoo-writer",
    password: sha256.digest().toString(),
    permissions: [
      "POST /aviron/api/rbac",
      "PUT /aviron/api/factures",
      "GET /aviron/api/entreprises",
      "GET /aviron/api/factures",
      "POST /aviron/api/factures/traiter",
      "GET /aviron/api/factures/.*",
      "POST /aviron/api/factures/.*/traiter",
    ].join(","),
  });

  sha256 = createHash("sha256");
  sha256.update("my-super-password");

  await rbacModel.create({
    username: "odoo-admin",
    password: sha256.digest().toString(),
    permissions: [
      "POST /aviron/api/rbac",
      "PUT /aviron/api/factures",
      "GET /aviron/api/entreprises",
      "GET /aviron/api/factures",
      "POST /aviron/api/factures/traiter",
      "GET /aviron/api/factures/.*",
      "POST /aviron/api/factures/.*/traiter",
      "DELETE /aviron/api/factures/.*",
    ].join(","),
  });
};

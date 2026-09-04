/* istanbul ignore file */

import { Entreprise, entrepriseModelInit } from "@/controllers/entreprise";
import { factureModelInit } from "@/controllers/facture";
import { factureItemModelInit } from "@/controllers/facture_items";
import { Item, itemModelInit } from "@/controllers/item";
import sequelize from "@/database";
import { createFactureWithItems } from "@/utils";
import { createHash } from "node:crypto";
import { rbacModelInit } from "../rbac";

const entrepriseModel = entrepriseModelInit();
const factureModel = factureModelInit();
const factureItemModel = factureItemModelInit();
const itemModel = itemModelInit();
const rbacModel = rbacModelInit();

/**
 * Permet de faire les liens entre les modèles et d'instancier la source
 * Sequelize.
 *
 * @argument doSyncFakeData Permet d'omettre d'ajouter de la fausse donnée
 */
export const init = async (doSyncFakeData: boolean): Promise<void> => {
  try {
    await sequelize.authenticate();

    factureModel.belongsTo(entrepriseModel, {
      foreignKey: "entreprise_id",
      as: "entreprise",
    });
    entrepriseModel.hasMany(factureModel, { foreignKey: "entreprise_id" });
    factureModel.belongsToMany(itemModel, {
      through: factureItemModel,
      foreignKey: "facture_id",
      otherKey: "item_id",
      as: "items",
    });
    itemModel.belongsToMany(factureModel, {
      through: factureItemModel,
      foreignKey: "item_id",
      otherKey: "facture_id",
      as: "factures",
    });

    await entrepriseModel.sync({ force: true, alter: true });
    await factureModel.sync({ force: true, alter: true });
    await factureItemModel.sync({ force: true, alter: true });
    await itemModel.sync({ force: true, alter: true });
    await rbacModel.sync({ force: true, alter: true });

    if (doSyncFakeData) {
      await syncFakeData(entrepriseModel);
    }
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
};

export const syncFakeData = async (
  entrepriseModel: typeof Entreprise,
): Promise<void> => {
  await entrepriseModel.create({
    id: 1,
    nom: "Équipement Médical Du Nordet Inc.",
    client: "Francois Untel",
    courriel: "recevables@equipmed.com",
    telephone: "514-555-1234",
    adresse: "123 Rue Smith",
    code_postal: "H9T1S6",
    ville: "Laval",
    province: "Quebec",
    pays: "Canada",
  });

  await entrepriseModel.create({
    id: 2,
    nom: "Les Civières Heureuses Enr.",
    client: "Alain Tartempion",
    courriel: "comptabilite@civieres.net",
    telephone: "450-111-9876",
    adresse: "1235 Blvd. Des Pigeons",
    code_postal: "H4E5T3",
    ville: "Ville-Emard",
    province: "Quebec",
    pays: "Canada",
  });

  await createFactureWithItems(
    {
      numero: 42,
      entreprise_id: 1,
      details: "PO #129724",
      date_echeance: new Date(),
      date_emission: new Date(),
    },
    [
      {
        nom: "Aiguilles usagées",
        description: "Garantie sans rouille",
        quantite: 20,
        prix: 14.99,
      },
      {
        nom: "Béquilles Turbo-Glide(tm)",
        description: "Avec amortisseurs hydrauliques et porte-gobelet intégré",
        quantite: 2,
        prix: 134.99,
      },
      {
        nom: "Pansements à gros bobos",
        description: "Connectivité Bluetooth - par boîte",
        quantite: 5,
        prix: 28.99,
      },
    ] as Item[],
  );

  await createFactureWithItems(
    {
      numero: 43,
      entreprise_id: 2,
      details: "Livraison en automne",
      date_echeance: new Date(),
      date_emission: new Date(),
    },
    [
      {
        nom: "Civière ergonomique deuxième qualité",
        quantite: 2,
        prix: 1495.99,
      },
      {
        nom: "Roulements pour civière de type super-sport",
        description: "Deux roulements par boîte",
        quantite: 14,
        prix: 107.99,
      },
    ] as Item[],
  );

  let sha256 = createHash("sha256");
  sha256.update("password");

  await rbacModel.create({
    username: "odoo-writer",
    password: sha256.digest().toString(),
    permissions: [
      "POST /aviron/api/rbac",
      "PUT /aviron/api/factures",
      "GET /aviron/api/entreprises",
      "GET /aviron/api/factures",
      "POST /aviron/api/factures/traiter",
      "GET /aviron/api/factures/[^/]+",
      "POST /aviron/api/factures/[^/]+/traiter",
    ].join(","),
  });

  sha256 = createHash("sha256");
  sha256.update("password");

  await rbacModel.create({
    username: "odoo-admin",
    password: sha256.digest().toString(),
    permissions: [
      "POST /aviron/api/rbac",
      "PUT /aviron/api/factures",
      "GET /aviron/api/entreprises",
      "GET /aviron/api/factures",
      "POST /aviron/api/factures/traiter",
      "GET /aviron/api/factures/[^/]+",
      "POST /aviron/api/factures/[^/]+/traiter",
      "DELETE /aviron/api/factures/[^/]+",
    ].join(","),
  });
};

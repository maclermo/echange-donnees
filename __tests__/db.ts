// import { afterAll, beforeAll, beforeEach, jest } from "@jest/globals";
// import init from "@/database";
// import factureModel from "@/models/facture";
// import sequelize from "@/database";

// jest.mock("@/database", () => {
//   const { Sequelize } =
//     jest.requireActual<typeof import("sequelize")>("sequelize");

//   return {
//     __esModule: true,
//     default: new Sequelize("sqlite::memory:", {
//       pool: { max: 1, idle: Infinity, maxUses: Infinity },
//       logging: false,
//     }),
//   };
// });

// beforeAll(async () => {
//   await init();
// });

// afterAll(async () => {
//   await sequelize.close();
// });

// beforeEach(async () => {
//   await factureModel.destroy({
//     where: {},
//     truncate: true,
//   });
// });

// // test("Création et obtention d'une facture", async () => {
// //   await createFacture("123", 100);

// //   const factures = await getFactures();

// //   expect(factures).toHaveLength(1);
// //   expect(factures[0].getDataValue("numero")).toBe("123");
// //   expect(factures[0].getDataValue("montant")).toBe(100);
// // });

// // test("Création et obtention de plusieurs factures", async () => {
// //   const factureID1 = await createFacture("123", 100);
// //   const factureID2 = await createFacture("456", 200);

// //   const facture1 = await getFacture(factureID1.getDataValue("id"));
// //   const facture2 = await getFacture(factureID2.getDataValue("id"));

// //   expect(facture1).not.toBeNull();
// //   expect(facture1!.getDataValue("numero")).toBe("123");
// //   expect(facture1!.getDataValue("montant")).toBe(100);

// //   expect(facture2).not.toBeNull();
// //   expect(facture2!.getDataValue("numero")).toBe("456");
// //   expect(facture2!.getDataValue("montant")).toBe(200);
// // });

// // test("Modification et obtention d'une facture", async () => {
// //   const nontraitee = await createFacture("123", 100);

// //   await traiterFacture(nontraitee.getDataValue("id"));

// //   const traitee = await getFacture(nontraitee.getDataValue("id"));

// //   expect(traitee).not.toBeNull();
// //   expect(nontraitee.getDataValue("statutTraitee")).toBeFalsy();
// //   expect(traitee!.getDataValue("statutTraitee")).toBeTruthy();
// // });

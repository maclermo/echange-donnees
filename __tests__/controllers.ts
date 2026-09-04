import { entrepriseModelInit } from "@/controllers/entreprise";
import { factureModelInit } from "@/controllers/facture";
import { init } from "@/controllers/init";
import { Item, itemModelInit } from "@/controllers/item";
import { RBAC, rbacModelInit } from "@/controllers/rbac";
import { CompteNotFoundError } from "@/errors";
import { app } from "@/index";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import { createHash } from "node:crypto";
import request from "supertest";

const entrepriseModel = entrepriseModelInit();
const factureModel = factureModelInit();
const itemModel = itemModelInit();
const rbacModel = rbacModelInit();

jest.mock("@/database", () => {
  const { Sequelize } =
    jest.requireActual<typeof import("sequelize")>("sequelize");

  return {
    __esModule: true,
    default: new Sequelize("sqlite::memory:", { logging: false }),
  };
});

const testsUsername = "odoo-tests-controllers-username";
const testsPassword = "odoo-tests-controllers-password";

beforeAll(async () => {
  await init(false);

  const sha256 = createHash("sha256");
  sha256.update(testsPassword);

  await rbacModel.create({
    username: testsUsername,
    password: sha256.digest().toString(),
    permissions: [
      "PUT /aviron/api/factures",
      "GET /aviron/api/entreprises",
      "GET /aviron/api/factures",
      "POST /aviron/api/factures/traiter",
      "GET /aviron/api/factures/.*",
      "POST /aviron/api/factures/.*/traiter",
      "DELETE /aviron/api/factures/.*",
    ].join(","),
  });

  await entrepriseModel.create({
    id: 1,
    nom: "Tests Nom Entreprise",
    client: "Tests Client Entreprise",
    courriel: "email@tests.com",
    telephone: "111-222-3333",
    adresse: "123 Main St.",
    code_postal: "H0H0H0",
    ville: "Test Town",
    province: "QC",
    pays: "Canada",
  });
});

afterEach(async () => {
  await itemModel.destroy({ where: {} });
  await factureModel.destroy({ where: {} });
});

afterAll(async () => {
  await rbacModel.destroy({ where: {} });

  const { default: sequelize } = await import("@/database");
  await sequelize.close();

  jest.resetAllMocks();
});

describe("Controller: facture", () => {
  describe("Tests de création d'une facture", () => {
    test("Fonctionnel", async () => {
      const response1 = await request(app)
        .put("/aviron/api/factures")
        .send(
          JSON.stringify({
            entreprise_id: 1,
            details: "Test Product",
            items: [
              {
                nom: "Test Item",
                quantite: 1,
                prix: 12.34,
              },
            ],
          }),
        )
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .auth(testsUsername, testsPassword);

      expect(response1.status).toBe(204);
      expect(response1.body).toStrictEqual({});

      const response2 = await request(app)
        .get("/aviron/api/factures/1")
        .auth(testsUsername, testsPassword);

      expect(response2.status).toBe(200);
      expect(response2.body.details).toStrictEqual("Test Product");
    });

    test("Erreur de validation avec le prix de l'item: pas de prix", async () => {
      const response = await request(app)
        .put("/aviron/api/factures")
        .send(
          JSON.stringify({
            entreprise_id: 1,
            details: "Test Product",
            items: [
              {
                nom: "Test Item",
                quantite: 1,
              },
            ],
          }),
        )
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .auth(testsUsername, testsPassword);

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error:
          'Le champ "items[0].prix" n\'est pas valide: doit contenir une valeur',
      });
    });

    test("Erreur de validation avec le prix de l'item: mauvais type", async () => {
      const response = await request(app)
        .put("/aviron/api/factures")
        .send(
          JSON.stringify({
            entreprise_id: 1,
            details: "Test Product",
            items: [
              {
                nom: "Test Item",
                quantite: 1,
                prix: "a",
              },
            ],
          }),
        )
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .auth(testsUsername, testsPassword);

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error:
          'Le champ "items[0].prix" n\'est pas valide: doit être de type number',
      });
    });

    test("Erreur de validation avec la quantite de l'item: pas de quantite", async () => {
      const response = await request(app)
        .put("/aviron/api/factures")
        .send(
          JSON.stringify({
            entreprise_id: 1,
            details: "Test Product",
            items: [
              {
                nom: "Test Item",
                prix: 12.34,
              },
            ],
          }),
        )
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .auth(testsUsername, testsPassword);

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error:
          'Le champ "items[0].quantite" n\'est pas valide: doit contenir une valeur',
      });
    });

    test("Erreur de validation avec la quantite de l'item: mauvais type", async () => {
      const response = await request(app)
        .put("/aviron/api/factures")
        .send(
          JSON.stringify({
            entreprise_id: 1,
            details: "Test Product",
            items: [
              {
                nom: "Test Item",
                prix: 12.34,
                quantite: "a",
              },
            ],
          }),
        )
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .auth(testsUsername, testsPassword);

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error:
          'Le champ "items[0].quantite" n\'est pas valide: doit être de type number',
      });
    });

    test("Erreur de validation avec le nom de l'item: pas de nom", async () => {
      const response = await request(app)
        .put("/aviron/api/factures")
        .send(
          JSON.stringify({
            entreprise_id: 1,
            details: "Test Product",
            items: [
              {
                prix: 12.34,
                quantite: 1,
              },
            ],
          }),
        )
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .auth(testsUsername, testsPassword);

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error:
          'Le champ "items[0].nom" n\'est pas valide: doit contenir une valeur',
      });
    });

    test("Erreur de validation avec la date: elle est dans le passé", async () => {
      const response = await request(app)
        .put("/aviron/api/factures")
        .send(
          JSON.stringify({
            entreprise_id: 1,
            date_echeance: Date.now() - 50000,
            details: "Test Product",
            items: [
              {
                nom: "Test Item",
                prix: 12.34,
                quantite: 1,
              },
            ],
          }),
        )
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .auth(testsUsername, testsPassword);

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error:
          'Le champ "date_echeance" n\'est pas valide: doit être dans le futur',
      });
    });

    test("Erreur de validation avec le nom de l'item: pas de nom", async () => {
      const response = await request(app)
        .put("/aviron/api/factures")
        .send(
          JSON.stringify({
            entreprise_id: 1,
            details: "Test Product",
            items: [
              {
                prix: 12.34,
                quantite: 1,
              },
            ],
          }),
        )
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .auth(testsUsername, testsPassword);

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error:
          'Le champ "items[0].nom" n\'est pas valide: doit contenir une valeur',
      });
    });

    test("Erreur de validation avec le nom de l'item: pas d'items", async () => {
      const response = await request(app)
        .put("/aviron/api/factures")
        .send(
          JSON.stringify({
            entreprise_id: 1,
            details: "Test Product",
          }),
        )
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .auth(testsUsername, testsPassword);

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error:
          'Le champ "items" n\'est pas valide: La facture doit avoir des items',
      });
    });

    test("Erreur de validation avec le nom de l'item: array d'items vide", async () => {
      const response = await request(app)
        .put("/aviron/api/factures")
        .send(
          JSON.stringify({
            entreprise_id: 1,
            details: "Test Product",
            items: [],
          }),
        )
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .auth(testsUsername, testsPassword);

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error:
          'Le champ "items" n\'est pas valide: La facture doit avoir des items',
      });
    });

    test("Erreur de validation avec la date d'echeance: doit etre au format timestamp", async () => {
      const response = await request(app)
        .put("/aviron/api/factures")
        .send(
          JSON.stringify({
            entreprise_id: 1,
            date_echeance: "012894094210",
            details: "Test Product",
            items: [
              {
                nom: "Test Item",
                quantite: 1,
                prix: 12.34,
              },
            ],
          }),
        )
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .auth(testsUsername, testsPassword);

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error:
          'Le champ "date_echeance" n\'est pas valide: doit être une date valide au format timestamp',
      });
    });

    test("Erreur de validation avec l'entreprise: doit contenir une entreprise", async () => {
      const response = await request(app)
        .put("/aviron/api/factures")
        .send(
          JSON.stringify({
            details: "Test Product",
            items: [
              {
                nom: "Test Item",
                quantite: 1,
                prix: 12.34,
              },
            ],
          }),
        )
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .auth(testsUsername, testsPassword);

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error:
          'Le champ "entreprise_id" n\'est pas valide: doit contenir une entreprise',
      });
    });

    test("Erreur de validation avec l'entreprise: doit contenir une entreprise existante", async () => {
      const response = await request(app)
        .put("/aviron/api/factures")
        .send(
          JSON.stringify({
            entreprise_id: 1337,
            details: "Test Product",
            items: [
              {
                nom: "Test Item",
                quantite: 1,
                prix: 12.34,
              },
            ],
          }),
        )
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .auth(testsUsername, testsPassword);

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error:
          "Le champ \"entreprise_id\" n'est pas valide: l'entreprise doit exister",
      });
    });
  });

  describe("Tests d'obtention de factures", () => {
    test("Fonctionnel", async () => {
      await factureModel.create(
        {
          numero: 3819,
          date_emission: 0,
          details: "Test Product",
          entreprise_id: 1,
          items: [
            {
              nom: "Test Item",
              prix: 12.34,
              quantite: 1,
            },
          ],
        },
        {
          include: [Item],
        },
      );

      const response = await request(app)
        .get("/aviron/api/factures")
        .auth(testsUsername, testsPassword);

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual([
        {
          date_echeance: null,
          date_emission: 0,
          date_traitement: null,
          details: "Test Product",
          entreprise: {
            adresse: "123 Main St.",
            client: "Tests Client Entreprise",
            code_postal: "H0H0H0",
            courriel: "email@tests.com",
            id: 1,
            nom: "Tests Nom Entreprise",
            pays: "Canada",
            province: "QC",
            telephone: "111-222-3333",
            ville: "Test Town",
          },
          items: [
            {
              description: null,
              id: expect.any(Number),
              nom: "Test Item",
              prix: 12.34,
              quantite: 1,
            },
          ],
          numero: 3819,
        },
      ]);
    });
  });

  describe("Tests de suppression de factures", () => {
    test("Fonctionnel", async () => {
      await factureModel.create(
        {
          numero: 5102,
          date_emission: 0,
          details: "Test Product",
          entreprise_id: 1,
          items: [
            {
              nom: "Test Item",
              prix: 12.34,
              quantite: 1,
            },
          ],
        },
        {
          include: [Item],
        },
      );

      const response = await request(app)
        .delete("/aviron/api/factures/5102")
        .auth(testsUsername, testsPassword);

      expect(response.status).toBe(204);
      expect(response.body).toStrictEqual({});
    });

    test("Erreur de validation avec l'id de facture: doit contenir une facture existante", async () => {
      await factureModel.create(
        {
          numero: 5829,
          date_emission: 0,
          details: "Test Product",
          entreprise_id: 1,
          items: [
            {
              nom: "Test Item",
              prix: 12.34,
              quantite: 1,
            },
          ],
        },
        {
          include: [Item],
        },
      );

      const response = await request(app)
        .delete("/aviron/api/factures/7372")
        .auth(testsUsername, testsPassword);

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({
        error: 'Facture "7372" non trouvée',
      });
    });
  });

  describe("Tests d'obtention de factures par id", () => {
    test("Fonctionnel", async () => {
      await factureModel.create(
        {
          numero: 9283,
          date_emission: 0,
          details: "Test Product",
          entreprise_id: 1,
          items: [
            {
              nom: "Test Item",
              prix: 12.34,
              quantite: 1,
            },
          ],
        },
        {
          include: [Item],
        },
      );

      const response = await request(app)
        .get("/aviron/api/factures/9283")
        .auth(testsUsername, testsPassword);

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        date_echeance: null,
        date_emission: 0,
        date_traitement: null,
        details: "Test Product",
        entreprise: {
          adresse: "123 Main St.",
          client: "Tests Client Entreprise",
          code_postal: "H0H0H0",
          courriel: "email@tests.com",
          id: 1,
          nom: "Tests Nom Entreprise",
          pays: "Canada",
          province: "QC",
          telephone: "111-222-3333",
          ville: "Test Town",
        },
        items: [
          {
            description: null,
            id: expect.any(Number),
            nom: "Test Item",
            prix: 12.34,
            quantite: 1,
          },
        ],
        numero: 9283,
      });
    });

    test("Erreur de validation avec l'id de facture: doit contenir une facture existante", async () => {
      await factureModel.create(
        {
          numero: 9714,
          date_emission: 0,
          details: "Test Product",
          entreprise_id: 1,
          items: [
            {
              nom: "Test Item",
              prix: 12.34,
              quantite: 1,
            },
          ],
        },
        {
          include: [Item],
        },
      );

      const response = await request(app)
        .get("/aviron/api/factures/9585")
        .auth(testsUsername, testsPassword);

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({
        error: 'Facture "9585" non trouvée',
      });
    });
  });

  describe("Tests de traitement de factures par id", () => {
    test("Fonctionnel", async () => {
      await factureModel.create(
        {
          numero: 10384,
          date_emission: 0,
          details: "Test Product",
          entreprise_id: 1,
          items: [
            {
              nom: "Test Item",
              prix: 12.34,
              quantite: 1,
            },
          ],
        },
        {
          include: [Item],
        },
      );

      const response1 = await request(app)
        .post("/aviron/api/factures/10384/traiter")
        .auth(testsUsername, testsPassword);

      expect(response1.status).toBe(204);
      expect(response1.body).toStrictEqual({});

      const response2 = await request(app)
        .get("/aviron/api/factures/10384")
        .auth(testsUsername, testsPassword);

      expect(response2.status).toBe(200);
      expect(response2.body.date_traitement).not.toBeNull();
    });

    test("Ne devrait pas mettre a jour la date si elle a déjà une valeur", async () => {
      await factureModel.create(
        {
          numero: 10217,
          date_emission: 0,
          details: "Test Product",
          entreprise_id: 1,
          items: [
            {
              nom: "Test Item",
              prix: 12.34,
              quantite: 1,
            },
          ],
        },
        {
          include: [Item],
        },
      );

      const create1 = await request(app)
        .post("/aviron/api/factures/10217/traiter")
        .auth(testsUsername, testsPassword);

      expect(create1.status).toBe(204);

      const traiter1 = await request(app)
        .post("/aviron/api/factures/10217/traiter")
        .auth(testsUsername, testsPassword);

      expect(traiter1.status).toBe(204);

      const response1 = await request(app)
        .get("/aviron/api/factures/10217")
        .auth(testsUsername, testsPassword);

      expect(response1.status).toBe(200);

      const traiter2 = await request(app)
        .post("/aviron/api/factures/10217/traiter")
        .auth(testsUsername, testsPassword);

      expect(traiter2.status).toBe(204);

      const response2 = await request(app)
        .get("/aviron/api/factures/10217")
        .auth(testsUsername, testsPassword);

      expect(response2.status).toBe(200);
      expect(response2.body).toStrictEqual(response1.body);
    });

    test("Erreur de validation avec l'id de facture: doit contenir une facture existante", async () => {
      await factureModel.create(
        {
          numero: 10503,
          date_emission: 0,
          details: "Test Product",
          entreprise_id: 1,
          items: [
            {
              nom: "Test Item",
              prix: 12.34,
              quantite: 1,
            },
          ],
        },
        {
          include: [Item],
        },
      );

      const response = await request(app)
        .post("/aviron/api/factures/10641/traiter")
        .auth(testsUsername, testsPassword);

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({
        error: 'Facture "10641" non trouvée',
      });
    });
  });

  describe("Tests de traitement de factures", () => {
    test("Fonctionnel", async () => {
      await factureModel.create(
        {
          numero: 10684,
          date_emission: 0,
          details: "Test Product",
          entreprise_id: 1,
          items: [
            {
              nom: "Test Item",
              prix: 12.34,
              quantite: 1,
            },
          ],
        },
        {
          include: [Item],
        },
      );

      const response1 = await request(app)
        .post("/aviron/api/factures/traiter")
        .auth(testsUsername, testsPassword);

      expect(response1.status).toBe(204);
      expect(response1.body).toStrictEqual({});

      const response2 = await request(app)
        .get("/aviron/api/factures/10684")
        .auth(testsUsername, testsPassword);

      expect(response2.status).toBe(200);
      expect(response2.body.date_traitement).not.toBeNull();
    });

    test("Fonctionnel sans creer de factures", async () => {
      const response = await request(app)
        .post("/aviron/api/factures/traiter")
        .auth(testsUsername, testsPassword);

      expect(response.status).toBe(204);
      expect(response.body).toStrictEqual({});
    });
  });
});

describe("Controller: entreprise", () => {
  describe("Tests d'obtention des entreprises", () => {
    test("Fonctionnel", async () => {
      const response = await request(app)
        .get("/aviron/api/entreprises")
        .auth(testsUsername, testsPassword);

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual([
        {
          adresse: "123 Main St.",
          client: "Tests Client Entreprise",
          code_postal: "H0H0H0",
          courriel: "email@tests.com",
          id: 1,
          nom: "Tests Nom Entreprise",
          pays: "Canada",
          province: "QC",
          telephone: "111-222-3333",
          ville: "Test Town",
        },
      ]);
    });
  });
});

describe("Controller: rbac", () => {
  describe("Tests d'obtention des RBAC", () => {
    test("Fonctionnel", async () => {
      const rbac = await new RBAC().getRBAC(testsUsername);

      expect(rbac).not.toBeNull();
    });

    test("Envoie une erreur car le username n'est pas trouvé", async () => {
      expect.assertions(1);

      await expect(new RBAC().getRBAC("fake")).rejects.toThrow(
        new CompteNotFoundError("fake"),
      );
    });
  });
});

import { init } from "@/controllers/init";
import { RBAC, rbacModelInit } from "@/controllers/rbac";
import { BASE_URL, app } from "@/index";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import { createHash } from "node:crypto";
import { BaseError } from "sequelize";
import request from "supertest";

const rbacModel = rbacModelInit();

jest.mock("@/database", () => {
  const { Sequelize } =
    jest.requireActual<typeof import("sequelize")>("sequelize");

  return {
    __esModule: true,
    default: new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
    }),
  };
});

const testsUsername = "odoo-tests-auth-username";
const testsPassword = "odoo-tests-auth-password";

class SequelizeBaseError extends BaseError {
  constructor(message: string) {
    super(message);

    this.name = "SequelizeBaseError";
  }
}

const fakeError = (message: string) => {
  return message;
};

beforeAll(async () => {
  await init(false);

  const sha256 = createHash("sha256");
  sha256.update(testsPassword);

  await rbacModel.create({
    username: testsUsername,
    password: sha256.digest().toString(),
    permissions: [`GET ${BASE_URL}/aviron/api/factures`].join(","),
  });
});

afterAll(async () => {
  await rbacModel.destroy({ where: {} });

  const { default: sequelize } = await import("@/database");
  await sequelize.close();

  jest.resetAllMocks();
});

describe("Auth", () => {
  test("Appels hors des path couverts fonctionnent", async () => {
    const response1 = await request(app).get(BASE_URL);

    expect(response1.status).toBe(200);

    const response2 = await request(app).get(`${BASE_URL}/api/swagger`);

    expect(response2.status).toBe(200);

    const response3 = await request(app).options("/");

    expect(response3.status).toBe(204);
  });

  test("Appel sans Basic Auth retourne un message d'authentification", async () => {
    const response = await request(app).get("/aviron/api/factures");

    expect(response.status).toBe(401);
    expect(response.body).toStrictEqual({
      error: "Vous devez être authentifié",
    });
  });

  test("Appel avec un username inexistant retourne un message d'authentification (TC_014)", async () => {
    const response = await request(app)
      .get("/aviron/api/factures")
      .auth(testsUsername + "_oops", testsPassword);

    expect(response.status).toBe(401);
    expect(response.body).toStrictEqual({
      error:
        'Le compte appartenant à "odoo-tests-auth-username_oops" n\'existe pas',
    });
  });

  test("Appel avec un mot de passe erroné retourne un message d'authentification (TC_015)", async () => {
    const response = await request(app)
      .get("/aviron/api/factures")
      .auth(testsUsername, testsPassword + "_oops");

    expect(response.status).toBe(401);
    expect(response.body).toStrictEqual({
      error: "Le mot de passe est invalide",
    });
  });

  test("Appel avec un username vide retourne un message d'authentification", async () => {
    const response = await request(app)
      .get("/aviron/api/factures")
      .auth("", testsPassword);

    expect(response.status).toBe(401);
    expect(response.body).toStrictEqual({
      error: "Nom d'utilisteur non trouvé",
    });
  });

  test("Appel avec un mot de passe vide retourne un message d'authentification", async () => {
    const response = await request(app)
      .get("/aviron/api/factures")
      .auth(testsUsername, "");

    expect(response.status).toBe(401);
    expect(response.body).toStrictEqual({
      error: "Mot de passe non trouvé",
    });
  });

  test("Appel sur un chemin non-autorisé retourne un message d'authentification (TC_016)", async () => {
    const response = await request(app)
      .delete("/aviron/api/factures/0")
      .auth(testsUsername, testsPassword);

    expect(response.status).toBe(403);
    expect(response.body).toStrictEqual({
      error: "Accès refusé sur /aviron/api/factures/0",
    });
  });

  test("Une erreur sequelize survient quand on tente de récupérer les RBAC", async () => {
    jest.spyOn(RBAC.prototype, "getRBAC").mockImplementationOnce(async () => {
      throw new SequelizeBaseError("This is an error from Sequelize");
    });

    const response = await request(app)
      .get("/aviron/api/factures")
      .auth(testsUsername, testsPassword);

    expect(response.status).toBe(500);
    expect(response.body).toStrictEqual({
      error: "This is an error from Sequelize",
    });
  });

  test("Une erreur interne survient quand on tente de récupérer les RBAC", async () => {
    jest.spyOn(RBAC.prototype, "getRBAC").mockImplementationOnce(async () => {
      throw fakeError("This is generic error");
    });

    const response = await request(app)
      .get("/aviron/api/factures")
      .auth(testsUsername, testsPassword);

    expect(response.status).toBe(500);
    expect(response.body).toStrictEqual({
      error: "This is generic error",
    });
  });
});

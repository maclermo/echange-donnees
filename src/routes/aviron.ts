/* istanbul ignore file */

import openapiSpec from "@/assets/openapi.json";
import { Entreprise } from "@/controllers/entreprise";
import { Facture } from "@/controllers/facture";
import { RBAC } from "@/controllers/rbac";
import { FactureNotFoundError, FactureValidationError } from "@/errors";
import { Router } from "express";
import path from "node:path";
import swaggerUi from "swagger-ui-express";

const err = (error: unknown) => {
  return error instanceof Error ? error.message : `${error}`;
};

const router = Router();

router.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "aviron", "index.html"));
});

router.put("/api/factures", async (req, res) => {
  try {
    const { numero, entreprise_id, details, date_echeance, items } = req.body;

    await new Facture().createFacture(
      numero,
      entreprise_id,
      details,
      date_echeance,
      items,
    );

    res.status(204).send();
  } catch (error) {
    if (error instanceof FactureValidationError) {
      res.status(400).json(error.json());
    } else {
      res.status(500).json({ error: err(error) });
    }
  }
});

router.get("/api/entreprises", async (_, res) => {
  try {
    const entreprises = await new Entreprise().getEntreprises();

    res.json(entreprises);
  } catch (error) {
    res.status(500).json({ error: err(error) });
  }
});

router.get("/api/factures", async (_, res) => {
  try {
    const factures = await new Facture().getFactures();

    res.json(factures);
  } catch (error) {
    res.status(500).json({ error: err(error) });
  }
});

router.get("/api/factures/:id", async (req, res) => {
  try {
    const facture = await new Facture().getFacture(Number(req.params.id));

    res.json(facture);
  } catch (error) {
    if (error instanceof FactureNotFoundError) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: err(error) });
    }
  }
});

router.delete("/api/factures/:id", async (req, res) => {
  try {
    await new Facture().deleteFacture(Number(req.params.id));

    res.status(204).send();
  } catch (error) {
    if (error instanceof FactureNotFoundError) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: err(error) });
    }
  }
});

router.post("/api/factures/traiter", async (_, res) => {
  try {
    await new Facture().traiterFactures();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: err(error) });
  }
});

router.post("/api/factures/:id/traiter", async (req, res) => {
  try {
    await new Facture().traiterFacture(Number(req.params.id));

    res.status(204).send();
  } catch (error) {
    if (error instanceof FactureNotFoundError) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: err(error) });
    }
  }
});

router.post("/api/rbac", async (req, res) => {
  const partedBasicAuth = Buffer.from(
    req.headers!.authorization!.replace("Basic ", "").replace("basic ", ""),
    "base64",
  ).toString();

  const rbac = await new RBAC().getRBAC(partedBasicAuth.split(":")[0]);

  const perms: string[] = rbac.getDataValue<string>("permissions").split(",");

  let paths: string[];

  try {
    paths = req.body.paths;
  } catch {
    paths = [];
  }

  let allowed = true;

  for (const path of paths) {
    if (!perms.includes(path)) {
      allowed = false;
    }
  }

  res.json({ allowed: `${allowed}` });
});

router.use("/api/swagger", swaggerUi.serve, swaggerUi.setup(openapiSpec));

export default router;

import openapiSpec from "@/assets/openapi.json";
import { getEntreprises } from "@/controllers/entreprise";
import {
  createFacture,
  deleteFacture,
  getFacture,
  getFactures,
  traiterFacture,
  traiterFactures,
} from "@/controllers/facture";
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
    const { entreprise_id, details, date_echeance, items } = req.body;

    await createFacture(entreprise_id, details, date_echeance, items);

    res.status(204).send();
  } catch (error) {
    console.log(error);

    if (error instanceof FactureValidationError) {
      res.status(400).json(error.json());
    } else {
      res.status(500).json({ error: err(error) });
    }
  }
});

router.get("/api/entreprises", async (_, res) => {
  try {
    const entreprises = await getEntreprises();

    res.json(entreprises);
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: err(error) });
  }
});

router.get("/api/factures", async (_, res) => {
  try {
    const factures = await getFactures();

    res.json(factures);
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: err(error) });
  }
});

router.get("/api/factures/:id", async (req, res) => {
  try {
    const factures = await getFacture(req.params.id);

    res.json(factures);
  } catch (error) {
    console.log(error);

    if (error instanceof FactureNotFoundError) {
      res.status(404).json({ error: error.message });
    } else {
      console.log(error);

      res.status(500).json({ error: err(error) });
    }
  }
});

router.delete("/api/factures/:id", async (req, res) => {
  try {
    await deleteFacture(req.params.id);

    res.status(204).send();
  } catch (error) {
    console.log(error);

    if (error instanceof FactureNotFoundError) {
      res.status(404).json({ error: error.message });
    } else {
      console.log(error);

      res.status(500).json({ error: err(error) });
    }
  }
});

router.post("/api/factures/traiter", async (_, res) => {
  try {
    await traiterFactures();

    res.status(204).send();
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: err(error) });
  }
});

router.post("/api/factures/:id/traiter", async (req, res) => {
  try {
    await traiterFacture(req.params.id);

    res.status(204).send();
  } catch (error) {
    console.log(error);

    if (error instanceof FactureNotFoundError) {
      res.status(404).json({ error: error.message });
    } else {
      console.log(error);

      res.status(500).json({ error: err(error) });
    }
  }
});

router.use("/api/swagger", swaggerUi.serve, swaggerUi.setup(openapiSpec));

export default router;

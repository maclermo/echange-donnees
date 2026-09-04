import { Router } from "express";
import path from "node:path";

const router = Router();

router.get("/", async (_, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "odoo", "index.html"));
});

export default router;

import { getRBAC } from "@/controllers/rbac";
import { CompteNotFoundError } from "@/errors";
import { RBAC } from "@/models/rbac";
import { NextFunction, Request, Response } from "express";
import { createHash } from "node:crypto";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isAPIPath = req.path.includes("/api/");
  const isNotSwagger = !req.path.includes("/api/swagger");
  const isNotCORS = req.method.toUpperCase() !== "OPTIONS";

  if (isAPIPath && isNotSwagger && isNotCORS) {
    // AUTHN (retourne des 401)

    const basicAuthHeader = req.headers.authorization;

    if (!basicAuthHeader) {
      res.status(401).json({ error: "Vous devez être authentifié" });
      return;
    }

    const basicAuthBase64 = basicAuthHeader
      .replace("Basic ", "")
      .replace("basic ", "");
    const partedBasicAuth = Buffer.from(basicAuthBase64, "base64").toString();
    const [username, password] = partedBasicAuth.split(":");

    if (!(username !== "" && password !== "")) {
      res
        .status(401)
        .json({ error: "Nom d'utilisteur ou mot de passe introuvés" });
      return;
    }

    let rbac: RBAC;

    try {
      rbac = await getRBAC(username);
    } catch (error) {
      if (error instanceof CompteNotFoundError) {
        res.status(401).json({ error: error.message });
        return;
      } else {
        res.status(500).send("Internal server error");
        return;
      }
    }

    const hashedPassword = createHash("sha256");
    hashedPassword.update(password);

    if (hashedPassword.digest().toString() !== rbac.password) {
      res.status(401).json({ error: "Le mot de passe est invalide" });
      return;
    }

    // AUTHZ (retourne des 403)

    const permissions: string[] = rbac.permissions.split(",");

    let match = false;

    for (const permission of permissions) {
      if (RegExp(permission).test(`${req.method} ${req.path}`)) {
        match = true;
      }
    }

    if (!match) {
      res.status(403).json({ error: `Accès refusé sur ${req.path}` });
      return;
    }
  }

  next();
};

export default authMiddleware;

import { RBAC } from "@/controllers/rbac";
import { CompteNotFoundError } from "@/errors";
import { NextFunction, Request, Response } from "express";
import { createHash } from "node:crypto";

/**
 * Permet de protéger l'accès à des pages derrière l'API.
 * Les chemins /api/swagger et les appels avec la méthode
 * OPTIONS ne sont pas visés par cette restriction.
 *
 * Dans la base de donnée figure une cellule contenant la liste
 * des routes autorisées en tant que RegEx. Cette expression est
 * évaluée avec le verbe en majuscules actuel. Exemple:
 *
 * `GET aviron/api/factures/[^/]+`
 */
const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const isAPIPath = req.path.includes("/api/");
  const isNotSwagger = !req.path.includes("/api/swagger");
  const isNotCORS = req.method.toUpperCase() !== "OPTIONS"; // Pour CORS, on doit laisser OPTIONS

  if (isAPIPath && isNotSwagger && isNotCORS) {
    /**
     * Section Authentication (authn)
     *
     * Retourne HTTP 401
     */

    // Lecture du header
    const basicAuthHeader = req.headers.authorization;

    if (!basicAuthHeader) {
      res.status(401).json({ error: "Vous devez être authentifié" });
      return;
    }

    // Récupération de la portion username et password du header
    const basicAuthBase64 = basicAuthHeader
      .replace("Basic ", "")
      .replace("basic ", "");
    const partedBasicAuth = Buffer.from(basicAuthBase64, "base64").toString();
    const [username, password] = partedBasicAuth.split(":");

    if (username === "") {
      res.status(401).json({ error: "Nom d'utilisteur introuvé" });
      return;
    }

    if (password === "") {
      res.status(401).json({ error: "Mot de passe introuvé" });
      return;
    }

    let rbac: RBAC;

    // Récupération du compte dans la BD.
    try {
      rbac = await new RBAC().getRBAC(username);
    } catch (error) {
      if (error instanceof CompteNotFoundError) {
        res.status(401).json({ error: error.message });
        return;
      } else {
        res
          .status(500)
          .json({ error: error instanceof Error ? error.message : error });
        return;
      }
    }

    // Comparaison du mot de passe en entrée et de celui dans la BD, qui est hashé.
    // Doit hasher celui en entrée pour faire la comparaison.
    const hashedPassword = createHash("sha256");
    hashedPassword.update(password);

    if (hashedPassword.digest().toString() !== rbac.password) {
      res.status(401).json({ error: "Le mot de passe est invalide" });
      return;
    }

    /**
     * Section Authorization (authz)
     *
     * Retourne HTTP 403
     */

    const permissions: string[] = rbac.permissions.split(",");

    let match = false;

    // Évaluation des permissions telles qu'identifiée dans la BD
    // contre le chemin actuel d'accès.
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

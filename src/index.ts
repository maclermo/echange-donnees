/* istanbul ignore file */

import authMiddleware from "@/auth";
import { init } from "@/controllers/init";
import avironRoutes from "@/routes/aviron";
import odooRoutes from "@/routes/odoo";
import cors from "cors";
import express from "express";
import morgan from "morgan";

const LISTEN_PORT = 8080;

export const app = express();

app.disable("etag"); // Afin d'éviter le caching côté client.
app.use(cors()); // Pour autoriser les origines.
app.use(authMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/aviron", avironRoutes); // Inclusion des routes Aviron.
app.use("/odoo", odooRoutes); // Inclusion des routes Odoo
app.use("/", (_, res) => {
  res.send(`
    <html>
      <head>
        <style>a, a:hover, a:focus, a:active { text-decoration: underline; color: inherit; }</style>
        <title>Echange de données</title>
      </head>
      <body style="font-family: Tahoma, Verdana, sans-serif; font-size: 16px">
        <p style="font-size: 24px;">Echange de données</p>
        <p><a href="http://localhost:${LISTEN_PORT}/aviron/api/swagger">Aller vers <b>/aviron/api/swagger</b></a></p>
        <p><a href="http://localhost:${LISTEN_PORT}/aviron">Aller vers <b>/aviron</b></a></p>
        <p><a href="http://localhost:${LISTEN_PORT}/odoo">Aller vers <b>/odoo</b></a></p>
      </body>
    </html>
  `);
});

if (require.main === module) {
  init(true) // Mettre la "dummy data" fin d'avoir des données à exploiter au début.
    .then(() => {
      app.listen(LISTEN_PORT, () => {
        console.log(`Listening on http://localhost:${LISTEN_PORT}/`);
      });
    })
    .catch((err) => {
      throw err;
    });
}

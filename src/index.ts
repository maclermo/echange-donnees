import authMiddleware from "@/auth";
import { init } from "@/models/init";
import avironRoutes from "@/routes/aviron";
import odooRoutes from "@/routes/odoo";
import cors from "cors";
import express from "express";
import morgan from "morgan";

const LISTEN_PORT = 8080;

const app = express();

app.use(cors());
app.use(authMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/aviron", avironRoutes);
app.use("/odoo", odooRoutes);

app.disable("etag");

init()
  .then(() => {
    app.listen(LISTEN_PORT, () => {
      console.log(
        [
          `Aviron Swagger UI: http://localhost:${LISTEN_PORT}/aviron/api/swagger`,
          `Aviron UI: http://localhost:${LISTEN_PORT}/aviron`,
          `Odoo UI: http://localhost:${LISTEN_PORT}/odoo`,
        ].join("\n"),
      );
    });
  })
  .catch((err) => {
    throw err;
  });

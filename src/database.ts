/* istanbul ignore file */

import { Sequelize } from "sequelize";

const {
  DB_SCHEME,
  DB_USERNAME,
  DB_PASSWORD,
  DB_HOSTNAME,
  DB_PORT,
  DB_DATABASE,
} = process.env;

/**
 * Permet d'utiliser une base de donnée avec des valeurs par défaut
 * et d'accepter des valeurs provenant de variables d'environnement.
 */
const sequelize = new Sequelize(
  `${DB_SCHEME ?? "postgres"}://${DB_USERNAME ?? "aviron"}:${DB_PASSWORD ?? "aviron"}@${DB_HOSTNAME ?? "localhost"}:${DB_PORT ?? "5432"}/${DB_DATABASE ?? "aviron"}`,
  { logging: false },
);

export default sequelize;

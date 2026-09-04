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

const sequelize = new Sequelize(
  `${DB_SCHEME ?? "postgres"}://${DB_USERNAME ?? "aviron"}:${DB_PASSWORD ?? "aviron"}@${DB_HOSTNAME ?? "localhost"}:${DB_PORT ?? "5432"}/${DB_DATABASE ?? "aviron"}`,
  { logging: false },
);

export default sequelize;

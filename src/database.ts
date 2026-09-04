import { Sequelize } from "sequelize";

const {
  DB_SCHEME,
  DB_USERNAME,
  DB_PASSWORD,
  DB_HOSTNAME,
  DB_PORT,
  DB_DATABASE,
  DB_USE_INMEMORY,
} = process.env;

const sequelize = DB_USE_INMEMORY
  ? new Sequelize("sqlite::memory:", {
      pool: { max: 1, idle: Infinity, maxUses: Infinity },
      logging: false,
    })
  : new Sequelize(
      `${DB_SCHEME ?? "postgres"}://${DB_USERNAME ?? "aviron"}:${DB_PASSWORD ?? "aviron"}@${DB_HOSTNAME ?? "localhost"}:${DB_PORT ?? "5432"}/${DB_DATABASE ?? "aviron"}`,
      { logging: false },
    );

export default sequelize;

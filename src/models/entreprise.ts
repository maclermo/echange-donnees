import sequelize from "@/database";
import { DataTypes, Model } from "sequelize";

export class Entreprise extends Model {
  declare nom: string;
  declare client: string;
  declare courriel: string;
  declare telephone: string;
  declare adresse: string;
  declare code_postal: string;
  declare ville: string;
  declare province: string;
  declare pays: string;
}

const entrepriseModel = Entreprise.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    client: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    courriel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telephone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    adresse: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code_postal: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ville: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    province: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pays: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, modelName: "entreprise", timestamps: false },
);

export default entrepriseModel;

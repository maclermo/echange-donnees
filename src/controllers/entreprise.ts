import sequelize from "@/database";
import { DataTypes, Model } from "sequelize";

/**
 * Est la représentation d'une entreprise.
 *
 * Clé primaire: `id`.
 */
export class Entreprise extends Model {
  declare public nom: string;
  declare public client: string;
  declare public courriel: string;
  declare public telephone: string;
  declare public adresse: string;
  declare public code_postal: string;
  declare public ville: string;
  declare public province: string;
  declare public pays: string;

  public async getEntreprises(): Promise<Entreprise[]> {
    return await Entreprise.findAll();
  }
}

export const entrepriseModelInit = () => {
  return Entreprise.init(
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
};

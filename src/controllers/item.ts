import sequelize from "@/database";
import { DataTypes, Model } from "sequelize";

/**
 * Est une représentation d'un item qui est référencé
 * par le champ `facture_numero` par une FOREIGN KEY.
 *
 * Clé primaire: `id`.
 */
export class Item extends Model {
  declare public nom: string;
  declare public description: string;
  declare public quantite: number;
  declare public prix: number;
}

export const itemModelInit = () => {
  return Item.init(
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
      description: {
        type: DataTypes.STRING,
      },
      prix: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "item",
      timestamps: false,
    },
  );
};

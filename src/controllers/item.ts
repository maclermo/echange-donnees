import sequelize from "@/database";
import { DataTypes, Model } from "sequelize";

export class Item extends Model {
  declare public nom: string;
  declare public description: string;
  declare public quantite: number;
  declare public prix: number;
}

export const itemModelInit = () => {
  return Item.init(
    {
      facture_numero: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
      },
      quantite: {
        type: DataTypes.FLOAT,
        allowNull: false,
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
      defaultScope: { attributes: { exclude: ["facture_numero"] } },
    },
  );
};

import sequelize from "@/database";
import { DataTypes, Model } from "sequelize";

export class Item extends Model {
  declare nom: string;
  declare description: string;
  declare quantite: number;
  declare prix: number;
}

const itemModel = Item.init(
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

export default itemModel;

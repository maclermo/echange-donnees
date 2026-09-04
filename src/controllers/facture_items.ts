import sequelize from "@/database";
import { DataTypes, Model } from "sequelize";

/**
 * Ce modèle sert de table intermédiaire afin de pouvoir avoir une relation one-to-many
 * entre les factures et les items. Permet de faire des modifications par la suite.
 *
 * Clé primaire: `id`.
 */
export class FactureItemModel extends Model {}

export const factureItemModelInit = () => {
  return FactureItemModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      facture_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantite: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "facture_item",
      timestamps: false,
    },
  );
};

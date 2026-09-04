import sequelize from "@/database";
import { DataTypes, Model } from "sequelize";

export class Facture extends Model {
  declare numero: number;
  declare details: string;
  declare date_echeance: number;
  declare date_emission: number;
  declare date_traitement: number;
}

const factureModel = Facture.init(
  {
    numero: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    entreprise_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    details: {
      type: DataTypes.STRING,
    },
    date_echeance: {
      type: DataTypes.DATE,
      get() {
        return Date.parse(this.getDataValue("date_echeance"));
      },
    },
    date_emission: {
      type: DataTypes.DATE,
      allowNull: false,
      get() {
        return Date.parse(this.getDataValue("date_emission"));
      },
    },
    date_traitement: {
      type: DataTypes.DATE,
      get() {
        return Date.parse(this.getDataValue("date_traitement"));
      },
    },
  },
  {
    sequelize,
    modelName: "facture",
    timestamps: false,
    defaultScope: { attributes: { exclude: ["entreprise_id"] } },
  },
);

export default factureModel;

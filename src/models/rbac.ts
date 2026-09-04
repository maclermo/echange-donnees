import sequelize from "@/database";
import { DataTypes, Model } from "sequelize";

export class RBAC extends Model {
  declare username: string;
  declare password: string;
  declare permissions: string;
}

const rbacModel = RBAC.init(
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    permissions: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, modelName: "rbac", timestamps: false },
);

export default rbacModel;

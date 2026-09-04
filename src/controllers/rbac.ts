import sequelize from "@/database";
import { CompteNotFoundError } from "@/errors";
import { DataTypes, Model } from "sequelize";

export class RBAC extends Model {
  declare public username: string;
  declare public password: string;
  declare public permissions: string;

  public async getRBAC(username: string): Promise<RBAC> {
    const rbac = await RBAC.findByPk(username);

    if (!rbac) {
      throw new CompteNotFoundError(username);
    }

    return rbac;
  }
}

export const rbacModelInit = () => {
  return RBAC.init(
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
};

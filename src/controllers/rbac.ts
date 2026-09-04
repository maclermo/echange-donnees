import { CompteNotFoundError } from "@/errors";
import rbacModel, { RBAC } from "@/models/rbac";

export const getRBAC = async (username: string) => {
  let rbac: RBAC | null;

  try {
    rbac = await rbacModel.findByPk(username);
  } catch (error) {
    console.log(error);
  }

  if (!rbac!) {
    throw new CompteNotFoundError(username);
  }

  return rbac;
};

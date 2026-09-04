import entrepriseModel from "@/models/entreprise";

export const getEntreprises = async () => {
  return await entrepriseModel.findAll();
};

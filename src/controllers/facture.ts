import { getEntreprises } from "@/controllers/entreprise";
import { FactureNotFoundError, FactureValidationError } from "@/errors";
import { Entreprise } from "@/models/entreprise";
import factureModel, { Facture } from "@/models/facture";
import { Item } from "@/models/item";

export const createFacture = async (
  entreprise_id: number,
  details: string,
  date_echeance: number,
  items: Item[],
) => {
  if (items) {
    if (!items.length) {
      throw new FactureValidationError(
        "items",
        "La facture doit avoir des items",
      );
    }

    for (const [i, item] of items.entries()) {
      if (!item.nom) {
        throw new FactureValidationError("nom", "doit contenir une valeur");
      }

      if (!item.quantite) {
        throw new FactureValidationError(
          `items[${i}].quantite`,
          "doit contenir une valeur",
        );
      }

      if (typeof item.quantite !== "number") {
        throw new FactureValidationError(
          `items[${i}].quantite`,
          "doit être de type number",
        );
      }

      if (!item.prix) {
        throw new FactureValidationError(
          `items[${i}].prix`,
          "doit contenir une valeur",
        );
      }

      if (typeof item.prix !== "number") {
        throw new FactureValidationError(
          `items[${i}].prix`,
          "doit être de type number",
        );
      }
    }
  }

  if (date_echeance && typeof date_echeance !== "number") {
    throw new FactureValidationError(
      "date_echeance",
      `doit être une date valide au format timestamp`,
    );
  }

  if (!entreprise_id) {
    throw new FactureValidationError(
      "entreprise_id",
      `doit contenir une entreprise`,
    );
  }

  let entreprises: Entreprise[];

  try {
    entreprises = await getEntreprises();
  } catch {
    // on ignore car on ne veut pas rapporter des erreurs de l'obtention d'une entreprise
  }

  if (
    !entreprises! ||
    !entreprises.find((e) => e.getDataValue<string>("id") === entreprise_id)
  ) {
    throw new FactureValidationError(
      "entreprise_id",
      `l'entreprise doit exister`,
    );
  }

  return await factureModel.create(
    {
      entreprise_id,
      details,
      date_echeance,
      items,
      date_emission: new Date(),
    },
    {
      include: [Item],
    },
  );
};

export const getFactures = async () => {
  return await factureModel.findAll({
    include: [Entreprise, Item],
  });
};

export const deleteFacture = async (id: string) => {
  let facture: Facture | null;

  try {
    facture = await factureModel.findByPk(id, {
      include: [Item],
      order: [["numero", "DESC"]],
    });
  } catch (error) {
    console.log(error);
  }

  if (!facture!) {
    throw new FactureNotFoundError(id);
  }

  await facture.destroy();
};

export const getFacture = async (id: string) => {
  let facture: Facture | null;

  try {
    facture = await factureModel.findByPk(id, {
      include: [Entreprise, Item],
      order: [["numero", "DESC"]],
    });
  } catch (error) {
    console.log(error);
  }

  if (!facture!) {
    throw new FactureNotFoundError(id);
  }

  return facture;
};

export const traiterFacture = async (id: string) => {
  const facture = await getFacture(id);

  if (!facture) {
    return null;
  }

  await facture.update({
    date_traitement: new Date(),
  });
};

export const traiterFactures = async () => {
  const factures = await getFactures();

  if (factures.length === 0) {
    return null;
  }

  for (const facture of factures) {
    const id: string | undefined = facture.getDataValue("numero");

    await traiterFacture(id!);
  }
};

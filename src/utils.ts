import { Facture } from "@/controllers/facture";
import { FactureItemModel } from "@/controllers/facture_items";
import { Item } from "@/controllers/item";
import sequelize from "@/database";

/**
 * Permet de créer une facture avec un gestionnaire de transaction.
 */
export const createFactureWithItems = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  factureData: any,
  itemsData: Item[],
) => {
  return await sequelize.transaction(async (t) => {
    const facture = await Facture.create(factureData, {
      transaction: t,
    });

    for (const itemData of itemsData) {
      const { quantite, ...fields } = itemData;

      const [item] = await Item.findOrCreate({
        where: { nom: fields.nom },
        defaults: fields,
        transaction: t,
      });

      await FactureItemModel.create(
        {
          facture_id: facture.getDataValue("facture_id"),
          item_id: item.getDataValue("item_id"),
          quantite: quantite,
        },
        {
          transaction: t,
        },
      );
    }
  });
};

/**
 * Permet de mettre les quantites au meme niveau que la description des produits.
 */
export const formatFacture = (facture: Facture) => {
  const fact = facture.get({ plain: true });

  fact.items = fact.items.map(
    (item: Item & { facture_item?: { quantite: number } }) => {
      const quantite = item.facture_item!.quantite;
      delete item.facture_item;

      return {
        ...item,
        quantite,
      };
    },
  );

  return fact;
};

/**
 * Permet de s'assurer qu'un champ est bien un nombre entier ou à virgule.
 * Nous devons accepter à la fois un string et un number car les
 * champs `<input>` renvoient tous les entiers au format `string`
 */
export const isNumerical = (element: number | string): boolean => {
  if (typeof element === "string" && element.trim() === "") {
    return false;
  }

  return !isNaN(Number(element));
};

/**
 * Permet de s'assurer qu'un champ est bien un nombre entier.
 * Nous devons accepter à la fois un string et un number car les
 * champs `<input>` renvoient tous les entiers au format `string`
 */
export const isPositiveInteger = (value: string | number): boolean => {
  return /^\d+$/.test(value.toString()) && Number(value) >= 0;
};

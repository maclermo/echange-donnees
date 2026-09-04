import { Entreprise } from "@/controllers/entreprise";
import { Item } from "@/controllers/item";
import sequelize from "@/database";
import { FactureNotFoundError, FactureValidationError } from "@/errors";
import {
  createFactureWithItems,
  formatFacture,
  isNumerical,
  isPositiveInteger,
} from "@/utils";
import { DataTypes, Model } from "sequelize";

/**
 * Est la représentation d'une facture dont l'entreprise est référencée
 * par un champ externe `entreprise_id` par une FOREIGN KEY.
 *
 * Clé primaire: `numero`
 */
export class Facture extends Model {
  declare public numero: number;
  declare public details: string;
  declare public date_echeance: number;
  declare public date_emission: number;
  declare public date_traitement: number;
  declare public items: Item[];

  public async createFacture(
    numero: number | string,
    entreprise_id: number | string,
    details: string,
    date_echeance: number | string,
    items: Item[],
  ) {
    // Ne pas autoriser un numéro absent
    if (!numero) {
      throw new FactureValidationError(`numero`, "doit contenir une valeur");
    }

    // Ne pas autoriser un numéro qui n'est pas un `number`.
    if (!isPositiveInteger(numero)) {
      throw new FactureValidationError(`numero`, "doit être de type number");
    }

    if (items) {
      // Ne pas autoriser des items sans éléments.
      if (!items.length) {
        throw new FactureValidationError(
          "items",
          "La facture doit avoir des items",
        );
      }

      // Ne pas autoriser des items sans nom de produit.
      for (const [i, item] of items.entries()) {
        if (!item.nom) {
          throw new FactureValidationError(
            `items[${i}].nom`,
            "doit contenir une valeur",
          );
        }

        // Ne pas autoriser des items sans quantité.
        if (!item.quantite) {
          throw new FactureValidationError(
            `items[${i}].quantite`,
            "doit contenir une valeur",
          );
        }

        // Ne pas autoriser des items dont la quantité n'est pas un `number`.
        if (!isNumerical(item.quantite)) {
          throw new FactureValidationError(
            `items[${i}].quantite`,
            "doit être de type number",
          );
        }

        // Ne pas autoriser des items sans prix.
        if (!item.prix) {
          throw new FactureValidationError(
            `items[${i}].prix`,
            "doit contenir une valeur",
          );
        }

        // Ne pas autoriser des items dont le prix n'est pas un `number`.
        if (!isNumerical(item.prix)) {
          throw new FactureValidationError(
            `items[${i}].prix`,
            "doit être de type number",
          );
        }
      }
    } else {
      throw new FactureValidationError(
        "items",
        "La facture doit avoir des items",
      );
    }

    // Ne pas autoriser une date absente ou qui n'est pas timestamp.
    if (date_echeance && typeof date_echeance !== "number") {
      throw new FactureValidationError(
        "date_echeance",
        `doit être une date valide au format timestamp`,
      );
    }

    // La date ne doit pas être dans le passé.
    if (date_echeance && Number(date_echeance) < Date.now()) {
      throw new FactureValidationError(
        "date_echeance",
        `doit être dans le futur`,
      );
    }

    // Ne pas autoriser d'omettre l'entreprise_id.
    if (!entreprise_id) {
      throw new FactureValidationError(
        "entreprise_id",
        `doit contenir une entreprise`,
      );
    }

    let entreprises: Entreprise[];

    try {
      entreprises = await new Entreprise().getEntreprises();
    } catch {
      // on ignore car on ne veut pas rapporter des erreurs de l'obtention d'une entreprise
    }

    // Vérification de si l'entreprise existe dans la BD.
    if (
      !entreprises! ||
      !entreprises.find((e) => e.getDataValue<string>("id") === entreprise_id)
    ) {
      throw new FactureValidationError(
        "entreprise_id",
        `l'entreprise doit exister`,
      );
    }
    // Création de la facture si la validation passe.
    await createFactureWithItems(
      {
        numero,
        entreprise_id,
        details,
        date_echeance,
        date_emission: new Date(),
      },
      items,
    );
  }

  public async getFactures(): Promise<Facture[]> {
    const factures = await Facture.findAll({
      include: [
        { model: Entreprise, as: "entreprise" },
        { model: Item, as: "items", through: { attributes: ["quantite"] } },
      ],
    });

    return factures.map((facture) => formatFacture(facture));
  }

  public async deleteFacture(id: number): Promise<void> {
    const facture = await Facture.findByPk(id);

    if (!facture) {
      throw new FactureNotFoundError(id);
    }

    await facture.destroy();
  }

  public async getFacture(id: number): Promise<Facture> {
    const facture = await Facture.findByPk(id, {
      include: [
        { model: Entreprise, as: "entreprise" },
        { model: Item, as: "items", through: { attributes: ["quantite"] } },
      ],
    });

    if (!facture) {
      throw new FactureNotFoundError(id);
    }

    return formatFacture(facture);
  }

  public async traiterFacture(id: number): Promise<void> {
    const facture = await Facture.findByPk(id);

    if (!facture) {
      throw new FactureNotFoundError(id);
    }

    if (!facture.getDataValue("date_traitement")) {
      await facture.update({
        date_traitement: new Date(),
      });
    }
  }

  public async traiterFactures(): Promise<void> {
    const factures = await Facture.findAll();

    if (factures.length === 0) {
      return;
    }

    for (const facture of factures) {
      const id = facture.getDataValue("id");

      await this.traiterFacture(id);
    }
  }
}

export const factureModelInit = () => {
  return Facture.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      numero: {
        type: DataTypes.INTEGER,
        unique: true,
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
          const date = this.getDataValue("date_traitement");
          return date ? Date.parse(date) : null;
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
};

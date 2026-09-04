import { Entreprise } from "@/controllers/entreprise";
import { Item } from "@/controllers/item";
import sequelize from "@/database";
import { FactureNotFoundError, FactureValidationError } from "@/errors";
import { DataTypes, Model } from "sequelize";

export class Facture extends Model {
  declare public numero: number;
  declare public details: string;
  declare public date_echeance: number;
  declare public date_emission: number;
  declare public date_traitement: number;
  declare public items: Item[];

  public async createFacture(
    entreprise_id: number,
    details: string,
    date_echeance: number,
    items: Item[],
  ): Promise<Facture> {
    if (items) {
      if (!items.length) {
        throw new FactureValidationError(
          "items",
          "La facture doit avoir des items",
        );
      }

      for (const [i, item] of items.entries()) {
        if (!item.nom) {
          throw new FactureValidationError(
            `items[${i}].nom`,
            "doit contenir une valeur",
          );
        }

        if (!item.quantite) {
          throw new FactureValidationError(
            `items[${i}].quantite`,
            "doit contenir une valeur",
          );
        }

        const isQuantiteNumber =
          parseFloat(item.quantite.toString()).toString() ==
          item.quantite.toString();

        if (!isQuantiteNumber) {
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

        const isPrixNumber =
          parseFloat(item.prix.toString()).toString() == item.prix.toString();

        if (!isPrixNumber) {
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

    if (date_echeance && typeof date_echeance !== "number") {
      throw new FactureValidationError(
        "date_echeance",
        `doit être une date valide au format timestamp`,
      );
    }

    if (date_echeance && date_echeance < Date.now()) {
      throw new FactureValidationError(
        "date_echeance",
        `doit être dans le futur`,
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
      entreprises = await new Entreprise().getEntreprises();
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

    return await Facture.create(
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
  }

  public async getFactures(): Promise<Facture[]> {
    return await Facture.findAll({
      include: [Entreprise, Item],
    });
  }

  public async deleteFacture(id: number): Promise<void> {
    const facture = await Facture.findByPk(id, {
      include: [Item],
      order: [["numero", "DESC"]],
    });

    if (!facture) {
      throw new FactureNotFoundError(id);
    }

    await facture.destroy();
  }

  public async getFacture(id: number): Promise<Facture> {
    const facture = await Facture.findByPk(id, {
      include: [Entreprise, Item],
      order: [["numero", "DESC"]],
    });

    if (!facture) {
      throw new FactureNotFoundError(id);
    }

    return facture;
  }

  public async traiterFacture(id: number): Promise<void> {
    const facture = await this.getFacture(id);

    if (!facture.getDataValue("date_traitement")) {
      await facture.update({
        date_traitement: new Date(),
      });
    }
  }

  public async traiterFactures(): Promise<void> {
    const factures = await this.getFactures();

    if (factures.length === 0) {
      return;
    }

    for (const facture of factures) {
      const id = facture.getDataValue("numero");

      await this.traiterFacture(id);
    }
  }
}

export const factureModelInit = () => {
  return Facture.init(
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
};

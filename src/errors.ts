type TError = { error: string };

export class CompteNotFoundError extends Error {
  constructor(username: string) {
    super(`Le compte appartenant à "${username}" n'existe pas`);

    this.name = "CompteNotFoundError";
  }
}

export class FactureNotFoundError extends Error {
  constructor(factureID: number) {
    super(`Facture "${factureID}" non trouvée`);

    this.name = "FactureNotFoundError";
  }
}

export class FactureValidationError extends Error {
  constructor(champ: string, validation: string) {
    super(`Le champ "${champ}" n'est pas valide: ${validation}`);

    this.name = "FactureValidationError";
  }

  json(): TError {
    return {
      error: this.message,
    };
  }
}

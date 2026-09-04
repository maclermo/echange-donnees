CREATE TABLE IF NOT EXISTS "entreprises" (
	"id" SERIAL NOT NULL,
	"nom" VARCHAR(255) NOT NULL,
	"client" VARCHAR(255) NOT NULL,
	"courriel" VARCHAR(255) NOT NULL,
	"telephone" VARCHAR(255) NOT NULL,
	"adresse" VARCHAR(255) NOT NULL,
	"code_postal" VARCHAR(255) NOT NULL,
	"ville" VARCHAR(255) NOT NULL,
	"province" VARCHAR(255) NOT NULL,
	"pays" VARCHAR(255) NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "factures" (
	"id" SERIAL NOT NULL,
	"numero" INTEGER NULL DEFAULT NULL,
	"entreprise_id" INTEGER NOT NULL,
	"details" VARCHAR(255) NULL DEFAULT NULL,
	"date_echeance" TIMESTAMPTZ NULL DEFAULT NULL,
	"date_emission" TIMESTAMPTZ NOT NULL,
	"date_traitement" TIMESTAMPTZ NULL DEFAULT NULL,
	PRIMARY KEY ("id"),
	UNIQUE ("numero"),
	CONSTRAINT "factures_entreprise_id_fkey" FOREIGN KEY ("entreprise_id") REFERENCES "entreprises" ("id") ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "items" (
	"id" SERIAL NOT NULL,
	"facture_numero" INTEGER NOT NULL,
	"nom" VARCHAR(255) NOT NULL,
	"description" VARCHAR(255) NULL DEFAULT NULL,
	"quantite" DOUBLE PRECISION NOT NULL,
	"prix" DOUBLE PRECISION NOT NULL,
	PRIMARY KEY ("id"),
	CONSTRAINT "items_facture_numero_fkey" FOREIGN KEY ("facture_numero") REFERENCES "factures" ("id") ON UPDATE CASCADE ON DELETE CASCADE
);

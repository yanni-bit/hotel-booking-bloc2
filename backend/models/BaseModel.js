// ============================================================================
// FICHIER : BaseModel.js
// DESCRIPTION : Classe mère des modèles d'accès aux données
// AUTEUR : Yannick
// ============================================================================
// Les modèles de l'application répétaient les mêmes quatre requêtes : lire
// toutes les lignes d'une table, en lire une par sa clé, insérer, supprimer.
// Seuls changeaient le nom de la table et celui de la clé primaire.
//
// Cette classe factorise ces requêtes. Chaque modèle enfant déclare ce qui le
// distingue (table, clé primaire, colonnes modifiables, ordre d'affichage) et
// hérite du reste. Il redéfinit une méthode uniquement quand son comportement
// diffère réellement, par exemple Service.getById qui a besoin d'une jointure
// vers la catégorie.
//
// Point de mécanique JavaScript : dans une méthode statique, `this` désigne la
// classe qui appelle, pas celle où la méthode est écrite. `this.table` dans
// BaseModel.getById vaut donc "CATEGORIE_SERVICE" quand l'appel part de
// CategorieService, et "messages_contact" quand il part de Contact. C'est ce
// qui permet d'écrire la requête une seule fois.
//
// Sécurité : un nom de table ou de colonne ne peut pas être passé en
// paramètre préparé (?), la syntaxe SQL ne l'autorise pas. Ces noms ne
// proviennent donc jamais de la requête HTTP : ils sont lus dans les
// propriétés statiques déclarées en dur dans chaque modèle enfant. Les
// valeurs, elles, restent systématiquement passées en paramètres préparés.
// ============================================================================

const db = require("../config/database");

class BaseModel {
  // ==========================================================================
  // CONTRAT À REMPLIR PAR LES CLASSES ENFANTS
  // ==========================================================================

  /**
   * Nom de la table SQL. Obligatoire dans chaque enfant.
   * @returns {string}
   */
  static get table() {
    throw new Error(
      `${this.name} doit déclarer une propriété statique "table"`,
    );
  }

  /**
   * Nom de la colonne clé primaire. Obligatoire dans chaque enfant.
   * @returns {string}
   */
  static get clePrimaire() {
    throw new Error(
      `${this.name} doit déclarer une propriété statique "clePrimaire"`,
    );
  }

  /**
   * Colonnes que create() et update() ont le droit d'écrire.
   * Cette liste blanche est la seule source des noms de colonnes injectés
   * dans le SQL : une clé inconnue envoyée par le client est ignorée.
   * @returns {string[]}
   */
  static get champs() {
    return [];
  }

  /**
   * Clause ORDER BY appliquée par getAll(), sans le mot-clé.
   * Vaut null quand aucun ordre particulier n'est requis.
   * @returns {string|null}
   */
  static get ordreParDefaut() {
    return null;
  }

  // ==========================================================================
  // MÉTHODES DE LECTURE (READ)
  // ==========================================================================

  /**
   * Récupère toutes les lignes de la table.
   * @param {function} callback - Fonction de rappel (err, results)
   */
  static getAll(callback) {
    const ordre = this.ordreParDefaut ? `ORDER BY ${this.ordreParDefaut}` : "";
    const query = `SELECT * FROM ${this.table} ${ordre}`;

    db.query(query, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  /**
   * Récupère une ligne par sa clé primaire.
   * Renvoie null quand rien ne correspond : l'absence n'est pas une erreur
   * technique, c'est à la route de décider si elle répond 404.
   * @param {number} id - Valeur de la clé primaire
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static getById(id, callback) {
    const query = `SELECT * FROM ${this.table} WHERE ${this.clePrimaire} = ?`;

    db.query(query, [id], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results[0] || null);
    });
  }

  // ==========================================================================
  // MÉTHODE DE CRÉATION (CREATE)
  // ==========================================================================

  /**
   * Insère une ligne à partir des champs autorisés présents dans data.
   * @param {Object} data - Données à insérer
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static create(data, callback) {
    const colonnes = this.champs.filter((champ) => data[champ] !== undefined);

    if (colonnes.length === 0) {
      return callback(new Error("Aucun champ valide à enregistrer"), null);
    }

    const valeurs = colonnes.map((champ) => data[champ]);
    const marqueurs = colonnes.map(() => "?").join(", ");
    const query = `
      INSERT INTO ${this.table} (${colonnes.join(", ")})
      VALUES (${marqueurs})
    `;

    db.query(query, valeurs, (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, { [this.clePrimaire]: result.insertId, ...data });
    });
  }

  // ==========================================================================
  // MÉTHODE DE MISE À JOUR (UPDATE)
  // ==========================================================================

  /**
   * Met à jour les champs autorisés présents dans data.
   * @param {number} id - Valeur de la clé primaire
   * @param {Object} data - Nouvelles valeurs
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static update(id, data, callback) {
    const colonnes = this.champs.filter((champ) => data[champ] !== undefined);

    if (colonnes.length === 0) {
      return callback(new Error("Aucun champ valide à mettre à jour"), null);
    }

    const affectations = colonnes.map((champ) => `${champ} = ?`).join(", ");
    const valeurs = colonnes.map((champ) => data[champ]);
    const query = `
      UPDATE ${this.table}
      SET ${affectations}
      WHERE ${this.clePrimaire} = ?
    `;

    db.query(query, [...valeurs, id], (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  }

  // ==========================================================================
  // MÉTHODE DE SUPPRESSION (DELETE)
  // ==========================================================================

  /**
   * Supprime une ligne par sa clé primaire.
   * @param {number} id - Valeur de la clé primaire
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static delete(id, callback) {
    const query = `DELETE FROM ${this.table} WHERE ${this.clePrimaire} = ?`;

    db.query(query, [id], (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  }
}

module.exports = BaseModel;

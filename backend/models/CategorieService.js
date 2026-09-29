// ============================================================================
// FICHIER : CategorieService.js
// DESCRIPTION : Modèle d'accès aux catégories de services additionnels
// AUTEUR : Yannick
// ============================================================================
// Une catégorie regroupe des services par nature : Restauration, Bien-être,
// Transport... Elle est distincte du mode de tarification porté par
// `services_additionnels.type_service`, qui pilote le calcul des prix et ne
// doit pas être confondu avec elle.
//
// La contrainte de clé étrangère est en ON DELETE RESTRICT : la base refuse
// de supprimer une catégorie encore rattachée à un service. Ce modèle traduit
// ce refus en message lisible plutôt que de laisser remonter l'erreur MySQL.
// ============================================================================

const db = require("../config/database");

class CategorieService {
  // ==========================================================================
  // MÉTHODES DE LECTURE (READ)
  // ==========================================================================

  /**
   * Récupère les catégories actives, dans leur ordre d'affichage.
   * Destinée au site public et aux listes déroulantes.
   * @param {function} callback - Fonction de rappel (err, results)
   */
  static getAll(callback) {
    const query = `
      SELECT id_categorie, code_categorie, nom_categorie, ordre_affichage
      FROM CATEGORIE_SERVICE
      WHERE actif = 1
      ORDER BY ordre_affichage, nom_categorie
    `;

    db.query(query, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  /**
   * Récupère toutes les catégories, actives ou non, avec le nombre de
   * services rattachés à chacune.
   *
   * Ce comptage sert l'écran d'administration : il indique d'un coup d'œil
   * quelles catégories sont supprimables et lesquelles ne le sont pas.
   *
   * @param {function} callback - Fonction de rappel (err, results)
   */
  static getAllAdmin(callback) {
    const query = `
      SELECT
        c.id_categorie,
        c.code_categorie,
        c.nom_categorie,
        c.ordre_affichage,
        c.actif,
        COUNT(s.id_service) AS nb_services
      FROM CATEGORIE_SERVICE c
      LEFT JOIN SERVICES_ADDITIONNELS s ON s.id_categorie = c.id_categorie
      GROUP BY c.id_categorie
      ORDER BY c.ordre_affichage, c.nom_categorie
    `;

    db.query(query, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  /**
   * Récupère une catégorie par son identifiant.
   * @param {number} categorieId - ID de la catégorie
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static getById(categorieId, callback) {
    const query = `
      SELECT * FROM CATEGORIE_SERVICE
      WHERE id_categorie = ?
    `;

    db.query(query, [categorieId], (err, results) => {
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
   * Crée une catégorie.
   *
   * Le code est normalisé ici plutôt que côté client : minuscules, espaces et
   * tirets remplacés par des soulignés, accents retirés. Un code stable est ce
   * qui permet de référencer une catégorie sans dépendre de son libellé, qui
   * peut être renommé.
   *
   * @param {Object} data - Données de la catégorie
   * @param {string} data.nom_categorie - Libellé affiché
   * @param {string} [data.code_categorie] - Code technique, déduit du nom sinon
   * @param {number} [data.ordre_affichage] - Ordre, 0 par défaut
   * @param {number} [data.actif] - 1 par défaut
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static create(data, callback) {
    const code = CategorieService.normaliserCode(
      data.code_categorie || data.nom_categorie,
    );

    const query = `
      INSERT INTO CATEGORIE_SERVICE
      (code_categorie, nom_categorie, ordre_affichage, actif)
      VALUES (?, ?, ?, ?)
    `;

    const values = [
      code,
      data.nom_categorie,
      data.ordre_affichage !== undefined ? data.ordre_affichage : 0,
      data.actif !== undefined ? data.actif : 1,
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return callback(new Error("Une catégorie porte déjà ce code"), null);
        }
        return callback(err, null);
      }
      callback(null, { id_categorie: result.insertId, code_categorie: code });
    });
  }

  // ==========================================================================
  // MÉTHODE DE MODIFICATION (UPDATE)
  // ==========================================================================

  /**
   * Modifie une catégorie.
   *
   * Le code n'est pas modifiable : il sert de référence stable. Seuls le
   * libellé, l'ordre et l'activité changent.
   *
   * @param {number} categorieId - ID de la catégorie
   * @param {Object} data - Nouvelles valeurs
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static update(categorieId, data, callback) {
    const query = `
      UPDATE CATEGORIE_SERVICE
      SET nom_categorie = ?, ordre_affichage = ?, actif = ?
      WHERE id_categorie = ?
    `;

    const values = [
      data.nom_categorie,
      data.ordre_affichage !== undefined ? data.ordre_affichage : 0,
      data.actif !== undefined ? data.actif : 1,
      categorieId,
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        return callback(err, null);
      }
      if (result.affectedRows === 0) {
        return callback(new Error("Catégorie non trouvée"), null);
      }
      callback(null, result);
    });
  }

  // ==========================================================================
  // MÉTHODE DE SUPPRESSION (DELETE)
  // ==========================================================================

  /**
   * Supprime une catégorie.
   *
   * La suppression est refusée par la base si des services y sont rattachés,
   * au titre de la contrainte ON DELETE RESTRICT. On traduit le code d'erreur
   * MySQL en message compréhensible : c'est une règle métier, pas un incident.
   *
   * @param {number} categorieId - ID de la catégorie
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static delete(categorieId, callback) {
    const query = `DELETE FROM CATEGORIE_SERVICE WHERE id_categorie = ?`;

    db.query(query, [categorieId], (err, result) => {
      if (err) {
        if (err.code === "ER_ROW_IS_REFERENCED_2") {
          return callback(
            new Error(
              "Cette catégorie est utilisée par au moins un service et ne peut pas être supprimée",
            ),
            null,
          );
        }
        return callback(err, null);
      }
      if (result.affectedRows === 0) {
        return callback(new Error("Catégorie non trouvée"), null);
      }
      callback(null, result);
    });
  }

  // ==========================================================================
  // UTILITAIRE
  // ==========================================================================

  /**
   * Transforme un libellé en code technique.
   * « Confort du séjour » devient « confort_du_sejour ».
   * @param {string} texte - Libellé de départ
   * @returns {string} Code normalisé, limité à 30 caractères
   */
  static normaliserCode(texte) {
    return String(texte || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 30);
  }
}

module.exports = CategorieService;

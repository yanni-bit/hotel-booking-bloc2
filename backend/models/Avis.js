// ============================================================================
// AVIS.JS - MODÈLE AVIS
// ============================================================================
// Ce modèle gère toutes les opérations CRUD sur les avis clients.
// Pattern utilisé : Classe statique (méthodes sans instanciation)
// Sécurité : Requêtes préparées (?) pour prévenir les injections SQL
// ============================================================================

const db = require("../config/database");

class Avis {
  // ==========================================================================
  // MÉTHODES DE LECTURE (READ)
  // ==========================================================================

  /**
   * Récupère les avis d'un hôtel spécifique
   * @param {number} hotelId - ID de l'hôtel
   * @param {function} callback - Fonction de rappel (err, results)
   */
  static getByHotelId(hotelId, callback) {
    const query = `
      SELECT 
        a.*,
        u.prenom_user,
        u.nom_user,
        DATE_FORMAT(a.date_avis, '%d/%m/%Y') as date_formatted
      FROM AVIS a
      LEFT JOIN utilisateur u ON a.id_user = u.id_user
      WHERE a.id_hotel = ?
      ORDER BY a.date_avis DESC
      LIMIT 10
    `;

    db.query(query, [hotelId], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  /**
   * Récupère un avis par son ID
   * @param {number} avisId - ID de l'avis
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static getById(avisId, callback) {
    const query = `
      SELECT 
        a.*,
        h.nom_hotel,
        u.prenom_user,
        u.nom_user
      FROM AVIS a
      LEFT JOIN hotel h ON a.id_hotel = h.id_hotel
      LEFT JOIN utilisateur u ON a.id_user = u.id_user
      WHERE a.id_avis = ?
    `;

    db.query(query, [avisId], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      if (results.length === 0) {
        return callback(new Error("Avis non trouvé"), null);
      }
      callback(null, results[0]);
    });
  }

  /**
   * Récupère tous les avis (administration)
   * @param {function} callback - Fonction de rappel (err, results)
   */
  static getAll(callback) {
    const query = `
      SELECT 
        a.*,
        h.nom_hotel,
        h.ville_hotel,
        u.prenom_user,
        u.nom_user,
        u.email_user,
        DATE_FORMAT(a.date_avis, '%d/%m/%Y') as date_formatted
      FROM AVIS a
      LEFT JOIN hotel h ON a.id_hotel = h.id_hotel
      LEFT JOIN utilisateur u ON a.id_user = u.id_user
      ORDER BY a.date_avis DESC
    `;

    db.query(query, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  /**
   * Récupère les avis récents (7 derniers jours)
   * @param {function} callback - Fonction de rappel (err, results)
   */
  static getRecent(callback) {
    const query = `
      SELECT 
        a.*,
        h.nom_hotel,
        h.ville_hotel,
        u.prenom_user,
        u.nom_user,
        u.email_user,
        DATE_FORMAT(a.date_avis, '%d/%m/%Y') as date_formatted
      FROM AVIS a
      LEFT JOIN hotel h ON a.id_hotel = h.id_hotel
      LEFT JOIN utilisateur u ON a.id_user = u.id_user
      WHERE a.date_avis >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      ORDER BY a.date_avis DESC
    `;

    db.query(query, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  /**
   * Compte les nouveaux avis (7 derniers jours)
   * @param {function} callback - Fonction de rappel (err, count)
   */
  static countNew(callback) {
    const query = `
      SELECT COUNT(*) as count
      FROM AVIS
      WHERE date_avis >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `;

    db.query(query, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results[0].count);
    });
  }

  // ==========================================================================
  // MÉTHODE DE CRÉATION (CREATE)
  // ==========================================================================

  /**
   * Créer un nouvel avis
   * @param {Object} avisData - Données de l'avis
   * @param {number} avisData.id_hotel - ID de l'hôtel
   * @param {number} avisData.id_user - ID de l'utilisateur
   * @param {string} avisData.pseudo_user - Pseudo affiché
   * @param {number} avisData.note - Note de 1 à 10
   * @param {string} avisData.commentaire - Texte de l'avis
   * @param {string} [avisData.titre_avis] - Titre optionnel
   * @param {string} [avisData.type_voyageur] - Type de voyageur
   * @param {string} [avisData.langue] - Code langue
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static create(avisData, callback) {
    const query = `
      INSERT INTO AVIS (
        id_hotel, 
        id_user, 
        pseudo_user, 
        note, 
        titre_avis, 
        commentaire, 
        date_avis, 
        type_voyageur, 
        langue
      ) VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, ?)
    `;

    const values = [
      avisData.id_hotel,
      avisData.id_user,
      avisData.pseudo_user,
      avisData.note,
      avisData.titre_avis || null,
      avisData.commentaire,
      avisData.type_voyageur || "autre",
      avisData.langue || "fr",
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id_avis: result.insertId });
    });
  }

  // ==========================================================================
  // MÉTHODE DE MISE À JOUR (UPDATE)
  // ==========================================================================

  /**
   * Met à jour un avis existant (uniquement par son créateur)
   * @param {number} avisId - ID de l'avis à modifier
   * @param {number} userId - ID de l'utilisateur (vérification de propriété)
   * @param {Object} avisData - Nouvelles données
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static update(avisId, userId, avisData, callback) {
    // Étape 1 : Vérifier que l'avis appartient à l'utilisateur
    const checkQuery = `SELECT id_user FROM AVIS WHERE id_avis = ?`;

    db.query(checkQuery, [avisId], (err, results) => {
      if (err) {
        return callback(err, null);
      }

      if (results.length === 0) {
        return callback(new Error("Avis non trouvé"), null);
      }

      if (results[0].id_user !== userId) {
        return callback(new Error("Non autorisé à modifier cet avis"), null);
      }

      // Étape 2 : Mettre à jour l'avis
      const updateQuery = `
        UPDATE AVIS SET
          note = ?,
          titre_avis = ?,
          commentaire = ?,
          type_voyageur = ?,
          pays_origine = ?
        WHERE id_avis = ? AND id_user = ?
      `;

      const values = [
        avisData.note,
        avisData.titre_avis || null,
        avisData.commentaire,
        avisData.type_voyageur || "autre",
        avisData.pays_origine || null,
        avisId,
        userId,
      ];

      db.query(updateQuery, values, (err, result) => {
        if (err) {
          return callback(err, null);
        }
        callback(null, { updated: result.affectedRows > 0 });
      });
    });
  }

  // ==========================================================================
  // MÉTHODE DE SUPPRESSION (DELETE)
  // ==========================================================================

  /**
   * Supprime un avis (administration)
   * @param {number} avisId - ID de l'avis à supprimer
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static delete(avisId, callback) {
    const query = `DELETE FROM AVIS WHERE id_avis = ?`;

    db.query(query, [avisId], (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, { deleted: result.affectedRows > 0 });
    });
  }
}

module.exports = Avis;

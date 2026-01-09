// ============================================================================
// AVIS.JS - MODÈLE AVIS
// Gère les opérations sur les avis clients
// ============================================================================

const db = require('../config/database');

class Avis {
  
  /**
   * Récupère les avis d'un hôtel
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
   * Créer un nouvel avis (utilisateur connecté)
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
      avisData.type_voyageur || 'autre',
      avisData.langue || 'fr'
    ];
    
    db.query(query, values, (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id_avis: result.insertId });
    });
  }

  /**
   * Récupère tous les avis (admin)
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
   * Récupère les avis récents (derniers 7 jours) - pour admin
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
   * Compte les nouveaux avis (derniers 7 jours)
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

  /**
   * Supprime un avis (admin)
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

  /**
   * Récupère un avis par son ID
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
        return callback(new Error('Avis non trouvé'), null);
      }
      callback(null, results[0]);
    });
  }

  /**
   * Met à jour un avis (uniquement par son créateur)
   */
  static update(avisId, userId, avisData, callback) {
    // Vérifier que l'avis appartient à l'utilisateur
    const checkQuery = `SELECT id_user FROM AVIS WHERE id_avis = ?`;
    
    db.query(checkQuery, [avisId], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      
      if (results.length === 0) {
        return callback(new Error('Avis non trouvé'), null);
      }
      
      if (results[0].id_user !== userId) {
        return callback(new Error('Non autorisé à modifier cet avis'), null);
      }
      
      // Mettre à jour l'avis
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
        avisData.type_voyageur || 'autre',
        avisData.pays_origine || null,
        avisId,
        userId
      ];
      
      db.query(updateQuery, values, (err, result) => {
        if (err) {
          return callback(err, null);
        }
        callback(null, { updated: result.affectedRows > 0 });
      });
    });
  }
}

module.exports = Avis;
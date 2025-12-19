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
        DATE_FORMAT(a.date_avis, '%d/%m/%Y') as date_formatted
      FROM AVIS a
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
}

module.exports = Avis;
// ============================================================================
// HOTEL.JS - MODEL HOTEL (POO)
// Classe pour gérer les opérations sur les hôtels
// ============================================================================

const db = require('../config/database');

class Hotel {
  
  // ========================================
  // RÉCUPÉRER TOUS LES HÔTELS
  // ========================================
  static getAll(callback) {
    const query = `
      SELECT 
        id_hotel,
        nom_hotel,
        description_hotel,
        ville_hotel,
        pays_hotel,
        nbre_etoile_hotel,
        note_moy_hotel,
        img_hotel
      FROM HOTEL
      ORDER BY note_moy_hotel DESC
      LIMIT 100
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }
  
  // ========================================
  // RÉCUPÉRER UN HÔTEL PAR ID
  // ========================================
  static getById(id, callback) {
    const query = `
      SELECT 
        h.*,
        ha.parking, ha.restaurant, ha.wi_fi, ha.piscine, ha.spa, ha.salle_sport
      FROM HOTEL h
      LEFT JOIN HOTEL_AMENITIES ha ON h.id_hotel = ha.id_hotel
      WHERE h.id_hotel = ?
    `;
    
    db.query(query, [id], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      
      if (results.length === 0) {
        return callback(null, null);
      }
      
      callback(null, results[0]);
    });
  }
  
  // ========================================
  // RECHERCHER DES HÔTELS PAR VILLE
  // ========================================
  static getByCity(city, callback) {
    const query = `
      SELECT 
        id_hotel,
        nom_hotel,
        ville_hotel,
        pays_hotel,
        nbre_etoile_hotel,
        note_moy_hotel,
        img_hotel
      FROM HOTEL
      WHERE ville_hotel LIKE ?
      ORDER BY note_moy_hotel DESC
    `;
    
    db.query(query, [`%${city}%`], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  /**
 * Compte le nombre d'hôtels par ville (pour les destinations)
 */
static getDestinationsCount(callback) {
  const query = `
    SELECT 
      ville_hotel,
      pays_hotel,
      COUNT(*) as nombre_hotels
    FROM HOTEL
    GROUP BY ville_hotel, pays_hotel
    ORDER BY ville_hotel
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
}

/**
 * Récupère un hôtel avec tous ses détails (chambres, offres, avis)
 */
static getByIdWithDetails(id, callback) {
  const query = `
    SELECT 
      h.*,
      COUNT(DISTINCT c.id_chambre) as nombre_chambres,
      COUNT(DISTINCT a.id_avis) as nombre_avis,
      AVG(a.note) as note_moyenne
    FROM HOTEL h
    LEFT JOIN CHAMBRE c ON h.id_hotel = c.id_hotel
    LEFT JOIN AVIS a ON h.id_hotel = a.id_hotel
    WHERE h.id_hotel = ?
    GROUP BY h.id_hotel
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results[0]);
  });
}

/**
 * Récupère les hôtels populaires d'une même ville
 */
static getPopularByCity(city, limit, callback) {
  const query = `
    SELECT 
      h.*,
      AVG(a.note) as note_moyenne
    FROM HOTEL h
    LEFT JOIN AVIS a ON h.id_hotel = a.id_hotel
    WHERE h.ville_hotel = ?
    GROUP BY h.id_hotel
    ORDER BY note_moyenne DESC, h.nbre_etoile_hotel DESC
    LIMIT ?
  `;
  
  db.query(query, [city, limit], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
}
}

// Exporter la classe
module.exports = Hotel;
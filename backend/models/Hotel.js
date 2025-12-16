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
}

// Exporter la classe
module.exports = Hotel;
// ============================================================================
// SERVICE.JS - MODÈLE SERVICES ADDITIONNELS
// Gère les opérations sur les services additionnels
// ============================================================================

const db = require('../config/database');

class Service {
  
  /**
   * Récupère tous les services additionnels (catalogue global)
   */
  static getAll(callback) {
    const query = `
      SELECT * 
      FROM SERVICES_ADDITIONNELS
      WHERE actif = 1
      ORDER BY id_service
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }
  
  /**
   * Récupère les services proposés par un hôtel avec leurs prix
   */
  static getByHotelId(hotelId, callback) {
    const query = `
      SELECT 
        hs.id_hotel_service,
        hs.prix_service,
        s.id_service,
        s.nom_service,
        s.description_service,
        s.type_service,
        s.icone_service
      FROM HOTEL_SERVICES hs
      INNER JOIN SERVICES_ADDITIONNELS s ON hs.id_service = s.id_service
      WHERE hs.id_hotel = ? 
        AND hs.disponible = 1 
        AND s.actif = 1
      ORDER BY s.id_service
    `;
    
    db.query(query, [hotelId], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }
  
  /**
   * Ajoute les services sélectionnés à une réservation
   */
  static addToReservation(reservationId, services, callback) {
    if (!services || services.length === 0) {
      return callback(null, { message: 'Aucun service à ajouter' });
    }
    
    const values = services.map(service => [
      reservationId,
      service.id_hotel_service,
      service.quantite || 1,
      service.prix_unitaire,
      (service.quantite || 1) * service.prix_unitaire
    ]);
    
    const query = `
      INSERT INTO RESERVATION_SERVICES 
        (id_reservation, id_hotel_service, quantite, prix_unitaire, sous_total)
      VALUES ?
    `;
    
    db.query(query, [values], (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  }
}

module.exports = Service;
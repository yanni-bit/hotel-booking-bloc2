// ============================================================================
// RESERVATION.JS - MODÈLE RESERVATION
// Gère les opérations sur les réservations
// ============================================================================

const db = require('../config/database');

class Reservation {
  
  /**
   * Crée une nouvelle réservation
   */
  static create(reservationData, callback) {
    const query = `
      INSERT INTO RESERVATION (
        id_offre,
        id_hotel,
        id_chambre,
        check_in,
        check_out,
        nbre_nuits,
        nbre_adults,
        nbre_children,
        prix_nuit,
        total_price,
        devise,
        special_requests,
        num_confirmation,
        id_statut
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      reservationData.id_offre,
      reservationData.id_hotel,
      reservationData.id_chambre,
      reservationData.check_in,
      reservationData.check_out,
      reservationData.nbre_nuits,
      reservationData.nbre_adults,
      reservationData.nbre_children,
      reservationData.prix_nuit,
      reservationData.total_price,
      reservationData.devise || 'EUR',
      reservationData.special_requests || null,
      reservationData.num_confirmation,
      1 // id_statut = 1 (En attente)
    ];
    
    db.query(query, values, (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  }
  
  /**
   * Génère un numéro de confirmation unique
   */
  static generateConfirmationNumber() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `BYT-${timestamp}-${random}`;
  }
}

module.exports = Reservation;
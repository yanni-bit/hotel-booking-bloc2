// ============================================================================
// OFFRE.JS - MODÈLE OFFRE
// Gère les opérations sur les offres
// ============================================================================

const db = require('../config/database');

class Offre {
  
  /**
   * Récupère une offre avec les détails de la chambre et de l'hôtel
   */
  static getByIdWithDetails(offreId, callback) {
    const query = `
      SELECT 
        o.*,
        c.id_chambre,
        c.type_room,
        c.cat_room,
        c.nbre_adults_max,
        c.nbre_children_max,
        c.surface_m2,
        c.nbre_lit,
        h.id_hotel,
        h.nom_hotel,
        h.ville_hotel,
        h.pays_hotel,
        h.img_hotel
      FROM OFFRE o
      INNER JOIN CHAMBRE c ON o.id_chambre = c.id_chambre
      INNER JOIN HOTEL h ON c.id_hotel = h.id_hotel
      WHERE o.id_offre = ?
    `;
    
    db.query(query, [offreId], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results[0]);
    });
  }
}

module.exports = Offre;
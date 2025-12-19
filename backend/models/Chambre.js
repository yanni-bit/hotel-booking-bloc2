// ============================================================================
// CHAMBRE.JS - MODÈLE CHAMBRE
// Gère les opérations sur les chambres
// ============================================================================

const db = require('../config/database');

class Chambre {
  
  /**
   * Récupère toutes les chambres d'un hôtel
   */
 static getByHotelId(hotelId, callback) {
  const query = `
    SELECT 
      c.*,
      COUNT(o.id_offre) as nombre_offres,
      MIN(o.prix_nuit) as prix_minimum
    FROM CHAMBRE c
    LEFT JOIN OFFRE o ON c.id_chambre = o.id_chambre
    WHERE c.id_hotel = ?
    GROUP BY c.id_chambre
    ORDER BY c.id_chambre
  `;
  
  db.query(query, [hotelId], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
}
  
  /**
   * Récupère une chambre par ID avec ses offres
   */
  static getByIdWithOffers(chambreId, callback) {
  const query = `
    SELECT 
      c.*,
      o.id_offre,
      o.nom_offre,
      o.description_offre,
      o.prix_nuit,
      o.devise,
      o.remboursable,
      o.petit_dejeuner_inclus,
      o.pension
    FROM CHAMBRE c
    LEFT JOIN OFFRE o ON c.id_chambre = o.id_chambre
    WHERE c.id_chambre = ?
  `;
  
  db.query(query, [chambreId], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
}
}

module.exports = Chambre;
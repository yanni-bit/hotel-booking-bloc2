// ============================================================================
// CHAMBRE.JS - MODÈLE CHAMBRE
// ============================================================================
// Ce modèle gère les opérations de lecture sur les chambres d'hôtel.
// Pattern utilisé : Classe statique (méthodes sans instanciation)
// Sécurité : Requêtes préparées (?) pour prévenir les injections SQL
// ============================================================================

const db = require("../config/database");

class Chambre {
  // ==========================================================================
  // MÉTHODES DE LECTURE (READ)
  // ==========================================================================

  /**
   * Récupère toutes les chambres d'un hôtel avec statistiques des offres
   * @param {number} hotelId - ID de l'hôtel
   * @param {function} callback - Fonction de rappel (err, results)
   * @description Retourne les chambres avec le nombre d'offres et le prix minimum
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
   * Récupère une chambre par son ID avec toutes ses offres
   * @param {number} chambreId - ID de la chambre
   * @param {function} callback - Fonction de rappel (err, results)
   * @description Retourne la chambre avec le détail de chaque offre associée
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

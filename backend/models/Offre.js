// ============================================================================
// OFFRE.JS - MODÈLE OFFRE
// ============================================================================
// Ce modèle gère les opérations de lecture sur les offres tarifaires.
// Une offre est liée à une chambre, elle-même liée à un hôtel.
// Pattern utilisé : Classe statique (méthodes sans instanciation)
// Sécurité : Requêtes préparées (?) pour prévenir les injections SQL
// ============================================================================

const db = require("../config/database");

class Offre {
  // ==========================================================================
  // MÉTHODES DE LECTURE (READ)
  // ==========================================================================

  /**
   * Récupère une offre avec les détails de la chambre et de l'hôtel
   * @param {number} offreId - ID de l'offre
   * @param {function} callback - Fonction de rappel (err, result)
   * @description Utilise INNER JOIN car une offre doit obligatoirement
   *              être rattachée à une chambre et un hôtel existants
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

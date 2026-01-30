// ============================================================================
// CHAMBRECONTROLLER.JS - CONTRÔLEUR CHAMBRES
// ============================================================================
// Ce contrôleur gère la logique métier des chambres d'hôtel.
// Responsabilités :
//   - Appel au modèle Chambre
//   - Formatage des réponses HTTP (JSON)
// Pattern utilisé : Classe statique avec méthodes CRUD
// ============================================================================

const Chambre = require("../models/Chambre");

class ChambreController {
  // ==========================================================================
  // MÉTHODES DE LECTURE (READ)
  // ==========================================================================

  /**
   * Récupère les chambres d'un hôtel avec statistiques des offres
   * @param {Object} req - Requête HTTP
   * @param {Object} res - Réponse HTTP
   * @param {number} hotelId - ID de l'hôtel
   * @route GET /api/hotels/:id/chambres
   * @returns {Object} Liste des chambres avec nombre d'offres et prix minimum
   */
  static getChambresByHotelId(req, res, hotelId) {
    Chambre.getByHotelId(hotelId, (err, chambres) => {
      if (err) {
        console.error("Erreur lors de la récupération des chambres:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: "Erreur serveur",
          }),
        );
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          count: chambres.length,
          data: chambres,
        }),
      );
    });
  }
}

module.exports = ChambreController;

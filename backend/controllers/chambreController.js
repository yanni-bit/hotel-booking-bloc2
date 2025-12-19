// ============================================================================
// CHAMBRECONTROLLER.JS - LOGIQUE MÉTIER CHAMBRES
// Gère les opérations sur les chambres
// ============================================================================

const Chambre = require('../models/Chambre');

class ChambreController {
  
  /**
   * Récupère les chambres d'un hôtel
   */
  static getChambresByHotelId(req, res, hotelId) {
    Chambre.getByHotelId(hotelId, (err, chambres) => {
      if (err) {
        console.error('Erreur lors de la récupération des chambres:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Erreur serveur'
        }));
        return;
      }
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        count: chambres.length,
        data: chambres
      }));
    });
  }
}

module.exports = ChambreController;
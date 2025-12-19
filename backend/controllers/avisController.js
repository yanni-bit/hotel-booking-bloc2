// ============================================================================
// AVISCONTROLLER.JS - LOGIQUE MÉTIER AVIS
// Gère les opérations sur les avis clients
// ============================================================================

const Avis = require('../models/Avis');

class AvisController {
  
  /**
   * Récupère les avis d'un hôtel
   */
  static getAvisByHotelId(req, res, hotelId) {
    Avis.getByHotelId(hotelId, (err, avis) => {
      if (err) {
        console.error('Erreur lors de la récupération des avis:', err);
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
        count: avis.length,
        data: avis
      }));
    });
  }
}

module.exports = AvisController;
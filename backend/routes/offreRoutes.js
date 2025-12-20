// ============================================================================
// OFFREROUTES.JS - ROUTES API OFFRES
// Définit les endpoints pour les offres
// ============================================================================

const Offre = require('../models/Offre');

function offreRoutes(req, res) {
  const pathname = req.pathname;
  const method = req.method;

  // ========================================
  // GET /api/offres/:id - Détails d'une offre
  // ========================================
  if (pathname.match(/^\/api\/offres\/\d+$/) && method === 'GET') {
    const offreId = pathname.split('/')[3];
    
    Offre.getByIdWithDetails(offreId, (err, offre) => {
      if (err) {
        console.error('Erreur lors de la récupération de l\'offre:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Erreur serveur'
        }));
        return;
      }
      
      if (!offre) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Offre non trouvée'
        }));
        return;
      }
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        data: offre
      }));
    });
    return;
  }

  // ========================================
  // Route non trouvée
  // ========================================
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    success: false,
    message: 'Route non trouvée'
  }));
}

module.exports = offreRoutes;
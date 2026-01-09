// ============================================================================
// AVISROUTES.JS - ROUTES API AVIS
// Définit les endpoints pour les avis clients
// ============================================================================

const AvisController = require('../controllers/avisController');

function avisRoutes(req, res) {
  const pathname = req.pathname;
  const method = req.method;

  // ========================================
  // POST /api/avis - Créer un avis (utilisateur connecté)
  // ========================================
  if (pathname === '/api/avis' && method === 'POST') {
    AvisController.createAvis(req, res);
    return;
  }

  // ========================================
  // GET /api/avis - Tous les avis (admin)
  // ========================================
  if (pathname === '/api/avis' && method === 'GET') {
    AvisController.getAllAvis(req, res);
    return;
  }

  // ========================================
  // GET /api/avis/recent - Avis récents (admin)
  // ========================================
  if (pathname === '/api/avis/recent' && method === 'GET') {
    AvisController.getRecentAvis(req, res);
    return;
  }

  // ========================================
  // GET /api/avis/count - Nombre de nouveaux avis (admin)
  // ========================================
  if (pathname === '/api/avis/count' && method === 'GET') {
    AvisController.countNewAvis(req, res);
    return;
  }

  // ========================================
  // DELETE /api/avis/:id - Supprimer un avis (admin)
  // ========================================
  if (pathname.match(/^\/api\/avis\/\d+$/) && method === 'DELETE') {
    const avisId = pathname.split('/')[3];
    AvisController.deleteAvis(req, res, avisId);
    return;
  }

  // ========================================
  // PUT /api/avis/:id - Modifier un avis (utilisateur propriétaire)
  // ========================================
  if (pathname.match(/^\/api\/avis\/\d+$/) && method === 'PUT') {
    const avisId = pathname.split('/')[3];
    AvisController.updateAvis(req, res, avisId);
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

module.exports = avisRoutes;
// ============================================================================
// SERVICEROUTES.JS - ROUTES API SERVICES
// Définit les endpoints pour les services additionnels
// ============================================================================

const Service = require('../models/Service');

function serviceRoutes(req, res) {
  const pathname = req.pathname;
  const method = req.method;

  // ========================================
  // GET /api/services - Tous les services (catalogue)
  // ========================================
  if (pathname === '/api/services' && method === 'GET') {
    Service.getAll((err, services) => {
      if (err) {
        console.error('Erreur lors de la récupération des services:', err);
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
        data: services
      }));
    });
    return;
  }

  // ========================================
  // GET /api/hotels/:id/services - Services d'un hôtel
  // ========================================
  if (pathname.match(/^\/api\/hotels\/\d+\/services$/) && method === 'GET') {
    const hotelId = pathname.split('/')[3];
    
    Service.getByHotelId(hotelId, (err, services) => {
      if (err) {
        console.error('Erreur lors de la récupération des services:', err);
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
        data: services
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

module.exports = serviceRoutes;
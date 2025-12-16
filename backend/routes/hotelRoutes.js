// ============================================================================
// HOTELROUTES.JS - ROUTES API HÔTELS
// Définit les endpoints pour les hôtels
// ============================================================================

const HotelController = require('../controllers/hotelController');

function hotelRoutes(req, res) {
  const pathname = req.pathname;
  const method = req.method;
  
  // ========================================
  // GET /api/hotels - Liste tous les hôtels
  // ========================================
  if (pathname === '/api/hotels' && method === 'GET') {
    HotelController.getAllHotels(req, res);
    return;
  }
  
  // ========================================
  // GET /api/hotels/:id - Détails d'un hôtel
  // ========================================
  if (pathname.startsWith('/api/hotels/') && method === 'GET') {
    const id = pathname.split('/')[3]; // Récupère l'ID depuis l'URL
    
    if (!id || isNaN(id)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'ID invalide'
      }));
      return;
    }
    
    HotelController.getHotelById(req, res, id);
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

module.exports = hotelRoutes;
// ============================================================================
// HOTELROUTES.JS - ROUTES API HÔTELS
// Définit les endpoints pour les hôtels
// ============================================================================

const HotelController = require("../controllers/hotelController");
const ChambreController = require("../controllers/chambreController");
const AvisController = require("../controllers/avisController");

function hotelRoutes(req, res) {
  const pathname = req.pathname;
  const method = req.method;

  // ========================================
  // GET /api/hotels - Liste tous les hôtels
  // ========================================
  if (pathname === "/api/hotels" && method === "GET") {
    HotelController.getAllHotels(req, res);
    return;
  }

  // ========================================
  // GET /api/destinations - Nombre d'hôtels par ville
  // ========================================
  if (pathname === "/api/destinations" && method === "GET") {
    HotelController.getDestinationsCount(req, res);
    return;
  }

  // ========================================
  // GET /api/hotels/:id/chambres - Chambres d'un hôtel
  // ========================================
  if (pathname.match(/^\/api\/hotels\/\d+\/chambres$/) && method === "GET") {
    const hotelId = pathname.split("/")[3];
    ChambreController.getChambresByHotelId(req, res, hotelId);
    return;
  }

  // ========================================
  // GET /api/hotels/:id/avis - Avis d'un hôtel
  // ========================================
  if (pathname.match(/^\/api\/hotels\/\d+\/avis$/) && method === "GET") {
    const hotelId = pathname.split("/")[3];
    AvisController.getAvisByHotelId(req, res, hotelId);
    return;
  }

  // ========================================
  // GET /api/hotels/popular/:city - Hôtels populaires d'une ville
  // ========================================
  if (pathname.match(/^\/api\/hotels\/popular\/[^/]+$/) && method === "GET") {
    const city = decodeURIComponent(pathname.split("/")[4]);
    HotelController.getPopularHotels(req, res, city);
    return;
  }

  // ========================================
  // GET /api/hotels/:id - Détails d'un hôtel
  // ========================================
  if (pathname.startsWith("/api/hotels/") && method === "GET") {
    const id = pathname.split("/")[3];

    if (!id || isNaN(id)) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: false,
          message: "ID invalide",
        })
      );
      return;
    }

    HotelController.getHotelDetails(req, res, id); // ← Change cette ligne
    return;
  }

  // ========================================
  // Route non trouvée
  // ========================================
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      success: false,
      message: "Route non trouvée",
    })
  );
}

module.exports = hotelRoutes;

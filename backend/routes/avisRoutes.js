// ============================================================================
// FICHIER : avisRoutes.js
// DESCRIPTION : Routes API pour la gestion des avis clients
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// ROUTES UTILISATEUR CONNECTÉ :
//   - POST /api/avis           → Créer un avis
//   - PUT  /api/avis/:id       → Modifier son avis
//
// ROUTES ADMIN :
//   - GET    /api/avis         → Liste tous les avis
//   - GET    /api/avis/recent  → Avis récents
//   - GET    /api/avis/count   → Nombre de nouveaux avis
//   - DELETE /api/avis/:id     → Supprimer un avis
// ============================================================================

const AvisController = require("../controllers/avisController");

// ============================================================================
// FONCTION PRINCIPALE - ROUTEUR AVIS
// ============================================================================

/**
 * Routeur principal pour les routes des avis
 * Gère la création, modification, suppression et consultation des avis
 * @function avisRoutes
 * @param {Object} req - Objet requête HTTP avec pathname et method
 * @param {Object} res - Objet réponse HTTP
 * @returns {void}
 */
function avisRoutes(req, res) {
  const pathname = req.pathname;
  const method = req.method;

  // ==========================================================================
  // ROUTES UTILISATEUR - GESTION DE SES AVIS
  // ==========================================================================

  // ----------------------------------------
  // POST /api/avis - Créer un avis (utilisateur connecté)
  // ----------------------------------------
  if (pathname === "/api/avis" && method === "POST") {
    AvisController.createAvis(req, res);
    return;
  }

  // ----------------------------------------
  // PUT /api/avis/:id - Modifier un avis (utilisateur propriétaire)
  // ----------------------------------------
  if (pathname.match(/^\/api\/avis\/\d+$/) && method === "PUT") {
    const avisId = pathname.split("/")[3];
    AvisController.updateAvis(req, res, avisId);
    return;
  }

  // ==========================================================================
  // ROUTES ADMIN - GESTION DES AVIS
  // ==========================================================================

  // ----------------------------------------
  // GET /api/avis - Tous les avis (admin)
  // ----------------------------------------
  if (pathname === "/api/avis" && method === "GET") {
    AvisController.getAllAvis(req, res);
    return;
  }

  // ----------------------------------------
  // GET /api/avis/recent - Avis récents (admin)
  // ----------------------------------------
  if (pathname === "/api/avis/recent" && method === "GET") {
    AvisController.getRecentAvis(req, res);
    return;
  }

  // ----------------------------------------
  // GET /api/avis/count - Nombre de nouveaux avis (admin)
  // ----------------------------------------
  if (pathname === "/api/avis/count" && method === "GET") {
    AvisController.countNewAvis(req, res);
    return;
  }

  // ----------------------------------------
  // DELETE /api/avis/:id - Supprimer un avis (admin)
  // ----------------------------------------
  if (pathname.match(/^\/api\/avis\/\d+$/) && method === "DELETE") {
    const avisId = pathname.split("/")[3];
    AvisController.deleteAvis(req, res, avisId);
    return;
  }

  // ==========================================================================
  // ROUTE NON TROUVÉE
  // ==========================================================================
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      success: false,
      message: "Route non trouvée",
    }),
  );
}

// ============================================================================
// EXPORT DU MODULE
// ============================================================================
module.exports = avisRoutes;

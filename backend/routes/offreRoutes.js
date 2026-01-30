// ============================================================================
// FICHIER : offreRoutes.js
// DESCRIPTION : Routes API pour la gestion des offres
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// ROUTES PUBLIQUES :
//   - GET /api/offres/:id → Détails d'une offre avec chambre et hôtel
// ============================================================================

const Offre = require("../models/Offre");

// ============================================================================
// FONCTION PRINCIPALE - ROUTEUR OFFRES
// ============================================================================

/**
 * Routeur principal pour les routes des offres
 * Gère la consultation des offres tarifaires
 * @function offreRoutes
 * @param {Object} req - Objet requête HTTP avec pathname et method
 * @param {Object} res - Objet réponse HTTP
 * @returns {void}
 */
function offreRoutes(req, res) {
  const pathname = req.pathname;
  const method = req.method;

  // ==========================================================================
  // ROUTES PUBLIQUES - CONSULTATION DES OFFRES
  // ==========================================================================

  // ----------------------------------------
  // GET /api/offres/:id - Détails d'une offre
  // ----------------------------------------
  if (pathname.match(/^\/api\/offres\/\d+$/) && method === "GET") {
    const offreId = pathname.split("/")[3];

    Offre.getByIdWithDetails(offreId, (err, offre) => {
      if (err) {
        console.error("Erreur lors de la récupération de l'offre:", err);
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

      if (!offre) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: "Offre non trouvée",
          }),
        );
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          data: offre,
        }),
      );
    });
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
module.exports = offreRoutes;

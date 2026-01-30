// ============================================================================
// FICHIER : server.js
// DESCRIPTION : Point d'entrée du backend - Serveur HTTP Node.js sans framework
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// FONCTIONNALITÉS :
//   - Serveur HTTP natif Node.js (sans Express)
//   - Gestion des CORS
//   - Routage vers les différents modules de routes
//   - Health check endpoint
//   - Gestion des erreurs globales
//
// ENDPOINTS PRINCIPAUX :
//   - /api/auth/*         → Authentification et utilisateurs
//   - /api/hotels/*       → Gestion des hôtels
//   - /api/chambres/*     → Gestion des chambres
//   - /api/offres/*       → Gestion des offres
//   - /api/reservations/* → Gestion des réservations
//   - /api/services/*     → Gestion des services
//   - /api/contact/*      → Messages de contact
//   - /api/avis/*         → Avis clients
//   - /api/health         → Vérification état du serveur
// ============================================================================

require("dotenv").config();
const http = require("http");
const url = require("url");
const hotelRoutes = require("./routes/hotelRoutes");
const offreRoutes = require("./routes/offreRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const avisRoutes = require("./routes/avisRoutes");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

// ============================================================================
// GESTION DES CORS
// ============================================================================

/**
 * Configure les en-têtes CORS pour autoriser les requêtes cross-origin
 * @function setCorsHeaders
 * @param {Object} res - Objet réponse HTTP
 * @returns {void}
 */
function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// ============================================================================
// ROUTER PRINCIPAL
// ============================================================================

/**
 * Routeur principal qui dispatche les requêtes vers les routes appropriées
 * @async
 * @function router
 * @param {Object} req - Objet requête HTTP
 * @param {Object} res - Objet réponse HTTP
 * @returns {Promise<void>}
 */
async function router(req, res) {
  setCorsHeaders(res);

  // Gérer les requêtes OPTIONS (preflight CORS)
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Parser l'URL et extraire pathname et query
  const parsedUrl = url.parse(req.url, true);
  req.pathname = parsedUrl.pathname;
  req.query = parsedUrl.query;

  try {
    // ----------------------------------------
    // ROUTES AUTHENTIFICATION
    // ----------------------------------------
    if (req.pathname.startsWith("/api/auth")) {
      await authRoutes(req, res);
      return;
    }

    // ----------------------------------------
    // ROUTES CONTACT
    // ----------------------------------------
    if (req.pathname.startsWith("/api/contact")) {
      await contactRoutes(req, res);
      return;
    }

    // ----------------------------------------
    // ROUTES AVIS
    // ----------------------------------------
    if (req.pathname.startsWith("/api/avis")) {
      await avisRoutes(req, res);
      return;
    }

    // ----------------------------------------
    // ROUTES CHAMBRES
    // ----------------------------------------
    if (req.pathname.startsWith("/api/chambres")) {
      await hotelRoutes(req, res);
      return;
    }

    // ----------------------------------------
    // ROUTES SERVICES HÔTEL
    // ----------------------------------------
    if (req.pathname.match(/^\/api\/hotels\/\d+\/services(\/admin)?$/)) {
      await serviceRoutes(req, res);
      return;
    }

    // ----------------------------------------
    // ROUTES HÔTELS
    // ----------------------------------------
    if (
      req.pathname.startsWith("/api/hotels") ||
      req.pathname === "/api/destinations" ||
      req.pathname === "/api/cities" ||
      req.pathname === "/api/search"
    ) {
      await hotelRoutes(req, res);
      return;
    }

    // ----------------------------------------
    // ROUTES OFFRES
    // ----------------------------------------
    if (req.pathname.startsWith("/api/offres")) {
      await offreRoutes(req, res);
      return;
    }

    // ----------------------------------------
    // ROUTES RÉSERVATIONS
    // ----------------------------------------
    if (req.pathname.startsWith("/api/reservations")) {
      await reservationRoutes(req, res);
      return;
    }

    // ----------------------------------------
    // ROUTES SERVICES CATALOGUE
    // ----------------------------------------
    if (req.pathname.startsWith("/api/services")) {
      await serviceRoutes(req, res);
      return;
    }

    // ----------------------------------------
    // ROUTE SANTÉ (HEALTH CHECK)
    // ----------------------------------------
    if (req.pathname === "/api/health" && req.method === "GET") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          message: "Backend fonctionne",
          timestamp: new Date().toISOString(),
        }),
      );
      return;
    }

    // ----------------------------------------
    // ROUTE PAR DÉFAUT (404)
    // ----------------------------------------
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        success: false,
        message: "Route non trouvée",
        path: req.pathname,
      }),
    );
  } catch (error) {
    // ----------------------------------------
    // GESTION DES ERREURS GLOBALES
    // ----------------------------------------
    console.error("Erreur serveur:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        success: false,
        message: "Erreur interne du serveur",
      }),
    );
  }
}

// ============================================================================
// CRÉER ET DÉMARRER LE SERVEUR
// ============================================================================

const server = http.createServer(router);

server.listen(PORT, HOST, () => {
  console.log("\n" + "=".repeat(80));
  console.log("🚀 SERVEUR BACKEND NODE.JS DÉMARRÉ");
  console.log("=".repeat(80));
  console.log(`\n📡 Serveur en écoute sur : http://${HOST}:${PORT}`);
  console.log(`🏥 Health check : http://${HOST}:${PORT}/api/health`);
  console.log(`🏨 Liste hôtels : http://${HOST}:${PORT}/api/hotels`);
  console.log("\n⌨️  Appuyez sur Ctrl+C pour arrêter le serveur\n");
  console.log("=".repeat(80) + "\n");
});

// ============================================================================
// EXPORT DU MODULE
// ============================================================================
module.exports = server;

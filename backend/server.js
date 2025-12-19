// ============================================================================
// SERVER.JS - POINT D'ENTRÉE DU BACKEND
// Serveur Node.js sans framework
// ============================================================================

require('dotenv').config();
const http = require('http');
const url = require('url');
const hotelRoutes = require('./routes/hotelRoutes');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// ============================================================================
// GESTION DES CORS
// ============================================================================
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// ============================================================================
// ROUTER PRINCIPAL
// ============================================================================
async function router(req, res) {
  setCorsHeaders(res);
  
  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  
  // Parser l'URL
  const parsedUrl = url.parse(req.url, true);
  req.pathname = parsedUrl.pathname;
  req.query = parsedUrl.query;
  
  try {
    // ========================================
    // ROUTES HÔTELS
    // ========================================
    if (req.pathname.startsWith('/api/hotels') || req.pathname === '/api/destinations') {
      await hotelRoutes(req, res);
      return;
    }
    
    // ========================================
    // ROUTE SANTÉ (HEALTH CHECK)
    // ========================================
    if (req.pathname === '/api/health' && req.method === 'GET') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: 'Backend fonctionne',
        timestamp: new Date().toISOString()
      }));
      return;
    }
    
    // ========================================
    // ROUTE PAR DÉFAUT (404)
    // ========================================
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      message: 'Route non trouvée',
      path: req.pathname
    }));
    
  } catch (error) {
    console.error('Erreur serveur:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      message: 'Erreur interne du serveur'
    }));
  }
}

// ============================================================================
// CRÉER ET DÉMARRER LE SERVEUR
// ============================================================================
const server = http.createServer(router);

server.listen(PORT, HOST, () => {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 SERVEUR BACKEND NODE.JS DÉMARRÉ');
  console.log('='.repeat(80));
  console.log(`\n📡 Serveur en écoute sur : http://${HOST}:${PORT}`);
  console.log(`🏥 Health check : http://${HOST}:${PORT}/api/health`);
  console.log(`🏨 Liste hôtels : http://${HOST}:${PORT}/api/hotels`);
  console.log('\n⌨️  Appuyez sur Ctrl+C pour arrêter le serveur\n');
  console.log('='.repeat(80) + '\n');
});

module.exports = server;
// ============================================================================
// RESERVATIONROUTES.JS - ROUTES API RÉSERVATIONS
// Définit les endpoints pour les réservations
// ============================================================================

const Reservation = require('../models/Reservation');

function reservationRoutes(req, res) {
  const pathname = req.pathname;
  const method = req.method;

  // ========================================
  // POST /api/reservations - Créer une réservation
  // ========================================
  if (pathname === '/api/reservations' && method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const reservationData = JSON.parse(body);
        
        // Générer numéro de confirmation
        reservationData.num_confirmation = Reservation.generateConfirmationNumber();
        
        Reservation.create(reservationData, (err, result) => {
          if (err) {
            console.error('Erreur lors de la création de la réservation:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              message: 'Erreur lors de la création de la réservation'
            }));
            return;
          }
          
          res.statusCode = 201;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            message: 'Réservation créée avec succès',
            data: {
              id_reservation: result.insertId,
              num_confirmation: reservationData.num_confirmation
            }
          }));
        });
      } catch (error) {
        console.error('Erreur de parsing JSON:', error);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Données invalides'
        }));
      }
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

module.exports = reservationRoutes;
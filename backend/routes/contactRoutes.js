// ============================================================================
// CONTACTROUTES.JS - ROUTES API CONTACT
// Définit les endpoints pour les messages de contact
// ============================================================================

const Contact = require('../models/Contact');

function contactRoutes(req, res) {
  const pathname = req.pathname;
  const method = req.method;

  // ========================================
  // POST /api/contact - Envoyer un message
  // ========================================
  if (pathname === '/api/contact' && method === 'POST') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const messageData = JSON.parse(body);

        // Validation des champs obligatoires
        if (!messageData.nom || !messageData.email || !messageData.sujet || !messageData.message) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            message: 'Tous les champs obligatoires doivent être remplis'
          }));
          return;
        }

        // Validation email basique
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(messageData.email)) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            message: 'Adresse email invalide'
          }));
          return;
        }

        // Validation sujet
        const validSujets = ['reservation', 'information', 'reclamation', 'autre'];
        if (!validSujets.includes(messageData.sujet)) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            message: 'Sujet invalide'
          }));
          return;
        }

        Contact.create(messageData, (err, result) => {
          if (err) {
            console.error('Erreur lors de la création du message:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              message: 'Erreur lors de l\'envoi du message'
            }));
            return;
          }

          res.statusCode = 201;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            message: 'Message envoyé avec succès',
            data: {
              id_message: result.id_message
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
  // GET /api/contact/messages - Tous les messages (admin)
  // ========================================
  if (pathname === '/api/contact/messages' && method === 'GET') {
    Contact.getAll((err, messages) => {
      if (err) {
        console.error('Erreur lors de la récupération des messages:', err);
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
        data: messages
      }));
    });
    return;
  }

  // ========================================
  // GET /api/contact/messages/unread - Messages non lus (admin)
  // ========================================
  if (pathname === '/api/contact/messages/unread' && method === 'GET') {
    Contact.getUnread((err, messages) => {
      if (err) {
        console.error('Erreur lors de la récupération des messages:', err);
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
        data: messages
      }));
    });
    return;
  }

  // ========================================
  // GET /api/contact/messages/count - Nombre de messages non lus
  // ========================================
  if (pathname === '/api/contact/messages/count' && method === 'GET') {
    Contact.countUnread((err, count) => {
      if (err) {
        console.error('Erreur lors du comptage:', err);
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
        data: { unreadCount: count }
      }));
    });
    return;
  }

  // ========================================
  // GET /api/contact/messages/:id - Détail d'un message
  // ========================================
  if (pathname.match(/^\/api\/contact\/messages\/\d+$/) && method === 'GET') {
    const messageId = pathname.split('/')[4];

    Contact.getById(messageId, (err, message) => {
      if (err) {
        console.error('Erreur lors de la récupération du message:', err);
        
        if (err.message === 'Message non trouvé') {
          res.statusCode = 404;
        } else {
          res.statusCode = 500;
        }
        
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: err.message || 'Erreur serveur'
        }));
        return;
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        data: message
      }));
    });
    return;
  }

  // ========================================
  // PUT /api/contact/messages/:id/read - Marquer comme lu
  // ========================================
  if (pathname.match(/^\/api\/contact\/messages\/\d+\/read$/) && method === 'PUT') {
    const messageId = pathname.split('/')[4];

    Contact.markAsRead(messageId, (err, result) => {
      if (err) {
        console.error('Erreur lors de la mise à jour:', err);
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
        message: 'Message marqué comme lu'
      }));
    });
    return;
  }

  // ========================================
  // PUT /api/contact/messages/:id/treated - Marquer comme traité
  // ========================================
  if (pathname.match(/^\/api\/contact\/messages\/\d+\/treated$/) && method === 'PUT') {
    const messageId = pathname.split('/')[4];

    Contact.markAsTreated(messageId, (err, result) => {
      if (err) {
        console.error('Erreur lors de la mise à jour:', err);
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
        message: 'Message marqué comme traité'
      }));
    });
    return;
  }

  // ========================================
  // DELETE /api/contact/messages/:id - Supprimer un message
  // ========================================
  if (pathname.match(/^\/api\/contact\/messages\/\d+$/) && method === 'DELETE') {
    const messageId = pathname.split('/')[4];

    Contact.delete(messageId, (err, result) => {
      if (err) {
        console.error('Erreur lors de la suppression:', err);
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
        message: 'Message supprimé avec succès'
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

module.exports = contactRoutes;
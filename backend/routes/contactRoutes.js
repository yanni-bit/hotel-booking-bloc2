// ============================================================================
// FICHIER : contactRoutes.js
// DESCRIPTION : Routes API pour la gestion des messages de contact
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// ROUTE PUBLIQUE :
//   - POST /api/contact                      → Envoyer un message de contact
//
// ROUTES ADMIN :
//   - GET    /api/contact/messages           → Liste tous les messages
//   - GET    /api/contact/messages/unread    → Messages non lus
//   - GET    /api/contact/messages/count     → Nombre de messages non lus
//   - GET    /api/contact/messages/:id       → Détail d'un message
//   - PUT    /api/contact/messages/:id/read  → Marquer comme lu
//   - PUT    /api/contact/messages/:id/treated → Marquer comme traité
//   - DELETE /api/contact/messages/:id       → Supprimer un message
// ============================================================================

const Contact = require("../models/Contact");

// ============================================================================
// FONCTION PRINCIPALE - ROUTEUR CONTACT
// ============================================================================

/**
 * Routeur principal pour les routes de contact
 * Gère l'envoi de messages et leur administration
 * @function contactRoutes
 * @param {Object} req - Objet requête HTTP avec pathname et method
 * @param {Object} res - Objet réponse HTTP
 * @returns {void}
 */
function contactRoutes(req, res) {
  const pathname = req.pathname;
  const method = req.method;

  // ==========================================================================
  // ROUTE PUBLIQUE - ENVOI DE MESSAGE
  // ==========================================================================

  // ----------------------------------------
  // POST /api/contact - Envoyer un message
  // ----------------------------------------
  if (pathname === "/api/contact" && method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const messageData = JSON.parse(body);

        // Validation des champs obligatoires
        if (
          !messageData.nom ||
          !messageData.email ||
          !messageData.sujet ||
          !messageData.message
        ) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message: "Tous les champs obligatoires doivent être remplis",
            }),
          );
          return;
        }

        // Validation email basique
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(messageData.email)) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message: "Adresse email invalide",
            }),
          );
          return;
        }

        // Validation sujet
        const validSujets = [
          "reservation",
          "information",
          "reclamation",
          "autre",
        ];
        if (!validSujets.includes(messageData.sujet)) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message: "Sujet invalide",
            }),
          );
          return;
        }

        Contact.create(messageData, (err, result) => {
          if (err) {
            console.error("Erreur lors de la création du message:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: false,
                message: "Erreur lors de l'envoi du message",
              }),
            );
            return;
          }

          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: true,
              message: "Message envoyé avec succès",
              data: {
                id_message: result.id_message,
              },
            }),
          );
        });
      } catch (error) {
        console.error("Erreur de parsing JSON:", error);
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: "Données invalides",
          }),
        );
      }
    });
    return;
  }

  // ==========================================================================
  // ROUTES ADMIN - GESTION DES MESSAGES
  // ==========================================================================

  // ----------------------------------------
  // GET /api/contact/messages - Tous les messages (admin)
  // ----------------------------------------
  if (pathname === "/api/contact/messages" && method === "GET") {
    Contact.getAll((err, messages) => {
      if (err) {
        console.error("Erreur lors de la récupération des messages:", err);
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

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          data: messages,
        }),
      );
    });
    return;
  }

  // ----------------------------------------
  // GET /api/contact/messages/unread - Messages non lus (admin)
  // ----------------------------------------
  if (pathname === "/api/contact/messages/unread" && method === "GET") {
    Contact.getUnread((err, messages) => {
      if (err) {
        console.error("Erreur lors de la récupération des messages:", err);
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

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          data: messages,
        }),
      );
    });
    return;
  }

  // ----------------------------------------
  // GET /api/contact/messages/count - Nombre de messages non lus (admin)
  // ----------------------------------------
  if (pathname === "/api/contact/messages/count" && method === "GET") {
    Contact.countUnread((err, count) => {
      if (err) {
        console.error("Erreur lors du comptage:", err);
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

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          data: { unreadCount: count },
        }),
      );
    });
    return;
  }

  // ----------------------------------------
  // GET /api/contact/messages/:id - Détail d'un message (admin)
  // ----------------------------------------
  if (pathname.match(/^\/api\/contact\/messages\/\d+$/) && method === "GET") {
    const messageId = pathname.split("/")[4];

    Contact.getById(messageId, (err, message) => {
      if (err) {
        console.error("Erreur lors de la récupération du message:", err);

        if (err.message === "Message non trouvé") {
          res.statusCode = 404;
        } else {
          res.statusCode = 500;
        }

        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: err.message || "Erreur serveur",
          }),
        );
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          data: message,
        }),
      );
    });
    return;
  }

  // ----------------------------------------
  // PUT /api/contact/messages/:id/read - Marquer comme lu (admin)
  // ----------------------------------------
  if (
    pathname.match(/^\/api\/contact\/messages\/\d+\/read$/) &&
    method === "PUT"
  ) {
    const messageId = pathname.split("/")[4];

    Contact.markAsRead(messageId, (err, result) => {
      if (err) {
        console.error("Erreur lors de la mise à jour:", err);
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

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          message: "Message marqué comme lu",
        }),
      );
    });
    return;
  }

  // ----------------------------------------
  // PUT /api/contact/messages/:id/treated - Marquer comme traité (admin)
  // ----------------------------------------
  if (
    pathname.match(/^\/api\/contact\/messages\/\d+\/treated$/) &&
    method === "PUT"
  ) {
    const messageId = pathname.split("/")[4];

    Contact.markAsTreated(messageId, (err, result) => {
      if (err) {
        console.error("Erreur lors de la mise à jour:", err);
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

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          message: "Message marqué comme traité",
        }),
      );
    });
    return;
  }

  // ----------------------------------------
  // DELETE /api/contact/messages/:id - Supprimer un message (admin)
  // ----------------------------------------
  if (
    pathname.match(/^\/api\/contact\/messages\/\d+$/) &&
    method === "DELETE"
  ) {
    const messageId = pathname.split("/")[4];

    Contact.delete(messageId, (err, result) => {
      if (err) {
        console.error("Erreur lors de la suppression:", err);
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

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          message: "Message supprimé avec succès",
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
module.exports = contactRoutes;

// ============================================================================
// FICHIER : reservationRoutes.js
// DESCRIPTION : Routes API pour la gestion des réservations
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// ROUTES UTILISATEUR CONNECTÉ :
//   - POST /api/reservations                  → Créer une réservation
//   - GET  /api/reservations/user/:userId     → Réservations d'un utilisateur
//   - GET  /api/reservations/:id              → Détail d'une réservation
//   - GET  /api/reservations/:id/services     → Services d'une réservation
//   - PUT  /api/reservations/:id/cancel       → Annuler une réservation
//
// ROUTES ADMIN :
//   - GET /api/reservations/all               → Toutes les réservations
//   - PUT /api/reservations/:id/status        → Changer le statut
// ============================================================================

const Reservation = require("../models/Reservation");

// ============================================================================
// FONCTION PRINCIPALE - ROUTEUR RÉSERVATIONS
// ============================================================================

/**
 * Routeur principal pour les routes des réservations
 * Gère la création, consultation, annulation et administration des réservations
 * @function reservationRoutes
 * @param {Object} req - Objet requête HTTP avec pathname et method
 * @param {Object} res - Objet réponse HTTP
 * @returns {void}
 */
function reservationRoutes(req, res) {
  const pathname = req.pathname;
  const method = req.method;

  // ==========================================================================
  // ROUTES UTILISATEUR - CRÉATION ET CONSULTATION
  // ==========================================================================

  // ----------------------------------------
  // POST /api/reservations - Créer une réservation
  // ----------------------------------------
  if (pathname === "/api/reservations" && method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const reservationData = JSON.parse(body);

        reservationData.num_confirmation =
          Reservation.generateConfirmationNumber();

        Reservation.create(reservationData, (err, result) => {
          if (err) {
            console.error("Erreur lors de la création de la réservation:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: false,
                message: "Erreur lors de la création de la réservation",
              }),
            );
            return;
          }

          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: true,
              message: "Réservation créée avec succès",
              data: {
                id_reservation: result.id_reservation,
                num_confirmation: result.num_confirmation,
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

  // ----------------------------------------
  // GET /api/reservations/user/:userId - Réservations d'un utilisateur
  // ----------------------------------------
  if (pathname.match(/^\/api\/reservations\/user\/\d+$/) && method === "GET") {
    const userId = pathname.split("/")[4];

    Reservation.getByUserId(userId, (err, reservations) => {
      if (err) {
        console.error("Erreur lors de la récupération des réservations:", err);
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
          data: reservations,
        }),
      );
    });
    return;
  }

  // ----------------------------------------
  // GET /api/reservations/:id/services - Services d'une réservation
  // (DOIT être AVANT la route /api/reservations/:id)
  // ----------------------------------------
  if (
    pathname.match(/^\/api\/reservations\/\d+\/services$/) &&
    method === "GET"
  ) {
    const reservationId = pathname.split("/")[3];

    Reservation.getServicesByReservationId(reservationId, (err, services) => {
      if (err) {
        console.error("Erreur récupération services:", err);
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
          data: services,
        }),
      );
    });
    return;
  }

  // ----------------------------------------
  // GET /api/reservations/:id - Détail d'une réservation
  // ----------------------------------------
  if (pathname.match(/^\/api\/reservations\/\d+$/) && method === "GET") {
    const reservationId = pathname.split("/")[3];
    const userId = req.query.userId;

    if (!userId) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: false,
          message: "ID utilisateur requis",
        }),
      );
      return;
    }

    Reservation.getById(reservationId, userId, (err, reservation) => {
      if (err) {
        console.error("Erreur lors de la récupération de la réservation:", err);

        if (err.message === "Réservation non trouvée ou accès refusé") {
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
          data: reservation,
        }),
      );
    });
    return;
  }

  // ----------------------------------------
  // PUT /api/reservations/:id/cancel - Annuler une réservation
  // ----------------------------------------
  if (
    pathname.match(/^\/api\/reservations\/\d+\/cancel$/) &&
    method === "PUT"
  ) {
    const reservationId = pathname.split("/")[3];
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const { userId } = JSON.parse(body);

        if (!userId) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message: "ID utilisateur requis",
            }),
          );
          return;
        }

        Reservation.cancel(reservationId, userId, (err, result) => {
          if (err) {
            console.error("Erreur annulation:", err);

            if (err.message === "Réservation non trouvée ou accès refusé") {
              res.statusCode = 403;
            } else if (err.message === "Cette réservation est déjà annulée") {
              res.statusCode = 400;
            } else {
              res.statusCode = 500;
            }

            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: false,
                message: err.message || "Erreur lors de l'annulation",
              }),
            );
            return;
          }

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: true,
              message: "Réservation annulée avec succès",
            }),
          );
        });
      } catch (error) {
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
  // ROUTES ADMIN - GESTION DES RÉSERVATIONS
  // ==========================================================================

  // ----------------------------------------
  // GET /api/reservations/all - Toutes les réservations (admin)
  // ----------------------------------------
  if (pathname === "/api/reservations/all" && method === "GET") {
    Reservation.getAll((err, reservations) => {
      if (err) {
        console.error("Erreur lors de la récupération des réservations:", err);
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
          data: reservations,
        }),
      );
    });
    return;
  }

  // ----------------------------------------
  // PUT /api/reservations/:id/status - Changer le statut (admin)
  // ----------------------------------------
  if (
    pathname.match(/^\/api\/reservations\/\d+\/status$/) &&
    method === "PUT"
  ) {
    const reservationId = pathname.split("/")[3];
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const { newStatusId } = JSON.parse(body);

        if (!newStatusId) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message: "Nouveau statut requis",
            }),
          );
          return;
        }

        Reservation.updateStatus(reservationId, newStatusId, (err, result) => {
          if (err) {
            console.error("Erreur mise à jour statut:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: false,
                message: "Erreur lors de la mise à jour du statut",
              }),
            );
            return;
          }

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: true,
              message: "Statut mis à jour avec succès",
            }),
          );
        });
      } catch (error) {
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
module.exports = reservationRoutes;

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
//   - PUT  /api/reservations/:id              → Modifier une réservation
//   - PUT  /api/reservations/:id/cancel       → Annuler une réservation
//
// ROUTES ADMIN :
//   - GET /api/reservations/all               → Toutes les réservations
//   - PUT /api/reservations/:id/status        → Changer le statut
//
// SECURITE :
//   Toutes les routes de ce fichier exigent un jeton JWT valide dans
//   l'en-tete Authorization. L'identite de l'appelant est lue dans le jeton,
//   jamais dans le corps ou la chaine de requete : un client ne peut donc
//   pas agir au nom d'un autre utilisateur en modifiant sa requete.
//   Les deux routes d'administration exigent en plus le role "admin".
// ============================================================================

const Reservation = require("../models/Reservation");
const { requireAuth, requireAdmin } = require("../utils/auth");

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
    const auth = requireAuth(req, res);
    if (!auth) return;

    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const reservationData = JSON.parse(body);

        // L'identite vient du jeton signe, pas du corps de la requete :
        // un id_user envoye par le client est volontairement ecrase.
        reservationData.id_user = auth.id_user;

        reservationData.num_confirmation =
          Reservation.generateConfirmationNumber();

        Reservation.create(reservationData, (err, result) => {
          if (err) {
            console.error("Erreur lors de la création de la réservation:", err);

            // 409 Conflict : la chambre est deja occupee sur la periode.
            // Meme code que sur la modification, pour que le client
            // distingue un conflit metier d'une panne serveur.
            if (
              err.message ===
              "Cette chambre n'est plus disponible sur les dates demandées"
            ) {
              res.statusCode = 409;
            } else {
              res.statusCode = 500;
            }

            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: false,
                message:
                  err.message || "Erreur lors de la création de la réservation",
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
    const auth = requireAuth(req, res);
    if (!auth) return;

    const userId = pathname.split("/")[4];

    // Un client ne consulte que son propre historique ; l'admin voit tout.
    if (String(auth.id_user) !== userId && auth.role !== "admin") {
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: false,
          message: "Acces refuse a l'historique d'un autre utilisateur",
        }),
      );
      return;
    }

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
    const auth = requireAuth(req, res);
    if (!auth) return;

    const reservationId = pathname.split("/")[3];

    /**
     * Envoie les services de la reservation.
     * Appelee une fois la propriete etablie, pour ne pas dupliquer
     * le bloc de reponse entre le cas admin et le cas client.
     */
    const envoyerServices = () => {
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
    };

    // L'admin accede a toutes les reservations. Le client doit prouver
    // qu'il est proprietaire : getById filtre sur l'id utilisateur et
    // renvoie une erreur si la reservation ne lui appartient pas.
    if (auth.role === "admin") {
      envoyerServices();
      return;
    }

    Reservation.getById(reservationId, auth.id_user, (err) => {
      if (err) {
        res.statusCode = 403;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: "Acces refuse a cette reservation",
          }),
        );
        return;
      }

      envoyerServices();
    });
    return;
  }

  // ----------------------------------------
  // GET /api/reservations/:id - Détail d'une réservation
  // ----------------------------------------
  if (pathname.match(/^\/api\/reservations\/\d+$/) && method === "GET") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const reservationId = pathname.split("/")[3];

    // getById filtre sur l'utilisateur : une reservation qui ne lui
    // appartient pas remonte comme "non trouvee", donc en 404.
    Reservation.getById(reservationId, auth.id_user, (err, reservation) => {
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
  // PUT /api/reservations/:id/pay - Confirmer le paiement (client)
  //
  // Route distincte de PUT /:id/status, qui reste reservee aux
  // administrateurs. Ici le statut vise est fixe : 1 vers 2. La reservation
  // est designee par l'URL, le payeur par le jeton, et le corps de la
  // requete n'est pas lu.
  // ----------------------------------------
  if (pathname.match(/^\/api\/reservations\/\d+\/pay$/) && method === "PUT") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const reservationId = pathname.split("/")[3];

    Reservation.markAsPaid(reservationId, auth.id_user, (err) => {
      if (err) {
        console.error("Erreur confirmation de paiement:", err);

        if (err.message === "Réservation non trouvée ou accès refusé") {
          res.statusCode = 403;
        } else if (
          err.message === "Cette réservation n'est plus en attente de paiement"
        ) {
          res.statusCode = 409;
        } else {
          res.statusCode = 500;
        }

        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: err.message || "Erreur lors de la confirmation",
          }),
        );
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          message: "Paiement enregistré, réservation confirmée",
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
    const auth = requireAuth(req, res);
    if (!auth) return;

    const reservationId = pathname.split("/")[3];
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        // Le corps n'est plus lu pour l'identite : seul le jeton fait foi.
        JSON.parse(body);

        Reservation.cancel(reservationId, auth.id_user, (err, result) => {
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

  // ----------------------------------------
  // PUT /api/reservations/:id - Modifier une réservation non payée
  // ----------------------------------------
  if (pathname.match(/^\/api\/reservations\/\d+$/) && method === "PUT") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const reservationId = pathname.split("/")[3];
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const { check_in, check_out, nbre_adults, nbre_children } =
          JSON.parse(body);

        if (!check_in || !check_out) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message: "Dates de séjour requises : check_in, check_out",
            }),
          );
          return;
        }

        // Le modèle applique les règles métier : propriété, statut, dates,
        // capacité, disponibilité, puis recalcule le total depuis l'offre.
        Reservation.update(
          reservationId,
          auth.id_user,
          { check_in, check_out, nbre_adults, nbre_children },
          (err, result) => {
            if (err) {
              console.error("Erreur modification réservation:", err);

              if (err.message === "Réservation non trouvée ou accès refusé") {
                res.statusCode = 403;
              } else if (
                err.message ===
                "Cette chambre n'est plus disponible sur les dates demandées"
              ) {
                res.statusCode = 409;
              } else {
                // Dates incohérentes, capacité dépassée, réservation déjà payée
                res.statusCode = 400;
              }

              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  success: false,
                  message: err.message || "Erreur lors de la modification",
                }),
              );
              return;
            }

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: true,
                message: "Réservation modifiée avec succès",
                data: result,
              }),
            );
          },
        );
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
    const auth = requireAdmin(req, res);
    if (!auth) return;

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
    const auth = requireAdmin(req, res);
    if (!auth) return;

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

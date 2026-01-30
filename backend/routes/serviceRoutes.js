// ============================================================================
// FICHIER : serviceRoutes.js
// DESCRIPTION : Routes API pour la gestion des services additionnels
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// ROUTES PUBLIQUES :
//   - GET /api/services                      → Catalogue des services actifs
//   - GET /api/services/:id                  → Détail d'un service
//   - GET /api/hotels/:id/services           → Services disponibles d'un hôtel
//
// ROUTES ADMIN :
//   - GET    /api/services/admin             → Tous les services (inclut inactifs)
//   - POST   /api/services                   → Créer un service
//   - PUT    /api/services/:id               → Modifier un service
//   - DELETE /api/services/:id               → Supprimer un service
//   - PATCH  /api/services/:id/toggle        → Activer/Désactiver un service
//   - GET    /api/hotels/:id/services/admin  → Services d'un hôtel (tous)
//   - PUT    /api/hotels/:id/services        → Mettre à jour les prix des services
// ============================================================================

const Service = require("../models/Service");

// ============================================================================
// FONCTION PRINCIPALE - ROUTEUR SERVICES
// ============================================================================

/**
 * Routeur principal pour les routes des services
 * Gère le catalogue, la consultation et l'administration des services additionnels
 * @function serviceRoutes
 * @param {Object} req - Objet requête HTTP avec pathname et method
 * @param {Object} res - Objet réponse HTTP
 * @returns {void}
 */
function serviceRoutes(req, res) {
  const pathname = req.pathname;
  const method = req.method;

  // ==========================================================================
  // ROUTES PUBLIQUES - CATALOGUE DES SERVICES
  // ==========================================================================

  // ----------------------------------------
  // GET /api/services - Tous les services (catalogue)
  // ----------------------------------------
  if (pathname === "/api/services" && method === "GET") {
    Service.getAll((err, services) => {
      if (err) {
        console.error("Erreur lors de la récupération des services:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: false, message: "Erreur serveur" }));
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: true, data: services }));
    });
    return;
  }

  // ----------------------------------------
  // GET /api/services/:id - Détail d'un service
  // ----------------------------------------
  if (pathname.match(/^\/api\/services\/\d+$/) && method === "GET") {
    const serviceId = pathname.split("/")[3];

    Service.getById(serviceId, (err, service) => {
      if (err) {
        console.error("Erreur récupération service:", err);
        res.statusCode = err.message === "Service non trouvé" ? 404 : 500;
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
      res.end(JSON.stringify({ success: true, data: service }));
    });
    return;
  }

  // ==========================================================================
  // ROUTES PUBLIQUES - SERVICES PAR HÔTEL
  // ==========================================================================

  // ----------------------------------------
  // GET /api/hotels/:id/services - Services d'un hôtel (booking - disponibles uniquement)
  // ----------------------------------------
  if (pathname.match(/^\/api\/hotels\/\d+\/services$/) && method === "GET") {
    const hotelId = pathname.split("/")[3];

    Service.getByHotelId(hotelId, (err, services) => {
      if (err) {
        console.error("Erreur lors de la récupération des services:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: false, message: "Erreur serveur" }));
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: true, data: services }));
    });
    return;
  }

  // ==========================================================================
  // ROUTES ADMIN - GESTION DES SERVICES
  // ==========================================================================

  // ----------------------------------------
  // GET /api/services/admin - Tous les services (admin, inclut inactifs)
  // ----------------------------------------
  if (pathname === "/api/services/admin" && method === "GET") {
    Service.getAllAdmin((err, services) => {
      if (err) {
        console.error("Erreur récupération services admin:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: false, message: "Erreur serveur" }));
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: true, data: services }));
    });
    return;
  }

  // ----------------------------------------
  // POST /api/services - Créer un service (admin)
  // ----------------------------------------
  if (pathname === "/api/services" && method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const serviceData = JSON.parse(body);

        if (!serviceData.nom_service) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message: "Nom du service requis",
            }),
          );
          return;
        }

        Service.create(serviceData, (err, result) => {
          if (err) {
            console.error("Erreur création service:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({ success: false, message: "Erreur serveur" }),
            );
            return;
          }

          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: true,
              message: "Service créé avec succès",
              data: result,
            }),
          );
        });
      } catch (error) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({ success: false, message: "Données invalides" }),
        );
      }
    });
    return;
  }

  // ----------------------------------------
  // PUT /api/services/:id - Modifier un service (admin)
  // ----------------------------------------
  if (pathname.match(/^\/api\/services\/\d+$/) && method === "PUT") {
    const serviceId = pathname.split("/")[3];
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const serviceData = JSON.parse(body);

        Service.update(serviceId, serviceData, (err, result) => {
          if (err) {
            console.error("Erreur modification service:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({ success: false, message: "Erreur serveur" }),
            );
            return;
          }

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: true,
              message: "Service modifié avec succès",
            }),
          );
        });
      } catch (error) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({ success: false, message: "Données invalides" }),
        );
      }
    });
    return;
  }

  // ----------------------------------------
  // PATCH /api/services/:id/toggle - Activer/Désactiver (admin)
  // ----------------------------------------
  if (pathname.match(/^\/api\/services\/\d+\/toggle$/) && method === "PATCH") {
    const serviceId = pathname.split("/")[3];
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const { actif } = JSON.parse(body);

        Service.toggleStatus(serviceId, actif, (err, result) => {
          if (err) {
            console.error("Erreur toggle service:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({ success: false, message: "Erreur serveur" }),
            );
            return;
          }

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: true,
              message: "Statut modifié avec succès",
            }),
          );
        });
      } catch (error) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({ success: false, message: "Données invalides" }),
        );
      }
    });
    return;
  }

  // ----------------------------------------
  // DELETE /api/services/:id - Supprimer un service (admin)
  // ----------------------------------------
  if (pathname.match(/^\/api\/services\/\d+$/) && method === "DELETE") {
    const serviceId = pathname.split("/")[3];

    Service.delete(serviceId, (err, result) => {
      if (err) {
        console.error("Erreur suppression service:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: false, message: "Erreur serveur" }));
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          message: "Service supprimé avec succès",
        }),
      );
    });
    return;
  }

  // ==========================================================================
  // ROUTES ADMIN - SERVICES PAR HÔTEL
  // ==========================================================================

  // ----------------------------------------
  // GET /api/hotels/:id/services/admin - Services d'un hôtel (admin - tous)
  // ----------------------------------------
  if (
    pathname.match(/^\/api\/hotels\/\d+\/services\/admin$/) &&
    method === "GET"
  ) {
    const hotelId = pathname.split("/")[3];

    Service.getByHotelIdAdmin(hotelId, (err, services) => {
      if (err) {
        console.error("Erreur lors de la récupération des services:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: false, message: "Erreur serveur" }));
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: true, data: services }));
    });
    return;
  }

  // ----------------------------------------
  // PUT /api/hotels/:id/services - Mettre à jour les prix des services (admin)
  // ----------------------------------------
  if (pathname.match(/^\/api\/hotels\/\d+\/services$/) && method === "PUT") {
    const hotelId = pathname.split("/")[3];
    const db = require("../config/database");
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const { services } = JSON.parse(body);

        if (!services || !Array.isArray(services)) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message: "Données services invalides",
            }),
          );
          return;
        }

        // Mettre à jour chaque service
        let updated = 0;
        let errors = 0;

        if (services.length === 0) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: true,
              message: "Aucun service à mettre à jour",
            }),
          );
          return;
        }

        services.forEach((service) => {
          const query = `
          UPDATE HOTEL_SERVICES 
          SET prix_service = ?, disponible = ?
          WHERE id_hotel_service = ? AND id_hotel = ?
        `;

          db.query(
            query,
            [
              service.prix_service,
              service.disponible,
              service.id_hotel_service,
              hotelId,
            ],
            (err) => {
              if (err) {
                console.error("Erreur mise à jour service:", err);
                errors++;
              } else {
                updated++;
              }

              // Dernier service traité
              if (updated + errors === services.length) {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    success: true,
                    message: `${updated} service(s) mis à jour`,
                    updated,
                    errors,
                  }),
                );
              }
            },
          );
        });
      } catch (error) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({ success: false, message: "Données invalides" }),
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
  res.end(JSON.stringify({ success: false, message: "Route non trouvée" }));
}

// ============================================================================
// EXPORT DU MODULE
// ============================================================================
module.exports = serviceRoutes;

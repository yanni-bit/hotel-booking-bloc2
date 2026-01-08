// ============================================================================
// HOTELROUTES.JS - ROUTES API HÔTELS
// Définit les endpoints pour les hôtels
// ============================================================================

const HotelController = require("../controllers/hotelController");
const ChambreController = require("../controllers/chambreController");
const AvisController = require("../controllers/avisController");
const Hotel = require("../models/Hotel");

function hotelRoutes(req, res) {
  const pathname = req.pathname;
  const method = req.method;

  // ========================================
  // GET /api/hotels - Liste tous les hôtels
  // ========================================
  if (pathname === "/api/hotels" && method === "GET") {
    HotelController.getAllHotels(req, res);
    return;
  }

  // ========================================
  // GET /api/destinations - Nombre d'hôtels par ville
  // ========================================
  if (pathname === "/api/destinations" && method === "GET") {
    HotelController.getDestinationsCount(req, res);
    return;
  }

  // ========================================
  // GET /api/cities - Liste des villes distinctes
  // ========================================
  if (pathname === "/api/cities" && method === "GET") {
    const db = require("../config/database");

    db.query(
      "SELECT DISTINCT ville_hotel FROM hotel ORDER BY ville_hotel ASC",
      (err, results) => {
        if (err) {
          console.error("Erreur récupération villes:", err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message: "Erreur serveur",
            })
          );
          return;
        }

        const cities = results.map((row) => row.ville_hotel);

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: true,
            data: cities,
          })
        );
      }
    );
    return;
  }

  // ========================================
  // GET /api/hotels/:id/chambres - Chambres d'un hôtel
  // ========================================
  if (pathname.match(/^\/api\/hotels\/\d+\/chambres$/) && method === "GET") {
    const hotelId = pathname.split("/")[3];
    ChambreController.getChambresByHotelId(req, res, hotelId);
    return;
  }

  // ========================================
  // GET /api/hotels/:id/avis - Avis d'un hôtel
  // ========================================
  if (pathname.match(/^\/api\/hotels\/\d+\/avis$/) && method === "GET") {
    const hotelId = pathname.split("/")[3];
    AvisController.getAvisByHotelId(req, res, hotelId);
    return;
  }

  // ========================================
  // GET /api/hotels/popular/:city - Hôtels populaires d'une ville
  // ========================================
  if (pathname.match(/^\/api\/hotels\/popular\/[^/]+$/) && method === "GET") {
    const city = decodeURIComponent(pathname.split("/")[4]);
    HotelController.getPopularHotels(req, res, city);
    return;
  }

  // ========================================
  // GET /api/hotels/:id - Détails d'un hôtel
  // ========================================
  if (pathname.startsWith("/api/hotels/") && method === "GET") {
    const id = pathname.split("/")[3];

    if (!id || isNaN(id)) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: false,
          message: "ID invalide",
        })
      );
      return;
    }

    HotelController.getHotelDetails(req, res, id); // ← Change cette ligne
    return;
  }

  // ========================================
  // GET /api/chambres/:id - Détails d'une chambre avec offres
  // ========================================
  if (pathname.match(/^\/api\/chambres\/\d+$/) && method === "GET") {
    const chambreId = pathname.split("/")[3];

    const Chambre = require("../models/Chambre");

    Chambre.getByIdWithOffers(chambreId, (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération de la chambre:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: "Erreur serveur",
          })
        );
        return;
      }

      if (!results || results.length === 0) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: "Chambre non trouvée",
          })
        );
        return;
      }

      // Structurer les données : 1 chambre + plusieurs offres
      const chambre = {
        id_chambre: results[0].id_chambre,
        room_id_api: results[0].room_id_api,
        id_hotel: results[0].id_hotel,
        type_room: results[0].type_room,
        cat_room: results[0].cat_room,
        type_lit: results[0].type_lit,
        nbre_lit: results[0].nbre_lit,
        nbre_adults_max: results[0].nbre_adults_max,
        nbre_children_max: results[0].nbre_children_max,
        surface_m2: results[0].surface_m2,
        vue: results[0].vue,
        description_room: results[0].description_room,
        offres: results
          .filter((r) => r.id_offre !== null)
          .map((r) => ({
            id_offre: r.id_offre,
            nom_offre: r.nom_offre,
            description_offre: r.description_offre,
            prix_nuit: r.prix_nuit,
            devise: r.devise,
            remboursable: r.remboursable,
            petit_dejeuner_inclus: r.petit_dejeuner_inclus,
            pension: r.pension,
          })),
      };

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          data: chambre,
        })
      );
    });
    return;
  }

  // ========================================
  // POST /api/hotels - Créer un hôtel
  // ========================================
  if (pathname === "/api/hotels" && method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      console.log("📥 Body reçu (raw):", body); // debug
      try {
        const hotelData = JSON.parse(body);
        console.log("📦 Hotel data parsé:", hotelData); // debug
        console.log(
          "📊 Type nbre_etoile_hotel:",
          typeof hotelData.nbre_etoile_hotel
        ); // debug

        Hotel.create(hotelData, (err, result) => {
          if (err) {
            console.error("Erreur création hôtel:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: false,
                message: "Erreur lors de la création de l'hôtel",
              })
            );
            return;
          }

          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: true,
              message: "Hôtel créé avec succès",
              data: result,
            })
          );
        });
      } catch (error) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: "Données invalides",
          })
        );
      }
    });
    return;
  }

  // ========================================
  // PUT /api/hotels/:id - Mettre à jour un hôtel
  // ========================================
  if (pathname.match(/^\/api\/hotels\/\d+$/) && method === "PUT") {
    const hotelId = pathname.split("/")[3];
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const hotelData = JSON.parse(body);

        Hotel.update(hotelId, hotelData, (err, result) => {
          if (err) {
            console.error("Erreur mise à jour hôtel:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: false,
                message: "Erreur lors de la mise à jour de l'hôtel",
              })
            );
            return;
          }

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: true,
              message: "Hôtel mis à jour avec succès",
            })
          );
        });
      } catch (error) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: "Données invalides",
          })
        );
      }
    });
    return;
  }

  // ========================================
  // DELETE /api/hotels/:id - Supprimer un hôtel
  // ========================================
  if (pathname.match(/^\/api\/hotels\/\d+$/) && method === "DELETE") {
    const hotelId = pathname.split("/")[3];

    Hotel.delete(hotelId, (err, result) => {
      if (err) {
        console.error("Erreur suppression hôtel:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: "Erreur lors de la suppression de l'hôtel",
          })
        );
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          message: "Hôtel supprimé avec succès",
        })
      );
    });
    return;
  }

  // ========================================
  // Route non trouvée
  // ========================================
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      success: false,
      message: "Route non trouvée",
    })
  );
}

module.exports = hotelRoutes;

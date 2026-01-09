// ============================================================================
// HOTELCONTROLLER.JS - LOGIQUE MÉTIER HÔTELS
// Gère les opérations sur les hôtels
// ============================================================================

const Hotel = require("../models/Hotel");

class HotelController {
  // ========================================
  // GET - Récupérer tous les hôtels
  // ========================================
  static getAllHotels(req, res) {
    Hotel.getAll((err, hotels) => {
      if (err) {
        console.error("Erreur lors de la récupération des hôtels:", err);
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

      // Succès
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          count: hotels.length,
          data: hotels,
        })
      );
    });
  }

  // ========================================
  // GET - Récupérer un hôtel par ID
  // ========================================
  static getHotelById(req, res, id) {
    Hotel.getById(id, (err, hotel) => {
      if (err) {
        console.error("Erreur lors de la récupération de l'hôtel:", err);
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

      if (!hotel) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: "Hôtel non trouvé",
          })
        );
        return;
      }

      // Succès
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          data: hotel,
        })
      );
    });
  }

  // ========================================
  // GET - Rechercher des hôtels par ville
  // ========================================
  static searchHotelsByCity(req, res, city) {
    Hotel.getByCity(city, (err, hotels) => {
      if (err) {
        console.error("Erreur lors de la recherche:", err);
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

      // Succès
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          count: hotels.length,
          data: hotels,
        })
      );
    });
  }

  // ========================================
  // GET - Récupérer le nombre d'hôtels par destination
  // ========================================
  static getDestinationsCount(req, res) {
    Hotel.getDestinationsCount((err, destinations) => {
      if (err) {
        console.error("Erreur lors de la récupération des destinations:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: "Erreur serveur",
            error: err.message,
          })
        );
        return;
      }

      // Succès
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          data: destinations,
        })
      );
    });
  }

  // ========================================
  // GET - Récupère un hôtel avec détails complets
  // ========================================
  static getHotelDetails(req, res, id) {
    Hotel.getByIdWithDetails(id, (err, hotel) => {
      if (err) {
        console.error("Erreur lors de la récupération de l'hôtel:", err);
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

      if (!hotel) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: "Hôtel non trouvé",
          })
        );
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          data: hotel,
        })
      );
    });
  }

  // ========================================
  // GET - Récupère les hôtels populaires d'une ville
  // ========================================
  static getPopularHotels(req, res, city) {
    Hotel.getPopularByCity(city, 4, (err, hotels) => {
      if (err) {
        console.error("Erreur:", err);
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

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          data: hotels,
        })
      );
    });
  }

  // ========================================
  // GET - Récupère les hôtels populaires d'un pays
  // ========================================
  static getPopularHotelsByCountry(req, res, country, excludeId) {
    Hotel.getPopularByCountry(country, excludeId, 4, (err, hotels) => {
      if (err) {
        console.error("Erreur:", err);
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

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          data: hotels,
        })
      );
    });
  }

  // ========================================
  // GET - Récupère l'offre du jour d'un pays
  // ========================================
  static getDealOfDayByCountry(req, res, country, excludeId) {
    Hotel.getDealOfDay(country, excludeId, (err, hotel) => {
      if (err) {
        console.error("Erreur:", err);
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

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          data: hotel,
        })
      );
    });
  }
}

module.exports = HotelController;

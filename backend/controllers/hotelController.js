// ============================================================================
// HOTELCONTROLLER.JS - CONTRÔLEUR HÔTELS
// ============================================================================
// Ce contrôleur gère la logique métier des hôtels.
// Responsabilités :
//   - Appel au modèle Hotel
//   - Formatage des réponses HTTP (JSON)
//   - Gestion des codes HTTP (200, 404, 500)
// Pattern utilisé : Classe statique avec méthodes CRUD
// ============================================================================

const Hotel = require("../models/Hotel");

class HotelController {
  // ==========================================================================
  // MÉTHODES DE LECTURE (READ)
  // ==========================================================================

  /**
   * Récupère tous les hôtels
   * @param {Object} req - Requête HTTP
   * @param {Object} res - Réponse HTTP
   * @route GET /api/hotels
   */
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
          }),
        );
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          count: hotels.length,
          data: hotels,
        }),
      );
    });
  }

  /**
   * Récupère un hôtel par son ID avec ses équipements
   * @param {Object} req - Requête HTTP
   * @param {Object} res - Réponse HTTP
   * @param {number} id - ID de l'hôtel
   * @route GET /api/hotels/:id
   */
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
          }),
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
          }),
        );
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          data: hotel,
        }),
      );
    });
  }

  /**
   * Récupère un hôtel avec tous ses détails (statistiques)
   * @param {Object} req - Requête HTTP
   * @param {Object} res - Réponse HTTP
   * @param {number} id - ID de l'hôtel
   * @route GET /api/hotels/:id/details
   * @returns {Object} Hôtel avec nombre de chambres, avis et note moyenne
   */
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
          }),
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
          }),
        );
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          data: hotel,
        }),
      );
    });
  }

  /**
   * Recherche des hôtels par ville
   * @param {Object} req - Requête HTTP
   * @param {Object} res - Réponse HTTP
   * @param {string} city - Nom de la ville (recherche partielle)
   * @route GET /api/hotels/search?city=:city
   */
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
          }),
        );
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          count: hotels.length,
          data: hotels,
        }),
      );
    });
  }

  /**
   * Récupère le nombre d'hôtels par destination (ville/pays)
   * @param {Object} req - Requête HTTP
   * @param {Object} res - Réponse HTTP
   * @route GET /api/hotels/destinations
   * @returns {Object} Liste des destinations avec leur nombre d'hôtels
   */
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
          }),
        );
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          data: destinations,
        }),
      );
    });
  }

  /**
   * Récupère les hôtels populaires d'une ville
   * @param {Object} req - Requête HTTP
   * @param {Object} res - Réponse HTTP
   * @param {string} city - Nom de la ville
   * @route GET /api/hotels/popular?city=:city
   * @returns {Object} Top 4 hôtels de la ville par note
   */
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
          }),
        );
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          data: hotels,
        }),
      );
    });
  }

  /**
   * Récupère les hôtels populaires d'un pays (exclut l'hôtel courant)
   * @param {Object} req - Requête HTTP
   * @param {Object} res - Réponse HTTP
   * @param {string} country - Nom du pays
   * @param {number} excludeId - ID de l'hôtel à exclure
   * @route GET /api/hotels/popular-country?country=:country&exclude=:id
   * @returns {Object} Top 4 hôtels du pays (hors hôtel courant)
   */
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
          }),
        );
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          data: hotels,
        }),
      );
    });
  }

  /**
   * Récupère l'offre du jour d'un pays (meilleur rapport qualité/prix)
   * @param {Object} req - Requête HTTP
   * @param {Object} res - Réponse HTTP
   * @param {string} country - Nom du pays
   * @param {number} excludeId - ID de l'hôtel à exclure
   * @route GET /api/hotels/deal?country=:country&exclude=:id
   * @returns {Object} Hôtel avec le meilleur rapport qualité/prix
   */
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
          }),
        );
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          data: hotel,
        }),
      );
    });
  }
}

module.exports = HotelController;

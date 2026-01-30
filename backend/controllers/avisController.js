// ============================================================================
// AVISCONTROLLER.JS - CONTRÔLEUR AVIS
// ============================================================================
// Ce contrôleur gère la logique métier des avis clients.
// Responsabilités :
//   - Validation des données entrantes
//   - Appel au modèle Avis
//   - Formatage des réponses HTTP (JSON)
// Pattern utilisé : Classe statique avec méthodes CRUD
// ============================================================================

const Avis = require("../models/Avis");

class AvisController {
  // ==========================================================================
  // MÉTHODES DE LECTURE (READ)
  // ==========================================================================

  /**
   * Récupère les avis d'un hôtel
   * @param {Object} req - Requête HTTP
   * @param {Object} res - Réponse HTTP
   * @param {number} hotelId - ID de l'hôtel
   * @route GET /api/hotels/:id/avis
   */
  static getAvisByHotelId(req, res, hotelId) {
    Avis.getByHotelId(hotelId, (err, avis) => {
      if (err) {
        console.error("Erreur lors de la récupération des avis:", err);
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
          count: avis.length,
          data: avis,
        }),
      );
    });
  }

  /**
   * Récupère tous les avis (administration)
   * @param {Object} req - Requête HTTP
   * @param {Object} res - Réponse HTTP
   * @route GET /api/admin/avis
   */
  static getAllAvis(req, res) {
    Avis.getAll((err, avis) => {
      if (err) {
        console.error("Erreur lors de la récupération des avis:", err);
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
          count: avis.length,
          data: avis,
        }),
      );
    });
  }

  /**
   * Récupère les avis récents - 7 derniers jours (administration)
   * @param {Object} req - Requête HTTP
   * @param {Object} res - Réponse HTTP
   * @route GET /api/admin/avis/recent
   */
  static getRecentAvis(req, res) {
    Avis.getRecent((err, avis) => {
      if (err) {
        console.error("Erreur lors de la récupération des avis récents:", err);
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
          count: avis.length,
          data: avis,
        }),
      );
    });
  }

  /**
   * Compte les nouveaux avis - 7 derniers jours (administration)
   * @param {Object} req - Requête HTTP
   * @param {Object} res - Réponse HTTP
   * @route GET /api/admin/avis/count
   */
  static countNewAvis(req, res) {
    Avis.countNew((err, count) => {
      if (err) {
        console.error("Erreur lors du comptage des avis:", err);
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
          data: { newCount: count },
        }),
      );
    });
  }

  // ==========================================================================
  // MÉTHODE DE CRÉATION (CREATE)
  // ==========================================================================

  /**
   * Crée un nouvel avis (utilisateur connecté)
   * @param {Object} req - Requête HTTP avec body JSON
   * @param {Object} res - Réponse HTTP
   * @route POST /api/avis
   * @body {number} id_hotel - ID de l'hôtel (requis)
   * @body {number} id_user - ID de l'utilisateur (requis)
   * @body {number} note - Note entre 1 et 10 (requis)
   * @body {string} commentaire - Minimum 10 caractères (requis)
   */
  static createAvis(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const avisData = JSON.parse(body);

        // Validation des champs obligatoires
        if (
          !avisData.id_hotel ||
          !avisData.id_user ||
          !avisData.note ||
          !avisData.commentaire
        ) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message:
                "Champs obligatoires manquants (id_hotel, id_user, note, commentaire)",
            }),
          );
          return;
        }

        // Validation de la note (entre 1 et 10)
        const note = parseFloat(avisData.note);
        if (isNaN(note) || note < 1 || note > 10) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message: "La note doit être comprise entre 1 et 10",
            }),
          );
          return;
        }

        // Validation du commentaire (min 10 caractères)
        if (avisData.commentaire.trim().length < 10) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message: "Le commentaire doit contenir au moins 10 caractères",
            }),
          );
          return;
        }

        Avis.create(avisData, (err, result) => {
          if (err) {
            console.error("Erreur lors de la création de l'avis:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: false,
                message: "Erreur lors de la création de l'avis",
              }),
            );
            return;
          }

          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: true,
              message: "Avis créé avec succès",
              data: { id_avis: result.id_avis },
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
  }

  // ==========================================================================
  // MÉTHODE DE MISE À JOUR (UPDATE)
  // ==========================================================================

  /**
   * Met à jour un avis (utilisateur propriétaire uniquement)
   * @param {Object} req - Requête HTTP avec body JSON
   * @param {Object} res - Réponse HTTP
   * @param {number} avisId - ID de l'avis à modifier
   * @route PUT /api/avis/:id
   * @body {number} id_user - ID de l'utilisateur (pour vérification propriété)
   * @body {number} note - Note entre 1 et 10 (requis)
   * @body {string} commentaire - Minimum 10 caractères (requis)
   */
  static updateAvis(req, res, avisId) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const avisData = JSON.parse(body);

        // Validation des champs obligatoires
        if (!avisData.id_user || !avisData.note || !avisData.commentaire) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message:
                "Champs obligatoires manquants (id_user, note, commentaire)",
            }),
          );
          return;
        }

        // Validation de la note (entre 1 et 10)
        const note = parseFloat(avisData.note);
        if (isNaN(note) || note < 1 || note > 10) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message: "La note doit être comprise entre 1 et 10",
            }),
          );
          return;
        }

        // Validation du commentaire (min 10 caractères)
        if (avisData.commentaire.trim().length < 10) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message: "Le commentaire doit contenir au moins 10 caractères",
            }),
          );
          return;
        }

        Avis.update(avisId, avisData.id_user, avisData, (err, result) => {
          if (err) {
            console.error("Erreur lors de la modification de l'avis:", err);

            // Gestion des codes HTTP selon le type d'erreur
            if (err.message === "Non autorisé à modifier cet avis") {
              res.statusCode = 403; // Forbidden
            } else if (err.message === "Avis non trouvé") {
              res.statusCode = 404; // Not Found
            } else {
              res.statusCode = 500; // Internal Server Error
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
              message: "Avis modifié avec succès",
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
  }

  // ==========================================================================
  // MÉTHODE DE SUPPRESSION (DELETE)
  // ==========================================================================

  /**
   * Supprime un avis (administration)
   * @param {Object} req - Requête HTTP
   * @param {Object} res - Réponse HTTP
   * @param {number} avisId - ID de l'avis à supprimer
   * @route DELETE /api/admin/avis/:id
   */
  static deleteAvis(req, res, avisId) {
    Avis.delete(avisId, (err, result) => {
      if (err) {
        console.error("Erreur lors de la suppression de l'avis:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: "Erreur lors de la suppression",
          }),
        );
        return;
      }

      if (!result.deleted) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: "Avis non trouvé",
          }),
        );
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          message: "Avis supprimé avec succès",
        }),
      );
    });
  }
}

module.exports = AvisController;

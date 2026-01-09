// ============================================================================
// AVISCONTROLLER.JS - LOGIQUE MÉTIER AVIS
// Gère les opérations sur les avis clients
// ============================================================================

const Avis = require('../models/Avis');

class AvisController {
  
  /**
   * Récupère les avis d'un hôtel
   */
  static getAvisByHotelId(req, res, hotelId) {
    Avis.getByHotelId(hotelId, (err, avis) => {
      if (err) {
        console.error('Erreur lors de la récupération des avis:', err);
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
        count: avis.length,
        data: avis
      }));
    });
  }

  /**
   * Crée un nouvel avis (utilisateur connecté)
   */
  static createAvis(req, res) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const avisData = JSON.parse(body);

        // Validation des champs obligatoires
        if (!avisData.id_hotel || !avisData.id_user || !avisData.note || !avisData.commentaire) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            message: 'Champs obligatoires manquants (id_hotel, id_user, note, commentaire)'
          }));
          return;
        }

        // Validation de la note (entre 1 et 10)
        const note = parseFloat(avisData.note);
        if (isNaN(note) || note < 1 || note > 10) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            message: 'La note doit être comprise entre 1 et 10'
          }));
          return;
        }

        // Validation du commentaire (min 10 caractères)
        if (avisData.commentaire.trim().length < 10) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            message: 'Le commentaire doit contenir au moins 10 caractères'
          }));
          return;
        }

        Avis.create(avisData, (err, result) => {
          if (err) {
            console.error('Erreur lors de la création de l\'avis:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              message: 'Erreur lors de la création de l\'avis'
            }));
            return;
          }

          res.statusCode = 201;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            message: 'Avis créé avec succès',
            data: { id_avis: result.id_avis }
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
  }

  /**
   * Récupère tous les avis (admin)
   */
  static getAllAvis(req, res) {
    Avis.getAll((err, avis) => {
      if (err) {
        console.error('Erreur lors de la récupération des avis:', err);
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
        count: avis.length,
        data: avis
      }));
    });
  }

  /**
   * Récupère les avis récents (admin)
   */
  static getRecentAvis(req, res) {
    Avis.getRecent((err, avis) => {
      if (err) {
        console.error('Erreur lors de la récupération des avis récents:', err);
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
        count: avis.length,
        data: avis
      }));
    });
  }

  /**
   * Compte les nouveaux avis (admin)
   */
  static countNewAvis(req, res) {
    Avis.countNew((err, count) => {
      if (err) {
        console.error('Erreur lors du comptage des avis:', err);
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
        data: { newCount: count }
      }));
    });
  }

  /**
   * Supprime un avis (admin)
   */
  static deleteAvis(req, res, avisId) {
    Avis.delete(avisId, (err, result) => {
      if (err) {
        console.error('Erreur lors de la suppression de l\'avis:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Erreur lors de la suppression'
        }));
        return;
      }

      if (!result.deleted) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Avis non trouvé'
        }));
        return;
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: 'Avis supprimé avec succès'
      }));
    });
  }

  /**
   * Met à jour un avis (utilisateur propriétaire uniquement)
   */
  static updateAvis(req, res, avisId) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const avisData = JSON.parse(body);

        // Validation des champs obligatoires
        if (!avisData.id_user || !avisData.note || !avisData.commentaire) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            message: 'Champs obligatoires manquants (id_user, note, commentaire)'
          }));
          return;
        }

        // Validation de la note (entre 1 et 10)
        const note = parseFloat(avisData.note);
        if (isNaN(note) || note < 1 || note > 10) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            message: 'La note doit être comprise entre 1 et 10'
          }));
          return;
        }

        // Validation du commentaire (min 10 caractères)
        if (avisData.commentaire.trim().length < 10) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            message: 'Le commentaire doit contenir au moins 10 caractères'
          }));
          return;
        }

        Avis.update(avisId, avisData.id_user, avisData, (err, result) => {
          if (err) {
            console.error('Erreur lors de la modification de l\'avis:', err);
            
            if (err.message === 'Non autorisé à modifier cet avis') {
              res.statusCode = 403;
            } else if (err.message === 'Avis non trouvé') {
              res.statusCode = 404;
            } else {
              res.statusCode = 500;
            }
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              message: err.message || 'Erreur lors de la modification'
            }));
            return;
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            message: 'Avis modifié avec succès'
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
  }
}

module.exports = AvisController;
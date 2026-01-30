// ============================================================================
// SERVICE.JS - MODÈLE SERVICES ADDITIONNELS
// ============================================================================
// Ce modèle gère les opérations CRUD sur les services additionnels.
// Architecture :
//   - SERVICES_ADDITIONNELS : catalogue global des services
//   - HOTEL_SERVICES : liaison service ↔ hôtel avec prix personnalisé
//   - RESERVATION_SERVICES : services réservés par le client
// Pattern utilisé : Classe statique (méthodes sans instanciation)
// Sécurité : Requêtes préparées (?) pour prévenir les injections SQL
// ============================================================================

const db = require("../config/database");

class Service {
  // ==========================================================================
  // MÉTHODES DE LECTURE (READ)
  // ==========================================================================

  /**
   * Récupère tous les services actifs (catalogue global)
   * @param {function} callback - Fonction de rappel (err, results)
   */
  static getAll(callback) {
    const query = `
      SELECT * 
      FROM SERVICES_ADDITIONNELS
      WHERE actif = 1
      ORDER BY id_service
    `;

    db.query(query, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  /**
   * Récupère tous les services incluant les inactifs (administration)
   * @param {function} callback - Fonction de rappel (err, results)
   */
  static getAllAdmin(callback) {
    const query = `
      SELECT * 
      FROM SERVICES_ADDITIONNELS
      ORDER BY id_service
    `;

    db.query(query, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  /**
   * Récupère un service par son ID
   * @param {number} serviceId - ID du service
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static getById(serviceId, callback) {
    const query = `
      SELECT * FROM SERVICES_ADDITIONNELS
      WHERE id_service = ?
    `;

    db.query(query, [serviceId], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      if (!results || results.length === 0) {
        return callback(new Error("Service non trouvé"), null);
      }
      callback(null, results[0]);
    });
  }

  /**
   * Récupère les services DISPONIBLES d'un hôtel (pour réservation)
   * @param {number} hotelId - ID de l'hôtel
   * @param {function} callback - Fonction de rappel (err, results)
   * @description Filtre sur disponible=1 et actif=1
   */
  static getByHotelId(hotelId, callback) {
    const query = `
      SELECT 
        hs.id_hotel_service,
        hs.id_hotel,
        hs.id_service,
        hs.prix_service,
        hs.disponible,
        s.nom_service,
        s.description_service,
        s.type_service,
        s.icone_service
      FROM HOTEL_SERVICES hs
      INNER JOIN SERVICES_ADDITIONNELS s ON hs.id_service = s.id_service
      WHERE hs.id_hotel = ? 
        AND hs.disponible = 1
        AND s.actif = 1
      ORDER BY s.id_service
    `;

    db.query(query, [hotelId], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  /**
   * Récupère TOUS les services d'un hôtel (administration)
   * @param {number} hotelId - ID de l'hôtel
   * @param {function} callback - Fonction de rappel (err, results)
   * @description Inclut les services non disponibles (pour gestion admin)
   */
  static getByHotelIdAdmin(hotelId, callback) {
    const query = `
      SELECT 
        hs.id_hotel_service,
        hs.id_hotel,
        hs.id_service,
        hs.prix_service,
        hs.disponible,
        s.nom_service,
        s.description_service,
        s.type_service,
        s.icone_service
      FROM HOTEL_SERVICES hs
      INNER JOIN SERVICES_ADDITIONNELS s ON hs.id_service = s.id_service
      WHERE hs.id_hotel = ?
        AND s.actif = 1
      ORDER BY s.id_service
    `;

    db.query(query, [hotelId], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  // ==========================================================================
  // MÉTHODE DE CRÉATION (CREATE)
  // ==========================================================================

  /**
   * Crée un nouveau service ET l'ajoute à tous les hôtels
   * @param {Object} serviceData - Données du service
   * @param {string} serviceData.nom_service - Nom du service (requis)
   * @param {string} [serviceData.description_service] - Description
   * @param {string} [serviceData.type_service] - Type : unitaire, journalier, par_personne, sejour
   * @param {string} [serviceData.icone_service] - Classe Bootstrap Icons (ex: bi-wifi)
   * @param {number} [serviceData.actif] - 1 = actif, 0 = inactif
   * @param {number} [serviceData.prix_defaut] - Prix par défaut pour tous les hôtels (20€)
   * @param {function} callback - Fonction de rappel (err, result)
   * @description Propage automatiquement le nouveau service à tous les hôtels
   */
  static create(serviceData, callback) {
    const query = `
      INSERT INTO SERVICES_ADDITIONNELS 
      (nom_service, description_service, type_service, icone_service, actif)
      VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
      serviceData.nom_service,
      serviceData.description_service || null,
      serviceData.type_service || "unitaire",
      serviceData.icone_service || "bi-star",
      serviceData.actif !== undefined ? serviceData.actif : 1,
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        return callback(err, null);
      }

      const newServiceId = result.insertId;
      const prixDefaut = serviceData.prix_defaut || 20.0;

      // Propagation : Ajouter ce service à tous les hôtels existants
      const addToHotelsQuery = `
        INSERT INTO HOTEL_SERVICES (id_hotel, id_service, prix_service, disponible)
        SELECT id_hotel, ?, ?, 1 FROM HOTEL
      `;

      db.query(
        addToHotelsQuery,
        [newServiceId, prixDefaut],
        (err2, result2) => {
          if (err2) {
            console.error("Erreur ajout service aux hôtels:", err2);
          }
          callback(null, { id_service: newServiceId });
        },
      );
    });
  }

  /**
   * Ajoute les services sélectionnés à une réservation
   * @param {number} reservationId - ID de la réservation
   * @param {Array} services - Liste des services à ajouter
   * @param {number} services[].id_hotel_service - ID du service hôtel
   * @param {number} services[].prix_unitaire - Prix unitaire
   * @param {number} [services[].quantite] - Quantité (défaut: 1)
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static addToReservation(reservationId, services, callback) {
    if (!services || services.length === 0) {
      return callback(null, { message: "Aucun service à ajouter" });
    }

    const values = services.map((service) => [
      reservationId,
      service.id_hotel_service,
      service.quantite || 1,
      service.prix_unitaire,
      (service.quantite || 1) * service.prix_unitaire,
    ]);

    const query = `
      INSERT INTO RESERVATION_SERVICES 
        (id_reservation, id_hotel_service, quantite, prix_unitaire, sous_total)
      VALUES ?
    `;

    db.query(query, [values], (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  }

  // ==========================================================================
  // MÉTHODES DE MISE À JOUR (UPDATE)
  // ==========================================================================

  /**
   * Met à jour un service existant
   * @param {number} serviceId - ID du service à modifier
   * @param {Object} serviceData - Nouvelles données
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static update(serviceId, serviceData, callback) {
    const query = `
      UPDATE SERVICES_ADDITIONNELS
      SET 
        nom_service = ?,
        description_service = ?,
        type_service = ?,
        icone_service = ?,
        actif = ?
      WHERE id_service = ?
    `;

    const values = [
      serviceData.nom_service,
      serviceData.description_service || null,
      serviceData.type_service || "unitaire",
      serviceData.icone_service || "bi-star",
      serviceData.actif !== undefined ? serviceData.actif : 1,
      serviceId,
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  }

  /**
   * Active ou désactive un service
   * @param {number} serviceId - ID du service
   * @param {number} actif - 1 = activer, 0 = désactiver
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static toggleStatus(serviceId, actif, callback) {
    const query = `
      UPDATE SERVICES_ADDITIONNELS
      SET actif = ?
      WHERE id_service = ?
    `;

    db.query(query, [actif, serviceId], (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  }

  // ==========================================================================
  // MÉTHODE DE SUPPRESSION (DELETE)
  // ==========================================================================

  /**
   * Supprime un service ET le retire de tous les hôtels
   * @param {number} serviceId - ID du service à supprimer
   * @param {function} callback - Fonction de rappel (err, result)
   * @description Supprime d'abord les liaisons HOTEL_SERVICES puis le service
   */
  static delete(serviceId, callback) {
    // Étape 1 : Supprimer les liaisons avec les hôtels
    const deleteFromHotelsQuery = `
      DELETE FROM HOTEL_SERVICES WHERE id_service = ?
    `;

    db.query(deleteFromHotelsQuery, [serviceId], (err) => {
      if (err) {
        console.error("Erreur suppression service des hôtels:", err);
      }

      // Étape 2 : Supprimer le service lui-même
      const deleteServiceQuery = `
        DELETE FROM SERVICES_ADDITIONNELS WHERE id_service = ?
      `;

      db.query(deleteServiceQuery, [serviceId], (err2, result) => {
        if (err2) {
          return callback(err2, null);
        }
        callback(null, result);
      });
    });
  }
}

module.exports = Service;

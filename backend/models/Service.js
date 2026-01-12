// ============================================================================
// SERVICE.JS - MODÈLE SERVICES ADDITIONNELS
// Gère les opérations sur les services additionnels
// ============================================================================

const db = require("../config/database");

class Service {
  /**
   * Récupère tous les services additionnels (catalogue global)
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
   * Récupère les services DISPONIBLES d'un hôtel (pour booking)
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
   * Récupère TOUS les services d'un hôtel (pour admin)
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

  /**
   * Ajoute les services sélectionnés à une réservation
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

  /**
   * Récupère tous les services (incluant inactifs - pour admin)
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
   * Crée un nouveau service ET l'ajoute à tous les hôtels
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

      // Ajouter ce service à tous les hôtels
      const addToHotelsQuery = `
        INSERT INTO HOTEL_SERVICES (id_hotel, id_service, prix_service, disponible)
        SELECT id_hotel, ?, ?, 1 FROM HOTEL
      `;

      db.query(addToHotelsQuery, [newServiceId, prixDefaut], (err2, result2) => {
        if (err2) {
          console.error("Erreur ajout service aux hôtels:", err2);
        }
        callback(null, { id_service: newServiceId });
      });
    });
  }

  /**
   * Met à jour un service
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
   * Supprime un service ET le retire de tous les hôtels
   */
  static delete(serviceId, callback) {
    const deleteFromHotelsQuery = `
      DELETE FROM HOTEL_SERVICES WHERE id_service = ?
    `;

    db.query(deleteFromHotelsQuery, [serviceId], (err) => {
      if (err) {
        console.error("Erreur suppression service des hôtels:", err);
      }

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

  /**
   * Active/Désactive un service
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
}

module.exports = Service;
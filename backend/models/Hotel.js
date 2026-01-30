// ============================================================================
// HOTEL.JS - MODÈLE HOTEL
// ============================================================================
// Ce modèle gère toutes les opérations CRUD sur les hôtels.
// Pattern utilisé : Classe statique (méthodes sans instanciation)
// Sécurité : Requêtes préparées (?) pour prévenir les injections SQL
// ============================================================================

const db = require("../config/database");

class Hotel {
  // ==========================================================================
  // MÉTHODES DE LECTURE (READ)
  // ==========================================================================

  /**
   * Récupère tous les hôtels
   * @param {function} callback - Fonction de rappel (err, results)
   * @description Retourne les hôtels triés par note moyenne décroissante
   */
  static getAll(callback) {
    const query = `
      SELECT 
        id_hotel,
        nom_hotel,
        description_hotel,
        ville_hotel,
        pays_hotel,
        nbre_etoile_hotel,
        note_moy_hotel,
        img_hotel
      FROM HOTEL
      ORDER BY note_moy_hotel DESC
    `;

    db.query(query, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  /**
   * Récupère un hôtel par son ID avec ses équipements
   * @param {number} id - ID de l'hôtel
   * @param {function} callback - Fonction de rappel (err, result)
   * @description Inclut les amenities (parking, wifi, piscine, etc.)
   */
  static getById(id, callback) {
    const query = `
      SELECT 
        h.*,
        ha.parking, ha.restaurant, ha.wi_fi, ha.piscine, ha.spa, ha.salle_sport
      FROM HOTEL h
      LEFT JOIN HOTEL_AMENITIES ha ON h.id_hotel = ha.id_hotel
      WHERE h.id_hotel = ?
    `;

    db.query(query, [id], (err, results) => {
      if (err) {
        return callback(err, null);
      }

      if (results.length === 0) {
        return callback(null, null);
      }

      callback(null, results[0]);
    });
  }

  /**
   * Récupère un hôtel avec tous ses détails (statistiques)
   * @param {number} id - ID de l'hôtel
   * @param {function} callback - Fonction de rappel (err, result)
   * @description Inclut le nombre de chambres, d'avis et la note moyenne calculée
   */
  static getByIdWithDetails(id, callback) {
    const query = `
      SELECT 
        h.*,
        COUNT(DISTINCT c.id_chambre) as nombre_chambres,
        COUNT(DISTINCT a.id_avis) as nombre_avis,
        AVG(a.note) as note_moyenne
      FROM HOTEL h
      LEFT JOIN CHAMBRE c ON h.id_hotel = c.id_hotel
      LEFT JOIN AVIS a ON h.id_hotel = a.id_hotel
      WHERE h.id_hotel = ?
      GROUP BY h.id_hotel
    `;

    db.query(query, [id], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results[0]);
    });
  }

  /**
   * Recherche des hôtels par ville
   * @param {string} city - Nom de la ville (recherche partielle)
   * @param {function} callback - Fonction de rappel (err, results)
   */
  static getByCity(city, callback) {
    const query = `
      SELECT 
        id_hotel,
        nom_hotel,
        ville_hotel,
        pays_hotel,
        nbre_etoile_hotel,
        note_moy_hotel,
        img_hotel
      FROM HOTEL
      WHERE ville_hotel LIKE ?
      ORDER BY note_moy_hotel DESC
    `;

    db.query(query, [`%${city}%`], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  /**
   * Compte le nombre d'hôtels par ville (pour les destinations)
   * @param {function} callback - Fonction de rappel (err, results)
   * @description Utilisé pour afficher les destinations avec leur nombre d'hôtels
   */
  static getDestinationsCount(callback) {
    const query = `
      SELECT 
        ville_hotel,
        pays_hotel,
        COUNT(*) as nombre_hotels
      FROM HOTEL
      GROUP BY ville_hotel, pays_hotel
      ORDER BY ville_hotel
    `;

    db.query(query, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  /**
   * Récupère les hôtels populaires d'une même ville
   * @param {string} city - Nom de la ville
   * @param {number} limit - Nombre maximum de résultats
   * @param {function} callback - Fonction de rappel (err, results)
   */
  static getPopularByCity(city, limit, callback) {
    const query = `
      SELECT 
        h.*,
        AVG(a.note) as note_moyenne
      FROM HOTEL h
      LEFT JOIN AVIS a ON h.id_hotel = a.id_hotel
      WHERE h.ville_hotel = ?
      GROUP BY h.id_hotel
      ORDER BY note_moyenne DESC, h.nbre_etoile_hotel DESC
      LIMIT ?
    `;

    db.query(query, [city, limit], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  /**
   * Récupère les hôtels populaires d'un même pays
   * @param {string} country - Nom du pays
   * @param {number} excludeHotelId - ID de l'hôtel à exclure des résultats
   * @param {number} limit - Nombre maximum de résultats
   * @param {function} callback - Fonction de rappel (err, results)
   * @description Utilisé pour la section "Hôtels populaires dans la région"
   */
  static getPopularByCountry(country, excludeHotelId, limit, callback) {
    const query = `
      SELECT 
        h.id_hotel,
        h.nom_hotel,
        h.ville_hotel,
        h.pays_hotel,
        h.nbre_etoile_hotel,
        h.note_moy_hotel,
        h.img_hotel,
        MIN(o.prix_nuit) as prix_min
      FROM HOTEL h
      LEFT JOIN CHAMBRE c ON h.id_hotel = c.id_hotel
      LEFT JOIN OFFRE o ON c.id_chambre = o.id_chambre
      WHERE h.pays_hotel = ? AND h.id_hotel != ?
      GROUP BY h.id_hotel
      ORDER BY h.note_moy_hotel DESC, h.nbre_etoile_hotel DESC
      LIMIT ?
    `;

    db.query(query, [country, excludeHotelId, limit], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  /**
   * Récupère l'offre du jour (meilleur rapport qualité/prix)
   * @param {string} country - Nom du pays
   * @param {number} excludeHotelId - ID de l'hôtel à exclure
   * @param {function} callback - Fonction de rappel (err, result)
   * @description Calcule le rapport qualité/prix : (note / prix) * 100
   */
  static getDealOfDay(country, excludeHotelId, callback) {
    const query = `
      SELECT 
        h.id_hotel,
        h.nom_hotel,
        h.ville_hotel,
        h.pays_hotel,
        h.nbre_etoile_hotel,
        h.note_moy_hotel,
        h.img_hotel,
        MIN(o.prix_nuit) as prix_min,
        (h.note_moy_hotel / MIN(o.prix_nuit)) * 100 as rapport_qualite_prix
      FROM HOTEL h
      LEFT JOIN CHAMBRE c ON h.id_hotel = c.id_hotel
      LEFT JOIN OFFRE o ON c.id_chambre = o.id_chambre
      WHERE h.pays_hotel = ? AND h.id_hotel != ? AND o.prix_nuit IS NOT NULL
      GROUP BY h.id_hotel
      ORDER BY rapport_qualite_prix DESC
      LIMIT 1
    `;

    db.query(query, [country, excludeHotelId], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results[0] || null);
    });
  }

  // ==========================================================================
  // MÉTHODE DE CRÉATION (CREATE)
  // ==========================================================================

  /**
   * Crée un nouvel hôtel
   * @param {Object} hotelData - Données de l'hôtel
   * @param {string} hotelData.nom_hotel - Nom de l'hôtel (requis)
   * @param {string} hotelData.description_hotel - Description (requis)
   * @param {string} hotelData.ville_hotel - Ville (requis)
   * @param {string} hotelData.pays_hotel - Pays (requis)
   * @param {number} [hotelData.nbre_etoile_hotel] - Nombre d'étoiles (défaut: 3)
   * @param {string} [hotelData.img_hotel] - Image (défaut: image par défaut)
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static create(hotelData, callback) {
    const query = `
      INSERT INTO HOTEL (
        nom_hotel,
        description_hotel,
        rue_hotel,
        code_postal_hotel,
        ville_hotel,
        pays_hotel,
        tel_hotel,
        email_hotel,
        site_web_hotel,
        img_hotel,
        nbre_etoile_hotel,
        latitude,
        longitude
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      hotelData.nom_hotel,
      hotelData.description_hotel,
      hotelData.rue_hotel,
      hotelData.code_postal_hotel,
      hotelData.ville_hotel,
      hotelData.pays_hotel,
      hotelData.tel_hotel || null,
      hotelData.email_hotel || null,
      hotelData.site_web_hotel || null,
      hotelData.img_hotel || "images/default-hotel.jpg",
      hotelData.nbre_etoile_hotel || 3,
      hotelData.latitude || null,
      hotelData.longitude || null,
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id_hotel: result.insertId });
    });
  }

  // ==========================================================================
  // MÉTHODE DE MISE À JOUR (UPDATE)
  // ==========================================================================

  /**
   * Met à jour un hôtel existant
   * @param {number} hotelId - ID de l'hôtel à modifier
   * @param {Object} hotelData - Nouvelles données de l'hôtel
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static update(hotelId, hotelData, callback) {
    const query = `
      UPDATE HOTEL SET
        nom_hotel = ?,
        description_hotel = ?,
        rue_hotel = ?,
        code_postal_hotel = ?,
        ville_hotel = ?,
        pays_hotel = ?,
        tel_hotel = ?,
        email_hotel = ?,
        site_web_hotel = ?,
        img_hotel = ?,
        nbre_etoile_hotel = ?,
        latitude = ?,
        longitude = ?
      WHERE id_hotel = ?
    `;

    const values = [
      hotelData.nom_hotel,
      hotelData.description_hotel,
      hotelData.rue_hotel,
      hotelData.code_postal_hotel,
      hotelData.ville_hotel,
      hotelData.pays_hotel,
      hotelData.tel_hotel || null,
      hotelData.email_hotel || null,
      hotelData.site_web_hotel || null,
      hotelData.img_hotel,
      hotelData.nbre_etoile_hotel,
      hotelData.latitude || null,
      hotelData.longitude || null,
      hotelId,
    ];

    db.query(query, values, (err, result) => {
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
   * Supprime un hôtel
   * @param {number} hotelId - ID de l'hôtel à supprimer
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static delete(hotelId, callback) {
    const query = "DELETE FROM HOTEL WHERE id_hotel = ?";

    db.query(query, [hotelId], (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  }
}

module.exports = Hotel;

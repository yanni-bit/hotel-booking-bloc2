// ============================================================================
// RESERVATION.JS - MODÈLE RESERVATION
// ============================================================================
// Ce modèle gère les opérations CRUD sur les réservations.
// Une réservation est liée à : un utilisateur, une offre, un hôtel, une chambre.
// Pattern utilisé : Classe statique (méthodes sans instanciation)
// Sécurité : Requêtes préparées (?) pour prévenir les injections SQL
// ============================================================================

const db = require("../config/database");

class Reservation {
  // ==========================================================================
  // MÉTHODES UTILITAIRES
  // ==========================================================================

  /**
   * Génère un numéro de confirmation unique
   * @returns {string} Numéro de confirmation au format BYT-[timestamp]-[random]
   * @description Utilise timestamp base36 + chaîne aléatoire pour unicité
   */
  static generateConfirmationNumber() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `BYT-${timestamp}-${random}`;
  }

  // ==========================================================================
  // MÉTHODE DE CRÉATION (CREATE)
  // ==========================================================================

  /**
   * Crée une nouvelle réservation avec ses services
   * @param {Object} reservationData - Données de la réservation
   * @param {number} reservationData.id_offre - ID de l'offre choisie
   * @param {number} reservationData.id_hotel - ID de l'hôtel
   * @param {number} reservationData.id_chambre - ID de la chambre
   * @param {string} reservationData.check_in - Date d'arrivée (YYYY-MM-DD)
   * @param {string} reservationData.check_out - Date de départ (YYYY-MM-DD)
   * @param {number} reservationData.nbre_nuits - Nombre de nuits
   * @param {number} reservationData.nbre_adults - Nombre d'adultes
   * @param {number} reservationData.nbre_children - Nombre d'enfants
   * @param {number} reservationData.prix_nuit - Prix par nuit
   * @param {number} reservationData.total_price - Prix total
   * @param {string} reservationData.devise - Devise (EUR, USD, etc.)
   * @param {Array} [reservationData.services] - Services additionnels
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static create(reservationData, callback) {
    const numConfirmation = this.generateConfirmationNumber();

    const query = `
      INSERT INTO RESERVATION (
        id_user,
        id_offre,
        id_hotel,
        id_chambre,
        check_in,
        check_out,
        nbre_nuits,
        nbre_adults,
        nbre_children,
        prix_nuit,
        total_price,
        devise,
        special_requests,
        num_confirmation,
        id_statut
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      reservationData.id_user || null,
      reservationData.id_offre,
      reservationData.id_hotel,
      reservationData.id_chambre,
      reservationData.check_in,
      reservationData.check_out,
      reservationData.nbre_nuits,
      reservationData.nbre_adults,
      reservationData.nbre_children,
      reservationData.prix_nuit,
      reservationData.total_price,
      reservationData.devise,
      reservationData.special_requests || null,
      numConfirmation,
      reservationData.id_statut || 1,
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Erreur lors de la création de la réservation:", err);
        return callback(err, null);
      }

      const reservationId = result.insertId;

      // Si des services sont sélectionnés, les enregistrer
      if (reservationData.services && reservationData.services.length > 0) {
        this.addServicesToReservation(
          reservationId,
          reservationData.services,
          reservationData.nbre_nuits,
          reservationData.nbre_adults,
          (errServices) => {
            if (errServices) {
              console.error(
                "Erreur lors de l'ajout des services:",
                errServices,
              );
              // On continue quand même, la réservation est créée
            }

            callback(null, {
              id_reservation: reservationId,
              num_confirmation: numConfirmation,
            });
          },
        );
      } else {
        callback(null, {
          id_reservation: reservationId,
          num_confirmation: numConfirmation,
        });
      }
    });
  }

  /**
   * Ajoute les services additionnels à une réservation
   * @param {number} reservationId - ID de la réservation
   * @param {Array} services - Liste des services à ajouter
   * @param {number} nbreNuits - Nombre de nuits (pour calcul)
   * @param {number} nbreAdults - Nombre d'adultes (pour calcul)
   * @param {function} callback - Fonction de rappel (err, result)
   * @description Calcule le prix selon le type de service :
   *              - journalier : prix × nombre de nuits
   *              - par_personne : prix × nuits × adultes
   *              - sejour/unitaire : prix fixe
   */
  static addServicesToReservation(
    reservationId,
    services,
    nbreNuits,
    nbreAdults,
    callback,
  ) {
    if (!services || services.length === 0) {
      return callback(null);
    }

    const insertQuery = `
      INSERT INTO RESERVATION_SERVICES 
      (id_reservation, id_hotel_service, quantite, prix_unitaire, sous_total) 
      VALUES ?
    `;

    const values = services.map((service) => {
      let quantite = service.quantite || 1;
      let prixUnitaire = parseFloat(service.prix_service) || 0;
      let sousTotal = prixUnitaire;

      // Calcul selon le type de service
      if (service.type_service === "journalier") {
        quantite = nbreNuits;
        sousTotal = prixUnitaire * nbreNuits;
      } else if (service.type_service === "par_personne") {
        quantite = nbreNuits * nbreAdults;
        sousTotal = prixUnitaire * nbreNuits * nbreAdults;
      }
      // 'sejour' et 'unitaire' = prix fixe

      return [
        reservationId,
        service.id_hotel_service,
        quantite,
        prixUnitaire,
        sousTotal,
      ];
    });

    db.query(insertQuery, [values], (err, result) => {
      if (err) {
        return callback(err);
      }
      callback(null, result);
    });
  }

  // ==========================================================================
  // MÉTHODES DE LECTURE (READ)
  // ==========================================================================

  /**
   * Récupère une réservation par son ID (avec vérification de propriété)
   * @param {number} reservationId - ID de la réservation
   * @param {number} userId - ID de l'utilisateur (pour vérification)
   * @param {function} callback - Fonction de rappel (err, result)
   * @description Sécurité : vérifie que l'utilisateur est bien le propriétaire
   */
  static getById(reservationId, userId, callback) {
    const query = `
      SELECT 
        r.*,
        h.nom_hotel,
        h.ville_hotel,
        h.pays_hotel,
        h.img_hotel,
        ch.type_room,
        ch.cat_room,
        o.nom_offre,
        o.pension,
        s.nom_statut,
        s.couleur as couleur_statut
      FROM RESERVATION r
      INNER JOIN HOTEL h ON r.id_hotel = h.id_hotel
      INNER JOIN CHAMBRE ch ON r.id_chambre = ch.id_chambre
      INNER JOIN OFFRE o ON r.id_offre = o.id_offre
      LEFT JOIN STATUT s ON r.id_statut = s.id_statut
      WHERE r.id_reservation = ? AND r.id_user = ?
    `;

    db.query(query, [reservationId, userId], (err, results) => {
      if (err) {
        return callback(err, null);
      }

      if (!results || results.length === 0) {
        return callback(
          new Error("Réservation non trouvée ou accès refusé"),
          null,
        );
      }

      callback(null, results[0]);
    });
  }

  /**
   * Récupère toutes les réservations d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {function} callback - Fonction de rappel (err, results)
   * @description Triées par date de réservation décroissante (plus récentes en premier)
   */
  static getByUserId(userId, callback) {
    const query = `
      SELECT 
        r.*,
        h.nom_hotel,
        h.ville_hotel,
        h.pays_hotel,
        h.img_hotel,
        ch.type_room,
        ch.cat_room,
        o.nom_offre,
        s.nom_statut,
        s.couleur as couleur_statut
      FROM RESERVATION r
      INNER JOIN HOTEL h ON r.id_hotel = h.id_hotel
      INNER JOIN CHAMBRE ch ON r.id_chambre = ch.id_chambre
      INNER JOIN OFFRE o ON r.id_offre = o.id_offre
      LEFT JOIN STATUT s ON r.id_statut = s.id_statut
      WHERE r.id_user = ?
      ORDER BY r.date_reservation DESC
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  /**
   * Récupère toutes les réservations (administration)
   * @param {function} callback - Fonction de rappel (err, results)
   * @description Inclut les informations utilisateur pour l'admin
   */
  static getAll(callback) {
    const query = `
      SELECT 
        r.*,
        h.nom_hotel,
        h.ville_hotel,
        h.pays_hotel,
        h.img_hotel,
        ch.type_room,
        ch.cat_room,
        o.nom_offre,
        s.nom_statut,
        s.couleur as couleur_statut,
        u.prenom_user,
        u.nom_user,
        u.email_user,
        u.tel_user
      FROM RESERVATION r
      INNER JOIN HOTEL h ON r.id_hotel = h.id_hotel
      INNER JOIN CHAMBRE ch ON r.id_chambre = ch.id_chambre
      INNER JOIN OFFRE o ON r.id_offre = o.id_offre
      LEFT JOIN STATUT s ON r.id_statut = s.id_statut
      LEFT JOIN UTILISATEUR u ON r.id_user = u.id_user
      ORDER BY r.date_reservation DESC
    `;

    db.query(query, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  /**
   * Récupère les services additionnels d'une réservation
   * @param {number} reservationId - ID de la réservation
   * @param {function} callback - Fonction de rappel (err, results)
   */
  static getServicesByReservationId(reservationId, callback) {
    const query = `
      SELECT 
        rs.id_reservation_service,
        rs.quantite,
        rs.prix_unitaire,
        rs.sous_total,
        sa.nom_service,
        sa.description_service,
        sa.type_service,
        sa.icone_service
      FROM RESERVATION_SERVICES rs
      INNER JOIN HOTEL_SERVICES hs ON rs.id_hotel_service = hs.id_hotel_service
      INNER JOIN SERVICES_ADDITIONNELS sa ON hs.id_service = sa.id_service
      WHERE rs.id_reservation = ?
      ORDER BY sa.nom_service
    `;

    db.query(query, [reservationId], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  // ==========================================================================
  // MÉTHODES DE MISE À JOUR (UPDATE)
  // ==========================================================================

  /**
   * Met à jour le statut d'une réservation (administration)
   * @param {number} reservationId - ID de la réservation
   * @param {number} newStatusId - Nouvel ID de statut
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static updateStatus(reservationId, newStatusId, callback) {
    const query = `
      UPDATE RESERVATION 
      SET id_statut = ? 
      WHERE id_reservation = ?
    `;

    db.query(query, [newStatusId, reservationId], (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  }

  /**
   * Annule une réservation (change le statut à 3 = annulé)
   * @param {number} reservationId - ID de la réservation
   * @param {number} userId - ID de l'utilisateur (pour vérification)
   * @param {function} callback - Fonction de rappel (err, result)
   * @description Vérifie la propriété et que la réservation n'est pas déjà annulée
   */
  static cancel(reservationId, userId, callback) {
    // Étape 1 : Vérifier la propriété et le statut actuel
    const checkQuery = `
      SELECT id_reservation, id_statut 
      FROM RESERVATION 
      WHERE id_reservation = ? AND id_user = ?
    `;

    db.query(checkQuery, [reservationId, userId], (err, results) => {
      if (err) {
        return callback(err, null);
      }

      if (!results || results.length === 0) {
        return callback(
          new Error("Réservation non trouvée ou accès refusé"),
          null,
        );
      }

      if (results[0].id_statut === 3) {
        return callback(new Error("Cette réservation est déjà annulée"), null);
      }

      // Étape 2 : Mettre à jour le statut
      const updateQuery = `
        UPDATE RESERVATION 
        SET id_statut = 3 
        WHERE id_reservation = ?
      `;

      db.query(updateQuery, [reservationId], (err, result) => {
        if (err) {
          return callback(err, null);
        }
        callback(null, result);
      });
    });
  }
}

module.exports = Reservation;

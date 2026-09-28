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

    // ------------------------------------------------------------------
    // Controle de disponibilite
    //
    // Deux sejours se chevauchent des que l'un commence avant que l'autre
    // ne finisse. Les comparaisons sont strictes : une chambre liberee le
    // matin peut etre reprise le soir meme. Seuls les statuts qui occupent
    // reellement la chambre bloquent : une reservation annulee, refusee ou
    // terminee laisse la periode libre.
    //
    // Cette verification reprend celle de update(). Sans elle, deux clients
    // pouvaient reserver la meme chambre aux memes dates.
    // ------------------------------------------------------------------
    const STATUTS_BLOQUANTS = [1, 2, 6]; // En attente, Confirmee, En cours

    const conflitQuery = `
      SELECT id_reservation
      FROM RESERVATION
      WHERE id_chambre = ?
        AND id_statut IN (?)
        AND check_in < ?
        AND check_out > ?
      LIMIT 1
    `;

    db.query(
      conflitQuery,
      [
        reservationData.id_chambre,
        STATUTS_BLOQUANTS,
        reservationData.check_out,
        reservationData.check_in,
      ],
      (errConflit, conflits) => {
        if (errConflit) {
          console.error(
            "Erreur lors du controle de disponibilite:",
            errConflit,
          );
          return callback(errConflit, null);
        }

        if (conflits && conflits.length > 0) {
          return callback(
            new Error(
              "Cette chambre n'est plus disponible sur les dates demandées",
            ),
            null,
          );
        }

        Reservation.insererReservation(
          reservationData,
          numConfirmation,
          callback,
        );
      },
    );
  }

  /**
   * Insere la reservation et ses services, une fois la disponibilite
   * confirmee par create(). Separee pour garder create() lisible.
   * @param {Object} reservationData - Donnees de la reservation
   * @param {string} numConfirmation - Numero de confirmation genere
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static insererReservation(reservationData, numConfirmation, callback) {
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

  /**
   * Enregistre le paiement d'une réservation : statut 1 vers statut 2.
   *
   * Réservée au client propriétaire. Contrairement à updateStatus(), qui
   * accepte n'importe quel statut et reste donc réservée à l'administration,
   * cette méthode ne connaît qu'une seule transition. Un client ne peut pas
   * déclarer sa réservation « Terminée » ni « Refusée ».
   *
   * Deux raisons de refuser :
   *   1. la réservation n'existe pas ou appartient à quelqu'un d'autre ;
   *   2. elle n'est plus au statut 1 (déjà payée, annulée, terminée).
   *
   * @param {number} reservationId - ID de la réservation
   * @param {number} userId - ID de l'utilisateur, issu du jeton signé
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static markAsPaid(reservationId, userId, callback) {
    // Étape 1 : vérifier la propriété et le statut actuel
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

      if (results[0].id_statut !== 1) {
        return callback(
          new Error("Cette réservation n'est plus en attente de paiement"),
          null,
        );
      }

      // Étape 2 : passer au statut 2 (Confirmée)
      const updateQuery = `
        UPDATE RESERVATION
        SET id_statut = 2
        WHERE id_reservation = ?
      `;

      db.query(updateQuery, [reservationId], (errUpdate, result) => {
        if (errUpdate) {
          return callback(errUpdate, null);
        }
        callback(null, result);
      });
    });
  }
  // ==========================================================================
  // MÉTHODE DE MODIFICATION (UPDATE)
  // ==========================================================================

  /**
   * Modifie les dates et le nombre de voyageurs d'une réservation non payée.
   *
   * Le client n'exprime qu'un souhait : les dates et le nombre de voyageurs.
   * Le prix à la nuit vient de l'OFFRE, le nombre de nuits est déduit des
   * dates, et le total est recomposé ici. Rien de ce qui engage un montant
   * n'est repris du corps de la requête.
   *
   * Cinq contrôles précèdent toute écriture :
   *   1. la réservation appartient bien à l'utilisateur ;
   *   2. elle est encore au statut 1 (En attente) — une fois payée, on annule ;
   *   3. les dates sont cohérentes et ne sont pas dans le passé ;
   *   4. la capacité de la chambre est respectée ;
   *   5. la chambre est libre sur la nouvelle période.
   *
   * @param {number} reservationId - ID de la réservation
   * @param {number} userId - ID de l'utilisateur (vérification de propriété)
   * @param {Object} data - Nouvelles valeurs souhaitées
   * @param {string} data.check_in - Date d'arrivée (YYYY-MM-DD)
   * @param {string} data.check_out - Date de départ (YYYY-MM-DD)
   * @param {number} data.nbre_adults - Nombre d'adultes
   * @param {number} [data.nbre_children] - Nombre d'enfants
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static update(reservationId, userId, data, callback) {
    // ------------------------------------------------------------------
    // Étape 1 : lire la réservation, son offre et sa chambre
    // ------------------------------------------------------------------
    const checkQuery = `
      SELECT
        r.id_reservation,
        r.id_statut,
        r.id_chambre,
        o.prix_nuit,
        c.nbre_adults_max,
        c.nbre_children_max
      FROM RESERVATION r
      INNER JOIN OFFRE o ON r.id_offre = o.id_offre
      INNER JOIN CHAMBRE c ON r.id_chambre = c.id_chambre
      WHERE r.id_reservation = ? AND r.id_user = ?
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

      const reservation = results[0];

      // Étape 2 : seule une réservation non payée est modifiable
      if (reservation.id_statut !== 1) {
        return callback(
          new Error("Seule une réservation en attente peut être modifiée"),
          null,
        );
      }

      // ------------------------------------------------------------------
      // Étape 3 : validation des dates
      // ------------------------------------------------------------------
      const checkIn = new Date(data.check_in);
      const checkOut = new Date(data.check_out);

      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        return callback(new Error("Dates invalides"), null);
      }

      if (checkOut <= checkIn) {
        return callback(
          new Error(
            "La date de départ doit être postérieure à la date d'arrivée",
          ),
          null,
        );
      }

      const aujourdhui = new Date();
      aujourdhui.setHours(0, 0, 0, 0);

      if (checkIn < aujourdhui) {
        return callback(
          new Error("La date d'arrivée ne peut pas être dans le passé"),
          null,
        );
      }

      // Le nombre de nuits est déduit des dates, jamais repris du client
      const MS_PAR_JOUR = 1000 * 60 * 60 * 24;
      const nbreNuits = Math.round(
        (checkOut.getTime() - checkIn.getTime()) / MS_PAR_JOUR,
      );

      // ------------------------------------------------------------------
      // Étape 4 : capacité de la chambre
      // ------------------------------------------------------------------
      const nbreAdults = parseInt(data.nbre_adults, 10);
      const nbreChildren = parseInt(data.nbre_children, 10) || 0;

      if (!Number.isInteger(nbreAdults) || nbreAdults < 1) {
        return callback(new Error("Nombre d'adultes invalide"), null);
      }

      if (nbreAdults > reservation.nbre_adults_max) {
        return callback(
          new Error(
            `Cette chambre accueille au maximum ${reservation.nbre_adults_max} adulte(s)`,
          ),
          null,
        );
      }

      if (nbreChildren > reservation.nbre_children_max) {
        return callback(
          new Error(
            `Cette chambre accueille au maximum ${reservation.nbre_children_max} enfant(s)`,
          ),
          null,
        );
      }

      // ------------------------------------------------------------------
      // Étape 5 : la chambre est-elle libre sur la nouvelle période ?
      //
      // Deux séjours se chevauchent dès que l'un commence avant que l'autre
      // ne finisse. Les comparaisons sont strictes : une chambre libérée le
      // matin peut être reprise le soir même. La réservation en cours de
      // modification s'exclut elle-même, sans quoi elle se déclarerait en
      // conflit avec ses propres nouvelles dates.
      // ------------------------------------------------------------------
      const STATUTS_BLOQUANTS = [1, 2, 6]; // En attente, Confirmée, En cours

      const conflitQuery = `
        SELECT id_reservation
        FROM RESERVATION
        WHERE id_chambre = ?
          AND id_reservation <> ?
          AND id_statut IN (?)
          AND check_in < ?
          AND check_out > ?
        LIMIT 1
      `;

      db.query(
        conflitQuery,
        [
          reservation.id_chambre,
          reservationId,
          STATUTS_BLOQUANTS,
          data.check_out,
          data.check_in,
        ],
        (err, conflits) => {
          if (err) {
            return callback(err, null);
          }

          if (conflits && conflits.length > 0) {
            return callback(
              new Error(
                "Cette chambre n'est plus disponible sur les dates demandées",
              ),
              null,
            );
          }

          // ----------------------------------------------------------
          // Étape 6 : recalcul des services additionnels
          // Un service journalier suit le nombre de nuits, un service
          // par personne suit les nuits et les adultes : changer les
          // dates change donc aussi leur sous-total.
          // ----------------------------------------------------------
          const servicesQuery = `
            SELECT
              rs.id_reservation_service,
              rs.prix_unitaire,
              sa.type_service
            FROM RESERVATION_SERVICES rs
            INNER JOIN HOTEL_SERVICES hs
              ON rs.id_hotel_service = hs.id_hotel_service
            INNER JOIN SERVICES_ADDITIONNELS sa
              ON hs.id_service = sa.id_service
            WHERE rs.id_reservation = ?
          `;

          db.query(servicesQuery, [reservationId], (err, services) => {
            if (err) {
              return callback(err, null);
            }

            const prixNuit = parseFloat(reservation.prix_nuit);
            let totalPrice = prixNuit * nbreNuits;

            const majServices = (services || []).map((service) => {
              const prixUnitaire = parseFloat(service.prix_unitaire) || 0;
              let quantite = 1;
              let sousTotal = prixUnitaire;

              if (service.type_service === "journalier") {
                quantite = nbreNuits;
                sousTotal = prixUnitaire * nbreNuits;
              } else if (service.type_service === "par_personne") {
                quantite = nbreNuits * nbreAdults;
                sousTotal = prixUnitaire * nbreNuits * nbreAdults;
              }
              // 'sejour' et 'unitaire' : prix fixe

              totalPrice += sousTotal;

              return {
                id: service.id_reservation_service,
                quantite,
                sousTotal,
              };
            });

            // Arrondi au centime : on manipule des euros
            totalPrice = Math.round(totalPrice * 100) / 100;

            // ----------------------------------------------------------
            // Étape 7 : écriture
            // ----------------------------------------------------------
            const updateQuery = `
              UPDATE RESERVATION
              SET check_in = ?,
                  check_out = ?,
                  nbre_nuits = ?,
                  nbre_adults = ?,
                  nbre_children = ?,
                  total_price = ?
              WHERE id_reservation = ?
            `;

            db.query(
              updateQuery,
              [
                data.check_in,
                data.check_out,
                nbreNuits,
                nbreAdults,
                nbreChildren,
                totalPrice,
                reservationId,
              ],
              (err) => {
                if (err) {
                  return callback(err, null);
                }

                if (majServices.length === 0) {
                  return callback(null, {
                    id_reservation: reservationId,
                    nbre_nuits: nbreNuits,
                    total_price: totalPrice,
                  });
                }

                // Mise à jour des sous-totaux, une ligne à la fois
                let restants = majServices.length;
                let erreurServices = null;

                majServices.forEach((service) => {
                  const majQuery = `
                    UPDATE RESERVATION_SERVICES
                    SET quantite = ?, sous_total = ?
                    WHERE id_reservation_service = ?
                  `;

                  db.query(
                    majQuery,
                    [service.quantite, service.sousTotal, service.id],
                    (err) => {
                      if (err && !erreurServices) {
                        erreurServices = err;
                      }

                      restants -= 1;

                      if (restants === 0) {
                        if (erreurServices) {
                          return callback(erreurServices, null);
                        }

                        callback(null, {
                          id_reservation: reservationId,
                          nbre_nuits: nbreNuits,
                          total_price: totalPrice,
                        });
                      }
                    },
                  );
                });
              },
            );
          });
        },
      );
    });
  }
}

module.exports = Reservation;

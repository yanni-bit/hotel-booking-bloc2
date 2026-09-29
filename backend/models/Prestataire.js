// ============================================================================
// FICHIER : Prestataire.js
// DESCRIPTION : Modèle de rattachement des comptes prestataires aux hôtels
// AUTEUR : Yannick
// ============================================================================
// La table HOTEL_PRESTATAIRE relie un compte à un ou plusieurs établissements.
// C'est elle qui donne un sens à « ses » réservations : sans rattachement, un
// compte portant le rôle `provider` n'a accès à rien.
//
// Ce modèle ne fait que gérer le lien. La lecture des réservations d'un
// prestataire reste dans Reservation.js, où se trouve tout ce qui touche aux
// réservations.
// ============================================================================

const db = require("../config/database");

class Prestataire {
  // ==========================================================================
  // LECTURE
  // ==========================================================================

  /**
   * Renvoie les établissements rattachés à un compte, avec leur nombre de
   * réservations, pour que l'administrateur voie ce qu'il confie.
   *
   * @param {number} userId - ID du compte
   * @param {function} callback - Fonction de rappel (err, results)
   */
  static getHotelsDuCompte(userId, callback) {
    const query = `
      SELECT
        h.id_hotel,
        h.nom_hotel,
        h.ville_hotel,
        h.pays_hotel,
        (SELECT COUNT(*) FROM RESERVATION r WHERE r.id_hotel = h.id_hotel)
          AS nb_reservations
      FROM HOTEL_PRESTATAIRE hp
      JOIN HOTEL h ON h.id_hotel = hp.id_hotel
      WHERE hp.id_user = ?
      ORDER BY h.nom_hotel
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  /**
   * Renvoie les établissements que le compte n'exploite pas encore.
   *
   * Sert à remplir la liste déroulante d'ajout : proposer un hôtel déjà
   * rattaché n'aurait pas de sens, et la contrainte d'unicité le refuserait.
   *
   * @param {number} userId - ID du compte
   * @param {function} callback - Fonction de rappel (err, results)
   */
  static getHotelsDisponibles(userId, callback) {
    const query = `
      SELECT h.id_hotel, h.nom_hotel, h.ville_hotel
      FROM HOTEL h
      WHERE h.id_hotel NOT IN (
        SELECT hp.id_hotel FROM HOTEL_PRESTATAIRE hp WHERE hp.id_user = ?
      )
      ORDER BY h.nom_hotel
      LIMIT 500
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  // ==========================================================================
  // ÉCRITURE
  // ==========================================================================

  /**
   * Rattache un établissement à un compte.
   *
   * Deux refus possibles, traduits en messages plutôt qu'en erreurs brutes :
   * le rattachement existe déjà, ou l'un des deux identifiants ne correspond
   * à rien en base.
   *
   * @param {number} userId - ID du compte
   * @param {number} hotelId - ID de l'établissement
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static lier(userId, hotelId, callback) {
    const query = `
      INSERT INTO HOTEL_PRESTATAIRE (id_user, id_hotel)
      VALUES (?, ?)
    `;

    db.query(query, [userId, hotelId], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return callback(
            new Error("Cet établissement est déjà rattaché à ce compte"),
            null,
          );
        }
        if (err.code === "ER_NO_REFERENCED_ROW_2") {
          return callback(
            new Error("Compte ou établissement introuvable"),
            null,
          );
        }
        return callback(err, null);
      }
      callback(null, result);
    });
  }

  /**
   * Retire le rattachement entre un compte et un établissement.
   *
   * Les réservations ne sont pas touchées : elles appartiennent à l'hôtel,
   * pas au prestataire. Retirer un rattachement ne fait que fermer un accès.
   *
   * @param {number} userId - ID du compte
   * @param {number} hotelId - ID de l'établissement
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static delier(userId, hotelId, callback) {
    const query = `
      DELETE FROM HOTEL_PRESTATAIRE
      WHERE id_user = ? AND id_hotel = ?
    `;

    db.query(query, [userId, hotelId], (err, result) => {
      if (err) {
        return callback(err, null);
      }
      if (result.affectedRows === 0) {
        return callback(new Error("Rattachement introuvable"), null);
      }
      callback(null, result);
    });
  }
}

module.exports = Prestataire;

// ============================================================================
// CONTACT.JS - MODÈLE MESSAGES CONTACT
// ============================================================================
// Ce modèle gère les opérations CRUD sur les messages du formulaire de contact.
// Pattern utilisé : classe statique héritant de BaseModel
// Sécurité : requêtes préparées (?) pour prévenir les injections SQL
//
// Ce fichier était écrit sous forme d'objet littéral. Il a été converti en
// classe pour hériter de BaseModel : la lecture de la liste, la lecture par
// clé et la suppression étaient le CRUD générique mot pour mot. Ne restent
// ici que les comportements propres aux messages de contact : le traitement
// du téléphone optionnel, le 404 sur message inexistant, les compteurs de
// messages non lus et les deux marquages métier.
// ============================================================================

const db = require("../config/database");
const BaseModel = require("./BaseModel");

class Contact extends BaseModel {
  // ==========================================================================
  // DÉCLARATIONS UTILISÉES PAR BaseModel
  // ==========================================================================

  /** @returns {string} Nom de la table SQL */
  static get table() {
    return "messages_contact";
  }

  /** @returns {string} Colonne clé primaire */
  static get clePrimaire() {
    return "id_message";
  }

  /** @returns {string[]} Colonnes que create() et update() peuvent écrire */
  static get champs() {
    return ["nom", "email", "telephone", "sujet", "message", "lu", "traite"];
  }

  /** @returns {string} Ordre appliqué par getAll(), le plus récent d'abord */
  static get ordreParDefaut() {
    return "date_envoi DESC";
  }

  // ==========================================================================
  // MÉTHODE DE CRÉATION (CREATE)
  // ==========================================================================

  /**
   * Crée un nouveau message de contact.
   *
   * Le téléphone est optionnel : il est ramené explicitement à null pour que
   * la colonne reçoive NULL plutôt que d'être omise de l'insertion.
   *
   * @param {Object} messageData - Données du message
   * @param {string} messageData.nom - Nom de l'expéditeur
   * @param {string} messageData.email - Email de l'expéditeur
   * @param {string} [messageData.telephone] - Téléphone optionnel
   * @param {string} messageData.sujet - Sujet du message
   * @param {string} messageData.message - Contenu du message
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static create(messageData, callback) {
    super.create(
      {
        nom: messageData.nom,
        email: messageData.email,
        telephone: messageData.telephone || null,
        sujet: messageData.sujet,
        message: messageData.message,
      },
      callback,
    );
  }

  // ==========================================================================
  // MÉTHODES DE LECTURE (READ)
  // ==========================================================================
  // getAll est héritée de BaseModel : la requête générique, complétée par
  // ordreParDefaut, produit exactement l'ancienne requête.

  /**
   * Récupérer un message par son ID.
   *
   * BaseModel renvoie null quand rien ne correspond. Cette redéfinition
   * traduit ce null en erreur « Message non trouvé », que la route de
   * consultation interprète en réponse 404.
   *
   * @param {number} id - ID du message
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static getById(id, callback) {
    super.getById(id, (err, message) => {
      if (err) {
        return callback(err, null);
      }
      if (!message) {
        return callback(new Error("Message non trouvé"), null);
      }
      callback(null, message);
    });
  }

  /**
   * Récupérer les messages non lus (administration).
   * @param {function} callback - Fonction de rappel (err, results)
   */
  static getUnread(callback) {
    const sql = `
      SELECT * FROM messages_contact
      WHERE lu = 0
      ORDER BY date_envoi DESC
    `;

    db.query(sql, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  /**
   * Compter les messages non lus.
   * @param {function} callback - Fonction de rappel (err, count)
   */
  static countUnread(callback) {
    const sql = `
      SELECT COUNT(*) as count FROM messages_contact
      WHERE lu = 0
    `;

    db.query(sql, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results[0].count);
    });
  }

  // ==========================================================================
  // MÉTHODES DE MISE À JOUR (UPDATE)
  // ==========================================================================

  /**
   * Marquer un message comme lu.
   * @param {number} id - ID du message
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static markAsRead(id, callback) {
    super.update(id, { lu: 1 }, callback);
  }

  /**
   * Marquer un message comme traité.
   * @param {number} id - ID du message
   * @param {function} callback - Fonction de rappel (err, result)
   */
  static markAsTreated(id, callback) {
    super.update(id, { traite: 1 }, callback);
  }

  // ==========================================================================
  // MÉTHODE DE SUPPRESSION (DELETE)
  // ==========================================================================
  // delete est héritée de BaseModel : la requête générique
  // « DELETE FROM messages_contact WHERE id_message = ? » est identique à
  // celle qui était écrite ici.
}

module.exports = Contact;

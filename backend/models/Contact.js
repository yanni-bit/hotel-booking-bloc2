// ============================================================================
// CONTACT.JS - MODÈLE MESSAGES CONTACT
// ============================================================================
// Ce modèle gère les opérations CRUD sur les messages du formulaire de contact.
// Pattern utilisé : Objet littéral avec méthodes
// Sécurité : Requêtes préparées (?) pour prévenir les injections SQL
// ============================================================================

const db = require('../config/database');

const Contact = {
  
  // ==========================================================================
  // MÉTHODE DE CRÉATION (CREATE)
  // ==========================================================================

  /**
   * Créer un nouveau message de contact
   * @param {Object} messageData - Données du message
   * @param {string} messageData.nom - Nom de l'expéditeur
   * @param {string} messageData.email - Email de l'expéditeur
   * @param {string} [messageData.telephone] - Téléphone optionnel
   * @param {string} messageData.sujet - Sujet du message
   * @param {string} messageData.message - Contenu du message
   * @param {function} callback - Fonction de rappel (err, result)
   */
  create: (messageData, callback) => {
    const sql = `
      INSERT INTO messages_contact (nom, email, telephone, sujet, message)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const values = [
      messageData.nom,
      messageData.email,
      messageData.telephone || null,
      messageData.sujet,
      messageData.message
    ];
    
    db.query(sql, values, (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, {
        id_message: result.insertId,
        ...messageData
      });
    });
  },
  
  // ==========================================================================
  // MÉTHODES DE LECTURE (READ)
  // ==========================================================================

  /**
   * Récupérer tous les messages (administration)
   * @param {function} callback - Fonction de rappel (err, results)
   */
  getAll: (callback) => {
    const sql = `
      SELECT * FROM messages_contact
      ORDER BY date_envoi DESC
    `;
    
    db.query(sql, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  },

  /**
   * Récupérer un message par son ID
   * @param {number} id - ID du message
   * @param {function} callback - Fonction de rappel (err, result)
   */
  getById: (id, callback) => {
    const sql = `
      SELECT * FROM messages_contact
      WHERE id_message = ?
    `;
    
    db.query(sql, [id], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      if (results.length === 0) {
        return callback(new Error('Message non trouvé'), null);
      }
      callback(null, results[0]);
    });
  },

  /**
   * Récupérer les messages non lus (administration)
   * @param {function} callback - Fonction de rappel (err, results)
   */
  getUnread: (callback) => {
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
  },

  /**
   * Compter les messages non lus
   * @param {function} callback - Fonction de rappel (err, count)
   */
  countUnread: (callback) => {
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
  },
  
  // ==========================================================================
  // MÉTHODES DE MISE À JOUR (UPDATE)
  // ==========================================================================

  /**
   * Marquer un message comme lu
   * @param {number} id - ID du message
   * @param {function} callback - Fonction de rappel (err, result)
   */
  markAsRead: (id, callback) => {
    const sql = `
      UPDATE messages_contact
      SET lu = 1
      WHERE id_message = ?
    `;
    
    db.query(sql, [id], (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  },

  /**
   * Marquer un message comme traité
   * @param {number} id - ID du message
   * @param {function} callback - Fonction de rappel (err, result)
   */
  markAsTreated: (id, callback) => {
    const sql = `
      UPDATE messages_contact
      SET traite = 1
      WHERE id_message = ?
    `;
    
    db.query(sql, [id], (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  },
  
  // ==========================================================================
  // MÉTHODE DE SUPPRESSION (DELETE)
  // ==========================================================================

  /**
   * Supprimer un message
   * @param {number} id - ID du message à supprimer
   * @param {function} callback - Fonction de rappel (err, result)
   */
  delete: (id, callback) => {
    const sql = `
      DELETE FROM messages_contact
      WHERE id_message = ?
    `;
    
    db.query(sql, [id], (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  }
};

module.exports = Contact;
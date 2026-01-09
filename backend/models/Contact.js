// ============================================================================
// CONTACT.JS - MODÈLE MESSAGES CONTACT
// Gère les opérations CRUD sur la table messages_contact
// ============================================================================

const db = require('../config/database');

const Contact = {
  
  // ========================================
  // CREATE - Créer un nouveau message
  // ========================================
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
  
  // ========================================
  // GET ALL - Récupérer tous les messages (admin)
  // ========================================
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
  
  // ========================================
  // GET BY ID - Récupérer un message par ID
  // ========================================
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
  
  // ========================================
  // GET UNREAD - Récupérer les messages non lus (admin)
  // ========================================
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
  
  // ========================================
  // MARK AS READ - Marquer comme lu
  // ========================================
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
  
  // ========================================
  // MARK AS TREATED - Marquer comme traité
  // ========================================
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
  
  // ========================================
  // DELETE - Supprimer un message
  // ========================================
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
  },
  
  // ========================================
  // COUNT UNREAD - Compter les messages non lus
  // ========================================
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
  }
};

module.exports = Contact;
// ============================================================================
// USER.JS - MODÈLE UTILISATEUR
// Gère l'authentification et les opérations utilisateurs
// ============================================================================

const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class User {
  
  /**
   * Crée un nouvel utilisateur (inscription)
   */
  static async create(userData, callback) {
    try {
      // Hasher le mot de passe
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);
      
      const query = `
        INSERT INTO UTILISATEUR (
          id_role,
          email_user,
          mot_de_passe,
          prenom_user,
          nom_user,
          tel_user,
          actif,
          email_verifie
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        userData.id_role || 3, // Par défaut : client
        userData.email,
        passwordHash,
        userData.prenom,
        userData.nom,
        userData.telephone || null,
        1, // actif par défaut
        0  // email non vérifié par défaut
      ];
      
      db.query(query, values, (err, result) => {
        if (err) {
          return callback(err, null);
        }
        callback(null, { id_user: result.insertId });
      });
    } catch (error) {
      callback(error, null);
    }
  }
  
  /**
   * Trouve un utilisateur par email
   */
  static findByEmail(email, callback) {
    const query = `
      SELECT 
        u.id_user,
        u.email_user,
        u.mot_de_passe,
        u.prenom_user,
        u.nom_user,
        u.tel_user,
        u.actif,
        u.email_verifie,
        u.id_role,
        r.code_role,
        r.nom_role
      FROM UTILISATEUR u
      INNER JOIN ROLE r ON u.id_role = r.id_role
      WHERE u.email_user = ?
    `;
    
    db.query(query, [email], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results[0] || null);
    });
  }
  
  /**
   * Vérifie le mot de passe
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
  
  /**
   * Génère un token JWT
   */
  static generateToken(user) {
    const payload = {
      id_user: user.id_user,
      email: user.email_user,
      role: user.code_role,
      prenom: user.prenom_user,
      nom: user.nom_user
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }
  
  /**
   * Vérifie et décode un token JWT
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Met à jour la dernière connexion
   */
  static updateLastLogin(userId, callback) {
    const query = `
      UPDATE UTILISATEUR 
      SET derniere_connexion = CURRENT_TIMESTAMP 
      WHERE id_user = ?
    `;
    
    db.query(query, [userId], (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  }
  
  /**
   * Récupère un utilisateur par ID (sans mot de passe)
   */
  static findById(userId, callback) {
    const query = `
      SELECT 
        u.id_user,
        u.email_user,
        u.prenom_user,
        u.nom_user,
        u.tel_user,
        u.actif,
        u.email_verifie,
        u.date_inscription,
        u.derniere_connexion,
        u.id_role,
        r.code_role,
        r.nom_role
      FROM UTILISATEUR u
      INNER JOIN ROLE r ON u.id_role = r.id_role
      WHERE u.id_user = ?
    `;
    
    db.query(query, [userId], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results[0] || null);
    });
  }

  /**
 * Met à jour les informations d'un utilisateur
 */
static updateProfile(userId, userData, callback) {
  const query = `
    UPDATE UTILISATEUR 
    SET prenom_user = ?, 
        nom_user = ?, 
        tel_user = ?
    WHERE id_user = ?
  `;
  
  const values = [
    userData.prenom,
    userData.nom,
    userData.telephone || null,
    userId
  ];
  
  db.query(query, values, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  });
}

/**
 * Change le mot de passe d'un utilisateur
 */
static async changePassword(userId, oldPassword, newPassword, callback) {
  try {
    // D'abord récupérer l'utilisateur pour vérifier l'ancien mot de passe
    const getUserQuery = 'SELECT mot_de_passe FROM UTILISATEUR WHERE id_user = ?';
    
    db.query(getUserQuery, [userId], async (err, results) => {
      if (err) {
        return callback(err, null);
      }
      
      if (!results || results.length === 0) {
        return callback(new Error('Utilisateur non trouvé'), null);
      }
      
      // Vérifier l'ancien mot de passe
      const isValid = await bcrypt.compare(oldPassword, results[0].mot_de_passe);
      
      if (!isValid) {
        return callback(new Error('Ancien mot de passe incorrect'), null);
      }
      
      // Hasher le nouveau mot de passe
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
      
      // Mettre à jour
      const updateQuery = 'UPDATE UTILISATEUR SET mot_de_passe = ? WHERE id_user = ?';
      
      db.query(updateQuery, [newPasswordHash, userId], (err, result) => {
        if (err) {
          return callback(err, null);
        }
        callback(null, result);
      });
    });
  } catch (error) {
    callback(error, null);
  }
}

// ============================================================================
// MÉTHODES POUR RÉCUPÉRATION DE MOT DE PASSE
// ============================================================================

/**
 * Génère un token de réinitialisation de mot de passe
 */
static createPasswordResetToken(userId, callback) {
  // Générer un token unique
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  // Expiration dans 1 heure
  const expiresAt = new Date(Date.now() + 3600000);
  
  // Supprimer les anciens tokens non utilisés pour cet utilisateur
  const deleteQuery = 'DELETE FROM PASSWORD_RESET WHERE id_user = ? AND used = 0';
  
  db.query(deleteQuery, [userId], (err) => {
    if (err) {
      return callback(err, null);
    }
    
    // Insérer le nouveau token
    const insertQuery = `
      INSERT INTO PASSWORD_RESET (id_user, token, expires_at)
      VALUES (?, ?, ?)
    `;
    
    db.query(insertQuery, [userId, token, expiresAt], (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, { token, expiresAt });
    });
  });
}

/**
 * Vérifie si un token de réinitialisation est valide
 */
static verifyPasswordResetToken(token, callback) {
  const query = `
    SELECT pr.*, u.email_user, u.prenom_user
    FROM PASSWORD_RESET pr
    INNER JOIN UTILISATEUR u ON pr.id_user = u.id_user
    WHERE pr.token = ? 
      AND pr.used = 0 
      AND pr.expires_at > NOW()
  `;
  
  db.query(query, [token], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results[0] || null);
  });
}

/**
 * Réinitialise le mot de passe avec un token
 */
static async resetPasswordWithToken(token, newPassword, callback) {
  try {
    // Vérifier le token
    this.verifyPasswordResetToken(token, async (err, resetData) => {
      if (err) {
        return callback(err, null);
      }
      
      if (!resetData) {
        return callback(new Error('Token invalide ou expiré'), null);
      }
      
      // Hasher le nouveau mot de passe
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
      
      // Mettre à jour le mot de passe
      const updateQuery = 'UPDATE UTILISATEUR SET mot_de_passe = ? WHERE id_user = ?';
      
      db.query(updateQuery, [newPasswordHash, resetData.id_user], (err, result) => {
        if (err) {
          return callback(err, null);
        }
        
        // Marquer le token comme utilisé
        const markUsedQuery = 'UPDATE PASSWORD_RESET SET used = 1 WHERE token = ?';
        
        db.query(markUsedQuery, [token], (err) => {
          if (err) {
            console.error('Erreur marquage token:', err);
          }
          callback(null, { success: true });
        });
      });
    });
  } catch (error) {
    callback(error, null);
  }
}
}

module.exports = User;
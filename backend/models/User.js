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
}

module.exports = User;
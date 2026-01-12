// ============================================================================
// USER.JS - MODÈLE UTILISATEUR
// Gère l'authentification et les opérations utilisateurs
// ============================================================================

const db = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
        0, // email non vérifié par défaut
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
      nom: user.nom_user,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
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
      userId,
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
      const getUserQuery =
        "SELECT mot_de_passe FROM UTILISATEUR WHERE id_user = ?";

      db.query(getUserQuery, [userId], async (err, results) => {
        if (err) {
          return callback(err, null);
        }

        if (!results || results.length === 0) {
          return callback(new Error("Utilisateur non trouvé"), null);
        }

        // Vérifier l'ancien mot de passe
        const isValid = await bcrypt.compare(
          oldPassword,
          results[0].mot_de_passe
        );

        if (!isValid) {
          return callback(new Error("Ancien mot de passe incorrect"), null);
        }

        // Hasher le nouveau mot de passe
        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        // Mettre à jour
        const updateQuery =
          "UPDATE UTILISATEUR SET mot_de_passe = ? WHERE id_user = ?";

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
    const crypto = require("crypto");
    const token = crypto.randomBytes(32).toString("hex");

    // Expiration dans 1 heure
    const expiresAt = new Date(Date.now() + 3600000);

    // Supprimer les anciens tokens non utilisés pour cet utilisateur
    const deleteQuery =
      "DELETE FROM PASSWORD_RESET WHERE id_user = ? AND used = 0";

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
          return callback(new Error("Token invalide ou expiré"), null);
        }

        // Hasher le nouveau mot de passe
        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        // Mettre à jour le mot de passe
        const updateQuery =
          "UPDATE UTILISATEUR SET mot_de_passe = ? WHERE id_user = ?";

        db.query(
          updateQuery,
          [newPasswordHash, resetData.id_user],
          (err, result) => {
            if (err) {
              return callback(err, null);
            }

            // Marquer le token comme utilisé
            const markUsedQuery =
              "UPDATE PASSWORD_RESET SET used = 1 WHERE token = ?";

            db.query(markUsedQuery, [token], (err) => {
              if (err) {
                console.error("Erreur marquage token:", err);
              }
              callback(null, { success: true });
            });
          }
        );
      });
    } catch (error) {
      callback(error, null);
    }
  }

  // ============================================================================
  // MÉTHODES POUR GESTION ADMIN DES UTILISATEURS
  // ============================================================================

  /**
   * Récupère tous les utilisateurs (pour admin)
   */
  static findAll(callback) {
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
    ORDER BY u.date_inscription DESC
  `;

    db.query(query, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  /**
   * Met à jour le rôle d'un utilisateur
   */
  static updateRole(userId, newRoleId, callback) {
    const query = "UPDATE UTILISATEUR SET id_role = ? WHERE id_user = ?";

    db.query(query, [newRoleId, userId], (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  }

  /**
   * Active ou désactive un utilisateur
   */
  static toggleActive(userId, isActive, callback) {
    const query = "UPDATE UTILISATEUR SET actif = ? WHERE id_user = ?";

    db.query(query, [isActive ? 1 : 0, userId], (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  }

  /**
   * Supprime un utilisateur
   */
  static delete(userId, callback) {
    const query = "DELETE FROM UTILISATEUR WHERE id_user = ?";

    db.query(query, [userId], (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  }

  /**
   * Récupère tous les rôles disponibles
   */
  static getAllRoles(callback) {
    const query = "SELECT * FROM ROLE ORDER BY id_role";

    db.query(query, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }

  /**
   * Compte le nombre d'utilisateurs
   */
  static count(callback) {
    const query = "SELECT COUNT(*) as total FROM UTILISATEUR";

    db.query(query, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results[0].total);
    });
  }

  /**
   * Récupère un utilisateur par son ID (pour admin)
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
      r.nom_role,
      a.rue_user,
      a.complement_user,
      a.code_postal_user,
      a.ville_user,
      a.pays_user
    FROM UTILISATEUR u
    INNER JOIN ROLE r ON u.id_role = r.id_role
    LEFT JOIN ADRESSE_USER a ON u.id_adress_user = a.id_adress_user
    WHERE u.id_user = ?
  `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      if (!results || results.length === 0) {
        return callback(new Error("Utilisateur non trouvé"), null);
      }
      callback(null, results[0]);
    });
  }

  /**
   * Met à jour un utilisateur (pour admin)
   */
  static updateByAdmin(userId, userData, callback) {
    const query = `
    UPDATE UTILISATEUR 
    SET 
      prenom_user = ?,
      nom_user = ?,
      email_user = ?,
      tel_user = ?,
      id_role = ?,
      actif = ?
    WHERE id_user = ?
  `;

    const values = [
      userData.prenom_user,
      userData.nom_user,
      userData.email_user,
      userData.tel_user || null,
      userData.id_role,
      userData.actif,
      userId,
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  }

  /**
   * Récupère les réservations d'un utilisateur (pour admin)
   */
  static getReservationsByUserId(userId, callback) {
    const query = `
    SELECT 
      r.*,
      h.nom_hotel,
      h.ville_hotel,
      h.pays_hotel,
      ch.type_room,
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
}

module.exports = User;

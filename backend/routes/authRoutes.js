// ============================================================================
// FICHIER : authRoutes.js
// DESCRIPTION : Routes d'authentification et gestion des utilisateurs
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// ROUTES PUBLIQUES :
//   - POST /api/auth/register       → Inscription d'un nouvel utilisateur
//   - POST /api/auth/login          → Connexion utilisateur
//   - POST /api/auth/forgot-password → Demande réinitialisation mot de passe
//   - POST /api/auth/reset-password  → Réinitialiser mot de passe avec token
//
// ROUTES AUTHENTIFIÉES (USER) :
//   - GET  /api/auth/me             → Récupérer son profil
//   - PUT  /api/auth/profile        → Modifier son profil
//   - PUT  /api/auth/password       → Changer son mot de passe
//
// ROUTES ADMIN :
//   - GET    /api/auth/users              → Liste tous les utilisateurs
//   - GET    /api/auth/users/count        → Nombre total d'utilisateurs
//   - GET    /api/auth/roles              → Liste tous les rôles
//   - GET    /api/auth/users/:id          → Détail d'un utilisateur
//   - PUT    /api/auth/users/:id          → Modifier un utilisateur
//   - DELETE /api/auth/users/:id          → Supprimer un utilisateur
//   - PUT    /api/auth/users/:id/role     → Modifier le rôle d'un utilisateur
//   - PUT    /api/auth/users/:id/toggle   → Activer/Désactiver un utilisateur
//   - GET    /api/auth/users/:id/reservations → Réservations d'un utilisateur
// ============================================================================

const User = require("../models/User");

// ============================================================================
// FONCTION PRINCIPALE - ROUTEUR AUTHENTIFICATION
// ============================================================================

/**
 * Routeur principal pour les routes d'authentification
 * Gère l'inscription, connexion, profil et administration des utilisateurs
 * @function authRoutes
 * @param {Object} req - Objet requête HTTP avec pathname et method
 * @param {Object} res - Objet réponse HTTP
 * @returns {void}
 */
function authRoutes(req, res) {
  const pathname = req.pathname;
  const method = req.method;

  // ==========================================================================
  // ROUTES PUBLIQUES - AUTHENTIFICATION
  // ==========================================================================

  // ----------------------------------------
  // POST /api/auth/register - Inscription
  // ----------------------------------------
  if (pathname === "/api/auth/register" && method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const userData = JSON.parse(body);

        // Validation basique
        if (
          !userData.email ||
          !userData.password ||
          !userData.prenom ||
          !userData.nom
        ) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message: "Tous les champs obligatoires doivent être remplis",
            }),
          );
          return;
        }

        // Vérifier si l'email existe déjà
        User.findByEmail(userData.email, (err, existingUser) => {
          if (err) {
            console.error("Erreur lors de la vérification email:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: false,
                message: "Erreur serveur",
              }),
            );
            return;
          }

          if (existingUser) {
            res.statusCode = 409;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: false,
                message: "Cet email est déjà utilisé",
              }),
            );
            return;
          }

          // Créer l'utilisateur
          User.create(userData, (err, result) => {
            if (err) {
              console.error("Erreur lors de la création utilisateur:", err);
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  success: false,
                  message: "Erreur lors de la création du compte",
                }),
              );
              return;
            }

            res.statusCode = 201;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: true,
                message: "Compte créé avec succès",
                data: { id_user: result.id_user },
              }),
            );
          });
        });
      } catch (error) {
        console.error("Erreur de parsing JSON:", error);
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: "Données invalides",
          }),
        );
      }
    });
    return;
  }

  // ----------------------------------------
  // POST /api/auth/login - Connexion
  // ----------------------------------------
  if (pathname === "/api/auth/login" && method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const { email, password } = JSON.parse(body);

        // Validation
        if (!email || !password) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message: "Email et mot de passe requis",
            }),
          );
          return;
        }

        // Trouver l'utilisateur
        User.findByEmail(email, async (err, user) => {
          if (err) {
            console.error("Erreur lors de la recherche utilisateur:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: false,
                message: "Erreur serveur",
              }),
            );
            return;
          }

          if (!user) {
            res.statusCode = 401;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: false,
                message: "Email ou mot de passe incorrect",
              }),
            );
            return;
          }

          // Vérifier si le compte est actif
          if (!user.actif) {
            res.statusCode = 403;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: false,
                message: "Compte désactivé",
              }),
            );
            return;
          }

          // Vérifier le mot de passe
          const isPasswordValid = await User.verifyPassword(
            password,
            user.mot_de_passe,
          );

          if (!isPasswordValid) {
            res.statusCode = 401;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: false,
                message: "Email ou mot de passe incorrect",
              }),
            );
            return;
          }

          // Générer le token JWT
          const token = User.generateToken(user);

          // Mettre à jour la dernière connexion
          User.updateLastLogin(user.id_user, () => {});

          // Retourner le token et les infos utilisateur
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: true,
              message: "Connexion réussie",
              data: {
                token: token,
                user: {
                  id_user: user.id_user,
                  email: user.email_user,
                  prenom: user.prenom_user,
                  nom: user.nom_user,
                  role: user.code_role,
                },
              },
            }),
          );
        });
      } catch (error) {
        console.error("Erreur de parsing JSON:", error);
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: "Données invalides",
          }),
        );
      }
    });
    return;
  }

  // ----------------------------------------
  // POST /api/auth/forgot-password - Demande de réinitialisation
  // ----------------------------------------
  if (pathname === "/api/auth/forgot-password" && method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const { email } = JSON.parse(body);

        if (!email) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message: "Email requis",
            }),
          );
          return;
        }

        // Chercher l'utilisateur
        User.findByEmail(email, (err, user) => {
          if (err) {
            console.error("Erreur recherche utilisateur:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: false,
                message: "Erreur serveur",
              }),
            );
            return;
          }

          // Toujours répondre positivement (sécurité : ne pas révéler si l'email existe)
          if (!user) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: true,
                message:
                  "Si cet email existe, un lien de réinitialisation a été envoyé",
              }),
            );
            return;
          }

          // Créer le token
          User.createPasswordResetToken(user.id_user, (err, tokenData) => {
            if (err) {
              console.error("Erreur création token:", err);
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  success: false,
                  message: "Erreur serveur",
                }),
              );
              return;
            }

            // ============================================
            // SIMULATION : Afficher le lien dans la console
            // ============================================
            const resetLink = `http://localhost:4300/reset-password?token=${tokenData.token}`;

            console.log("\n========================================");
            console.log("🔐 DEMANDE DE RÉINITIALISATION MOT DE PASSE");
            console.log("========================================");
            console.log(`📧 Email: ${email}`);
            console.log(`👤 Utilisateur: ${user.prenom_user} ${user.nom_user}`);
            console.log(`🔗 Lien de réinitialisation:`);
            console.log(`   ${resetLink}`);
            console.log(`⏰ Expire à: ${tokenData.expiresAt}`);
            console.log("========================================\n");

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: true,
                message:
                  "Si cet email existe, un lien de réinitialisation a été envoyé",
              }),
            );
          });
        });
      } catch (error) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: "Données invalides",
          }),
        );
      }
    });
    return;
  }

  // ----------------------------------------
  // POST /api/auth/reset-password - Réinitialiser le mot de passe
  // ----------------------------------------
  if (pathname === "/api/auth/reset-password" && method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const { token, newPassword } = JSON.parse(body);

        if (!token || !newPassword) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message: "Token et nouveau mot de passe requis",
            }),
          );
          return;
        }

        if (newPassword.length < 6) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message: "Le mot de passe doit contenir au moins 6 caractères",
            }),
          );
          return;
        }

        User.resetPasswordWithToken(token, newPassword, (err, result) => {
          if (err) {
            console.error("Erreur réinitialisation:", err);

            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: false,
                message: err.message || "Erreur lors de la réinitialisation",
              }),
            );
            return;
          }

          console.log("✅ Mot de passe réinitialisé avec succès");

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: true,
              message: "Mot de passe réinitialisé avec succès",
            }),
          );
        });
      } catch (error) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: "Données invalides",
          }),
        );
      }
    });
    return;
  }

  // ==========================================================================
  // ROUTES AUTHENTIFIÉES - PROFIL UTILISATEUR
  // ==========================================================================

  // ----------------------------------------
  // GET /api/auth/me - Récupérer son profil
  // ----------------------------------------
  if (pathname === "/api/auth/me" && method === "GET") {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: false,
          message: "Token manquant",
        }),
      );
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = User.verifyToken(token);

    if (!decoded) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: false,
          message: "Token invalide ou expiré",
        }),
      );
      return;
    }

    // Récupérer les infos utilisateur
    User.findById(decoded.id_user, (err, user) => {
      if (err || !user) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: "Utilisateur non trouvé",
          }),
        );
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          data: user,
        }),
      );
    });
    return;
  }

  // ----------------------------------------
  // PUT /api/auth/profile - Modifier son profil
  // ----------------------------------------
  if (pathname === "/api/auth/profile" && method === "PUT") {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: false,
          message: "Token manquant",
        }),
      );
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = User.verifyToken(token);

    if (!decoded) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: false,
          message: "Token invalide",
        }),
      );
      return;
    }

    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const userData = JSON.parse(body);

        User.updateProfile(decoded.id_user, userData, (err, result) => {
          if (err) {
            console.error("Erreur mise à jour profil:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: false,
                message: "Erreur lors de la mise à jour",
              }),
            );
            return;
          }

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: true,
              message: "Profil mis à jour avec succès",
            }),
          );
        });
      } catch (error) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: "Données invalides",
          }),
        );
      }
    });
    return;
  }

  // ----------------------------------------
  // PUT /api/auth/password - Changer son mot de passe
  // ----------------------------------------
  if (pathname === "/api/auth/password" && method === "PUT") {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: false,
          message: "Token manquant",
        }),
      );
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = User.verifyToken(token);

    if (!decoded) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: false,
          message: "Token invalide",
        }),
      );
      return;
    }

    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const { oldPassword, newPassword } = JSON.parse(body);

        if (!oldPassword || !newPassword) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message: "Ancien et nouveau mot de passe requis",
            }),
          );
          return;
        }

        if (newPassword.length < 6) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message:
                "Le nouveau mot de passe doit contenir au moins 6 caractères",
            }),
          );
          return;
        }

        User.changePassword(
          decoded.id_user,
          oldPassword,
          newPassword,
          (err, result) => {
            if (err) {
              console.error("Erreur changement mot de passe:", err);

              if (err.message === "Ancien mot de passe incorrect") {
                res.statusCode = 400;
              } else {
                res.statusCode = 500;
              }

              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  success: false,
                  message:
                    err.message || "Erreur lors du changement de mot de passe",
                }),
              );
              return;
            }

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: true,
                message: "Mot de passe modifié avec succès",
              }),
            );
          },
        );
      } catch (error) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: "Données invalides",
          }),
        );
      }
    });
    return;
  }

  // ==========================================================================
  // ROUTES ADMIN - GESTION DES UTILISATEURS
  // ==========================================================================

  // ----------------------------------------
  // GET /api/auth/users - Liste tous les utilisateurs (ADMIN)
  // ----------------------------------------
  if (pathname === "/api/auth/users" && method === "GET") {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: false, message: "Token manquant" }));
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = User.verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({ success: false, message: "Accès non autorisé" }),
      );
      return;
    }

    User.findAll((err, users) => {
      if (err) {
        console.error("Erreur récupération utilisateurs:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: false, message: "Erreur serveur" }));
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: true, data: users }));
    });
    return;
  }

  // ----------------------------------------
  // GET /api/auth/users/count - Nombre d'utilisateurs (ADMIN)
  // ----------------------------------------
  if (pathname === "/api/auth/users/count" && method === "GET") {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: false, message: "Token manquant" }));
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = User.verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({ success: false, message: "Accès non autorisé" }),
      );
      return;
    }

    User.count((err, total) => {
      if (err) {
        console.error("Erreur comptage utilisateurs:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: false, message: "Erreur serveur" }));
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: true, data: { total } }));
    });
    return;
  }

  // ----------------------------------------
  // GET /api/auth/roles - Liste tous les rôles (ADMIN)
  // ----------------------------------------
  if (pathname === "/api/auth/roles" && method === "GET") {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: false, message: "Token manquant" }));
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = User.verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({ success: false, message: "Accès non autorisé" }),
      );
      return;
    }

    User.getAllRoles((err, roles) => {
      if (err) {
        console.error("Erreur récupération rôles:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: false, message: "Erreur serveur" }));
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: true, data: roles }));
    });
    return;
  }

  // ----------------------------------------
  // PUT /api/auth/users/:id/role - Modifier le rôle (ADMIN)
  // ----------------------------------------
  if (pathname.match(/^\/api\/auth\/users\/\d+\/role$/) && method === "PUT") {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: false, message: "Token manquant" }));
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = User.verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({ success: false, message: "Accès non autorisé" }),
      );
      return;
    }

    const userId = pathname.split("/")[4];

    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const { id_role } = JSON.parse(body);

        if (!id_role) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ success: false, message: "Rôle requis" }));
          return;
        }

        User.updateRole(userId, id_role, (err, result) => {
          if (err) {
            console.error("Erreur modification rôle:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({ success: false, message: "Erreur serveur" }),
            );
            return;
          }

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: true,
              message: "Rôle modifié avec succès",
            }),
          );
        });
      } catch (error) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({ success: false, message: "Données invalides" }),
        );
      }
    });
    return;
  }

  // ----------------------------------------
  // PUT /api/auth/users/:id/toggle - Activer/Désactiver (ADMIN)
  // ----------------------------------------
  if (pathname.match(/^\/api\/auth\/users\/\d+\/toggle$/) && method === "PUT") {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: false, message: "Token manquant" }));
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = User.verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({ success: false, message: "Accès non autorisé" }),
      );
      return;
    }

    const userId = pathname.split("/")[4];

    // Empêcher l'admin de se désactiver lui-même
    if (parseInt(userId) === decoded.id_user) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: false,
          message: "Vous ne pouvez pas vous désactiver vous-même",
        }),
      );
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const { actif } = JSON.parse(body);

        User.toggleActive(userId, actif, (err, result) => {
          if (err) {
            console.error("Erreur toggle actif:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({ success: false, message: "Erreur serveur" }),
            );
            return;
          }

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: true,
              message: actif ? "Utilisateur activé" : "Utilisateur désactivé",
            }),
          );
        });
      } catch (error) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({ success: false, message: "Données invalides" }),
        );
      }
    });
    return;
  }

  // ----------------------------------------
  // GET /api/auth/users/:id/reservations - Réservations d'un utilisateur (ADMIN)
  // ----------------------------------------
  if (
    pathname.match(/^\/api\/auth\/users\/\d+\/reservations$/) &&
    method === "GET"
  ) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: false, message: "Token manquant" }));
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = User.verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({ success: false, message: "Accès non autorisé" }),
      );
      return;
    }

    const userId = pathname.split("/")[4];

    User.getReservationsByUserId(userId, (err, reservations) => {
      if (err) {
        console.error("Erreur récupération réservations:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: false, message: "Erreur serveur" }));
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: true, data: reservations }));
    });
    return;
  }

  // ----------------------------------------
  // GET /api/auth/users/:id - Détail d'un utilisateur (ADMIN)
  // ----------------------------------------
  if (pathname.match(/^\/api\/auth\/users\/\d+$/) && method === "GET") {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: false, message: "Token manquant" }));
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = User.verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({ success: false, message: "Accès non autorisé" }),
      );
      return;
    }

    const userId = pathname.split("/")[4];

    User.findById(userId, (err, user) => {
      if (err) {
        console.error("Erreur récupération utilisateur:", err);
        res.statusCode = err.message === "Utilisateur non trouvé" ? 404 : 500;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: false,
            message: err.message || "Erreur serveur",
          }),
        );
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: true, data: user }));
    });
    return;
  }

  // ----------------------------------------
  // PUT /api/auth/users/:id - Modifier un utilisateur (ADMIN)
  // ----------------------------------------
  if (pathname.match(/^\/api\/auth\/users\/\d+$/) && method === "PUT") {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: false, message: "Token manquant" }));
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = User.verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({ success: false, message: "Accès non autorisé" }),
      );
      return;
    }

    const userId = pathname.split("/")[4];

    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const userData = JSON.parse(body);

        User.updateByAdmin(userId, userData, (err, result) => {
          if (err) {
            console.error("Erreur modification utilisateur:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({ success: false, message: "Erreur serveur" }),
            );
            return;
          }

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: true,
              message: "Utilisateur modifié avec succès",
            }),
          );
        });
      } catch (error) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({ success: false, message: "Données invalides" }),
        );
      }
    });
    return;
  }

  // ----------------------------------------
  // DELETE /api/auth/users/:id - Supprimer un utilisateur (ADMIN)
  // ----------------------------------------
  if (pathname.match(/^\/api\/auth\/users\/\d+$/) && method === "DELETE") {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: false, message: "Token manquant" }));
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = User.verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({ success: false, message: "Accès non autorisé" }),
      );
      return;
    }

    const userId = pathname.split("/")[4];

    // Empêcher l'admin de se supprimer lui-même
    if (parseInt(userId) === decoded.id_user) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: false,
          message: "Vous ne pouvez pas supprimer votre propre compte",
        }),
      );
      return;
    }

    User.delete(userId, (err, result) => {
      if (err) {
        console.error("Erreur suppression utilisateur:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: false, message: "Erreur serveur" }));
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({ success: true, message: "Utilisateur supprimé" }),
      );
    });
    return;
  }

  // ==========================================================================
  // ROUTE NON TROUVÉE
  // ==========================================================================
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      success: false,
      message: "Route non trouvée",
    }),
  );
}

// ============================================================================
// EXPORT DU MODULE
// ============================================================================
module.exports = authRoutes;

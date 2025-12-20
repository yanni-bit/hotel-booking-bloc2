// ============================================================================
// AUTHROUTES.JS - ROUTES AUTHENTIFICATION
// Gère register, login, et profil utilisateur
// ============================================================================

const User = require('../models/User');

function authRoutes(req, res) {
  const pathname = req.pathname;
  const method = req.method;

  // ========================================
  // POST /api/auth/register - Inscription
  // ========================================
  if (pathname === '/api/auth/register' && method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const userData = JSON.parse(body);
        
        // Validation basique
        if (!userData.email || !userData.password || !userData.prenom || !userData.nom) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            message: 'Tous les champs obligatoires doivent être remplis'
          }));
          return;
        }
        
        // Vérifier si l'email existe déjà
        User.findByEmail(userData.email, (err, existingUser) => {
          if (err) {
            console.error('Erreur lors de la vérification email:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              message: 'Erreur serveur'
            }));
            return;
          }
          
          if (existingUser) {
            res.statusCode = 409;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              message: 'Cet email est déjà utilisé'
            }));
            return;
          }
          
          // Créer l'utilisateur
          User.create(userData, (err, result) => {
            if (err) {
              console.error('Erreur lors de la création utilisateur:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                message: 'Erreur lors de la création du compte'
              }));
              return;
            }
            
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              message: 'Compte créé avec succès',
              data: { id_user: result.id_user }
            }));
          });
        });
      } catch (error) {
        console.error('Erreur de parsing JSON:', error);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Données invalides'
        }));
      }
    });
    return;
  }

  // ========================================
  // POST /api/auth/login - Connexion
  // ========================================
  if (pathname === '/api/auth/login' && method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { email, password } = JSON.parse(body);
        
        // Validation
        if (!email || !password) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            message: 'Email et mot de passe requis'
          }));
          return;
        }
        
        // Trouver l'utilisateur
        User.findByEmail(email, async (err, user) => {
          if (err) {
            console.error('Erreur lors de la recherche utilisateur:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              message: 'Erreur serveur'
            }));
            return;
          }
          
          if (!user) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              message: 'Email ou mot de passe incorrect'
            }));
            return;
          }
          
          // Vérifier si le compte est actif
          if (!user.actif) {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              message: 'Compte désactivé'
            }));
            return;
          }
          
          // Vérifier le mot de passe
          const isPasswordValid = await User.verifyPassword(password, user.mot_de_passe);
          
          if (!isPasswordValid) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              message: 'Email ou mot de passe incorrect'
            }));
            return;
          }
          
          // Générer le token JWT
          const token = User.generateToken(user);
          
          // Mettre à jour la dernière connexion
          User.updateLastLogin(user.id_user, () => {});
          
          // Retourner le token et les infos utilisateur
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            message: 'Connexion réussie',
            data: {
              token: token,
              user: {
                id_user: user.id_user,
                email: user.email_user,
                prenom: user.prenom_user,
                nom: user.nom_user,
                role: user.code_role
              }
            }
          }));
        });
      } catch (error) {
        console.error('Erreur de parsing JSON:', error);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Données invalides'
        }));
      }
    });
    return;
  }

  // ========================================
  // GET /api/auth/me - Profil utilisateur
  // ========================================
  if (pathname === '/api/auth/me' && method === 'GET') {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Token manquant'
      }));
      return;
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = User.verifyToken(token);
    
    if (!decoded) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Token invalide ou expiré'
      }));
      return;
    }
    
    // Récupérer les infos utilisateur
    User.findById(decoded.id_user, (err, user) => {
      if (err || !user) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Utilisateur non trouvé'
        }));
        return;
      }
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        data: user
      }));
    });
    return;
  }

  // ========================================
  // Route non trouvée
  // ========================================
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    success: false,
    message: 'Route non trouvée'
  }));
}

module.exports = authRoutes;
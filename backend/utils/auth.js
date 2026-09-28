// ============================================
// FICHIER : auth.js
// DESCRIPTION : Fonctions utilitaires d'authentification pour les routes.
//               Lit le jeton JWT dans l'en-tete Authorization, le verifie
//               via le modele User, et renvoie le payload decode.
//               Remplace le middleware d'un framework, absent ici puisque
//               le serveur est ecrit avec le module http natif.
// AUTEUR : Yannick
// DATE : 2026
// FONCTIONNALITES :
//   - getAuthUser  : lit et verifie le jeton, sans repondre au client
//   - requireAuth  : exige un utilisateur connecte, repond 401 sinon
//   - requireAdmin : exige le role administrateur, repond 401 ou 403 sinon
// UTILISATION DANS UN GESTIONNAIRE DE ROUTE :
//   const auth = requireAuth(req, res);
//   if (!auth) return;          // la reponse d'erreur a deja ete envoyee
//   console.log(auth.id_user);  // identite certifiee par la signature
// ============================================

const User = require("../models/User");

/**
 * Envoie une reponse d'erreur JSON et renvoie null.
 * Fonction interne, non exportee.
 * @param {http.ServerResponse} res - Reponse HTTP
 * @param {number} code - Code de statut HTTP (401 ou 403)
 * @param {string} message - Message destine au client
 * @returns {null} Toujours null, pour permettre `return refuser(...)`
 */
function refuser(res, code, message) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ success: false, message: message }));
  return null;
}

/**
 * Extrait et verifie le jeton JWT de l'en-tete Authorization.
 * N'envoie aucune reponse : a utiliser quand l'authentification est
 * facultative (contenu public enrichi si l'utilisateur est connecte).
 * @param {http.IncomingMessage} req - Requete HTTP
 * @returns {Object|null} Payload decode, ou null si absent ou invalide
 */
function getAuthUser(req) {
  const entete = req.headers.authorization;

  if (!entete || !entete.startsWith("Bearer ")) {
    return null;
  }

  const token = entete.slice(7).trim();

  if (!token) {
    return null;
  }

  // verifyToken renvoie null si la signature est invalide ou le jeton expire
  return User.verifyToken(token);
}

/**
 * Exige un utilisateur authentifie.
 * Repond 401 et renvoie null si le jeton est absent, invalide ou expire.
 * @param {http.IncomingMessage} req - Requete HTTP
 * @param {http.ServerResponse} res - Reponse HTTP
 * @returns {Object|null} Payload decode, ou null si la requete est refusee
 */
function requireAuth(req, res) {
  const utilisateur = getAuthUser(req);

  if (!utilisateur) {
    return refuser(res, 401, "Authentification requise");
  }

  return utilisateur;
}

/**
 * Exige un utilisateur authentifie possedant le role administrateur.
 * Repond 401 si le jeton manque, 403 si le role est insuffisant.
 * @param {http.IncomingMessage} req - Requete HTTP
 * @param {http.ServerResponse} res - Reponse HTTP
 * @returns {Object|null} Payload decode, ou null si la requete est refusee
 */
function requireAdmin(req, res) {
  const utilisateur = getAuthUser(req);

  if (!utilisateur) {
    return refuser(res, 401, "Authentification requise");
  }

  if (utilisateur.role !== "admin") {
    return refuser(res, 403, "Acces reserve aux administrateurs");
  }

  return utilisateur;
}

module.exports = {
  getAuthUser,
  requireAuth,
  requireAdmin,
};

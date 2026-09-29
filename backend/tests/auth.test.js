// ============================================================================
// FICHIER : tests/auth.test.js
// DESCRIPTION : Tests unitaires du contrôle d'accès (backend/utils/auth.js)
// AUTEUR : Yannick
// ============================================================================
// PÉRIMÈTRE
//   utils/auth.js est le point de passage de toutes les routes protégées de
//   l'API. Trois fonctions y sont testées :
//     - getAuthUser(req)        lit l'en-tête, vérifie la signature, renvoie
//                               l'identité ou null ;
//     - requireAuth(req, res)   exige un jeton valide, répond 401 sinon ;
//     - requireAdmin(req, res)  exige en plus le rôle admin, répond 403 sinon.
//
// CE QUE CES TESTS PROTÈGENT
//   Une régression ici ouvrirait l'API entière. Chaque test correspond à une
//   tentative de contournement plausible : en-tête absente, mauvais schéma
//   d'authentification, jeton vide, signature retouchée, rôle insuffisant.
//
// CE QU'ILS NE FONT PAS
//   Aucune requête SQL n'est émise. Les fonctions testées ne lisent que
//   l'en-tête Authorization et la signature du jeton, jamais la base.
//
// LANCEMENT
//   npm test                    depuis le dossier backend
//   node --test tests/auth.test.js   pour ce seul fichier
// ============================================================================

const { test, describe, after } = require("node:test");
const assert = require("node:assert");

// Le secret est fixé avant tout require. dotenv ne remplace pas une variable
// d'environnement déjà définie, les tests sont donc reproductibles quelle que
// soit la valeur de JWT_SECRET dans le fichier .env de la machine.
process.env.JWT_SECRET = "secret_de_test_unitaire";
process.env.JWT_EXPIRES_IN = "1h";

const User = require("../models/User");
const { getAuthUser, requireAuth, requireAdmin } = require("../utils/auth");

// config/database.js ouvre une connexion MySQL dès son chargement, et la
// chaîne utils/auth -> models/User -> config/database l'entraîne même si
// aucun test n'interroge la base. Sans cette fermeture, le processus de test
// resterait actif indéfiniment après la dernière assertion.
after(() => {
  const db = require("../config/database");
  if (db && typeof db.end === "function") db.end();
});

// ---------------------------------------------------------------------------
// DOUBLURES
// ---------------------------------------------------------------------------
// Les fonctions testées attendent les objets req et res du module http natif.
// On ne fournit que ce qu'elles consultent réellement, ce qui évite de démarrer
// un serveur pour tester une vérification de jeton.
// ---------------------------------------------------------------------------

/**
 * Fabrique une requête minimale.
 * @param {string|undefined} authorization - Valeur de l'en-tête Authorization.
 *   Passer undefined produit une requête sans en-tête du tout.
 * @returns {Object} Objet exposant la seule propriété headers
 */
function fausseRequete(authorization) {
  return { headers: authorization ? { authorization } : {} };
}

/**
 * Fabrique une réponse qui enregistre ce qu'on lui écrit au lieu de l'envoyer
 * sur le réseau. Permet d'affirmer à la fois le code HTTP, le corps JSON, et
 * le fait que la réponse a été close ou non.
 * @returns {Object} Fausse réponse inspectable après l'appel
 */
function fausseReponse() {
  return {
    statusCode: 200,
    entetes: {},
    corps: null,
    termine: false,
    setHeader(nom, valeur) {
      this.entetes[nom] = valeur;
    },
    end(contenu) {
      this.corps = contenu ? JSON.parse(contenu) : null;
      this.termine = true;
    },
  };
}

// Jeux de données : la forme attendue par User.generateToken(), c'est-à-dire
// une ligne de la table UTILISATEUR jointe à ROLE.
const CLIENT = {
  id_user: 42,
  email_user: "client@test.com",
  code_role: "client",
  prenom_user: "Jean",
  nom_user: "Dupont",
};

const ADMIN = { ...CLIENT, id_user: 1, code_role: "admin" };

// ---------------------------------------------------------------------------

describe("getAuthUser", () => {
  // Cas de l'appel anonyme : un curl sans en-tête, ou un client qui a perdu
  // son jeton. La fonction ne doit rien deviner et rien inventer.
  test("renvoie null quand l'en-tête Authorization est absente", () => {
    assert.strictEqual(getAuthUser(fausseRequete(undefined)), null);
  });

  // Le schéma est vérifié explicitement : un jeton parfaitement valide
  // présenté derrière "Basic" doit être refusé, parce que la fonction exige
  // le préfixe "Bearer ". Ce test échouerait si le code se contentait de
  // chercher un point dans la chaîne.
  test("renvoie null quand l'en-tête n'utilise pas le schéma Bearer", () => {
    const jeton = User.generateToken(CLIENT);
    assert.strictEqual(getAuthUser(fausseRequete(`Basic ${jeton}`)), null);
  });

  // Cas limite classique : le préfixe est correct mais il n'y a rien derrière.
  // Sans le trim(), une chaîne d'espaces serait transmise à verifyToken().
  test("renvoie null quand le jeton est vide après Bearer", () => {
    assert.strictEqual(getAuthUser(fausseRequete("Bearer    ")), null);
  });

  // Le test le plus important du fichier : il démontre que la signature est
  // réellement vérifiée. Un attaquant qui modifierait le payload pour se
  // donner id_user = 1 invaliderait la signature, et la fonction doit le
  // rejeter. On retouche ici un seul caractère.
  test("renvoie null quand la signature a été falsifiée", () => {
    const jeton = User.generateToken(CLIENT);
    const falsifie = jeton.slice(0, -1) + (jeton.slice(-1) === "A" ? "B" : "A");
    assert.strictEqual(getAuthUser(fausseRequete(`Bearer ${falsifie}`)), null);
  });

  // Cas nominal. Vérifie que l'identité remontée est bien celle du jeton, et
  // non une valeur par défaut : c'est cette identité qui écrase ensuite
  // reservationData.id_user dans reservationRoutes.js.
  test("renvoie l'identité portée par un jeton valide", () => {
    const jeton = User.generateToken(CLIENT);
    const utilisateur = getAuthUser(fausseRequete(`Bearer ${jeton}`));
    assert.strictEqual(utilisateur.id_user, 42);
    assert.strictEqual(utilisateur.role, "client");
    assert.strictEqual(utilisateur.email, "client@test.com");
  });
});

describe("requireAuth", () => {
  // Faute de middleware global, chaque gestionnaire de route s'appuie sur le
  // motif : const auth = requireAuth(req, res); if (!auth) return;
  // Ce test vérifie les deux moitiés du contrat : la valeur null qui fait
  // sortir le gestionnaire, et la réponse 401 déjà envoyée au client.
  test("répond 401 et renvoie null sans jeton", () => {
    const res = fausseReponse();
    const resultat = requireAuth(fausseRequete(undefined), res);

    assert.strictEqual(resultat, null);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.termine, true);
    assert.strictEqual(res.corps.success, false);
    assert.strictEqual(res.corps.message, "Authentification requise");
  });

  // Symétrique du précédent : quand le jeton est bon, la fonction ne doit
  // surtout rien écrire dans la réponse, sinon le gestionnaire qui poursuit
  // son travail écrirait par-dessus une réponse déjà close.
  test("laisse la réponse intacte quand le jeton est valide", () => {
    const res = fausseReponse();
    const jeton = User.generateToken(CLIENT);
    const utilisateur = requireAuth(fausseRequete(`Bearer ${jeton}`), res);

    assert.strictEqual(utilisateur.id_user, 42);
    assert.strictEqual(res.termine, false);
    assert.strictEqual(res.statusCode, 200);
  });
});

describe("requireAdmin", () => {
  // L'ordre des contrôles compte : sans jeton on répond 401, pas 403.
  // Répondre 403 reviendrait à dire « vous êtes identifié mais pas autorisé »
  // à quelqu'un qui n'est pas identifié du tout.
  test("répond 401 sans jeton, avant même de regarder le rôle", () => {
    const res = fausseReponse();
    const resultat = requireAdmin(fausseRequete(undefined), res);

    assert.strictEqual(resultat, null);
    assert.strictEqual(res.statusCode, 401);
  });

  // Le cas qui justifie l'existence de requireAdmin : un compte parfaitement
  // authentifié, avec un jeton valide et non expiré, mais dont le rôle ne
  // suffit pas. C'est la démonstration de la séparation des permissions
  // demandée par le cahier des charges.
  test("répond 403 pour un jeton client valide", () => {
    const res = fausseReponse();
    const jeton = User.generateToken(CLIENT);
    const resultat = requireAdmin(fausseRequete(`Bearer ${jeton}`), res);

    assert.strictEqual(resultat, null);
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.corps.message, "Acces reserve aux administrateurs");
  });

  // Cas nominal administrateur. Le rôle vient du champ code_role de la table
  // ROLE, recopié dans le payload du jeton au moment de la connexion.
  test("renvoie l'identité pour un jeton administrateur", () => {
    const res = fausseReponse();
    const jeton = User.generateToken(ADMIN);
    const utilisateur = requireAdmin(fausseRequete(`Bearer ${jeton}`), res);

    assert.strictEqual(utilisateur.role, "admin");
    assert.strictEqual(res.termine, false);
  });
});

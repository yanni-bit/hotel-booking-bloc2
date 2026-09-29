// ============================================================================
// FICHIER : tests/user.test.js
// DESCRIPTION : Tests unitaires du modèle User — jetons JWT et mots de passe
// AUTEUR : Yannick
// ============================================================================
// PÉRIMÈTRE
//   models/User.js mélange des méthodes qui interrogent la base (findByEmail,
//   create, updatePassword...) et trois méthodes purement calculatoires, qui
//   sont celles testées ici :
//     - generateToken(user)                     signe un jeton JWT ;
//     - verifyToken(token)                      le relit, ou renvoie null ;
//     - verifyPassword(clair, empreinte)        compare via bcrypt.
//
// CE QUE CES TESTS PROTÈGENT
//   Le jeton est la seule preuve d'identité acceptée par l'API. Son contenu
//   détermine qui l'on est et ce que l'on a le droit de faire. Ces tests
//   vérifient ce qu'il contient, ce qu'il ne doit surtout pas contenir, et
//   les quatre façons dont il peut être rejeté.
//
// CE QU'ILS NE FONT PAS
//   Aucune des méthodes testées n'émet de requête SQL.
//
// LANCEMENT
//   npm test                         depuis le dossier backend
//   node --test tests/user.test.js   pour ce seul fichier
// ============================================================================

const { test, describe, after } = require("node:test");
const assert = require("node:assert");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Fixé avant le require de User : dotenv ne remplace pas une variable déjà
// définie, les tests ne dépendent donc pas du .env de la machine.
process.env.JWT_SECRET = "secret_de_test_unitaire";
process.env.JWT_EXPIRES_IN = "1h";

const User = require("../models/User");

// config/database.js ouvre une connexion MySQL dès son chargement, entraînée
// ici par le require de models/User. Sans cette fermeture, le processus de
// test resterait actif après la dernière assertion.
after(() => {
  const db = require("../config/database");
  if (db && typeof db.end === "function") db.end();
});

// Forme attendue par generateToken : une ligne de UTILISATEUR jointe à ROLE.
const UTILISATEUR = {
  id_user: 7,
  email_user: "demo@test.com",
  code_role: "client",
  prenom_user: "Marie",
  nom_user: "Martin",
};

describe("User.generateToken", () => {
  // Contrôle de forme. Un JWT est fait de trois parties séparées par des
  // points : en-tête, payload, signature. L'absence de la troisième
  // signifierait un jeton non signé, donc falsifiable à volonté.
  test("produit un jeton composé de trois segments", () => {
    const jeton = User.generateToken(UTILISATEUR);
    assert.strictEqual(jeton.split(".").length, 3);
  });

  // Le payload est recopié tel quel dans req par getAuthUser(). Si un champ
  // change de nom, les contrôles de propriété du type
  // String(auth.id_user) !== userId cesseraient silencieusement de fonctionner.
  // Ce test fige donc le contrat entre le modèle et les routes.
  test("place dans le payload les cinq champs attendus", () => {
    const payload = jwt.decode(User.generateToken(UTILISATEUR));

    assert.strictEqual(payload.id_user, 7);
    assert.strictEqual(payload.email, "demo@test.com");
    assert.strictEqual(payload.role, "client");
    assert.strictEqual(payload.prenom, "Marie");
    assert.strictEqual(payload.nom, "Martin");
  });

  // Un payload JWT est signé, pas chiffré : n'importe qui peut le lire avec
  // un décodeur en ligne. Ce test vérifie que generateToken construit un
  // objet explicite et ne recopie pas l'utilisateur entier, ce qui
  // exposerait l'empreinte du mot de passe à quiconque lit le jeton.
  test("n'expose jamais le mot de passe dans le payload", () => {
    const payload = jwt.decode(
      User.generateToken({ ...UTILISATEUR, mot_de_passe: "secret" }),
    );
    assert.strictEqual(payload.mot_de_passe, undefined);
  });

  // Vérifie que l'option expiresIn est bien appliquée. Un jeton sans date
  // d'expiration resterait valable pour toujours, y compris après un
  // changement de mot de passe ou une désactivation du compte.
  test("date d'expiration postérieure à la date d'émission", () => {
    const payload = jwt.decode(User.generateToken(UTILISATEUR));
    assert.ok(payload.exp > payload.iat);
  });
});

describe("User.verifyToken", () => {
  // Aller-retour nominal : ce que l'on signe, on doit pouvoir le relire.
  test("relit le payload d'un jeton qu'il vient de signer", () => {
    const payload = User.verifyToken(User.generateToken(UTILISATEUR));
    assert.strictEqual(payload.id_user, 7);
  });

  // verifyToken enveloppe jwt.verify dans un try/catch et renvoie null.
  // Ce test garantit qu'une entrée absurde ne fait pas remonter d'exception
  // jusqu'au gestionnaire de route, ce qui provoquerait un 500 au lieu du 401.
  test("renvoie null pour une chaîne qui n'est pas un jeton", () => {
    assert.strictEqual(User.verifyToken("pas-un-jeton"), null);
  });

  // Scénario d'attaque direct : un jeton parfaitement formé, au payload
  // alléchant (role admin), mais signé avec un autre secret. Il doit être
  // rejeté. C'est ce test qui démontre que le secret protège réellement.
  test("renvoie null pour un jeton signé avec un autre secret", () => {
    const usurpe = jwt.sign({ id_user: 1, role: "admin" }, "autre_secret");
    assert.strictEqual(User.verifyToken(usurpe), null);
  });

  // Un jeton volé ne doit pas servir éternellement. On en fabrique un déjà
  // expiré avec expiresIn négatif, plutôt que d'attendre sept jours.
  test("renvoie null pour un jeton expiré", () => {
    const expire = jwt.sign({ id_user: 1 }, process.env.JWT_SECRET, {
      expiresIn: "-1s",
    });
    assert.strictEqual(User.verifyToken(expire), null);
  });
});

describe("User.verifyPassword", () => {
  // Cas nominal de la connexion : le mot de passe saisi correspond à
  // l'empreinte stockée en base.
  test("accepte le mot de passe qui a servi à produire l'empreinte", async () => {
    const empreinte = await bcrypt.hash("client123", 10);
    assert.strictEqual(await User.verifyPassword("client123", empreinte), true);
  });

  // Un seul caractère de différence doit suffire à refuser.
  test("refuse un mot de passe erroné", async () => {
    const empreinte = await bcrypt.hash("client123", 10);
    assert.strictEqual(
      await User.verifyPassword("client124", empreinte),
      false,
    );
  });

  // Démonstration du sel aléatoire : deux hachages du même mot de passe
  // produisent deux chaînes différentes, et pourtant les deux se vérifient.
  // C'est ce qui empêche de repérer dans le dump SQL les comptes qui
  // partagent le même mot de passe, et rend inutilisables les tables
  // précalculées.
  test("deux empreintes du même mot de passe diffèrent (sel aléatoire)", async () => {
    const a = await bcrypt.hash("client123", 10);
    const b = await bcrypt.hash("client123", 10);
    assert.notStrictEqual(a, b);
    assert.strictEqual(await User.verifyPassword("client123", a), true);
    assert.strictEqual(await User.verifyPassword("client123", b), true);
  });
});

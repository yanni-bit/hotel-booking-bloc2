// ============================================================================
// FICHIER : integration.test.js
// DESCRIPTION : Tests d'intégration de l'API
// AUTEUR : Yannick
// ============================================================================
// Les tests unitaires de ce dossier vérifient des fonctions isolées. Ceux-ci
// vérifient l'enchaînement réel : requête HTTP, routeur, contrôle d'accès,
// modèle, base de données, puis réponse. Ils tournent contre le serveur tel
// qu'il est lancé, sans simulacre.
//
// PRÉREQUIS : le serveur doit tourner (npm start ou npm run dev) et MySQL
// doit être accessible. Sans cela, le premier test échoue avec un message
// explicite plutôt qu'une pile d'erreurs réseau.
//
// LANCEMENT : node --test tests/integration.test.js
//             ou npm test, qui exécute tout le dossier.
//
// DONNÉES : chaque exécution crée son propre compte client, avec une adresse
// horodatée, et ses réservations sur des dates lointaines pour ne croiser
// aucune donnée existante. Le bloc after() supprime tout ce qui a été créé.
// La base de développement est donc rendue dans l'état où elle était.
// ============================================================================

const { test, before, after } = require("node:test");
const assert = require("node:assert");
const db = require("../config/database");

const BASE = process.env.TEST_API_URL || "http://localhost:3000";

// Dates volontairement lointaines : aucune réservation existante ne peut
// occuper ces nuits, le test ne dépend donc pas du contenu de la base.
const ARRIVEE = "2030-01-10";
const DEPART = "2030-01-12";
const NUITS = 2;

// État partagé entre les tests, rempli au fur et à mesure du parcours.
const ctx = {
  email: `test.integration.${Date.now()}@exemple.test`,
  motDePasse: "TestIntegration2026!",
  jeton: null,
  idUser: null,
  idReservation: null,
  offre: null,
};

/**
 * Appelle l'API et renvoie le code HTTP et le corps décodé.
 * @param {string} chemin - Chemin de la route, commençant par /api
 * @param {Object} [options] - methode, corps, jeton
 * @returns {Promise<{statut: number, corps: any}>}
 */
async function appel(chemin, options = {}) {
  const entetes = { "Content-Type": "application/json" };
  if (options.jeton) {
    entetes.Authorization = `Bearer ${options.jeton}`;
  }

  const reponse = await fetch(BASE + chemin, {
    method: options.methode || "GET",
    headers: entetes,
    body: options.corps ? JSON.stringify(options.corps) : undefined,
  });

  let corps = null;
  const texte = await reponse.text();
  try {
    corps = texte ? JSON.parse(texte) : null;
  } catch (e) {
    corps = texte;
  }

  return { statut: reponse.status, corps };
}

/** Exécute une requête SQL et renvoie les lignes. */
function requete(sql, valeurs = []) {
  return new Promise((resoudre, rejeter) => {
    db.query(sql, valeurs, (err, resultats) => {
      if (err) return rejeter(err);
      resoudre(resultats);
    });
  });
}

// ============================================================================
// PRÉPARATION
// ============================================================================

before(async () => {
  // Vérifier que le serveur répond avant de lancer quoi que ce soit.
  try {
    await fetch(BASE + "/api/hotels");
  } catch (e) {
    throw new Error(
      `Le serveur ne répond pas sur ${BASE}. Lancez "npm start" dans backend/ avant les tests d'intégration.`,
    );
  }

  // Prendre une offre réelle de la base : les tests doivent porter sur des
  // identifiants qui existent, pas sur des valeurs inventées.
  const offres = await requete(
    `SELECT id_offre, id_hotel, id_chambre, prix_nuit, devise
     FROM OFFRE
     LIMIT 1`,
  );
  assert.ok(
    offres.length > 0,
    "Aucune offre en base, les tests ne peuvent pas s'exécuter",
  );
  ctx.offre = offres[0];
});

// ============================================================================
// PARCOURS CLIENT : INSCRIPTION, CONNEXION, RÉSERVATION, PAIEMENT
// ============================================================================

test("1. l'inscription crée un compte client", async () => {
  const { statut, corps } = await appel("/api/auth/register", {
    methode: "POST",
    corps: {
      email: ctx.email,
      password: ctx.motDePasse,
      prenom: "Test",
      nom: "Integration",
    },
  });

  assert.ok(statut === 200 || statut === 201, `Code inattendu : ${statut}`);
  assert.strictEqual(corps.success, true);
});

test("2. la connexion renvoie un jeton exploitable", async () => {
  const { statut, corps } = await appel("/api/auth/login", {
    methode: "POST",
    corps: { email: ctx.email, password: ctx.motDePasse },
  });

  assert.strictEqual(statut, 200);
  assert.strictEqual(corps.success, true);
  assert.ok(corps.data.token, "Aucun jeton dans la réponse");

  ctx.jeton = corps.data.token;
  ctx.idUser = corps.data.user.id_user;
  assert.ok(ctx.idUser, "Aucun identifiant utilisateur dans la réponse");
});

test("3. sans jeton, la création de réservation est refusée", async () => {
  const { statut } = await appel("/api/reservations", {
    methode: "POST",
    corps: { id_chambre: ctx.offre.id_chambre },
  });

  assert.strictEqual(
    statut,
    401,
    "Une route protégée doit répondre 401 sans jeton",
  );
});

test("4. un client connecté peut réserver", async () => {
  const { statut, corps } = await appel("/api/reservations", {
    methode: "POST",
    jeton: ctx.jeton,
    corps: {
      id_offre: ctx.offre.id_offre,
      id_hotel: ctx.offre.id_hotel,
      id_chambre: ctx.offre.id_chambre,
      check_in: ARRIVEE,
      check_out: DEPART,
      nbre_nuits: NUITS,
      nbre_adults: 2,
      nbre_children: 0,
      prix_nuit: ctx.offre.prix_nuit,
      total_price: Number(ctx.offre.prix_nuit) * NUITS,
      devise: ctx.offre.devise || "EUR",
    },
  });

  assert.ok(statut === 200 || statut === 201, `Code inattendu : ${statut}`);
  assert.strictEqual(corps.success, true);

  ctx.idReservation =
    corps.data.id_reservation || corps.data.id || corps.data.insertId;
  assert.ok(ctx.idReservation, "Aucun identifiant de réservation renvoyé");
});

test("5. l'identité enregistrée est celle du jeton, pas celle du corps", async () => {
  // Le client ne choisit pas au nom de qui il réserve : la route écrase
  // id_user avec la valeur du jeton. On le vérifie directement en base.
  const lignes = await requete(
    "SELECT id_user FROM RESERVATION WHERE id_reservation = ?",
    [ctx.idReservation],
  );

  assert.strictEqual(lignes.length, 1);
  assert.strictEqual(lignes[0].id_user, ctx.idUser);
});

test("6. la réservation apparaît dans la liste du client", async () => {
  const { statut, corps } = await appel(
    `/api/reservations/user/${ctx.idUser}`,
    { jeton: ctx.jeton },
  );

  assert.strictEqual(statut, 200);
  const trouvee = corps.data.find(
    (r) => r.id_reservation === ctx.idReservation,
  );
  assert.ok(trouvee, "La réservation créée n'est pas dans la liste du client");
});

// ============================================================================
// RÈGLE MÉTIER : PAS DE DOUBLE RÉSERVATION
// ============================================================================

test("7. une seconde réservation sur les mêmes nuits est refusée par un 409", async () => {
  const { statut, corps } = await appel("/api/reservations", {
    methode: "POST",
    jeton: ctx.jeton,
    corps: {
      id_offre: ctx.offre.id_offre,
      id_hotel: ctx.offre.id_hotel,
      id_chambre: ctx.offre.id_chambre,
      check_in: ARRIVEE,
      check_out: DEPART,
      nbre_nuits: NUITS,
      nbre_adults: 1,
      nbre_children: 0,
      prix_nuit: ctx.offre.prix_nuit,
      total_price: Number(ctx.offre.prix_nuit) * NUITS,
      devise: ctx.offre.devise || "EUR",
    },
  });

  assert.strictEqual(statut, 409, "Le chevauchement doit répondre 409");
  assert.strictEqual(corps.success, false);
});

test("8. une réservation qui commence le jour du départ est acceptée", async () => {
  // Les comparaisons de dates sont strictes : une chambre libérée le matin
  // peut être reprise le soir même. Ce test protège cette règle.
  const { statut, corps } = await appel("/api/reservations", {
    methode: "POST",
    jeton: ctx.jeton,
    corps: {
      id_offre: ctx.offre.id_offre,
      id_hotel: ctx.offre.id_hotel,
      id_chambre: ctx.offre.id_chambre,
      check_in: DEPART,
      check_out: "2030-01-14",
      nbre_nuits: 2,
      nbre_adults: 1,
      nbre_children: 0,
      prix_nuit: ctx.offre.prix_nuit,
      total_price: Number(ctx.offre.prix_nuit) * 2,
      devise: ctx.offre.devise || "EUR",
    },
  });

  assert.ok(statut === 200 || statut === 201, `Code inattendu : ${statut}`);
  assert.strictEqual(corps.success, true);
});

// ============================================================================
// CONTRÔLE D'ACCÈS PAR RÔLE
// ============================================================================

test("9. un client ne peut pas lister toutes les réservations", async () => {
  const { statut } = await appel("/api/reservations/all", { jeton: ctx.jeton });

  assert.strictEqual(
    statut,
    403,
    "Une route administrateur doit répondre 403 à un client authentifié",
  );
});

test("10. un client ne peut pas lister les utilisateurs", async () => {
  const { statut } = await appel("/api/auth/users", { jeton: ctx.jeton });

  assert.strictEqual(statut, 403);
});

// ============================================================================
// PAIEMENT
// ============================================================================

test("11. le paiement fait passer la réservation au statut confirmée", async () => {
  const { statut, corps } = await appel(
    `/api/reservations/${ctx.idReservation}/pay`,
    { methode: "PUT", jeton: ctx.jeton },
  );

  assert.strictEqual(statut, 200);
  assert.strictEqual(corps.success, true);

  const lignes = await requete(
    "SELECT id_statut FROM RESERVATION WHERE id_reservation = ?",
    [ctx.idReservation],
  );
  assert.strictEqual(
    lignes[0].id_statut,
    2,
    "Le statut doit passer à 2, Confirmée",
  );
});

test("12. un second paiement sur la même réservation est refusé", async () => {
  const { statut } = await appel(`/api/reservations/${ctx.idReservation}/pay`, {
    methode: "PUT",
    jeton: ctx.jeton,
  });

  assert.strictEqual(
    statut,
    409,
    "Une réservation déjà payée ne se repaie pas",
  );
});

// ============================================================================
// NETTOYAGE
// ============================================================================

after(async () => {
  // Supprimer dans l'ordre imposé par les clés étrangères : les réservations
  // d'abord, le compte ensuite.
  if (ctx.idUser) {
    await requete("DELETE FROM RESERVATION WHERE id_user = ?", [ctx.idUser]);
    await requete("DELETE FROM PASSWORD_RESET WHERE id_user = ?", [ctx.idUser]);
    await requete("DELETE FROM UTILISATEUR WHERE id_user = ?", [ctx.idUser]);
  }
  db.end();
});

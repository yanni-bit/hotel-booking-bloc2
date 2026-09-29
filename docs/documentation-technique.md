# Documentation technique

**Book Your Travel, application de réservation d'hôtel**
Bloc 2 de la certification Développeur Web (RNCP), Ilaria Digital School.

Auteur : Yannick Franchaisse
Dépôt : https://github.com/yanni-bit/hotel-booking-bloc2

---

## Sommaire

1. [Présentation du projet](#1-présentation-du-projet)
2. [Choix technologiques](#2-choix-technologiques)
3. [Architecture générale](#3-architecture-générale)
4. [Modèle de données](#4-modèle-de-données)
5. [Organisation du code](#5-organisation-du-code)
6. [Authentification et autorisation](#6-authentification-et-autorisation)
7. [Le parcours de réservation](#7-le-parcours-de-réservation)
8. [Sécurité et protection des données](#8-sécurité-et-protection-des-données)
9. [Tests](#9-tests)
10. [Installation et exploitation](#10-installation-et-exploitation)
11. [Limites connues et évolutions](#11-limites-connues-et-évolutions)

---

## 1. Présentation du projet

### 1.1 Ce que fait l'application

Book Your Travel permet de rechercher un hôtel, de comparer les chambres et les
offres tarifaires, de réserver un séjour avec des services additionnels, de
payer, puis de suivre et modifier ses réservations. Une interface
d'administration permet de gérer le catalogue, les utilisateurs, les avis et les
messages reçus.

L'application est multilingue (français, anglais, italien) et affiche les prix
dans trois devises.

### 1.2 La contrainte du bloc

Le Bloc 2 interdit l'usage d'un framework côté serveur. Le back-end est écrit en
Node.js natif, avec le seul module `http`. Pas d'Express, pas de middleware, pas
d'ORM. Cette contrainte n'est pas un détail d'implémentation : elle détermine la
forme du code, et une bonne partie de ce document consiste à expliquer ce que le
serveur doit faire lui-même parce qu'aucun framework ne le fait à sa place.

Le front-end n'est pas soumis à cette contrainte et utilise Angular.

### 1.3 Chiffres du projet

| Élément | Valeur |
| --- | --- |
| Tables MySQL | 21, plus 2 vues |
| Contraintes de clé étrangère | 27 |
| Points d'entrée de l'API | 80 |
| dont routes publiques | 26 |
| dont routes à jeton simple | 14 |
| dont routes réservées aux prestataires | 3 |
| dont routes réservées aux administrateurs | 37 |
| Fichiers de routes | 7 |
| Modèles | 11, dont une classe mère |
| Composants Angular | 41 |
| Services Angular | 10 |
| Tests unitaires back-end | 21 |
| Tests d'intégration | 12 |
| Lignes de JavaScript côté serveur | environ 7 200 |

---

## 2. Choix technologiques

### 2.1 Node.js natif, et ce que cela implique

Sans Express, il n'existe ni routeur, ni analyseur de corps de requête, ni
gestion automatique des en-têtes. `server.js` fait tout cela à la main :

- `url.parse()` découpe l'URL et dépose `pathname` et `query` sur l'objet
  `req` ;
- les en-têtes CORS sont posés sur chaque réponse, et les requêtes `OPTIONS`
  de pré-vérification reçoivent une réponse immédiate ;
- l'aiguillage se fait par une suite de `if (req.pathname.startsWith(...))`
  qui délègue à l'un des sept fichiers de routes ;
- chaque gestionnaire lit lui-même le corps de la requête en accumulant les
  morceaux reçus sur l'événement `data`, puis l'analyse sur `end`.

Le coût est réel : environ 7 200 lignes côté serveur, là où un projet Express
équivalent en ferait beaucoup moins. Le bénéfice pédagogique l'est aussi, et
c'est l'objet du bloc : rien n'est masqué.

### 2.2 Angular côté client

Angular 21 en composants standalone, TypeScript 5.9, Bootstrap 5.3 et SCSS.
Le choix d'Angular plutôt que du DOM manipulé à la main tient à la taille de
l'interface : 41 composants, un espace d'administration complet, du routage,
de l'internationalisation. Le système d'injection de dépendances et les
intercepteurs HTTP évitent de répéter la logique d'authentification dans
chaque appel.

### 2.3 MySQL avec mysql2, sans ORM

Toutes les requêtes sont écrites en SQL et exécutées par `mysql2` en requêtes
préparées, avec des paramètres liés. Aucune chaîne SQL n'est construite par
concaténation.

Les `?` d'une requête préparée ne sont pas remplacés par du texte avant
l'envoi. La requête et les
valeurs partent séparément, et le serveur MySQL ne confond jamais une valeur
avec une instruction. C'est la raison pour laquelle coller une de ces requêtes
dans phpMyAdmin produit une erreur de syntaxe : les `?` n'y sont liés à rien.

### 2.4 Le reste de la pile

| Paquet | Rôle |
| --- | --- |
| `jsonwebtoken` | Signature et vérification des jetons |
| `bcrypt` | Hachage des mots de passe, coût 10 |
| `mysql2` | Pilote MySQL, requêtes préparées |
| `dotenv` | Variables d'environnement |
| `nodemon` | Rechargement automatique en développement |

Cinq dépendances au total, dont une seule de développement.

---

## 3. Architecture générale

### 3.1 Vue d'ensemble

```
Navigateur
   |
   |  Angular 21, port 4300
   |  composants, services, gardes de route
   |  authInterceptor ajoute Authorization: Bearer <jeton>
   |
   v  requêtes HTTP JSON
Serveur Node.js, port 3000
   |
   |  server.js         en-têtes CORS, OPTIONS, url.parse, aiguillage
   |  routes/*.js       un fichier par domaine, lecture du corps,
   |                    appel du contrôle d'accès, codes HTTP
   |  utils/auth.js     requireAuth, requireProvider, requireAdmin
   |  controllers/*.js  règles métier, pour trois domaines
   |  models/*.js       requêtes SQL préparées
   |
   v
MySQL, base hotel_booking
   21 tables, 2 vues, index dont un FULLTEXT
```

### 3.2 Le cycle d'une requête

1. Le navigateur émet la requête. L'intercepteur Angular y ajoute l'en-tête
   `Authorization` si un jeton est en session.
2. `server.js` pose les en-têtes CORS. Si la méthode est `OPTIONS`, il répond
   204 et s'arrête là.
3. `url.parse()` remplit `req.pathname` et `req.query`.
4. L'aiguillage appelle le fichier de routes correspondant au préfixe.
5. Le gestionnaire de route appelle `requireAuth()` ou `requireAdmin()` si la
   route est protégée. En cas de refus, la réponse est déjà envoyée et le
   gestionnaire s'arrête.
6. Le gestionnaire lit le corps s'il y en a un, puis appelle un modèle ou un
   contrôleur.
7. Le modèle exécute une requête préparée et rappelle le gestionnaire avec le
   résultat ou l'erreur.
8. Le gestionnaire choisit le code HTTP et sérialise la réponse JSON.

### 3.3 MVC sans framework

La séparation est respectée, mais elle n'est pas uniforme.

Les **modèles** (`backend/models/`) portent tout l'accès aux données. Ce sont
des classes à méthodes statiques, sans instanciation : `Reservation.create()`,
`User.findByEmail()`. Chaque méthode prend un callback `(err, result)`,
convention historique de Node.

Les **contrôleurs** (`backend/controllers/`) n'existent que pour trois
domaines : hôtels, chambres, avis. Ailleurs, la logique tient dans le
gestionnaire de route. La raison est chronologique autant que pratique : un
contrôleur a été introduit là où plusieurs routes partageaient la même
préparation de données, et les domaines développés ensuite ne sont pas passés
par cette étape. L'application de la couche contrôleur est donc inégale, trois
domaines sur sept, et une harmonisation consisterait à extraire un contrôleur
par domaine restant.

Les **routes** (`backend/routes/`) jouent le rôle de couche de présentation
HTTP : elles traduisent une requête en appel de modèle et un résultat en code
de statut.

La **vue** est entièrement côté Angular. Le serveur ne rend aucun HTML, il ne
produit que du JSON.

### 3.4 Héritage entre modèles

Quatre requêtes revenaient à l'identique dans plusieurs modèles : lire toutes
les lignes d'une table, en lire une par sa clé, insérer, supprimer. Seuls
changeaient le nom de la table et celui de la clé primaire.

`BaseModel` les factorise. Chaque classe fille déclare ce qui la distingue et
hérite du reste :

```js
class CategorieService extends BaseModel {
  static get table() { return "CATEGORIE_SERVICE"; }
  static get clePrimaire() { return "id_categorie"; }
  static get champs() { return ["code_categorie", "nom_categorie", ...]; }
}
```

Le mécanisme repose sur un point de JavaScript : dans une méthode statique,
`this` désigne la classe qui appelle, pas celle où la méthode est écrite.
`this.table` vaut donc `CATEGORIE_SERVICE` quand l'appel part de
`CategorieService`, et `messages_contact` quand il part de `Contact`. La
requête est écrite une seule fois dans la classe mère.

Trois classes en héritent aujourd'hui : `CategorieService`, `Service` et
`Contact`, ce dernier ayant été converti d'un objet littéral en classe à cette
occasion. Une méthode n'est redéfinie que lorsque son comportement diffère
réellement :

| Méthode | Traitement |
| --- | --- |
| `Service.getAll`, `getAllAdmin`, `getById` | Redéfinies sans appel à la classe mère : elles joignent `CATEGORIE_SERVICE` pour renvoyer le libellé avec le service, ce que la requête générique ne sait pas produire |
| `Service.update`, `toggleStatus` | Appliquent les valeurs par défaut propres aux services, puis délèguent l'écriture à `super.update` |
| `Service.delete` | Garde ses deux étapes, la seconde appelle `super.delete` |
| `CategorieService.delete` | Appelle `super.delete` puis traduit `ER_ROW_IS_REFERENCED_2` en message métier |
| `Contact.getById` | Appelle `super.getById` et traduit l'absence de résultat en erreur, pour que la route réponde 404 sans être modifiée |
| `Contact.getAll`, `delete` | Non redéfinies, la requête générique suffit |

Une précaution de sécurité gouverne la classe mère. Un nom de table ou de
colonne ne peut pas être passé en paramètre préparé, la syntaxe SQL ne
l'autorise pas. Ces noms ne proviennent donc jamais de la requête HTTP : ils
sont lus dans les propriétés statiques déclarées en dur, et `champs` sert de
liste blanche, de sorte qu'une clé inconnue envoyée par le client est ignorée.
Les valeurs, elles, restent systématiquement passées en paramètres préparés.

Les autres modèles n'héritent pas de `BaseModel`. `Reservation`, `Hotel` et
`User` n'ont pratiquement aucune requête générique : presque toutes leurs
méthodes portent des jointures ou des règles métier. L'héritage leur apporterait
une indirection sans supprimer de duplication.

---

## 4. Modèle de données

Le diagramme complet est dans `docs/diagrammes/mcd-bloc2.png`. Sa source
Graphviz, `mcd-bloc2.dot`, est à côté : les schémas sont générés depuis un
fichier texte versionné, pas dessinés à la main.

### 4.1 Les 21 tables par domaine

**Utilisateurs**

| Table | Rôle |
| --- | --- |
| `utilisateur` | Comptes, empreinte bcrypt du mot de passe |
| `role` | `admin`, `provider`, `client` |
| `adresse_user` | Adresse postale, facultative |
| `password_reset` | Jetons de réinitialisation, valables deux heures |
| `hotel_prestataire` | Rattachement d'un compte aux établissements qu'il gère |

**Catalogue**

| Table | Rôle |
| --- | --- |
| `hotel` | Établissements, coordonnées, note moyenne |
| `hotel_amenities` | Équipements de l'hôtel, douze booléens |
| `img_hotel` | Photos de l'hôtel, avec catégorie |
| `chambre` | Chambres physiques, capacité, surface |
| `img_chambre` | Photos de chambre |
| `offre` | Conditions tarifaires appliquées à une chambre |
| `categorie_service` | Nature des services : restauration, bien-être, transport... |
| `services_additionnels` | Catalogue global des services |
| `hotel_services` | Prix d'un service dans un hôtel donné |

**Réservation**

| Table | Rôle |
| --- | --- |
| `reservation` | Séjour réservé, dates, montants figés |
| `reservation_services` | Services retenus, quantité et sous-total |
| `paiement` | Trace du règlement |
| `statut` | Six états, de « En attente » à « En cours » |

**Interactions**

| Table | Rôle |
| --- | --- |
| `avis` | Notes et commentaires |
| `favori` | Hôtels mis de côté par un utilisateur |
| `messages_contact` | Formulaire de contact |

### 4.2 La distinction chambre et offre

C'est la décision de modélisation la plus structurante du schéma.

Une `chambre` est un objet physique : un type de lit, une surface, une capacité
maximale. Une `offre` est une manière de la vendre : un prix à la nuit, une
politique d'annulation, un régime de pension, un petit-déjeuner inclus ou non.

Une même chambre porte donc plusieurs offres, par exemple une offre
remboursable à 180 euros et une offre non remboursable à 150. La réservation
référence les deux : `id_chambre` désigne ce qui sera occupé, `id_offre`
désigne les conditions acceptées.

Cela a une conséquence directe sur le contrôle de disponibilité, qui porte sur
`id_chambre` et non sur `id_offre` : réserver l'offre remboursable doit rendre
la chambre indisponible pour l'offre non remboursable.

### 4.3 Montants figés

`reservation.prix_nuit` et `reservation.total_price` recopient les montants au
moment de la réservation. Ils ne sont pas recalculés à la lecture.

C'est volontaire. Si l'hôtelier change son tarif la semaine suivante, le client
doit continuer de voir le prix auquel il a réservé. Une jointure vers `offre`
afficherait le nouveau prix, ce qui serait faux et juridiquement discutable.

### 4.4 Les deux vues SQL

Deux vues regroupent les jointures les plus répétées.

`v_chambres_offres` joint `hotel`, `chambre` et `offre`, et expose le nom de
l'hôtel, sa ville, sa note, le type de chambre, la capacité, le nom de l'offre,
le prix à la nuit, le petit-déjeuner et le caractère remboursable. Elle sert
l'affichage du catalogue, qui sans elle demanderait la même jointure à trois
tables répétée dans plusieurs requêtes.

`v_reservations_details` joint `reservation`, `utilisateur`, `hotel`, `chambre`
et `offre`. Elle rassemble en une ligne ce qu'un écran d'administration doit
montrer d'une réservation : le numéro de confirmation, le client, l'hôtel, le
type de chambre, l'offre, les dates, le montant et le statut. Sans elle, cet
écran demanderait une jointure à cinq tables.

Ces deux vues sont la réponse au critère « optimiser les requêtes SQL » : elles
ne changent pas le plan d'exécution, mais elles suppriment la duplication de
jointures complexes dans le code, ce qui est la première cause de divergence
entre deux écrans censés montrer la même donnée.

### 4.5 Index

Outre les clés primaires et étrangères, la base porte des index destinés aux
recherches fréquentes :

- `idx_search`, index FULLTEXT sur `hotel(nom_hotel, ville_hotel, pays_hotel,
  description_hotel)`, pour la recherche plein texte ;
- `idx_hotel_ville_note` sur `hotel(ville_hotel, note_moy_hotel)`, index
  composite servant le tri des résultats par note dans une ville ;
- `idx_reservation_dates` sur `reservation(id_hotel, check_in, check_out)` et
  `idx_dates` sur `reservation(check_in, check_out)`, qui servent le contrôle
  de chevauchement décrit en section 7 ;
- `idx_offre_prix` sur `offre(id_chambre, prix_nuit)`, pour présenter les
  offres d'une chambre par prix croissant.

Deux contraintes d'unicité composées complètent ce dispositif :
`favori(id_user, id_hotel)` empêche de mettre deux fois le même hôtel en
favori, et `hotel_services(id_hotel, id_service)` empêche de définir deux prix
pour le même service dans le même hôtel.

### 4.6 Ce que le schéma ne garantit pas

Deux écarts sont visibles sur le diagramme et doivent être assumés.

`reservation.id_statut` et `paiement.id_statut` ne portent **aucune contrainte
de clé étrangère** vers `statut`. Le lien est purement applicatif. Rien
n'empêche en base d'y écrire un identifiant de statut inexistant. Sur le
diagramme, ces deux liens sont en pointillé.

`hotel_amenities.id_hotel` ne porte **aucune contrainte d'unicité**. La
relation est donc un vers plusieurs, alors que l'intention était un vers un :
un hôtel, une ligne d'équipements. Le code ne crée qu'une ligne par hôtel, mais
la base ne l'impose pas.

---

## 5. Organisation du code

### 5.1 Arborescence

```
hotel-booking-bloc2/
├── backend/
│   ├── server.js                  Serveur HTTP, CORS, aiguillage
│   ├── config/
│   │   └── database.js            Connexion MySQL
│   ├── database/
│   │   └── hotel_booking_Bloc_2.sql
│   ├── models/                    BaseModel, Avis, CategorieService, Chambre,
│   │                              Contact, Hotel, Offre, Prestataire,
│   │                              Reservation, Service, User
│   ├── controllers/               avis, chambre, hotel
│   ├── routes/                    auth, avis, contact, hotel, offre,
│   │                              reservation, service
│   ├── utils/
│   │   └── auth.js                requireAuth, requireProvider, requireAdmin
│   └── tests/                     auth.test.js, user.test.js,
│                                  integration.test.js
│
├── frontend/hotel-app/src/app/
│   ├── components/                41 composants standalone
│   ├── services/                  10 services HTTP
│   ├── guards/                    auth.guard.ts, admin.guard.ts,
│   │                              provider.guard.ts
│   ├── interceptors/              auth.interceptor.ts
│   ├── pipes/                     currency.pipe.ts
│   └── app.routes.ts
│
├── docs/
│   ├── diagrammes/                MCD, schéma physique, séquence,
│   │                              cas d'utilisation, enchaînement des vues
│   ├── documentation-technique.md
│   └── schema-physique.md
│
└── Documentations/                maquettes et référentiel (PDF)
```

### 5.2 Les sept fichiers de routes

| Fichier | Préfixe servi | Routes |
| --- | --- | --- |
| `hotelRoutes.js` | `/api/hotels`, `/api/chambres`, `/api/search`, `/api/destinations`, `/api/cities` | 19 |
| `authRoutes.js` | `/api/auth` | 18 |
| `serviceRoutes.js` | `/api/services` | 15 |
| `reservationRoutes.js` | `/api/reservations` | 12 |
| `contactRoutes.js` | `/api/contact` | 9 |
| `avisRoutes.js` | `/api/avis` | 6 |
| `offreRoutes.js` | `/api/offres` | 1 |

Les routes ne sont pas déclarées dans une table : chaque fichier est une suite
de conditions sur `pathname` et `method`, évaluées dans l'ordre. L'ordre compte,
et c'est une des différences avec un routeur de framework. `/api/reservations/:id/services`
doit être testée avant `/api/reservations/:id`, sinon la seconde capterait la
première. Un commentaire le signale dans le fichier.

### 5.3 Côté Angular

Les composants sont standalone, sans NgModule. Les services encapsulent les
appels HTTP et ne contiennent pas de logique de présentation.

Deux mécanismes transversaux :

`authInterceptor` ajoute l'en-tête `Authorization: Bearer` à **toutes** les
requêtes sortantes lorsqu'un jeton est en session, et intercepte les réponses
401 pour déconnecter l'utilisateur et le renvoyer vers la page de connexion.
C'est ce qui explique qu'aucune modification côté Angular n'ait été nécessaire
lors de la sécurisation des 31 routes du back-end : le jeton était déjà envoyé
partout.

`authGuard`, `providerGuard` et `adminGuard` empêchent d'accéder à une route du
front sans être connecté, sans être prestataire ou sans être administrateur. Ce
sont des gardes d'interface, pas une sécurité : elles évitent d'afficher un
écran vide, mais la protection réelle est côté serveur.

---

## 6. Authentification et autorisation

### 6.1 Mots de passe

Les mots de passe sont hachés avec bcrypt, coût 10. Le sel est généré par
bcrypt et stocké dans l'empreinte elle-même, ce qui explique que deux comptes
partageant le même mot de passe aient deux empreintes différentes. C'est ce que
vérifie l'un des tests unitaires.

Aucun mot de passe en clair ne transite ni n'est stocké. La comparaison passe
par `bcrypt.compare()`, qui recalcule l'empreinte avec le sel extrait de la
valeur stockée.

### 6.2 Réinitialisation

`password_reset` stocke un jeton aléatoire unique, une date d'expiration à deux
heures et un indicateur de consommation. Le mécanisme est complet en base.

L'envoi de courriel n'est pas implémenté : le lien est écrit dans le journal du
serveur et renvoyé dans la réponse de l'API, où la page l'affiche. Point
détaillé en section 11.1.

### 6.3 Contenu du jeton

`User.generateToken()` construit un payload explicite :

```js
{
  id_user: user.id_user,
  email:   user.email_user,
  role:    user.code_role,
  prenom:  user.prenom_user,
  nom:     user.nom_user
}
```

Signé avec `JWT_SECRET`, expiration par défaut à sept jours.

Le payload est **construit champ par champ**, et non recopié depuis la ligne
de base : un payload JWT est signé mais
pas chiffré, n'importe qui peut le lire avec un décodeur en ligne, et recopier
l'utilisateur entier y exposerait l'empreinte du mot de passe.

Le `role` vient de `code_role`, c'est-à-dire de la table `ROLE`, et jamais
d'une valeur transmise par le client.

### 6.4 Pas de middleware : requireAuth, requireProvider et requireAdmin

Sans Express, rien ne s'exécute automatiquement avant un gestionnaire de route.
Le contrôle d'accès est donc appelé explicitement.

`backend/utils/auth.js` expose quatre fonctions :

| Fonction | Comportement |
| --- | --- |
| `getAuthUser(req)` | Lit l'en-tête, exige le schéma `Bearer`, vérifie la signature. Renvoie le payload ou `null`. N'écrit rien. |
| `requireAuth(req, res)` | Appelle la précédente. Renvoie le payload, ou répond 401 et renvoie `null`. |
| `requireProvider(req, res)` | Répond 401 sans jeton, 403 si le rôle n'est ni `provider` ni `admin`, renvoie le payload sinon. |
| `requireAdmin(req, res)` | Répond 401 sans jeton, 403 si `role !== "admin"`, renvoie le payload sinon. |

Chaque gestionnaire protégé commence par deux lignes :

```js
const auth = requireAuth(req, res);
if (!auth) return;
```

Le `null` signifie que la réponse d'erreur est déjà partie. Le `return` évite
d'écrire une seconde fois dans une réponse close.

L'ordre des contrôles dans `requireAdmin` est significatif : sans jeton, la
réponse est 401 et non 403. Répondre 403 à un appelant non identifié
reviendrait à lui signifier « vous êtes identifié mais pas autorisé ».

`requireProvider` accepte aussi le rôle `admin` : un administrateur peut tout
ce que peut un prestataire. Le rôle ne suffit cependant pas. Les routes du
prestataire vérifient ensuite, par une requête sur `hotel_prestataire`, que
l'établissement concerné lui est bien confié. Un prestataire authentifié qui
demanderait le changement de statut d'une réservation d'un autre hôtel reçoit
un 403, alors même que son rôle est le bon.

Le fichier `authRoutes.js` fait exception : ses treize routes protégées
appellent `User.verifyToken()` directement, sans passer par ce module. C'est
de l'antériorité, ce fichier existait avant.

### 6.5 Répartition des 80 routes

| Régime | Routes | Exemples |
| --- | --- | --- |
| Public | 26 | Catalogue, recherche, avis d'un hôtel, dates occupées d'une chambre, formulaire de contact, inscription, connexion, mot de passe oublié |
| Jeton valide | 14 | Réserver, payer, consulter ses réservations, modifier ses dates, annuler, rédiger un avis, gérer son profil, supprimer son compte |
| Rôle prestataire | 3 | Consulter les réservations de ses établissements, la liste de ses établissements, changer le statut d'une réservation de son périmètre |
| Rôle administrateur | 37 | Gérer les hôtels, les services, les catégories, les utilisateurs, les rôles, rattacher un prestataire, modérer les avis, traiter les messages, suivre toutes les réservations |

---

## 7. Le parcours de réservation

Le diagramme de séquence complet est dans
`docs/diagrammes/sequence-reservation.png`.

### 7.1 Étape 1, la création

`POST /api/reservations`, sous `requireAuth`.

La première instruction après le contrôle d'accès est celle-ci :

```js
reservationData.id_user = auth.id_user;
```

L'identité vient du jeton signé. Un `id_user` envoyé dans le corps de la
requête est écrasé, volontairement. C'est la correction de la faille décrite en
section 8.

### 7.2 Le contrôle de disponibilité

Avant toute écriture, le modèle vérifie qu'aucune réservation bloquante ne
chevauche la période demandée sur la même chambre.

```sql
SELECT id_reservation
FROM RESERVATION
WHERE id_chambre = ?
  AND id_statut IN (?)
  AND check_in  < ?     -- check_out demandé
  AND check_out > ?     -- check_in demandé
LIMIT 1
```

Deux aspects de cette requête.

**Les statuts bloquants** sont 1 (En attente), 2 (Confirmée) et 6 (En cours).
Une réservation annulée, refusée ou terminée ne bloque rien. Inclure le statut
1 est un choix : une réservation non encore payée immobilise la chambre, ce qui
évite de vendre deux fois le même séjour pendant qu'un client saisit sa carte.

**Les comparaisons sont strictes.** Deux séjours se chevauchent dès que l'un
commence avant que l'autre ne finisse. Avec des comparaisons larges, un départ
le 10 empêcherait une arrivée le 10, ce qui interdirait l'enchaînement normal
de deux clients sur la même chambre.

Si un conflit est trouvé, le modèle rappelle avec une erreur, que la route
traduit en **409 Conflict**, avec le message envoyé tel quel au client. Sinon,
l'insertion a lieu avec `id_statut = 1`.

### 7.3 Les services additionnels

Les services retenus sont insérés dans `reservation_services` avec un calcul de
sous-total qui dépend du type :

| `type_service` | Quantité | Sous-total |
| --- | --- | --- |
| `journalier` | nombre de nuits | prix × nuits |
| `par_personne` | nuits × adultes | prix × nuits × adultes |
| `sejour` | 1 | prix |
| `unitaire` | 1 | prix |

### 7.4 Le numéro de confirmation

```js
`BYT-${Date.now().toString(36)}-${aléatoire5caractères}`
```

L'horodatage en base 36 garantit l'unicité dans le temps, le suffixe aléatoire
évite que deux réservations créées dans la même milliseconde se ressemblent.
Format lisible et communicable au client.

### 7.5 Étape 2, le paiement

La validation de la carte est faite côté Angular : format des champs, préfixe,
puis algorithme de Luhn. Ce n'est **pas une sécurité**, c'est un contrôle de
saisie. Aucun paiement réel n'est traité et aucune valeur ne dépend de cette
vérification.

La confirmation passe par `PUT /api/reservations/:id/pay`, sous `requireAuth`,
adossée à `Reservation.markAsPaid()`.

Cette méthode ne connaît qu'une seule transition, du statut 1 au statut 2, et
refuse dans deux cas :

| Situation | Code |
| --- | --- |
| La réservation n'existe pas ou appartient à un autre compte | 403 |
| Elle n'est plus au statut 1 | 409 |
| Propriétaire, statut 1 | 200 |

Le corps de la requête n'est pas lu : la réservation est désignée par l'URL, le
payeur par le jeton, et le statut visé est fixé côté serveur. Un client ne peut
donc pas déclarer sa réservation « Terminée » ou « Refusée ».

`PUT /api/reservations/:id/status`, qui accepte n'importe quel statut, reste
strictement réservée aux administrateurs.

---

## 8. Sécurité et protection des données

### 8.1 Dispositif en place

L'application repose sur cinq mesures, décrites en détail dans les sections
précédentes et rappelées ici.

**Identité vérifiée, jamais déclarée.** Toute route protégée obtient l'identité
de l'appelant en vérifiant la signature du jeton, jamais en lisant une valeur
transmise par le client. Un `id_user` présent dans le corps d'une requête de
réservation est écrasé par celui du jeton.

**Permissions séparées par rôle.** 37 routes exigent le rôle `admin`, 3 le rôle `provider`, 14 un
jeton valide, 26 restent publiques. Le rôle provient de la table `ROLE` et est
recopié dans le jeton à la connexion.

**Contrôle de propriété.** Un client ne consulte, ne modifie et n'annule que
ses propres réservations. La vérification se fait en base, par une clause
`WHERE id_reservation = ? AND id_user = ?`, et non par comparaison d'un
identifiant fourni. L'administrateur en est exempté explicitement.

**Mots de passe hachés.** bcrypt, coût 10, sel aléatoire par enregistrement.
Aucun mot de passe en clair n'est stocké ni journalisé, et le jeton ne
transporte pas l'empreinte.

**Requêtes préparées systématiques.** Toutes les requêtes passent par `mysql2`
avec des paramètres liés. Aucune concaténation de chaîne SQL dans le projet.
Les valeurs ne peuvent donc pas être interprétées comme des instructions.

Ce dispositif est couvert par 21 tests unitaires décrits en section 9.

### 8.2 Historique des correctifs

Trois défauts ont été identifiés en fin de développement et corrigés. Ils sont
documentés ici parce que les correctifs expliquent la forme actuelle du code.

**Contrôle d'accès incomplet.** Jusqu'à la phase de recette, seul
`authRoutes.js` vérifiait le jeton. Les six autres fichiers de routes lisaient
l'identité de l'appelant depuis `req.query.userId` ou depuis le corps de la
requête. L'écart a été relevé en confrontant le code à l'exigence du cahier des
charges de « gérer les permissions et les rôles pour les différentes sections
de l'application », puis en comptant les vérifications de jeton par fichier.

Correctif : création de `backend/utils/auth.js` et passage de 31 routes sous
`requireAuth` ou `requireAdmin`, avec ajout des contrôles de propriété
manquants. Vérifié par appels directs à l'API : `DELETE /api/hotels/1` sans
jeton répond 401, `GET /api/hotels` répond toujours 200,
`PUT /api/reservations/20/status` avec un jeton client valide répond 403.
Aucune modification n'a été nécessaire côté Angular, l'intercepteur envoyant
déjà le jeton sur toutes les requêtes.

**Absence de contrôle de disponibilité à la création.** La requête de
chevauchement n'existait que dans la méthode de modification. Deux clients
pouvaient réserver la même chambre aux mêmes dates.

Correctif : `Reservation.create()` découpée en deux étapes, contrôle de conflit
puis insertion, décrites en section 7.2. Vérifié à trois niveaux, requête SQL
exécutée directement, appel à l'API, puis parcours complet dans le navigateur
produisant le 409 attendu.

**Régression sur le parcours de paiement.** Le passage de
`PUT /api/reservations/:id/status` sous `requireAdmin` a rendu la confirmation
de paiement inaccessible aux clients, qui recevaient 403. Relevé lors de la
relecture de `payment.ts`.

Correctif : route dédiée `PUT /api/reservations/:id/pay`, décrite en section
7.5, n'autorisant que la transition du statut 1 vers le statut 2 et réservant
le changement de statut arbitraire aux administrateurs.

Cette dernière correction illustre un point méthodologique : restreindre une
permission est une modification fonctionnelle, et pas seulement défensive. Elle
impose de rejouer les parcours qui utilisaient la route restreinte, et pas
seulement de vérifier que les accès non autorisés échouent.

### 8.3 Choix de conception et leurs limites

**Stockage du jeton côté navigateur.** Le jeton n'est pas placé dans un cookie
`HttpOnly`, ce qui le rendrait inaccessible au JavaScript de la page. Le choix
retenu simplifie l'envoi par l'intercepteur Angular et le partage entre onglets,
au prix d'une exposition en cas de faille de type XSS. Le passage au cookie
`HttpOnly` impliquerait de gérer la protection CSRF côté serveur, ce qui sort
du périmètre livré.

**Absence de limitation de débit à la connexion.** Le nombre de tentatives
n'est pas plafonné. La mesure demanderait un compteur par adresse et par compte,
avec une fenêtre glissante, qu'aucun stockage du projet ne porte actuellement.

**Politique CORS permissive.** `Access-Control-Allow-Origin` vaut `*`, ce qui
convient à un développement local où le front et l'API occupent deux ports
distincts. En production, la valeur serait restreinte à l'origine du front.

### 8.4 Données personnelles

Le référentiel demande quatre choses au titre du RGPD : identifier les données
sensibles, informer l'utilisateur, lui ouvrir un droit de consultation, de
modification et de suppression, et protéger les données sensibles.

**Ce qui est collecté.** Identité et adresse électronique à l'inscription,
téléphone et adresse postale facultatifs, historique des réservations et des
paiements, avis publiés, messages envoyés par le formulaire de contact, dates
d'inscription et de dernière connexion. Aucune donnée n'est collectée à l'insu
de l'utilisateur : chaque information est saisie dans un formulaire ou
engendrée par son usage du site.

**Aucune donnée bancaire complète n'est enregistrée.** La table `paiement`
conserve le montant, la devise, le moyen de paiement, une référence de
transaction et les derniers chiffres de la carte. Le numéro complet, la date
d'expiration et le code de sécurité ne traversent jamais la base.

**Information.** La page `/privacy` énumère les données, leurs finalités, les
bases légales, les durées de conservation, les destinataires, les mesures de
sécurité et les modalités d'exercice des droits. Une mention et un lien
figurent sous le formulaire d'inscription et sous le formulaire de contact.

**Consultation et rectification.** L'espace profil affiche les données du
compte et permet de les modifier. La liste des réservations donne accès à
l'historique.

**Suppression.** La route `DELETE /api/auth/account` prend l'identité dans le
jeton, jamais dans l'URL ni dans le corps : un utilisateur ne peut supprimer
que son propre compte, même en fabriquant la requête à la main. L'écran de
profil exige la saisie du mot `SUPPRIMER` avant d'activer le bouton, parce que
l'opération est irréversible.

La suppression est une anonymisation, et ce n'est pas un contournement. Les
contraintes `reservation_ibfk_2` et `paiement_ibfk_2` sont en `ON DELETE
RESTRICT` : la base refuse de supprimer un compte dès qu'il a réservé une fois,
parce que ces écritures portent une obligation de conservation comptable.
`User.anonymiser()` applique donc la réponse prévue dans ce cas :

| Donnée | Traitement |
| --- | --- |
| Nom, prénom, téléphone | Effacés |
| Adresse électronique | Remplacée par une valeur neutre, `supprime_<id>@anonyme.local` |
| Mot de passe | Remplacé par une valeur qui n'est pas un condensat bcrypt valide, la comparaison échouera toujours |
| Compte | Désactivé, `actif = 0` |
| Adresse postale, favoris, demandes de réinitialisation | Supprimés |
| Avis publiés | Conservés, `id_user` passé à NULL, le texte reste sans son auteur |
| Réservations, paiements | Conservés, rattachés à un compte qui ne désigne plus personne |

**Pas de bandeau cookies.** L'application n'utilise ni cookie publicitaire ni
traceur d'audience. Le jeton d'authentification et le choix de langue sont
conservés dans le stockage local du navigateur, strictement nécessaires au
fonctionnement, donc dispensés de consentement.

## 9. Tests

### 9.1 Back-end

21 tests unitaires, écrits avec `node:test`, le lanceur intégré à Node depuis
la version 18. Aucune dépendance ajoutée, ce qui est cohérent avec un back-end
écrit sans framework.

```
cd backend
node --test tests/auth.test.js tests/user.test.js
```

`npm test` exécute tout le dossier `tests/`, donc ces 21 cas plus les 12 tests
d'intégration de la section suivante, soit 33 au total.

| Fichier | Portée | Tests |
| --- | --- | --- |
| `tests/auth.test.js` | `getAuthUser`, `requireAuth`, `requireAdmin` | 10 |
| `tests/user.test.js` | `generateToken`, `verifyToken`, `verifyPassword` | 11 |

Les cas couverts sont des tentatives de contournement plausibles plutôt que des
vérifications de surface : en-tête absente, schéma `Basic` au lieu de `Bearer`,
jeton vide après le préfixe, signature retouchée d'un caractère, jeton signé
avec un autre secret, jeton expiré, rôle client sur une route administrateur.
Côté modèle : les cinq champs du payload, l'absence du mot de passe dans le
jeton, la présence d'une expiration, et la démonstration du sel bcrypt.

Les fonctions testées n'émettent aucune requête SQL. En revanche, la chaîne
`utils/auth` vers `models/User` vers `config/database` ouvre une connexion
MySQL au chargement du module, et `config/database.js` appelle `process.exit(1)`
si elle échoue. MySQL doit donc tourner pour lancer les tests, et un `after()`
ferme la connexion sans quoi le processus ne rendrait jamais la main.

### 9.2 Tests d'intégration

12 cas dans `tests/integration.test.js`, écrits avec le même lanceur. À la
différence des précédents, ils n'isolent rien : ils appellent la véritable API
sur le serveur lancé et traversent le routage, le contrôle d'accès, les
modèles et la base.

```
cd backend
node --test tests/integration.test.js
```

| Ce qui est vérifié | Attendu |
| --- | --- |
| Inscription d'un compte client | 200 ou 201 |
| Connexion | jeton exploitable et identifiant renvoyés |
| Création de réservation sans jeton | 401 |
| Création de réservation avec jeton | réservation créée |
| Identité enregistrée en base | celle du jeton, pas celle du corps de la requête |
| Liste des réservations du client | la réservation y figure |
| Seconde réservation sur les mêmes nuits | 409 |
| Arrivée le jour du départ précédent | acceptée |
| Liste de toutes les réservations, appelée par un client | 403 |
| Liste des utilisateurs, appelée par un client | 403 |
| Paiement | statut passé à 2, Confirmée |
| Second paiement de la même réservation | 409 |

Deux précautions rendent ces tests rejouables sans polluer la base. Le compte
est créé avec une adresse horodatée, et les nuits réservées sont en 2030, donc
sans intersection possible avec les données existantes. Le bloc `after()`
supprime les réservations puis le compte, dans l'ordre imposé par les clés
étrangères.

Ces tests couvrent précisément ce que la section 9.4 signalait comme non
testé : le contrôle de chevauchement des dates et la transition de paiement,
vérifiés ici de bout en bout plutôt qu'en isolation.

### 9.3 Front-end

47 fichiers `.spec.ts` générés par le CLI Angular, un par composant et par
service, contenant chacun une vérification d'instanciation. Ils garantissent
que chaque brique de l'interface se construit sans erreur d'injection, ce qui
n'est pas rien, mais ce ne sont pas des tests de comportement.

Ils sont donc comptabilisés à part des 21 tests unitaires du back-end.

### 9.4 Ce qui n'est pas couvert

Le contrôle de chevauchement des dates et `markAsPaid()` ne sont pas testés
unitairement, parce que les deux exécutent des requêtes SQL. Les tester en
isolation demanderait soit une base de test dédiée, soit d'extraire la logique
dans une fonction pure prenant en entrée une liste de réservations. Les tests
d'intégration de la section 9.2 les couvrent de bout en bout, ce qui répond au
besoin sans cette extraction.

Restent hors couverture automatisée : le rendu des composants Angular au-delà
de leur instanciation, le calcul des tarifs de services selon leur type, et
les écrans d'administration. Ils sont vérifiés manuellement, écran par écran.

---

## 10. Installation et exploitation

### 10.1 Prérequis

Node.js 18 ou supérieur, MySQL, npm.

### 10.2 Base de données

Créer la base `hotel_booking`, puis importer
`backend/database/hotel_booking_Bloc_2.sql`. Le fichier contient la structure,
les deux vues et un jeu de données complet.

### 10.3 Variables d'environnement

`backend/.env` :

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=hotel_booking
PORT=3000
JWT_SECRET=une_chaine_longue_et_aleatoire
JWT_EXPIRES_IN=7d
```

### 10.4 Lancement

```bash
cd backend
npm install
npm run dev        # nodemon, port 3000

cd frontend/hotel-app
npm install
npm start          # port 4300
```

`npm run dev` plutôt que `npm start` en développement : Node charge chaque
module une seule fois, et sans nodemon une modification du code serveur reste
sans effet tant que le processus n'est pas relancé. C'est une source d'erreur
de test classique.

### 10.5 Comptes de démonstration

| Rôle | Identifiant | Mot de passe |
| --- | --- | --- |
| Client | `client@test.com` | `client123` |
| Prestataire | `prestataire@bookhotel.com` | `provider123` |
| Administrateur | `admin@bookhotel.com` | `admin123` |

---

## 11. Limites connues et évolutions

Le périmètre livré couvre le parcours complet de réservation, l'administration
du catalogue, l'espace prestataire et l'exercice des droits sur les données
personnelles. Les points ci-dessous sont les limites du périmètre actuel, avec
la solution technique retenue pour chacun.

### 11.1 Acheminement du lien de réinitialisation

**État actuel.** Le mécanisme est complet côté base : jeton aléatoire unique,
expiration à deux heures, marquage du jeton après usage, invalidation des
jetons antérieurs. Le lien est écrit dans le journal du serveur et renvoyé dans
la réponse de l'API, où la page l'affiche.

**Choix.** Ne pas dépendre d'un service SMTP externe, ce qui aurait imposé des
identifiants de messagerie dans la configuration et rendu le parcours non
reproductible sur une machine sans accès réseau. Le lien est renvoyé au client
pour que la fonctionnalité reste démontrable une fois l'application déployée,
où le journal du serveur n'est plus sous les yeux. Avec un envoi réel, il
sortirait de cette réponse et seule la boîte du destinataire le recevrait.

**Évolution.** L'ajout de `nodemailer` et d'un transport SMTP configuré par
variables d'environnement. La logique métier étant déjà en place, seule la
fonction d'envoi est à écrire, au point où le lien est actuellement journalisé.

### 11.2 Périmètre du rôle prestataire

**État actuel.** Le rôle est implémenté : `requireProvider()` contrôle le rôle,
la table `hotel_prestataire` rattache un compte à ses établissements, et chaque
route du prestataire vérifie en base que l'hôtel concerné lui est confié. Un
prestataire consulte les réservations de ses seuls établissements et en change
le statut.

**Limite.** Il ne modifie pas la fiche de ses hôtels, ni leurs chambres, ni
leurs tarifs. Ces écrans restent réservés à l'administrateur.

**Choix.** Démontrer la séparation des droits sur le cas qui porte le métier,
la gestion des réservations, plutôt que de dupliquer l'administration du
catalogue avec un filtrage par établissement. Le mécanisme de contrôle est le
même dans les deux cas ; seul le nombre d'écrans concernés change.

**Évolution.** Réutiliser `requireProvider()` et le contrôle de périmètre sur
les routes de modification d'hôtel et de chambre, en remplaçant `requireAdmin`
par un contrôle combiné.

### 11.3 Deux relations non contraintes en base

**État actuel.** `reservation.id_statut` et `paiement.id_statut` ne portent pas
de clé étrangère vers `statut`. `hotel_amenities.id_hotel` ne porte pas de
contrainte d'unicité, alors que la relation est traitée comme un vers un dans
le code.

**Conséquence.** Le respect de ces deux règles repose sur l'application. Aucune
donnée incohérente n'existe dans le jeu livré, mais la base ne les interdirait
pas.

**Évolution.** Deux instructions `ALTER TABLE`, l'une ajoutant les clés
étrangères vers `statut`, l'autre une contrainte `UNIQUE` sur
`hotel_amenities(id_hotel)`. Les données actuelles les satisfont déjà, la
migration ne nécessiterait donc aucun nettoyage préalable.

### 11.4 Paiement simulé

**État actuel.** Aucune passerelle bancaire n'est branchée. La saisie de carte
est validée côté client par contrôle de format, vérification du préfixe et
algorithme de Luhn, puis la réservation passe au statut « Confirmée ».

**Choix.** Le cahier des charges porte sur le parcours de réservation et non
sur l'encaissement. Brancher une passerelle réelle aurait supposé un compte
marchand et le traitement de données bancaires, hors périmètre d'un projet de
certification.

**Évolution.** L'intégration d'un prestataire de paiement suit le même schéma
que la route `/pay` actuelle : création d'une intention de paiement côté
serveur, saisie de la carte dans un composant fourni par le prestataire, puis
confirmation serveur après relecture du montant et de la devise auprès de
celui-ci. La table `paiement` prévoit déjà les colonnes nécessaires,
`transaction_id`, `provider`, `reponse_provider` et `date_autorisation`.

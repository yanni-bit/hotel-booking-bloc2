# Book Your Travel - Application de réservation d'hôtel

Application web de réservation de chambres d'hôtel, développée dans le cadre du
Bloc 2 de la certification Développeur Web (RNCP).

La contrainte centrale de ce bloc est l'absence de framework côté serveur : le
back-end est écrit en Node.js natif, avec le module `http`, sans Express ni
aucune surcouche. L'objectif est de démontrer la maîtrise des mécanismes qu'un
framework masque habituellement : routage, parsing des requêtes, en-têtes CORS,
codes de statut HTTP.

---

## Stack technique

### Front-end

| Technologie   | Version                     |
| ------------- | --------------------------- |
| Angular       | 21 (composants standalone)  |
| TypeScript    | 5.9                         |
| Bootstrap     | 5.3                         |
| SCSS          | Préprocesseur CSS           |
| ngx-translate | 17, multilingue FR/EN/IT   |
| RxJS          | 7.8                         |

### Back-end

| Technologie  | Détail                                      |
| ------------ | ------------------------------------------- |
| Node.js      | Module `http` natif, sans framework         |
| Architecture | MVC, modèles en classes à méthodes statiques |
| jsonwebtoken | Authentification par JWT                    |
| bcrypt       | Hachage des mots de passe                   |
| mysql2       | Pilote MySQL, requêtes préparées            |
| dotenv       | Variables d'environnement                   |

### Base de données

| Élément        | Détail                                        |
| -------------- | --------------------------------------------- |
| MySQL          | Base `hotel_booking`, 21 tables et 2 vues      |
| Index FULLTEXT | `idx_search` sur la table `hotel`             |
| Vues SQL       | `v_chambres_offres`, `v_reservations_details` |

---

## Fonctionnalités

### Authentification

- Inscription, connexion, déconnexion
- Jetons JWT porteurs du rôle (administrateur, prestataire, client), validité par défaut 7 jours
- Réinitialisation de mot de passe par jeton à usage unique, valable deux heures
- Guards Angular : `authGuard`, `adminGuard`, `providerGuard`
- 54 routes protégées sur 80 : 14 demandent un jeton, 3 le rôle prestataire,
  37 le rôle administrateur. Les 26 routes publiques couvrent le catalogue
  (hôtels, chambres, destinations, recherche, services, disponibilités d'une
  chambre), l'envoi du formulaire de contact et les points d'entrée
  d'authentification.

### Réservations

- Parcours complet : recherche, sélection d'une offre, services, paiement
- Calendrier de sélection des dates, les nuits déjà réservées sont grisées
- Contrôle de disponibilité sur chevauchement de dates, réponse 409 en cas de conflit
- Services additionnels avec tarification selon leur type (journalier, par séjour,
  par personne, à l'unité)
- Validation du numéro de carte par l'algorithme de Luhn
- Paiement différé possible : la réservation reste au statut « En attente »
- Ajout, modification des dates et du nombre de voyageurs, annulation

### Espace client

- Profil modifiable
- Historique et détail des réservations
- Avis : création, modification, suppression
- Suppression du compte par anonymisation

### Interface d'administration

- Tableau de bord avec statistiques calculées en base
- CRUD hôtels, chambres, services
- Gestion des catégories de services et filtrage du catalogue par catégorie
- Rattachement d'un prestataire aux établissements dont il a la charge
- Gestion des réservations et de leurs statuts
- Gestion des utilisateurs et des rôles
- Suivi des messages de contact
- Modération des avis

### Espace prestataire

- Accès aux seules réservations des établissements qui lui sont confiés
- Changement de statut d'une réservation de son périmètre
- Le périmètre est vérifié en base à chaque appel, jamais déduit du client

### Protection des données

- Page `/privacy` : données collectées, finalités, bases légales, durées de
  conservation, destinataires et modalités d'exercice des droits
- Mention et lien sous les formulaires d'inscription et de contact
- Consultation et rectification depuis l'espace profil
- Suppression du compte par anonymisation : les données identifiantes sont
  effacées, les réservations et paiements sont conservés sans lien avec
  l'identité, au titre de l'obligation comptable

### Internationalisation

- Trois langues : français, anglais, italien
- Trois devises : EUR, USD, GBP

### Accessibilité

- Attributs ARIA, référence RGAA
- Police OpenDyslexic activable
- Lien d'évitement vers le contenu principal
- Rendu responsive du mobile au poste fixe

---

## Architecture du code

```
hotel-booking-bloc2/
├── backend/
│   ├── server.js            Création du serveur HTTP et aiguillage des routes
│   ├── config/
│   │   └── database.js      Connexion MySQL
│   ├── database/
│   │   └── hotel_booking_Bloc_2.sql   Création et peuplement de la base
│   ├── models/              Accès aux données, BaseModel et ses classes filles
│   ├── controllers/         Règles métier
│   ├── utils/auth.js        Contrôle d'accès : requireAuth, requireAdmin, requireProvider
│   ├── routes/              Points d'entrée de l'API REST
│   └── tests/               Tests unitaires et tests d'intégration
│
└── frontend/hotel-app/
    └── src/app/
        ├── components/      Composants Angular
        ├── services/        Appels HTTP et état applicatif
        ├── pipes/           Transformations d'affichage
        ├── guards/          Protection des routes
        └── interceptors/    Ajout du jeton aux requêtes sortantes
```

### Points d'entrée de l'API

| Préfixe              | Domaine                        |
| -------------------- | ------------------------------ |
| `/api/auth/*`        | Authentification, utilisateurs |
| `/api/hotels/*`      | Hôtels, recherche, destinations |
| `/api/chambres/*`    | Chambres                       |
| `/api/offres/*`      | Offres tarifaires              |
| `/api/reservations/*`| Réservations                    |
| `/api/services/*`    | Services additionnels           |
| `/api/contact/*`     | Messages de contact             |
| `/api/avis/*`        | Avis clients                    |
| `/api/health`        | État du serveur                 |

---

## Installation

### Prérequis

- Node.js 18 ou supérieur
- MySQL 8 ou supérieur
- Angular CLI 21

### Base de données

Le script fourni crée la base, les tables, les vues et un jeu de données de
démonstration. Il désactive temporairement les contraintes de clés étrangères
pour permettre un import en une seule passe.

En ligne de commande :

```bash
mysql -u root -p < backend/database/hotel_booking_Bloc_2.sql
```

Par phpMyAdmin : importer le fichier tel quel, sans créer la base au préalable
(le script contient `CREATE DATABASE IF NOT EXISTS hotel_booking`).

### Back-end

Créer un fichier `backend/.env` :

```
PORT=3000
HOST=localhost
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=hotel_booking
JWT_SECRET=une_chaine_longue_et_aleatoire
JWT_EXPIRES_IN=7d
```

Puis :

```bash
cd backend
npm install
npm start
```

L'API écoute sur http://localhost:3000. La route `/api/health` permet de
vérifier que la connexion à la base est établie.

### Front-end

```bash
cd frontend/hotel-app
npm install
npm start
```

L'application est servie sur http://localhost:4300. Ce port est fixé dans
`angular.json` : ce n'est pas le port 4200 par défaut d'Angular.

### Comptes de démonstration

Le jeu de données importé contient un compte par rôle :

| Rôle          | Identifiant                   | Mot de passe  |
| ------------- | ----------------------------- | ------------- |
| Administrateur | `admin@bookhotel.com`        | `admin123`    |
| Prestataire   | `prestataire@bookhotel.com`   | `provider123` |
| Client        | `client@test.com`             | `client123`   |

Le compte client dispose d'un historique de réservations aux différents statuts,
ce qui permet d'observer les parcours de modification et d'annulation sans avoir
à créer de données au préalable.

Ces identifiants ne valent que pour l'environnement de développement local
décrit ici. L'application n'étant pas déployée, ils ne donnent accès à aucune
donnée réelle.

---

## Choix techniques assumés

Trois écarts par rapport à une application de production méritent d'être
signalés explicitement, car ils découlent des contraintes de l'exercice.

**Pas de middleware global.** Sans Express, il n'existe pas de chaîne de
middlewares : rien ne s'exécute automatiquement avant un gestionnaire de route. Le
contrôle d'accès est donc appelé explicitement. `backend/utils/auth.js` expose
`requireAuth(req, res)`, `requireAdmin(req, res)` et `requireProvider(req, res)`,
qui lisent l'en-tête
`Authorization`, extraient le jeton, appellent `User.verifyToken()` et répondent
401 ou 403 en cas d'échec. Chaque gestionnaire protégé commence par :

```js
const auth = requireAuth(req, res);
if (!auth) return;
```

Le retour `null` signifie que la réponse d'erreur est déjà envoyée. Le fichier
`authRoutes.js` fait exception : ses treize routes protégées appellent
`User.verifyToken()` directement, sans passer par ce module.

Conséquence de ce choix : l'identité de l'utilisateur ne vient jamais du client. Un
`id_user` transmis dans le corps d'une requête est écrasé par celui du jeton signé.

**Envoi d'email simulé.** Le mécanisme de réinitialisation de mot de passe est
complet en base : jeton aléatoire, expiration à deux heures, marquage du jeton
comme consommé après usage. L'envoi d'email n'est pas implémenté. Le lien est
écrit dans le journal du serveur et renvoyé dans la réponse de l'API, où la
page l'affiche, ce qui garde la fonctionnalité testable sans dépendre d'un
service SMTP. Avec un envoi réel, le lien sortirait de cette réponse et seule
la boîte du destinataire le recevrait.

**Héritage partiel entre modèles.** `BaseModel` porte le CRUD générique
(`getAll`, `getById`, `create`, `update`, `delete`), construit à partir de trois
propriétés statiques que chaque classe fille déclare : `table`, `clePrimaire` et
`champs`. Dans une méthode statique, `this` désigne la classe appelante, ce qui
permet d'écrire la requête une seule fois. `CategorieService`, `Service` et
`Contact` en héritent. Les autres modèles ne l'utilisent pas encore : leurs
requêtes sont toutes spécifiques, l'héritage leur apporterait peu.

Une méthode n'est redéfinie que lorsque son comportement diffère réellement.
`Service.getById` joint la table des catégories, que la requête générique ne
sait pas produire. `CategorieService.delete` appelle `super.delete` puis
traduit le code d'erreur MySQL `ER_ROW_IS_REFERENCED_2` en message métier.
`Contact.getById` appelle `super.getById` et traduit l'absence de résultat en
erreur, pour que la route réponde 404 sans être modifiée.

**Couche contrôleur incomplète.** Trois domaines sur sept disposent d'un
contrôleur dédié : `avisController`, `hotelController` et `chambreController`.
Les quatre autres fichiers de routes appellent les modèles directement. C'est
une conséquence de l'ordre de développement, pas un choix d'architecture. Une
harmonisation consisterait à extraire un contrôleur par domaine restant.

**Anonymisation plutôt que suppression.** Les contraintes `reservation_ibfk_2`
et `paiement_ibfk_2` sont en `ON DELETE RESTRICT` : la base refuse de supprimer
un compte dès qu'il a réservé, parce que ces écritures portent une obligation
de conservation comptable. La suppression demandée par l'utilisateur efface
donc les données identifiantes, détache les avis publiés et supprime adresse,
favoris et demandes de réinitialisation, en laissant les écritures qui ne
désignent plus personne.

**Requêtes préparées sans ORM.** Toutes les requêtes passent par `mysql2` avec
des paramètres liés, jamais par concaténation de chaînes. Deux vues SQL
regroupent les jointures les plus fréquentes afin de limiter la duplication de
requêtes complexes dans le code.

---

## Tests

```bash
cd backend
npm test                            # tout le dossier tests/
node --test tests/integration.test.js   # seulement l'intégration
```

**Tests unitaires**, 21 cas dans `tests/auth.test.js` et `tests/user.test.js` :
génération et vérification des jetons, expiration, jeton falsifié, contrôle
d'accès par rôle, hachage et comparaison des mots de passe.

**Tests d'intégration**, 12 cas dans `tests/integration.test.js` : ils appellent
la véritable API sur le serveur lancé, et parcourent la chaîne complète, du
routage jusqu'à la base. Inscription, connexion, refus à 401 sans jeton,
création d'une réservation, vérification en base que l'identité enregistrée est
celle du jeton, présence dans la liste du client, 409 sur chevauchement de
dates, acceptation d'une arrivée le jour du départ précédent, 403 sur deux
routes d'administration, paiement et refus d'un second paiement.

Le serveur doit tourner avant de lancer les tests d'intégration. Le compte et
les réservations créés sont supprimés en fin d'exécution : la base revient dans
son état initial.

---

## Licence

Projet réalisé dans un cadre pédagogique, certification Développeur Web.

*Dernière mise à jour : septembre 2026*
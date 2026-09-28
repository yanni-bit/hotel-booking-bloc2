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
| MySQL          | Base `hotel_booking`, 19 tables et 2 vues      |
| Index FULLTEXT | `idx_search` sur la table `hotel`             |
| Vues SQL       | `v_chambres_offres`, `v_reservations_details` |

---

## Fonctionnalités

### Authentification

- Inscription, connexion, déconnexion
- Jetons JWT porteurs du rôle (administrateur, client), validité par défaut 7 jours
- Réinitialisation de mot de passe par jeton à usage unique, valable deux heures
- Guards Angular : `authGuard`, `adminGuard`

### Réservations

- Parcours complet : recherche, sélection d'une offre, services, paiement
- Contrôle de disponibilité sur chevauchement de dates
- Services additionnels avec tarification selon leur type (journalier, par séjour,
  par personne, à l'unité)
- Validation du numéro de carte par l'algorithme de Luhn
- Paiement différé possible : la réservation reste au statut « En attente »
- Ajout, modification des dates et du nombre de voyageurs, annulation

### Espace client

- Profil modifiable
- Historique et détail des réservations
- Avis : création, modification, suppression

### Interface d'administration

- Tableau de bord avec statistiques calculées en base
- CRUD hôtels, chambres, services
- Gestion des réservations et de leurs statuts
- Gestion des utilisateurs et des rôles
- Suivi des messages de contact
- Modération des avis

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
│   ├── models/              Accès aux données (User, Hotel, Reservation, ...)
│   ├── controllers/         Règles métier
│   └── routes/              Points d'entrée de l'API REST
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

Le jeu de données importé contient deux comptes, un par rôle :

| Rôle          | Identifiant           | Mot de passe |
| ------------- | --------------------- | ------------ |
| Administrateur | `admin@bookhotel.com` | `admin123`   |
| Client        | `client@test.com`     | `client123`  |

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
middlewares. Chaque gestionnaire de route qui nécessite une authentification lit
lui-même l'en-tête `Authorization`, en extrait le jeton et appelle
`User.verifyToken()`. La vérification est donc explicite et répétée, là où un
framework l'aurait centralisée.

**Transmission manuelle du lien de réinitialisation.** Le mécanisme de
réinitialisation de mot de passe est complet en base : jeton aléatoire,
expiration à deux heures, marquage du jeton comme consommé après usage. En
revanche l'envoi d'email n'est pas implémenté ; le lien est affiché dans la
console du serveur, ce qui suffit en développement et évite de dépendre d'un
service SMTP externe.

**Requêtes préparées sans ORM.** Toutes les requêtes passent par `mysql2` avec
des paramètres liés, jamais par concaténation de chaînes. Deux vues SQL
regroupent les jointures les plus fréquentes afin de limiter la duplication de
requêtes complexes dans le code.

---

## Licence

Projet réalisé dans un cadre pédagogique, certification Développeur Web.

*Dernière mise à jour : septembre 2026*
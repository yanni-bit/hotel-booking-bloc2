# Schéma physique du modèle de données

**Book Your Travel**, base `hotel_booking`, MySQL.
Bloc 2 de la certification Développeur Web.

Ce document décrit la base telle qu'elle existe, à la différence du modèle
conceptuel qui décrit ce qu'elle représente. Il est produit à partir du fichier
`backend/database/hotel_booking_Bloc_2.sql`, et le diagramme
`schema-physique.png` en donne la vue d'ensemble.

## Vue d'ensemble

| | |
|---|---|
| Tables | 21 |
| Vues | 2 |
| Colonnes | 204 |
| Clés étrangères | 27 |
| Contraintes d'unicité | 10 |
| Index | 47 |
| Moteur | InnoDB |
| Interclassement | utf8mb4_unicode_ci |

Le moteur InnoDB est imposé par l'usage de clés étrangères : MyISAM ne les
applique pas. L'interclassement `utf8mb4_unicode_ci` accepte l'ensemble des
caractères Unicode, émojis compris, et compare sans tenir compte de la casse
ni des accents, ce qui convient à une recherche sur des noms d'hôtels et de
villes saisis dans plusieurs langues.

**Trois tables ne déclarent ni moteur ni interclassement.** `hotel`, `reservation`, `avis` sont créées par un `) ;` sec, là où les seize autres
précisent `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`.
Elles héritent donc des valeurs par défaut du serveur. Sur MySQL 8 ces
valeurs sont précisément InnoDB et utf8mb4, et leurs clés étrangères le
confirment puisque seul InnoDB les applique : la base est cohérente en
pratique. Mais rien dans le script ne le garantit sur un serveur configuré
autrement, où ces trois tables pourraient naître en MyISAM et perdre
silencieusement leurs contraintes. Le correctif tient en une clause ajoutée
à trois instructions `CREATE TABLE`.

---

## Domaine Utilisateurs

### `role`

| Colonne | Type | Null | Défaut | Clé | Remarque |
|---|---|---|---|---|---|
| `id_role` | `int` | NON |  | PK |  |
| `code_role` | `varchar(20)` | NON |  | UK |  |
| `nom_role` | `varchar(50)` | NON |  |  |  |
| `created_at` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  |  |

Contraintes d'unicité : `code_role` sur (code_role)

### `adresse_user`

| Colonne | Type | Null | Défaut | Clé | Remarque |
|---|---|---|---|---|---|
| `id_adress_user` | `int` | NON |  | PK |  |
| `rue_user` | `varchar(255)` | oui |  |  |  |
| `complement_user` | `varchar(255)` | oui |  |  |  |
| `code_postal_user` | `varchar(10)` | oui |  |  |  |
| `ville_user` | `varchar(100)` | oui |  |  |  |
| `pays_user` | `varchar(100)` | oui |  |  |  |
| `created_at` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  |  |

### `utilisateur`

| Colonne | Type | Null | Défaut | Clé | Remarque |
|---|---|---|---|---|---|
| `id_user` | `int` | NON |  | PK |  |
| `nom_user` | `varchar(100)` | NON |  |  |  |
| `prenom_user` | `varchar(100)` | NON |  |  |  |
| `email_user` | `varchar(255)` | NON |  | UK |  |
| `mot_de_passe` | `varchar(255)` | NON |  |  |  |
| `tel_user` | `varchar(20)` | oui |  |  |  |
| `date_inscription` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  |  |
| `updated_at` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  | ON UPDATE CURRENT_TIMESTAMP |
| `id_role` | `int` | NON |  | FK | vers `role.id_role` |
| `actif` | `tinyint(1)` | oui | `1` |  |  |
| `email_verifie` | `tinyint(1)` | oui | `0` |  |  |
| `derniere_connexion` | `timestamp` | oui |  |  |  |
| `id_adress_user` | `int` | oui |  | FK | vers `adresse_user.id_adress_user` |

Contraintes d'unicité : `email_user` sur (email_user)

Index : `idx_email` sur (email_user), `idx_role` sur (id_role), `fk_user_address` sur (id_adress_user)

### `password_reset`

| Colonne | Type | Null | Défaut | Clé | Remarque |
|---|---|---|---|---|---|
| `id_reset` | `int` | NON |  | PK |  |
| `id_user` | `int` | NON |  | FK | vers `utilisateur.id_user` |
| `token` | `varchar(255)` | NON |  | UK |  |
| `expires_at` | `datetime` | NON |  |  |  |
| `used` | `tinyint(1)` | oui | `0` |  |  |
| `created_at` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  |  |

Contraintes d'unicité : `token` sur (token)

Index : `id_user` sur (id_user), `idx_password_reset_token` sur (token)

---

## Domaine Catalogue

### `hotel`

| Colonne | Type | Null | Défaut | Clé | Remarque |
|---|---|---|---|---|---|
| `id_hotel` | `int` | NON |  | PK |  |
| `hotel_id_api` | `varchar(100)` | oui |  | UK | ID Booking.com |
| `nom_hotel` | `varchar(255)` | NON |  |  |  |
| `description_hotel` | `text` | oui |  |  |  |
| `rue_hotel` | `varchar(255)` | oui |  |  |  |
| `code_postal_hotel` | `varchar(10)` | oui |  |  |  |
| `ville_hotel` | `varchar(100)` | NON |  |  |  |
| `pays_hotel` | `varchar(100)` | NON |  |  |  |
| `tel_hotel` | `varchar(20)` | oui |  |  |  |
| `email_hotel` | `varchar(255)` | oui |  |  |  |
| `site_web_hotel` | `varchar(255)` | oui |  |  |  |
| `img_hotel` | `varchar(500)` | oui |  |  | Image principale/cover |
| `nbre_etoile_hotel` | `tinyint` | oui |  |  |  |
| `note_moy_hotel` | `decimal(3,1)` | oui |  |  |  |
| `nbre_avis_hotel` | `int` | oui | `0` |  |  |
| `latitude` | `decimal(10,8)` | oui |  |  |  |
| `longitude` | `decimal(11,8)` | oui |  |  |  |
| `date_scraping` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  |  |
| `created_at` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  |  |

Contraintes d'unicité : `hotel_id_api` sur (hotel_id_api)

Index : `idx_ville` sur (ville_hotel), `idx_note` sur (note_moy_hotel), `idx_etoiles` sur (nbre_etoile_hotel), `idx_hotel_ville_note` sur (ville_hotel, note_moy_hotel), `idx_nom_hotel` sur (nom_hotel), `idx_ville_hotel` sur (ville_hotel), `idx_pays_hotel` sur (pays_hotel)

### `hotel_amenities`

| Colonne | Type | Null | Défaut | Clé | Remarque |
|---|---|---|---|---|---|
| `id_room_amenities` | `int` | NON |  | PK |  |
| `id_hotel` | `int` | NON |  | FK | vers `hotel.id_hotel` |
| `parking` | `tinyint(1)` | oui | `0` |  |  |
| `restaurant` | `tinyint(1)` | oui | `0` |  |  |
| `climatisation` | `tinyint(1)` | oui | `0` |  |  |
| `non_fumeur` | `tinyint(1)` | oui | `0` |  |  |
| `pet_allowed` | `tinyint(1)` | oui | `0` |  |  |
| `wi_fi` | `tinyint(1)` | oui | `0` |  |  |
| `television` | `tinyint(1)` | oui | `0` |  |  |
| `mini_bar` | `tinyint(1)` | oui | `0` |  |  |
| `coffre_fort` | `tinyint(1)` | oui | `0` |  |  |
| `piscine` | `tinyint(1)` | oui | `0` |  |  |
| `spa` | `tinyint(1)` | oui | `0` |  |  |
| `salle_sport` | `tinyint(1)` | oui | `0` |  |  |

Index : `idx_hotel` sur (id_hotel)

### `img_hotel`

| Colonne | Type | Null | Défaut | Clé | Remarque |
|---|---|---|---|---|---|
| `id_img_hotel` | `int` | NON |  | PK |  |
| `id_hotel` | `int` | NON |  | FK | vers `hotel.id_hotel` |
| `url_img` | `varchar(500)` | NON |  |  |  |
| `categorie_img` | `enum('facade','hall','restaurant','piscine','spa','bar','petit_dejeuner','exterieur','salle_conference','autre')` | oui | `autre` |  |  |
| `ordre_affichage` | `int` | oui | `0` |  |  |
| `created_at` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  |  |

Index : `idx_hotel` sur (id_hotel), `idx_ordre` sur (ordre_affichage)

### `chambre`

| Colonne | Type | Null | Défaut | Clé | Remarque |
|---|---|---|---|---|---|
| `id_chambre` | `int` | NON |  | PK |  |
| `room_id_api` | `varchar(100)` | oui |  |  | ID Booking.com |
| `id_hotel` | `int` | NON |  | FK | vers `hotel.id_hotel` |
| `type_room` | `varchar(100)` | NON |  |  | Standard, Deluxe, Suite, etc. |
| `cat_room` | `varchar(50)` | oui |  |  | Catégorie |
| `type_lit` | `varchar(100)` | oui |  |  | 1 lit double, 2 lits simples, etc. |
| `nbre_lit` | `tinyint` | oui |  |  |  |
| `nbre_adults_max` | `int` | NON |  |  |  |
| `nbre_children_max` | `int` | oui | `0` |  |  |
| `surface_m2` | `int` | oui |  |  |  |
| `vue` | `varchar(100)` | oui |  |  | Mer, ville, jardin, montagne |
| `description_room` | `text` | oui |  |  |  |
| `created_at` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  |  |

Index : `idx_hotel` sur (id_hotel), `idx_type` sur (type_room), `idx_capacite` sur (nbre_adults_max)

### `img_chambre`

| Colonne | Type | Null | Défaut | Clé | Remarque |
|---|---|---|---|---|---|
| `id_img_chambre` | `int` | NON |  | PK |  |
| `id_chambre` | `int` | NON |  | FK | vers `chambre.id_chambre` |
| `url_img` | `varchar(500)` | NON |  |  |  |
| `cat_img` | `enum('generale','salle_bain','vue','lit','autre')` | oui | `generale` |  |  |
| `ordre_affichage` | `int` | oui | `0` |  |  |
| `created_at` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  |  |

Index : `idx_chambre` sur (id_chambre), `idx_ordre` sur (ordre_affichage)

### `offre`

| Colonne | Type | Null | Défaut | Clé | Remarque |
|---|---|---|---|---|---|
| `id_offre` | `int` | NON |  | PK |  |
| `offre_id_api` | `varchar(100)` | oui |  |  | ID offre Booking.com |
| `id_hotel` | `int` | NON |  | FK | vers `hotel.id_hotel` |
| `id_chambre` | `int` | NON |  | FK | vers `chambre.id_chambre` |
| `nom_offre` | `varchar(100)` | NON |  |  | Ex: Flexible, Non remboursable, Petit-déjeuner inclus |
| `prix_nuit` | `decimal(10,2)` | NON |  |  |  |
| `devise` | `varchar(3)` | oui | `EUR` |  |  |
| `conditions_annulation` | `text` | oui |  |  | Conditions détaillées |
| `delai_annulation_gratuite` | `int` | oui |  |  | Nombre de jours avant check-in |
| `frais_annulation` | `decimal(10,2)` | oui | `0.00` |  |  |
| `remboursable` | `tinyint(1)` | oui | `1` |  |  |
| `petit_dejeuner_inclus` | `tinyint(1)` | oui | `0` |  |  |
| `pension` | `enum('none','breakfast','half_board','full_board','all_inclusive')` | oui | `none` |  |  |
| `description_offre` | `text` | oui |  |  |  |
| `date_scraping` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  |  |
| `created_at` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  |  |

Index : `idx_hotel` sur (id_hotel), `idx_chambre` sur (id_chambre), `idx_prix` sur (prix_nuit), `idx_offre_prix` sur (id_chambre, prix_nuit)

### `categorie_service`

Table ajoutée pour répondre au point « gérer les catégories de services » du
cahier des charges. Elle est distincte de `type_service`, qui porte le mode de
tarification et non la nature du service.

| Colonne | Type | Null | Défaut | Clé | Remarque |
|---|---|---|---|---|---|
| `id_categorie` | `int` | NON |  | PK |  |
| `code_categorie` | `varchar(30)` | NON |  | UK | identifiant technique, sans accent ni espace |
| `nom_categorie` | `varchar(60)` | NON |  |  | libellé affiché |
| `ordre_affichage` | `int` | NON | `0` |  | ordre de présentation dans les listes |
| `actif` | `tinyint(1)` | NON | `1` |  |  |
| `created_at` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  |  |

Contraintes d'unicité : `uk_code_categorie` sur (code_categorie)

Le code sert de référence stable : un libellé peut être renommé sans casser
les rattachements, le code non. Il n'est d'ailleurs pas modifiable après
création.

### `services_additionnels`

| Colonne | Type | Null | Défaut | Clé | Remarque |
|---|---|---|---|---|---|
| `id_service` | `int` | NON |  | PK |  |
| `nom_service` | `varchar(100)` | NON |  |  |  |
| `description_service` | `text` | oui |  |  |  |
| `type_service` | `enum('journalier','sejour','unitaire','par_personne')` | oui | `sejour` |  | mode de tarification |
| `id_categorie` | `int` | oui |  | FK | vers `categorie_service.id_categorie` |
| `icone_service` | `varchar(50)` | oui |  |  |  |
| `actif` | `tinyint(1)` | oui | `1` |  |  |
| `created_at` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  |  |

### `hotel_services`

| Colonne | Type | Null | Défaut | Clé | Remarque |
|---|---|---|---|---|---|
| `id_hotel_service` | `int` | NON |  | PK |  |
| `id_hotel` | `int` | NON |  | FK UK | vers `hotel.id_hotel` |
| `id_service` | `int` | NON |  | FK UK | vers `services_additionnels.id_service` |
| `prix_service` | `decimal(10,2)` | NON |  |  |  |
| `disponible` | `tinyint(1)` | oui | `1` |  |  |
| `created_at` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  |  |

Contraintes d'unicité : `unique_hotel_service` sur (id_hotel, id_service)

Index : `id_service` sur (id_service)

### `hotel_prestataire`

Table ajoutée avec le rôle prestataire. Elle rattache un compte aux
établissements dont il a la charge. Une table de liaison plutôt qu'une colonne
dans `utilisateur` : un prestataire peut gérer plusieurs hôtels, et un hôtel
peut être confié à plusieurs comptes.

| Colonne | Type | Null | Défaut | Clé | Remarque |
|---|---|---|---|---|---|
| `id_hotel_prestataire` | `int` | NON |  | PK |  |
| `id_user` | `int` | NON |  | FK UK | vers `utilisateur.id_user` |
| `id_hotel` | `int` | NON |  | FK UK | vers `hotel.id_hotel` |
| `created_at` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  |  |

Contraintes d'unicité : `uk_prestataire_hotel` sur (id_user, id_hotel)

Index : `idx_prestataire_hotel` sur (id_hotel)

La clé unique empêche le doublon de rattachement. Les deux clés étrangères
sont en CASCADE : le rattachement n'a aucune existence propre, il disparaît
avec le compte ou avec l'établissement.

---

## Domaine Réservation

### `statut`

| Colonne | Type | Null | Défaut | Clé | Remarque |
|---|---|---|---|---|---|
| `id_statut` | `int` | NON |  | PK |  |
| `nom_statut` | `varchar(50)` | NON |  | UK |  |
| `description_statut` | `text` | oui |  |  |  |
| `couleur` | `varchar(20)` | oui | `gray` |  |  |
| `created_at` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  |  |

Contraintes d'unicité : `nom_statut` sur (nom_statut)

### `paiement`

| Colonne | Type | Null | Défaut | Clé | Remarque |
|---|---|---|---|---|---|
| `id_paiement` | `int` | NON |  | PK |  |
| `id_offre` | `int` | oui |  | FK | vers `offre.id_offre` |
| `id_user` | `int` | NON |  | FK | vers `utilisateur.id_user` |
| `total_price` | `decimal(10,2)` | NON |  |  |  |
| `devise` | `varchar(3)` | oui | `EUR` |  |  |
| `paiement_methode` | `enum('carte_credit','paypal','virement','sur_place')` | NON |  |  |  |
| `transaction_id` | `varchar(100)` | oui |  |  |  |
| `reference_methode` | `varchar(100)` | oui |  |  | Derniers chiffres carte, email PayPal, etc. |
| `id_statut` | `int` | oui |  |  |  |
| `date_paiement` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  |  |
| `date_autorisation` | `timestamp` | oui |  |  |  |
| `error_message` | `text` | oui |  |  |  |
| `provider` | `varchar(50)` | oui |  |  | Stripe, PayPal, etc. |
| `reponse_provider` | `text` | oui |  |  | Réponse complète du provider |

Index : `id_offre` sur (id_offre), `idx_user` sur (id_user), `idx_transaction` sur (transaction_id), `idx_statut` sur (id_statut)

### `reservation`

| Colonne | Type | Null | Défaut | Clé | Remarque |
|---|---|---|---|---|---|
| `id_reservation` | `int` | NON |  | PK |  |
| `booking_id_api` | `varchar(100)` | oui |  | UK | Référence Booking.com |
| `id_offre` | `int` | NON |  | FK | vers `offre.id_offre` |
| `id_user` | `int` | NON |  | FK | vers `utilisateur.id_user` |
| `id_hotel` | `int` | NON |  | FK | vers `hotel.id_hotel` |
| `id_chambre` | `int` | NON |  | FK | vers `chambre.id_chambre` |
| `id_paiement` | `int` | oui |  | FK | vers `paiement.id_paiement` |
| `check_in` | `date` | NON |  |  |  |
| `check_out` | `date` | NON |  |  |  |
| `nbre_nuits` | `int` | NON |  |  |  |
| `nbre_adults` | `int` | NON |  |  |  |
| `nbre_children` | `int` | oui | `0` |  |  |
| `ages_children` | `varchar(50)` | oui |  |  | Ex: 5,8,12 ou JSON |
| `prix_nuit` | `decimal(10,2)` | NON |  |  | Prix au moment de la réservation |
| `total_price` | `decimal(10,2)` | NON |  |  |  |
| `devise` | `varchar(3)` | oui | `EUR` |  |  |
| `special_requests` | `text` | oui |  |  |  |
| `num_confirmation` | `varchar(50)` | oui |  |  |  |
| `provider_reference` | `varchar(100)` | oui |  |  |  |
| `cancel_deadline` | `datetime` | oui |  |  | Date limite annulation gratuite |
| `id_statut` | `int` | oui |  |  | Statut de la réservation |
| `price` | `decimal(10,2)` | oui |  |  |  |
| `taxes` | `decimal(10,2)` | oui |  |  |  |
| `date_reservation` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  |  |
| `date_modification` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  | ON UPDATE CURRENT_TIMESTAMP |

Contraintes d'unicité : `booking_id_api` sur (booking_id_api)

Index : `id_offre` sur (id_offre), `id_chambre` sur (id_chambre), `idx_user` sur (id_user), `idx_hotel` sur (id_hotel), `idx_dates` sur (check_in, check_out), `idx_statut` sur (id_statut), `fk_reservation_paiement` sur (id_paiement), `idx_reservation_dates` sur (id_hotel, check_in, check_out)

### `reservation_services`

| Colonne | Type | Null | Défaut | Clé | Remarque |
|---|---|---|---|---|---|
| `id_reservation_service` | `int` | NON |  | PK |  |
| `id_reservation` | `int` | NON |  | FK | vers `reservation.id_reservation` |
| `id_hotel_service` | `int` | NON |  | FK | vers `hotel_services.id_hotel_service` |
| `quantite` | `int` | oui | `1` |  |  |
| `prix_unitaire` | `decimal(10,2)` | NON |  |  |  |
| `sous_total` | `decimal(10,2)` | NON |  |  |  |
| `created_at` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  |  |

Index : `id_reservation` sur (id_reservation), `id_hotel_service` sur (id_hotel_service)

---

## Domaine Interactions

### `avis`

| Colonne | Type | Null | Défaut | Clé | Remarque |
|---|---|---|---|---|---|
| `id_avis` | `int` | NON |  | PK |  |
| `id_hotel` | `int` | NON |  | FK | vers `hotel.id_hotel` |
| `id_user` | `int` | oui |  | FK | vers `utilisateur.id_user` |
| `pseudo_user` | `varchar(100)` | NON |  |  | Nom depuis Booking.com |
| `note` | `decimal(3,1)` | NON |  |  |  |
| `titre_avis` | `varchar(255)` | oui |  |  |  |
| `commentaire` | `text` | oui |  |  |  |
| `date_avis` | `date` | oui |  |  |  |
| `pays_origine` | `varchar(3)` | oui |  |  | Code pays FR, UK, DE, etc. |
| `type_voyageur` | `enum('couple','famille','solo','business','groupe','autre')` | oui | `autre` |  |  |
| `langue` | `varchar(2)` | oui | `fr` |  |  |
| `date_scraping` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  |  |

Index : `idx_hotel` sur (id_hotel), `idx_note` sur (note), `idx_date` sur (date_avis), `avis_ibfk_2` sur (id_user)

### `favori`

| Colonne | Type | Null | Défaut | Clé | Remarque |
|---|---|---|---|---|---|
| `id_favori` | `int` | NON |  | PK |  |
| `id_user` | `int` | NON |  | FK UK | vers `utilisateur.id_user` |
| `id_hotel` | `int` | NON |  | FK UK | vers `hotel.id_hotel` |
| `date_ajout` | `timestamp` | oui | `CURRENT_TIMESTAMP` |  |  |

Contraintes d'unicité : `unique_favori` sur (id_user, id_hotel)

Index : `id_hotel` sur (id_hotel), `idx_user` sur (id_user)

### `messages_contact`

| Colonne | Type | Null | Défaut | Clé | Remarque |
|---|---|---|---|---|---|
| `id_message` | `int` | NON |  | PK |  |
| `nom` | `varchar(100)` | NON |  |  |  |
| `email` | `varchar(150)` | NON |  |  |  |
| `telephone` | `varchar(20)` | oui |  |  |  |
| `sujet` | `enum('reservation','information','reclamation','autre')` | NON |  |  |  |
| `message` | `text` | NON |  |  |  |
| `date_envoi` | `datetime` | oui | `CURRENT_TIMESTAMP` |  |  |
| `lu` | `tinyint(1)` | oui | `0` |  | 0 = non lu, 1 = lu |
| `traite` | `tinyint(1)` | oui | `0` |  | 0 = non traité, 1 = traité |

---

## Intégrité référentielle

Les 27 contraintes de clé étrangère, avec leur comportement à la suppression
de la ligne référencée.

| Table | Colonne | Référence | À la suppression |
|---|---|---|---|
| `utilisateur` | `id_adress_user` | `adresse_user.id_adress_user` | SET NULL |
| `utilisateur` | `id_role` | `role.id_role` | RESTRICT |
| `password_reset` | `id_user` | `utilisateur.id_user` | CASCADE |
| `hotel_prestataire` | `id_user` | `utilisateur.id_user` | CASCADE |
| `hotel_prestataire` | `id_hotel` | `hotel.id_hotel` | CASCADE |
| `services_additionnels` | `id_categorie` | `categorie_service.id_categorie` | RESTRICT |
| `hotel_amenities` | `id_hotel` | `hotel.id_hotel` | CASCADE |
| `img_hotel` | `id_hotel` | `hotel.id_hotel` | CASCADE |
| `chambre` | `id_hotel` | `hotel.id_hotel` | CASCADE |
| `img_chambre` | `id_chambre` | `chambre.id_chambre` | CASCADE |
| `offre` | `id_hotel` | `hotel.id_hotel` | CASCADE |
| `offre` | `id_chambre` | `chambre.id_chambre` | CASCADE |
| `hotel_services` | `id_hotel` | `hotel.id_hotel` | RESTRICT (défaut) |
| `hotel_services` | `id_service` | `services_additionnels.id_service` | RESTRICT (défaut) |
| `paiement` | `id_offre` | `offre.id_offre` | SET NULL |
| `paiement` | `id_user` | `utilisateur.id_user` | RESTRICT |
| `reservation` | `id_paiement` | `paiement.id_paiement` | SET NULL |
| `reservation` | `id_offre` | `offre.id_offre` | RESTRICT |
| `reservation` | `id_user` | `utilisateur.id_user` | RESTRICT |
| `reservation` | `id_hotel` | `hotel.id_hotel` | RESTRICT |
| `reservation` | `id_chambre` | `chambre.id_chambre` | RESTRICT |
| `reservation_services` | `id_reservation` | `reservation.id_reservation` | CASCADE |
| `reservation_services` | `id_hotel_service` | `hotel_services.id_hotel_service` | RESTRICT (défaut) |
| `avis` | `id_hotel` | `hotel.id_hotel` | CASCADE |
| `avis` | `id_user` | `utilisateur.id_user` | SET NULL |
| `favori` | `id_user` | `utilisateur.id_user` | CASCADE |
| `favori` | `id_hotel` | `hotel.id_hotel` | CASCADE |

Trois comportements coexistent, et le choix n'est pas arbitraire.

**CASCADE** s'applique à ce qui n'a pas d'existence propre. Supprimer un hôtel
supprime ses chambres, ses images, ses équipements, ses offres et ses avis :
aucun de ces enregistrements n'a de sens sans lui.

**RESTRICT** protège les pièces commerciales. Une réservation ne peut pas
perdre son client, son hôtel, sa chambre ni son offre, donc la suppression de
l'un d'eux est refusée tant qu'une réservation y renvoie.

**SET NULL** s'applique aux liens facultatifs. Supprimer une adresse laisse le
compte en place sans adresse ; supprimer un compte laisse ses avis en place,
affichés sous le pseudonyme conservé dans `avis.pseudo_user`.

## Relations sans contrainte en base

Deux liens existent dans le code mais ne sont pas déclarés en base.

`reservation.id_statut` et `paiement.id_statut` désignent une ligne de `statut`
sans clé étrangère. Rien n'empêche donc d'y écrire un identifiant inexistant :
la cohérence repose sur l'application. Sur le diagramme conceptuel, ces deux
liens sont tracés en pointillé.

`hotel_amenities.id_hotel` ne porte aucune contrainte d'unicité, alors que le
code ne crée qu'une ligne d'équipements par hôtel. La relation est donc de un
vers plusieurs en base, et de un vers un dans les faits.

## Les deux vues

`v_chambres_offres` joint `hotel`, `chambre` et `offre` et expose le nom de
l'établissement, sa ville, sa note, le type de chambre, la capacité, le nom de
l'offre, le prix à la nuit, le petit-déjeuner et le caractère remboursable.
Elle sert l'affichage du catalogue et évite de répéter une jointure à trois
tables dans plusieurs requêtes.

`v_reservations_details` joint `reservation`, `utilisateur`, `hotel`, `chambre`
et `offre`. Elle rassemble en une ligne ce qu'un écran d'administration doit
montrer d'une réservation, là où le code ferait sinon une jointure à cinq
tables.

Ces deux vues sont la réponse au critère d'optimisation des requêtes SQL :
elles ne changent pas le plan d'exécution mais suppriment la duplication de
jointures complexes, première cause de divergence entre deux écrans censés
montrer la même donnée.

# 🏨 Book Your Travel - Application de Réservation d'Hôtel

> 🚧 **Projet en cours de finalisation** 🚧

## 📋 Description

Application web complète de réservation d'hôtels en ligne développée dans le cadre d'une certification professionnelle **Développeur Web (RNCP)**.

Cette application permet aux utilisateurs de rechercher, consulter et réserver des chambres d'hôtel avec une interface responsive, accessible et multilingue.

## 🛠️ Stack Technique

### Frontend
| Technologie | Détail |
|-------------|--------|
| Angular | 20 (standalone components) |
| TypeScript | Intégré à Angular |
| Bootstrap | 5 |
| SCSS | Préprocesseur CSS |
| ngx-translate | Multi-langue (FR/EN/IT) |
| RxJS | Programmation réactive |

### Backend
| Technologie | Détail |
|-------------|--------|
| Node.js | Natif (sans framework) |
| Architecture | MVC + POO |
| JWT | Authentification |
| bcrypt | Hash des mots de passe |
| Nodemailer | Envoi d'emails |

### Base de données
| Technologie | Détail |
|-------------|--------|
| MySQL | Base `hotel_booking` |
| phpMyAdmin | Administration |
| Index FULLTEXT | Recherche optimisée |

## ✅ Fonctionnalités implémentées

### Authentification
- Inscription / Connexion / Déconnexion
- JWT tokens avec rôles (admin, client)
- Récupération mot de passe par email
- Guards Angular (authGuard, adminGuard)

### Réservations
- Processus complet (recherche → booking → paiement)
- Calendrier interactif (check-in/check-out)
- Services additionnels sélectionnables
- Validation carte bancaire (algorithme de Luhn)
- Paiement différé possible

### Espace Client
- Profil modifiable
- Historique des réservations
- Annulation de réservation
- Système d'avis (création, modification, suppression)

### Interface Admin
- Dashboard avec statistiques dynamiques
- CRUD complet : Hôtels, Chambres, Services
- Gestion des réservations et statuts
- Gestion des utilisateurs et rôles
- Gestion des messages contact
- Modération des avis

### Internationalisation
- Multi-langue : Français, English, Italiano
- Multi-devise : EUR, USD, GBP

### Accessibilité & UX
- Conformité ARIA / RGAA
- Police OpenDyslexic disponible
- Skip-link navigation
- Responsive (mobile/tablet/desktop)

### Autres
- Recherche full-text avec pagination
- Page contact avec formulaire
- Widgets : Hôtels populaires, Offre du jour

## 📁 Structure du projet

```
hotel-booking-bloc2/
├── backend/
│   ├── server.js          # Serveur principal
│   ├── config/            # Configuration BDD
│   ├── models/            # Classes (User, Hotel, Reservation...)
│   ├── controllers/       # Logique métier
│   ├── routes/            # Routes API REST
│   └── middlewares/       # Auth, validation...
│
└── frontend/hotel-app/
    └── src/app/
        ├── components/    # Composants Angular
        ├── services/      # Services (auth, hotel, currency...)
        ├── pipes/         # Pipes personnalisés
        ├── guards/        # Protection des routes
        └── interceptors/  # Intercepteurs HTTP
```

## ⚙️ Installation

### Prérequis
- Node.js 18+
- MySQL 8+
- Angular CLI 20

### Backend
```bash
cd backend
npm install
node server.js
# → http://localhost:3000
```

### Frontend
```bash
cd frontend/hotel-app
npm install
ng serve
# → http://localhost:4200
```

### Base de données
Importer le fichier SQL via phpMyAdmin dans une base nommée `hotel_booking`.

## 📝 Ce qui reste à faire

- [ ] Documentation technique complète
- [ ] Diagrammes UML (MCD, séquence)
- [ ] Tests Lighthouse (accessibilité + performance)
- [ ] Déploiement démo en ligne

## 📄 Licence

Projet réalisé dans un cadre éducatif - Certification Développeur Web.

---

*Dernière mise à jour : Janvier 2025*
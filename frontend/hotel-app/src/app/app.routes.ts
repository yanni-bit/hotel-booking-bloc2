// ============================================
// FICHIER : app.routes.ts
// DESCRIPTION : Configuration complète du routage de l'application.
//               Définit toutes les routes publiques, protégées (authGuard)
//               et administrateur (adminGuard) de l'application.
//               Inclut les routes enfants pour le détail hôtel (onglets).
// AUTEUR : Yannick
// DATE : 2025
// GUARDS UTILISÉS : authGuard (utilisateur connecté),
//                   adminGuard (administrateur uniquement)
// STRUCTURE DES ROUTES :
//   - Routes publiques : accueil, hôtels, détail hôtel (avec enfants),
//     chambres, réservation, login, register, mot de passe, recherche, contact
//   - Routes protégées (authGuard) : profil, mes réservations, détail réservation, paiement
//   - Routes admin (adminGuard) : dashboard, hôtels, réservations, messages,
//     avis, utilisateurs, services
//   - Route wildcard : redirection vers l'accueil
// ============================================

import { Routes } from '@angular/router';

// --- Composants publics ---
import { Home } from './components/home/home';
import { HotelsList } from './components/hotels-list/hotels-list';
import { HotelDetail } from './components/hotel-detail/hotel-detail';
import { HotelDescription } from './components/hotel-description/hotel-description';
import { HotelOffers } from './components/hotel-offers/hotel-offers';
import { HotelAmenities } from './components/hotel-amenities/hotel-amenities';
import { HotelReviews } from './components/hotel-reviews/hotel-reviews';
import { HotelLocation } from './components/hotel-location/hotel-location';
import { RoomDetail } from './components/room-detail/room-detail';
import { Booking } from './components/booking/booking';
import { Payment } from './components/payment/payment';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { SearchResults } from './components/search-results/search-results';
import { Prestataire } from './components/prestataire/prestataire';
import { Contact } from './components/contact/contact';
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { ResetPassword } from './components/reset-password/reset-password';
import { Confidentialite } from './components/confidentialite/confidentialite';

// --- Composants protégés (utilisateur connecté) ---
import { Profil } from './components/profil/profil';
import { MesReservations } from './components/mes-reservations/mes-reservations';
import { ReservationDetail } from './components/reservation-detail/reservation-detail';

// --- Composants admin ---
import { Admin } from './components/admin/admin';
import { AdminHotels } from './components/admin-hotels/admin-hotels';
import { AdminHotelForm } from './components/admin-hotel-form/admin-hotel-form';
import { AdminReservations } from './components/admin-reservations/admin-reservations';
import { AdminMessages } from './components/admin-messages/admin-messages';
import { AdminAvis } from './components/admin-avis/admin-avis';
import { AdminUsers } from './components/admin-users/admin-users';
import { AdminUserDetail } from './components/admin-user-detail/admin-user-detail';
import { AdminServices } from './components/admin-services/admin-services';

// --- Guards de protection ---
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { providerGuard } from './guards/provider.guard';

/** Configuration complète des routes de l'application */
export const routes: Routes = [
  // ============================================================================
  // ROUTES PUBLIQUES
  // ============================================================================

  /** Page d'accueil */
  { path: '', component: Home },

  /** Liste complète des hôtels, toutes villes confondues */
  { path: 'hotels', component: HotelsList },

  /** Liste des hôtels par ville */
  { path: 'hotels/:ville', component: HotelsList },

  /** Détail d'un hôtel avec onglets enfants (description, offres, aménagements, avis, localisation) */
  {
    path: 'hotels/:ville/:hotelId',
    component: HotelDetail,
    children: [
      { path: '', redirectTo: 'description', pathMatch: 'full' },
      { path: 'description', component: HotelDescription },
      { path: 'offers', component: HotelOffers },
      { path: 'amenities', component: HotelAmenities },
      { path: 'reviews', component: HotelReviews },
      { path: 'location', component: HotelLocation },
    ],
  },

  /** Détail d'une chambre */
  { path: 'hotels/:ville/:hotelId/rooms/:chambreId', component: RoomDetail },

  /** Formulaire de réservation (étape 1 : infos voyageur) */
  { path: 'booking/:offreId', component: Booking },

  /** Paiement (étape 2 : protégé par authGuard) */
  { path: 'payment/:offreId', component: Payment, canActivate: [authGuard] },

  /** Authentification */
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },

  /** Recherche et contact */
  // --------------------------------------------------------------------------
  // Espace prestataire : réservations de ses seuls établissements
  // --------------------------------------------------------------------------
  {
    path: 'prestataire',
    component: Prestataire,
    canActivate: [providerGuard],
  },

  { path: 'search', component: SearchResults },
  { path: 'contact', component: Contact },

  /** Politique de confidentialité (RGPD, critère Cr 3.d.2) */
  { path: 'privacy', component: Confidentialite },

  // ============================================================================
  // ROUTES PROTÉGÉES (nécessitent une connexion - authGuard)
  // ============================================================================

  /** Profil utilisateur */
  {
    path: 'profil',
    component: Profil,
    canActivate: [authGuard],
  },

  /** Liste des réservations de l'utilisateur */
  {
    path: 'reservations',
    component: MesReservations,
    canActivate: [authGuard],
  },

  /** Détail d'une réservation */
  {
    path: 'reservations/:id',
    component: ReservationDetail,
    canActivate: [authGuard],
  },

  // ============================================================================
  // ROUTES ADMIN (nécessitent le rôle admin - adminGuard)
  // ============================================================================

  /** Dashboard administrateur */
  {
    path: 'admin',
    component: Admin,
    canActivate: [adminGuard],
  },

  /** Gestion des hôtels (liste) */
  {
    path: 'admin/hotels',
    component: AdminHotels,
    canActivate: [adminGuard],
  },

  /** Création d'un hôtel */
  {
    path: 'admin/hotels/create',
    component: AdminHotelForm,
    canActivate: [adminGuard],
  },

  /** Édition d'un hôtel existant */
  {
    path: 'admin/hotels/edit/:id',
    component: AdminHotelForm,
    canActivate: [adminGuard],
  },

  /** Gestion des réservations */
  {
    path: 'admin/reservations',
    component: AdminReservations,
    canActivate: [adminGuard],
  },

  /** Gestion des messages de contact */
  {
    path: 'admin/messages',
    component: AdminMessages,
    canActivate: [adminGuard],
  },

  /** Gestion des avis */
  {
    path: 'admin/avis',
    component: AdminAvis,
    canActivate: [adminGuard],
  },

  /** Gestion des utilisateurs (liste) */
  {
    path: 'admin/users',
    component: AdminUsers,
    canActivate: [adminGuard],
  },

  /** Détail d'un utilisateur */
  {
    path: 'admin/users/:id',
    component: AdminUserDetail,
    canActivate: [adminGuard],
  },

  /** Gestion des services additionnels */
  {
    path: 'admin/services',
    component: AdminServices,
    canActivate: [adminGuard],
  },

  // ============================================================================
  // ROUTE WILDCARD (redirection vers l'accueil pour les URL inconnues)
  // ============================================================================

  { path: '**', redirectTo: '' },
];

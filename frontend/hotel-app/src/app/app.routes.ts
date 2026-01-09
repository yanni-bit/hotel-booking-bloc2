import { Routes } from '@angular/router';
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
import { Profil } from './components/profil/profil';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { MesReservations } from './components/mes-reservations/mes-reservations';
import { ReservationDetail } from './components/reservation-detail/reservation-detail';
import { Admin } from './components/admin/admin';
import { AdminHotels } from './components/admin-hotels/admin-hotels';
import { AdminHotelForm } from './components/admin-hotel-form/admin-hotel-form';
import { AdminReservations } from './components/admin-reservations/admin-reservations';
import { AdminMessages } from './components/admin-messages/admin-messages';
import { SearchResults } from './components/search-results/search-results';
import { Contact } from './components/contact/contact';
import { AdminAvis } from './components/admin-avis/admin-avis';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'hotels/:ville', component: HotelsList },
  {
    path: 'hotels/:ville/:hotelId',
    component: HotelDetail,
    children: [
      { path: '', redirectTo: 'description', pathMatch: 'full' },
      { path: 'description', component: HotelDescription },
      { path: 'offers', component: HotelOffers },
      { path: 'amenities', component: HotelAmenities },
      { path: 'reviews', component: HotelReviews },
      { path: 'location', component: HotelLocation }
    ]
  },
  { path: 'hotels/:ville/:hotelId/rooms/:chambreId', component: RoomDetail },
  { path: 'booking/:offreId', component: Booking },
  { path: 'payment/:offreId', component: Payment, canActivate: [authGuard] },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'search', component: SearchResults },
  { path: 'contact', component: Contact },

  // ROUTES PROTÉGÉES (nécessitent une connexion)
  {
    path: 'profil',
    component: Profil,
    canActivate: [authGuard]
  },
  {
    path: 'reservations',
    component: MesReservations,
    canActivate: [authGuard]
  },
  {
    path: 'reservations/:id',
    component: ReservationDetail,
    canActivate: [authGuard]
  },

  // ROUTES PROTÉGÉES - Admin uniquement
  {
    path: 'admin',
    component: Admin,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/hotels',
    component: AdminHotels,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/hotels/create',
    component: AdminHotelForm,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/hotels/edit/:id',
    component: AdminHotelForm,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/reservations',
    component: AdminReservations,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/messages',
    component: AdminMessages,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/avis',
    component: AdminAvis,
    canActivate: [adminGuard]
  },

  { path: '**', redirectTo: '' },
];
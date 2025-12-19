import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { HotelsList } from './components/hotels-list/hotels-list';
import { HotelDetail } from './components/hotel-detail/hotel-detail';
import { HotelDescription } from './components/hotel-description/hotel-description';
import { HotelOffers } from './components/hotel-offers/hotel-offers';
import { HotelAmenities } from './components/hotel-amenities/hotel-amenities';
import { HotelReviews } from './components/hotel-reviews/hotel-reviews';
import { HotelLocation } from './components/hotel-location/hotel-location';

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
  { path: '**', redirectTo: '' }
];
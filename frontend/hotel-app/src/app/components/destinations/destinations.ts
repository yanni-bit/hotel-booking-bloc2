import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-destinations',
  imports: [CommonModule],
  templateUrl: './destinations.html',
  styleUrl: './destinations.scss',
})
export class Destinations {

  destinations = [
    {
      id: 1,
      title: 'Paris',
      pays: 'France',
      nombrehotels: '10',
      prix: '190€',
      image: 'images/paris.jpg',
      badge: 'PROMO',
      badgeColor: '#5fc8c2'
    },
    {
      id: 2,
      title: 'Amsterdam',
      pays: 'Netherlands',
      nombrehotels: '8',
      prix: '180€',
      image: 'images/amsterdam.jpg',
      badge: '',
      badgeColor: ''
    },
    {
      id: 3,
      title: 'St Petersburg',
      pays: 'Russie',
      nombrehotels: '8',
      prix: '180€',
      image: 'images/saint-petersburg.jpg',
      badge: '',
      badgeColor: ''
    },
    {
      id: 4,
      title: 'Prague',
      pays: 'République Tchèque',
      nombrehotels: '8',
      prix: '190€',
      image: 'images/prague.jpg',
      badge: '',
      badgeColor: ''
    },
    {
      id: 5,
      title: 'Tahiti',
      pays: 'Polynésie',
      nombrehotels: '8',
      prix: '1190€',
      image: 'images/offre-4.jpg',
      badge: 'NOUVEAU',
      badgeColor: '#5fc8c2'
    },
    {
      id: 6,
      title: 'Zanzibar',
      pays: 'Océan Indien',
      nombrehotels: '8',
      prix: '1180€',
      image: 'images/zanzibar.webp',
      badge: '',
      badgeColor: ''
    },
    {
      id: 7,
      title: 'Maldives',
      pays: 'Océan Indien',
      nombrehotels: '8',
      prix: '2320€',
      image: 'images/maldives.jpg',
      badge: '',
      badgeColor: ''
    },
    {
      id: 8,
      title: 'Cancun',
      pays: 'Mexique',
      nombrehotels: '9',
      prix: '1590€',
      image: 'images/cancun.jpg',
      badge: '',
      badgeColor: ''
    },
    {
      id: 9,
      title: 'Dubai',
      pays: 'Émirats Arabes Unis',
      nombrehotels: '9',
      prix: '310€',
      image: 'images/dubai.jpg',
      badge: '',
      badgeColor: ''
    },
    {
      id: 10,
      title: 'Bali',
      pays: 'Indonesie',
      nombrehotels: '8',
      prix: '1680€',
      image: 'images/bali.jpg',
      badge: '',
      badgeColor: ''
    },
    {
      id: 11,
      title: 'New York',
      pays: 'États-Unis',
      nombrehotels: '9',
      prix: '760€',
      image: 'images/new-york.webp',
      badge: '',
      badgeColor: ''
    },
    {
      id: 12,
      title: 'Tokyo',
      pays: 'Japon',
      nombrehotels: '9',
      prix: '980€',
      image: 'images/tokyo.jpg',
      badge: '',
      badgeColor: ''
    }
  ]
}

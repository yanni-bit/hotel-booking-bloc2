import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-offres',
  imports: [CommonModule, RouterLink],
  templateUrl: './offres.html',
  styleUrl: './offres.scss'
})
export class Offres {
  
  offres = [
    {
      id: 1,
      title: 'Escapades Hivernales à la Plage',
      description: 'Profitez de plages ensoleillées avec des réductions hivernales exclusives',
      image: 'images/offre-1.jpg',
      badge: '30% OFF',
      badgeColor: '#5fc8c2',
      ville: 'Cancun',
      hotelId: 65
    },
    {
      id: 2,
      title: 'Passez le Réveillon à Paris',
      description: 'Vivez la magie de Paris pendant les fêtes',
      image: 'images/paris.jpg',
      badge: 'PROMO',
      badgeColor: '#5fc8c2',
      ville: 'Paris',
      hotelId: 1
    },
    {
      id: 3,
      title: 'Une Nuit de Noces Paradisiaque',
      description: 'Nuit de Noces aux Maldives, luxe total face à l\'océan',
      image: 'images/nuit_de_noces.jpg',
      badge: 'HOT DEAL',
      badgeColor: '#5fc8c2',
      ville: 'Maldives',
      hotelId: 52
    },
    {
      id: 4,
      title: 'Notre Meilleure Offre de la Semaine : Tahiti',
      description: 'Découvrez le paradis à des prix imbattables',
      image: 'images/offre-4.jpg',
      badge: 'NOUVEAU',
      badgeColor: '#5fc8c2',
      ville: 'Tahiti',
      hotelId: 35
    }
  ];
}
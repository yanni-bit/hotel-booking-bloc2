/**
 * ============================================================
 * FICHIER     : offres.ts
 * COMPOSANT   : Offres
 * DESCRIPTION : Section "Nos dernières offres" affichée sur la page
 *               d'accueil. Présente 4 offres promotionnelles sous
 *               forme de cartes cliquables redirigeant vers la page
 *               détail de l'hôtel correspondant. Les données des
 *               offres sont définies en dur (statiques).
 * AUTEUR      : Yannick
 * DATE        : 2025
 * FONCTIONNALITÉS :
 *   - Affichage de 4 offres promotionnelles en grille responsive
 *   - Chaque carte contient : image, badge promo, titre, description
 *   - Navigation vers la page hôtel au clic (ville + hotelId)
 *   - Données statiques (pas d'appel API)
 * ============================================================
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-offres',
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './offres.html',
  styleUrl: './offres.scss',
})
export class Offres {
  /**
   * Tableau des 4 offres promotionnelles affichées sur l'accueil
   * Chaque offre contient : id, titre, description, image, badge,
   * couleur du badge, ville de destination et id de l'hôtel
   */
  offres = [
    {
      id: 1,
      title: 'Escapades Hivernales à la Plage',
      description: 'Profitez de plages ensoleillées avec des réductions hivernales exclusives',
      image: 'images/offre-1.jpg',
      badge: '30% OFF',
      badgeColor: '#5fc8c2',
      ville: 'Cancun',
      hotelId: 65,
    },
    {
      id: 2,
      title: 'Passez le Réveillon à Paris',
      description: 'Vivez la magie de Paris pendant les fêtes',
      image: 'images/paris.jpg',
      badge: 'PROMO',
      badgeColor: '#5fc8c2',
      ville: 'Paris',
      hotelId: 1,
    },
    {
      id: 3,
      title: 'Une Nuit de Noces Paradisiaque',
      description: "Nuit de Noces aux Maldives, luxe total face à l'océan",
      image: 'images/nuit_de_noces.jpg',
      badge: 'HOT DEAL',
      badgeColor: '#5fc8c2',
      ville: 'Maldives',
      hotelId: 52,
    },
    {
      id: 4,
      title: 'Notre Meilleure Offre de la Semaine : Tahiti',
      description: 'Découvrez le paradis à des prix imbattables',
      image: 'images/offre-4.jpg',
      badge: 'NOUVEAU',
      badgeColor: '#5fc8c2',
      ville: 'Tahiti',
      hotelId: 35,
    },
  ];
}

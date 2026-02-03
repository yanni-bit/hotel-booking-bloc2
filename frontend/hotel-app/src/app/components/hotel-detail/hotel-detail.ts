/**
 * ============================================================
 * FICHIER     : hotel-detail.ts
 * COMPOSANT   : HotelDetail
 * DESCRIPTION : Page de détail d'un hôtel - Composant principal qui
 *               orchestre l'affichage des informations détaillées d'un
 *               hôtel (carrousel, onglets, widgets latéraux). Récupère
 *               l'identifiant de l'hôtel depuis les paramètres de route
 *               et charge les données via le service HotelService.
 * AUTEUR      : Yannick
 * DATE        : 2025
 * SERVICES    : HotelService (chargement des détails hôtel)
 *               ActivatedRoute (récupération des paramètres de route)
 *               ChangeDetectorRef (détection manuelle des changements OnPush)
 * FONCTIONNALITÉS :
 *   - Récupération de l'ID hôtel et de la ville depuis l'URL
 *   - Chargement asynchrone des détails de l'hôtel via API
 *   - Gestion des états de chargement et d'erreur
 *   - Orchestration des sous-composants (header, sidebar, widgets)
 *   - Système d'onglets via routes enfants (RouterOutlet)
 * ============================================================
 */

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterOutlet, RouterLink } from '@angular/router';
import { HotelService } from '../../services/hotel';
import { HotelHeader } from '../hotel-header/hotel-header';
import { HotelSidebar } from '../hotel-sidebar/hotel-sidebar';
import { HotelInfoCard } from '../widgets/hotel-info-card/hotel-info-card';
import { WhyBook } from '../widgets/why-book/why-book';
import { PopularHotels } from '../widgets/popular-hotels/popular-hotels';
import { DealOfDay } from '../widgets/deal-of-day/deal-of-day';
import { HelpContact } from '../widgets/help-contact/help-contact';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-hotel-detail',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    HotelHeader,
    HotelSidebar,
    HotelInfoCard,
    WhyBook,
    PopularHotels,
    DealOfDay,
    HelpContact,
    TranslateModule,
  ],
  templateUrl: './hotel-detail.html',
  styleUrl: './hotel-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelDetail implements OnInit {
  /** Identifiant unique de l'hôtel récupéré depuis l'URL */
  hotelId: number = 0;

  /** Nom de la ville de l'hôtel récupéré depuis l'URL */
  ville: string = '';

  /** Objet contenant toutes les données de l'hôtel */
  hotel: any = null;

  /** Indicateur d'état de chargement des données */
  loading: boolean = true;

  /** Message d'erreur en cas d'échec du chargement */
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private hotelService: HotelService,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * Initialisation du composant
   * Souscrit aux paramètres de route pour récupérer l'ID hôtel et la ville,
   * puis déclenche le chargement des données
   */
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.hotelId = +params['hotelId'];
      this.ville = params['ville'];
      console.log('🏨 Hôtel ID:', this.hotelId, '| Ville:', this.ville);
      this.loadHotel();
    });
  }

  /**
   * Charge les détails de l'hôtel depuis l'API
   * Appelle HotelService.getHotelDetails() et met à jour l'état du composant
   * Utilise markForCheck() pour la stratégie de détection OnPush
   */
  loadHotel() {
    this.loading = true;

    this.hotelService.getHotelDetails(this.hotelId).subscribe({
      next: (response) => {
        console.log('📊 Données hôtel:', response);
        this.hotel = response.data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.error = "Erreur lors du chargement de l'hôtel";
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }
}

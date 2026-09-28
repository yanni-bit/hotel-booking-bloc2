/**
 * ============================================================
 * FICHIER     : hotels-list.ts
 * COMPOSANT   : HotelsList
 * DESCRIPTION : Page listant les hôtels d'une ville donnée. Récupère
 *               le nom de la ville depuis les paramètres de route,
 *               charge tous les hôtels via HotelService puis filtre
 *               côté client ceux correspondant à la ville sélectionnée.
 *               Chaque hôtel est affiché sous forme de carte avec
 *               image, étoiles, description, localisation et note.
 * AUTEUR      : Yannick
 * DATE        : 2025
 * SERVICES    : HotelService (chargement de tous les hôtels)
 *               ActivatedRoute (récupération du paramètre ville)
 *               ChangeDetectorRef (détection manuelle des changements OnPush)
 * FONCTIONNALITÉS :
 *   - Récupération du paramètre ville depuis l'URL
 *   - Chargement de tous les hôtels et filtrage par ville
 *   - Affichage en grille responsive (1/2/3 colonnes)
 *   - Navigation vers la page de détail d'un hôtel
 *   - Gestion des états de chargement, d'erreur et de liste vide
 * ============================================================
 */

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HotelService } from '../../services/hotel';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-hotels-list',
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './hotels-list.html',
  styleUrl: './hotels-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelsList implements OnInit {
  /** Nom de la ville récupéré depuis l'URL */
  ville: string = '';

  /** Liste des hôtels filtrés par ville */
  hotels: any[] = [];

  /** Indicateur d'état de chargement */
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
   * Souscrit aux paramètres de route pour récupérer la ville
   * et déclenche le chargement des hôtels
   */
  ngOnInit() {
    // Récupérer le paramètre ville depuis l'URL
    this.route.params.subscribe((params) => {
      // Le parametre est absent sur /hotels : chaine vide = toutes les villes
      this.ville = params['ville'] || '';
      this.loadHotels();
    });
  }

  /**
   * Charge les hôtels depuis l'API.
   * Si une ville est presente dans l'URL, la liste est filtree sur
   * ville_hotel ; sinon tous les hôtels sont affiches.
   * Utilise markForCheck() pour la stratégie de détection OnPush
   */
  loadHotels() {
    this.loading = true;

    this.hotelService.getAllHotels().subscribe({
      next: (response) => {
        this.hotels = this.ville
          ? response.data.filter((hotel: any) => hotel.ville_hotel === this.ville)
          : response.data;

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des hôtels';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }
}

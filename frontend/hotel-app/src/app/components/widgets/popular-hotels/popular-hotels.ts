/**
 * ============================================================
 * FICHIER     : popular-hotels.ts
 * COMPOSANT   : PopularHotels
 * DESCRIPTION : Widget sidebar affichant les hôtels populaires
 *               dans un pays donné. Charge une liste d'hôtels
 *               via l'API en excluant l'hôtel courant. Affiche
 *               chaque hôtel avec miniature, nom, étoiles, prix
 *               minimum et note. Se recharge au changement d'Inputs.
 * AUTEUR      : Yannick
 * DATE        : 2025
 * SERVICES    : HotelService (getPopularHotelsByCountry)
 * PIPES       : CurrencyPipe (formatage des prix)
 * INPUTS      :
 *   - country : pays pour filtrer les hôtels populaires
 *   - excludeHotelId : ID de l'hôtel à exclure (hôtel courant)
 * FONCTIONNALITÉS :
 *   - Chargement automatique au ngOnInit et au changement d'Inputs
 *   - Liste d'hôtels avec miniature + infos (nom, étoiles, prix, note)
 *   - État loading (spinner) et état vide (message)
 *   - Liens vers les fiches hôtel → /hotel/:id
 * ============================================================
 */

import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HotelService } from '../../../services/hotel';
import { CurrencyPipe } from '../../../pipes/currency.pipe';

@Component({
  selector: 'app-popular-hotels',
  imports: [CommonModule, RouterLink, TranslateModule, CurrencyPipe],
  templateUrl: './popular-hotels.html',
  styleUrl: './popular-hotels.scss',
})
export class PopularHotels implements OnInit, OnChanges {
  /** Pays pour filtrer les hôtels populaires (reçu du parent) */
  @Input() country: string = '';

  /** ID de l'hôtel à exclure des résultats (hôtel affiché actuellement) */
  @Input() excludeHotelId: number = 0;

  /** Liste des hôtels populaires chargés */
  hotels: any[] = [];

  /** Indicateur de chargement */
  loading: boolean = false;

  constructor(private hotelService: HotelService) {}

  /** Chargement initial des hôtels populaires */
  ngOnInit(): void {
    this.loadPopularHotels();
  }

  /**
   * Recharge les hôtels populaires si les Inputs country
   * ou excludeHotelId changent (navigation entre hôtels)
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['country'] || changes['excludeHotelId']) {
      this.loadPopularHotels();
    }
  }

  /**
   * Charge les hôtels populaires via HotelService.getPopularHotelsByCountry()
   * Filtre par pays et exclut l'hôtel courant
   */
  loadPopularHotels(): void {
    if (!this.country) return;

    this.loading = true;
    this.hotelService.getPopularHotelsByCountry(this.country, this.excludeHotelId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.hotels = response.data;
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement hôtels populaires:', err);
        this.loading = false;
      },
    });
  }

  /**
   * Génère un tableau de longueur count pour l'affichage des étoiles
   * @param count - Nombre d'étoiles de l'hôtel
   * @returns Tableau de zéros utilisé par *ngFor
   */
  getStars(count: number): number[] {
    return Array(count).fill(0);
  }
}

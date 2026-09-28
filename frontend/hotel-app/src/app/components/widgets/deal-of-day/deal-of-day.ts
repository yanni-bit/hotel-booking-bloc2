/**
 * ============================================================
 * FICHIER     : deal-of-day.ts
 * COMPOSANT   : DealOfDay
 * DESCRIPTION : Widget sidebar affichant "l'offre du jour" pour un
 *               pays donné. Charge un hôtel aléatoire via l'API
 *               en excluant l'hôtel courant. Affiche l'image, le
 *               nom, les étoiles, le prix minimum et la note.
 *               Se recharge automatiquement si les Inputs changent.
 * AUTEUR      : Yannick
 * DATE        : 2025
 * SERVICES    : HotelService (getDealOfDay par pays)
 * PIPES       : CurrencyPipe (formatage du prix minimum)
 * INPUTS      :
 *   - country : pays pour filtrer l'offre du jour
 *   - excludeHotelId : ID de l'hôtel à exclure (hôtel courant)
 * FONCTIONNALITÉS :
 *   - Chargement automatique au ngOnInit et au changement d'Inputs
 *   - Affichage image cliquable + nom + étoiles + prix min + note
 *   - État loading (spinner) et état vide (message)
 *   - Lien vers la fiche hôtel → /hotels/:ville/:id
 * ============================================================
 */

import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HotelService } from '../../../services/hotel';
import { CurrencyPipe } from '../../../pipes/currency.pipe';

@Component({
  selector: 'app-deal-of-day',
  imports: [CommonModule, RouterLink, TranslateModule, CurrencyPipe],
  templateUrl: './deal-of-day.html',
  styleUrl: './deal-of-day.scss',
})
export class DealOfDay implements OnInit, OnChanges {
  /** Pays pour filtrer l'offre du jour (reçu du parent) */
  @Input() country: string = '';

  /** ID de l'hôtel à exclure des résultats (hôtel affiché actuellement) */
  @Input() excludeHotelId: number = 0;

  /** Données de l'hôtel "offre du jour" */
  hotel: any = null;

  /** Indicateur de chargement */
  loading: boolean = false;

  constructor(
    private hotelService: HotelService,
    private cdr: ChangeDetectorRef,
  ) {}

  /** Chargement initial de l'offre du jour */
  ngOnInit(): void {
    this.loadDealOfDay();
  }

  /**
   * Recharge l'offre du jour si les Inputs country ou
   * excludeHotelId changent (navigation entre hôtels)
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['country'] || changes['excludeHotelId']) {
      this.loadDealOfDay();
    }
  }

  /**
   * Charge l'offre du jour via HotelService.getDealOfDay()
   * Filtre par pays et exclut l'hôtel courant
   */
  loadDealOfDay(): void {
    if (!this.country) return;

    this.loading = true;
    this.hotelService.getDealOfDay(this.country, this.excludeHotelId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.hotel = response.data;
        }
        this.loading = false;
        // Le composant parent est en OnPush : sans markForCheck, la
        // traversee de detection ne descend pas jusqu'ici et la vue
        // reste bloquee sur le spinner malgre les donnees recues.
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Erreur chargement offre du jour:', err);
        this.loading = false;
        this.cdr.markForCheck();
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

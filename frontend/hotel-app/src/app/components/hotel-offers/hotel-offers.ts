/**
 * ============================================================
 * FICHIER     : hotel-offers.ts
 * COMPOSANT   : HotelOffers
 * DESCRIPTION : Onglet "Offres" de la page de détail d'un hôtel.
 *               Affiche la liste des chambres disponibles avec leurs
 *               caractéristiques (capacité, surface, lits), le nombre
 *               d'offres actives et le prix minimum par nuit.
 *               Chaque chambre propose un lien vers ses offres détaillées.
 * AUTEUR      : Yannick
 * DATE        : 2025
 * SERVICES    : ChambreService (chargement des chambres par hôtel)
 *               ActivatedRoute (récupération de l'ID hôtel depuis la route parente)
 *               ChangeDetectorRef (détection manuelle des changements OnPush)
 * PIPES       : CurrencyPipe (formatage des prix selon la devise)
 * FONCTIONNALITÉS :
 *   - Récupération de l'ID hôtel depuis la route parente
 *   - Chargement asynchrone des chambres via ChambreService
 *   - Affichage des caractéristiques de chaque chambre
 *   - Affichage du prix minimum et du nombre d'offres
 *   - Navigation vers le détail des offres d'une chambre
 *   - Gestion des états de chargement, d'erreur et de liste vide
 * ============================================================
 */

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ChambreService } from '../../services/chambre';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencyPipe } from '../../pipes/currency.pipe';

@Component({
  selector: 'app-hotel-offers',
  imports: [CommonModule, RouterLink, TranslateModule, CurrencyPipe],
  templateUrl: './hotel-offers.html',
  styleUrl: './hotel-offers.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelOffers implements OnInit {
  /** Liste des chambres de l'hôtel */
  chambres: any[] = [];

  /** Indicateur d'état de chargement des données */
  loading: boolean = true;

  /** Message d'erreur en cas d'échec du chargement */
  error: string = '';

  /** Identifiant de l'hôtel récupéré depuis la route parente */
  hotelId: number = 0;

  /** Nom de la ville pour la construction des liens de navigation */
  ville: string = '';

  constructor(
    private route: ActivatedRoute,
    private chambreService: ChambreService,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * Initialisation du composant
   * Récupère l'ID hôtel depuis les paramètres de la route parente
   * et déclenche le chargement des chambres
   */
  ngOnInit() {
    // Récupérer l'ID de l'hôtel depuis l'URL parent
    this.hotelId = +this.route.parent?.snapshot.params['hotelId'];

    if (this.hotelId) {
      this.loadChambres();
    }
  }

  /**
   * Charge la liste des chambres de l'hôtel depuis l'API
   * Appelle ChambreService.getChambresByHotelId() et met à jour l'état
   * Utilise markForCheck() pour la stratégie de détection OnPush
   */
  loadChambres() {
    this.loading = true;

    this.chambreService.getChambresByHotelId(this.hotelId).subscribe({
      next: (response) => {
        console.log('📦 Chambres:', response);
        this.chambres = response.data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur chambres:', err);
        this.error = 'Erreur lors du chargement des chambres';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }
}

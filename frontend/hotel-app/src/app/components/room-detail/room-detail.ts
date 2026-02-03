/**
 * ============================================================
 * FICHIER     : room-detail.ts
 * COMPOSANT   : RoomDetail
 * DESCRIPTION : Page de détail d'une chambre d'hôtel. Affiche les
 *               caractéristiques de la chambre (type, catégorie,
 *               capacité, surface, lits, description) et la liste
 *               de ses offres disponibles (pension, prix/nuit,
 *               remboursable, petit-déjeuner). Chaque offre dispose
 *               d'un bouton de réservation vers /booking/:id_offre.
 * AUTEUR      : Yannick
 * DATE        : 2025
 * SERVICES    : ChambreService (détail chambre + offres associées)
 *               ActivatedRoute (paramètres :chambreId, :hotelId, :ville)
 *               ChangeDetectorRef (détection manuelle OnPush)
 * PIPES       : CurrencyPipe (formatage des prix)
 * FONCTIONNALITÉS :
 *   - Chargement chambre avec ses offres via getChambreWithOffers()
 *   - Affichage caractéristiques : adultes max, enfants, surface, lits
 *   - Liste des offres : nom, description, pension, prix, remboursable
 *   - Calcul du prix minimum parmi toutes les offres (sidebar)
 *   - Navigation vers /booking/:id_offre pour réserver
 * ============================================================
 */

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ChambreService } from '../../services/chambre';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencyPipe } from '../../pipes/currency.pipe';

@Component({
  selector: 'app-room-detail',
  imports: [CommonModule, RouterLink, TranslateModule, CurrencyPipe],
  templateUrl: './room-detail.html',
  styleUrl: './room-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomDetail implements OnInit {
  /** Objet chambre complet (données API) */
  chambre: any = null;

  /** Liste des offres disponibles pour cette chambre */
  offres: any[] = [];

  /** Indicateur de chargement */
  loading: boolean = true;

  /** Message d'erreur */
  error: string = '';

  /** ID de la chambre (depuis paramètre de route :chambreId) */
  chambreId: number = 0;

  /** ID de l'hôtel parent (depuis paramètre de route :hotelId) */
  hotelId: number = 0;

  /** Ville de l'hôtel (depuis paramètre de route :ville) */
  ville: string = '';

  constructor(
    private route: ActivatedRoute,
    private chambreService: ChambreService,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * Initialisation : récupère les paramètres de route
   * (chambreId, hotelId, ville) et charge les données
   */
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.chambreId = +params['chambreId'];
      this.hotelId = +params['hotelId'];
      this.ville = params['ville'];

      this.loadChambreDetails();
    });
  }

  /**
   * Charge les détails de la chambre et ses offres associées
   * via ChambreService.getChambreWithOffers()
   */
  loadChambreDetails() {
    this.loading = true;

    this.chambreService.getChambreWithOffers(this.chambreId).subscribe({
      next: (response) => {
        this.chambre = response.data;
        this.offres = response.data.offres || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.error = 'Erreur lors du chargement de la chambre';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Calcule le prix minimum parmi toutes les offres disponibles
   * Utilisé dans la sidebar pour afficher "À partir de X €"
   * @returns Prix minimum formaté en string (arrondi, sans décimales)
   */
  getPrixMinimum(): string {
    if (this.offres.length === 0) {
      return '0';
    }

    const prix = this.offres.map((o) => parseFloat(o.prix_nuit) || 0);
    const min = Math.min(...prix);

    return min.toFixed(0);
  }
}

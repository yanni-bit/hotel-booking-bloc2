/**
 * ============================================================
 * FICHIER     : search-results.ts
 * COMPOSANT   : SearchResults
 * DESCRIPTION : Page de résultats de recherche d'hôtels. Récupère
 *               le terme de recherche depuis le queryParam ?q=,
 *               effectue une recherche paginée via HotelService
 *               et affiche une grille de cartes hôtels avec
 *               navigation par pagination.
 * AUTEUR      : Yannick
 * DATE        : 2025
 * SERVICES    : HotelService (recherche paginée d'hôtels)
 *               ActivatedRoute (récupération queryParam q)
 *               ChangeDetectorRef (détection manuelle des changements)
 *               NgZone (exécution dans la zone Angular pour le rendu)
 * FONCTIONNALITÉS :
 *   - Recherche hôtels par mot-clé (queryParam ?q=)
 *   - Grille de résultats : image, étoiles, description, localisation, note
 *   - Pagination complète : précédent/suivant + numéros de pages
 *   - Scroll vers le haut lors du changement de page
 *   - États : loading, erreur, aucun résultat
 * ============================================================
 */

import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HotelService } from '../../services/hotel';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './search-results.html',
  styleUrl: './search-results.scss',
})
export class SearchResults implements OnInit {
  /** Terme de recherche récupéré depuis le queryParam ?q= */
  query: string = '';

  /** Liste des hôtels correspondant à la recherche */
  results: any[] = [];

  /** Indicateur de chargement */
  loading: boolean = false;

  /** Message d'erreur */
  error: string = '';

  /** Page courante de la pagination */
  currentPage: number = 1;

  /** Nombre total de pages */
  totalPages: number = 1;

  /** Nombre total de résultats trouvés */
  totalResults: number = 0;

  constructor(
    private route: ActivatedRoute,
    private hotelService: HotelService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  /**
   * Initialisation : écoute les changements du queryParam ?q=
   * Réinitialise la pagination et lance la recherche à chaque changement
   */
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.query = params['q'] || '';
      if (this.query) {
        this.currentPage = 1;
        this.search();
      }
    });
  }

  /**
   * Effectue la recherche paginée via HotelService.searchHotels()
   * Utilise NgZone.run() pour garantir la détection des changements
   * Met à jour les résultats et les données de pagination
   */
  search() {
    this.loading = true;
    this.error = '';

    this.hotelService.searchHotels(this.query, this.currentPage).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          if (response.success) {
            this.results = response.data;
            this.currentPage = response.pagination.currentPage;
            this.totalPages = response.pagination.totalPages;
            this.totalResults = response.pagination.totalResults;
          } else {
            this.error = 'Erreur lors de la recherche';
          }
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Erreur recherche:', err);
          this.error = 'Erreur lors de la recherche';
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  /**
   * Navigue vers une page spécifique de la pagination
   * Scroll en haut de page avec animation smooth
   * @param page - Numéro de la page cible
   */
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.ngZone.run(() => {
        this.currentPage = page;
        this.search();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /** Navigue vers la page précédente */
  previousPage() {
    this.goToPage(this.currentPage - 1);
  }

  /** Navigue vers la page suivante */
  nextPage() {
    this.goToPage(this.currentPage + 1);
  }
}

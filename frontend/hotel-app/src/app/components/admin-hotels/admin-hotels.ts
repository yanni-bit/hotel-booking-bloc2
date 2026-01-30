// ============================================================================
// FICHIER : admin-hotels.component.ts
// DESCRIPTION : Composant de liste des hôtels - Interface admin pour
//               visualiser, accéder et supprimer les hôtels
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// STRATÉGIE : OnPush pour optimisation des performances
// SERVICES INJECTÉS :
//   - HotelAdminService : CRUD des hôtels
// FONCTIONNALITÉS :
//   - Affichage de la liste des hôtels en tableau
//   - Navigation vers création/édition/visualisation
//   - Suppression d'hôtel avec confirmation
// ============================================================================

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HotelAdminService } from '../../services/admin-hotels';

@Component({
  selector: 'app-admin-hotels',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-hotels.html',
  styleUrl: './admin-hotels.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHotels implements OnInit {
  // ==========================================================================
  // PROPRIÉTÉS
  // ==========================================================================

  /** Liste des hôtels chargés depuis l'API */
  hotels: any[] = [];

  /** Indicateur de chargement */
  loading: boolean = true;

  /** Message d'erreur */
  error: string = '';

  // ==========================================================================
  // CONSTRUCTEUR
  // ==========================================================================

  /**
   * Injection des dépendances
   * @param {HotelAdminService} hotelAdminService - Service CRUD des hôtels
   * @param {ChangeDetectorRef} cdr - Référence pour la détection de changements
   */
  constructor(
    private hotelAdminService: HotelAdminService,
    private cdr: ChangeDetectorRef,
  ) {}

  // ==========================================================================
  // CYCLE DE VIE
  // ==========================================================================

  /**
   * Initialisation du composant
   * Déclenche le chargement de la liste des hôtels
   */
  ngOnInit() {
    this.loadHotels();
  }

  // ==========================================================================
  // MÉTHODES - CHARGEMENT DES DONNÉES
  // ==========================================================================

  /**
   * Charge la liste de tous les hôtels depuis l'API
   */
  loadHotels() {
    this.loading = true;

    this.hotelAdminService.getAll().subscribe({
      next: (response) => {
        console.log('✅ Hôtels:', response);
        this.hotels = response.data || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.error = 'Erreur lors du chargement des hôtels';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ==========================================================================
  // MÉTHODES - ACTIONS CRUD
  // ==========================================================================

  /**
   * Supprime un hôtel après confirmation utilisateur
   * @param {any} hotel - Hôtel à supprimer
   */
  deleteHotel(hotel: any) {
    if (!confirm(`Voulez-vous vraiment supprimer l'hôtel "${hotel.nom_hotel}" ?`)) {
      return;
    }

    this.hotelAdminService.delete(hotel.id_hotel).subscribe({
      next: () => {
        alert('Hôtel supprimé avec succès');
        this.loadHotels(); // Recharger la liste
      },
      error: (err) => {
        console.error('❌ Erreur suppression:', err);
        alert('Erreur lors de la suppression');
      },
    });
  }
}

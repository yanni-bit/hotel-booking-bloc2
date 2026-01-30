// ============================================================================
// FICHIER : hotel-amenities.component.ts
// DESCRIPTION : Composant affichant les équipements et services d'un hôtel
//               Organisés par catégorie (général, sport, services)
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// SERVICES INJECTÉS :
//   - HotelService : Récupération des détails de l'hôtel
//   - ActivatedRoute : Récupération de l'ID hôtel depuis l'URL parente
// FONCTIONNALITÉS :
//   - Affichage des équipements organisés par catégorie
//   - Filtrage des équipements par catégorie
//   - Indicateur de chargement
// OPTIMISATION :
//   - ChangeDetectionStrategy.OnPush pour améliorer les performances
// NOTE :
//   Ce composant est un enfant du composant Hotel (route parente)
//   L'ID de l'hôtel est récupéré depuis route.parent.snapshot.params
// ============================================================================

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HotelService } from '../../services/hotel';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-hotel-amenities',
  imports: [CommonModule, TranslateModule],
  templateUrl: './hotel-amenities.html',
  styleUrl: './hotel-amenities.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelAmenities implements OnInit {
  // ==========================================================================
  // PROPRIÉTÉS - DONNÉES
  // ==========================================================================

  /** Détails de l'hôtel chargé */
  hotel: any = null;

  /** Indicateur de chargement */
  loading: boolean = true;

  // ==========================================================================
  // PROPRIÉTÉS - LISTE DES ÉQUIPEMENTS
  // ==========================================================================

  /**
   * Liste complète des équipements disponibles
   * Organisés par catégorie : general, sport, service
   * @property {string} icon - Classe Bootstrap Icons
   * @property {string} name - Nom de l'équipement
   * @property {string} category - Catégorie (general, sport, service)
   */
  amenities = [
    // Équipements généraux
    { icon: 'bi-wifi', name: 'Wi-Fi gratuit', category: 'general' },
    { icon: 'bi-p-circle', name: 'Parking', category: 'general' },
    { icon: 'bi-wind', name: 'Climatisation', category: 'general' },
    { icon: 'bi-cup-hot', name: 'Restaurant', category: 'general' },
    { icon: 'bi-cup-straw', name: 'Bar', category: 'general' },
    { icon: 'bi-tree', name: 'Jardin', category: 'general' },
    { icon: 'bi-elevator', name: 'Ascenseur', category: 'general' },

    // Sport & Loisirs
    { icon: 'bi-water', name: 'Piscine', category: 'sport' },
    { icon: 'bi-heart-pulse', name: 'Spa & Bien-être', category: 'sport' },
    { icon: 'bi-dumbbell', name: 'Salle de sport', category: 'sport' },

    // Services
    { icon: 'bi-door-open', name: 'Réception 24h/24', category: 'service' },
    { icon: 'bi-luggage', name: 'Bagagerie', category: 'service' },
    { icon: 'bi-shield-check', name: 'Coffre-fort', category: 'service' },
    { icon: 'bi-translate', name: 'Personnel multilingue', category: 'service' },
    { icon: 'bi-newspaper', name: 'Journaux', category: 'service' },
    { icon: 'bi-basket', name: "Service d'étage", category: 'service' },
  ];

  // ==========================================================================
  // CONSTRUCTEUR
  // ==========================================================================

  /**
   * Injection des dépendances
   * @param {ActivatedRoute} route - Route active pour récupérer les paramètres
   * @param {HotelService} hotelService - Service de gestion des hôtels
   * @param {ChangeDetectorRef} cdr - Référence pour déclencher la détection (OnPush)
   */
  constructor(
    private route: ActivatedRoute,
    private hotelService: HotelService,
    private cdr: ChangeDetectorRef,
  ) {}

  // ==========================================================================
  // CYCLE DE VIE
  // ==========================================================================

  /**
   * Initialisation du composant
   * Récupère l'ID de l'hôtel depuis la route parente et charge les données
   */
  ngOnInit() {
    // Récupérer l'ID depuis la route parente (composant Hotel)
    const hotelId = +this.route.parent?.snapshot.params['hotelId'];

    if (hotelId) {
      this.loadHotel(hotelId);
    }
  }

  // ==========================================================================
  // MÉTHODES - CHARGEMENT DES DONNÉES
  // ==========================================================================

  /**
   * Charge les détails de l'hôtel depuis l'API
   * @param {number} hotelId - ID de l'hôtel à charger
   */
  loadHotel(hotelId: number) {
    this.hotelService.getHotelDetails(hotelId).subscribe({
      next: (response) => {
        this.hotel = response.data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ==========================================================================
  // MÉTHODES - FILTRAGE DES ÉQUIPEMENTS
  // ==========================================================================

  /**
   * Filtre les équipements par catégorie
   * @param {string} category - Catégorie à filtrer (general, sport, service)
   * @returns {Array} Liste des équipements de la catégorie
   */
  getAmenitiesByCategory(category: string) {
    return this.amenities.filter((a) => a.category === category);
  }
}

// ============================================================================
// FICHIER : hotel-description.component.ts
// DESCRIPTION : Composant affichant la description detaillee d'un hotel
//               Informations principales, description et coordonnees
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// SERVICES INJECTES :
//   - HotelService : Recuperation des details de l'hotel
//   - ActivatedRoute : Recuperation de l'ID hotel depuis l'URL parente
// FONCTIONNALITES :
//   - Affichage du nom, localisation, etoiles
//   - Affichage du nombre de chambres et note moyenne
//   - Affichage de la description textuelle
//   - Affichage des coordonnees (email, telephone)
//   - Indicateur de chargement
// OPTIMISATION :
//   - ChangeDetectionStrategy.OnPush pour ameliorer les performances
// NOTE :
//   Ce composant est un enfant du composant Hotel (route parente)
//   L'ID de l'hotel est recupere depuis route.parent.snapshot.params
// ============================================================================

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HotelService } from '../../services/hotel';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-hotel-description',
  imports: [CommonModule, TranslateModule],
  templateUrl: './hotel-description.html',
  styleUrl: './hotel-description.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HotelDescription implements OnInit {
  
  // ==========================================================================
  // PROPRIETES - DONNEES
  // ==========================================================================

  /** Details de l'hotel charge */
  hotel: any = null;
  
  /** Indicateur de chargement */
  loading: boolean = true;
  
  // ==========================================================================
  // CONSTRUCTEUR
  // ==========================================================================

  /**
   * Injection des dependances
   * @param {ActivatedRoute} route - Route active pour recuperer les parametres
   * @param {HotelService} hotelService - Service de gestion des hotels
   * @param {ChangeDetectorRef} cdr - Reference pour declencher la detection (OnPush)
   */
  constructor(
    private route: ActivatedRoute,
    private hotelService: HotelService,
    private cdr: ChangeDetectorRef
  ) {}
  
  // ==========================================================================
  // CYCLE DE VIE
  // ==========================================================================

  /**
   * Initialisation du composant
   * Recupere l'ID de l'hotel depuis la route parente et charge les donnees
   */
  ngOnInit() {
    // Recuperer l'ID depuis la route parente (composant Hotel)
    const hotelId = +this.route.parent?.snapshot.params['hotelId'];
    
    if (hotelId) {
      this.loadHotel(hotelId);
    }
  }
  
  // ==========================================================================
  // METHODES - CHARGEMENT DES DONNEES
  // ==========================================================================

  /**
   * Charge les details de l'hotel depuis l'API
   * @param {number} hotelId - ID de l'hotel a charger
   */
  loadHotel(hotelId: number) {
    this.hotelService.getHotelDetails(hotelId).subscribe({
      // Succes : stocker les donnees et declencher la detection
      next: (response) => {
        this.hotel = response.data;
        this.loading = false;
        this.cdr.markForCheck(); // Necessaire avec OnPush
      },
      // Erreur : logger et declencher la detection
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
        this.cdr.markForCheck(); // Necessaire avec OnPush
      }
    });
  }
}
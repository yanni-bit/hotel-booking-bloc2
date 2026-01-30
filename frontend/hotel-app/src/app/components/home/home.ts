// ============================================================================
// FICHIER : home.component.ts
// DESCRIPTION : Composant page d'accueil (landing page)
//               Assemblage des sections principales du site
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// SERVICES INJECTÉS :
//   - HotelService : Chargement des hôtels (préchargement pour les sections)
// COMPOSANTS ENFANTS IMPORTÉS :
//   - Carousel : Carrousel d'images avec formulaire de recherche
//   - Offres : Section des dernières offres promotionnelles
//   - Destinations : Section des meilleures destinations
//   - Criteres : Section des critères de sélection
// FONCTIONNALITÉS :
//   - Préchargement des hôtels au démarrage
//   - Composition de la page à partir des composants enfants
// ============================================================================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotelService } from '../../services/hotel';
import { ChangeDetectorRef } from '@angular/core';
import { Carousel } from '../carousel/carousel';
import { Offres } from '../offres/offres';
import { Destinations } from '../destinations/destinations';
import { Criteres } from '../criteres/criteres';

@Component({
  selector: 'app-home',
  imports: [CommonModule, Carousel, Offres, Destinations, Criteres],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  // ==========================================================================
  // PROPRIÉTÉS - DONNÉES
  // ==========================================================================

  /** Liste des hôtels chargés depuis l'API */
  hotels: any[] = [];

  /** Indicateur de chargement */
  loading: boolean = true;

  /** Message d'erreur en cas de problème */
  error: string = '';

  // ==========================================================================
  // CONSTRUCTEUR
  // ==========================================================================

  /**
   * Injection des dépendances
   * @param {HotelService} hotelService - Service de gestion des hôtels
   * @param {ChangeDetectorRef} cdr - Référence pour déclencher la détection de changements
   */
  constructor(
    private hotelService: HotelService,
    private cdr: ChangeDetectorRef,
  ) {}

  // ==========================================================================
  // CYCLE DE VIE
  // ==========================================================================

  /**
   * Initialisation du composant
   * Lance le chargement des hôtels
   */
  ngOnInit() {
    this.loadHotels();
  }

  // ==========================================================================
  // MÉTHODES - CHARGEMENT DES DONNÉES
  // ==========================================================================

  /**
   * Charge la liste des hôtels depuis l'API
   * Les données peuvent être utilisées par les composants enfants
   *
   * Processus :
   * 1. Appel API via HotelService.getAllHotels()
   * 2. Stockage des données dans this.hotels
   * 3. Mise à jour de l'état loading
   * 4. Déclenchement de la détection de changements
   */
  loadHotels() {
    this.hotelService.getAllHotels().subscribe({
      // Succès : stocker les hôtels
      next: (response) => {
        console.log('Données reçues:', response);
        this.hotels = response.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      // Erreur : afficher le message
      error: (err) => {
        console.error('Erreur:', err);
        this.error = 'Erreur lors du chargement des hôtels';
        this.loading = false;
      },
    });
  }
}

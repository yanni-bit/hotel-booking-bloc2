// ============================================================================
// FICHIER : carousel.component.ts
// DESCRIPTION : Composant carrousel d'images avec formulaire de recherche
//               d'hôtels en overlay - Page d'accueil
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// SERVICES INJECTÉS :
//   - HotelService : Récupération des villes disponibles
// FONCTIONNALITÉS :
//   - Carrousel d'images avec défilement automatique (5s)
//   - Navigation manuelle (flèches, dots)
//   - Formulaire de recherche avec validation temps réel (Critère C2.b)
//   - Chargement dynamique des villes
//   - Redirection vers la page des hôtels avec filtres
// ACCESSIBILITÉ :
//   - Attributs ARIA pour la navigation
//   - Focus visible pour navigation clavier
//   - Messages d'erreur avec role="alert"
// ============================================================================

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HotelService } from '../../services/hotel';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss',
})
export class Carousel implements OnInit, OnDestroy {
  // ==========================================================================
  // PROPRIÉTÉS - CARROUSEL
  // ==========================================================================

  /** Index de la slide actuellement affichée */
  currentSlide = 0;

  /** Référence de l'intervalle pour le défilement automatique */
  autoSlideInterval: any;

  // ==========================================================================
  // PROPRIÉTÉS - DONNÉES
  // ==========================================================================

  /** Liste des villes disponibles (chargées depuis l'API) */
  cities: string[] = [];

  // ==========================================================================
  // PROPRIÉTÉS - FORMULAIRE DE RECHERCHE
  // ==========================================================================

  /** Ville sélectionnée */
  selectedCity: string = '';

  /** Date d'arrivée */
  checkinDate: string = '';

  /** Date de départ */
  checkoutDate: string = '';

  /** Nombre de chambres */
  rooms: number = 1;

  /** Nombre d'adultes */
  adults: number = 2;

  /** Nombre d'enfants */
  children: number = 0;

  /** Date minimum pour les inputs date (aujourd'hui) */
  minDate: string = '';

  // ==========================================================================
  // PROPRIÉTÉS - VALIDATION (Critère C2.b)
  // ==========================================================================

  /**
   * Messages d'erreur pour chaque champ
   * Affichés uniquement si le champ est "touched" et invalide
   */
  errors = {
    city: '',
    checkin: '',
    checkout: '',
    adults: '',
  };

  /**
   * État "touched" des champs
   * True après interaction utilisateur (change ou blur)
   */
  touched = {
    city: false,
    checkin: false,
    checkout: false,
    adults: false,
  };

  // ==========================================================================
  // PROPRIÉTÉS - CONFIGURATION DES SLIDES
  // ==========================================================================

  /**
   * Liste des slides du carrousel
   * @property {string} image - Chemin de l'image
   * @property {string} alt - Texte alternatif pour accessibilité
   */
  slides = [
    {
      image: 'images/slide-1.jpg',
      alt: 'Hotel de luxe 1',
    },
    {
      image: 'images/slide-2.jpg',
      alt: 'Hotel de luxe 2',
    },
    {
      image: 'images/slide-3.jpg',
      alt: 'Hotel de luxe 3',
    },
  ];

  // ==========================================================================
  // CONSTRUCTEUR
  // ==========================================================================

  /**
   * Injection des dépendances
   * @param {ChangeDetectorRef} cdr - Référence pour la détection de changements
   * @param {HotelService} hotelService - Service de gestion des hôtels
   * @param {Router} router - Service de navigation
   */
  constructor(
    private cdr: ChangeDetectorRef,
    private hotelService: HotelService,
    private router: Router,
  ) {}

  // ==========================================================================
  // CYCLE DE VIE
  // ==========================================================================

  /**
   * Initialisation du composant
   * - Démarre le défilement automatique
   * - Charge la liste des villes
   * - Définit la date minimum
   */
  ngOnInit() {
    this.startAutoSlide();
    this.loadCities();
    this.setMinDate();
  }

  /**
   * Destruction du composant
   * Arrête le défilement automatique pour éviter les fuites mémoire
   */
  ngOnDestroy() {
    this.stopAutoSlide();
  }

  // ==========================================================================
  // MÉTHODES - CHARGEMENT DES DONNÉES
  // ==========================================================================

  /**
   * Charge la liste des villes depuis l'API
   */
  loadCities() {
    this.hotelService.getCities().subscribe({
      next: (response) => {
        if (response.success) {
          this.cities = response.data;
        }
      },
      error: (err) => {
        console.error('Erreur chargement villes:', err);
      },
    });
  }

  /**
   * Définit la date minimum (aujourd'hui) pour les inputs date
   */
  setMinDate() {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  // ==========================================================================
  // MÉTHODES - VALIDATION EN TEMPS RÉEL (Critère C2.b)
  // Validation des saisies utilisateurs avec feedback visuel
  // ==========================================================================

  /**
   * Validation de la ville sélectionnée
   * Erreur si aucune ville n'est sélectionnée
   */
  validateCity() {
    this.touched.city = true;
    if (!this.selectedCity) {
      this.errors.city = 'Veuillez sélectionner une destination';
    } else {
      this.errors.city = '';
    }
  }

  /**
   * Validation de la date d'arrivée
   * Erreurs possibles :
   * - Champ vide
   * - Date dans le passé
   */
  validateCheckin() {
    this.touched.checkin = true;
    if (!this.checkinDate) {
      this.errors.checkin = "Veuillez sélectionner une date d'arrivée";
    } else if (this.checkinDate < this.minDate) {
      this.errors.checkin = 'La date ne peut pas être dans le passé';
    } else {
      this.errors.checkin = '';
    }
    // Re-valider checkout si checkin change (dépendance)
    if (this.checkoutDate) {
      this.validateCheckout();
    }
  }

  /**
   * Validation de la date de départ
   * Erreurs possibles :
   * - Champ vide
   * - Date antérieure ou égale à l'arrivée
   */
  validateCheckout() {
    this.touched.checkout = true;
    if (!this.checkoutDate) {
      this.errors.checkout = 'Veuillez sélectionner une date de départ';
    } else if (this.checkinDate && this.checkoutDate <= this.checkinDate) {
      this.errors.checkout = "La date de départ doit être après l'arrivée";
    } else {
      this.errors.checkout = '';
    }
  }

  /**
   * Validation du nombre d'adultes
   * Contraintes : minimum 1, maximum 20
   */
  validateAdults() {
    this.touched.adults = true;
    if (!this.adults || this.adults < 1) {
      this.errors.adults = 'Minimum 1 adulte requis';
      this.adults = 1;
    } else if (this.adults > 20) {
      this.errors.adults = 'Maximum 20 adultes';
      this.adults = 20;
    } else {
      this.errors.adults = '';
    }
  }

  /**
   * Validation du nombre de chambres
   * Contraintes : minimum 1, maximum 10
   */
  validateRooms() {
    if (this.rooms < 1) {
      this.rooms = 1;
    } else if (this.rooms > 10) {
      this.rooms = 10;
    }
  }

  /**
   * Validation du nombre d'enfants
   * Contraintes : minimum 0, maximum 10
   */
  validateChildren() {
    if (this.children < 0) {
      this.children = 0;
    } else if (this.children > 10) {
      this.children = 10;
    }
  }

  /**
   * Vérifie si le formulaire est valide
   * @returns {boolean} True si tous les champs requis sont valides
   */
  isFormValid(): boolean {
    return (
      !this.errors.city &&
      !this.errors.checkin &&
      !this.errors.checkout &&
      !this.errors.adults &&
      !!this.selectedCity
    );
  }

  // ==========================================================================
  // MÉTHODES - SOUMISSION DE LA RECHERCHE
  // ==========================================================================

  /**
   * Lance la recherche d'hôtels
   * - Valide tous les champs
   * - Construit les query params
   * - Redirige vers la page des hôtels
   */
  onSearch() {
    console.log('🔍 onSearch() appelé');
    console.log('Valeurs:', {
      city: this.selectedCity,
      checkin: this.checkinDate,
      checkout: this.checkoutDate,
      rooms: this.rooms,
      adults: this.adults,
      children: this.children,
    });

    // -------------------------------------------------------------------------
    // Marquer tous les champs comme touchés (affiche les erreurs)
    // -------------------------------------------------------------------------
    this.touched.city = true;
    this.touched.checkin = true;
    this.touched.checkout = true;
    this.touched.adults = true;

    // -------------------------------------------------------------------------
    // Valider tous les champs
    // -------------------------------------------------------------------------
    this.validateCity();
    this.validateCheckin();
    this.validateCheckout();
    this.validateAdults();

    console.log('Erreurs:', this.errors);
    console.log('isFormValid:', this.isFormValid());

    // Vérifier si le formulaire est valide
    if (!this.isFormValid()) {
      console.log('❌ Formulaire invalide, arrêt');
      return;
    }

    console.log('✅ Formulaire valide, redirection...');

    // -------------------------------------------------------------------------
    // Construire les query params pour la navigation
    // -------------------------------------------------------------------------
    const queryParams: any = {
      city: this.selectedCity,
    };

    if (this.checkinDate) {
      queryParams.checkin = this.checkinDate;
    }
    if (this.checkoutDate) {
      queryParams.checkout = this.checkoutDate;
    }
    if (this.rooms) {
      queryParams.rooms = this.rooms;
    }
    if (this.adults) {
      queryParams.adults = this.adults;
    }
    if (this.children) {
      queryParams.children = this.children;
    }

    // Rediriger vers la page des hôtels avec les filtres
    this.router.navigate(['/hotels', this.selectedCity], { queryParams });
  }

  // ==========================================================================
  // MÉTHODES - NAVIGATION DU CARROUSEL
  // ==========================================================================

  /**
   * Démarre le défilement automatique (toutes les 5 secondes)
   */
  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  /**
   * Arrête le défilement automatique
   */
  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  /**
   * Passe à la slide suivante (cyclique)
   */
  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.cdr.detectChanges();
  }

  /**
   * Passe à la slide précédente (cyclique)
   */
  previousSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
    this.cdr.detectChanges();
  }

  /**
   * Navigue vers une slide spécifique
   * Réinitialise le timer du défilement automatique
   * @param {number} index - Index de la slide cible
   */
  goToSlide(index: number) {
    this.currentSlide = index;
    this.stopAutoSlide();
    this.startAutoSlide();
    this.cdr.detectChanges();
  }
}

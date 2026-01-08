import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HotelService } from '../../services/hotel';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss'
})
export class Carousel implements OnInit, OnDestroy {

  currentSlide = 0;
  autoSlideInterval: any;

  // Liste des villes disponibles
  cities: string[] = [];

  // Champs du formulaire de recherche
  selectedCity: string = '';
  checkinDate: string = '';
  checkoutDate: string = '';
  rooms: number = 1;
  adults: number = 2;
  children: number = 0;

  // Date minimum (aujourd'hui)
  minDate: string = '';

  // États de validation (pour feedback visuel)
  errors = {
    city: '',
    checkin: '',
    checkout: '',
    adults: ''
  };

  // Champs touchés (pour afficher erreurs après interaction)
  touched = {
    city: false,
    checkin: false,
    checkout: false,
    adults: false
  };

  slides = [
    {
      image: 'images/slide-1.jpg',
      alt: 'Hotel de luxe 1'
    },
    {
      image: 'images/slide-2.jpg',
      alt: 'Hotel de luxe 2'
    },
    {
      image: 'images/slide-3.jpg',
      alt: 'Hotel de luxe 3'
    }
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private hotelService: HotelService,
    private router: Router
  ) { }

  ngOnInit() {
    this.startAutoSlide();
    this.loadCities();
    this.setMinDate();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  // Charger les villes depuis l'API
  loadCities() {
    this.hotelService.getCities().subscribe({
      next: (response) => {
        if (response.success) {
          this.cities = response.data;
        }
      },
      error: (err) => {
        console.error('Erreur chargement villes:', err);
      }
    });
  }

  // Définir la date minimum (aujourd'hui)
  setMinDate() {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  // ========================================
  // VALIDATION EN TEMPS RÉEL (Critère C2.b)
  // ========================================

  // Validation de la ville
  validateCity() {
    this.touched.city = true;
    if (!this.selectedCity) {
      this.errors.city = 'Veuillez sélectionner une destination';
    } else {
      this.errors.city = '';
    }
  }

  // Validation du check-in
  validateCheckin() {
    this.touched.checkin = true;
    if (!this.checkinDate) {
      this.errors.checkin = 'Veuillez sélectionner une date d\'arrivée';
    } else if (this.checkinDate < this.minDate) {
      this.errors.checkin = 'La date ne peut pas être dans le passé';
    } else {
      this.errors.checkin = '';
    }
    // Re-valider checkout si checkin change
    if (this.checkoutDate) {
      this.validateCheckout();
    }
  }

  // Validation du check-out
  validateCheckout() {
    this.touched.checkout = true;
    if (!this.checkoutDate) {
      this.errors.checkout = 'Veuillez sélectionner une date de départ';
    } else if (this.checkinDate && this.checkoutDate <= this.checkinDate) {
      this.errors.checkout = 'La date de départ doit être après l\'arrivée';
    } else {
      this.errors.checkout = '';
    }
  }

  // Validation du nombre d'adultes
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

  // Validation des chambres
  validateRooms() {
    if (this.rooms < 1) {
      this.rooms = 1;
    } else if (this.rooms > 10) {
      this.rooms = 10;
    }
  }

  // Validation des enfants
  validateChildren() {
    if (this.children < 0) {
      this.children = 0;
    } else if (this.children > 10) {
      this.children = 10;
    }
  }

  // Vérifier si le formulaire est valide
  isFormValid(): boolean {
    return !this.errors.city &&
      !this.errors.checkin &&
      !this.errors.checkout &&
      !this.errors.adults &&
      !!this.selectedCity;
  }

  // Rechercher les hôtels
  onSearch() {
    console.log('🔍 onSearch() appelé');
    console.log('Valeurs:', {
      city: this.selectedCity,
      checkin: this.checkinDate,
      checkout: this.checkoutDate,
      rooms: this.rooms,
      adults: this.adults,
      children: this.children
    });

    // Marquer tous les champs comme touchés
    this.touched.city = true;
    this.touched.checkin = true;
    this.touched.checkout = true;
    this.touched.adults = true;

    // Valider tous les champs
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

    // Construire les query params
    const queryParams: any = {
      city: this.selectedCity
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

  // Défilement automatique
  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  // Navigation
  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.cdr.detectChanges();
  }

  previousSlide() {
    this.currentSlide = this.currentSlide === 0
      ? this.slides.length - 1
      : this.currentSlide - 1;
    this.cdr.detectChanges();
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.stopAutoSlide();
    this.startAutoSlide();
    this.cdr.detectChanges();
  }
}
// ============================================================================
// FICHIER : booking.component.ts
// DESCRIPTION : Composant de réservation - Formulaire complet pour réserver
//               une offre d'hôtel avec services additionnels
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// STRATÉGIE : OnPush pour optimisation des performances
// SERVICES INJECTÉS :
//   - ReservationService : Gestion des offres et réservations
//   - AuthService : Vérification utilisateur connecté
// FONCTIONNALITÉS :
//   - Chargement des détails de l'offre
//   - Sélection des dates (check-in/check-out)
//   - Formulaire informations client
//   - Sélection des services additionnels
//   - Calcul dynamique du prix total
//   - Création de réservation et redirection vers paiement
// ============================================================================

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencyPipe } from '../../pipes/currency.pipe';

@Component({
  selector: 'app-booking',
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule, CurrencyPipe],
  templateUrl: './booking.html',
  styleUrl: './booking.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Booking implements OnInit {
  // ==========================================================================
  // PROPRIÉTÉS - DONNÉES OFFRE
  // ==========================================================================

  /** ID de l'offre (depuis l'URL) */
  offreId: number = 0;

  /** Détails de l'offre */
  offre: any = null;

  /** Indicateur de chargement */
  loading: boolean = true;

  /** Message d'erreur */
  error: string = '';

  // ==========================================================================
  // PROPRIÉTÉS - DONNÉES DE RÉSERVATION
  // ==========================================================================

  /** Date d'arrivée (format YYYY-MM-DD) */
  checkIn: string = '';

  /** Date de départ (format YYYY-MM-DD) */
  checkOut: string = '';

  /** Nombre de nuits calculé */
  nbreNuits: number = 0;

  /** Nombre d'adultes */
  nbreAdults: number = 2;

  /** Nombre d'enfants */
  nbreChildren: number = 0;

  // ==========================================================================
  // PROPRIÉTÉS - DONNÉES CLIENT
  // ==========================================================================

  /** Prénom du client */
  prenom: string = '';

  /** Nom du client */
  nom: string = '';

  /** Email du client */
  email: string = '';

  /** Téléphone du client */
  telephone: string = '';

  /** Demandes spéciales */
  specialRequests: string = '';

  // ==========================================================================
  // PROPRIÉTÉS - PRIX
  // ==========================================================================

  /** Prix total de la réservation (chambre + services) */
  prixTotal: number = 0;

  // ==========================================================================
  // PROPRIÉTÉS - ÉTATS
  // ==========================================================================

  /** Indicateur de soumission en cours */
  submitting: boolean = false;

  /** Numéro de confirmation généré */
  confirmationNumber: string = '';

  /** Indicateur de succès de la réservation */
  bookingSuccess: boolean = false;

  // ==========================================================================
  // PROPRIÉTÉS - SERVICES ADDITIONNELS
  // ==========================================================================

  /** Liste des services disponibles pour l'hôtel */
  servicesDisponibles: any[] = [];

  /** Liste des services sélectionnés par le client */
  servicesSelectionnes: any[] = [];

  /** Prix total des services sélectionnés */
  prixServices: number = 0;

  // ==========================================================================
  // CONSTRUCTEUR
  // ==========================================================================

  /**
   * Injection des dépendances
   * @param {ActivatedRoute} route - Accès aux paramètres de route
   * @param {Router} router - Navigation programmatique
   * @param {ReservationService} reservationService - Service de réservation
   * @param {AuthService} authService - Service d'authentification
   * @param {ChangeDetectorRef} cdr - Référence pour la détection de changements
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  // ==========================================================================
  // CYCLE DE VIE
  // ==========================================================================

  /**
   * Initialisation du composant
   * - Récupère l'ID de l'offre depuis l'URL
   * - Initialise les dates par défaut (aujourd'hui → demain)
   * - Charge l'offre
   */
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.offreId = +params['offreId'];
      this.loadOffre();
    });

    // Date minimum = aujourd'hui
    const today = new Date();
    this.checkIn = this.formatDate(today);

    // Date checkout = demain
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.checkOut = this.formatDate(tomorrow);

    this.calculateNights();
  }

  // ==========================================================================
  // MÉTHODES - CHARGEMENT DES DONNÉES
  // ==========================================================================

  /**
   * Charge les détails de l'offre depuis l'API
   */
  loadOffre() {
    this.loading = true;

    this.reservationService.getOffreDetails(this.offreId).subscribe({
      next: (response) => {
        this.offre = response.data;
        this.loading = false;
        this.calculateTotal();

        // Charger les services de l'hôtel
        this.loadServices(this.offre.id_hotel);

        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.error = "Erreur lors du chargement de l'offre";
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Charge les services additionnels disponibles pour l'hôtel
   * Marque automatiquement les services inclus dans l'offre
   * @param {number} hotelId - ID de l'hôtel
   */
  loadServices(hotelId: number) {
    this.reservationService.getHotelServices(hotelId).subscribe({
      next: (response) => {
        let services = response.data;

        // =====================================================================
        // Marquer les services déjà inclus dans l'offre
        // (ex: petit-déjeuner inclus selon le type de pension)
        // =====================================================================
        services = services.map((s: any) => {
          // Vérifier si le petit-déjeuner est inclus
          if (s.id_service === 2) {
            if (
              this.offre.petit_dejeuner_inclus ||
              this.offre.pension === 'breakfast' ||
              this.offre.pension === 'half_board' ||
              this.offre.pension === 'full_board' ||
              this.offre.pension === 'all_inclusive'
            ) {
              s.inclus = true;
            }
          }
          return s;
        });

        this.servicesDisponibles = services;
        console.log('✅ Services disponibles (avec inclus):', this.servicesDisponibles);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur services:', err);
      },
    });
  }

  // ==========================================================================
  // MÉTHODES - GESTION DES SERVICES
  // ==========================================================================

  /**
   * Gère la sélection/désélection d'un service
   * @param {any} service - Service à ajouter/retirer
   * @param {any} event - Événement checkbox
   */
  onServiceChange(service: any, event: any) {
    if (event.target.checked) {
      // Ajouter le service à la liste
      this.servicesSelectionnes.push({
        id_hotel_service: service.id_hotel_service,
        nom_service: service.nom_service,
        prix_service: service.prix_service,
        type_service: service.type_service,
        quantite: 1,
      });
    } else {
      // Retirer le service de la liste
      const index = this.servicesSelectionnes.findIndex(
        (s) => s.id_hotel_service === service.id_hotel_service,
      );
      if (index > -1) {
        this.servicesSelectionnes.splice(index, 1);
      }
    }

    this.calculatePrixServices();
  }

  /**
   * Calcule le prix total des services sélectionnés
   * Prend en compte le type de tarification :
   * - journalier : prix × nombre de nuits
   * - par_personne : prix × nuits × adultes
   * - sejour/unitaire : prix fixe
   */
  calculatePrixServices() {
    this.prixServices = this.servicesSelectionnes.reduce((total, service) => {
      let prixService = parseFloat(service.prix_service) || 0;

      // Calcul selon le type de tarification
      if (service.type_service === 'journalier') {
        prixService *= this.nbreNuits;
      } else if (service.type_service === 'par_personne') {
        prixService *= this.nbreNuits * this.nbreAdults;
      }
      // 'sejour' et 'unitaire' = prix fixe

      return total + prixService;
    }, 0);

    this.calculateTotal();
  }

  // ==========================================================================
  // MÉTHODES - CALCULS
  // ==========================================================================

  /**
   * Formate une date au format YYYY-MM-DD pour les inputs date
   * @param {Date} date - Date à formater
   * @returns {string} Date formatée
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Calcule le nombre de nuits entre check-in et check-out
   */
  calculateNights() {
    if (this.checkIn && this.checkOut) {
      const start = new Date(this.checkIn);
      const end = new Date(this.checkOut);
      const diff = end.getTime() - start.getTime();
      this.nbreNuits = Math.ceil(diff / (1000 * 60 * 60 * 24));

      if (this.nbreNuits < 1) {
        this.nbreNuits = 1;
      }

      this.calculatePrixServices();
    }
  }

  /**
   * Calcule le prix total de la réservation
   * Prix total = (prix/nuit × nuits) + services
   */
  calculateTotal() {
    if (this.offre && this.nbreNuits > 0) {
      const prixNuit = parseFloat(this.offre.prix_nuit) || 0;
      const prixChambre = prixNuit * this.nbreNuits;
      this.prixTotal = prixChambre + this.prixServices;
      this.cdr.markForCheck();
    }
  }

  /**
   * Handler pour le changement de date d'arrivée
   */
  onCheckInChange() {
    this.calculateNights();
  }

  /**
   * Handler pour le changement de date de départ
   */
  onCheckOutChange() {
    this.calculateNights();
  }

  // ==========================================================================
  // MÉTHODES - SOUMISSION DE LA RÉSERVATION
  // ==========================================================================

  /**
   * Crée la réservation en "En attente" et redirige vers le paiement
   * Vérifie l'authentification et la validité des données
   */
  confirmBooking() {
    // -------------------------------------------------------------------------
    // Vérifier si l'utilisateur est connecté
    // -------------------------------------------------------------------------
    const user = this.authService.currentUser();

    if (!user) {
      alert('Vous devez être connecté pour réserver');
      this.router.navigate(['/login']);
      return;
    }

    // -------------------------------------------------------------------------
    // Validation des champs obligatoires
    // -------------------------------------------------------------------------
    if (!this.prenom || !this.nom || !this.email || !this.telephone) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!this.checkIn || !this.checkOut || this.nbreNuits < 1) {
      alert('Veuillez sélectionner des dates valides');
      return;
    }

    this.submitting = true;
    this.cdr.markForCheck();

    // -------------------------------------------------------------------------
    // Préparer les données de réservation
    // -------------------------------------------------------------------------
    const reservationData = {
      id_user: user.id_user,
      id_offre: this.offreId,
      id_hotel: this.offre.id_hotel,
      id_chambre: this.offre.id_chambre,
      check_in: this.checkIn,
      check_out: this.checkOut,
      nbre_nuits: this.nbreNuits,
      nbre_adults: this.nbreAdults,
      nbre_children: this.nbreChildren,
      prix_nuit: this.offre.prix_nuit,
      total_price: this.prixTotal,
      devise: this.offre.devise || 'EUR',
      special_requests: this.specialRequests,
      client_prenom: this.prenom,
      client_nom: this.nom,
      client_email: this.email,
      client_telephone: this.telephone,
      services: this.servicesSelectionnes,
      id_statut: 1, // Statut "En attente" - paiement non effectué
    };

    console.log('📦 Création réservation (En attente):', reservationData);

    // -------------------------------------------------------------------------
    // Créer la réservation en base de données
    // -------------------------------------------------------------------------
    this.reservationService.createReservation(reservationData).subscribe({
      next: (response) => {
        console.log('✅ Réservation créée:', response);

        const reservationId = response.data.id_reservation || response.data.id;
        console.log('🔑 Reservation ID:', reservationId);
        this.confirmationNumber = response.data.num_confirmation;

        // Rediriger vers la page de paiement avec l'ID de la réservation
        this.router.navigate(['/payment', this.offreId], {
          queryParams: { reservationId: reservationId },
        });
      },
      error: (err) => {
        console.error('❌ Erreur réservation:', err);
        alert('Erreur lors de la création de la réservation. Veuillez réessayer.');
        this.submitting = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ==========================================================================
  // MÉTHODES - UTILITAIRES D'AFFICHAGE
  // ==========================================================================

  /**
   * Retourne l'icône Bootstrap correspondant au service
   * @param {string} nomService - Nom du service
   * @returns {string} Classe CSS de l'icône
   */
  getServiceIcon(nomService: string): string {
    const icons: any = {
      'Parking privé': 'bi-p-circle',
      'Petit-déjeuner': 'bi-cup-hot',
      'Accès spa': 'bi-droplet',
      'Transfert aéroport': 'bi-taxi-front',
      'Départ tardif': 'bi-clock-history',
    };
    return icons[nomService] || 'bi-star';
  }

  /**
   * Calcule le prix d'un service selon son type
   * @param {any} service - Service à calculer
   * @returns {string} Prix formaté avec 2 décimales
   */
  calculateServicePrice(service: any): string {
    let prix = parseFloat(service.prix_service) || 0;

    if (service.type_service === 'journalier') {
      prix *= this.nbreNuits;
    } else if (service.type_service === 'par_personne') {
      prix *= this.nbreNuits * this.nbreAdults;
    }

    return prix.toFixed(2);
  }

  // ==========================================================================
  // PROPRIÉTÉS CALCULÉES - DATES MINIMUM
  // ==========================================================================

  /**
   * Date minimum pour le check-in (aujourd'hui)
   * @returns {string} Date formatée YYYY-MM-DD
   */
  get minCheckIn(): string {
    return this.formatDate(new Date());
  }

  /**
   * Date minimum pour le check-out (lendemain du check-in)
   * @returns {string} Date formatée YYYY-MM-DD
   */
  get minCheckOut(): string {
    if (this.checkIn) {
      const checkInDate = new Date(this.checkIn);
      checkInDate.setDate(checkInDate.getDate() + 1);
      return this.formatDate(checkInDate);
    }
    return this.minCheckIn;
  }
}

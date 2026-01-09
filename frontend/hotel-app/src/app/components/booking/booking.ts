import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-booking',
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './booking.html',
  styleUrl: './booking.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Booking implements OnInit {

  offreId: number = 0;
  offre: any = null;
  loading: boolean = true;
  error: string = '';

  // Données de réservation
  checkIn: string = '';
  checkOut: string = '';
  nbreNuits: number = 0;
  nbreAdults: number = 2;
  nbreChildren: number = 0;

  // Données client
  prenom: string = '';
  nom: string = '';
  email: string = '';
  telephone: string = '';
  specialRequests: string = '';

  // Prix
  prixTotal: number = 0;

  // États
  submitting: boolean = false;
  confirmationNumber: string = '';
  bookingSuccess: boolean = false;

  // Services additionnels
  servicesDisponibles: any[] = [];
  servicesSelectionnes: any[] = [];
  prixServices: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
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
        this.error = 'Erreur lors du chargement de l\'offre';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadServices(hotelId: number) {
    this.reservationService.getHotelServices(hotelId).subscribe({
      next: (response) => {
        let services = response.data;

        // Marquer les services déjà inclus dans l'offre
        services = services.map((s: any) => {
          // Vérifier si le petit-déjeuner est inclus
          if (s.id_service === 2) {
            if (this.offre.petit_dejeuner_inclus ||
              this.offre.pension === 'breakfast' ||
              this.offre.pension === 'half_board' ||
              this.offre.pension === 'full_board' ||
              this.offre.pension === 'all_inclusive') {
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
      }
    });
  }

  onServiceChange(service: any, event: any) {
    if (event.target.checked) {
      // Ajouter le service
      this.servicesSelectionnes.push({
        id_hotel_service: service.id_hotel_service,
        nom_service: service.nom_service,
        prix_service: service.prix_service,
        type_service: service.type_service,
        quantite: 1
      });
    } else {
      // Retirer le service
      const index = this.servicesSelectionnes.findIndex(
        s => s.id_hotel_service === service.id_hotel_service
      );
      if (index > -1) {
        this.servicesSelectionnes.splice(index, 1);
      }
    }

    this.calculatePrixServices();
  }

  calculatePrixServices() {
    this.prixServices = this.servicesSelectionnes.reduce((total, service) => {
      let prixService = parseFloat(service.prix_service) || 0;

      // Calcul selon le type
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

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

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

  calculateTotal() {
    if (this.offre && this.nbreNuits > 0) {
      const prixNuit = parseFloat(this.offre.prix_nuit) || 0;
      const prixChambre = prixNuit * this.nbreNuits;
      this.prixTotal = prixChambre + this.prixServices;
      this.cdr.markForCheck();
    }
  }

  onCheckInChange() {
    this.calculateNights();
  }

  onCheckOutChange() {
    this.calculateNights();
  }

  /**
   * Crée la réservation en "En attente" et redirige vers le paiement
   */
  confirmBooking() {
    // Vérifier si l'utilisateur est connecté
    const user = this.authService.currentUser();

    if (!user) {
      alert('Vous devez être connecté pour réserver');
      this.router.navigate(['/login']);
      return;
    }

    // Validation
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

    // Préparer les données de réservation
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
      id_statut: 1  // Statut "En attente" - paiement non effectué
    };

    console.log('📦 Création réservation (En attente):', reservationData);

    // Créer la réservation en base de données
    this.reservationService.createReservation(reservationData).subscribe({
      next: (response) => {
        console.log('✅ Réservation créée:', response);

        const reservationId = response.data.id_reservation || response.data.id;
        console.log('🔑 Reservation ID:', reservationId);
        this.confirmationNumber = response.data.num_confirmation;

        // Rediriger vers la page de paiement avec l'ID de la réservation
        this.router.navigate(['/payment', this.offreId], {
          queryParams: { reservationId: reservationId }
        });
      },
      error: (err) => {
        console.error('❌ Erreur réservation:', err);
        alert('Erreur lors de la création de la réservation. Veuillez réessayer.');
        this.submitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Retourne l'icône d'un service
   */
  getServiceIcon(nomService: string): string {
    const icons: any = {
      'Parking privé': 'bi-p-circle',
      'Petit-déjeuner': 'bi-cup-hot',
      'Accès spa': 'bi-droplet',
      'Transfert aéroport': 'bi-taxi-front',
      'Départ tardif': 'bi-clock-history'
    };
    return icons[nomService] || 'bi-star';
  }

  /**
   * Calcule le prix d'un service selon son type
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

  get minCheckIn(): string {
    return this.formatDate(new Date());
  }

  get minCheckOut(): string {
    if (this.checkIn) {
      const checkInDate = new Date(this.checkIn);
      checkInDate.setDate(checkInDate.getDate() + 1);
      return this.formatDate(checkInDate);
    }
    return this.minCheckIn;
  }
}
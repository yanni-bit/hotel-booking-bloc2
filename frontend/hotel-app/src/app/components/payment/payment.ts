import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-payment',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './payment.html',
  styleUrl: './payment.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Payment implements OnInit {

  offreId: number = 0;
  reservationId: number | null = null;
  bookingData: any = null;
  offre: any = null;
  loading: boolean = true;
  error: string = '';

  // Données carte bancaire
  cardType: string = '';
  cardNumber: string = '';
  cardName: string = '';
  expirationDate: string = '';
  cvv: string = '';
  acceptConditions: boolean = false;

  // États
  submitting: boolean = false;
  confirmationNumber: string = '';
  paymentSuccess: boolean = false;
  paymentError: string = '';
  isExistingReservation: boolean = false;

  // Types de cartes disponibles
  cardTypes: string[] = ['Visa', 'MasterCard', 'American Express', 'Discover'];

  // Cartes de test acceptées avec leur CVV attendu
  private validTestCards: { [key: string]: { type: string; cvv: string } } = {
    '4111111111111111': { type: 'Visa', cvv: '123' },
    '5500000000000004': { type: 'MasterCard', cvv: '123' },
    '340000000000009': { type: 'American Express', cvv: '1234' },
    '6011000000000004': { type: 'Discover', cvv: '123' }
  };

  // Cartes de test refusées avec messages d'erreur
  private declinedTestCards: { [key: string]: string } = {
    '4000000000000002': 'Paiement refusé : fonds insuffisants',
    '4000000000000119': 'Paiement refusé : erreur de traitement',
    '4000000000000135': 'Paiement refusé : carte volée'
  };

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
    });

    this.route.queryParams.subscribe(queryParams => {
      if (queryParams['reservationId']) {
        this.reservationId = +queryParams['reservationId'];
        this.isExistingReservation = true;
        this.loadExistingReservation();
      } else {
        this.loadBookingData();
      }
    });
  }

  /**
   * Charge les données depuis une réservation existante (paiement différé)
   */
  loadExistingReservation() {
    const user = this.authService.currentUser();

    if (!user) {
      this.error = 'Utilisateur non connecté';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.reservationService.getReservationById(this.reservationId!, user.id_user).subscribe({
      next: (response) => {
        const reservation = response.data;
        
        this.bookingData = {
          id_user: reservation.id_user,
          id_offre: reservation.id_offre,
          id_hotel: reservation.id_hotel,
          id_chambre: reservation.id_chambre,
          check_in: reservation.check_in,
          check_out: reservation.check_out,
          nbre_nuits: reservation.nbre_nuits,
          nbre_adults: reservation.nbre_adults,
          nbre_children: reservation.nbre_children,
          prix_nuit: reservation.prix_nuit,
          total_price: reservation.total_price,
          devise: reservation.devise,
          special_requests: reservation.special_requests,
          client_prenom: '',
          client_nom: '',
          client_email: '',
          client_telephone: '',
          pension: reservation.pension
        };

        this.offre = {
          id_hotel: reservation.id_hotel,
          nom_hotel: reservation.nom_hotel,
          ville_hotel: reservation.ville_hotel,
          pays_hotel: reservation.pays_hotel,
          img_hotel: reservation.img_hotel,
          type_room: reservation.type_room
        };

        this.confirmationNumber = reservation.num_confirmation;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.error = 'Réservation non trouvée';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Charge les données depuis sessionStorage (nouvelle réservation)
   */
  loadBookingData() {
    const storedData = sessionStorage.getItem('pendingBooking');

    if (!storedData) {
      this.error = 'Aucune réservation en cours. Veuillez recommencer.';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    try {
      this.bookingData = JSON.parse(storedData);
      this.offre = this.bookingData.offre;
      this.loading = false;
      this.cdr.markForCheck();
    } catch (e) {
      this.error = 'Erreur lors du chargement des données.';
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Formate le numéro de carte avec des espaces tous les 4 chiffres
   */
  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '').replace(/\D/g, '');
    if (value.length > 16) {
      value = value.substring(0, 16);
    }
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.cardNumber = formatted;
    event.target.value = formatted;
    
    // Effacer l'erreur de paiement quand on modifie le numéro
    this.paymentError = '';
    this.cdr.markForCheck();
  }

  /**
   * Formate la date d'expiration MM/YY
   */
  formatExpirationDate(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.substring(0, 4);
    }
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    this.expirationDate = value;
    event.target.value = value;
    
    // Effacer l'erreur de paiement quand on modifie la date
    this.paymentError = '';
    this.cdr.markForCheck();
  }

  /**
   * Limite le CVV à 3-4 chiffres
   */
  formatCVV(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    const maxLength = this.cardType === 'American Express' ? 4 : 3;
    if (value.length > maxLength) {
      value = value.substring(0, maxLength);
    }
    this.cvv = value;
    event.target.value = value;
    
    // Effacer l'erreur de paiement quand on modifie le CVV
    this.paymentError = '';
    this.cdr.markForCheck();
  }

  /**
   * Valide le formulaire de paiement
   */
  isFormValid(): boolean {
    return (
      this.cardType !== '' &&
      this.cardNumber.replace(/\s/g, '').length >= 15 &&
      this.cardName.trim() !== '' &&
      this.expirationDate.length === 5 &&
      this.cvv.length >= 3 &&
      this.acceptConditions
    );
  }

  /**
   * Vérifie si la date d'expiration est valide (non expirée)
   */
  isExpirationDateValid(): { valid: boolean; error?: string } {
    if (this.expirationDate.length !== 5) {
      return { valid: false, error: 'Date d\'expiration invalide' };
    }

    const parts = this.expirationDate.split('/');
    const month = parseInt(parts[0], 10);
    const year = parseInt('20' + parts[1], 10);

    // Vérifier que le mois est valide (1-12)
    if (month < 1 || month > 12) {
      return { valid: false, error: 'Mois d\'expiration invalide' };
    }

    // Obtenir la date actuelle
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Vérifier si la carte est expirée
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return { valid: false, error: 'Paiement refusé : carte expirée' };
    }

    return { valid: true };
  }

  /**
   * Valide le numéro de carte bancaire
   * Retourne { valid: boolean, error?: string }
   */
  validateCard(): { valid: boolean; error?: string } {
    const cardNumberClean = this.cardNumber.replace(/\s/g, '');

    // Vérifier si c'est une carte de test refusée
    if (this.declinedTestCards[cardNumberClean]) {
      return { valid: false, error: this.declinedTestCards[cardNumberClean] };
    }

    // Vérifier si c'est une carte de test valide
    if (this.validTestCards[cardNumberClean]) {
      const testCard = this.validTestCards[cardNumberClean];
      
      // Vérifier que le type de carte correspond
      if (this.cardType !== testCard.type) {
        return { valid: false, error: `Type de carte incorrect. Cette carte est une ${testCard.type}.` };
      }
      
      // Vérifier que le CVV correspond
      if (this.cvv !== testCard.cvv) {
        return { valid: false, error: 'Paiement refusé : CVV incorrect' };
      }
      
      return { valid: true };
    }

    // Pour les autres numéros, on vérifie avec l'algorithme de Luhn
    if (!this.luhnCheck(cardNumberClean)) {
      return { valid: false, error: 'Numéro de carte invalide' };
    }

    // Vérifier le préfixe selon le type de carte sélectionné
    const prefixValid = this.validateCardPrefix(cardNumberClean);
    if (!prefixValid) {
      return { valid: false, error: 'Le numéro de carte ne correspond pas au type sélectionné' };
    }

    return { valid: true };
  }

  /**
   * Algorithme de Luhn pour valider les numéros de carte
   */
  private luhnCheck(cardNumber: string): boolean {
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Vérifie que le préfixe de la carte correspond au type sélectionné
   */
  private validateCardPrefix(cardNumber: string): boolean {
    switch (this.cardType) {
      case 'Visa':
        return cardNumber.startsWith('4');
      case 'MasterCard':
        return /^5[1-5]/.test(cardNumber) || /^2[2-7]/.test(cardNumber);
      case 'American Express':
        return /^3[47]/.test(cardNumber);
      case 'Discover':
        return cardNumber.startsWith('6011') || cardNumber.startsWith('65') || /^64[4-9]/.test(cardNumber);
      default:
        return true;
    }
  }

  /**
   * Soumet le paiement et crée/met à jour la réservation
   */
  submitPayment() {
    if (!this.isFormValid()) {
      alert('Veuillez remplir tous les champs et accepter les conditions.');
      return;
    }

    // Réinitialiser l'erreur
    this.paymentError = '';
    this.cdr.markForCheck();

    // Valider la date d'expiration
    const expirationValidation = this.isExpirationDateValid();
    if (!expirationValidation.valid) {
      this.paymentError = expirationValidation.error || 'Date d\'expiration invalide';
      this.cdr.markForCheck();
      return;
    }

    // Valider la carte
    const cardValidation = this.validateCard();
    if (!cardValidation.valid) {
      this.paymentError = cardValidation.error || 'Carte invalide';
      this.cdr.markForCheck();
      return;
    }

    this.submitting = true;
    this.cdr.markForCheck();

    // Simuler un délai de traitement du paiement
    setTimeout(() => {
      if (this.isExistingReservation) {
        this.updateExistingReservation();
      } else {
        this.processReservation();
      }
    }, 1500);
  }

  /**
   * Met à jour le statut d'une réservation existante à "Confirmée"
   */
  updateExistingReservation() {
  this.reservationService.updateReservationStatus(this.reservationId!, 2).subscribe({
    next: () => {
      console.log('✅ Réservation confirmée');
      this.paymentSuccess = true;
      this.submitting = false;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.paymentError = 'Erreur lors de la confirmation. Veuillez réessayer.';
        this.submitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Crée une nouvelle réservation après validation du paiement
   */
  processReservation() {
    const reservationData = {
      id_user: this.bookingData.id_user,
      id_offre: this.bookingData.id_offre,
      id_hotel: this.bookingData.id_hotel,
      id_chambre: this.bookingData.id_chambre,
      check_in: this.bookingData.check_in,
      check_out: this.bookingData.check_out,
      nbre_nuits: this.bookingData.nbre_nuits,
      nbre_adults: this.bookingData.nbre_adults,
      nbre_children: this.bookingData.nbre_children,
      prix_nuit: this.bookingData.prix_nuit,
      total_price: this.bookingData.total_price,
      devise: this.bookingData.devise,
      special_requests: this.bookingData.special_requests,
      client_prenom: this.bookingData.client_prenom,
      client_nom: this.bookingData.client_nom,
      client_email: this.bookingData.client_email,
      client_telephone: this.bookingData.client_telephone,
      services: this.bookingData.services || [],
      id_statut: 2
    };

    console.log('📦 Données réservation:', reservationData);

    this.reservationService.createReservation(reservationData).subscribe({
      next: (response) => {
        console.log('✅ Réservation créée:', response);
        this.confirmationNumber = response.data.num_confirmation;
        this.paymentSuccess = true;
        this.submitting = false;

        sessionStorage.removeItem('pendingBooking');

        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur réservation:', err);
        this.paymentError = 'Erreur lors de la réservation. Veuillez réessayer.';
        this.submitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Retour à l'étape précédente
   */
  goBack() {
    if (this.isExistingReservation) {
      this.router.navigate(['/reservations', this.reservationId]);
    } else {
      this.router.navigate(['/booking', this.offreId]);
    }
  }
}
/**
 * ============================================================
 * FICHIER     : payment.ts
 * COMPOSANT   : Payment
 * DESCRIPTION : Page de paiement (étape 2 du processus de réservation).
 *               Gère le formulaire de carte bancaire avec validation
 *               complète : format des champs, algorithme de Luhn,
 *               vérification du préfixe carte, date d'expiration et
 *               CVV. Supporte deux flux : nouvelle réservation (données
 *               depuis sessionStorage) et paiement différé d'une
 *               réservation existante (chargée via API). Simule le
 *               traitement du paiement avec des cartes de test.
 * AUTEUR      : Yannick
 * DATE        : 2025
 * SERVICES    : ReservationService (création/mise à jour de réservation)
 *               AuthService (récupération utilisateur connecté)
 *               ActivatedRoute (paramètres offreId, reservationId)
 *               Router (navigation retour et redirection)
 *               ChangeDetectorRef (détection manuelle OnPush)
 * PIPES       : CurrencyPipe (formatage du prix total)
 * FONCTIONNALITÉS :
 *   - Formulaire carte bancaire (type, numéro, nom, expiration, CVV)
 *   - Formatage automatique des champs (espaces, MM/AA)
 *   - Validation algorithme de Luhn + préfixe carte
 *   - Vérification date d'expiration (non expirée)
 *   - Cartes de test acceptées et refusées (simulation)
 *   - Deux flux : nouvelle réservation / paiement différé
 *   - Confirmation avec numéro de réservation
 *   - Indicateur d'étapes (01 Traveller info → 02 Payment)
 * ============================================================
 */

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencyPipe } from '../../pipes/currency.pipe';

@Component({
  selector: 'app-payment',
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule, CurrencyPipe],
  templateUrl: './payment.html',
  styleUrl: './payment.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Payment implements OnInit {
  /** ID de l'offre (depuis les paramètres de route) */
  offreId: number = 0;

  /** ID de la réservation existante (paiement différé, depuis queryParams) */
  reservationId: number | null = null;

  /** Données de la réservation en cours (formulaire étape 1 ou BDD) */
  bookingData: any = null;

  /** Informations de l'offre/hôtel pour le résumé latéral */
  offre: any = null;

  /** Indicateur de chargement initial */
  loading: boolean = true;

  /** Message d'erreur de chargement */
  error: string = '';

  // === Données du formulaire carte bancaire ===

  /** Type de carte sélectionné (Visa, MasterCard, etc.) */
  cardType: string = '';

  /** Numéro de carte formaté avec espaces */
  cardNumber: string = '';

  /** Nom du titulaire de la carte */
  cardName: string = '';

  /** Date d'expiration au format MM/AA */
  expirationDate: string = '';

  /** Code de vérification CVV (3-4 chiffres) */
  cvv: string = '';

  /** Acceptation des conditions de réservation */
  acceptConditions: boolean = false;

  // === États du processus de paiement ===

  /** Indicateur de soumission en cours */
  submitting: boolean = false;

  /** Numéro de confirmation reçu après création */
  confirmationNumber: string = '';

  /** Paiement réussi → affichage page de succès */
  paymentSuccess: boolean = false;

  /** Message d'erreur de paiement (carte refusée, etc.) */
  paymentError: string = '';

  /** true si paiement d'une réservation existante (flux différé) */
  isExistingReservation: boolean = false;

  /** Liste des types de cartes disponibles */
  cardTypes: string[] = ['Visa', 'MasterCard', 'American Express', 'Discover'];

  /**
   * Dictionnaire des cartes de test acceptées
   * Clé : numéro sans espaces → type de carte + CVV attendu
   */
  private validTestCards: { [key: string]: { type: string; cvv: string } } = {
    '4111111111111111': { type: 'Visa', cvv: '123' },
    '5500000000000004': { type: 'MasterCard', cvv: '123' },
    '340000000000009': { type: 'American Express', cvv: '1234' },
    '6011000000000004': { type: 'Discover', cvv: '123' },
  };

  /**
   * Dictionnaire des cartes de test refusées
   * Clé : numéro sans espaces → message d'erreur
   */
  private declinedTestCards: { [key: string]: string } = {
    '4000000000000002': 'Paiement refusé : fonds insuffisants',
    '4000000000000119': 'Paiement refusé : erreur de traitement',
    '4000000000000135': 'Paiement refusé : carte volée',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * Initialisation : récupère offreId depuis les params de route
   * et reservationId depuis les queryParams pour déterminer le flux
   * (nouvelle réservation ou paiement différé)
   */
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.offreId = +params['offreId'];
    });

    this.route.queryParams.subscribe((queryParams) => {
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
   * Appelle ReservationService.getReservationById() puis construit
   * bookingData et offre à partir de la réponse
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

        // Construction de bookingData depuis la réservation existante
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
          pension: reservation.pension,
        };

        // Construction des infos hôtel pour le résumé latéral
        this.offre = {
          id_hotel: reservation.id_hotel,
          nom_hotel: reservation.nom_hotel,
          ville_hotel: reservation.ville_hotel,
          pays_hotel: reservation.pays_hotel,
          img_hotel: reservation.img_hotel,
          type_room: reservation.type_room,
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
      },
    });
  }

  /**
   * Charge les données depuis sessionStorage (nouvelle réservation)
   * Les données ont été stockées par le composant Booking à l'étape 1
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
   * Limite à 16 chiffres max. Efface l'erreur de paiement à chaque saisie
   * @param event - Événement input du champ
   */
  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '').replace(/\D/g, '');
    if (value.length > 16) {
      value = value.substring(0, 16);
    }
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.cardNumber = formatted;
    event.target.value = formatted;

    this.paymentError = '';
    this.cdr.markForCheck();
  }

  /**
   * Formate la date d'expiration au format MM/AA
   * Insère automatiquement le séparateur "/" après 2 chiffres
   * @param event - Événement input du champ
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

    this.paymentError = '';
    this.cdr.markForCheck();
  }

  /**
   * Limite le CVV à 3-4 chiffres selon le type de carte
   * American Express : 4 chiffres, autres : 3 chiffres
   * @param event - Événement input du champ
   */
  formatCVV(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    const maxLength = this.cardType === 'American Express' ? 4 : 3;
    if (value.length > maxLength) {
      value = value.substring(0, maxLength);
    }
    this.cvv = value;
    event.target.value = value;

    this.paymentError = '';
    this.cdr.markForCheck();
  }

  /**
   * Vérifie que tous les champs du formulaire sont valides
   * @returns true si formulaire complet et conditions acceptées
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
   * Compare mois/année avec la date courante
   * @returns Objet { valid, error? }
   */
  isExpirationDateValid(): { valid: boolean; error?: string } {
    if (this.expirationDate.length !== 5) {
      return { valid: false, error: "Date d'expiration invalide" };
    }

    const parts = this.expirationDate.split('/');
    const month = parseInt(parts[0], 10);
    const year = parseInt('20' + parts[1], 10);

    if (month < 1 || month > 12) {
      return { valid: false, error: "Mois d'expiration invalide" };
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return { valid: false, error: 'Paiement refusé : carte expirée' };
    }

    return { valid: true };
  }

  /**
   * Validation complète du numéro de carte bancaire
   * Vérifie dans l'ordre : cartes de test refusées, cartes de test
   * valides (type + CVV), puis algorithme de Luhn + préfixe
   * @returns Objet { valid, error? }
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

      if (this.cardType !== testCard.type) {
        return {
          valid: false,
          error: `Type de carte incorrect. Cette carte est une ${testCard.type}.`,
        };
      }

      if (this.cvv !== testCard.cvv) {
        return { valid: false, error: 'Paiement refusé : CVV incorrect' };
      }

      return { valid: true };
    }

    // Validation par algorithme de Luhn pour les autres numéros
    if (!this.luhnCheck(cardNumberClean)) {
      return { valid: false, error: 'Numéro de carte invalide' };
    }

    // Vérification du préfixe selon le type sélectionné
    const prefixValid = this.validateCardPrefix(cardNumberClean);
    if (!prefixValid) {
      return { valid: false, error: 'Le numéro de carte ne correspond pas au type sélectionné' };
    }

    return { valid: true };
  }

  /**
   * Algorithme de Luhn pour valider les numéros de carte bancaire
   * Parcourt les chiffres de droite à gauche, double un chiffre sur deux
   * @param cardNumber - Numéro de carte sans espaces
   * @returns true si le numéro passe la vérification Luhn
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
   * Vérifie que le préfixe du numéro correspond au type de carte
   * Visa : commence par 4 / MasterCard : 51-55 ou 22-27
   * Amex : 34 ou 37 / Discover : 6011, 65, 644-649
   * @param cardNumber - Numéro de carte sans espaces
   * @returns true si le préfixe correspond au type sélectionné
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
        return (
          cardNumber.startsWith('6011') ||
          cardNumber.startsWith('65') ||
          /^64[4-9]/.test(cardNumber)
        );
      default:
        return true;
    }
  }

  /**
   * Soumet le paiement après validation complète du formulaire
   * Vérifie : formulaire valide → date expiration → carte valide
   * Simule un délai de traitement (1.5s) puis crée ou met à jour
   * la réservation selon le flux (nouveau ou existant)
   */
  submitPayment() {
    if (!this.isFormValid()) {
      alert('Veuillez remplir tous les champs et accepter les conditions.');
      return;
    }

    this.paymentError = '';
    this.cdr.markForCheck();

    // Valider la date d'expiration
    const expirationValidation = this.isExpirationDateValid();
    if (!expirationValidation.valid) {
      this.paymentError = expirationValidation.error || "Date d'expiration invalide";
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

    // Simuler un délai de traitement du paiement (1.5s)
    setTimeout(() => {
      if (this.isExistingReservation) {
        this.updateExistingReservation();
      } else {
        this.processReservation();
      }
    }, 1500);
  }

  /**
   * Confirme une réservation existante après paiement (statut 1 vers 2).
   *
   * Passe par payReservation(), et non par updateReservationStatus() qui est
   * réservée aux administrateurs : un client authentifié n'a pas le droit de
   * choisir un statut arbitraire. Le serveur vérifie qu'il est bien le
   * propriétaire de la réservation et qu'elle est encore en attente.
   */
  updateExistingReservation() {
    this.reservationService.payReservation(this.reservationId!).subscribe({
      next: () => {
        console.log('Réservation confirmée');
        this.paymentSuccess = true;
        this.submitting = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur confirmation:', err);
        // Le serveur renvoie un message explicite : 403 si la réservation
        // n'appartient pas au compte connecté, 409 si elle n'est plus en
        // attente de paiement.
        this.paymentError =
          err?.error?.message || 'Erreur lors de la confirmation. Veuillez réessayer.';
        this.submitting = false;
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Crée une nouvelle réservation après validation du paiement
   * Construit l'objet reservationData, appelle createReservation(),
   * stocke le numéro de confirmation et supprime le sessionStorage
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
      id_statut: 2,
    };

    console.log('📦 Données réservation:', reservationData);

    this.reservationService.createReservation(reservationData).subscribe({
      next: (response) => {
        console.log('✅ Réservation créée:', response);
        this.confirmationNumber = response.data.num_confirmation;
        this.paymentSuccess = true;
        this.submitting = false;

        // Nettoyage du sessionStorage après succès
        sessionStorage.removeItem('pendingBooking');

        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur réservation:', err);
        this.paymentError = 'Erreur lors de la réservation. Veuillez réessayer.';
        this.submitting = false;
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Retour à l'étape précédente
   * Redirige vers le détail de réservation (flux existant)
   * ou vers le formulaire booking (flux nouveau)
   */
  goBack() {
    if (this.isExistingReservation) {
      this.router.navigate(['/reservations', this.reservationId]);
    } else {
      this.router.navigate(['/booking', this.offreId]);
    }
  }
}

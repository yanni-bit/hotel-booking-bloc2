/**
 * ============================================================
 * FICHIER     : reservation-detail.ts
 * COMPOSANT   : ReservationDetail
 * DESCRIPTION : Page de détail d'une réservation. Affiche toutes
 *               les informations d'une réservation : hôtel, chambre,
 *               offre, dates, voyageurs, demandes spéciales, services
 *               additionnels, récapitulatif prix et statut.
 *               Permet l'annulation et la redirection vers le paiement
 *               si la réservation est en attente (id_statut === 1).
 * AUTEUR      : Yannick
 * DATE        : 2025
 * SERVICES    : AuthService (utilisateur connecté)
 *               ReservationService (détail réservation + services)
 *               ActivatedRoute (récupération paramètre :id)
 *               Router (navigation retour et paiement)
 *               ChangeDetectorRef (détection manuelle OnPush)
 * PIPES       : CurrencyPipe (formatage des prix)
 * FONCTIONNALITÉS :
 *   - Chargement réservation par ID + services additionnels
 *   - Formatage dates en français (fr-FR)
 *   - Badge de statut coloré selon couleur BDD
 *   - Calcul total des services additionnels
 *   - Annulation avec confirmation (sauf statuts 3 et 5)
 *   - Redirection paiement avec queryParam reservationId
 * ============================================================
 */

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencyPipe } from '../../pipes/currency.pipe';

@Component({
  selector: 'app-reservation-detail',
  imports: [CommonModule, RouterLink, TranslateModule, CurrencyPipe],
  templateUrl: './reservation-detail.html',
  styleUrl: './reservation-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationDetail implements OnInit {
  /** ID de la réservation (depuis paramètre de route :id) */
  reservationId: number = 0;

  /** Objet réservation complet (données API) */
  reservation: any = null;

  /** Liste des services additionnels de la réservation */
  services: any[] = [];

  /** Indicateur de chargement */
  loading: boolean = true;

  /** Message d'erreur */
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private reservationService: ReservationService,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * Initialisation : récupère l'ID depuis les paramètres de route
   * et charge les données de la réservation
   */
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.reservationId = +params['id'];
      this.loadReservation();
    });
  }

  /**
   * Charge les données de la réservation via l'API
   * Vérifie que l'utilisateur est connecté avant l'appel
   * En cas de succès, enchaîne avec le chargement des services
   */
  loadReservation() {
    const user = this.authService.currentUser();

    if (!user) {
      this.error = 'Utilisateur non connecté';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.reservationService.getReservationById(this.reservationId, user.id_user).subscribe({
      next: (response) => {
        console.log('✅ Réservation:', response);
        this.reservation = response.data;
        this.loadServices();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.error = err.error?.message || 'Réservation non trouvée';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Charge les services additionnels associés à la réservation
   * En cas d'erreur, initialise un tableau vide (non bloquant)
   */
  loadServices() {
    this.reservationService.getReservationServices(this.reservationId).subscribe({
      next: (response) => {
        console.log('✅ Services:', response);
        this.services = response.data || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur services:', err);
        this.services = [];
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Calcule le total de tous les services additionnels
   * @returns Somme des sous-totaux de chaque service
   */
  getTotalServices(): number {
    return this.services.reduce((sum, s) => sum + parseFloat(s.sous_total), 0);
  }

  /**
   * Formate une date en format français (JJ/MM/AAAA)
   * @param date - Chaîne de date ISO
   * @returns Date formatée en fr-FR
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  /**
   * Formate une date avec heure en format français
   * @param date - Chaîne de date ISO
   * @returns Date et heure formatées en fr-FR
   */
  formatDateTime(date: string): string {
    return new Date(date).toLocaleString('fr-FR');
  }

  /**
   * Retourne la classe CSS Bootstrap pour le badge de statut
   * @param couleur - Couleur du statut depuis la BDD
   * @returns Classe CSS (bg-success, bg-warning, etc.)
   */
  getStatusBadgeClass(couleur: string): string {
    const colorMap: any = {
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-danger',
      info: 'bg-info',
      secondary: 'bg-secondary',
    };
    return colorMap[couleur] || 'bg-secondary';
  }

  /**
   * Vérifie si la réservation peut être annulée
   * Exclut les statuts 3 (terminée) et 5 (déjà annulée)
   * @returns true si l'annulation est possible
   */
  canCancel(): boolean {
    return this.reservation && this.reservation.id_statut !== 3 && this.reservation.id_statut !== 5;
  }

  /**
   * Vérifie si le paiement est possible
   * Uniquement pour le statut 1 (en attente de paiement)
   * @returns true si le paiement est disponible
   */
  canPay(): boolean {
    return this.reservation && this.reservation.id_statut === 1;
  }

  /**
   * Annule la réservation après confirmation utilisateur
   * Recharge les données après annulation réussie
   */
  cancelReservation() {
    if (!confirm(`Voulez-vous vraiment annuler cette réservation ?`)) {
      return;
    }

    const user = this.authService.currentUser();

    this.reservationService
      .cancelReservation(this.reservation.id_reservation, user.id_user)
      .subscribe({
        next: () => {
          alert('Réservation annulée avec succès');
          this.loadReservation();
        },
        error: (err) => {
          console.error('❌ Erreur annulation:', err);
          alert(err.error?.message || "Erreur lors de l'annulation");
        },
      });
  }

  /**
   * Redirige vers la page de paiement avec l'ID de réservation
   * en queryParam pour le flux "paiement différé"
   */
  goToPayment() {
    this.router.navigate(['/payment', this.reservation.id_offre], {
      queryParams: { reservationId: this.reservation.id_reservation },
    });
  }

  /**
   * Retour à la liste des réservations
   */
  goBack() {
    this.router.navigate(['/reservations']);
  }
}

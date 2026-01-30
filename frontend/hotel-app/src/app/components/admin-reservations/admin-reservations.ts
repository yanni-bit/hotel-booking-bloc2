// ============================================================================
// FICHIER : admin-reservations.component.ts
// DESCRIPTION : Composant de gestion des réservations - Interface admin pour
//               visualiser, filtrer et modifier le statut des réservations
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// STRATÉGIE : OnPush pour optimisation des performances
// SERVICES INJECTÉS :
//   - ReservationService : CRUD des réservations et services associés
// FONCTIONNALITÉS :
//   - Liste des réservations avec filtres (statut, recherche)
//   - Visualisation détaillée dans un modal (client, hôtel, séjour, prix, services)
//   - Modification du statut de réservation
//   - Calcul automatique des totaux
// ============================================================================

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../../services/reservation';

@Component({
  selector: 'app-admin-reservations',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-reservations.html',
  styleUrl: './admin-reservations.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReservations implements OnInit {
  // ==========================================================================
  // PROPRIÉTÉS - DONNÉES
  // ==========================================================================

  /** Liste complète des réservations */
  reservations: any[] = [];

  /** Liste des réservations après application des filtres */
  filteredReservations: any[] = [];

  /** Indicateur de chargement */
  loading: boolean = true;

  /** Message d'erreur */
  error: string = '';

  /** Message de succès */
  successMessage: string = '';

  // ==========================================================================
  // PROPRIÉTÉS - FILTRES
  // ==========================================================================

  /** Filtre par statut : 'all' | id du statut */
  filterStatus: string = 'all';

  /** Terme de recherche textuelle */
  searchTerm: string = '';

  // ==========================================================================
  // PROPRIÉTÉS - MODAL
  // ==========================================================================

  /** Affichage du modal de détail */
  showDetailModal: boolean = false;

  /** Réservation sélectionnée pour le modal */
  selectedReservation: any = null;

  /** Mode édition dans le modal */
  editMode: boolean = false;

  /** Services associés à la réservation sélectionnée */
  selectedServices: any[] = [];

  // ==========================================================================
  // PROPRIÉTÉS - CONFIGURATION
  // ==========================================================================

  /**
   * Liste des statuts de réservation disponibles
   * @property {number} id - ID du statut
   * @property {string} nom - Libellé du statut
   * @property {string} couleur - Classe CSS Bootstrap pour le badge
   */
  statuts = [
    { id: 1, nom: 'En attente', couleur: 'warning' },
    { id: 2, nom: 'Confirmée', couleur: 'success' },
    { id: 3, nom: 'Annulée', couleur: 'danger' },
    { id: 4, nom: 'Refusée', couleur: 'danger' },
    { id: 5, nom: 'Terminée', couleur: 'secondary' },
    { id: 6, nom: 'En cours', couleur: 'info' },
  ];

  // ==========================================================================
  // CONSTRUCTEUR
  // ==========================================================================

  /**
   * Injection des dépendances
   * @param {ReservationService} reservationService - Service de gestion des réservations
   * @param {ChangeDetectorRef} cdr - Référence pour la détection de changements
   */
  constructor(
    private reservationService: ReservationService,
    private cdr: ChangeDetectorRef,
  ) {}

  // ==========================================================================
  // CYCLE DE VIE
  // ==========================================================================

  /**
   * Initialisation du composant
   * Déclenche le chargement des réservations
   */
  ngOnInit() {
    this.loadReservations();
  }

  // ==========================================================================
  // MÉTHODES - CHARGEMENT DES DONNÉES
  // ==========================================================================

  /**
   * Charge toutes les réservations depuis l'API
   * Applique les filtres après chargement
   */
  loadReservations() {
    this.loading = true;

    this.reservationService.getAllReservations().subscribe({
      next: (response) => {
        console.log('✅ Réservations:', response);
        this.reservations = response.data || [];
        this.applyFilters();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.error = 'Erreur lors du chargement des réservations';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ==========================================================================
  // MÉTHODES - FILTRAGE
  // ==========================================================================

  /**
   * Applique tous les filtres actifs sur la liste des réservations
   * Filtres combinés : statut + recherche textuelle
   */
  applyFilters() {
    let filtered = [...this.reservations];

    // -------------------------------------------------------------------------
    // Filtre par statut
    // -------------------------------------------------------------------------
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter((r) => r.id_statut === parseInt(this.filterStatus));
    }

    // -------------------------------------------------------------------------
    // Filtre par recherche textuelle
    // -------------------------------------------------------------------------
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.nom_hotel?.toLowerCase().includes(term) ||
          r.client_nom?.toLowerCase().includes(term) ||
          r.client_prenom?.toLowerCase().includes(term) ||
          r.nom_user?.toLowerCase().includes(term) ||
          r.prenom_user?.toLowerCase().includes(term) ||
          r.client_email?.toLowerCase().includes(term) ||
          r.email_user?.toLowerCase().includes(term) ||
          r.num_confirmation?.toLowerCase().includes(term),
      );
    }

    this.filteredReservations = filtered;
    this.cdr.markForCheck();
  }

  /**
   * Handler appelé lors du changement d'un filtre
   */
  onFilterChange() {
    this.applyFilters();
  }

  // ==========================================================================
  // MÉTHODES - GESTION DU MODAL
  // ==========================================================================

  /**
   * Ouvre le modal avec les détails d'une réservation
   * Charge également les services associés
   * @param {any} reservation - Réservation à afficher
   */
  openDetailModal(reservation: any) {
    this.selectedReservation = { ...reservation };
    this.selectedServices = [];
    this.showDetailModal = true;
    this.editMode = false;
    this.cdr.markForCheck();

    // Charger les services de cette réservation
    this.reservationService.getReservationServices(reservation.id_reservation).subscribe({
      next: (response) => {
        console.log('✅ Services:', response);
        this.selectedServices = response.data || [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur services:', err);
        this.selectedServices = [];
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Ferme le modal de détail
   */
  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedReservation = null;
    this.editMode = false;
    this.cdr.markForCheck();
  }

  /**
   * Bascule le mode édition dans le modal
   */
  toggleEditMode() {
    this.editMode = !this.editMode;
    this.cdr.markForCheck();
  }

  // ==========================================================================
  // MÉTHODES - ACTIONS CRUD
  // ==========================================================================

  /**
   * Sauvegarde les modifications de la réservation (statut)
   */
  saveReservation() {
    if (!this.selectedReservation) return;

    // Mettre à jour le statut
    this.reservationService
      .updateReservationStatus(
        this.selectedReservation.id_reservation,
        this.selectedReservation.id_statut,
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Réservation mise à jour avec succès';
          this.loadReservations();
          this.editMode = false;

          setTimeout(() => {
            this.successMessage = '';
            this.cdr.markForCheck();
          }, 3000);

          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('❌ Erreur:', err);
          this.error = 'Erreur lors de la mise à jour';
          setTimeout(() => {
            this.error = '';
            this.cdr.markForCheck();
          }, 3000);
          this.cdr.markForCheck();
        },
      });
  }

  /**
   * Change le statut d'une réservation directement depuis le tableau
   * @param {any} reservation - Réservation à modifier
   * @param {any} event - Événement du select
   */
  changeStatus(reservation: any, event: any) {
    const newStatusId = parseInt(event.target.value);

    if (newStatusId === reservation.id_statut) {
      return;
    }

    const newStatut = this.statuts.find((s) => s.id === newStatusId);

    if (!confirm(`Changer le statut vers "${newStatut?.nom}" ?`)) {
      event.target.value = reservation.id_statut;
      return;
    }

    this.reservationService
      .updateReservationStatus(reservation.id_reservation, newStatusId)
      .subscribe({
        next: () => {
          this.successMessage = 'Statut mis à jour avec succès';
          this.loadReservations();

          setTimeout(() => {
            this.successMessage = '';
            this.cdr.markForCheck();
          }, 3000);
        },
        error: (err) => {
          console.error('❌ Erreur:', err);
          this.error = 'Erreur lors de la mise à jour du statut';
          event.target.value = reservation.id_statut;

          setTimeout(() => {
            this.error = '';
            this.cdr.markForCheck();
          }, 3000);
          this.cdr.markForCheck();
        },
      });
  }

  // ==========================================================================
  // MÉTHODES - UTILITAIRES D'AFFICHAGE
  // ==========================================================================

  /**
   * Formate une date au format français (JJ/MM/AAAA)
   * @param {string} date - Date ISO à formater
   * @returns {string} Date formatée ou '-' si invalide
   */
  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  /**
   * Formate une date avec heure au format français
   * @param {string} date - Date ISO à formater
   * @returns {string} Date et heure formatées
   */
  formatDateTime(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Retourne la classe CSS du badge selon la couleur du statut
   * @param {string} couleur - Code couleur du statut
   * @returns {string} Classe CSS Bootstrap
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
   * Retourne le nom d'un statut par son ID
   * @param {number} id_statut - ID du statut
   * @returns {string} Nom du statut
   */
  getStatusName(id_statut: number): string {
    const statut = this.statuts.find((s) => s.id === id_statut);
    return statut?.nom || 'Inconnu';
  }

  /**
   * Retourne la couleur d'un statut par son ID
   * @param {number} id_statut - ID du statut
   * @returns {string} Code couleur Bootstrap
   */
  getStatusColor(id_statut: number): string {
    const statut = this.statuts.find((s) => s.id === id_statut);
    return statut?.couleur || 'secondary';
  }

  /**
   * Calcule le nombre de nuits entre deux dates
   * @param {string} checkIn - Date d'arrivée
   * @param {string} checkOut - Date de départ
   * @returns {number} Nombre de nuits
   */
  calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Calcule le total des services sélectionnés
   * @returns {number} Total en euros
   */
  getTotalServices(): number {
    return this.selectedServices.reduce((sum, s) => sum + parseFloat(s.sous_total), 0);
  }
}

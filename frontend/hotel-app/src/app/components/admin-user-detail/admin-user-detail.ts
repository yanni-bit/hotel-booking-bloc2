// ============================================================================
// FICHIER : admin-user-detail.component.ts
// DESCRIPTION : Composant de détail utilisateur - Interface admin pour consulter
//               et modifier le profil d'un utilisateur avec ses réservations
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// STRATÉGIE : OnPush pour optimisation des performances
// SERVICES INJECTÉS :
//   - AuthService : Gestion utilisateurs et rôles
//   - ReservationService : Récupération des réservations et services
// FONCTIONNALITÉS :
//   - Affichage profil complet (infos personnelles, adresse, stats)
//   - Mode édition du profil (nom, email, téléphone, rôle, statut)
//   - Liste des réservations de l'utilisateur
//   - Modal de détail réservation avec modification de statut
// ============================================================================

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation';

@Component({
  selector: 'app-admin-user-detail',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-user-detail.html',
  styleUrl: './admin-user-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserDetail implements OnInit {
  // ==========================================================================
  // PROPRIÉTÉS - DONNÉES UTILISATEUR
  // ==========================================================================

  /** ID de l'utilisateur (depuis l'URL) */
  userId: number = 0;

  /** Données de l'utilisateur */
  user: any = null;

  /** Liste des réservations de l'utilisateur */
  reservations: any[] = [];

  /** Liste des rôles disponibles */
  roles: any[] = [];

  // ==========================================================================
  // PROPRIÉTÉS - ÉTATS
  // ==========================================================================

  /** Indicateur de chargement */
  loading: boolean = true;

  /** Message d'erreur */
  error: string = '';

  /** Message de succès */
  successMessage: string = '';

  /** Mode édition du profil */
  editMode: boolean = false;

  /** Copie des données utilisateur pour édition */
  editedUser: any = {};

  // ==========================================================================
  // PROPRIÉTÉS - MODAL RÉSERVATION
  // ==========================================================================

  /** Affichage du modal de détail réservation */
  showReservationModal: boolean = false;

  /** Réservation sélectionnée */
  selectedReservation: any = null;

  /** Services de la réservation sélectionnée */
  selectedServices: any[] = [];

  // ==========================================================================
  // PROPRIÉTÉS - CONFIGURATION
  // ==========================================================================

  /**
   * Liste des statuts de réservation
   * @property {number} id - ID du statut
   * @property {string} nom - Libellé du statut
   * @property {string} couleur - Classe CSS Bootstrap
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
   * @param {ActivatedRoute} route - Accès aux paramètres de route
   * @param {Router} router - Navigation programmatique
   * @param {AuthService} authService - Service d'authentification et utilisateurs
   * @param {ReservationService} reservationService - Service de réservations
   * @param {ChangeDetectorRef} cdr - Référence pour la détection de changements
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private reservationService: ReservationService,
    private cdr: ChangeDetectorRef,
  ) {}

  // ==========================================================================
  // CYCLE DE VIE
  // ==========================================================================

  /**
   * Initialisation du composant
   * Récupère l'ID utilisateur et charge les données
   */
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.userId = +params['id'];
      this.loadRoles();
      this.loadUser();
      this.loadReservations();
    });
  }

  // ==========================================================================
  // MÉTHODES - CHARGEMENT DES DONNÉES
  // ==========================================================================

  /**
   * Charge la liste des rôles disponibles
   */
  loadRoles() {
    this.authService.getAllRoles().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.roles = response.data;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement rôles:', err);
      },
    });
  }

  /**
   * Charge les données de l'utilisateur
   */
  loadUser() {
    this.loading = true;

    this.authService.getUserById(this.userId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.user = response.data;
          this.editedUser = { ...this.user };
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement utilisateur:', err);
        this.error = err.error?.message || 'Utilisateur non trouvé';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Charge les réservations de l'utilisateur
   */
  loadReservations() {
    this.authService.getUserReservations(this.userId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.reservations = response.data;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement réservations:', err);
      },
    });
  }

  // ==========================================================================
  // MÉTHODES - ÉDITION UTILISATEUR
  // ==========================================================================

  /**
   * Active/désactive le mode édition
   * Copie les données utilisateur si activation
   */
  toggleEditMode() {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.editedUser = { ...this.user };
    }
    this.cdr.markForCheck();
  }

  /**
   * Annule l'édition et restaure les données originales
   */
  cancelEdit() {
    this.editMode = false;
    this.editedUser = { ...this.user };
    this.cdr.markForCheck();
  }

  /**
   * Sauvegarde les modifications de l'utilisateur
   */
  saveUser() {
    this.authService.updateUser(this.userId, this.editedUser).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.user = { ...this.editedUser };
          this.editMode = false;
          this.successMessage = 'Utilisateur modifié avec succès';

          setTimeout(() => {
            this.successMessage = '';
            this.cdr.markForCheck();
          }, 3000);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur modification:', err);
        this.error = err.error?.message || 'Erreur lors de la modification';

        setTimeout(() => {
          this.error = '';
          this.cdr.markForCheck();
        }, 3000);
        this.cdr.markForCheck();
      },
    });
  }

  // ==========================================================================
  // MÉTHODES - MODAL RÉSERVATION
  // ==========================================================================

  /**
   * Ouvre le modal de détail d'une réservation
   * Charge également les services associés
   * @param {any} reservation - Réservation à afficher
   */
  openReservationModal(reservation: any) {
    this.selectedReservation = { ...reservation };
    this.selectedServices = [];
    this.showReservationModal = true;
    this.cdr.markForCheck();

    // Charger les services de la réservation
    this.reservationService.getReservationServices(reservation.id_reservation).subscribe({
      next: (response: any) => {
        this.selectedServices = response.data || [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur services:', err);
      },
    });
  }

  /**
   * Ferme le modal de réservation
   */
  closeReservationModal() {
    this.showReservationModal = false;
    this.selectedReservation = null;
    this.selectedServices = [];
    this.cdr.markForCheck();
  }

  /**
   * Sauvegarde le nouveau statut de la réservation
   */
  saveReservationStatus() {
    if (!this.selectedReservation) return;

    this.reservationService
      .updateReservationStatus(
        this.selectedReservation.id_reservation,
        this.selectedReservation.id_statut,
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Statut mis à jour';
          this.loadReservations();
          this.closeReservationModal();

          setTimeout(() => {
            this.successMessage = '';
            this.cdr.markForCheck();
          }, 3000);
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.error = 'Erreur lors de la mise à jour';

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
   * Retourne la classe CSS du badge selon le rôle
   * @param {string} code_role - Code du rôle (admin, provider, client)
   * @returns {string} Classe CSS Bootstrap
   */
  getRoleBadgeClass(code_role: string): string {
    switch (code_role) {
      case 'admin':
        return 'bg-danger';
      case 'provider':
        return 'bg-warning text-dark';
      default:
        return 'bg-info';
    }
  }

  /**
   * Calcule le total des services sélectionnés
   * @returns {number} Total en euros
   */
  getTotalServices(): number {
    return this.selectedServices.reduce((sum, s) => sum + parseFloat(s.sous_total), 0);
  }

  /**
   * Calcule le total de toutes les réservations de l'utilisateur
   * @returns {number} Total en euros
   */
  getTotalReservations(): number {
    return this.reservations.reduce((sum, r) => sum + parseFloat(r.total_price), 0);
  }

  /**
   * Retourne à la liste des utilisateurs
   */
  goBack() {
    this.router.navigate(['/admin/users']);
  }
}

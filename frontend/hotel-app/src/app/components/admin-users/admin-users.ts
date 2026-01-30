// ============================================================================
// FICHIER : admin-users.component.ts
// DESCRIPTION : Composant de gestion des utilisateurs - Interface admin pour
//               lister, filtrer, modifier les rôles et supprimer les utilisateurs
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// STRATÉGIE : OnPush pour optimisation des performances
// SERVICES INJECTÉS :
//   - AuthService : Gestion des utilisateurs et rôles
// FONCTIONNALITÉS :
//   - Liste des utilisateurs avec filtres (recherche, rôle, statut)
//   - Modification du rôle en ligne (select)
//   - Toggle statut actif/inactif
//   - Suppression avec confirmation modale
//   - Protection de l'utilisateur connecté (pas d'auto-suppression)
// ============================================================================

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

// ==========================================================================
// INTERFACES
// ==========================================================================

/**
 * Interface représentant un utilisateur
 */
interface User {
  id_user: number;
  email_user: string;
  prenom_user: string;
  nom_user: string;
  tel_user: string | null;
  actif: number;
  email_verifie: number;
  date_inscription: string;
  derniere_connexion: string | null;
  id_role: number;
  code_role: string;
  nom_role: string;
}

/**
 * Interface représentant un rôle
 */
interface Role {
  id_role: number;
  code_role: string;
  nom_role: string;
}

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsers implements OnInit {
  // ==========================================================================
  // PROPRIÉTÉS - DONNÉES
  // ==========================================================================

  /** Liste des utilisateurs */
  users: User[] = [];

  /** Liste des rôles disponibles */
  roles: Role[] = [];

  /** Indicateur de chargement */
  loading: boolean = true;

  /** Message d'erreur */
  errorMessage: string = '';

  /** Message de succès */
  successMessage: string = '';

  // ==========================================================================
  // PROPRIÉTÉS - FILTRES
  // ==========================================================================

  /** Terme de recherche (nom, prénom, email) */
  searchTerm: string = '';

  /** Filtre par rôle (code_role) */
  filterRole: string = '';

  /** Filtre par statut : '' | 'active' | 'inactive' */
  filterStatus: string = '';

  // ==========================================================================
  // PROPRIÉTÉS - MODAL SUPPRESSION
  // ==========================================================================

  /** Affichage du modal de confirmation de suppression */
  showDeleteModal: boolean = false;

  /** Utilisateur sélectionné pour suppression */
  userToDelete: User | null = null;

  // ==========================================================================
  // CONSTRUCTEUR
  // ==========================================================================

  /**
   * Injection des dépendances
   * @param {AuthService} authService - Service d'authentification et gestion utilisateurs
   * @param {ChangeDetectorRef} cdr - Référence pour la détection de changements
   */
  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  // ==========================================================================
  // CYCLE DE VIE
  // ==========================================================================

  /**
   * Initialisation du composant
   * Charge les rôles et les utilisateurs
   */
  ngOnInit() {
    this.loadRoles();
    this.loadUsers();
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
   * Charge la liste des utilisateurs
   */
  loadUsers() {
    this.loading = true;
    this.authService.getAllUsers().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.users = response.data;
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs:', err);
        this.errorMessage = 'Erreur lors du chargement des utilisateurs';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ==========================================================================
  // PROPRIÉTÉS CALCULÉES - FILTRAGE
  // ==========================================================================

  /**
   * Retourne la liste des utilisateurs filtrés
   * Applique les filtres : recherche + rôle + statut
   * @returns {User[]} Liste filtrée
   */
  get filteredUsers(): User[] {
    return this.users.filter((user) => {
      // -----------------------------------------------------------------------
      // Filtre par recherche textuelle (nom, prénom, email)
      // -----------------------------------------------------------------------
      const matchSearch =
        !this.searchTerm ||
        user.email_user.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.prenom_user.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.nom_user.toLowerCase().includes(this.searchTerm.toLowerCase());

      // -----------------------------------------------------------------------
      // Filtre par rôle
      // -----------------------------------------------------------------------
      const matchRole = !this.filterRole || user.code_role === this.filterRole;

      // -----------------------------------------------------------------------
      // Filtre par statut actif/inactif
      // -----------------------------------------------------------------------
      const matchStatus =
        !this.filterStatus ||
        (this.filterStatus === 'active' && user.actif === 1) ||
        (this.filterStatus === 'inactive' && user.actif === 0);

      return matchSearch && matchRole && matchStatus;
    });
  }

  // ==========================================================================
  // MÉTHODES - ACTIONS CRUD
  // ==========================================================================

  /**
   * Change le rôle d'un utilisateur
   * @param {User} user - Utilisateur à modifier
   * @param {number} newRoleId - Nouveau rôle ID
   */
  onRoleChange(user: User, newRoleId: number) {
    this.authService.updateUserRole(user.id_user, newRoleId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.successMessage = `Rôle de ${user.prenom_user} modifié avec succès`;
          this.loadUsers(); // Recharger la liste
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.markForCheck();
          }, 3000);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur modification rôle:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la modification du rôle';
        setTimeout(() => {
          this.errorMessage = '';
          this.cdr.markForCheck();
        }, 3000);
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Bascule le statut actif/inactif d'un utilisateur
   * @param {User} user - Utilisateur à modifier
   */
  toggleUserStatus(user: User) {
    const newStatus = user.actif === 1 ? false : true;

    this.authService.toggleUserActive(user.id_user, newStatus).subscribe({
      next: (response: any) => {
        if (response.success) {
          user.actif = newStatus ? 1 : 0;
          this.successMessage = newStatus
            ? `${user.prenom_user} a été activé`
            : `${user.prenom_user} a été désactivé`;
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.markForCheck();
          }, 3000);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur toggle statut:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la modification du statut';
        setTimeout(() => {
          this.errorMessage = '';
          this.cdr.markForCheck();
        }, 3000);
        this.cdr.markForCheck();
      },
    });
  }

  // ==========================================================================
  // MÉTHODES - MODAL SUPPRESSION
  // ==========================================================================

  /**
   * Ouvre le modal de confirmation de suppression
   * @param {User} user - Utilisateur à supprimer
   */
  openDeleteModal(user: User) {
    this.userToDelete = user;
    this.showDeleteModal = true;
    this.cdr.markForCheck();
  }

  /**
   * Ferme le modal de suppression
   */
  closeDeleteModal() {
    this.userToDelete = null;
    this.showDeleteModal = false;
    this.cdr.markForCheck();
  }

  /**
   * Confirme et exécute la suppression de l'utilisateur
   */
  confirmDelete() {
    if (!this.userToDelete) return;

    this.authService.deleteUser(this.userToDelete.id_user).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.successMessage = `${this.userToDelete?.prenom_user} a été supprimé`;
          this.users = this.users.filter((u) => u.id_user !== this.userToDelete?.id_user);
          this.closeDeleteModal();
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.markForCheck();
          }, 3000);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur suppression:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la suppression';
        this.closeDeleteModal();
        setTimeout(() => {
          this.errorMessage = '';
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
   * Formate une date au format français avec heure
   * @param {string | null} dateString - Date ISO à formater
   * @returns {string} Date formatée ou '-' si null
   */
  formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Vérifie si l'utilisateur est l'utilisateur actuellement connecté
   * Utilisé pour protéger contre l'auto-modification/suppression
   * @param {User} user - Utilisateur à vérifier
   * @returns {boolean} True si c'est l'utilisateur connecté
   */
  isCurrentUser(user: User): boolean {
    const currentUser = this.authService.currentUser();
    return currentUser?.id_user === user.id_user;
  }
}

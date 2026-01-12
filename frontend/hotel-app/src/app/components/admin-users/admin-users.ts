import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminUsers implements OnInit {
  
  users: User[] = [];
  roles: Role[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';
  
  // Filtres
  searchTerm: string = '';
  filterRole: string = '';
  filterStatus: string = '';
  
  // Modal confirmation suppression
  showDeleteModal: boolean = false;
  userToDelete: User | null = null;
  
  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    this.loadRoles();
    this.loadUsers();
  }
  
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
      }
    });
  }
  
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
      }
    });
  }
  
  get filteredUsers(): User[] {
    return this.users.filter(user => {
      // Filtre recherche
      const matchSearch = !this.searchTerm || 
        user.email_user.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.prenom_user.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.nom_user.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Filtre rôle
      const matchRole = !this.filterRole || user.code_role === this.filterRole;
      
      // Filtre statut
      const matchStatus = !this.filterStatus || 
        (this.filterStatus === 'active' && user.actif === 1) ||
        (this.filterStatus === 'inactive' && user.actif === 0);
      
      return matchSearch && matchRole && matchStatus;
    });
  }
  
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
      }
    });
  }
  
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
      }
    });
  }
  
  openDeleteModal(user: User) {
    this.userToDelete = user;
    this.showDeleteModal = true;
    this.cdr.markForCheck();
  }
  
  closeDeleteModal() {
    this.userToDelete = null;
    this.showDeleteModal = false;
    this.cdr.markForCheck();
  }
  
  confirmDelete() {
    if (!this.userToDelete) return;
    
    this.authService.deleteUser(this.userToDelete.id_user).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.successMessage = `${this.userToDelete?.prenom_user} a été supprimé`;
          this.users = this.users.filter(u => u.id_user !== this.userToDelete?.id_user);
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
      }
    });
  }
  
  getRoleBadgeClass(code_role: string): string {
    switch (code_role) {
      case 'admin': return 'bg-danger';
      case 'provider': return 'bg-warning text-dark';
      default: return 'bg-info';
    }
  }
  
  formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  isCurrentUser(user: User): boolean {
    const currentUser = this.authService.currentUser();
    return currentUser?.id_user === user.id_user;
  }
}
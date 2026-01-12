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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminUserDetail implements OnInit {
  
  userId: number = 0;
  user: any = null;
  reservations: any[] = [];
  roles: any[] = [];
  
  loading: boolean = true;
  error: string = '';
  successMessage: string = '';
  
  editMode: boolean = false;
  editedUser: any = {};
  
  // Modal détail réservation
  showReservationModal: boolean = false;
  selectedReservation: any = null;
  selectedServices: any[] = [];
  
  // Statuts
  statuts = [
    { id: 1, nom: 'En attente', couleur: 'warning' },
    { id: 2, nom: 'Confirmée', couleur: 'success' },
    { id: 3, nom: 'Annulée', couleur: 'danger' },
    { id: 4, nom: 'Refusée', couleur: 'danger' },
    { id: 5, nom: 'Terminée', couleur: 'secondary' },
    { id: 6, nom: 'En cours', couleur: 'info' }
  ];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private reservationService: ReservationService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userId = +params['id'];
      this.loadRoles();
      this.loadUser();
      this.loadReservations();
    });
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
      }
    });
  }
  
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
      }
    });
  }
  
  // ========================================
  // ÉDITION UTILISATEUR
  // ========================================
  
  toggleEditMode() {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.editedUser = { ...this.user };
    }
    this.cdr.markForCheck();
  }
  
  cancelEdit() {
    this.editMode = false;
    this.editedUser = { ...this.user };
    this.cdr.markForCheck();
  }
  
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
      }
    });
  }
  
  // ========================================
  // MODAL RÉSERVATION
  // ========================================
  
  openReservationModal(reservation: any) {
    this.selectedReservation = { ...reservation };
    this.selectedServices = [];
    this.showReservationModal = true;
    this.cdr.markForCheck();
    
    // Charger les services
    this.reservationService.getReservationServices(reservation.id_reservation).subscribe({
      next: (response: any) => {
        this.selectedServices = response.data || [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur services:', err);
      }
    });
  }
  
  closeReservationModal() {
    this.showReservationModal = false;
    this.selectedReservation = null;
    this.selectedServices = [];
    this.cdr.markForCheck();
  }
  
  saveReservationStatus() {
    if (!this.selectedReservation) return;
    
    this.reservationService.updateReservationStatus(
      this.selectedReservation.id_reservation,
      this.selectedReservation.id_statut
    ).subscribe({
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
      }
    });
  }
  
  // ========================================
  // UTILITAIRES
  // ========================================
  
  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  }
  
  formatDateTime(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  getStatusName(id_statut: number): string {
    const statut = this.statuts.find(s => s.id === id_statut);
    return statut?.nom || 'Inconnu';
  }
  
  getStatusColor(id_statut: number): string {
    const statut = this.statuts.find(s => s.id === id_statut);
    return statut?.couleur || 'secondary';
  }
  
  getRoleBadgeClass(code_role: string): string {
    switch (code_role) {
      case 'admin': return 'bg-danger';
      case 'provider': return 'bg-warning text-dark';
      default: return 'bg-info';
    }
  }
  
  getTotalServices(): number {
    return this.selectedServices.reduce((sum, s) => sum + parseFloat(s.sous_total), 0);
  }
  
  getTotalReservations(): number {
    return this.reservations.reduce((sum, r) => sum + parseFloat(r.total_price), 0);
  }
  
  goBack() {
    this.router.navigate(['/admin/users']);
  }
}
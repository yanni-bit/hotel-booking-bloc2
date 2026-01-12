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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminReservations implements OnInit {

  reservations: any[] = [];
  filteredReservations: any[] = [];
  loading: boolean = true;
  error: string = '';
  successMessage: string = '';

  // Filtres
  filterStatus: string = 'all';
  searchTerm: string = '';

  // Modal détail
  showDetailModal: boolean = false;
  selectedReservation: any = null;
  editMode: boolean = false;
  selectedServices: any[] = [];

  // Liste des statuts disponibles
  statuts = [
    { id: 1, nom: 'En attente', couleur: 'warning' },
    { id: 2, nom: 'Confirmée', couleur: 'success' },
    { id: 3, nom: 'Annulée', couleur: 'danger' },
    { id: 4, nom: 'Refusée', couleur: 'danger' },
    { id: 5, nom: 'Terminée', couleur: 'secondary' },
    { id: 6, nom: 'En cours', couleur: 'info' }
  ];

  constructor(
    private reservationService: ReservationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadReservations();
  }

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
      }
    });
  }

  applyFilters() {
    let filtered = [...this.reservations];

    // Filtre par statut
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(r => r.id_statut === parseInt(this.filterStatus));
    }

    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.nom_hotel?.toLowerCase().includes(term) ||
        r.client_nom?.toLowerCase().includes(term) ||
        r.client_prenom?.toLowerCase().includes(term) ||
        r.nom_user?.toLowerCase().includes(term) ||
        r.prenom_user?.toLowerCase().includes(term) ||
        r.client_email?.toLowerCase().includes(term) ||
        r.email_user?.toLowerCase().includes(term) ||
        r.num_confirmation?.toLowerCase().includes(term)
      );
    }

    this.filteredReservations = filtered;
    this.cdr.markForCheck();
  }

  onFilterChange() {
    this.applyFilters();
  }

  // ========================================
  // MODAL DÉTAIL
  // ========================================

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
      }
    });
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedReservation = null;
    this.editMode = false;
    this.cdr.markForCheck();
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    this.cdr.markForCheck();
  }

  saveReservation() {
    if (!this.selectedReservation) return;

    // Mettre à jour le statut
    this.reservationService.updateReservationStatus(
      this.selectedReservation.id_reservation,
      this.selectedReservation.id_statut
    ).subscribe({
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
      }
    });
  }

  // ========================================
  // CHANGEMENT STATUT DIRECT (tableau)
  // ========================================

  changeStatus(reservation: any, event: any) {
    const newStatusId = parseInt(event.target.value);

    if (newStatusId === reservation.id_statut) {
      return;
    }

    const newStatut = this.statuts.find(s => s.id === newStatusId);

    if (!confirm(`Changer le statut vers "${newStatut?.nom}" ?`)) {
      event.target.value = reservation.id_statut;
      return;
    }

    this.reservationService.updateReservationStatus(reservation.id_reservation, newStatusId).subscribe({
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

  getStatusBadgeClass(couleur: string): string {
    const colorMap: any = {
      'success': 'bg-success',
      'warning': 'bg-warning',
      'danger': 'bg-danger',
      'info': 'bg-info',
      'secondary': 'bg-secondary'
    };
    return colorMap[couleur] || 'bg-secondary';
  }

  getStatusName(id_statut: number): string {
    const statut = this.statuts.find(s => s.id === id_statut);
    return statut?.nom || 'Inconnu';
  }

  getStatusColor(id_statut: number): string {
    const statut = this.statuts.find(s => s.id === id_statut);
    return statut?.couleur || 'secondary';
  }

  calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getTotalServices(): number {
    return this.selectedServices.reduce((sum, s) => sum + parseFloat(s.sous_total), 0);
  }
}
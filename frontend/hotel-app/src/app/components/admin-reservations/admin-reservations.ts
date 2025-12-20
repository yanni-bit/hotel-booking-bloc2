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
  
  // Filtres
  filterStatus: string = 'all';
  searchTerm: string = '';
  
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
  ) {}
  
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
        r.nom_hotel.toLowerCase().includes(term) ||
        r.client_nom?.toLowerCase().includes(term) ||
        r.client_prenom?.toLowerCase().includes(term) ||
        r.nom_user?.toLowerCase().includes(term) ||
        r.prenom_user?.toLowerCase().includes(term) ||
        r.client_email?.toLowerCase().includes(term) ||
        r.email_user?.toLowerCase().includes(term) ||
        r.num_confirmation.toLowerCase().includes(term)
      );
    }
    
    this.filteredReservations = filtered;
    this.cdr.markForCheck();
  }
  
  onFilterChange() {
    this.applyFilters();
  }
  
  changeStatus(reservation: any, event: any) {
  const newStatusId = parseInt(event.target.value);
  
  // Si même statut, ne rien faire
  if (newStatusId === reservation.id_statut) {
    return;
  }
  
  const newStatut = this.statuts.find(s => s.id === newStatusId);
  
  if (!confirm(`Changer le statut vers "${newStatut?.nom}" ?`)) {
    // Réinitialiser le select à l'ancien statut
    event.target.value = reservation.id_statut;
    return;
  }
  
  this.reservationService.updateReservationStatus(reservation.id_reservation, newStatusId).subscribe({
    next: () => {
      alert('Statut mis à jour avec succès');
      this.loadReservations();
    },
    error: (err) => {
      console.error('❌ Erreur:', err);
      alert('Erreur lors de la mise à jour du statut');
      event.target.value = reservation.id_statut; // Réinitialiser
    }
  });
}
  
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
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
}
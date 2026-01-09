import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-reservation-detail',
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './reservation-detail.html',
  styleUrl: './reservation-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReservationDetail implements OnInit {

  reservationId: number = 0;
  reservation: any = null;
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private reservationService: ReservationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.reservationId = +params['id'];
      this.loadReservation();
    });
  }

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
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.error = err.error?.message || 'Réservation non trouvée';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString('fr-FR');
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

  canCancel(): boolean {
    // Peut annuler si le statut n'est pas "Annulée" (id_statut = 3) ou "Terminée" (id_statut = 5)
    return this.reservation && 
           this.reservation.id_statut !== 3 && 
           this.reservation.id_statut !== 5;
  }

  /**
   * Vérifie si la réservation peut être payée (statut "En attente")
   */
  canPay(): boolean {
    return this.reservation && this.reservation.id_statut === 1;
  }

  cancelReservation() {
    if (!confirm(`Voulez-vous vraiment annuler cette réservation ?`)) {
      return;
    }

    const user = this.authService.currentUser();

    this.reservationService.cancelReservation(this.reservation.id_reservation, user.id_user).subscribe({
      next: () => {
        alert('Réservation annulée avec succès');
        this.loadReservation(); // Recharger les données
      },
      error: (err) => {
        console.error('❌ Erreur annulation:', err);
        alert(err.error?.message || 'Erreur lors de l\'annulation');
      }
    });
  }

  /**
   * Redirige vers la page de paiement pour une réservation en attente
   */
  goToPayment() {
    this.router.navigate(['/payment', this.reservation.id_offre], {
      queryParams: { reservationId: this.reservation.id_reservation }
    });
  }

  goBack() {
    this.router.navigate(['/reservations']);
  }
}
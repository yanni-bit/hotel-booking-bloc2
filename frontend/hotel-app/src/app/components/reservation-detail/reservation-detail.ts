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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReservationDetail implements OnInit {

  reservationId: number = 0;
  reservation: any = null;
  services: any[] = [];
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
        this.loadServices();
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
      }
    });
  }

  getTotalServices(): number {
    return this.services.reduce((sum, s) => sum + parseFloat(s.sous_total), 0);
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
    return this.reservation && 
           this.reservation.id_statut !== 3 && 
           this.reservation.id_statut !== 5;
  }

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
        this.loadReservation();
      },
      error: (err) => {
        console.error('❌ Erreur annulation:', err);
        alert(err.error?.message || 'Erreur lors de l\'annulation');
      }
    });
  }

  goToPayment() {
    this.router.navigate(['/payment', this.reservation.id_offre], {
      queryParams: { reservationId: this.reservation.id_reservation }
    });
  }

  goBack() {
    this.router.navigate(['/reservations']);
  }
}
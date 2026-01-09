import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencyPipe } from '../../pipes/currency.pipe';

@Component({
  selector: 'app-mes-reservations',
  imports: [CommonModule, RouterLink, TranslateModule, CurrencyPipe],
  templateUrl: './mes-reservations.html',
  styleUrl: './mes-reservations.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MesReservations implements OnInit {

  reservations: any[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(
    private authService: AuthService,
    private reservationService: ReservationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    const user = this.authService.currentUser();

    if (!user) {
      this.error = 'Utilisateur non connecté';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.reservationService.getUserReservations(user.id_user).subscribe({
      next: (response) => {
        console.log('✅ Réservations:', response);
        this.reservations = response.data || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur réservations:', err);
        this.error = 'Erreur lors du chargement des réservations';
        this.loading = false;
        this.cdr.markForCheck();
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

  cancelReservation(reservation: any) {
    if (!confirm(`Voulez-vous vraiment annuler cette réservation à ${reservation.nom_hotel} ?`)) {
      return;
    }

    const user = this.authService.currentUser();

    this.reservationService.cancelReservation(reservation.id_reservation, user.id_user).subscribe({
      next: () => {
        alert('Réservation annulée avec succès');
        this.loadReservations(); // Recharger la liste
      },
      error: (err) => {
        console.error('❌ Erreur annulation:', err);

        if (err.error?.message) {
          alert(err.error.message);
        } else {
          alert('Erreur lors de l\'annulation');
        }
      }
    });
  }

  canCancel(reservation: any): boolean {
    // Peut annuler si le statut n'est pas "Annulée" (id_statut = 3)
    return reservation.id_statut !== 3;
  }
}
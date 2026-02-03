/**
 * ============================================================
 * FICHIER     : mes-reservations.ts
 * COMPOSANT   : MesReservations
 * DESCRIPTION : Page listant toutes les réservations de l'utilisateur
 *               connecté. Affiche pour chaque réservation les détails
 *               de l'hôtel, la chambre, les dates, le prix et le statut.
 *               Permet de consulter le détail ou d'annuler une réservation.
 * AUTEUR      : Yannick
 * DATE        : 2025
 * SERVICES    : AuthService (récupération utilisateur connecté)
 *               ReservationService (chargement et annulation des réservations)
 *               ChangeDetectorRef (détection manuelle des changements OnPush)
 * PIPES       : CurrencyPipe (formatage des prix selon la devise)
 * FONCTIONNALITÉS :
 *   - Chargement des réservations de l'utilisateur connecté
 *   - Affichage liste avec image hôtel, détails, prix, statut
 *   - Formatage des dates en français (fr-FR)
 *   - Badge de statut coloré selon la couleur en BDD
 *   - Annulation d'une réservation (avec confirmation)
 *   - Gestion des états : loading, error, liste vide
 * ============================================================
 */

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MesReservations implements OnInit {
  /** Liste des réservations de l'utilisateur */
  reservations: any[] = [];

  /** Indicateur de chargement en cours */
  loading: boolean = true;

  /** Message d'erreur éventuel */
  error: string = '';

  constructor(
    private authService: AuthService,
    private reservationService: ReservationService,
    private cdr: ChangeDetectorRef,
  ) {}

  /** Chargement des réservations à l'initialisation du composant */
  ngOnInit() {
    this.loadReservations();
  }

  /**
   * Charge les réservations de l'utilisateur connecté
   * Vérifie d'abord que l'utilisateur est authentifié, puis appelle
   * ReservationService.getUserReservations() avec son id_user
   */
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
      },
    });
  }

  /**
   * Formate une date ISO en format français (JJ/MM/AAAA)
   * @param date - Date au format ISO string
   * @returns Date formatée en fr-FR
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  /**
   * Retourne la classe CSS Bootstrap du badge selon la couleur du statut
   * Mapping : success/warning/danger/info/secondary → bg-*
   * @param couleur - Nom de la couleur stockée en BDD
   * @returns Classe CSS Bootstrap correspondante
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
   * Annule une réservation après confirmation utilisateur
   * Appelle ReservationService.cancelReservation() puis recharge la liste
   * @param reservation - Objet réservation à annuler
   */
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
          alert("Erreur lors de l'annulation");
        }
      },
    });
  }

  /**
   * Vérifie si une réservation peut être annulée
   * Une réservation est annulable si son statut n'est pas "Annulée" (id_statut !== 3)
   * @param reservation - Objet réservation à vérifier
   * @returns true si annulable, false sinon
   */
  canCancel(reservation: any): boolean {
    return reservation.id_statut !== 3;
  }
}

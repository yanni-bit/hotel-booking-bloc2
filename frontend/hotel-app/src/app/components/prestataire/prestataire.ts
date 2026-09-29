// ============================================================================
// FICHIER : prestataire.ts
// DESCRIPTION : Espace prestataire, réservations de ses établissements
// AUTEUR : Yannick
// ============================================================================
// Un prestataire exploite un ou plusieurs hôtels. Cet écran lui montre les
// réservations de ces seuls établissements et lui permet d'en changer le
// statut : marquer un client « En cours » à son arrivée, « Terminée » à son
// départ, ou « Refusée » si le séjour ne peut pas être honoré.
//
// Aucun identifiant d'hôtel n'est transmis au serveur : le périmètre est
// déduit du jeton par jointure sur HOTEL_PRESTATAIRE. Le filtre par hôtel de
// cet écran n'est donc qu'un confort d'affichage, appliqué en mémoire.
// ============================================================================

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../../services/reservation';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-prestataire',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './prestataire.html',
  styleUrl: './prestataire.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Prestataire implements OnInit {
  // ==========================================================================
  // PROPRIÉTÉS
  // ==========================================================================

  /** Réservations des établissements du prestataire */
  reservations: any[] = [];

  /** Établissements rattachés au compte */
  hotels: any[] = [];

  /** Hôtel sélectionné dans le filtre, null = tous */
  filtreHotel: number | null = null;

  /** Statut sélectionné dans le filtre, null = tous */
  filtreStatut: number | null = null;

  /** Chargement en cours */
  loading: boolean = true;

  /** Message d'erreur */
  error: string = '';

  /** Message de succès */
  successMessage: string = '';

  /**
   * Statuts proposés au prestataire.
   *
   * Volontairement restreints : il confirme, marque l'arrivée, la fin de
   * séjour, ou refuse. L'annulation reste au client, qui seul décide de
   * renoncer à son séjour.
   */
  statutsDisponibles = [
    { id: 2, libelle: 'Confirmée' },
    { id: 6, libelle: 'En cours' },
    { id: 5, libelle: 'Terminée' },
    { id: 4, libelle: 'Refusée' },
  ];

  constructor(
    private reservationService: ReservationService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.chargerHotels();
    this.chargerReservations();
  }

  // ==========================================================================
  // CHARGEMENT
  // ==========================================================================

  /** Charge les établissements rattachés au compte */
  chargerHotels() {
    this.reservationService.getHotelsPrestataire().subscribe({
      next: (reponse: any) => {
        if (reponse.success) {
          this.hotels = reponse.data;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement établissements:', err);
        this.cdr.markForCheck();
      },
    });
  }

  /** Charge les réservations de ses établissements */
  chargerReservations() {
    this.loading = true;

    this.reservationService.getReservationsPrestataire().subscribe({
      next: (reponse: any) => {
        if (reponse.success) {
          this.reservations = reponse.data;
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement réservations:', err);
        this.error = err?.error?.message || 'Erreur lors du chargement des réservations';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ==========================================================================
  // FILTRES, APPLIQUÉS EN MÉMOIRE
  // ==========================================================================

  /**
   * Réservations après application des deux filtres d'affichage.
   * @returns {any[]} Sous-ensemble affiché
   */
  reservationsFiltrees(): any[] {
    return this.reservations.filter((r) => {
      const hotelOk = !this.filtreHotel || r.id_hotel === this.filtreHotel;
      const statutOk = !this.filtreStatut || r.id_statut === this.filtreStatut;
      return hotelOk && statutOk;
    });
  }

  /** Applique le filtre par établissement */
  onFiltreHotel(valeur: string) {
    this.filtreHotel = valeur ? Number(valeur) : null;
    this.cdr.markForCheck();
  }

  /** Applique le filtre par statut */
  onFiltreStatut(valeur: string) {
    this.filtreStatut = valeur ? Number(valeur) : null;
    this.cdr.markForCheck();
  }

  // ==========================================================================
  // CHANGEMENT DE STATUT
  // ==========================================================================

  /**
   * Change le statut d'une réservation.
   *
   * Le serveur vérifie deux choses avant d'écrire : le rôle, puis le fait que
   * la réservation relève bien d'un établissement du compte. Un 403 signifie
   * que la seconde condition n'est pas remplie.
   *
   * @param reservation - Réservation concernée
   * @param valeur - Identifiant du nouveau statut
   */
  changerStatut(reservation: any, valeur: string) {
    const nouveauStatut = Number(valeur);
    if (!nouveauStatut || nouveauStatut === reservation.id_statut) return;

    this.error = '';
    this.successMessage = '';

    this.reservationService
      .updateReservationStatus(reservation.id_reservation, nouveauStatut)
      .subscribe({
        next: () => {
          this.successMessage = `Réservation ${reservation.num_confirmation} mise à jour`;
          this.chargerReservations();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error = err?.error?.message || 'Erreur lors du changement de statut';
          this.cdr.markForCheck();
        },
      });
  }

  // ==========================================================================
  // AFFICHAGE
  // ==========================================================================

  /**
   * Classe Bootstrap correspondant à un statut.
   * @param idStatut - Identifiant du statut
   * @returns {string} Classe de badge
   */
  classeStatut(idStatut: number): string {
    switch (idStatut) {
      case 1:
        return 'bg-warning text-dark';
      case 2:
        return 'bg-success';
      case 3:
        return 'bg-danger';
      case 4:
        return 'bg-danger';
      case 5:
        return 'bg-secondary';
      case 6:
        return 'bg-info';
      default:
        return 'bg-light text-dark';
    }
  }

  /** Nombre de réservations par statut, pour les compteurs d'en-tête */
  compte(idStatut: number): number {
    return this.reservations.filter((r) => r.id_statut === idStatut).length;
  }
}

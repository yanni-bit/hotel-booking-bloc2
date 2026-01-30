// ============================================================================
// FICHIER : admin.component.ts
// DESCRIPTION : Composant tableau de bord administration - Affiche les
//               statistiques globales et les accès rapides aux modules de gestion
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// STRATÉGIE : OnPush pour optimisation des performances
// SERVICES INJECTÉS :
//   - AuthService : Gestion authentification et utilisateurs
//   - HttpClient : Requêtes HTTP directes (hôtels)
//   - ContactService : Gestion des messages de contact
//   - AvisService : Gestion des avis clients
//   - ReservationService : Gestion des réservations
//   - ServiceService : Gestion des services additionnels
// ============================================================================

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { ContactService } from '../../services/contact.service';
import { AvisService } from '../../services/avis';
import { ReservationService } from '../../services/reservation';
import { ServiceService } from '../../services/service';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Admin implements OnInit {
  // ==========================================================================
  // PROPRIÉTÉS
  // ==========================================================================

  /**
   * Objet contenant toutes les statistiques du dashboard
   * @property {number} hotels - Nombre total d'hôtels
   * @property {number} reservations - Nombre total de réservations
   * @property {number} users - Nombre total d'utilisateurs
   * @property {number} services - Nombre total de services
   * @property {number} messages - Nombre total de messages
   * @property {number} messagesUnread - Nombre de messages non lus
   * @property {number} avis - Nombre total d'avis
   * @property {number} avisNew - Nombre de nouveaux avis
   */
  stats = {
    hotels: 0,
    reservations: 0,
    users: 0,
    services: 0,
    messages: 0,
    messagesUnread: 0,
    avis: 0,
    avisNew: 0,
  };

  /** Indicateur de chargement des données */
  loading: boolean = true;

  // ==========================================================================
  // CONSTRUCTEUR
  // ==========================================================================

  /**
   * Injection des dépendances
   * @param {AuthService} authService - Service d'authentification (public pour le template)
   * @param {HttpClient} http - Client HTTP Angular
   * @param {ContactService} contactService - Service de gestion des contacts
   * @param {AvisService} avisService - Service de gestion des avis
   * @param {ReservationService} reservationService - Service de gestion des réservations
   * @param {ServiceService} serviceService - Service de gestion des services
   * @param {ChangeDetectorRef} cdr - Référence pour déclencher la détection de changements
   */
  constructor(
    public authService: AuthService,
    private http: HttpClient,
    private contactService: ContactService,
    private avisService: AvisService,
    private reservationService: ReservationService,
    private serviceService: ServiceService,
    private cdr: ChangeDetectorRef,
  ) {}

  // ==========================================================================
  // CYCLE DE VIE
  // ==========================================================================

  /**
   * Initialisation du composant
   * Déclenche le chargement des statistiques
   */
  ngOnInit() {
    this.loadStats();
  }

  // ==========================================================================
  // MÉTHODES PRIVÉES
  // ==========================================================================

  /**
   * Charge toutes les statistiques du dashboard en parallèle
   * Utilise markForCheck() pour la stratégie OnPush
   */
  loadStats() {
    // -------------------------------------------------------------------------
    // Chargement des statistiques de messages
    // -------------------------------------------------------------------------
    this.contactService.getAllMessages().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.stats.messages = response.data.length;
          this.stats.messagesUnread = response.data.filter((m: any) => m.lu === 0).length;
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Erreur chargement messages:', err),
    });

    // -------------------------------------------------------------------------
    // Chargement des statistiques des avis
    // -------------------------------------------------------------------------
    this.avisService.getAllAvis().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.stats.avis = response.data.length;
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Erreur chargement avis:', err),
    });

    // -------------------------------------------------------------------------
    // Chargement du compteur de nouveaux avis
    // -------------------------------------------------------------------------
    this.avisService.countNewAvis().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.stats.avisNew = response.data.newCount;
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Erreur comptage avis:', err),
    });

    // -------------------------------------------------------------------------
    // Chargement des statistiques de réservations
    // -------------------------------------------------------------------------
    this.reservationService.getAllReservations().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.stats.reservations = response.data.length;
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Erreur chargement réservations:', err),
    });

    // -------------------------------------------------------------------------
    // Chargement des statistiques utilisateurs
    // -------------------------------------------------------------------------
    this.authService.getAllUsers().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.stats.users = response.data.length;
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Erreur chargement utilisateurs:', err),
    });

    // -------------------------------------------------------------------------
    // Chargement des statistiques hôtels (désactive le loading à la fin)
    // -------------------------------------------------------------------------
    this.http.get<any>('http://localhost:3000/api/hotels').subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.stats.hotels = response.data.length;
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Erreur chargement hôtels:', err);
        this.loading = false;
        this.cdr.markForCheck();
      },
    });

    // -------------------------------------------------------------------------
    // Chargement des statistiques services
    // -------------------------------------------------------------------------
    this.serviceService.getAllServices().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.stats.services = response.data.length;
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Erreur chargement services:', err),
    });
  }
}

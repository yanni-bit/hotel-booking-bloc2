// ============================================================================
// FICHIER : admin-messages.component.ts
// DESCRIPTION : Composant de gestion des messages de contact - Interface admin
//               pour visualiser, filtrer, traiter et supprimer les messages
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// STRATÉGIE : OnPush pour optimisation des performances
// SERVICES INJECTÉS :
//   - ContactService : CRUD des messages de contact
// FONCTIONNALITÉS :
//   - Liste des messages avec filtres (statut, sujet, recherche)
//   - Visualisation détaillée dans un modal
//   - Marquage automatique comme lu à l'ouverture
//   - Marquage comme traité
//   - Suppression de message
// ============================================================================

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactService, ContactMessageResponse } from '../../services/contact.service';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-messages.html',
  styleUrl: './admin-messages.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMessages implements OnInit {
  // ==========================================================================
  // PROPRIÉTÉS - DONNÉES
  // ==========================================================================

  /** Liste complète des messages */
  messages: ContactMessageResponse[] = [];

  /** Liste des messages après application des filtres */
  filteredMessages: ContactMessageResponse[] = [];

  /** Indicateur de chargement */
  loading: boolean = true;

  /** Message d'erreur */
  error: string = '';

  // ==========================================================================
  // PROPRIÉTÉS - FILTRES
  // ==========================================================================

  /** Filtre par statut : 'all' | 'unread' | 'read' | 'untreated' | 'treated' */
  filterStatus: string = 'all';

  /** Filtre par sujet : 'all' | 'reservation' | 'information' | 'reclamation' | 'autre' */
  filterSubject: string = 'all';

  /** Terme de recherche textuelle */
  searchTerm: string = '';

  // ==========================================================================
  // PROPRIÉTÉS - MODAL
  // ==========================================================================

  /** Message sélectionné pour affichage dans le modal */
  selectedMessage: ContactMessageResponse | null = null;

  // ==========================================================================
  // PROPRIÉTÉS - CONFIGURATION
  // ==========================================================================

  /**
   * Liste des sujets de contact disponibles
   * Utilisée pour les filtres et l'affichage des badges
   */
  sujets = [
    { value: 'reservation', label: 'Réservation' },
    { value: 'information', label: "Demande d'information" },
    { value: 'reclamation', label: 'Réclamation' },
    { value: 'autre', label: 'Autre' },
  ];

  // ==========================================================================
  // CONSTRUCTEUR
  // ==========================================================================

  /**
   * Injection des dépendances
   * @param {ContactService} contactService - Service de gestion des messages
   * @param {ChangeDetectorRef} cdr - Référence pour la détection de changements
   */
  constructor(
    private contactService: ContactService,
    private cdr: ChangeDetectorRef,
  ) {}

  // ==========================================================================
  // CYCLE DE VIE
  // ==========================================================================

  /**
   * Initialisation du composant
   * Déclenche le chargement des messages
   */
  ngOnInit() {
    this.loadMessages();
  }

  // ==========================================================================
  // MÉTHODES - CHARGEMENT DES DONNÉES
  // ==========================================================================

  /**
   * Charge tous les messages depuis l'API
   * Applique les filtres après chargement
   */
  loadMessages() {
    this.loading = true;

    this.contactService.getAllMessages().subscribe({
      next: (response) => {
        console.log('✅ Messages:', response);
        this.messages = response.data || [];
        this.applyFilters();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.error = 'Erreur lors du chargement des messages';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ==========================================================================
  // MÉTHODES - FILTRAGE
  // ==========================================================================

  /**
   * Applique tous les filtres actifs sur la liste des messages
   * Filtres combinés : statut + sujet + recherche textuelle
   */
  applyFilters() {
    let filtered = [...this.messages];

    // -------------------------------------------------------------------------
    // Filtre par statut (lu/non lu/traité/non traité)
    // -------------------------------------------------------------------------
    if (this.filterStatus === 'unread') {
      filtered = filtered.filter((m) => m.lu === 0);
    } else if (this.filterStatus === 'read') {
      filtered = filtered.filter((m) => m.lu === 1);
    } else if (this.filterStatus === 'treated') {
      filtered = filtered.filter((m) => m.traite === 1);
    } else if (this.filterStatus === 'untreated') {
      filtered = filtered.filter((m) => m.traite === 0);
    }

    // -------------------------------------------------------------------------
    // Filtre par sujet
    // -------------------------------------------------------------------------
    if (this.filterSubject !== 'all') {
      filtered = filtered.filter((m) => m.sujet === this.filterSubject);
    }

    // -------------------------------------------------------------------------
    // Filtre par recherche textuelle
    // -------------------------------------------------------------------------
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.nom.toLowerCase().includes(term) ||
          m.email.toLowerCase().includes(term) ||
          m.message.toLowerCase().includes(term) ||
          (m.telephone && m.telephone.toLowerCase().includes(term)),
      );
    }

    this.filteredMessages = filtered;
    this.cdr.markForCheck();
  }

  /**
   * Handler appelé lors du changement d'un filtre
   */
  onFilterChange() {
    this.applyFilters();
  }

  // ==========================================================================
  // MÉTHODES - GESTION DU MODAL
  // ==========================================================================

  /**
   * Ouvre le modal avec les détails d'un message
   * Marque automatiquement le message comme lu
   * @param {ContactMessageResponse} message - Message à afficher
   */
  viewMessage(message: ContactMessageResponse) {
    this.selectedMessage = message;

    // Marquer comme lu si non lu
    if (message.lu === 0) {
      this.contactService.markAsRead(message.id_message).subscribe({
        next: () => {
          message.lu = 1;
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Erreur marquage lu:', err),
      });
    }
  }

  /**
   * Ferme le modal de détail
   */
  closeModal() {
    this.selectedMessage = null;
  }

  // ==========================================================================
  // MÉTHODES - ACTIONS CRUD
  // ==========================================================================

  /**
   * Marque un message comme traité
   * @param {ContactMessageResponse} message - Message à marquer
   */
  markAsTreated(message: ContactMessageResponse) {
    this.contactService.markAsTreated(message.id_message).subscribe({
      next: () => {
        message.traite = 1;
        alert('Message marqué comme traité');
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        alert('Erreur lors de la mise à jour');
      },
    });
  }

  /**
   * Supprime un message après confirmation
   * @param {ContactMessageResponse} message - Message à supprimer
   */
  deleteMessage(message: ContactMessageResponse) {
    if (!confirm(`Voulez-vous vraiment supprimer ce message de "${message.nom}" ?`)) {
      return;
    }

    this.contactService.deleteMessage(message.id_message).subscribe({
      next: () => {
        alert('Message supprimé');
        this.selectedMessage = null;
        this.loadMessages();
      },
      error: (err) => {
        console.error('❌ Erreur suppression:', err);
        alert('Erreur lors de la suppression');
      },
    });
  }

  // ==========================================================================
  // MÉTHODES - UTILITAIRES D'AFFICHAGE
  // ==========================================================================

  /**
   * Formate une date au format français avec heure
   * @param {string} date - Date ISO à formater
   * @returns {string} Date formatée (JJ/MM/AAAA HH:MM)
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Retourne le libellé français d'un sujet
   * @param {string} sujet - Code du sujet
   * @returns {string} Libellé traduit
   */
  getSujetLabel(sujet: string): string {
    const found = this.sujets.find((s) => s.value === sujet);
    return found ? found.label : sujet;
  }

  /**
   * Retourne la classe CSS du badge selon le sujet
   * @param {string} sujet - Code du sujet
   * @returns {string} Classe CSS Bootstrap
   */
  getSujetBadgeClass(sujet: string): string {
    const colorMap: any = {
      reservation: 'bg-primary',
      information: 'bg-info',
      reclamation: 'bg-danger',
      autre: 'bg-secondary',
    };
    return colorMap[sujet] || 'bg-secondary';
  }

  /**
   * Compte le nombre de messages non lus
   * @returns {number} Nombre de messages non lus
   */
  getUnreadCount(): number {
    return this.messages.filter((m) => m.lu === 0).length;
  }
}

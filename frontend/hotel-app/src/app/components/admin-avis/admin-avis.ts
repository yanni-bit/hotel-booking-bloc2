// ============================================================================
// FICHIER : admin-avis.component.ts
// DESCRIPTION : Composant de gestion des avis clients - Interface admin pour
//               visualiser, filtrer et modérer les avis des utilisateurs
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// STRATÉGIE : OnPush pour optimisation des performances
// SERVICES INJECTÉS :
//   - AvisService : CRUD des avis clients
// FONCTIONNALITÉS :
//   - Liste des avis avec filtres (période, note, recherche)
//   - Visualisation détaillée dans un modal
//   - Suppression d'avis
//   - Compteur de nouveaux avis (7 derniers jours)
// ============================================================================

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AvisService, AvisResponse } from '../../services/avis';

@Component({
  selector: 'app-admin-avis',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-avis.html',
  styleUrl: './admin-avis.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAvis implements OnInit {
  // ==========================================================================
  // PROPRIÉTÉS - DONNÉES
  // ==========================================================================

  /** Liste complète des avis */
  avis: AvisResponse[] = [];

  /** Liste des avis après application des filtres */
  filteredAvis: AvisResponse[] = [];

  /** Indicateur de chargement */
  loading: boolean = true;

  /** Message d'erreur */
  error: string = '';

  // ==========================================================================
  // PROPRIÉTÉS - FILTRES
  // ==========================================================================

  /** Filtre par période : 'all' | 'recent' (7j) | 'month' (30j) */
  filterPeriod: string = 'all';

  /** Filtre par note : 'all' | 'high' (8+) | 'medium' (5-7) | 'low' (<5) */
  filterNote: string = 'all';

  /** Terme de recherche textuelle */
  searchTerm: string = '';

  // ==========================================================================
  // PROPRIÉTÉS - MODAL
  // ==========================================================================

  /** Avis sélectionné pour affichage dans le modal */
  selectedAvis: AvisResponse | null = null;

  // ==========================================================================
  // PROPRIÉTÉS - STATISTIQUES
  // ==========================================================================

  /** Nombre de nouveaux avis (7 derniers jours) */
  newAvisCount: number = 0;

  // ==========================================================================
  // PROPRIÉTÉS - CONFIGURATION
  // ==========================================================================

  /**
   * Mapping des types de voyageurs pour l'affichage
   * Valeurs possibles : couple, famille, solo, business, groupe, autre
   */
  typesVoyageur = [
    { value: 'couple', label: 'Couple' },
    { value: 'famille', label: 'Famille' },
    { value: 'solo', label: 'Solo' },
    { value: 'business', label: 'Business' },
    { value: 'groupe', label: 'Groupe' },
    { value: 'autre', label: 'Autre' },
  ];

  // ==========================================================================
  // CONSTRUCTEUR
  // ==========================================================================

  /**
   * Injection des dépendances
   * @param {AvisService} avisService - Service de gestion des avis
   * @param {ChangeDetectorRef} cdr - Référence pour la détection de changements
   */
  constructor(
    private avisService: AvisService,
    private cdr: ChangeDetectorRef,
  ) {}

  // ==========================================================================
  // CYCLE DE VIE
  // ==========================================================================

  /**
   * Initialisation du composant
   * Charge les avis et le compteur de nouveaux avis
   */
  ngOnInit() {
    this.loadAvis();
    this.loadNewCount();
  }

  // ==========================================================================
  // MÉTHODES - CHARGEMENT DES DONNÉES
  // ==========================================================================

  /**
   * Charge tous les avis depuis l'API
   * Applique les filtres après chargement
   */
  loadAvis() {
    this.loading = true;

    this.avisService.getAllAvis().subscribe({
      next: (response: any) => {
        console.log('✅ Avis:', response);
        this.avis = response.data || [];
        this.applyFilters();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('❌ Erreur:', err);
        this.error = 'Erreur lors du chargement des avis';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Charge le nombre de nouveaux avis (7 derniers jours)
   */
  loadNewCount() {
    this.avisService.countNewAvis().subscribe({
      next: (response: any) => {
        this.newAvisCount = response.data?.newCount || 0;
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Erreur comptage:', err),
    });
  }

  // ==========================================================================
  // MÉTHODES - FILTRAGE
  // ==========================================================================

  /**
   * Applique tous les filtres actifs sur la liste des avis
   * Filtres combinés : période + note + recherche textuelle
   */
  applyFilters() {
    let filtered = [...this.avis];

    // -------------------------------------------------------------------------
    // Filtre par période
    // -------------------------------------------------------------------------
    if (this.filterPeriod === 'recent') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter((a) => new Date(a.date_avis) >= sevenDaysAgo);
    } else if (this.filterPeriod === 'month') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter((a) => new Date(a.date_avis) >= thirtyDaysAgo);
    }

    // -------------------------------------------------------------------------
    // Filtre par note
    // -------------------------------------------------------------------------
    if (this.filterNote === 'high') {
      filtered = filtered.filter((a) => Number(a.note) >= 8);
    } else if (this.filterNote === 'medium') {
      filtered = filtered.filter((a) => Number(a.note) >= 5 && Number(a.note) < 8);
    } else if (this.filterNote === 'low') {
      filtered = filtered.filter((a) => Number(a.note) < 5);
    }

    // -------------------------------------------------------------------------
    // Filtre par recherche textuelle
    // -------------------------------------------------------------------------
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.pseudo_user.toLowerCase().includes(term) ||
          (a.nom_hotel && a.nom_hotel.toLowerCase().includes(term)) ||
          (a.commentaire && a.commentaire.toLowerCase().includes(term)) ||
          (a.titre_avis && a.titre_avis.toLowerCase().includes(term)),
      );
    }

    this.filteredAvis = filtered;
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
   * Ouvre le modal avec les détails d'un avis
   * @param {AvisResponse} avis - Avis à afficher
   */
  viewAvis(avis: AvisResponse) {
    this.selectedAvis = avis;
  }

  /**
   * Ferme le modal de détail
   */
  closeModal() {
    this.selectedAvis = null;
  }

  // ==========================================================================
  // MÉTHODES - ACTIONS CRUD
  // ==========================================================================

  /**
   * Supprime un avis après confirmation
   * @param {AvisResponse} avis - Avis à supprimer
   */
  deleteAvis(avis: AvisResponse) {
    if (!confirm(`Voulez-vous vraiment supprimer cet avis de "${avis.pseudo_user}" ?`)) {
      return;
    }

    this.avisService.deleteAvis(avis.id_avis).subscribe({
      next: () => {
        alert('Avis supprimé');
        this.selectedAvis = null;
        this.loadAvis();
        this.loadNewCount();
      },
      error: (err: any) => {
        console.error('❌ Erreur suppression:', err);
        alert('Erreur lors de la suppression');
      },
    });
  }

  // ==========================================================================
  // MÉTHODES - UTILITAIRES D'AFFICHAGE
  // ==========================================================================

  /**
   * Formate une date au format français (JJ/MM/AAAA)
   * @param {string} date - Date ISO à formater
   * @returns {string} Date formatée ou '-' si invalide
   */
  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Retourne le libellé français d'un type de voyageur
   * @param {string} type - Code du type de voyageur
   * @returns {string} Libellé traduit
   */
  getTypeVoyageurLabel(type: string): string {
    const found = this.typesVoyageur.find((t) => t.value === type);
    return found ? found.label : type;
  }

  /**
   * Retourne la classe CSS Bootstrap selon la note
   * @param {number} note - Note de 0 à 10
   * @returns {string} Classe CSS (bg-success/bg-warning/bg-danger)
   */
  getNoteClass(note: number): string {
    if (note >= 8) return 'bg-success';
    if (note >= 5) return 'bg-warning text-dark';
    return 'bg-danger';
  }

  /**
   * Getter pour le compteur de nouveaux avis
   * @returns {number} Nombre de nouveaux avis
   */
  getNewCount(): number {
    return this.newAvisCount;
  }

  /**
   * Vérifie si un avis provient d'un utilisateur inscrit
   * @param {AvisResponse} avis - Avis à vérifier
   * @returns {boolean} True si avis d'un utilisateur inscrit
   */
  isUserAvis(avis: AvisResponse): boolean {
    return avis.id_user !== null && avis.id_user !== undefined;
  }
}

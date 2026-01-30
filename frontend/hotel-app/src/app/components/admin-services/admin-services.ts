// ============================================================================
// FICHIER : admin-services.component.ts
// DESCRIPTION : Composant de gestion des services additionnels - Interface admin
//               pour créer, modifier, activer/désactiver et supprimer les services
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// STRATÉGIE : OnPush pour optimisation des performances
// SERVICES INJECTÉS :
//   - ServiceService : CRUD des services additionnels
// FONCTIONNALITÉS :
//   - Liste des services avec tableau
//   - Création/Édition via modal
//   - Toggle statut actif/inactif
//   - Suppression avec confirmation
//   - Configuration icônes et types de tarification
// ============================================================================

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ServiceService } from '../../services/service';

@Component({
  selector: 'app-admin-services',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-services.html',
  styleUrl: './admin-services.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminServices implements OnInit {
  // ==========================================================================
  // PROPRIÉTÉS - DONNÉES
  // ==========================================================================

  /** Liste des services */
  services: any[] = [];

  /** Indicateur de chargement */
  loading: boolean = true;

  /** Message d'erreur */
  error: string = '';

  /** Message de succès */
  successMessage: string = '';

  // ==========================================================================
  // PROPRIÉTÉS - MODAL CRÉATION/ÉDITION
  // ==========================================================================

  /** Affichage du modal de création/édition */
  showModal: boolean = false;

  /** Mode du modal : 'create' | 'edit' */
  modalMode: 'create' | 'edit' = 'create';

  /** Service en cours d'édition/création */
  currentService: any = {};

  // ==========================================================================
  // PROPRIÉTÉS - MODAL SUPPRESSION
  // ==========================================================================

  /** Affichage du modal de suppression */
  showDeleteModal: boolean = false;

  /** Service à supprimer */
  serviceToDelete: any = null;

  // ==========================================================================
  // PROPRIÉTÉS - CONFIGURATION
  // ==========================================================================

  /**
   * Types de tarification disponibles
   * @property {string} value - Valeur stockée en BDD
   * @property {string} label - Libellé affiché
   */
  typeServices = [
    { value: 'journalier', label: 'Par jour' },
    { value: 'sejour', label: 'Par séjour' },
    { value: 'unitaire', label: 'Unitaire' },
    { value: 'par_personne', label: 'Par personne/jour' },
  ];

  /**
   * Icônes Bootstrap disponibles pour les services
   * @property {string} value - Classe CSS de l'icône
   * @property {string} label - Libellé descriptif
   */
  icones = [
    { value: 'bi-p-circle', label: 'Parking' },
    { value: 'bi-cup-hot', label: 'Petit-déjeuner' },
    { value: 'bi-droplet', label: 'Spa' },
    { value: 'bi-taxi-front', label: 'Taxi/Transfert' },
    { value: 'bi-clock-history', label: 'Horloge' },
    { value: 'bi-wifi', label: 'WiFi' },
    { value: 'bi-tv', label: 'TV' },
    { value: 'bi-snow', label: 'Climatisation' },
    { value: 'bi-bicycle', label: 'Vélo' },
    { value: 'bi-basket', label: 'Panier' },
    { value: 'bi-star', label: 'Étoile' },
    { value: 'bi-heart', label: 'Cœur' },
  ];

  // ==========================================================================
  // CONSTRUCTEUR
  // ==========================================================================

  /**
   * Injection des dépendances
   * @param {ServiceService} serviceService - Service de gestion des services additionnels
   * @param {ChangeDetectorRef} cdr - Référence pour la détection de changements
   */
  constructor(
    private serviceService: ServiceService,
    private cdr: ChangeDetectorRef,
  ) {}

  // ==========================================================================
  // CYCLE DE VIE
  // ==========================================================================

  /**
   * Initialisation du composant
   * Déclenche le chargement des services
   */
  ngOnInit() {
    this.loadServices();
  }

  // ==========================================================================
  // MÉTHODES - CHARGEMENT DES DONNÉES
  // ==========================================================================

  /**
   * Charge tous les services depuis l'API
   */
  loadServices() {
    this.loading = true;

    this.serviceService.getAllServices().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.services = response.data;
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement services:', err);
        this.error = 'Erreur lors du chargement des services';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ==========================================================================
  // MÉTHODES - MODAL CRÉATION/ÉDITION
  // ==========================================================================

  /**
   * Ouvre le modal en mode création
   * Initialise un service vide avec valeurs par défaut
   */
  openCreateModal() {
    this.modalMode = 'create';
    this.currentService = {
      nom_service: '',
      description_service: '',
      type_service: 'unitaire',
      icone_service: 'bi-star',
      actif: 1,
    };
    this.showModal = true;
    this.cdr.markForCheck();
  }

  /**
   * Ouvre le modal en mode édition
   * @param {any} service - Service à modifier
   */
  openEditModal(service: any) {
    this.modalMode = 'edit';
    this.currentService = { ...service };
    this.showModal = true;
    this.cdr.markForCheck();
  }

  /**
   * Ferme le modal de création/édition
   */
  closeModal() {
    this.showModal = false;
    this.currentService = {};
    this.cdr.markForCheck();
  }

  /**
   * Sauvegarde le service (création ou modification)
   * Valide que le nom est renseigné
   */
  saveService() {
    // Validation du nom (champ obligatoire)
    if (!this.currentService.nom_service) {
      this.error = 'Le nom du service est requis';
      setTimeout(() => {
        this.error = '';
        this.cdr.markForCheck();
      }, 3000);
      return;
    }

    // -------------------------------------------------------------------------
    // Mode création
    // -------------------------------------------------------------------------
    if (this.modalMode === 'create') {
      this.serviceService.createService(this.currentService).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.successMessage = 'Service créé avec succès';
            this.loadServices();
            this.closeModal();

            setTimeout(() => {
              this.successMessage = '';
              this.cdr.markForCheck();
            }, 3000);
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur création:', err);
          this.error = 'Erreur lors de la création';
          setTimeout(() => {
            this.error = '';
            this.cdr.markForCheck();
          }, 3000);
        },
      });
    }
    // -------------------------------------------------------------------------
    // Mode édition
    // -------------------------------------------------------------------------
    else {
      this.serviceService
        .updateService(this.currentService.id_service, this.currentService)
        .subscribe({
          next: (response: any) => {
            if (response.success) {
              this.successMessage = 'Service modifié avec succès';
              this.loadServices();
              this.closeModal();

              setTimeout(() => {
                this.successMessage = '';
                this.cdr.markForCheck();
              }, 3000);
            }
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Erreur modification:', err);
            this.error = 'Erreur lors de la modification';
            setTimeout(() => {
              this.error = '';
              this.cdr.markForCheck();
            }, 3000);
          },
        });
    }
  }

  // ==========================================================================
  // MÉTHODES - TOGGLE STATUT
  // ==========================================================================

  /**
   * Bascule le statut actif/inactif d'un service
   * @param {any} service - Service à modifier
   */
  toggleStatus(service: any) {
    const newStatus = service.actif ? 0 : 1;

    this.serviceService.toggleServiceStatus(service.id_service, newStatus).subscribe({
      next: (response: any) => {
        if (response.success) {
          service.actif = newStatus;
          this.successMessage = newStatus ? 'Service activé' : 'Service désactivé';

          setTimeout(() => {
            this.successMessage = '';
            this.cdr.markForCheck();
          }, 3000);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur toggle:', err);
        this.error = 'Erreur lors de la modification du statut';
        setTimeout(() => {
          this.error = '';
          this.cdr.markForCheck();
        }, 3000);
      },
    });
  }

  // ==========================================================================
  // MÉTHODES - SUPPRESSION
  // ==========================================================================

  /**
   * Ouvre le modal de confirmation de suppression
   * @param {any} service - Service à supprimer
   */
  openDeleteModal(service: any) {
    this.serviceToDelete = service;
    this.showDeleteModal = true;
    this.cdr.markForCheck();
  }

  /**
   * Ferme le modal de suppression
   */
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.serviceToDelete = null;
    this.cdr.markForCheck();
  }

  /**
   * Confirme et exécute la suppression du service
   */
  confirmDelete() {
    if (!this.serviceToDelete) return;

    this.serviceService.deleteService(this.serviceToDelete.id_service).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.successMessage = 'Service supprimé avec succès';
          this.loadServices();
          this.closeDeleteModal();

          setTimeout(() => {
            this.successMessage = '';
            this.cdr.markForCheck();
          }, 3000);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur suppression:', err);
        this.error = 'Erreur lors de la suppression';
        this.closeDeleteModal();
        setTimeout(() => {
          this.error = '';
          this.cdr.markForCheck();
        }, 3000);
      },
    });
  }

  // ==========================================================================
  // MÉTHODES - UTILITAIRES D'AFFICHAGE
  // ==========================================================================

  /**
   * Retourne le libellé d'un type de tarification
   * @param {string} type - Code du type
   * @returns {string} Libellé traduit
   */
  getTypeLabel(type: string): string {
    const found = this.typeServices.find((t) => t.value === type);
    return found ? found.label : type;
  }
}

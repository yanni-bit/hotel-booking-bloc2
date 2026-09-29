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
  // PROPRIÉTÉS - CATÉGORIES
  //
  // La catégorie regroupe les services par nature. Elle est distincte du type
  // de tarification, qui pilote le calcul des prix et ne doit pas bouger.
  // ==========================================================================

  /** Catégories actives, alimentant le filtre et la liste déroulante */
  categories: any[] = [];

  /** Catégorie sélectionnée dans le filtre, null = toutes */
  filtreCategorie: number | null = null;

  // ==========================================================================
  // PROPRIÉTÉS - MODAL DE GESTION DES CATÉGORIES
  // ==========================================================================

  /** Affichage du modal de gestion des catégories */
  showCategoriesModal: boolean = false;

  /** Catégories avec leur nombre de services rattachés (vue administration) */
  categoriesAdmin: any[] = [];

  /** Libellé saisi pour la création d'une catégorie */
  nouveauNomCategorie: string = '';

  /** Catégorie en cours de renommage, null si aucune */
  categorieEnEdition: any = null;

  /** Message d'erreur propre au modal des catégories */
  categorieError: string = '';

  /** Message de succès propre au modal des catégories */
  categorieSuccess: string = '';

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
    this.loadCategories();
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

    // Le filtre est appliqué côté serveur, pas en mémoire : la liste peut
    // grandir sans que l'écran ait à tout télécharger pour n'en montrer qu'une
    // partie.
    this.serviceService.getAllServices(this.filtreCategorie).subscribe({
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

  /**
   * Charge les catégories actives.
   * Alimente à la fois le menu de filtrage et la liste déroulante du modal.
   */
  loadCategories() {
    this.serviceService.getCategories().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.categories = response.data;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement catégories:', err);
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Applique le filtre par catégorie et recharge la liste.
   * @param valeur - Identifiant de catégorie, ou chaîne vide pour tout afficher
   */
  onFiltreCategorie(valeur: string) {
    this.filtreCategorie = valeur ? Number(valeur) : null;
    this.loadServices();
  }

  /**
   * Retire le filtre et recharge la liste complète.
   */
  reinitialiserFiltre() {
    this.filtreCategorie = null;
    this.loadServices();
  }

  /**
   * Retourne le libellé de la catégorie sélectionnée dans le filtre.
   * @returns {string} Libellé, ou chaîne vide si aucun filtre
   */
  libelleFiltre(): string {
    const c = this.categories.find((x) => x.id_categorie === this.filtreCategorie);
    return c ? c.nom_categorie : '';
  }

  // ==========================================================================
  // MÉTHODES - GESTION DES CATÉGORIES
  //
  // Le modal manipule `categoriesAdmin`, qui contient aussi les catégories
  // inactives et le nombre de services rattachés. La liste `categories`, elle,
  // ne sert qu'au filtre et au formulaire : elle est rechargée après chaque
  // modification pour rester cohérente.
  // ==========================================================================

  /**
   * Ouvre le modal de gestion et charge la vue administration des catégories.
   */
  openCategoriesModal() {
    this.showCategoriesModal = true;
    this.categorieError = '';
    this.categorieSuccess = '';
    this.nouveauNomCategorie = '';
    this.categorieEnEdition = null;
    this.loadCategoriesAdmin();
  }

  /**
   * Ferme le modal et rafraîchit la liste des services, dont les libellés de
   * catégorie ont pu changer.
   */
  closeCategoriesModal() {
    this.showCategoriesModal = false;
    this.categorieEnEdition = null;
    this.loadCategories();
    this.loadServices();
    this.cdr.markForCheck();
  }

  /**
   * Charge les catégories avec leur nombre de services.
   */
  loadCategoriesAdmin() {
    this.serviceService.getCategoriesAdmin().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.categoriesAdmin = response.data;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement catégories admin:', err);
        this.categorieError = 'Erreur lors du chargement des catégories';
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Crée une catégorie à partir du libellé saisi.
   * Le code technique est déduit du libellé côté serveur.
   */
  creerCategorie() {
    const nom = this.nouveauNomCategorie.trim();
    this.categorieError = '';
    this.categorieSuccess = '';

    if (!nom) {
      this.categorieError = 'Le nom de la catégorie est obligatoire';
      this.cdr.markForCheck();
      return;
    }

    const ordre = this.categoriesAdmin.length + 1;

    this.serviceService
      .createCategorie({ nom_categorie: nom, ordre_affichage: ordre, actif: 1 })
      .subscribe({
        next: () => {
          this.categorieSuccess = 'Catégorie créée';
          this.nouveauNomCategorie = '';
          this.loadCategoriesAdmin();
          this.cdr.markForCheck();
        },
        error: (err) => {
          // 409 quand le code déduit existe déjà.
          this.categorieError = err?.error?.message || 'Erreur lors de la création';
          this.cdr.markForCheck();
        },
      });
  }

  /**
   * Passe une catégorie en mode renommage.
   * @param categorie - Catégorie à modifier
   */
  editerCategorie(categorie: any) {
    this.categorieEnEdition = { ...categorie };
    this.categorieError = '';
    this.categorieSuccess = '';
    this.cdr.markForCheck();
  }

  /**
   * Abandonne le renommage en cours.
   */
  annulerEdition() {
    this.categorieEnEdition = null;
    this.cdr.markForCheck();
  }

  /**
   * Enregistre le renommage ou le changement d'activité.
   * Le code technique n'est pas transmis : il n'est pas modifiable.
   */
  enregistrerCategorie() {
    if (!this.categorieEnEdition) return;

    const nom = String(this.categorieEnEdition.nom_categorie || '').trim();
    if (!nom) {
      this.categorieError = 'Le nom de la catégorie est obligatoire';
      this.cdr.markForCheck();
      return;
    }

    this.serviceService
      .updateCategorie(this.categorieEnEdition.id_categorie, {
        nom_categorie: nom,
        ordre_affichage: this.categorieEnEdition.ordre_affichage,
        actif: this.categorieEnEdition.actif,
      })
      .subscribe({
        next: () => {
          this.categorieSuccess = 'Catégorie modifiée';
          this.categorieError = '';
          this.categorieEnEdition = null;
          this.loadCategoriesAdmin();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.categorieError = err?.error?.message || 'Erreur lors de la modification';
          this.cdr.markForCheck();
        },
      });
  }

  /**
   * Supprime une catégorie.
   *
   * Le serveur répond 409 si elle est rattachée à au moins un service, au
   * titre de la contrainte ON DELETE RESTRICT. Le message renvoyé est affiché
   * tel quel : c'est une règle métier, pas une panne.
   *
   * @param categorie - Catégorie à supprimer
   */
  supprimerCategorie(categorie: any) {
    this.categorieError = '';
    this.categorieSuccess = '';

    this.serviceService.deleteCategorie(categorie.id_categorie).subscribe({
      next: () => {
        this.categorieSuccess = 'Catégorie supprimée';
        // Si le filtre portait sur elle, il n'a plus d'objet.
        if (this.filtreCategorie === categorie.id_categorie) {
          this.filtreCategorie = null;
        }
        this.loadCategoriesAdmin();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.categorieError = err?.error?.message || 'Erreur lors de la suppression';
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
      id_categorie: this.filtreCategorie,
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

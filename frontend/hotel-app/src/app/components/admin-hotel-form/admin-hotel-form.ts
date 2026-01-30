// ============================================================================
// FICHIER : admin-hotel-form.component.ts
// DESCRIPTION : Formulaire de création/édition d'un hôtel - Gestion complète
//               des informations hôtel et de ses services associés
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// STRATÉGIE : OnPush pour optimisation des performances
// SERVICES INJECTÉS :
//   - HotelAdminService : CRUD des hôtels et services associés
//   - ActivatedRoute : Récupération de l'ID en mode édition
//   - Router : Navigation après soumission
// MODES :
//   - Création : Nouveau formulaire vide
//   - Édition : Chargement des données existantes + gestion des services
// ============================================================================

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HotelAdminService } from '../../services/admin-hotels';

@Component({
  selector: 'app-admin-hotel-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-hotel-form.html',
  styleUrl: './admin-hotel-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHotelForm implements OnInit {
  // ==========================================================================
  // PROPRIÉTÉS - MODE DU FORMULAIRE
  // ==========================================================================

  /** True si édition d'un hôtel existant, False si création */
  isEditMode: boolean = false;

  /** ID de l'hôtel en cours d'édition (null si création) */
  hotelId: number | null = null;

  // ==========================================================================
  // PROPRIÉTÉS - DONNÉES DU FORMULAIRE
  // ==========================================================================

  /**
   * Objet contenant toutes les données du formulaire hôtel
   * @property {string} nom_hotel - Nom de l'hôtel (obligatoire)
   * @property {string} description_hotel - Description détaillée
   * @property {string} rue_hotel - Adresse rue
   * @property {string} code_postal_hotel - Code postal
   * @property {string} ville_hotel - Ville (obligatoire)
   * @property {string} pays_hotel - Pays (obligatoire)
   * @property {string} tel_hotel - Numéro de téléphone
   * @property {string} email_hotel - Adresse email
   * @property {string} site_web_hotel - URL du site web
   * @property {string} img_hotel - URL ou chemin de l'image
   * @property {number} nbre_etoile_hotel - Nombre d'étoiles (1-5)
   * @property {number|null} latitude - Coordonnée GPS latitude
   * @property {number|null} longitude - Coordonnée GPS longitude
   */
  hotel = {
    nom_hotel: '',
    description_hotel: '',
    rue_hotel: '',
    code_postal_hotel: '',
    ville_hotel: '',
    pays_hotel: '',
    tel_hotel: '',
    email_hotel: '',
    site_web_hotel: '',
    img_hotel: '',
    nbre_etoile_hotel: 3,
    latitude: null as number | null,
    longitude: null as number | null,
  };

  /** Liste des services associés à l'hôtel (mode édition uniquement) */
  hotelServices: any[] = [];

  // ==========================================================================
  // PROPRIÉTÉS - CONFIGURATION
  // ==========================================================================

  /**
   * Types de facturation des services
   * Utilisé pour l'affichage dans le tableau des services
   */
  typeServices = [
    { value: 'journalier', label: 'Par jour' },
    { value: 'sejour', label: 'Par séjour' },
    { value: 'unitaire', label: 'Unitaire' },
    { value: 'par_personne', label: 'Par personne/jour' },
  ];

  // ==========================================================================
  // PROPRIÉTÉS - ÉTATS
  // ==========================================================================

  /** Indicateur de chargement des données */
  loading: boolean = false;

  /** Indicateur de soumission en cours */
  submitting: boolean = false;

  /** Message d'erreur */
  error: string = '';

  // ==========================================================================
  // CONSTRUCTEUR
  // ==========================================================================

  /**
   * Injection des dépendances
   * @param {ActivatedRoute} route - Pour récupérer l'ID de l'hôtel depuis l'URL
   * @param {Router} router - Pour la navigation après soumission
   * @param {HotelAdminService} hotelAdminService - Service CRUD hôtels
   * @param {ChangeDetectorRef} cdr - Référence pour la détection de changements
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hotelAdminService: HotelAdminService,
    private cdr: ChangeDetectorRef,
  ) {}

  // ==========================================================================
  // CYCLE DE VIE
  // ==========================================================================

  /**
   * Initialisation du composant
   * Détecte le mode (création/édition) et charge les données si nécessaire
   */
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.hotelId = parseInt(id);
      this.loadHotel();
      this.loadHotelServices();
    }
  }

  // ==========================================================================
  // MÉTHODES - CHARGEMENT DES DONNÉES
  // ==========================================================================

  /**
   * Charge les données de l'hôtel depuis l'API
   * Mode édition uniquement
   */
  loadHotel() {
    if (!this.hotelId) return;

    this.loading = true;

    this.hotelAdminService.getById(this.hotelId).subscribe({
      next: (response) => {
        console.log('✅ Hôtel chargé:', response);
        const hotelData = response.data;

        // Mapping des données API vers le formulaire
        this.hotel = {
          nom_hotel: hotelData.nom_hotel || '',
          description_hotel: hotelData.description_hotel || '',
          rue_hotel: hotelData.rue_hotel || '',
          code_postal_hotel: hotelData.code_postal_hotel || '',
          ville_hotel: hotelData.ville_hotel || '',
          pays_hotel: hotelData.pays_hotel || '',
          tel_hotel: hotelData.tel_hotel || '',
          email_hotel: hotelData.email_hotel || '',
          site_web_hotel: hotelData.site_web_hotel || '',
          img_hotel: hotelData.img_hotel || '',
          nbre_etoile_hotel: hotelData.nbre_etoile_hotel || 3,
          latitude: hotelData.latitude || null,
          longitude: hotelData.longitude || null,
        };

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur chargement hôtel:', err);
        this.error = "Erreur lors du chargement de l'hôtel";
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Charge les services associés à l'hôtel
   * Mode édition uniquement
   */
  loadHotelServices() {
    if (!this.hotelId) return;

    this.hotelAdminService.getHotelServices(this.hotelId).subscribe({
      next: (response) => {
        console.log('✅ Services chargés (raw):', response);
        console.log(
          '✅ Premier service disponible:',
          response.data[0]?.disponible,
          typeof response.data[0]?.disponible,
        );
        this.hotelServices = response.data || [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur chargement services:', err);
      },
    });
  }

  // ==========================================================================
  // MÉTHODES - UTILITAIRES
  // ==========================================================================

  /**
   * Retourne le libellé français d'un type de service
   * @param {string} type - Code du type de service
   * @returns {string} Libellé traduit
   */
  getTypeLabel(type: string): string {
    const found = this.typeServices.find((t) => t.value === type);
    return found ? found.label : type;
  }

  // ==========================================================================
  // MÉTHODES - SOUMISSION DU FORMULAIRE
  // ==========================================================================

  /**
   * Gère la soumission du formulaire
   * Création ou mise à jour selon le mode actif
   */
  onSubmit() {
    // -------------------------------------------------------------------------
    // Validation des champs obligatoires
    // -------------------------------------------------------------------------
    if (!this.hotel.nom_hotel || !this.hotel.ville_hotel || !this.hotel.pays_hotel) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // -------------------------------------------------------------------------
    // Préparation des données avec nettoyage
    // -------------------------------------------------------------------------
    const hotelData = {
      ...this.hotel,
      nbre_etoile_hotel: Number(this.hotel.nbre_etoile_hotel),
      latitude: this.hotel.latitude || null,
      longitude: this.hotel.longitude || null,
      tel_hotel: this.hotel.tel_hotel || null,
      email_hotel: this.hotel.email_hotel || null,
      site_web_hotel: this.hotel.site_web_hotel || null,
      img_hotel: this.hotel.img_hotel || null,
    };

    this.submitting = true;

    if (this.isEditMode && this.hotelId) {
      // ---------------------------------------------------------------------
      // MODE ÉDITION : Update puis sauvegarde des services
      // ---------------------------------------------------------------------
      this.hotelAdminService.update(this.hotelId, hotelData).subscribe({
        next: () => {
          // Sauvegarder aussi les services
          this.saveHotelServices();
        },
        error: (err) => {
          console.error('❌ Erreur:', err);
          alert('Erreur lors de la modification');
          this.submitting = false;
          this.cdr.markForCheck();
        },
      });
    } else {
      // ---------------------------------------------------------------------
      // MODE CRÉATION : Insert puis redirection
      // ---------------------------------------------------------------------
      this.hotelAdminService.create(hotelData).subscribe({
        next: () => {
          alert('Hôtel créé avec succès');
          this.router.navigate(['/admin/hotels']);
        },
        error: (err) => {
          console.error('❌ Erreur:', err);
          alert('Erreur lors de la création');
          this.submitting = false;
          this.cdr.markForCheck();
        },
      });
    }
  }

  /**
   * Sauvegarde les services de l'hôtel (prix et disponibilité)
   * Appelé après la mise à jour de l'hôtel en mode édition
   */
  saveHotelServices() {
    if (!this.hotelId || this.hotelServices.length === 0) {
      alert('Hôtel modifié avec succès');
      this.router.navigate(['/admin/hotels']);
      return;
    }

    // Préparation des données des services
    const servicesData = this.hotelServices.map((s) => ({
      id_hotel_service: s.id_hotel_service,
      prix_service: parseFloat(s.prix_service) || 0,
      disponible: Number(s.disponible) === 1 ? 1 : 0,
    }));

    console.log('📤 Services à sauvegarder:', servicesData);

    this.hotelAdminService.updateHotelServices(this.hotelId, servicesData).subscribe({
      next: (response) => {
        console.log('✅ Services mis à jour:', response);
        alert('Hôtel et services modifiés avec succès');
        this.router.navigate(['/admin/hotels']);
      },
      error: (err) => {
        console.error('❌ Erreur services:', err);
        alert('Hôtel modifié mais erreur sur les services');
        this.router.navigate(['/admin/hotels']);
      },
    });
  }
}

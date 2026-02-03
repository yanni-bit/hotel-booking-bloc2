/**
 * ============================================================
 * FICHIER     : hotel-reviews.ts
 * COMPOSANT   : HotelReviews
 * DESCRIPTION : Onglet "Avis" de la page de détail d'un hôtel.
 *               Affiche la liste des avis clients avec statistiques
 *               (note moyenne, nombre d'avis) et permet aux utilisateurs
 *               connectés de créer ou modifier leurs propres avis via
 *               un formulaire avec note, type de séjour, pays et commentaire.
 * AUTEUR      : Yannick
 * DATE        : 2025
 * SERVICES    : AvisService (CRUD des avis hôtel)
 *               AuthService (vérification authentification et utilisateur courant)
 *               ActivatedRoute (récupération de l'ID hôtel depuis la route parente)
 *               ChangeDetectorRef (détection manuelle des changements OnPush)
 * FONCTIONNALITÉS :
 *   - Chargement et affichage des avis d'un hôtel
 *   - Calcul de la note moyenne (getter computed)
 *   - Conversion note /10 en étoiles /5
 *   - Formulaire de création d'un nouvel avis
 *   - Modification d'un avis existant (par son auteur uniquement)
 *   - Validation des saisies (longueur commentaire, plage de note)
 *   - Listes de référence : types de voyageur et pays
 * ============================================================
 */

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AvisService } from '../../services/avis';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-hotel-reviews',
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './hotel-reviews.html',
  styleUrl: './hotel-reviews.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelReviews implements OnInit {
  /** Liste des avis de l'hôtel */
  avis: any[] = [];

  /** Indicateur d'état de chargement */
  loading: boolean = true;

  /** Message d'erreur en cas d'échec du chargement */
  error: string = '';

  /** Identifiant de l'hôtel récupéré depuis la route parente */
  hotelId: number = 0;

  /** Affiche/masque le formulaire d'ajout/modification d'avis */
  showForm: boolean = false;

  /** Indicateur d'envoi du formulaire en cours */
  submitting: boolean = false;

  /** Indicateur de succès après soumission */
  submitSuccess: boolean = false;

  /** Message d'erreur lors de la soumission du formulaire */
  submitError: string = '';

  /** Avis en cours d'édition (null = mode création) */
  editingAvis: any = null;

  /** Modèle de données du formulaire nouvel avis / modification */
  newAvis = {
    note: 8,
    titre_avis: '',
    commentaire: '',
    type_voyageur: 'couple',
    pays_origine: 'FR',
  };

  /** Liste de référence des types de voyageurs pour le select */
  typesVoyageur = [
    { value: 'couple', label: 'Couple' },
    { value: 'famille', label: 'Famille' },
    { value: 'solo', label: 'Solo' },
    { value: 'business', label: 'Business' },
    { value: 'groupe', label: 'Groupe' },
    { value: 'autre', label: 'Autre' },
  ];

  /** Liste de référence des pays pour le select */
  pays = [
    { code: 'FR', label: 'France' },
    { code: 'BE', label: 'Belgique' },
    { code: 'CH', label: 'Suisse' },
    { code: 'CA', label: 'Canada' },
    { code: 'UK', label: 'Royaume-Uni' },
    { code: 'US', label: 'États-Unis' },
    { code: 'DE', label: 'Allemagne' },
    { code: 'ES', label: 'Espagne' },
    { code: 'IT', label: 'Italie' },
    { code: 'NL', label: 'Pays-Bas' },
    { code: 'PT', label: 'Portugal' },
    { code: 'AU', label: 'Australie' },
    { code: 'JP', label: 'Japon' },
    { code: 'CN', label: 'Chine' },
    { code: 'BR', label: 'Brésil' },
    { code: 'MX', label: 'Mexique' },
    { code: 'OTHER', label: 'Autre' },
  ];

  constructor(
    private route: ActivatedRoute,
    private avisService: AvisService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * Initialisation du composant
   * Récupère l'ID hôtel depuis la route parente et charge les avis
   */
  ngOnInit() {
    this.hotelId = +this.route.parent?.snapshot.params['hotelId'];

    if (this.hotelId) {
      this.loadAvis();
    }
  }

  /**
   * Charge la liste des avis de l'hôtel depuis l'API
   * Utilise markForCheck() pour la stratégie OnPush
   */
  loadAvis() {
    this.loading = true;

    this.avisService.getAvisByHotelId(this.hotelId).subscribe({
      next: (response: any) => {
        console.log('💬 Avis:', response);
        this.avis = response.data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('❌ Erreur avis:', err);
        this.error = 'Erreur lors du chargement des avis';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Getter calculé : note moyenne des avis sur 10
   * @returns Note moyenne formatée avec 1 décimale (ex: "7.5")
   */
  get noteMoyenne(): string {
    if (this.avis.length === 0) return '0.0';

    const sum = this.avis.reduce((acc, a) => {
      const note = parseFloat(a.note) || 0;
      return acc + note;
    }, 0);

    const moyenne = sum / this.avis.length;
    return moyenne.toFixed(1);
  }

  /**
   * Convertit une note /10 en tableau de 5 étoiles (booléens)
   * @param note - Note sur 10
   * @returns Tableau de 5 booléens (true = étoile pleine)
   */
  getStarsArray(note: number): boolean[] {
    const stars = Math.round(note / 2);
    return Array(5)
      .fill(false)
      .map((_, i) => i < stars);
  }

  /**
   * Affiche/masque le formulaire de création d'avis
   * Réinitialise le mode édition et le formulaire
   */
  toggleForm() {
    this.showForm = !this.showForm;
    this.editingAvis = null;
    this.submitSuccess = false;
    this.submitError = '';
    this.resetForm();
  }

  /**
   * Active le mode édition pour un avis existant
   * Pré-remplit le formulaire avec les données de l'avis
   * @param review - Objet avis à modifier
   */
  editAvis(review: any) {
    this.editingAvis = review;
    this.showForm = true;
    this.submitSuccess = false;
    this.submitError = '';

    // Pré-remplir le formulaire
    this.newAvis = {
      note: parseFloat(review.note) || 8,
      titre_avis: review.titre_avis || '',
      commentaire: review.commentaire || '',
      type_voyageur: review.type_voyageur || 'couple',
      pays_origine: review.pays_origine || 'FR',
    };

    this.cdr.markForCheck();
  }

  /**
   * Vérifie si l'utilisateur connecté est l'auteur de l'avis
   * @param review - Objet avis à vérifier
   * @returns true si l'utilisateur courant est le créateur de l'avis
   */
  canEditAvis(review: any): boolean {
    const user = this.authService.currentUser();
    return user && review.id_user === user.id_user;
  }

  /**
   * Soumet le formulaire d'avis (création ou modification)
   * Valide les données (commentaire ≥ 10 chars, note 1-10, utilisateur connecté)
   * puis appelle createAvis() ou updateAvis() selon le mode
   * Recharge la liste des avis après succès
   */
  submitAvis() {
    // Validation
    if (!this.newAvis.commentaire || this.newAvis.commentaire.trim().length < 10) {
      this.submitError = 'Le commentaire doit contenir au moins 10 caractères';
      this.cdr.markForCheck();
      return;
    }

    if (this.newAvis.note < 1 || this.newAvis.note > 10) {
      this.submitError = 'La note doit être comprise entre 1 et 10';
      this.cdr.markForCheck();
      return;
    }

    const user = this.authService.currentUser();
    if (!user) {
      this.submitError = 'Vous devez être connecté pour laisser un avis';
      this.cdr.markForCheck();
      return;
    }

    this.submitting = true;
    this.submitError = '';

    if (this.editingAvis) {
      // Mode modification
      const updateData = {
        id_user: user.id_user,
        note: this.newAvis.note,
        titre_avis: this.newAvis.titre_avis || undefined,
        commentaire: this.newAvis.commentaire.trim(),
        type_voyageur: this.newAvis.type_voyageur,
        pays_origine: this.newAvis.pays_origine,
      };

      this.avisService.updateAvis(this.editingAvis.id_avis, updateData).subscribe({
        next: (response: any) => {
          console.log('✅ Avis modifié:', response);
          this.submitting = false;
          this.submitSuccess = true;
          this.showForm = false;
          this.editingAvis = null;
          this.resetForm();
          this.loadAvis();
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('❌ Erreur modification avis:', err);
          this.submitting = false;
          this.submitError = err.error?.message || "Erreur lors de la modification de l'avis";
          this.cdr.markForCheck();
        },
      });
    } else {
      // Mode création
      const avisData = {
        id_hotel: this.hotelId,
        id_user: user.id_user,
        pseudo_user: `${user.prenom} ${user.nom.charAt(0)}.`,
        note: this.newAvis.note,
        titre_avis: this.newAvis.titre_avis || undefined,
        commentaire: this.newAvis.commentaire.trim(),
        type_voyageur: this.newAvis.type_voyageur,
        pays_origine: this.newAvis.pays_origine,
        langue: 'fr',
      };

      this.avisService.createAvis(avisData).subscribe({
        next: (response: any) => {
          console.log('✅ Avis créé:', response);
          this.submitting = false;
          this.submitSuccess = true;
          this.showForm = false;
          this.resetForm();
          this.loadAvis();
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('❌ Erreur création avis:', err);
          this.submitting = false;
          this.submitError = err.error?.message || "Erreur lors de l'envoi de l'avis";
          this.cdr.markForCheck();
        },
      });
    }
  }

  /**
   * Annule le formulaire et réinitialise le mode édition
   */
  cancelForm() {
    this.showForm = false;
    this.editingAvis = null;
    this.submitError = '';
    this.resetForm();
  }

  /**
   * Réinitialise le modèle du formulaire aux valeurs par défaut
   */
  resetForm() {
    this.newAvis = {
      note: 8,
      titre_avis: '',
      commentaire: '',
      type_voyageur: 'couple',
      pays_origine: 'FR',
    };
  }

  /**
   * Retourne le libellé d'un pays à partir de son code ISO
   * @param code - Code pays (ex: "FR", "US")
   * @returns Libellé du pays ou le code si non trouvé
   */
  getPaysLabel(code: string): string {
    const found = this.pays.find((p) => p.code === code);
    return found ? found.label : code;
  }
}

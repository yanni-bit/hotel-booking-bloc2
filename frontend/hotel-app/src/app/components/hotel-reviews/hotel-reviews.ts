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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HotelReviews implements OnInit {
  
  avis: any[] = [];
  loading: boolean = true;
  error: string = '';
  hotelId: number = 0;
  
  // Formulaire nouvel avis
  showForm: boolean = false;
  submitting: boolean = false;
  submitSuccess: boolean = false;
  submitError: string = '';
  
  // Mode édition
  editingAvis: any = null;
  
  newAvis = {
    note: 8,
    titre_avis: '',
    commentaire: '',
    type_voyageur: 'couple',
    pays_origine: 'FR'
  };
  
  // Types de voyageurs
  typesVoyageur = [
    { value: 'couple', label: 'Couple' },
    { value: 'famille', label: 'Famille' },
    { value: 'solo', label: 'Solo' },
    { value: 'business', label: 'Business' },
    { value: 'groupe', label: 'Groupe' },
    { value: 'autre', label: 'Autre' }
  ];
  
  // Liste des pays
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
    { code: 'OTHER', label: 'Autre' }
  ];
  
  constructor(
    private route: ActivatedRoute,
    private avisService: AvisService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    this.hotelId = +this.route.parent?.snapshot.params['hotelId'];
    
    if (this.hotelId) {
      this.loadAvis();
    }
  }
  
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
      }
    });
  }
  
  // Calculer la note moyenne
  get noteMoyenne(): string {
    if (this.avis.length === 0) return '0.0';
    
    const sum = this.avis.reduce((acc, a) => {
      const note = parseFloat(a.note) || 0;
      return acc + note;
    }, 0);
    
    const moyenne = sum / this.avis.length;
    return moyenne.toFixed(1);
  }
  
  // Créer un tableau pour afficher les étoiles (5 étoiles max)
  getStarsArray(note: number): boolean[] {
    const stars = Math.round(note / 2);
    return Array(5).fill(false).map((_, i) => i < stars);
  }
  
  // Toggle formulaire création
  toggleForm() {
    this.showForm = !this.showForm;
    this.editingAvis = null;
    this.submitSuccess = false;
    this.submitError = '';
    this.resetForm();
  }
  
  // Éditer un avis existant
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
      pays_origine: review.pays_origine || 'FR'
    };
    
    this.cdr.markForCheck();
  }
  
  // Vérifier si l'utilisateur peut modifier cet avis
  canEditAvis(review: any): boolean {
    const user = this.authService.currentUser();
    return user && review.id_user === user.id_user;
  }
  
  // Soumettre l'avis (création ou modification)
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
        pays_origine: this.newAvis.pays_origine
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
          this.submitError = err.error?.message || 'Erreur lors de la modification de l\'avis';
          this.cdr.markForCheck();
        }
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
        langue: 'fr'
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
          this.submitError = err.error?.message || 'Erreur lors de l\'envoi de l\'avis';
          this.cdr.markForCheck();
        }
      });
    }
  }
  
  // Annuler le formulaire
  cancelForm() {
    this.showForm = false;
    this.editingAvis = null;
    this.submitError = '';
    this.resetForm();
  }
  
  // Réinitialiser le formulaire
  resetForm() {
    this.newAvis = {
      note: 8,
      titre_avis: '',
      commentaire: '',
      type_voyageur: 'couple',
      pays_origine: 'FR'
    };
  }
  
  // Obtenir le label du pays
  getPaysLabel(code: string): string {
    const found = this.pays.find(p => p.code === code);
    return found ? found.label : code;
  }
}
/**
 * ============================================================
 * FICHIER     : profil.ts
 * COMPOSANT   : Profil
 * DESCRIPTION : Page de profil utilisateur. Affiche les informations
 *               personnelles en mode lecture avec possibilité de
 *               basculer en mode édition pour modifier prénom, nom
 *               et téléphone. Inclut également un formulaire de
 *               changement de mot de passe avec toggle de visibilité
 *               sur chaque champ.
 * AUTEUR      : Yannick
 * DATE        : 2025
 * SERVICES    : AuthService (données utilisateur, mise à jour profil,
 *               changement mot de passe)
 *               ChangeDetectorRef (détection manuelle OnPush)
 * FONCTIONNALITÉS :
 *   - Affichage des infos utilisateur (lecture seule)
 *   - Mode édition : modification prénom, nom, téléphone
 *   - Email affiché mais non modifiable (disabled)
 *   - Changement de mot de passe (ancien + nouveau + confirmation)
 *   - Toggle visibilité mot de passe (œil) sur 3 champs
 *   - Validation : champs obligatoires, min 6 chars, correspondance
 * ============================================================
 */

import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profil',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './profil.html',
  styleUrl: './profil.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profil {
  /** Bascule entre mode lecture et mode édition */
  editMode: boolean = false;

  /** Données du formulaire de profil (prénom, nom, téléphone) */
  profileForm = {
    prenom: '',
    nom: '',
    telephone: '',
  };

  /** Données du formulaire de changement de mot de passe */
  passwordForm = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  /** Affichage/masquage du formulaire de mot de passe */
  showPasswordForm: boolean = false;

  /** Indicateur de soumission en cours (profil ou mot de passe) */
  submitting: boolean = false;

  // === États de visibilité des champs mot de passe ===

  /** Toggle visibilité de l'ancien mot de passe */
  showOldPassword: boolean = false;

  /** Toggle visibilité du nouveau mot de passe */
  showNewPassword: boolean = false;

  /** Toggle visibilité de la confirmation mot de passe */
  showConfirmPassword: boolean = false;

  constructor(
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {
    this.loadUserData();
  }

  /**
   * Charge les données de l'utilisateur connecté dans le formulaire
   * Récupère prénom, nom et téléphone depuis AuthService.currentUser()
   */
  loadUserData() {
    const user = this.authService.currentUser();
    if (user) {
      this.profileForm = {
        prenom: user.prenom || '',
        nom: user.nom || '',
        telephone: user.telephone || '',
      };
    }
  }

  /**
   * Bascule le mode édition du profil
   * Si on quitte le mode édition (annulation), recharge les données originales
   */
  toggleEditMode() {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.loadUserData(); // Reset si on annule
    }
    this.cdr.markForCheck();
  }

  /**
   * Sauvegarde les modifications du profil via AuthService.updateProfile()
   * Valide que prénom et nom sont renseignés avant soumission
   */
  saveProfile() {
    if (!this.profileForm.prenom || !this.profileForm.nom) {
      alert('Le prénom et le nom sont obligatoires');
      return;
    }

    this.submitting = true;

    this.authService.updateProfile(this.profileForm).subscribe({
      next: () => {
        alert('Profil mis à jour avec succès');
        this.editMode = false;
        this.submitting = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        alert('Erreur lors de la mise à jour du profil');
        this.submitting = false;
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Affiche/masque le formulaire de changement de mot de passe
   * Réinitialise les champs quand on ferme le formulaire
   */
  togglePasswordForm() {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.passwordForm = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      };
    }
    this.cdr.markForCheck();
  }

  /**
   * Soumet le changement de mot de passe via AuthService.changePassword()
   * Validations : champs requis, min 6 caractères, correspondance
   * nouveau mot de passe / confirmation
   */
  changePassword() {
    if (
      !this.passwordForm.oldPassword ||
      !this.passwordForm.newPassword ||
      !this.passwordForm.confirmPassword
    ) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      alert('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    this.submitting = true;

    this.authService
      .changePassword(this.passwordForm.oldPassword, this.passwordForm.newPassword)
      .subscribe({
        next: () => {
          alert('Mot de passe modifié avec succès');
          this.showPasswordForm = false;
          this.passwordForm = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
          };
          this.submitting = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('❌ Erreur:', err);
          alert(err.error?.message || 'Erreur lors du changement de mot de passe');
          this.submitting = false;
          this.cdr.markForCheck();
        },
      });
  }

  /** Toggle visibilité : ancien mot de passe */
  toggleOldPassword() {
    this.showOldPassword = !this.showOldPassword;
    this.cdr.markForCheck();
  }

  /** Toggle visibilité : nouveau mot de passe */
  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
    this.cdr.markForCheck();
  }

  /** Toggle visibilité : confirmation mot de passe */
  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
    this.cdr.markForCheck();
  }
}

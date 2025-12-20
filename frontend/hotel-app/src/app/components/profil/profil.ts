import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profil',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profil.html',
  styleUrl: './profil.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Profil {

  // Mode édition
  editMode: boolean = false;

  // Formulaire profil
  profileForm = {
    prenom: '',
    nom: '',
    telephone: ''
  };

  // Formulaire mot de passe
  passwordForm = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  showPasswordForm: boolean = false;
  submitting: boolean = false;

  // États visibilité mot de passe
  showOldPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.loadUserData();
  }

  loadUserData() {
    const user = this.authService.currentUser();
    if (user) {
      this.profileForm = {
        prenom: user.prenom || '',
        nom: user.nom || '',
        telephone: user.telephone || ''
      };
    }
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.loadUserData(); // Reset si on annule
    }
    this.cdr.markForCheck();
  }

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
      }
    });
  }

  togglePasswordForm() {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.passwordForm = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    }
    this.cdr.markForCheck();
  }

  changePassword() {
    // Validation
    if (!this.passwordForm.oldPassword || !this.passwordForm.newPassword || !this.passwordForm.confirmPassword) {
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

    this.authService.changePassword(this.passwordForm.oldPassword, this.passwordForm.newPassword).subscribe({
      next: () => {
        alert('Mot de passe modifié avec succès');
        this.showPasswordForm = false;
        this.passwordForm = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.submitting = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        alert(err.error?.message || 'Erreur lors du changement de mot de passe');
        this.submitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  toggleOldPassword() {
    this.showOldPassword = !this.showOldPassword;
    this.cdr.markForCheck();
  }

  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
    this.cdr.markForCheck();
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
    this.cdr.markForCheck();
  }
}
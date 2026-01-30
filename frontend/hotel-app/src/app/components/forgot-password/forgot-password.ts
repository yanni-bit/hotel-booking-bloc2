// ============================================================================
// FICHIER : forgot-password.component.ts
// DESCRIPTION : Composant de demande de réinitialisation de mot de passe
//               Formulaire email avec envoi de lien de récupération
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// SERVICES INJECTÉS :
//   - AuthService : Envoi de la demande de réinitialisation
// FONCTIONNALITÉS :
//   - Formulaire avec saisie de l'email
//   - Validation du format email (Critère C2.b)
//   - Appel API pour envoyer le lien de récupération
//   - Affichage des messages de succès/erreur
// OPTIMISATION :
//   - ChangeDetectionStrategy.OnPush pour améliorer les performances
// ============================================================================

import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPassword {
  // ==========================================================================
  // PROPRIÉTÉS - FORMULAIRE
  // ==========================================================================

  /** Adresse email saisie par l'utilisateur */
  email: string = '';

  // ==========================================================================
  // PROPRIÉTÉS - ÉTATS
  // ==========================================================================

  /** Indicateur de chargement (pendant l'envoi) */
  loading: boolean = false;

  /** Message de succès affiché après envoi réussi */
  successMessage: string = '';

  /** Message d'erreur en cas de problème */
  errorMessage: string = '';

  // ==========================================================================
  // CONSTRUCTEUR
  // ==========================================================================

  /**
   * Injection des dépendances
   * @param {AuthService} authService - Service d'authentification
   * @param {ChangeDetectorRef} cdr - Référence pour déclencher la détection (OnPush)
   */
  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  // ==========================================================================
  // MÉTHODES - SOUMISSION DU FORMULAIRE
  // ==========================================================================

  /**
   * Soumet la demande de réinitialisation de mot de passe
   *
   * Processus :
   * 1. Validation de la présence de l'email
   * 2. Validation du format email (regex) - Critère C2.b
   * 3. Appel API AuthService.forgotPassword()
   * 4. Affichage du message de succès ou d'erreur
   */
  onSubmit() {
    // -------------------------------------------------------------------------
    // Validation : email requis
    // -------------------------------------------------------------------------
    if (!this.email) {
      this.errorMessage = 'Veuillez entrer votre adresse email';
      this.cdr.markForCheck();
      return;
    }

    // -------------------------------------------------------------------------
    // Validation : format email (Critère C2.b - expressions régulières)
    // -------------------------------------------------------------------------
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Veuillez entrer une adresse email valide';
      this.cdr.markForCheck();
      return;
    }

    // -------------------------------------------------------------------------
    // Initialisation de l'état de chargement
    // -------------------------------------------------------------------------
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // -------------------------------------------------------------------------
    // Appel API pour envoyer le lien de récupération
    // -------------------------------------------------------------------------
    this.authService.forgotPassword(this.email).subscribe({
      // Succès : afficher le message et vider le champ
      next: (response) => {
        console.log('✅ Demande envoyée:', response);
        this.loading = false;
        this.successMessage = response.message;
        this.email = ''; // Vider le champ
        this.cdr.markForCheck();
      },
      // Erreur : afficher le message d'erreur
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.loading = false;
        this.errorMessage = err.error?.message || 'Une erreur est survenue';
        this.cdr.markForCheck();
      },
    });
  }
}
